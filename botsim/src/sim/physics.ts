import Planck from "planck-js"
import { Vec2, Vec2Like } from "../types/vec2"
import { boxToVertices, catmullRom, samplePath, makePathPolygons } from "./util"
import { Simulation } from "."
import {
    EntitySpec,
    ShapeType,
    EntityShapeSpec,
    EntityBoxShapeSpec,
    EntityCircleShapeSpec,
    EntityPolygonShapeSpec,
    EntityPathShapeSpec,
    EntityEdgeShapeSpec,
    ShapePhysicsSpec,
} from "./specs"
import { Entity } from "./entity"
import { toDegrees, toRadians } from "../util"
import * as Pixi from "pixi.js"
import { RENDER_SCALE } from "../constants"

Planck.Settings.maxPolygonVertices = 64

type Dampening = {
    linear: number
    angular: number
}
/**
 * Physics engine wrapper
 */
export default class Physics {
    private _world!: Planck.World
    private _mouseGround!: Planck.Body
    private _mouseJoint: Planck.MouseJoint | undefined
    private _mouseCachedDampening: Dampening | undefined

    public get mouseJoint() {
        return this._mouseJoint
    }

    public get world() {
        return this._world
    }

    constructor(private sim: Simulation) {
        this.createWorld()
    }

    public reinit() {
        this.createWorld()
    }

    private createWorld() {
        if (this._world) {
            this._world.off("begin-contact", this.onBeginContact)
            this._world.off("end-contact", this.onEndContact)
            this._world.off("remove-body", this.onRemoveBody)
            // Destroy all bodies and joints
            try {
                for (
                    let body = this._world.getBodyList();
                    body;
                    body = body.getNext()
                ) {
                    this._world.destroyBody(body)
                }
            } catch {}
            try {
                for (
                    let joint = this._world.getJointList();
                    joint;
                    joint = joint.getNext()
                ) {
                    this._world.destroyJoint(joint)
                }
            } catch {}
        }
        this._world = Planck.World({
            gravity: Planck.Vec2(0, 0),
        })
        this._world.on("begin-contact", this.onBeginContact)
        this._world.on("end-contact", this.onEndContact)
        this._world.on("remove-body", this.onRemoveBody)
        this._mouseGround = this._world.createBody()
        this._mouseJoint = undefined
    }

    private releaseMouseJoint() {
        if (this._mouseJoint) {
            const _bodyB = this._mouseJoint.getBodyB()
            if (_bodyB && this._mouseCachedDampening) {
                // Restore the body's original dampening
                _bodyB.setAngularDamping(this._mouseCachedDampening.angular)
                _bodyB.setLinearDamping(this._mouseCachedDampening.linear)
                this._mouseCachedDampening = undefined
            }
            this._world.destroyJoint(this._mouseJoint)
            this._mouseJoint = undefined
        }
    }

    public mouseDown(p: Vec2Like) {
        this.releaseMouseJoint()
        const body = this.findBody(p, (fixt) => {
            // Only grab shapes tagged with "mouse-target" role
            const spec = fixt.getUserData() as EntityShapeSpec
            return spec.roles?.includes("mouse-target") ?? false
        })
        if (!body) return

        // Make the body easier to drag around (without losing all sense of weight)
        this._mouseCachedDampening = {
            angular: body.getAngularDamping(),
            linear: body.getLinearDamping(),
        }
        body.setAngularDamping((2 * body.getAngularDamping()) / 3)
        body.setLinearDamping(body.getLinearDamping() / 3)

        // Create a mouse joint to handle dragging the body
        const joint = new Planck.MouseJoint({
            target: Planck.Vec2(p),
            maxForce: 100000,
            bodyA: this._mouseGround,
            bodyB: body,
        })
        this._mouseJoint = this._world.createJoint(joint) as Planck.MouseJoint
    }

    public mouseMove(p: Vec2Like) {
        if (this._mouseJoint) {
            this._mouseJoint.setTarget(Planck.Vec2(p))
        }
    }

    public mouseUp(p: Vec2Like) {
        this.releaseMouseJoint()
    }

    public isMouseTarget(p: Vec2Like) {
        return !!this.findBody(p, (fixt) => {
            const spec = fixt.getUserData() as EntityShapeSpec
            return spec.roles?.includes("mouse-target") ?? false
        })
    }

    private findBody(
        p: Vec2Like,
        filterFn?: (fixture: Planck.Fixture) => boolean
    ): Planck.Body | undefined {
        let body: Planck.Body | undefined
        filterFn = filterFn ?? (() => true)
        const aabb = Planck.AABB(Planck.Vec2(p.x, p.y), Planck.Vec2(p.x, p.y))
        this._world.queryAABB(aabb, (fixture: Planck.Fixture) => {
            // Dont' grab static objects
            if (!fixture.getBody().isDynamic()) {
                return true
            }
            // Make sure `p` is on it
            if (!fixture.testPoint(Planck.Vec2(p.x, p.y))) {
                return true
            }
            // Custom filter
            if (!filterFn!(fixture)) {
                return true
            }
            body = fixture.getBody()
            return false
        })
        return body
    }

    public update(dtSecs: number): number {
        this.world.step(dtSecs, 6, 2)
        return 0
    }

    public add(physicsObj: PhysicsObject) {
        // For PlanckJS, the body is already added to the world (the world
        // creates it)
        physicsObj.body.setActive(true)
    }

    public on(
        obj: PhysicsObject,
        event: "begin-contact",
        handler: (contact: Planck.Contact) => void
    ): void
    public on(
        obj: PhysicsObject,
        event: "end-contact",
        handler: (contact: Planck.Contact) => void
    ): void
    public on(
        obj: PhysicsObject,
        event: string,
        handler: (contact: Planck.Contact) => void
    ): void {
        // TODO: Register the object for contact events, filter and dispatch
    }

    // TODO: Dispatch contact events to entities from here
    private onBeginContact = (contact: Planck.Contact) => {}
    private onEndContact = (contact: Planck.Contact) => {}
    private onRemoveBody = (body: Planck.Body) => {}
}

/**
 * Physics object wrapper
 */
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
        private _body: Planck.Body
    ) {
        this._debugRenderObj = new Pixi.Graphics()
        this._debugRenderObj.zIndex = 100
    }

    private debugDraw() {
        this._debugRenderObj.removeChildren()
        for (
            let fixt = this._body.getFixtureList();
            !!fixt;
            fixt = fixt.getNext()
        ) {
            const spec = fixt.getUserData() as EntityShapeSpec
            let color = 0x000000
            let alpha = 1
            if (spec.roles?.includes("mouse-target")) {
                // Color mouse targets with some transparency
                color = 0x00ffff
                alpha = 0.7
            } else if (spec.roles?.includes("follow-line")) {
                // Color path segments as a looping gradient
                const label = spec.label ?? ""
                const m = label.match(/.seg.(\d+)/)
                if (m && m[1]) {
                    const v = (20 * parseInt(m[1])) % 255
                    const c = new Pixi.Color(Uint8Array.from([v, 0xff - v, 0]))
                    color = c.toNumber()
                } else {
                    color = 0xff0000
                }
            } else if (spec.label?.match(/sensor/)) {
                color = 0xffff00
            }
            const type = fixt.getShape().getType()
            switch (type) {
                case "polygon": {
                    const poly = fixt.getShape() as Planck.Polygon
                    const verts = poly.m_vertices
                    const worldVerts = verts.map((v) => {
                        return Vec2.scale(this.getWorldPoint(v), RENDER_SCALE)
                    })
                    const graphics = new Pixi.Graphics()
                    this._debugRenderObj.addChild(graphics as any)
                    graphics.lineStyle(0)
                    graphics.beginFill(color, alpha)
                    graphics.drawPolygon(worldVerts)
                    graphics.endFill()
                    break
                }
                case "circle": {
                    const circle = fixt.getShape() as Planck.Circle
                    const pos = this.getWorldPoint(circle.m_p)
                    const graphics = new Pixi.Graphics()
                    this._debugRenderObj.addChild(graphics as any)
                    graphics.lineStyle(0)
                    graphics.beginFill(color, alpha)
                    graphics.drawCircle(
                        pos.x * RENDER_SCALE,
                        pos.y * RENDER_SCALE,
                        circle.m_radius * RENDER_SCALE
                    )
                    graphics.endFill()
                    break
                }
                case "edge":
                    break
                case "chain":
                    break
            }
        }
        if (this._body.isDynamic()) {
            // Draw center of mass
            const massData: Planck.MassData = {
                mass: 0,
                center: Planck.Vec2.zero(),
                I: 0,
            }
            this._body.getMassData(massData)
            const graphics = new Pixi.Graphics()
            this._debugRenderObj.addChild(graphics as any)
            graphics.lineStyle(0)
            graphics.beginFill(0x00ffff)
            const p = Vec2.scale(
                this.getWorldPoint(massData.center),
                RENDER_SCALE
            )
            graphics.drawCircle(p.x, p.y, 10)
            graphics.endFill()
        }
    }

    public update(dtSecs: number) {
        if (this._entity.sim.debugDraw) this.debugDraw()
    }

    public destroy() {
        // NOTE/TODO: Physics destroy is not currently working reliably and
        // might leave invisible bodies in the world
        this._entity.sim.physics.world.destroyBody(this.body)
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
            maxForce: 500,
            maxTorque: 0,
        }
        return (
            this._entity.sim.physics.world.createJoint(
                new Planck.FrictionJoint(jointDef)
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

    public applyAngularForce(f: number) {
        this.body.applyTorque(f, true)
    }

    public applyAngularImpulse(f: number) {
        this.body.applyAngularImpulse(f, true)
    }

    public getLateralVelocity(p?: Vec2Like): Vec2Like {
        const worldRight = this.getWorldVector(Planck.Vec2(Vec2.right()))
        const linearVel = this.getLinearVelocity(p)
        const d = Vec2.dot(worldRight, linearVel)
        const latVel = Vec2.scale(worldRight, d)
        return latVel
    }

    public getForwardVelocity(p?: Vec2Like): Vec2Like {
        const worldForward = this.getWorldVector(Planck.Vec2(Vec2.up()))
        const linearVel = this.getLinearVelocity(p)
        const d = Vec2.dot(worldForward, linearVel)
        const fwdVel = Vec2.scale(worldForward, d)
        return fwdVel
    }

    public getLinearVelocity(p?: Vec2Like): Vec2Like {
        p = p ?? this.getWorldCenter()
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

    public getMass(): number {
        return this.body.getMass()
    }

    public getInertia(): number {
        return this.body.getInertia()
    }

    public getWorldPoint(localPoint: Vec2Like): Vec2Like {
        return this.body.getWorldPoint(Planck.Vec2(localPoint))
    }

    public getLocalPoint(worldPoint: Vec2Like): Vec2Like {
        return this.body.getLocalPoint(Planck.Vec2(worldPoint))
    }

    public getWorldVector(localVector: Vec2Like): Vec2Like {
        return this.body.getWorldVector(Planck.Vec2(localVector))
    }

    public getLocalVector(worldVector: Vec2Like): Vec2Like {
        return this.body.getLocalVector(Planck.Vec2(worldVector))
    }

    public getWorldCenter(): Vec2Like {
        return this.body.getWorldCenter()
    }

    public getLocalCenter(): Vec2Like {
        return this.body.getLocalCenter()
    }

    public getLinearDamping(): number {
        return this.body.getLinearDamping()
    }

    public setLinearDamping(d: number) {
        this.body.setLinearDamping(d)
    }

    public getAngularDamping(): number {
        return this.body.getAngularDamping()
    }

    public setAngularDamping(d: number) {
        this.body.setAngularDamping(d)
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
        filterMaskBits: phys.maskBits ?? 0xffff,
        filterCategoryBits: phys.categoryBits ?? 0xffff,
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
        return Planck.Vec2(v.x, v.y)
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
    const shape = Planck.Circle(Planck.Vec2(spec.offset), spec.radius)
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
        spec.stepSize
    )
    const polys = makePathPolygons(samples, spec.width)

    polys.forEach((verts, i) => {
        const segSpec: EntityPolygonShapeSpec = {
            type: "polygon",
            label: "path.seg." + i,
            offset: Vec2.zero(),
            angle: 0,
            verts,
            physics: spec.physics,
            brush: spec.brush,
            roles: spec.roles,
        }
        addPolygonFixture(body, segSpec, phys)
    })
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
            return Planck.Vec2(v.x, v.y)
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

    const shape = Planck.Edge(Planck.Vec2(v0.x, v0.y), Planck.Vec2(v1.x, v1.y))
    if (spec.vPrev) {
        const vPrev = Vec2.add(
            spec.offset,
            Vec2.rotateDeg(spec.vPrev, spec.angle)
        )
        shape.setPrev(Planck.Vec2(vPrev.x, vPrev.y))
    }
    if (spec.vNext) {
        const vNext = Vec2.add(
            spec.offset,
            Vec2.rotateDeg(spec.vNext, spec.angle)
        )
        shape.setNext(Planck.Vec2(vNext.x, vNext.y))
    }

    const fixt = body.createFixture(shape, fixtureOptions(phys))
    fixt.setUserData(spec)
}

function createBody(world: Planck.World, spec: EntitySpec): Planck.Body {
    const { shapes, pos, angle, physics } = spec

    const body = world.createBody({
        type: physics.type,
        position: Planck.Vec2(pos.x, pos.y),
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
    const physicsObj = new PhysicsObject(ent, body)
    return physicsObj
}
