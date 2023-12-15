import { BotSpec, ChassisSpec } from "../../bots/specs"
import {
    BoxShapeSpec,
    BrushSpec,
    CircleShapeSpec,
    EntityShapeSpec,
    defaultBoxShape,
    defaultCircleShape,
    defaultColorBrush,
    defaultEntityShape,
    defaultShapePhysics,
} from "../specs"
import { Bot } from "."
import { hslToRgb, numberToRgb, rgbToHsl, rgbToString } from "../util"
import { createGraphics } from "../renderer"
import { clamp } from "../../util"

const chassisBrush: BrushSpec = {
    ...defaultColorBrush(),
    fillColor: "#11B5E499",
    borderColor: "#555555",
}

export class Chassis {
    public static makeShapeSpec(botSpec: BotSpec): EntityShapeSpec {
        const chassisSpec = botSpec.chassis
        let chassisShape: CircleShapeSpec | BoxShapeSpec
        switch (chassisSpec.shape) {
            case "circle":
                chassisShape = {
                    ...defaultCircleShape(),
                    radius: chassisSpec.radius,
                }
                break
            case "box":
                chassisShape = {
                    ...defaultBoxShape(),
                    size: chassisSpec.size,
                }
                break
            default:
                throw new Error("Unknown chassis type")
        }
        return {
            ...defaultEntityShape(),
            ...chassisShape,
            label: "chassis",
            roles: ["mouse-target", "robot"],
            brush: {
                ...chassisBrush,
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

    public update(dtSecs: number) {}

    public setColor(color: number) {
        if (this.cachedColor === color) return
        this.cachedColor = color
        // This is the worst way possible to change the color. works for now. don't do this.
        const renderShape = this.bot.entity.renderObj.shapes.get("chassis")
        const newSpec = Chassis.makeShapeSpec(this.bot.spec)
        const newBrush = newSpec.brush
        if (newBrush.type === "color") {
            let rgb = numberToRgb(color)
            // Brighten the color a little bit
            let hsl = rgbToHsl(rgb)
            hsl.l = clamp(hsl.l * 1.2, 0, 255)
            rgb = hslToRgb(hsl)
            const c = rgbToString(rgb)
            const alpha = "99"
            newBrush.fillColor = c + alpha
        }
        const newGfx = createGraphics[newSpec.type][newSpec.brush.type](
            newSpec,
            newSpec.brush
        )
        renderShape?.setGfx(newGfx)
    }
}
