import { LineSensorValues, Simulation } from ".."
import {
    BotSpec,
    LEDSlotName,
    LineSensorSlotName,
    WheelSlotName,
} from "../../bots/specs"
import { Chassis } from "./chassis"
import { Wheel } from "./wheel"
import { RangeSensor } from "./rangeSensor"
import { LineSensor } from "./lineSensor"
import { LED } from "./led"
import { makeBallastSpec } from "./ballast"
import {
    EntityShapeSpec,
    EntitySpec,
    defaultDynamicPhysics,
    defaultEntity,
} from "../specs"
import { Entity } from "../entity"
import { Vec2Like } from "../../types/vec2"
import { SpawnSpec } from "../../maps/specs"

/**
 * The Bot class is a controller for a robot in the simulation. It contains
 * references to the Entity objects that make up the robot, and provides
 * methods for controlling the robot's motors and reading its sensors.
 */
export class Bot {
    public entity: Entity
    public chassis: Chassis
    public wheels = new Map<WheelSlotName, Wheel>()
    public rangeSensor?: RangeSensor
    public lineSensors = new Map<LineSensorSlotName, LineSensor>()
    public leds = new Map<LEDSlotName, LED>()
    public paused = false

    public get pos(): Vec2Like {
        return this.entity.physicsObj.pos
    }
    public get angle(): number {
        return this.entity.physicsObj.angle
    }
    public get forward(): Vec2Like {
        return this.entity.physicsObj.forward
    }
    public get held(): boolean {
        const heldBody = this.entity.sim.physics.mouseJoint?.getBodyB()
        return heldBody === this.entity.physicsObj.body
    }

    constructor(
        public sim: Simulation,
        spawn: SpawnSpec,
        public spec: BotSpec
    ) {
        const chassisShape = Chassis.makeShapeSpec(spec)
        const wheelShapes = Wheel.makeShapeSpecs(spec)
        const ballastShape = makeBallastSpec(spec)

        spec.lineSensors?.forEach((sensorSpec) => {
            const sensor = new LineSensor(this, sensorSpec)
            this.lineSensors.set(sensorSpec.name, sensor)
        })
        const lineSensorShapes = Array.from(this.lineSensors.values()).map(
            (sensor) => sensor.shapeSpecs
        )
        if (spec.rangeSensor)
            this.rangeSensor = new RangeSensor(this, spec.rangeSensor)
        const rangeSensorShapes = this.rangeSensor?.shapeSpecs ?? []
        const ledShapes =
            spec.leds?.map((ledSpec) => LED.makeShapeSpec(spec, ledSpec)) ?? []

        const shapes: EntityShapeSpec[] = [
            chassisShape,
            ...wheelShapes,
            ...lineSensorShapes.flat(),
            //...ledShapes,
            ...rangeSensorShapes,
        ]
        if (ballastShape) shapes.push(ballastShape)

        const entitySpec: EntitySpec = {
            ...defaultEntity(),
            pos: { ...spawn.pos },
            angle: spawn.angle,
            physics: {
                ...defaultDynamicPhysics(),
                // hand-tuned values
                linearDamping: 10,
                angularDamping: 10,
            },
            shapes,
        }

        this.entity = sim.createEntity(entitySpec)

        this.chassis = new Chassis(this, spec.chassis)
        spec.wheels.forEach((wheelSpec) =>
            this.wheels.set(wheelSpec.name, new Wheel(this, wheelSpec))
        )
        spec.leds?.forEach((ledSpec) =>
            this.leds.set(ledSpec.name, new LED(this, ledSpec))
        )
    }

    public destroy() {
        this.chassis.destroy()
        this.wheels.forEach((wheel) => wheel.destroy())
        this.rangeSensor?.destroy()
        this.lineSensors.forEach((sensor) => sensor.destroy())
        this.leds.forEach((led) => led.destroy())
    }

    public update(dtSecs: number) {
        this.chassis.update(dtSecs)
        this.wheels.forEach((wheel) => wheel.update(dtSecs))
        this.rangeSensor?.update(dtSecs)
        this.lineSensors.forEach((sensor) => sensor.update(dtSecs))
        this.leds.forEach((led) => led.update(dtSecs))
    }

    private setWheelSpeed(name: WheelSlotName, speed: number) {
        const wheel = this.wheels.get(name)
        if (!wheel) return
        wheel.setSpeed(speed)
    }

    public setMotors(left: number, right: number) {
        if (this.held) return
        this.setWheelSpeed("left", left)
        this.setWheelSpeed("right", right)
    }

    public setColor(name: LEDSlotName, color: number) {
        /*
        const led = this.leds.get(name)
        if (!led) return
        led.setColor(color)
        */
        this.chassis.setColor(color)
    }

    public setLineSensorUsed(used: boolean) {
        this.lineSensors.forEach((sensor) => sensor.setUsed(used))
    }

    public setRangeSensorUsed(used: boolean) {
        this.rangeSensor?.setUsed(used)
    }

    public readLineSensors(): LineSensorValues {
        return {
            ["outer-left"]: this.lineSensors.get("outer-left")?.value ?? -1,
            ["left"]: this.lineSensors.get("left")?.value ?? -1,
            ["middle"]: this.lineSensors.get("middle")?.value ?? -1,
            ["right"]: this.lineSensors.get("right")?.value ?? -1,
            ["outer-right"]: this.lineSensors.get("outer-right")?.value ?? -1,
        }
    }

    public readRangeSensor(): number {
        return this.rangeSensor?.value ?? -1
    }
}
