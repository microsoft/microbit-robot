import { Bot } from "."
import { RangeSensorSpec } from "../../bots/specs"
import { Vec2, Vec2Like } from "../../types/vec2"
import { nextId, toRadians } from "../../util"
import {
    BrushSpec,
    EntityShapeSpec,
    defaultCircleShape,
    defaultColorBrush,
    defaultEntityShape,
    defaultPolygonShape,
    defaultShaderBrush,
    defaultShapePhysics,
} from "../specs"
import Planck from "planck-js"
import {
    appoximateArc,
    pointInPolygon,
    rgbToFloatArray,
    testOverlap,
    toRenderScale,
} from "../util"
import { LineSegment } from "../../types/line"
import * as Pixi from "pixi.js"
import { RENDER_SCALE } from "../../constants"
import {
    BasicVertexShader,
    CommonFragmentShaderGlobals,
    addShaderProgram,
} from "../renderer"

const SENSOR_WIDTH = 4 // cm
const SENSOR_HALF_WIDTH = SENSOR_WIDTH / 2

//const beamColor = "#68aed420"
const beamColor = {
    r: 0x68,
    g: 0xae,
    b: 0xd4,
}
//const targetColor = "#212738"
//const targetColor = "#1c4a62"
const targetColor = "#FF5733"
//const targetColor = "#33FF00"

const targetBrush: BrushSpec = {
    ...defaultColorBrush(),
    fillColor: "transparent",
    borderColor: targetColor,
    borderWidth: 0.5,
    zIndex: 6,
}

addShaderProgram(
    "sonar_wave",
    BasicVertexShader,
    CommonFragmentShaderGlobals +
        `
    uniform vec3 uColor;
    uniform float uMaxRange;
    uniform float uBeamAngle;

    float dist(vec2 p0, vec2 p1) {
        return sqrt(pow(p1.x - p0.x, 2.) + pow(p1.y - p0.y, 2.));
    }
    float angle(vec2 p0, vec2 p1) {
        return atan(p1.y - p0.y, p1.x - p0.x) + 1.57;
    }

    void main() {
        vec2 uv = vUvs;
        uv = vec2(uv.x * uAspectRatio, uv.y);
        vec2 ofs = vec2(0.265, 1.1); // hand-tuned to appear to emanate from the sensor
        float maxRange = uMaxRange + ofs.y;
        float maxAngle = uBeamAngle / 2.;
        float d = dist(ofs, uv);
        float c = mod(uTime * 8. - d * 22., 1.);
        c = 1. - c;
        c = c * c;
        c = .2 + c * .66;
        float alpha = c * .75;
        float linFade = 1. - smoothstep(0., 1., d - 0.33);
        float angFade = 1. - smoothstep(0., 1., abs(angle(ofs, uv) * 0.65) / maxAngle);
        alpha *= linFade * angFade;
        gl_FragColor = vec4(uColor * alpha, alpha);
    }`
)

export class RangeSensor {
    sensorId: string
    coneSpec!: EntityShapeSpec
    visualSpec!: EntityShapeSpec
    targetSpec!: EntityShapeSpec
    _value: number
    used: boolean = false
    sensorVerts!: Vec2Like[]
    sensorEdges!: LineSegment[]

    public get shapeSpecs() {
        return [this.coneSpec, this.visualSpec, this.targetSpec]
    }
    public get value(): number {
        return this._value
    }
    public setUsed(used: boolean) {
        this.used = used
    }

    private constructShapeSpecs() {
        const pLeftNear = Vec2.like(-SENSOR_HALF_WIDTH, 0)
        const pRightNear = Vec2.like(SENSOR_HALF_WIDTH, 0)
        const pLeftFar = Vec2.rotateDeg(
            Vec2.add(pLeftNear, Vec2.like(0, -this.spec.maxRange)),
            -this.spec.beamAngle / 2
        )
        const pRightFar = Vec2.rotateDeg(
            Vec2.add(pRightNear, Vec2.like(0, -this.spec.maxRange)),
            this.spec.beamAngle / 2
        )
        const arcVerts = appoximateArc(
            Vec2.like(0, 0),
            this.spec.maxRange,
            -this.spec.beamAngle / 2 - 90,
            this.spec.beamAngle / 2 - 90,
            4
        )
        this.sensorVerts = [
            pLeftNear,
            pRightNear,
            pRightFar,
            ...arcVerts.reverse(),
            pLeftFar,
            pLeftNear
        ]
        this.sensorEdges = []
        for (let i = 1; i < this.sensorVerts.length; ++i) {
            this.sensorEdges.push(
                LineSegment.like(this.sensorVerts[i - 1], this.sensorVerts[i])
            )
        }

        // The shape of the sensor area, for collision detection
        this.coneSpec = {
            ...defaultEntityShape(),
            ...defaultPolygonShape(),
            label: this.sensorId + ".cone",
            offset: this.spec.pos,
            verts: this.sensorVerts,
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
            verts: this.sensorVerts,
            physics: {
                ...defaultShapePhysics(),
                sensor: true, // don't collide with anything
                density: 0,
            },
            brush: {
                ...defaultShaderBrush(),
                shader: "sonar_wave",
                uniforms: {
                    uColor: rgbToFloatArray(beamColor),
                    uMaxRange: toRenderScale(this.spec.maxRange),
                    uBeamAngle: toRadians(this.spec.beamAngle),
                },
                visible: false,
                zIndex: 5,
            },
        }
        // A marker to place on the point of nearest range, if any
        this.targetSpec = {
            ...defaultEntityShape(),
            ...defaultCircleShape(),
            label: this.sensorId + ".target",
            radius: 1.5,
            physics: {
                ...defaultShapePhysics(),
                sensor: true, // don't collide with anything
                density: 0,
            },
            brush: {
                ...targetBrush,
                visible: false,
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
        const sensorRenderable = this.bot.entity.renderObj.shapes.get(
            this.sensorId + ".visual"
        )
        if (sensorRenderable) {
            sensorRenderable.visible = this.used
        }
        this._value = this.spec.maxRange
        if (!this.used) return

        // Bot position in world space
        const botPos = this.bot.pos
        // Sensor position and angle in world space
        const sensorAngle = this.bot.angle
        const sensorPos = Vec2.transformDeg(
            this.visualSpec.offset,
            botPos,
            sensorAngle
        )
        const overlaps: Planck.Fixture[] = []
        const detectedVerts: Vec2Like[] = []

        // Transform the sensor cone to world space
        const sensorVerts = this.sensorVerts.map((v) =>
            Vec2.transformDeg(v, sensorPos, sensorAngle)
        )
        const sensorEdges = this.sensorEdges.map((e) =>
            LineSegment.transformDeg(e, sensorPos, sensorAngle)
        )

        // Returns true if `roles` contains a value we should consider an
        // obstacle
        const isObstacle = (roles: string[]) =>
            roles.includes("obstacle") || roles.includes("robot")
        // Returns true if the fixture is part of the bot's own body
        const isMe = (fixture: Planck.Fixture) =>
            fixture.getBody() === this.bot.entity.physicsObj.body

        // Collect vertices from edges that intersect the sensor cone, clipping if needed
        const ingestEdge = (p0: Vec2Like, p1: Vec2Like) => {
            const p0Inside = pointInPolygon(p0, sensorVerts)
            const p1Inside = pointInPolygon(p1, sensorVerts)
            if (p0Inside) {
                detectedVerts.push(p0)
            }
            if (p1Inside) {
                detectedVerts.push(p1)
            }
            const isects = LineSegment.intersectionAll({ p0, p1 }, sensorEdges)
            isects.forEach((isect) => {
                if (isect.type === "point") {
                    detectedVerts.push(isect.p)
                }
            })
        }
        const ingestVerts = (verts: Vec2Like[], closed: boolean) => {
            if (verts.length < 2) return
            // NOTE: verts are assumed to be:
            // - in world space
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
        // For each overlapping shape, get the set of line segments that overlap
        // the sensor cone.
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
                    // Build a set of contact verts from this polygon's edges
                    ingestVerts(verts, true)
                    break
                }
                default:
                    break
            }
        }

        // Find the nearest detected point
        detectedVerts.sort((a, b) => {
            const aLen = Vec2.lenSq(Vec2.sub(a, sensorPos))
            const bLen = Vec2.lenSq(Vec2.sub(b, sensorPos))
            return aLen - bLen
        })
        const nearest = detectedVerts.shift()

        if (nearest) {
            this._value = Vec2.len(Vec2.sub(nearest, sensorPos))
        }

        // Update the target marker
        const targetRenderable = this.bot.entity.renderObj.shapes.get(
            this.sensorId + ".target"
        )
        if (targetRenderable) {
            if (nearest) {
                const pt = Vec2.scale(
                    Vec2.untransformDeg(nearest, botPos, sensorAngle),
                    RENDER_SCALE
                )
                const newGfx = new Pixi.Graphics()
                newGfx.lineStyle({
                    width: toRenderScale(0.5),
                    color: targetColor + "A0",
                    alignment: 0.5,
                })
                newGfx.drawCircle(pt.x, pt.y, toRenderScale(1))
                newGfx.zIndex = 6
                targetRenderable.setGfx(newGfx as any)
                targetRenderable.visible = true
            } else {
                targetRenderable.visible = false
            }
        }
    }
}
