import { BotSpec, WheelSpec } from "../../bots/specs"
import {
    EntityShapeSpec,
    defaultBoxShape,
    defaultEntityShape,
    defaultShapePhysics,
} from "../../maps/specs"
import { PHYSICS_SCALE, PHYS_CAT_ROBOT, PIXELS_PER_CM } from "../constants"
import { makeCategoryBits, makeMaskBits, toPhysicsScale } from "../util"
import { Bot } from "."
import { Vec2 } from "../../types/vec2"
import Planck from "planck-js"

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
            label: spec.label,
            roles: ["mouse-target"],
            offset: spec.pos,
            size: { x: spec.width, y: spec.radius * 2 },
            brush: {
                ...spec.brush,
                zIndex: 1,
            },
            physics: {
                ...defaultShapePhysics(),
                friction: 0.3,
                restitution: 0.9,
                density: 10,
                categoryBits: makeCategoryBits(PHYS_CAT_ROBOT),
                maskBits: makeMaskBits(PHYS_CAT_ROBOT),
            },
        }
    }

    private maxSpeed: number
    private currSpeed: number
    private localPos: Vec2
    private friction?: Planck.FrictionJoint

    constructor(
        private bot: Bot,
        private spec: WheelSpec
    ) {
        this.localPos = Vec2.scale(this.spec.pos, PIXELS_PER_CM)
        this.maxSpeed = spec.maxSpeed
        this.currSpeed = 0
    }

    public destroy() {}

    public beforePhysicsStep(dtSecs: number) {
        if (this.bot.held) return
        this.updateFriction(dtSecs)
    }

    public update(dtSecs: number) {
        if (this.bot.held) {
            if (this.friction) {
                this.bot.entity.sim.physics.world.destroyJoint(this.friction)
                this.friction = undefined
            }
        } else {
            if (!this.friction) {
                // Handles some of the friction between wheel and ground. Additional
                // friction is handled in updateFriction()
                this.friction = this.bot.entity.physicsObj.addFrictionJoint(
                    Vec2.scale(this.spec.pos, PHYSICS_SCALE)
                )
                // hand-tuned values
                this.friction?.m_bodyB.setAngularDamping(10)
                this.friction?.m_bodyB.setLinearDamping(10)
                this.friction?.setMaxForce(5000)
                this.friction?.setMaxTorque(2)
            }
            this.updateForce(dtSecs)
        }
    }

    public setSpeed(speed: number) {
        if (this.bot.held) return
        speed = Math.min(Math.abs(speed / 100), 1) * Math.sign(speed)
        this.currSpeed = this.maxSpeed * speed
    }

    public updateFriction(dtSecs: number) {
        const worldPos = this.bot.entity.physicsObj.getWorldPoint(this.localPos)

        // Debug flags
        const dampenAngularVelocity = true
        const dampenLateralVelocity = true

        const maxAngularVelocity = 0.0005 // The maximum angular velocity to allow (hand-tuned)

        //// Dampen angular velocity
        if (dampenAngularVelocity) {
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

        //// Dampen lateral linear velocity
        if (dampenLateralVelocity) {
            const lateralDamping = 1 // The amount of lateral velocity dampening to apply
            const lateralDampingScalar = 5 // hand-tuned
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

        const speedMagScalar = 2 // hand-tuned
        const forceMag =
            this.currSpeed *
            speedMagScalar *
            this.bot.entity.physicsObj.body.getMass()

        // Apply forward force
        const force = Vec2.scale(forwardDir, forceMag)
        this.bot.entity.physicsObj.applyForce(force, worldPos)
    }
}
