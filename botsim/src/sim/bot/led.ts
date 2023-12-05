import { Bot } from "."
import { BotSpec, ChassisShapeSpec, LEDSpec } from "../../bots/specs"
import { EntityShapeSpec, defaultCircleShape, defaultColorBrush, defaultEntityShape, defaultShapePhysics } from "../specs";

export class LED {
    public static makeShapeSpec(bot: BotSpec, ledSpec: LEDSpec): EntityShapeSpec {

        if (ledSpec.name === "general") {
            const shape: ChassisShapeSpec = {
                ...bot.chassis.shape
            };
            if (shape.type === "circle" && bot.chassis.shape.type === "circle") {
                shape.radius = bot.chassis.shape.radius * 1.5;
            }
            const shapeSpec: EntityShapeSpec = {
                ...defaultEntityShape(),
                ...shape,
                physics: {
                    ...defaultShapePhysics(),
                    sensor: true, // Don't collide with anything
                },
                brush: {
                    ...defaultColorBrush()
                }
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

    private color: number = 0;

    constructor(
        private bot: Bot,
        private spec: LEDSpec
    ) {}

    public destroy() {}

    public beforePhysicsStep(dtSecs: number) {}

    public update(dtSecs: number) { }
    
    public setColor(color: number) {
        if (color === this.color) return;
        this.color = color;
        this.rebuildBrush();
    }

    private rebuildBrush() {
    }
}
