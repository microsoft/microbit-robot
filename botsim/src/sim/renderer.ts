import * as Pixi from "pixi.js"
import { boxToVertices, toColor, toCm } from "./util"
import { Simulation } from "."
import { Vec2, Vec2Like } from "../types/vec2"
import {
    EntitySpec,
    BrushSpec,
    ColorBrushSpec,
    TextureBrushSpec,
    PatternBrushSpec,
    ShapeType,
    BrushType,
    EntityShapeSpec,
    EntityBoxShapeSpec,
    EntityCircleShapeSpec,
    EntityPathShapeSpec,
    EntityPolygonShapeSpec,
    EntityEdgeShapeSpec,
} from "../maps/specs"
import { Entity } from "./entity"
import { toRadians } from "../types/math"

export default class Renderer {
    private pixi: Pixi.Application
    private _size: Vec2

    public get handle() {
        return this.pixi.view
    }
    public get size() {
        return this._size
    }

    constructor(private sim: Simulation) {
        this._size = new Vec2(10, 10)
        this.pixi = new Pixi.Application({
            width: toCm(this._size.x),
            height: toCm(this._size.y),
        })
        if (this.pixi.view.style) {
            // Stretch to fill parent container
            this.pixi.view.style.width = "100%"
            this.pixi.view.style.height = "100%"
        }
    }

    public destroy() {
        try {
            this.pixi.destroy(true)
        } catch (e: any) {
            console.error(e.toString())
        }
    }

    public resize(size: Vec2Like) {
        this._size = Vec2.from(size)
        this.pixi.renderer.resize(toCm(size.x), toCm(size.y))
    }

    public color(color: string) {
        const c = toColor(color)
        this.pixi.renderer.background.color = c.toNumber()
    }

    public add(renderObj: RenderObject) {
        this.pixi.stage?.addChild(renderObj.handle as any)
    }

    public remove(renderObj: RenderObject) {
        this.pixi.stage?.removeChild(renderObj.handle as any)
    }
}

export class RenderObject {
    private _container = new Pixi.Container<any>()

    public get handle() {
        return this._container
    }

    public constructor(
        private entity: Entity,
        private graphics: Pixi.Graphics[]
    ) {
        this.graphics.forEach((g) => this._container.addChild(g))
    }

    public update(dtSecs: number) {}

    public afterPhysicsStep(dtSecs: number) {
        this.sync()
    }

    public destroy() {
        this._container.removeFromParent()
        this._container.destroy()
    }

    public sync() {
        // Copy current pos and angle from the entity to the renderable
        const pos = this.entity.pos
        const angle = this.entity.angle
        this._container.position.set(pos.x, pos.y)
        this._container.rotation = toRadians(angle)
    }
}

// Factory functions for creating Pixi.Graphics objects
const createGraphics: {
    [entity in ShapeType]: {
        [brush in BrushType]: (
            shape: EntityShapeSpec,
            brush: BrushSpec
        ) => Pixi.Graphics
    }
} = {
    box: {
        color: (s, b) =>
            createColorBoxGraphics(
                s as EntityBoxShapeSpec,
                b as ColorBrushSpec
            ),
        pattern: (s, b) =>
            createPatternBoxGraphics(
                s as EntityBoxShapeSpec,
                b as PatternBrushSpec
            ),
        texture: (s, b) =>
            createTextureBoxGraphics(
                s as EntityBoxShapeSpec,
                b as TextureBrushSpec
            ),
    },
    circle: {
        color: (s, b) =>
            createColorCircleGraphics(
                s as EntityCircleShapeSpec,
                b as ColorBrushSpec
            ),
        pattern: (s, b) =>
            createPatternCircleGraphics(
                s as EntityCircleShapeSpec,
                b as PatternBrushSpec
            ),
        texture: (s, b) =>
            createTextureCircleGraphics(
                s as EntityCircleShapeSpec,
                b as TextureBrushSpec
            ),
    },
    path: {
        color: (s, b) =>
            createColorPathGraphics(
                s as EntityPathShapeSpec,
                b as ColorBrushSpec
            ),
        pattern: (s, b) =>
            createPatternPathGraphics(
                s as EntityPathShapeSpec,
                b as PatternBrushSpec
            ),
        texture: (s, b) =>
            createTexturePathGraphics(
                s as EntityPathShapeSpec,
                b as TextureBrushSpec
            ),
    },
    polygon: {
        color: (s, b) =>
            createColorPolygonGraphics(
                s as EntityPolygonShapeSpec,
                b as ColorBrushSpec
            ),
        pattern: (s, b) =>
            createPatternPolygonGraphics(
                s as EntityPolygonShapeSpec,
                b as PatternBrushSpec
            ),
        texture: (s, b) =>
            createTexturePolygonGraphics(
                s as EntityPolygonShapeSpec,
                b as TextureBrushSpec
            ),
    },
    edge: {
        color: (s, b) =>
            createColorEdgeGraphics(
                s as EntityEdgeShapeSpec,
                b as ColorBrushSpec
            ),
        pattern: (s, b) =>
            createPatternEdgeGraphics(
                s as EntityEdgeShapeSpec,
                b as PatternBrushSpec
            ),
        texture: (s, b) =>
            createTextureEdgeGraphics(
                s as EntityEdgeShapeSpec,
                b as TextureBrushSpec
            ),
    },
}

function createColorCircleGraphics(
    shape: EntityCircleShapeSpec,
    brush: ColorBrushSpec
): Pixi.Graphics {
    const g = new Pixi.Graphics()
    const borderColor = toColor(brush.borderColor)
    const fillColor = toColor(brush.fillColor)
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toCm(shape.offset.x), toCm(shape.offset.y))
    g.angle = toRadians(shape.angle)
    g.lineStyle({
        width: toCm(brush.borderWidth),
        color: borderColor,
        alignment: 0,
    })
    g.beginFill(fillColor)
    g.drawCircle(0, 0, toCm(shape.radius))
    return g
}

function createPatternCircleGraphics(
    shape: EntityCircleShapeSpec,
    brush: PatternBrushSpec
): Pixi.Graphics {
    // TODO: implement
    return new Pixi.Graphics()
}

function createTextureCircleGraphics(
    shape: EntityCircleShapeSpec,
    brush: TextureBrushSpec
): Pixi.Graphics {
    // TODO: implement
    return new Pixi.Graphics()
}

function createColorPathGraphics(
    shape: EntityPathShapeSpec,
    brush: ColorBrushSpec
): Pixi.Graphics {
    // TODO: implement
    return new Pixi.Graphics()
}

function createPatternPathGraphics(
    shape: EntityPathShapeSpec,
    brush: PatternBrushSpec
): Pixi.Graphics {
    // TODO: implement
    return new Pixi.Graphics()
}

function createTexturePathGraphics(
    shape: EntityPathShapeSpec,
    brush: TextureBrushSpec
): Pixi.Graphics {
    // TODO: implement
    return new Pixi.Graphics()
}

function createColorBoxGraphics(
    shape: EntityBoxShapeSpec,
    brush: ColorBrushSpec
): Pixi.Graphics {
    const g = new Pixi.Graphics()
    const verts = boxToVertices(shape)
    const borderColor = toColor(brush.borderColor)
    const fillColor = toColor(brush.fillColor)
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toCm(shape.offset.x), toCm(shape.offset.y))
    g.angle = shape.angle
    g.lineStyle({
        width: toCm(brush.borderWidth),
        color: borderColor,
        alignment: 0,
    })
    g.beginFill(fillColor)
    g.moveTo(toCm(verts[0].x), toCm(verts[0].y))
    g.lineTo(toCm(verts[1].x), toCm(verts[1].y))
    g.lineTo(toCm(verts[2].x), toCm(verts[2].y))
    g.lineTo(toCm(verts[3].x), toCm(verts[3].y))
    g.closePath()
    return g
}

function createPatternBoxGraphics(
    shape: EntityBoxShapeSpec,
    brush: PatternBrushSpec
): Pixi.Graphics {
    // TODO: implement
    return new Pixi.Graphics()
}

function createTextureBoxGraphics(
    shape: EntityBoxShapeSpec,
    brush: TextureBrushSpec
): Pixi.Graphics {
    // TODO: implement
    return new Pixi.Graphics()
}

function createColorPolygonGraphics(
    shape: EntityPolygonShapeSpec,
    brush: ColorBrushSpec
): Pixi.Graphics {
    // TODO: implement
    return new Pixi.Graphics()
}

function createPatternPolygonGraphics(
    shape: EntityPolygonShapeSpec,
    brush: PatternBrushSpec
): Pixi.Graphics {
    // TODO: implement
    return new Pixi.Graphics()
}

function createTexturePolygonGraphics(
    shape: EntityPolygonShapeSpec,
    brush: TextureBrushSpec
): Pixi.Graphics {
    // TODO: implement
    return new Pixi.Graphics()
}

function createColorEdgeGraphics(
    shape: EntityEdgeShapeSpec,
    brush: ColorBrushSpec
): Pixi.Graphics {
    const g = new Pixi.Graphics()
    const borderColor = toColor(brush.borderColor)
    const fillColor = toColor(brush.fillColor)
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toCm(shape.offset.x), toCm(shape.offset.y))
    g.angle = toRadians(shape.angle)
    g.lineStyle({
        width: toCm(brush.borderWidth),
        color: borderColor,
        alignment: 0,
    })
    g.beginFill(fillColor)
    g.moveTo(toCm(shape.v0.x), toCm(shape.v0.y))
    g.lineTo(toCm(shape.v1.x), toCm(shape.v1.y))
    return g
}

function createPatternEdgeGraphics(
    shape: EntityEdgeShapeSpec,
    brush: PatternBrushSpec
): Pixi.Graphics {
    // TODO: implement
    return new Pixi.Graphics()
}

function createTextureEdgeGraphics(
    shape: EntityEdgeShapeSpec,
    brush: TextureBrushSpec
): Pixi.Graphics {
    // TODO: implement
    return new Pixi.Graphics()
}

export function createRenderObj(
    entity: Entity,
    spec: EntitySpec
): RenderObject {
    const graphics: Pixi.Graphics[] = spec.shapes.map((shape) => {
        return createGraphics[shape.type][shape.brush.type](shape, shape.brush)
    })
    const renderObj = new RenderObject(entity, graphics)
    return renderObj
}
