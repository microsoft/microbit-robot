import * as Pixi from "pixi.js"
import {
    boxToVertices,
    toColor,
    toRenderScale,
    samplePath,
    catmullRom,
} from "./util"
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
} from "./specs"
import { Entity } from "./entity"
import { toRadians } from "../util"
import { MAP_ASPECT_RATIO, PHYSICS_TO_RENDER_SCALE } from "./constants"
import { nextId } from "../util"

/**
 * Renderer is responsible for rendering the simulation to a canvas element.
 */
export default class Renderer {
    private pixi: Pixi.Application
    private _size: Vec2
    private _debugLayer: Pixi.Container

    public get handle() {
        return this.pixi.view
    }
    // Returns size without scaling (what you'd find in the map spec)
    public get logicalSize() {
        return this._size
    }
    // Returns screen size of the canvas control
    public get canvasSize() {
        const rect = this.pixi.view.getBoundingClientRect?.()
        if (!rect) {
            // Fallback to something that won't cause divide-by-zero elsewhere
            return new Vec2(1, 1)
        }
        return new Vec2(rect.width, rect.height)
    }
    public get debugLayer() {
        return this._debugLayer
    }

    constructor(private sim: Simulation) {
        this._size = new Vec2(10 * MAP_ASPECT_RATIO, 10)
        this.pixi = new Pixi.Application({
            width: toRenderScale(this._size.x),
            height: toRenderScale(this._size.y),
            antialias: true,
        })
        if (this.pixi.view.style) {
            // Stretch to fill parent container
            this.pixi.view.style.width = "100%"
            this.pixi.view.style.height = "100%"
        }

        // Create a debug layer
        this._debugLayer = new Pixi.Container()
        this.pixi.stage.addChild(this._debugLayer as any)
    }

    public reinit() {
        this.pixi.stage.removeChildren()
        this._debugLayer.removeChildren()
        this.pixi.stage.addChild(this._debugLayer as any)
    }

    public destroy() {
        try {
            this.pixi.destroy(true)
        } catch (e: any) {
            console.error(e.toString())
        }
    }

    public update(dtSecs: number) {}

    public resize(size: Vec2Like) {
        this._size = Vec2.from(size)
        this.pixi.renderer.resize(toRenderScale(size.x), toRenderScale(size.y))
    }

    public color(color: string) {
        const c = toColor(color)
        this.pixi.renderer.background.color = c.toNumber()
    }

    public add(renderObj: RenderObject) {
        this.pixi.stage?.addChild(renderObj.handle as any)
    }

    public addDebugObj(obj: Pixi.DisplayObject) {
        this._debugLayer.addChild(obj)
    }

    public remove(renderObj: RenderObject) {
        this.pixi.stage?.removeChild(renderObj.handle as any)
    }
}

class RenderShape {
    public get visible() {
        return this.graphics.visible
    }
    public set visible(v: boolean) {
        this.graphics.visible = v
    }
    constructor(
        public spec: EntityShapeSpec,
        public graphics: Pixi.Graphics
    ) {}
}

/**
 * A RenderObject represents the visual representation of an Entity. It can
 * contain multiple Shapes, which are keyed by spec.label, if specified, or a
 * randomly assigned key otherwise.
 */
export class RenderObject {
    private _container = new Pixi.Container<any>()

    public get handle() {
        return this._container
    }
    public get shapes() {
        return this._shapes
    }

    public constructor(
        private entity: Entity,
        private _shapes: Map<string, RenderShape>
    ) {
        Array.from(this.shapes.values()).forEach((s) =>
            this._container.addChild(s.graphics)
        )
    }

    public update(dtSecs: number) {
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
        this._container.position.set(
            pos.x * PHYSICS_TO_RENDER_SCALE,
            pos.y * PHYSICS_TO_RENDER_SCALE
        )
        this._container.rotation = toRadians(angle)
    }
}

// Factory functions for creating renderable objects
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
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = toRadians(shape.angle)
    g.lineStyle({
        width: toRenderScale(brush.borderWidth),
        color: borderColor,
        alignment: 0,
    })
    g.beginFill(fillColor)
    g.drawCircle(0, 0, toRenderScale(shape.radius))
    g.visible = brush.visible
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
    const g = new Pixi.Graphics()
    const { verts: pathVerts, closed } = shape
    if (pathVerts.length < 4) {
        return g
    }
    const verts = samplePath(
        catmullRom,
        pathVerts,
        closed,
        0,
        pathVerts.length,
        shape.stepSize
    )
    const lineColor = toColor(brush.fillColor)
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.lineStyle({
        width: toRenderScale(shape.width),
        color: lineColor,
        alignment: 0.5,
    })
    g.moveTo(toRenderScale(verts[0].x), toRenderScale(verts[0].y))
    for (let i = 1; i < verts.length; i++) {
        g.lineTo(toRenderScale(verts[i].x), toRenderScale(verts[i].y))
    }
    g.visible = brush.visible
    return g
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
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.lineStyle({
        width: toRenderScale(brush.borderWidth),
        color: borderColor,
        alignment: 0,
    })
    g.beginFill(fillColor)
    g.moveTo(toRenderScale(verts[0].x), toRenderScale(verts[0].y))
    g.lineTo(toRenderScale(verts[1].x), toRenderScale(verts[1].y))
    g.lineTo(toRenderScale(verts[2].x), toRenderScale(verts[2].y))
    g.lineTo(toRenderScale(verts[3].x), toRenderScale(verts[3].y))
    g.closePath()
    g.visible = brush.visible
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
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = toRadians(shape.angle)
    g.lineStyle({
        width: toRenderScale(brush.borderWidth),
        color: borderColor,
        alignment: 0,
    })
    g.beginFill(fillColor)
    g.moveTo(toRenderScale(shape.v0.x), toRenderScale(shape.v0.y))
    g.lineTo(toRenderScale(shape.v1.x), toRenderScale(shape.v1.y))
    g.visible = brush.visible
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
    const shapes = new Map<string, RenderShape>()
    spec.shapes.forEach((shape) => {
        const label = shape.label ?? "shape." + nextId()
        const graphics = createGraphics[shape.type][shape.brush.type](
            shape,
            shape.brush
        )
        shapes.set(label, new RenderShape(shape, graphics))
    })
    const renderObj = new RenderObject(entity, shapes)
    return renderObj
}
