import { Bot } from "."
import { BotSpec, LineSensorSpec } from "../../bots/specs"
import {
    EntityShapeSpec,
    defaultCircleShape,
    defaultColorBrush,
    defaultEntityShape,
    defaultShapePhysics,
} from "../../maps/specs"
import { PHYS_CAT_ROBOT } from "../constants"
import { makeCategoryBits, makeMaskBits } from "../util"

export class LineSensor {
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
            label: "line." + spec.name + ".on",
            offset: spec.pos,
            radius: 0.5,
            brush: {
                ...spec.brush.on,
                visible: false,
                zIndex: 1,
            },
            physics: {
                ...defaultShapePhysics(),
                friction: 0,
                restitution: 0,
                density: 0,
                sensor: true,
                categoryBits: makeCategoryBits(PHYS_CAT_ROBOT),
                maskBits: makeMaskBits(PHYS_CAT_ROBOT),
            },
        }
        const offLineSpec: EntityShapeSpec = {
            ...defaultEntityShape(),
            ...defaultCircleShape(),
            label: "line." + spec.name + ".off",
            offset: spec.pos,
            radius: 0.5,
            brush: {
                ...spec.brush.off,
                visible: true,
                zIndex: 1,
            },
            physics: {
                ...defaultShapePhysics(),
                friction: 0,
                restitution: 0,
                density: 0,
                sensor: true,
                categoryBits: makeCategoryBits(PHYS_CAT_ROBOT),
                maskBits: makeMaskBits(PHYS_CAT_ROBOT),
            },
        }
        // The actual sensor (very small)
        const sensorSpec: EntityShapeSpec = {
            ...defaultEntityShape(),
            ...defaultCircleShape(),
            label: "line." + spec.name + ".sensor",
            offset: spec.pos,
            radius: 0.1,
            roles: ["line-sensor"],
            brush: {
                ...defaultColorBrush(),
                fillColor: "transparent",
                borderColor: "transparent",
                borderWidth: 0,
                zIndex: 2,
            },
            physics: {
                ...defaultShapePhysics(),
                friction: 0,
                restitution: 0,
                density: 0,
                sensor: true,
                categoryBits: makeCategoryBits(PHYS_CAT_ROBOT),
                maskBits: makeMaskBits(PHYS_CAT_ROBOT),
            },
        }
        return [onLineSpec, offLineSpec, sensorSpec]
    }

    constructor(
        private bot: Bot,
        private spec: LineSensorSpec
    ) {
        this._shapeSpecs = this.makeShapeSpecs(spec)
        this._value = 0
    }

    public destroy() {}

    public beforePhysicsStep(dtSecs: number) {}

    public update(dtSecs: number) {
        this.setDetecting(false)
        for (
            let ce = this.bot.entity.physicsObj.body.getContactList();
            ce;
            ce = ce.next ?? null
        ) {
            // TODO: Support multiple bots in the scene. As implemented, this
            // doesn't work in that scenario.
            // TODO: Handle contacts from a single contact listener instead of embedded in components.
            const contact = ce.contact
            const fixtureA = contact.getFixtureA()
            const fixtureB = contact.getFixtureB()
            const userDataA = fixtureA.getUserData() as EntityShapeSpec
            const userDataB = fixtureB.getUserData() as EntityShapeSpec
            if (userDataA && userDataB) {
                const labelA = userDataA.label
                const labelB = userDataB.label
                if (!labelA || !labelB) continue
                const rolesA = userDataA.roles
                const rolesB = userDataB.roles
                if (labelA === "line." + this.spec.name + ".sensor") {
                    if (rolesB.includes("follow-line")) {
                        this.setDetecting(true)
                    }
                } else if (labelB === "line." + this.spec.name + ".sensor") {
                    if (rolesA.includes("follow-line")) {
                        this.setDetecting(true)
                    }
                }
            }
        }
    }

    public setDetecting(detecting: boolean) {
        this._value = detecting ? 1023 : 0
        const onShape = this.bot.entity.renderObj.shapes.get(
            "line." + this.spec.name + ".on"
        )
        const offShape = this.bot.entity.renderObj.shapes.get(
            "line." + this.spec.name + ".off"
        )
        if (onShape) onShape.visible = detecting
        if (offShape) offShape.visible = !detecting
    }
}
