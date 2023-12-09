import { Bot } from "."
import { RangeSensorSpec } from "../../bots/specs"
import { Vec2 } from "../../types/vec2"
import {
    EntityShapeSpec,
    defaultCircleShape,
    defaultColorBrush,
    defaultEntityShape,
    defaultPolygonShape,
    defaultShapePhysics,
} from "../specs"

export class RangeSensor {
    _sensorShapeSpec!: EntityShapeSpec
    _targetShapeSpec!: EntityShapeSpec
    _value: number

    public get sensorShapeSpec() {
        return this._sensorShapeSpec
    }
    public get targetShapeSpec() {
        return this._targetShapeSpec
    }
    public get shapeSpecs() {
        return [this._sensorShapeSpec, this._targetShapeSpec]
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
        // The shape of the range sensor area
        this._sensorShapeSpec = {
            ...defaultEntityShape(),
            ...defaultPolygonShape(),
            label: "range-sensor",
            offset: spec.pos,
            verts: [{ x: 0, y: 0 }, leftEdge, rightEdge],
            physics: {
                ...defaultShapePhysics(),
                sensor: true, // don't collide with anything (but still reports collisions)
                density: 0,
            },
            brush: {
                ...spec.brush,
                zIndex: 5,
            },
        }
        // A marker to place on the point of nearest range, if any
        this._targetShapeSpec = {
            ...defaultEntityShape(),
            ...defaultCircleShape(),
            label: "range-target",
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
        this.constructShapeSpecs(spec)
        this._value = -1
    }

    public destroy() {}

    public update(dtSecs: number) {
        this._value = -1
        for (
            let ce = this.bot.entity.physicsObj.body.getContactList();
            ce;
            ce = ce.next ?? null
        ) {
        }
    }
}
