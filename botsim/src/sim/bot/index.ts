import { Simulation } from ".."
import { BotSpec } from "../../bots/specs"
import { Chassis } from "./chassis"
import { Wheel } from "./wheel"
import { RangeSensor } from "./rangeSensor"
import { LineSensor } from "./lineSensor"
import { LED } from "./led"
import { makeBallastSpec } from "./ballast"
import {
    EntitySpec,
    defaultDynamicPhysics,
    defaultEntity,
} from "../../maps/specs"
import { Entity } from "../entity"
import { Vec2Like } from "../../types/vec2"

const KEYBOARD_CONTROL_ENABLED = true

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

    constructor(
        public sim: Simulation,
        private botSpec: BotSpec
    ) {
        const chassisShape = Chassis.makeShapeSpec(botSpec)
        const ballastShape = makeBallastSpec(botSpec)

        const entitySpec: EntitySpec = {
            ...defaultEntity(),
            pos: { ...this.sim.spawn.pos },
            angle: this.sim.spawn.angle,
            physics: {
                ...defaultDynamicPhysics(),
            },
            shapes: [chassisShape, ballastShape],
        }

        this.entity = sim.createEntity(entitySpec)
        this.chassis = new Chassis(this, botSpec.chassis)
        botSpec.wheels.forEach((wheel) =>
            this.wheels.set(wheel.label, new Wheel(this, wheel))
        )
        if (botSpec.rangeSensor)
            this.rangeSensor = new RangeSensor(this, botSpec.rangeSensor)
        botSpec.lineSensors?.forEach((sensor) =>
            this.lineSensors.set(sensor.label, new LineSensor(this, sensor))
        )
        botSpec.leds?.forEach((led) =>
            this.leds.set(led.label, new LED(this, led))
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

        const maxSpeed = this.botSpec.wheels[0]?.maxSpeed ?? 100
        const minSpeed = this.botSpec.wheels[0]?.minSpeed ?? -100
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

        this.setWheelSpeed(
            "left",
            Math.max(minSpeed, Math.min(maxSpeed, leftSpeed))
        )
        this.setWheelSpeed(
            "right",
            Math.max(minSpeed, Math.min(maxSpeed, rightSpeed))
        )
    }

    public setWheelSpeed(label: string, speed: number) {
        const wheel = this.wheels.get(label)
        if (!wheel) return
        wheel.setSpeed(speed)
    }
}
