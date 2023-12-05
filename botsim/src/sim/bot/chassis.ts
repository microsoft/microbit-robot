import { BotSpec, ChassisSpec } from "../../bots/specs"
import {
    EntityShapeSpec,
    defaultEntityShape,
    defaultShapePhysics,
} from "../specs"
import { Bot } from "."
import { hslToRgb, lighten, numberToRgb, rgbToHsl, rgbToString } from "../util"
import { createGraphics } from "../renderer"
import { clamp } from "../../util"

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
            let rgb = numberToRgb(color)
            let hsl = rgbToHsl(rgb)
            hsl.l = clamp(hsl.l * 1.2, 0, 255)
            rgb = hslToRgb(hsl)
            const c = rgbToString(rgb)
            newBrush.fillColor = c + "99"
        }
        const newGfx = createGraphics[newSpec.type][newSpec.brush.type](
            newSpec,
            newSpec.brush
        )
        renderShape?.setGfx(newGfx)
    }
}
