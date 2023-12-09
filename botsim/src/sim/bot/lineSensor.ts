import { Bot } from "."
import { BotSpec, LineSensorSpec } from "../../bots/specs"
import { nextId } from "../../util"
import {
    EntityShapeSpec,
    defaultCircleShape,
    defaultColorBrush,
    defaultEntityShape,
    defaultShapePhysics,
} from "../specs"
import Planck from "planck-js"

const testOverlap = Planck.internal.Distance.testOverlap

export class LineSensor {
    sensorId: string
    _shapeSpecs: EntityShapeSpec[]
    _value: number

    public get shapeSpecs(): EntityShapeSpec[] {
        return this._shapeSpecs
    }
    public get value(): number {
        return this._value
    }

    private makeShapeSpecs(spec: LineSensorSpec): EntityShapeSpec[] {
        // The visual representation of the sensor (larger than actual size)
        const onLineSpec: EntityShapeSpec = {
            ...defaultEntityShape(),
            ...defaultCircleShape(),
            label: this.sensorId + ".on",
            offset: spec.pos,
            radius: 0.5,
            brush: {
                ...spec.brush.on,
                visible: false,
                zIndex: 6,
            },
            physics: {
                ...defaultShapePhysics(),
                friction: 0,
                restitution: 0,
                density: 0,
                sensor: true,
            },
        }
        const offLineSpec: EntityShapeSpec = {
            ...defaultEntityShape(),
            ...defaultCircleShape(),
            label: this.sensorId + ".off",
            offset: spec.pos,
            radius: 0.5,
            brush: {
                ...spec.brush.off,
                visible: true,
                zIndex: 6,
            },
            physics: {
                ...defaultShapePhysics(),
                friction: 0,
                restitution: 0,
                density: 0,
                sensor: true,
            },
        }
        // The actual sensor (very small)
        const sensorSpec: EntityShapeSpec = {
            ...defaultEntityShape(),
            ...defaultCircleShape(),
            label: this.sensorId + ".sensor",
            offset: spec.pos,
            radius: 0.1,
            roles: ["line-sensor"],
            brush: {
                ...defaultColorBrush(),
                fillColor: "transparent",
                borderColor: "transparent",
                borderWidth: 0,
                zIndex: 1,
            },
            physics: {
                ...defaultShapePhysics(),
                friction: 0,
                restitution: 0,
                density: 0,
                sensor: true,
            },
        }
        return [onLineSpec, offLineSpec, sensorSpec]
    }

    constructor(
        private bot: Bot,
        private spec: LineSensorSpec
    ) {
        this.sensorId = "line-sensor." + nextId()
        this._shapeSpecs = this.makeShapeSpecs(spec)
        this._value = 0
    }

    public destroy() {}

    public update(dtSecs: number) {
        this.setDetecting(false)
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
            if (
                labelA === this.sensorId + ".sensor" &&
                rolesB.includes("follow-line")
            ) {
                const overlap = testOverlap(
                    fixtureA.getShape(),
                    0,
                    fixtureB.getShape(),
                    0,
                    fixtureA.getBody().getTransform(),
                    fixtureB.getBody().getTransform()
                )
                if (overlap) {
                    this.setDetecting(true)
                }
            } else if (
                labelB === this.sensorId + ".sensor" &&
                rolesA.includes("follow-line")
            ) {
                const overlap = testOverlap(
                    fixtureA.getShape(),
                    0,
                    fixtureB.getShape(),
                    0,
                    fixtureA.getBody().getTransform(),
                    fixtureB.getBody().getTransform()
                )
                if (overlap) {
                    this.setDetecting(true)
                }
            }
        }
    }

    public setDetecting(detecting: boolean) {
        this._value = detecting ? 1023 : 0
        const onShape = this.bot.entity.renderObj.shapes.get(
            this.sensorId + ".on"
        )
        const offShape = this.bot.entity.renderObj.shapes.get(
            this.sensorId + ".off"
        )
        if (onShape) onShape.visible = detecting
        if (offShape) offShape.visible = !detecting
    }
}
