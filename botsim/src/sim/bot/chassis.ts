import { BotSpec, ChassisSpec } from "../../bots/specs"
import {
    EntityShapeSpec,
    defaultEntityShape,
    defaultShapePhysics,
} from "../specs"
import { Bot } from "."
import { numberToRgb, rgbToString } from "../util"
import { createGraphics } from "../renderer"

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
                zIndex: 5,
            },
            physics: {
                ...defaultShapePhysics(),
                friction: 0.3,
                restitution: 0.9,
                density: 0.1,
            },
        }
    }

    public get spec() {
        return this._spec
    }

    private cachedColor: number = -2

    constructor(
        private bot: Bot,
        private _spec: ChassisSpec
    ) {}

    public destroy() {}

    public beforePhysicsStep(dtSecs: number) {}

    public update(dtSecs: number) {}

    public setColor(color: number) {
        if (this.cachedColor === color) return
        this.cachedColor = color
        // this is the worst way possible to change the color. works for now. don't do this.
        const renderShape = this.bot.entity.renderObj.shapes.get("chassis")
        const newSpec = Chassis.makeShapeSpec(this.bot.spec)
        const newBrush = newSpec.brush
        if (newBrush.type === "color") {
            const c = rgbToString(numberToRgb(color))
            newBrush.fillColor = c + "99"
        }
        const newGfx = createGraphics[newSpec.type][newSpec.brush.type](
            newSpec,
            newSpec.brush
        )
        renderShape?.setGfx(newGfx)
    }
}
