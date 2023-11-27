import { BotSpec, ChassisSpec } from "../../bots/specs"
import {
    EntityShapeSpec,
    defaultEntityShape,
    defaultShapePhysics,
} from "../../maps/specs"
import { PHYS_CAT_ROBOT } from "../constants"
import { makeCategoryBits, makeMaskBits } from "../util"
import { Bot } from "."
import { Vec2 } from "../../types/vec2"
import Planck from "planck-js"

export class Chassis {
    public static makeShapeSpec(botSpec: BotSpec): EntityShapeSpec {
        const chassisSpec = botSpec.chassis
        return {
            ...defaultEntityShape(),
            ...chassisSpec.shape,
            label: "chassis",
            brush: {
                ...chassisSpec.brush,
                zIndex: 1,
            },
            physics: {
                ...defaultShapePhysics(),
                friction: 0.001,
                restitution: 1,
                density: 0.01,
                categoryBits: makeCategoryBits(PHYS_CAT_ROBOT),
                maskBits: makeMaskBits(PHYS_CAT_ROBOT),
            },
        }
    }

    constructor(
        private bot: Bot,
        private spec: ChassisSpec
    ) {
        const frict = this.bot.entity.physicsObj.addFrictionJoint(Vec2.zero())
        frict?.setMaxForce(1000)
    }

    public destroy() {}

    public beforePhysicsStep(dtSecs: number) {}

    public update(dtSecs: number) {}
}
