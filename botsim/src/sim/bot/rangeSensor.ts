import { Bot } from "."
import { RangeSensorSpec } from "../../bots/specs"
import { Vec2 } from "../../types/vec2"
import { nextId } from "../../util"
import {
    EntityShapeSpec,
    defaultCircleShape,
    defaultColorBrush,
    defaultEntityShape,
    defaultPolygonShape,
    defaultShapePhysics,
} from "../specs"
import Planck from "planck-js"

export class RangeSensor {
    sensorId: string
    coneSpec!: EntityShapeSpec
    visualSpec!: EntityShapeSpec
    targetSpec!: EntityShapeSpec
    _value: number

    public get shapeSpecs() {
        return [this.coneSpec, this.visualSpec, this.targetSpec]
    }
    public get value(): number {
        return this._value
    }

    private constructShapeSpecs(spec: RangeSensorSpec) {
        const leftEdge = Vec2.rotateDeg(
            { x: 0, y: -spec.maxRange },
            -spec.beamAngle / 2
        )
        const rightEdge = Vec2.rotateDeg(
            { x: 0, y: -spec.maxRange },
            spec.beamAngle / 2
        )
        // The shape of the sensor area, for collision detection
        this.coneSpec = {
            ...defaultEntityShape(),
            ...defaultPolygonShape(),
            label: this.sensorId + ".cone",
            offset: spec.pos,
            verts: [{ x: 0, y: 0 }, leftEdge, rightEdge],
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
            offset: spec.pos,
            verts: [{ x: 0, y: 0 }, leftEdge, rightEdge],
            physics: {
                ...defaultShapePhysics(),
                sensor: true, // don't collide with anything
                density: 0,
            },
            brush: {
                ...spec.brush,
                zIndex: 5,
            },
        }
        // A marker to place on the point of nearest range, if any
        this.targetSpec = {
            ...defaultEntityShape(),
            ...defaultCircleShape(),
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
        this.constructShapeSpecs(spec)
        this._value = -1
    }

    public destroy() {}

    public update(dtSecs: number) {
        this._value = -1
        const collidingBodies: Planck.Fixture[] = []
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
            if (labelA === this.coneSpec.label && rolesB.includes("obstacle")) {
                collidingBodies.push(fixtureB)
            } else if (
                labelB === this.coneSpec.label &&
                rolesA.includes("obstacle")
            ) {
                collidingBodies.push(fixtureA)
            }
        }
        let ford = 0
    }
}
