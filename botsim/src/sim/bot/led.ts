import { Bot } from "."
import { BotSpec, LEDSpec } from "../../bots/specs"
import { Vec2 } from "../../types/vec2"
import {
    EntityShapeSpec,
    defaultCircleShape,
    defaultColorBrush,
    defaultEntityShape,
    defaultShapePhysics,
} from "../specs"

export class LED {
    public static makeShapeSpec(
        bot: BotSpec,
        ledSpec: LEDSpec
    ): EntityShapeSpec {
        if (ledSpec.name === "general") {
            let radius = 0
            if (bot.chassis.shape === "circle") {
                radius = bot.chassis.radius * 2
            } else if (bot.chassis.shape === "box") {
                radius = 1.5 * Vec2.len(bot.chassis.size)
            }
            const shapeSpec: EntityShapeSpec = {
                ...defaultEntityShape(),
                ...defaultCircleShape(),
                radius,
                physics: {
                    ...defaultShapePhysics(),
                    sensor: true, // Don't collide with anything
                },
                brush: {
                    ...defaultColorBrush(),
                    fillColor: "00FF0044",
                    borderColor: "transparent",
                    borderWidth: 0,
                    zIndex: 1,
                },
            }
            return shapeSpec
        } else {
            // Not fully implemented yet
            const shapeSpec: EntityShapeSpec = {
                ...defaultEntityShape(),
                ...defaultCircleShape(),
                offset: ledSpec.pos,
                radius: ledSpec.radius,
            }
            return shapeSpec
        }
    }

    private color: number = 0

    constructor(
        private bot: Bot,
        private spec: LEDSpec
    ) {}

    public destroy() {}

    public update(dtSecs: number) {}

    public setColor(color: number) {
        if (color === this.color) return
        this.color = color
        this.rebuildBrush()
    }

    private rebuildBrush() {}
}
