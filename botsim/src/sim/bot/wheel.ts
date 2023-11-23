import { BotSpec, WheelSpec } from "../../bots/specs"
import {
    EntityShapeSpec,
    EntitySpec,
    defaultBoxShape,
    defaultDynamicPhysics,
    defaultEntity,
    defaultEntityShape,
    defaultShapePhysics,
} from "../../maps/specs"
import { PHYS_CAT_ROBOT, PIXELS_PER_CM } from "../constants"
import { makeCategoryBits, makeMaskBits } from "../util"
import { Bot } from "."
import { Vec2 } from "../../types/vec2"
import Planck from "planck-js"
import { Entity } from "../entity"

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
            offset: Vec2.zero(),
            size: { x: spec.radius * 2, y: spec.width },
            brush: {
                ...spec.brush,
                zIndex: 1,
            },
            physics: {
                ...defaultShapePhysics(),
                friction: 0.1,
                restitution: 0.9,
                density: 1,
                categoryBits: makeCategoryBits(PHYS_CAT_ROBOT),
                maskBits: makeMaskBits(PHYS_CAT_ROBOT),
            },
        }
    }

    public makeEntitySpec(): EntitySpec {
        return {
            ...defaultEntity(),
            pos: this.spec.pos,
            angle: 0,
            shapes: [Wheel.makeShapeSpec(this.spec)],
            physics: {
                ...defaultDynamicPhysics(),
                joint: {
                    type: "weld",
                    transformToParent: true,
                },
            },
        }
    }

    private minSpeed: number
    private maxSpeed: number
    private currSpeed: number
    private entity: Entity
    private friction?: Planck.FrictionJoint

    constructor(
        private bot: Bot,
        private spec: WheelSpec
    ) {
        this.minSpeed = spec.minSpeed
        this.maxSpeed = spec.maxSpeed
        this.currSpeed = 0

        this.entity = bot.sim.createEntity(this.makeEntitySpec(), bot.entity)

        // Add friction joint to apply constant friction at the wheel contact point.
        // TODO: Calculate the friction forces ourselves instead of using a friction joint.
        this.friction = this.entity.physicsObj.addFrictionJoint(spec.pos)
        this.friction?.m_bodyB.setAngularDamping(1)
        this.friction?.setMaxForce(200000)
    }

    public destroy() {}

    public beforePhysicsStep(dtSecs: number) {
        this.applySpeed(dtSecs)
        // We're battling how the physics engine wants to move things (both here
        // and elsewhere). Try to keep wheel in the same position relative to
        // the chassis. Even though it's connected with what's called a "weld
        // joint", it's not really welded. The joint can be overwhelmed by
        // forces. So we apply a canceling force to try to keep it in place, but
        // it isn't precise. This is a hack, but it seems to work well enough
        // for now. We need our own generalized friction model and weld joint.
        const relativePos = Vec2.scale(this.spec.pos, PIXELS_PER_CM)
        const rotated = Vec2.rotateDeg(relativePos, this.bot.entity.angle)
        const absolutePos = Vec2.add(this.bot.entity.pos, rotated)
        const myPos = this.entity.pos
        const delta = Vec2.sub(absolutePos, myPos)
        const lenSq = Vec2.lenSq(delta)
        if (lenSq > 0.001) {
            const len = Math.sqrt(lenSq)
            const force = Vec2.scale(delta, 100000 * len)
            this.entity.applyForce(force)
        }
    }

    public update(dtSecs: number) {}

    public setSpeed(speed: number) {
        if (Math.abs(speed) > this.maxSpeed) {
            speed = Math.sign(speed) * this.maxSpeed
        }
        this.currSpeed = speed
        //this.friction?.setMaxForce(10000 + 10000 * this.currSpeed / Math.abs(this.maxSpeed))
    }

    public applySpeed(dtSecs: number) {
        // NOTE: This is just a first stab at computing realistic-looking wheel
        // forces. It is nowhere near correct yet.

        const forward = this.bot.forward

        // Apply forward force
        const force = Vec2.scale(forward, this.currSpeed * 8000)
        const flen = Vec2.lenSq(force)
        if (flen > 0.0001) {
            this.entity.applyForce(force)
        }

        // Cancel out lateral velocity
        // TODO: Implement a generalized top-down friction model.
        const lateralVelocity = this.entity.physicsObj.getLateralVelocity()
        const lateralCancelingImpulse = Vec2.scale(
            Vec2.neg(lateralVelocity),
            90
        )
        if (Vec2.lenSq(lateralCancelingImpulse) > 0.0001) {
            this.entity.applyImpulse(lateralCancelingImpulse)
        }
    }
}
