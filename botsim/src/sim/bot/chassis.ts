import { BotSpec, ChassisSpec } from "../../bots/specs"
import {
    BoxShapeSpec,
    BrushSpec,
    CircleShapeSpec,
    EntityShapeSpec,
    PolygonShapeSpec,
    defaultBoxShape,
    defaultCircleShape,
    defaultColorBrush,
    defaultTextureBrush,
    defaultEntityShape,
    defaultPolygonShape,
    defaultShapePhysics,
} from "../specs"
import { Bot } from "."
import {
    hslToRgb,
    numberToRgb,
    rgbToFloatArray,
    rgbToHsl,
    rgbToString,
} from "../util"
import { createGraphics } from "../renderer"
import { clamp } from "../../util"
import * as Pixi from "pixi.js"

export class Chassis {
    public static makeShapeSpec(botSpec: BotSpec): EntityShapeSpec {
        const chassisSpec = botSpec.chassis
        const chassisColorBrush: BrushSpec = {
            ...defaultColorBrush(),
            fillColor: "#11B5E4" + "C0",
            borderColor: "#555555",
            zIndex: 5,
        }
        const chassisTextureBrush: BrushSpec = {
            ...defaultTextureBrush(),
            texture: chassisSpec.texture!,
            color: "#FFFFFF",
            alpha: 0.75,
            zIndex: 5,
        }

        let chassisShape: CircleShapeSpec | BoxShapeSpec | PolygonShapeSpec
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
            case "polygon":
                chassisShape = {
                    ...defaultPolygonShape(),
                    verts: chassisSpec.verts,
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
            brush: chassisSpec.texture
                ? chassisTextureBrush
                : chassisColorBrush,
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
        // TODO: Add API to brush to change color

        if (this.cachedColor === color) return
        this.cachedColor = color
        let rgb = numberToRgb(color)
        // Brighten the color a little bit
        let hsl = rgbToHsl(rgb)
        hsl.l = clamp(hsl.l * 1.2, 0, 255)
        rgb = hslToRgb(hsl)
        // This is the worst way possible to change the color. works for now. don't do this.
        const renderShape = this.bot.entity.renderObj.shapes.get("chassis")
        const newSpec = Chassis.makeShapeSpec(this.bot.spec)
        const newBrush = newSpec.brush
        if (newBrush.type === "color") {
            const c = rgbToString(rgb)
            const alpha = "99"
            newBrush.fillColor = c + alpha
            const newGfx = createGraphics[newSpec.type][newSpec.brush.type](
                newSpec,
                newSpec.brush
            )
            renderShape?.setGfx(newGfx)
        } else if (newBrush.type === "texture") {
            if ((renderShape?.gfx as any).shader) {
                const shader = (renderShape?.gfx as any).shader as Pixi.Shader
                shader.uniforms.uColor = rgbToFloatArray(rgb)
            }
        }
    }
}
