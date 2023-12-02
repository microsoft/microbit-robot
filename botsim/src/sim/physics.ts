import Planck from "planck-js"
import { Vec2, Vec2Like } from "../types/vec2"
import {
    boxToVertices,
    makeBoxVertices,
    catmullRom,
    samplePath,
    calcMidVectors,
    makeCategoryBits,
    makeMaskBits,
    toCm,
} from "./util"
import { Simulation } from "."
import {
    EntitySpec,
    ShapeType,
    JointSpec,
    defaultJoint,
    EntityShapeSpec,
    EntityBoxShapeSpec,
    EntityCircleShapeSpec,
    EntityPolygonShapeSpec,
    EntityPathShapeSpec,
    EntityEdgeShapeSpec,
    ShapePhysicsSpec,
} from "../maps/specs"
import { Entity } from "./entity"
import { PHYS_TIMESTEP_MS, PHYS_TIMESTEP_SECS } from "./constants"
import { toDegrees, toRadians } from "../util"
import * as Pixi from "pixi.js" // Add this import statement

export default class Physics {
    private _world: Planck.World

    public get world() {
        return this._world
    }

    constructor(private sim: Simulation) {
        this._world = Planck.World({
            gravity: Planck.Vec2(0, 0),
        })
    }

    public update(dtMs: number): number {
        while (dtMs >= PHYS_TIMESTEP_MS) {
            this.sim.beforePhysicsStep(PHYS_TIMESTEP_SECS)
            this.world.step(PHYS_TIMESTEP_SECS)
            this.sim.afterPhysicsStep(PHYS_TIMESTEP_SECS)
            dtMs -= PHYS_TIMESTEP_MS
        }
        return dtMs // Return remaining dtMs not used
    }

    public add(physicsObj: PhysicsObject) {
        // For PlanckJS, the body is already added to the world
        //physicsObj.body.setAngle(0);
        physicsObj.body.setActive(true)
    }

    public debugDraw(canvas: HTMLCanvasElement) {}
}

export class PhysicsObject {
    private _debugRenderObj: Pixi.Container

    public get debugRenderObj() {
        return this._debugRenderObj
    }
    public get body() {
        return this._body
    }
    public get pos(): Vec2Like {
        const pos = this.body.getPosition()
        return { x: pos.x, y: pos.y }
    }
    public set pos(pos: Vec2Like) {
        this.body.setPosition(Planck.Vec2(pos))
    }
    public get angle(): number {
        return toDegrees(this.body.getAngle())
    }
    public set angle(angle: number) {
        this.body.setAngle(toRadians(angle))
    }
    public get forward(): Vec2Like {
        return this.body.getWorldVector(Planck.Vec2(Vec2.up()))
    }

    constructor(
        private _entity: Entity,
        private _body: Planck.Body,
        private _jointSpec?: JointSpec // when this object is added to another, this is the kind of joint to use
    ) {
        this._debugRenderObj = new Pixi.Graphics()
    }

    public beforePhysicsStep(dtSecs: number) {}

    public afterPhysicsStep(dtSecs: number) {
        if (!this._entity.sim.debugDraw) return
        this._debugRenderObj.removeChildren()
        for (
            let fixt = this._body.getFixtureList();
            !!fixt;
            fixt = fixt.getNext()
        ) {
            const type = fixt.getShape().getType()
            switch (type) {
                case "polygon":
                    const poly = fixt.getShape() as Planck.Polygon
                    const verts = poly.m_vertices
                    const pos = this._body.getPosition()
                    const angle = this._body.getAngle()
                    const worldVerts = verts.map((v) => {
                        return Vec2.rotateDeg(
                            Vec2.add(
                                new Vec2(v.x, v.y),
                                new Vec2(pos.x, pos.y)
                            ),
                            angle
                        )
                    })
                    const graphics = new Pixi.Graphics()
                    this._debugRenderObj.addChild(graphics as any)
                    graphics.lineStyle(1, 0xff0000, 1)
                    graphics.beginFill(0xff0000)
                    graphics.drawPolygon(worldVerts)
                    graphics.endFill()
                    break
                case "circle":
                    const circle = fixt.getShape() as Planck.Circle
                    const pos2 = this._body.getPosition()
                    const graphics3 = new Pixi.Graphics()
                    this._debugRenderObj.addChild(graphics3 as any)
                    graphics3.lineStyle(1, 0xff0000, 1)
                    graphics3.beginFill(0xff0000)
                    graphics3.drawCircle(pos2.x, pos2.y, circle.m_radius)
                    graphics3.endFill()
                    break
                case "edge":
                    break
                case "chain":
                    break
            }
        }
    }

    public update(dtSecs: number) {}

    public destroy() {
        // NOTE/TODO: Physics destroy is not currently working reliably and will
        // leave invisible bodies in the world
        this._entity.sim.physics.world.destroyBody(this.body)
    }

    public add(physicsObj: PhysicsObject) {
        const relativePos = physicsObj.pos
        const jointSpec =
            physicsObj._jointSpec ?? this._jointSpec ?? defaultJoint()

        if (jointSpec.transformToParent) {
            const rotated = Vec2.rotateDeg(relativePos, this.angle)
            const absolutePos = Vec2.add(this.pos, rotated)
            physicsObj.pos = absolutePos
            physicsObj.angle += this.angle
        }

        switch (jointSpec.type) {
            case "revolute":
                this.addRevoluteJoint(physicsObj, relativePos, jointSpec)
                break
            case "prismatic":
                this.addPrismaticJoint(physicsObj, relativePos, jointSpec)
                break
            case "distance":
                this.addDistanceJoint(physicsObj, relativePos, jointSpec)
                break
            case "weld":
                this.addWeldJoint(physicsObj, relativePos, jointSpec)
                break
        }
    }

    private addRevoluteJoint(
        physicsObj: PhysicsObject,
        offset: Vec2Like,
        jointSpec: JointSpec
    ): Planck.RevoluteJoint | undefined {
        const jointDef: Planck.RevoluteJointDef = {
            collideConnected: false,
            bodyA: this.body,
            bodyB: physicsObj.body,
            localAnchorB: Planck.Vec2.zero(),
            localAnchorA: Planck.Vec2(offset),
            referenceAngle: 0,
            lowerAngle: 0,
            upperAngle: 0,
            enableLimit: true,
        }
        return (
            this._entity.sim.physics.world.createJoint(
                new Planck.RevoluteJoint(jointDef)
            ) ?? undefined
        )
    }

    private addPrismaticJoint(
        physicsObj: PhysicsObject,
        offset: Vec2Like,
        jointSpec: JointSpec
    ): Planck.PrismaticJoint | undefined {
        const jointDef: Planck.PrismaticJointDef = {
            collideConnected: false,
            bodyA: this.body,
            bodyB: physicsObj.body,
            localAnchorB: Planck.Vec2.zero(),
            localAnchorA: Planck.Vec2(offset),
            localAxisA: Planck.Vec2(0, 1),
            referenceAngle: 0,
        }
        return (
            this._entity.sim.physics.world.createJoint(
                new Planck.PrismaticJoint(jointDef)
            ) ?? undefined
        )
    }

    private addDistanceJoint(
        physicsObj: PhysicsObject,
        offset: Vec2Like,
        jointSpec: JointSpec
    ): Planck.DistanceJoint | undefined {
        const jointDef: Planck.DistanceJointDef = {
            collideConnected: false,
            bodyA: this.body,
            bodyB: physicsObj.body,
            localAnchorB: Planck.Vec2.zero(),
            localAnchorA: Planck.Vec2(offset),
            length: 0,
            frequencyHz: 0,
            dampingRatio: 1,
        }
        return (
            this._entity.sim.physics.world.createJoint(
                new Planck.DistanceJoint(jointDef)
            ) ?? undefined
        )
    }

    private addWeldJoint(
        physicsObj: PhysicsObject,
        offset: Vec2Like,
        jointSpec: JointSpec
    ): Planck.WeldJoint | undefined {
        const jointDef: Planck.WeldJointDef = {
            collideConnected: false,
            bodyA: this.body,
            bodyB: physicsObj.body,
            localAnchorB: Planck.Vec2.zero(),
            localAnchorA: Planck.Vec2(offset),
            localAxisA: Planck.Vec2(0, 1),
        }
        return (
            this._entity.sim.physics.world.createJoint(
                new Planck.WeldJoint(jointDef)
            ) ?? undefined
        )
    }

    public addFrictionJoint(
        localPoint: Vec2Like
    ): Planck.FrictionJoint | undefined {
        const frictionBody = this._entity.sim.physics.world.createBody()
        const jointDef: Planck.FrictionJointDef = {
            collideConnected: false,
            bodyA: this.body,
            bodyB: frictionBody,
            localAnchorA: Planck.Vec2(localPoint),
            localAnchorB: Planck.Vec2(0, 0),
            maxForce: 500000, // TODO: calc this
            maxTorque: 0,
        }
        return (
            this._entity.sim.physics.world.createJoint(
                new Planck.FrictionJoint(jointDef)
            ) ?? undefined
        )
    }

    public addMouseJoint(localPoint: Vec2Like): Planck.MouseJoint | undefined {
        const mouseBody = this._entity.sim.physics.world.createBody()
        const jointDef: Planck.MouseJointDef = {
            collideConnected: false,
            bodyA: this.body,
            bodyB: mouseBody,
            target: Planck.Vec2(localPoint),
            maxForce: 100000, // TODO: calc this
            frequencyHz: 0,
            dampingRatio: 1,
        }
        return (
            this._entity.sim.physics.world.createJoint(
                new Planck.MouseJoint(jointDef)
            ) ?? undefined
        )
    }

    public applyForce(f: Vec2Like, p?: Vec2Like) {
        const pos = p ? Planck.Vec2(p) : this.body.getWorldCenter()
        this.body.applyForce(Planck.Vec2(f), pos, true)
    }

    public applyImpulse(f: Vec2Like, p?: Vec2Like) {
        const pos = p ? Planck.Vec2(p) : this.body.getWorldCenter()
        this.body.applyLinearImpulse(Planck.Vec2(f), pos, true)
    }

    public getLateralVelocity(p?: Vec2Like): Vec2Like {
        p = p ?? this.body.getWorldCenter()
        const forward = this.forward
        const linearVel = this.body.getLinearVelocityFromWorldPoint(
            Planck.Vec2(p)
        )
        const d = Vec2.dot(forward, linearVel)
        const forwardLateralVelocity = Vec2.scale(forward, d)
        return forwardLateralVelocity
    }

    public getLinearVelocity(p?: Vec2Like): Vec2Like {
        p = p ?? this.body.getWorldCenter()
        return this.body.getLinearVelocityFromWorldPoint(Planck.Vec2(p))
    }

    public setLinearVelocity(v: Vec2Like) {
        this.body.setLinearVelocity(Planck.Vec2(v))
    }

    public getAngularVelocity(): number {
        return this.body.getAngularVelocity()
    }

    public setAngularVelocity(v: number) {
        this.body.setAngularVelocity(v)
    }
}

// Factory functions for creating and adding fixtures to a body
const createAndAddFixture: {
    [entity in ShapeType]: (body: Planck.Body, spec: EntityShapeSpec) => void
} = {
    box: (b, s) => addBoxFixture(b, s as EntityBoxShapeSpec, s.physics),
    circle: (b, s) =>
        addCircleFixture(b, s as EntityCircleShapeSpec, s.physics),
    path: (b, s) => addPathFixture(b, s as EntityPathShapeSpec, s.physics),
    polygon: (b, s) =>
        addPolygonFixture(b, s as EntityPolygonShapeSpec, s.physics),
    edge: (b, s) => addEdgeFixture(b, s as EntityEdgeShapeSpec, s.physics),
}

function fixtureOptions(phys: ShapePhysicsSpec): Planck.FixtureOpt {
    return {
        density: phys.density ?? 1,
        friction: phys.friction ?? 0.3,
        restitution: phys.restitution ?? 0.2,
        isSensor: phys.sensor ?? false,
        filterMaskBits: phys.maskBits ?? makeMaskBits(0),
        filterCategoryBits: phys.categoryBits ?? makeCategoryBits(0),
    }
}

function addBoxFixture(
    body: Planck.Body,
    spec: EntityBoxShapeSpec,
    phys: ShapePhysicsSpec
) {
    const verts = boxToVertices(spec).map((v) => {
        v = Vec2.rotateDeg(v, spec.angle)
        v = Vec2.add(v, spec.offset)
        return Planck.Vec2(toCm(v.x), toCm(v.y))
    })
    const shape = Planck.Polygon(verts)
    const fixt = body.createFixture(shape, fixtureOptions(phys))
    fixt.setUserData(spec)
}

function addCircleFixture(
    body: Planck.Body,
    spec: EntityCircleShapeSpec,
    phys: ShapePhysicsSpec
) {
    const shape = Planck.Circle(Planck.Vec2(spec.offset), toCm(spec.radius))
    const fixt = body.createFixture(shape, fixtureOptions(phys))
    fixt.setUserData(spec)
}

function addPathFixture(
    body: Planck.Body,
    spec: EntityPathShapeSpec,
    phys: ShapePhysicsSpec
) {
    const { verts: pathVerts, closed } = spec
    if (pathVerts.length < 4) {
        return
    }
    const samples = samplePath(
        catmullRom,
        pathVerts,
        closed,
        0,
        pathVerts.length,
        0.25
    )

    // Might have to use use this if box fixtures exhibit issues with exposed corners.
    // Mid-vectors will allow us to create polygon fixtures that match up on edge.
    // const mids = calcMidVectors(samples)

    for (let i = 0; i < samples.length - 1; i++) {
        const s0 = samples[i]
        const s1 = samples[i + 1]
        const delta = Vec2.sub(s1, s0)
        const len = Vec2.len(delta)
        const angle = Vec2.angleDeg(delta)
        const segSpec: EntityBoxShapeSpec = {
            type: "box",
            label: spec.label + ".seg." + i,
            offset: s0,
            angle: angle,
            halign: "right",
            valign: "center",
            size: { x: len, y: spec.width },
            physics: spec.physics,
            brush: spec.brush,
            roles: spec.roles,
        }
        addBoxFixture(body, segSpec, phys)
    }
}

function addPolygonFixture(
    body: Planck.Body,
    spec: EntityPolygonShapeSpec,
    phys: ShapePhysicsSpec
) {
    const shape = Planck.Polygon(
        spec.verts.map((v) => {
            v = Vec2.rotateDeg(v, spec.angle)
            v = Vec2.add(v, spec.offset)
            return Planck.Vec2(toCm(v.x), toCm(v.y))
        })
    )
    const fixt = body.createFixture(shape, {
        density: phys.density ?? 1,
        friction: phys.friction ?? 0.3,
        restitution: phys.restitution ?? 0.2,
        isSensor: phys.sensor ?? false,
    })
    fixt.setUserData(spec)
}

function addEdgeFixture(
    body: Planck.Body,
    spec: EntityEdgeShapeSpec,
    phys: ShapePhysicsSpec
) {
    const v0 = Vec2.add(spec.offset, Vec2.rotateDeg(spec.v0, spec.angle))
    const v1 = Vec2.add(spec.offset, Vec2.rotateDeg(spec.v1, spec.angle))

    const shape = Planck.Edge(
        Planck.Vec2(toCm(v0.x), toCm(v0.y)),
        Planck.Vec2(toCm(v1.x), toCm(v1.y))
    )
    if (spec.vPrev) {
        const vPrev = Vec2.add(
            spec.offset,
            Vec2.rotateDeg(spec.vPrev, spec.angle)
        )
        shape.setPrev(Planck.Vec2(toCm(vPrev.x), toCm(vPrev.y)))
    }
    if (spec.vNext) {
        const vNext = Vec2.add(
            spec.offset,
            Vec2.rotateDeg(spec.vNext, spec.angle)
        )
        shape.setNext(Planck.Vec2(toCm(vNext.x), toCm(vNext.y)))
    }

    const fixt = body.createFixture(shape, fixtureOptions(phys))
    fixt.setUserData(spec)
}

function createBody(world: Planck.World, spec: EntitySpec): Planck.Body {
    const { shapes, pos, angle, physics } = spec

    const body = world.createBody({
        type: physics.type,
        position: Planck.Vec2(toCm(pos.x), toCm(pos.y)),
        angle: toRadians(angle),
        angularDamping: physics.angularDamping ?? 0,
        linearDamping: physics.linearDamping ?? 0,
        fixedRotation: physics.fixedRotation ?? false,
        // active: false, // Make inactive until initialized?
    })
    // Add a fixture for each shape attachment
    shapes.forEach((s) => {
        createAndAddFixture[s.type](body, s)
    })
    return body
}

export function createPhysicsObj(ent: Entity, spec: EntitySpec): PhysicsObject {
    const body = createBody(ent.sim.physics.world, spec)
    const physicsObj = new PhysicsObject(ent, body, spec.physics.joint)
    return physicsObj
}
