import { LineSensorValues, Simulation, defaultLineSensorValues } from ".."
import { BotSpec } from "../../bots/specs"
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
} from "../../maps/specs"
import { Entity } from "../entity"
import { Vec2Like } from "../../types/vec2"

// Debug flag for keyboard control. When true, the bot will not be controlled by
// the simulator, only by the keyboard and gamepad. Can be useful to tune a bot's
// movement characteristics. See the Simulation class for keybindings.
const KEYBOARD_CONTROL_ENABLED = false

/**
 * The Bot class is a controller for a robot in the simulation. It contains
 * references to the Entity objects that make up the robot, and provides
 * methods for controlling the robot's motors and reading its sensors.
 */
export class Bot {
    public entity: Entity
    public chassis: Chassis
    public wheels = new Map<string, Wheel>()
    public rangeSensor?: RangeSensor
    public lineSensors = new Map<string, LineSensor>()
    public leds = new Map<string, LED>()

    public get forward(): Vec2Like {
        return this.entity.physicsObj.forward
    }
    public get held(): boolean {
        const heldBody = this.entity.sim.physics.mouseJoint?.getBodyB()
        return heldBody === this.entity.physicsObj.body
    }

    constructor(
        public sim: Simulation,
        private botSpec: BotSpec
    ) {
        const chassisShape = Chassis.makeShapeSpec(botSpec)
        const wheelShapes = Wheel.makeShapeSpecs(botSpec)
        const ballastShape = makeBallastSpec(botSpec)

        botSpec.lineSensors?.forEach((sensorSpec) => {
            const sensor = new LineSensor(this, sensorSpec)
            this.lineSensors.set(sensorSpec.name, sensor)
        })
        const lineSensorShapes = Array.from(this.lineSensors.values()).map(
            (sensor) => sensor.shapeSpecs
        )

        const shapes: EntityShapeSpec[] = [
            chassisShape,
            ...wheelShapes,
            ...lineSensorShapes.flat(),
        ]
        if (ballastShape) shapes.push(ballastShape)

        const entitySpec: EntitySpec = {
            ...defaultEntity(),
            pos: { ...this.sim.spawn.pos },
            angle: this.sim.spawn.angle,
            physics: {
                ...defaultDynamicPhysics(),
                // hand-tuned values
                linearDamping: 10,
                angularDamping: 10,
            },
            shapes,
        }

        this.entity = sim.createEntity(entitySpec)

        this.chassis = new Chassis(this, botSpec.chassis)
        botSpec.wheels.forEach((wheelSpec) =>
            this.wheels.set(wheelSpec.name, new Wheel(this, wheelSpec))
        )
        if (botSpec.rangeSensor)
            this.rangeSensor = new RangeSensor(this, botSpec.rangeSensor)

        botSpec.leds?.forEach((led) =>
            this.leds.set(led.name, new LED(this, led))
        )
    }

    public destroy() {
        this.chassis.destroy()
        this.wheels.forEach((wheel) => wheel.destroy())
        this.rangeSensor?.destroy()
        this.lineSensors.forEach((sensor) => sensor.destroy())
        this.leds.forEach((led) => led.destroy())
    }

    public beforePhysicsStep(dtSecs: number) {
        this.chassis.beforePhysicsStep(dtSecs)
        this.wheels.forEach((wheel) => wheel.beforePhysicsStep(dtSecs))
        this.rangeSensor?.beforePhysicsStep(dtSecs)
        this.lineSensors.forEach((sensor) => sensor.beforePhysicsStep(dtSecs))
        this.leds.forEach((led) => led.beforePhysicsStep(dtSecs))
    }

    public update(dtSecs: number) {
        if (KEYBOARD_CONTROL_ENABLED) this.handleInput()
        this.chassis.update(dtSecs)
        this.wheels.forEach((wheel) => wheel.update(dtSecs))
        this.rangeSensor?.update(dtSecs)
        this.lineSensors.forEach((sensor) => sensor.update(dtSecs))
        this.leds.forEach((led) => led.update(dtSecs))
    }

    private handleInput() {
        const { input } = this.sim

        // Hack: use first wheel's speed settings for all wheels
        const maxSpeed = 100
        let leftSpeed = 0
        let rightSpeed = 0

        // Control left motor with W/S keys
        if (input.isDown("KeyW")) {
            leftSpeed += maxSpeed
        }
        if (input.isDown("KeyS")) {
            leftSpeed -= maxSpeed
        }

        // Control right motor with I/K keys
        if (input.isDown("KeyI")) {
            rightSpeed += maxSpeed
        }
        if (input.isDown("KeyK")) {
            rightSpeed -= maxSpeed
        }

        // Control both motors with arrow keys
        if (input.isDown("ArrowUp")) {
            leftSpeed += maxSpeed
            rightSpeed += maxSpeed
        }
        if (input.isDown("ArrowDown")) {
            leftSpeed -= maxSpeed
            rightSpeed -= maxSpeed
        }
        if (input.isDown("ArrowLeft")) {
            if (!rightSpeed) rightSpeed = maxSpeed
            leftSpeed = leftSpeed / 2
        }
        if (input.isDown("ArrowRight")) {
            if (!leftSpeed) leftSpeed = maxSpeed
            rightSpeed = rightSpeed / 2
        }

        // Control both motors with gamepad stick Y axes
        const leftStickY = input.value("GamepadAxisLeftStickY")
        const rightStickY = input.value("GamepadAxisRightStickY")

        if (leftStickY) {
            leftSpeed += -leftStickY * maxSpeed
        }
        if (rightStickY) {
            rightSpeed += -rightStickY * maxSpeed
        }

        leftSpeed = Math.max(-maxSpeed, Math.min(maxSpeed, leftSpeed))
        rightSpeed = Math.max(-maxSpeed, Math.min(maxSpeed, rightSpeed))

        this.setWheelSpeed("left", leftSpeed)
        this.setWheelSpeed("right", rightSpeed)
    }

    private setWheelSpeed(label: string, speed: number) {
        const wheel = this.wheels.get(label)
        if (!wheel) return
        wheel.setSpeed(speed)
    }

    public setMotors(left: number, right: number) {
        if (KEYBOARD_CONTROL_ENABLED) return
        this.setWheelSpeed("left", left)
        this.setWheelSpeed("right", right)
    }

    public readLineSensors(): LineSensorValues {
        if (this.held) return defaultLineSensorValues()
        return {
            ["outer-left"]: this.lineSensors.get("outer-left")?.value ?? -1,
            ["left"]: this.lineSensors.get("left")?.value ?? -1,
            ["middle"]: this.lineSensors.get("middle")?.value ?? -1,
            ["right"]: this.lineSensors.get("right")?.value ?? -1,
            ["outer-right"]: this.lineSensors.get("outer-right")?.value ?? -1,
        }
    }

    public readRangeSensor(): number {
        // TODO
        return -1
    }
}
