import { BotSpec, WheelSpec } from "../../bots/specs"
import {
    BrushSpec,
    EntityShapeSpec,
    defaultBoxShape,
    defaultColorBrush,
    defaultEntityShape,
    defaultShapePhysics,
} from "../specs"
import { PHYSICS_SCALE } from "../constants"
import { Bot } from "."
import { Vec2, Vec2Like } from "../../types/vec2"
import Planck from "planck-js"

const wheelBrush: BrushSpec = {
    // TODO: Make this an animated texture or pattern
    ...defaultColorBrush(),
    fillColor: "#212738",
    borderColor: "black",
    borderWidth: 0.2,
    zIndex: 1,
}

export class Wheel {
    public static makeShapeSpecs(botSpec: BotSpec): EntityShapeSpec[] {
        const specs: EntityShapeSpec[] = []
        for (const wheelSpec of botSpec.wheels) {
            specs.push(Wheel.makeShapeSpec(wheelSpec))
        }
        return specs
    }

    public static makeShapeSpec(spec: WheelSpec): EntityShapeSpec {
        return {
            ...defaultEntityShape(),
            ...defaultBoxShape(),
            label: spec.name,
            roles: ["mouse-target", "robot"],
            offset: spec.pos,
            size: { x: spec.width, y: spec.radius * 2 },
            brush: {
                ...wheelBrush,
                zIndex: 6,
            },
            physics: {
                ...defaultShapePhysics(),
                friction: 0.3,
                restitution: 0.9,
                density: 10,
            },
        }
    }

    private maxSpeed: number
    private currSpeed: number
    private localPos: Vec2Like
    private friction?: Planck.FrictionJoint

    constructor(
        private bot: Bot,
        private spec: WheelSpec
    ) {
        this.localPos = Vec2.scale(this.spec.pos, PHYSICS_SCALE)
        this.maxSpeed = spec.maxSpeed
        this.currSpeed = 0
        // Handles some of the friction between wheel and ground. Additional
        // friction is handled in updateFriction(), below.
        this.friction = this.bot.entity.physicsObj.addFrictionJoint(
            Vec2.scale(this.spec.pos, PHYSICS_SCALE)
        )
        // hand-tuned values
        this.friction?.m_bodyB.setAngularDamping(10)
        this.friction?.m_bodyB.setLinearDamping(10)
        this.friction?.setMaxForce(5000)
        this.friction?.setMaxTorque(2)
    }

    public destroy() {}

    public update(dtSecs: number) {
        // If bot is held or paused, don't apply movement forces
        if (this.bot.held || this.bot.paused) return
        this.updateFriction(dtSecs)
        this.updateForce(dtSecs)
    }

    public setSpeed(speed: number) {
        speed = Math.min(Math.abs(speed / 100), 1) * Math.sign(speed)
        this.currSpeed = this.maxSpeed * speed
    }

    public updateFriction(dtSecs: number) {
        const worldPos = this.bot.entity.physicsObj.getWorldPoint(this.localPos)

        // Debug flags. These should be commented out in production
        //const dampenAngularVelocity = true
        //const dampenLateralVelocity = true

        // Tweak this value to adjust top spin rate
        const maxAngularVelocity = 10 // The maximum angular velocity (hand-tuned)

        //// Dampen angular velocity
        //if (dampenAngularVelocity)
        {
            const angularDamping = 1 // The amount of angular velocity dampening to apply
            const angularDampingScalar = 1 // hand-tuned
            this.bot.entity.physicsObj.applyAngularForce(
                -this.bot.entity.physicsObj.getAngularVelocity() *
                    angularDamping *
                    angularDampingScalar *
                    this.bot.entity.physicsObj.body.getInertia()
            )
            const angularVel = this.bot.entity.physicsObj.getAngularVelocity()
            if (Math.abs(angularVel) > maxAngularVelocity) {
                this.bot.entity.physicsObj.setAngularVelocity(
                    maxAngularVelocity * Math.sign(angularVel)
                )
            }
        }

        //// Dampen lateral velocity
        //if (dampenLateralVelocity)
        {
            const lateralDamping = 1 // The amount of lateral velocity dampening to apply
            const lateralDampingScalar = 2 // hand-tuned
            const lateralVel =
                this.bot.entity.physicsObj.getLateralVelocity(worldPos)
            this.bot.entity.physicsObj.applyForce(
                Vec2.scale(
                    Vec2.neg(lateralVel),
                    lateralDamping *
                        lateralDampingScalar *
                        this.bot.entity.physicsObj.body.getMass()
                ),
                worldPos
            )
        }
    }

    public updateForce(dtSecs: number) {
        const worldPos = this.bot.entity.physicsObj.getWorldPoint(this.localPos)
        const forwardDir = this.bot.forward

        // Tweak this value to adjust top speed
        const speedMagScalar = 4.5 // hand-tuned
        const forceMag =
            this.currSpeed *
            speedMagScalar *
            this.bot.entity.physicsObj.body.getMass()

        // Apply forward force
        const force = Vec2.scale(forwardDir, forceMag)
        this.bot.entity.physicsObj.applyForce(force, worldPos)
    }
}
