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

export class Chassis {
    public static makeShapeSpec(botSpec: BotSpec): EntityShapeSpec {
        const chassisSpec = botSpec.chassis
        return {
            ...defaultEntityShape(),
            ...chassisSpec.shape,
            label: "chassis",
            roles: ["mouse-target"],
            brush: {
                ...chassisSpec.brush,
                zIndex: 1,
            },
            physics: {
                ...defaultShapePhysics(),
                friction: 0.3,
                restitution: 0.9,
                density: 0.1,
                categoryBits: makeCategoryBits(PHYS_CAT_ROBOT),
                maskBits: makeMaskBits(PHYS_CAT_ROBOT),
            },
        }
    }

    constructor(
        private bot: Bot,
        private spec: ChassisSpec
    ) {
        //const frict = this.bot.entity.physicsObj.addFrictionJoint(Vec2.zero())
        //frict?.setMaxForce(10)
    }

    public destroy() {}

    public beforePhysicsStep(dtSecs: number) {}

    public update(dtSecs: number) {}
}
