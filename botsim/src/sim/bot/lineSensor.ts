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
import Planck from "planck-js"

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
        const visualSpec: EntityShapeSpec = {
            ...defaultEntityShape(),
            ...defaultCircleShape(),
            label: spec.label,
            offset: spec.pos,
            radius: 0.25,
            brush: {
                ...spec.brush,
                zIndex: 1,
            },
            physics: {
                ...defaultShapePhysics(),
                friction: 0,
                restitution: 0,
                density: 0.001,
                sensor: true,
                categoryBits: makeCategoryBits(PHYS_CAT_ROBOT),
                maskBits: makeMaskBits(PHYS_CAT_ROBOT),
            },
        }
        const sensorSpec: EntityShapeSpec = {
            ...defaultEntityShape(),
            ...defaultCircleShape(),
            label: "line." + spec.label + ".sensor",
            offset: spec.pos,
            radius: 0.1,
            brush: {
                ...defaultColorBrush(),
                fillColor: "transparent",
                borderColor: "transparent",
                borderWidth: 0,
            },
            physics: {
                ...defaultShapePhysics(),
                friction: 0,
                restitution: 0,
                density: 0.001,
                sensor: true,
                categoryBits: makeCategoryBits(PHYS_CAT_ROBOT),
                maskBits: makeMaskBits(PHYS_CAT_ROBOT),
            },
        }
        return [visualSpec, sensorSpec]
    }

    constructor(
        private bot: Bot,
        private spec: LineSensorSpec
    ) {
        this._shapeSpecs = this.makeShapeSpecs(spec)
        this._value = 0
    }

    public init() {
        this.bot.entity.physicsObj.body
            .getWorld()
            .on("begin-contact", this.contactStart)
        this.bot.entity.physicsObj.body
            .getWorld()
            .on("end-contact", this.contactEnd)
    }

    public destroy() {}

    public beforePhysicsStep(dtSecs: number) {}

    public update(dtSecs: number) {}

    contactStart = (contact: Planck.Contact) => {
        const fixtureA = contact.getFixtureA()
        const fixtureB = contact.getFixtureB()
        const userDataA = fixtureA.getUserData() as EntityShapeSpec
        const userDataB = fixtureB.getUserData() as EntityShapeSpec
        if (userDataA && userDataB) {
            const labelA = userDataA.label
            const labelB = userDataB.label
            //console.log("contactStart", labelA, labelB)
            if (labelA === "line." + this.spec.label + ".sensor") {
                if (labelB?.startsWith("path.")) {
                    this._value = 1023
                }
            } else if (labelB === "line." + this.spec.label + ".sensor") {
                if (labelA?.startsWith("path.")) {
                    this._value = 1023
                }
            }
        }
    }
    contactEnd = (contact: Planck.Contact) => {
        const fixtureA = contact.getFixtureA()
        const fixtureB = contact.getFixtureB()
        const userDataA = fixtureA.getUserData() as EntityShapeSpec
        const userDataB = fixtureB.getUserData() as EntityShapeSpec
        if (userDataA && userDataB) {
            const labelA = userDataA.label
            const labelB = userDataB.label
            //console.log("contactStart", labelA, labelB)
            if (labelA === "line." + this.spec.label + ".sensor") {
                if (labelB?.startsWith("path.")) {
                    this._value = 0
                }
            } else if (labelB === "line." + this.spec.label + ".sensor") {
                if (labelA?.startsWith("path.")) {
                    this._value = 0
                }
            }
        }
    }
}
