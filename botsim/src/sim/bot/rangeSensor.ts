import { Bot } from "."
import { RangeSensorSpec } from "../../bots/specs"
import { Vec2, Vec2Like } from "../../types/vec2"
import { nextId } from "../../util"
import {
    EntityShapeSpec,
    defaultCircleShape,
    defaultColorBrush,
    defaultEdgeShape,
    defaultEntityShape,
    defaultPolygonShape,
    defaultShapePhysics,
} from "../specs"
import Planck from "planck-js"
import { angleTo180, appoximateArc, testOverlap } from "../util"
import { LineSegment, LineSegmentLike, intersection } from "../../types/line"
import { createGraphics } from "../renderer"
import { PHYSICS_SCALE } from "../constants"

export class RangeSensor {
    sensorId: string
    coneSpec!: EntityShapeSpec
    visualSpec!: EntityShapeSpec
    targetSpec!: EntityShapeSpec
    leftEdge!: LineSegmentLike
    rightEdge!: LineSegmentLike
    _value: number
    used: boolean = false;

    public get shapeSpecs() {
        return [this.coneSpec, this.visualSpec, this.targetSpec]
    }
    public get value(): number {
        return this._value
    }

    private constructShapeSpecs() {
        this.leftEdge = {
            p0: Vec2.zero(),
            p1: Vec2.rotateDeg(
                { x: 0, y: -this.spec.maxRange },
                -this.spec.beamAngle / 2
            ),
        }
        this.rightEdge = {
            p0: Vec2.zero(),
            p1: Vec2.rotateDeg(
                { x: 0, y: -this.spec.maxRange },
                this.spec.beamAngle / 2
            ),
        }
        // The shape of the sensor area, for collision detection
        this.coneSpec = {
            ...defaultEntityShape(),
            ...defaultPolygonShape(),
            label: this.sensorId + ".cone",
            offset: this.spec.pos,
            verts: [{ x: 0, y: 0 }, this.leftEdge.p1, this.rightEdge.p1],
            physics: {
                ...defaultShapePhysics(),
                sensor: true, // don't collide with anything (but still reports collisions)
                density: 0,
            },
            brush: {
                ...defaultColorBrush(),
                visible: false, // this shape stays invisible
            },
        }
        // The visual representation of the current sensor sweep
        this.visualSpec = {
            ...defaultEntityShape(),
            ...defaultPolygonShape(),
            label: this.sensorId + ".visual",
            offset: this.spec.pos,
            verts: [{ x: 0, y: 0 }, this.leftEdge.p1, this.rightEdge.p1],
            physics: {
                ...defaultShapePhysics(),
                sensor: true, // don't collide with anything
                density: 0,
            },
            brush: {
                ...this.spec.brush.negative,
                zIndex: 5,
            },
        }
        // A marker to place on the point of nearest range, if any
        this.targetSpec = {
            ...defaultEntityShape(),
            ...defaultEdgeShape(),
            label: this.sensorId + ".target",
            physics: {
                ...defaultShapePhysics(),
                sensor: true, // don't collide with anything
                density: 0,
            },
            brush: {
                ...defaultColorBrush(),
                visible: false, // start hidden
                zIndex: 10,
            },
        }
    }

    constructor(
        private bot: Bot,
        private spec: RangeSensorSpec
    ) {
        this.sensorId = "range-sensor." + nextId()
        this.constructShapeSpecs()
        this._value = -1
    }

    public destroy() {}

    public update(dtSecs: number) {
        this._value = -1
        let detected = false
        const botPos = this.bot.pos
        const myAngle = this.bot.angle
        const myPos = Vec2.transformDeg(
            Vec2.scale(this.visualSpec.offset, PHYSICS_SCALE),
            botPos,
            myAngle
        )
        const myForward = this.bot.forward
        const overlaps: Planck.Fixture[] = []
        const edges: ContactEdge[] = []
        // Transform the edges of the cone to world space
        const leftEdge = LineSegment.transformDeg(
            LineSegment.scale(this.leftEdge, PHYSICS_SCALE),
            myPos,
            myAngle
        )
        const rightEdge = LineSegment.transformDeg(
            LineSegment.scale(this.rightEdge, PHYSICS_SCALE),
            myPos,
            myAngle
        )
        const leftEdgeDelta = Vec2.sub(leftEdge.p1, leftEdge.p0)
        const rightEdgeDelta = Vec2.sub(rightEdge.p1, rightEdge.p0)
        const leftEdgeDist = Vec2.len(leftEdgeDelta)
        const rightEdgeDist = Vec2.len(rightEdgeDelta)
        const leftEdgeDir = Vec2.scale(leftEdgeDelta, 1 / leftEdgeDist)
        const rightEdgeDir = Vec2.scale(rightEdgeDelta, 1 / rightEdgeDist)
        const halfBeamAngle = this.spec.beamAngle / 2
        // Returns true if `roles` contains a value we should consider an
        // obstacle
        const isObstacle = (roles: string[]) =>
            roles.includes("obstacle") || roles.includes("robot")
        // Returns true if the fixture is part of the bot's own body
        const isMe = (fixture: Planck.Fixture) =>
            fixture.getBody() === this.bot.entity.physicsObj.body
        // Returns the normalized direction to the given point, and the angle of
        // that direction (all relative to the bot's forward vector)
        const calcPointInfo = (
            p: Vec2Like
        ): { dir: Vec2Like; angle: number; dist: number; p: Vec2Like } => {
            const delta = Vec2.sub(p, myPos)
            let dist = Vec2.len(delta)
            const dir = Vec2.scale(delta, 1 / dist)
            if (dist > this.spec.maxRange * PHYSICS_SCALE) {
                dist = this.spec.maxRange * PHYSICS_SCALE
                p = Vec2.add(myPos, Vec2.scale(dir, dist))
            }
            const angle = angleTo180(Vec2.angleBetweenDeg(myForward, dir))
            return { dir, angle, dist, p }
        }
        // Gather the line segment
        const ingestEdge = (p0: Vec2Like, p1: Vec2Like) => {
            // Get the dot product of the line's normal with the bot's forward
            const dir = Vec2.sub(p1, p0)
            const perp = Vec2.perp(dir, false)
            const dot = Vec2.dot(myForward, perp)
            // If the dot product is negative, the line is facing the bot
            if (dot < 0) {
                const da0 = calcPointInfo(p0)
                const da1 = calcPointInfo(p1)
                // skip if edge falls to the left or right of the cone
                if (da0.angle > halfBeamAngle && da1.angle > halfBeamAngle) {
                    return
                }
                if (da0.angle < -halfBeamAngle && da1.angle < halfBeamAngle) {
                    return
                }
                const edge: ContactEdge = {
                    c0: {
                        ...da0,
                    },
                    c1: {
                        ...da1,
                    },
                    perp: Vec2.normalize(perp),
                    dir: Vec2.normalize(dir),
                }
                edges.push(edge)
            }
        }
        const ingestVerts = (verts: Vec2Like[], closed: boolean) => {
            if (verts.length < 2) return
            // NOTE: verts are assumed to be:
            // - in world space, scaled in physics units
            // - in counter-clockwise order
            // - represent a contiguous set of line segments
            for (
                let i = 1;
                closed ? i <= verts.length : i < verts.length;
                ++i
            ) {
                const p0 = verts[i - 1]
                const p1 = verts[i % verts.length]
                ingestEdge(p0, p1)
            }
        }
        // Loop over all contacts, looking for overlaps with the sensor cone
        for (
            let ce = this.bot.entity.physicsObj.body.getContactList();
            ce;
            ce = ce.next ?? null
        ) {
            // TODO: Refactor contacts to work from Simulation, providing a
            // single contact listener instead of embedding polling like this in
            // components.
            const contact = ce.contact
            const fixtureA = contact.getFixtureA()
            const fixtureB = contact.getFixtureB()
            const userDataA = fixtureA.getUserData() as EntityShapeSpec
            const userDataB = fixtureB.getUserData() as EntityShapeSpec
            if (!userDataA || !userDataB) continue
            const labelA = userDataA.label
            const labelB = userDataB.label
            const rolesA = userDataA.roles
            const rolesB = userDataB.roles
            // TODO: Use Planck's category mask bits to do some of this
            // filtering earlier.
            if (
                labelA === this.coneSpec.label &&
                isObstacle(rolesB) &&
                !isMe(fixtureB) &&
                testOverlap(fixtureA, fixtureB)
            ) {
                overlaps.push(fixtureB)
            } else if (
                labelB === this.coneSpec.label &&
                isObstacle(rolesA) &&
                !isMe(fixtureA) &&
                testOverlap(fixtureA, fixtureB)
            ) {
                overlaps.push(fixtureA)
            }
        }
        // For each overlapping shape, get the set of line segments that:
        // - overlap the sensor cone
        // - face the bot
        for (const fixture of overlaps) {
            const overlapShape = fixture.getShape()
            const itPos = fixture.getBody().getPosition()
            const itAngle = fixture.getBody().getAngle()
            switch (overlapShape.getType()) {
                case "circle":
                    const circleShape = overlapShape as Planck.Circle
                    const circlePos = circleShape.m_p
                    const circleRadius = circleShape.getRadius()
                    // Transform the circle's center to world space
                    const circleCenter = Vec2.transform(
                        circlePos,
                        itPos,
                        itAngle
                    )
                    // TODO: Only generate the part of the circle inside the
                    // sensor cone and facing the bot
                    const verts = appoximateArc(
                        circleCenter,
                        circleRadius,
                        0,
                        360,
                        16
                    )
                    ingestVerts(verts, true)
                    break
                case "polygon": {
                    const polygonShape = overlapShape as Planck.Polygon
                    // Transform verts to world space
                    const verts = polygonShape.m_vertices.map(
                        (v) => Vec2.transform(v, itPos, itAngle) // angle in radians here
                    )
                    // Build a set of contact edges from this polygon's edges
                    ingestVerts(verts, true)
                    break
                }
                default:
                    break
            }
        }
        // Clip contact edges to sensor cone
        for (const edge of edges) {
            if (edge.c0.angle < -halfBeamAngle) {
                // c0 is to the left of the cone
                const int = intersection(
                    leftEdge.p0,
                    leftEdge.p1,
                    edge.c0.p,
                    edge.c1.p
                )
                if (int.type === "point") {
                    edge.c0.clipped = {
                        ...calcPointInfo(int.p),
                    }
                }
            } else if (edge.c0.angle > halfBeamAngle) {
                // c0 is to the right of the cone
                const int = intersection(
                    rightEdge.p0,
                    rightEdge.p1,
                    edge.c0.p,
                    edge.c1.p
                )
                if (int.type === "point") {
                    edge.c0.clipped = {
                        ...calcPointInfo(int.p),
                    }
                }
            }
            if (edge.c1.angle < -halfBeamAngle) {
                // c1 is to the left of the cone
                const int = intersection(
                    leftEdge.p0,
                    leftEdge.p1,
                    edge.c0.p,
                    edge.c1.p
                )
                if (int.type === "point") {
                    edge.c1.clipped = {
                        ...calcPointInfo(int.p),
                    }
                }
            } else if (edge.c1.angle > halfBeamAngle) {
                // c1 is to the right of the cone
                const int = intersection(
                    rightEdge.p0,
                    rightEdge.p1,
                    edge.c0.p,
                    edge.c1.p
                )
                if (int.type === "point") {
                    edge.c1.clipped = {
                        ...calcPointInfo(int.p),
                    }
                }
            }
        }

        // Map the contact edges to individual points, adding additional samples
        // a tiny bit outside each segment. These additional points are used to
        // cast rays just beyond the segment to hit the next one behind.
        const points: ContactPointBase[] = []
        for (const edge of edges) {
            const c0 = edge.c0.clipped || edge.c0
            const c1 = edge.c1.clipped || edge.c1
            points.push(c0)
            points.push(c1)
            if (!edge.c0.clipped) {
                const angv = Vec2.fromAngleDeg(
                    -90 + myAngle + edge.c0.angle + 0.1
                )
                const sclv = Vec2.scale(angv, edge.c0.dist)
                const p = Vec2.add(sclv, myPos)
                points.push({
                    ...calcPointInfo(p),
                })
            }
            if (!edge.c1.clipped) {
                const angv = Vec2.fromAngleDeg(
                    -90 + myAngle + edge.c1.angle - 0.1
                )
                const sclv = Vec2.scale(angv, edge.c1.dist)
                const p = Vec2.add(sclv, myPos)
                points.push({
                    ...calcPointInfo(p),
                })
            }
        }

        // Add far sensor edge as a backstop line segment
        const backstop: ContactEdge = {
            c0: {
                p: rightEdge.p1,
                angle: halfBeamAngle,
                dir: rightEdgeDir,
                dist: rightEdgeDist,
            },
            c1: {
                p: leftEdge.p1,
                angle: -halfBeamAngle,
                dir: leftEdgeDir,
                dist: leftEdgeDist,
            },
            perp: Vec2.neg(myForward),
            dir: Vec2.normalize(Vec2.sub(leftEdge.p1, rightEdge.p1)),
        }
        edges.push(backstop)
        points.push(backstop.c0)
        points.push(backstop.c1)

        // Sort the points by angle
        points.sort((a, b) => a.angle - b.angle)

        // Cast a ray through each point to get the nearest intersection with a
        // segment.
        const nearestIntersection = (
            p: ContactPointBase
        ): Vec2Like | undefined => {
            const ray = {
                p0: myPos,
                p1: Vec2.add(
                    myPos,
                    Vec2.scale(p.dir, this.spec.maxRange * PHYSICS_SCALE * 1.25)
                ),
            }
            const collector: Vec2Like[] = []
            for (const edge of edges) {
                const int = intersection(ray.p0, ray.p1, edge.c0.p, edge.c1.p)
                if (int.type === "point") {
                    collector.push(int.p)
                }
            }
            collector.sort(
                (a, b) => Vec2.distSq(a, myPos) - Vec2.distSq(b, myPos)
            )
            return collector[0]
        }

        const verts: Vec2Like[] = []
        verts.push(Vec2.zero())
        for (const p of points) {
            const int = nearestIntersection(p)
            if (int) {
                // Convert the intersection point to local unscaled space
                const lint = Vec2.scale(
                    Vec2.untransformDeg(int, myPos, myAngle),
                    1 / PHYSICS_SCALE
                )
                verts.push(lint)
                const d = p.dist / PHYSICS_SCALE
                if (this.value === -1 || d < this.value) {
                    this._value = d
                    detected = true
                    //this.targetSpec.brush.visible = true
                }
            }
        }

        // Hitting the backstop doesn't count as a reading
        if (this.value >= this.spec.maxRange * PHYSICS_SCALE * 0.99) {
            detected = false
        }

        // Update the visual representation of the sensor sweep
        const newSpec = {
            ...this.visualSpec,
            verts,
            brush: {
                ...(detected
                    ? this.spec.brush.positive
                    : this.spec.brush.negative),
                visible: this.used,
            },
        }

        const sensorShape = this.bot.entity.renderObj.shapes.get(
            this.sensorId + ".visual"
        )
        if (sensorShape) {
            const newGfx = createGraphics[newSpec.type][newSpec.brush.type](
                newSpec,
                newSpec.brush
            )
            sensorShape.setGfx(newGfx)
        }
    }

    public setUsed(used: boolean) {
        this.used = used;
    }
}

type ContactPointBase = {
    p: Vec2Like
    dir: Vec2Like // Normalized direction vector from bot to point
    angle: number // Angle of direction vector, relative to bot's forward
    dist: number // Distance from bot to point
}

type ContactPoint = ContactPointBase & {
    // When set, this point was clipped to the edge of the sensor cone. This is
    // used for determining whether to sample just beyond the point or not.
    clipped?: ContactPoint
}

type ContactEdge = {
    c0: ContactPoint
    c1: ContactPoint
    perp: Vec2Like // Normalized vector perpendicular to the edge
    dir: Vec2Like // Normalized direction of the edge
}
