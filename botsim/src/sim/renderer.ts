import * as Pixi from "pixi.js"
import {
    boxToVertices,
    toColor,
    toRenderScale,
    samplePath,
    catmullRom,
    calcUvs,
    flattenVerts,
    expandMesh,
    appoximateArc,
} from "./util"
import { Simulation } from "."
import { Vec2, Vec2Like } from "../types/vec2"
import { AABB } from "../types/aabb"
import {
    EntitySpec,
    BrushSpec,
    ColorBrushSpec,
    TextureBrushSpec,
    ShapeType,
    BrushType,
    EntityShapeSpec,
    EntityBoxShapeSpec,
    EntityCircleShapeSpec,
    EntityPathShapeSpec,
    EntityPolygonShapeSpec,
    EntityEdgeShapeSpec,
    ShaderBrushSpec,
} from "./specs"
import { Entity } from "./entity"
import { toRadians } from "../util"
import { MAP_ASPECT_RATIO, RENDER_SCALE } from "../constants"
import { nextId } from "../util"
import earcut from "earcut"

/**
 * Renderer is responsible for rendering the simulation to a canvas element.
 */
export default class Renderer {
    private pixi: Pixi.Application
    private renderer: Pixi.Renderer
    private _size: Vec2Like
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
            return Vec2.one()
        }
        return Vec2.like(rect.width, rect.height)
    }
    public get debugLayer() {
        return this._debugLayer
    }
    public setCanvasCursor(cursor: string) {
        const canvas = this.pixi.view as HTMLCanvasElement
        if (canvas?.style) {
            canvas.style.cursor = cursor
            canvas.style.backgroundColor = "white"
        }
    }

    constructor(private sim: Simulation) {
        this._size = Vec2.like(10 * MAP_ASPECT_RATIO, 10)
        this.pixi = new Pixi.Application({
            // temp size, will be changed when map loads
            width: toRenderScale(this._size.x),
            height: toRenderScale(this._size.y),
            antialias: true,
            clearBeforeRender: true,
        })
        if (this.pixi.view.style) {
            // Stretch to fill parent container
            this.pixi.view.style.width = "100%"
            this.pixi.view.style.height = "100%"
        }
        this.renderer = this.pixi.renderer as Pixi.Renderer
        // Global uniforms must be created before the first render
        this.renderer.globalUniforms.uniforms.uTime = 0

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

    public update(dtSecs: number) {
        this.renderer.globalUniforms.uniforms.uTime += dtSecs
    }

    public resize(size: Vec2Like) {
        this._size = Vec2.copy(size)
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

/**
 * Small API wrapper around a renderable object.
 */
class RenderShape {
    public get visible() {
        return this.gfx.visible
    }
    public set visible(v: boolean) {
        this.gfx.visible = v
    }
    constructor(
        public spec: EntityShapeSpec,
        public gfx: Pixi.DisplayObject
    ) {}
    public setGfx(gfx: Pixi.DisplayObject) {
        const idx = this.gfx.parent?.getChildIndex(this.gfx)
        this.gfx.parent?.addChildAt(gfx, idx ?? 0)
        this.gfx.removeFromParent()
        this.gfx = gfx
    }
}

/**
 * A RenderObject represents the visual representation of an Entity. It can
 * contain multiple Shapes, which are keyed by spec.label, if specified, or a
 * randomly assigned key otherwise.
 */
export class RenderObject {
    private _container = new Pixi.Container()

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
            this._container.addChild(s.gfx)
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
        this._container.position.set(pos.x * RENDER_SCALE, pos.y * RENDER_SCALE)
        this._container.rotation = toRadians(angle)
    }
}

/*********************************************************************
 * SHADERS
 ********************************************************************/

const shaderPrograms = new Map<string, Pixi.Program>()

export function addShaderProgram(name: string, vert: string, frag: string) {
    shaderPrograms.set(name, Pixi.Program.from(vert, frag))
}

function getShaderProgram(name: string): Pixi.Program {
    const pgm = shaderPrograms.get(name)
    if (pgm) return pgm
    console.error(`shader program not found: "${name}"`)
    return shaderPrograms.get("$$missing_shader$$")!
}

export const CommonVertexShaderGlobals = `
    precision mediump float;
    attribute vec2 aVerts;
    attribute vec2 aUvs;
    uniform float uAspectRatio;
    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;
    uniform float uTime;
    varying vec2 vUvs;
`
export const BasicVertexShader =
    CommonVertexShaderGlobals +
    `
    void main() {
        vUvs = aUvs;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVerts, 1.0)).xy, 0.0, 1.0);
    }`

export const CommonFragmentShaderGlobals = `
        precision mediump float;
        uniform float uTime;
        uniform float uAspectRatio;
        varying vec2 vUvs;
    `

addShaderProgram(
    "$$missing_shader$$",
    BasicVertexShader,
    CommonFragmentShaderGlobals +
        `
        void main() {
            vec2 uv = vUvs;
            uv = vec2(uv.x * uAspectRatio, uv.y);
            uv = floor(uv * 10.);
            vec3 color1 = vec3(0.4, 0.0, 0.0);
            vec3 color2 = vec3(0.0, 0.4, 0.4);
            vec3 outColor = mod(uv.x + uv.y, 2.) < 0.5 ? color1 : color2;
            gl_FragColor = vec4(outColor.rgb, 0.5);
        }`
)

addShaderProgram(
    "textured_colored",
    BasicVertexShader,
    CommonFragmentShaderGlobals +
        `
        uniform sampler2D uSampler2;
        uniform vec3 uColor;
        uniform float uAlpha;
        void main() {
            vec2 uv = vUvs;
            uv = vec2(uv.x * uAspectRatio, uv.y);
            gl_FragColor = texture2D(uSampler2, uv) * vec4(uColor.rgb, uAlpha);
        }`
)

/*********************************************************************
 * RENDER OBJECT FACTORIES
 ********************************************************************/

// Factory functions for creating renderable objects
export const createGraphics: {
    [entity in ShapeType]: {
        [brush in BrushType]: (
            shape: EntityShapeSpec,
            brush: BrushSpec
        ) => Pixi.DisplayObject
    }
} = {
    box: {
        color: (s, b) =>
            createColoredBoxGraphics(
                s as EntityBoxShapeSpec,
                b as ColorBrushSpec
            ),
        texture: (s, b) =>
            createTexturedBoxGraphics(
                s as EntityBoxShapeSpec,
                b as TextureBrushSpec
            ),
        shader: (s, b) =>
            createShadedBoxGraphics(
                s as EntityBoxShapeSpec,
                b as ShaderBrushSpec
            ),
    },
    circle: {
        color: (s, b) =>
            createColoredCircleGraphics(
                s as EntityCircleShapeSpec,
                b as ColorBrushSpec
            ),
        texture: (s, b) =>
            createTexturedCircleGraphics(
                s as EntityCircleShapeSpec,
                b as TextureBrushSpec
            ),
        shader: (s, b) =>
            createShadedCircleGraphics(
                s as EntityCircleShapeSpec,
                b as ShaderBrushSpec
            ),
    },
    path: {
        color: (s, b) =>
            createColoredPathGraphics(
                s as EntityPathShapeSpec,
                b as ColorBrushSpec
            ),
        texture: (s, b) =>
            createTexturedPathGraphics(
                s as EntityPathShapeSpec,
                b as TextureBrushSpec
            ),
        shader: (s, b) =>
            createShadedPathGraphics(
                s as EntityPathShapeSpec,
                b as ShaderBrushSpec
            ),
    },
    polygon: {
        color: (s, b) =>
            createColoredPolygonGraphics(
                s as EntityPolygonShapeSpec,
                b as ColorBrushSpec
            ),
        texture: (s, b) =>
            createTexturedPolygonGraphics(
                s as EntityPolygonShapeSpec,
                b as TextureBrushSpec
            ),
        shader: (s, b) =>
            createShadedPolygonGraphics(
                s as EntityPolygonShapeSpec,
                b as ShaderBrushSpec
            ),
    },
    edge: {
        color: (s, b) =>
            createColoredEdgeGraphics(
                s as EntityEdgeShapeSpec,
                b as ColorBrushSpec
            ),
        texture: (s, b) =>
            createTexturedEdgeGraphics(
                s as EntityEdgeShapeSpec,
                b as TextureBrushSpec
            ),
        shader: (s, b) =>
            createShadedEdgeGraphics(
                s as EntityEdgeShapeSpec,
                b as ShaderBrushSpec
            ),
    },
}

function createColoredCircleGraphics(
    shape: EntityCircleShapeSpec,
    brush: ColorBrushSpec
): Pixi.DisplayObject {
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
    return g as any
}

function createTexturedCircleGraphics(
    shape: EntityCircleShapeSpec,
    brush: TextureBrushSpec
): Pixi.DisplayObject {
    const radius = toRenderScale(shape.radius)
    const verts = appoximateArc(Vec2.zero(), radius, 0, 360, 32)
    const indices = earcut(flattenVerts(verts))
    const mesh = expandMesh(verts, indices)
    const uvs = calcUvs(mesh)
    const aabb = AABB.from(mesh)
    const color = toColor(brush.color)
    const alpha = brush.alpha

    const geom = new Pixi.Geometry()
    const aVerts = flattenVerts(mesh)
    const aUvs = flattenVerts(uvs)
    const uAspectRatio = AABB.width(aabb) / AABB.height(aabb)
    geom.addAttribute("aVerts", aVerts, 2)
    geom.addAttribute("aUvs", aUvs, 2)
    //geom.addAttribute("aAspectRatio", [aAspectRatio], 1)

    const pgm = getShaderProgram("textured_colored")
    const shader = new Pixi.Shader(pgm, {
        uSampler2: Pixi.Texture.from(brush.texture),
        uColor: color.toRgbArray(),
        uAlpha: alpha,
        uAspectRatio,
    })
    const g = new Pixi.Mesh(geom, shader)
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.visible = brush.visible
    return g as any
}

function createShadedCircleGraphics(
    shape: EntityCircleShapeSpec,
    brush: ShaderBrushSpec
): Pixi.DisplayObject {
    const radius = toRenderScale(shape.radius)
    const verts = appoximateArc(Vec2.zero(), radius, 0, 360, 32)
    const indices = earcut(flattenVerts(verts))
    const mesh = expandMesh(verts, indices)
    const uvs = calcUvs(mesh)
    const aabb = AABB.from(mesh)
    const uniforms = brush.uniforms

    const geom = new Pixi.Geometry()
    const aVerts = flattenVerts(mesh)
    const aUvs = flattenVerts(uvs)
    const uAspectRatio = AABB.width(aabb) / AABB.height(aabb)
    geom.addAttribute("aVerts", aVerts, 2)
    geom.addAttribute("aUvs", aUvs, 2)

    const pgm = getShaderProgram(brush.shader)
    const shader = new Pixi.Shader(pgm, {
        ...uniforms,
        uAspectRatio,
    })
    const g = new Pixi.Mesh(geom, shader)
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.visible = brush.visible
    return g as any
}

function createColoredPathGraphics(
    shape: EntityPathShapeSpec,
    brush: ColorBrushSpec
): Pixi.DisplayObject {
    const g = new Pixi.Graphics()
    const { verts: pathVerts, closed } = shape
    if (pathVerts.length < 4) {
        return g as any
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
    return g as any
}

function createTexturedPathGraphics(
    shape: EntityPathShapeSpec,
    brush: TextureBrushSpec
): Pixi.DisplayObject {
    // TODO: implement
    const g = new Pixi.Graphics()
    g.visible = brush.visible
    return g as any
}

function createShadedPathGraphics(
    shape: EntityPathShapeSpec,
    brush: ShaderBrushSpec
): Pixi.DisplayObject {
    // TODO: implement
    const g = new Pixi.Graphics()
    g.visible = brush.visible
    return g as any
}

function createColoredBoxGraphics(
    shape: EntityBoxShapeSpec,
    brush: ColorBrushSpec
): Pixi.DisplayObject {
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
    return g as any
}

function createTexturedBoxGraphics(
    shape: EntityBoxShapeSpec,
    brush: TextureBrushSpec
): Pixi.DisplayObject {
    const verts = boxToVertices(shape).map((v) => Vec2.scale(v, RENDER_SCALE))
    const indices = earcut(flattenVerts(verts))
    const mesh = expandMesh(verts, indices)
    const uvs = calcUvs(mesh)
    const aabb = AABB.from(mesh)
    const color = toColor(brush.color)
    const alpha = brush.alpha

    const geom = new Pixi.Geometry()
    const aVerts = flattenVerts(mesh)
    const aUvs = flattenVerts(uvs)
    const uAspectRatio = AABB.width(aabb) / AABB.height(aabb)
    geom.addAttribute("aVerts", aVerts, 2)
    geom.addAttribute("aUvs", aUvs, 2)
    //geom.addAttribute("aAspectRatio", [aAspectRatio], 1)

    const pgm = getShaderProgram("textured_colored")
    const shader = new Pixi.Shader(pgm, {
        uSampler2: Pixi.Texture.from(brush.texture),
        uColor: color.toRgbArray(),
        uAlpha: alpha,
        uAspectRatio,
    })
    const g = new Pixi.Mesh(geom, shader)
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.visible = brush.visible
    return g as any
}

function createShadedBoxGraphics(
    shape: EntityBoxShapeSpec,
    brush: ShaderBrushSpec
): Pixi.DisplayObject {
    const verts = boxToVertices(shape).map((v) => Vec2.scale(v, RENDER_SCALE))
    const indices = earcut(flattenVerts(verts))
    const mesh = expandMesh(verts, indices)
    const uvs = calcUvs(mesh)
    const aabb = AABB.from(mesh)
    const uniforms = brush.uniforms

    const geom = new Pixi.Geometry()
    const aVerts = flattenVerts(mesh)
    const aUvs = flattenVerts(uvs)
    const uAspectRatio = AABB.width(aabb) / AABB.height(aabb)
    geom.addAttribute("aVerts", aVerts, 2)
    geom.addAttribute("aUvs", aUvs, 2)
    //geom.addAttribute("aAspectRatio", [aAspectRatio], 1)

    const pgm = getShaderProgram(brush.shader)
    const shader = new Pixi.Shader(pgm, {
        ...uniforms,
        uAspectRatio,
    })
    const g = new Pixi.Mesh(geom, shader)
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.visible = brush.visible
    return g as any
}

function createColoredPolygonGraphics(
    shape: EntityPolygonShapeSpec,
    brush: ColorBrushSpec
): Pixi.DisplayObject {
    const g = new Pixi.Graphics()
    const verts = shape.verts.map((v) => Vec2.scale(v, RENDER_SCALE))
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
    g.moveTo(verts[0].x, verts[0].y)
    for (let i = 0; i < verts.length; i++) {
        g.lineTo(verts[i].x, verts[i].y)
    }
    g.closePath()
    g.visible = brush.visible
    return g as any
}

function createTexturedPolygonGraphics(
    shape: EntityPolygonShapeSpec,
    brush: TextureBrushSpec
): Pixi.DisplayObject {
    const verts = shape.verts.map((v) => Vec2.scale(v, RENDER_SCALE))
    const indices = earcut(flattenVerts(verts))
    const mesh = expandMesh(verts, indices)
    const uvs = calcUvs(mesh)
    const aabb = AABB.from(mesh)
    const color = toColor(brush.color)
    const alpha = brush.alpha

    const geom = new Pixi.Geometry()
    const aVerts = flattenVerts(mesh)
    const aUvs = flattenVerts(uvs)
    const uAspectRatio = AABB.width(aabb) / AABB.height(aabb)
    geom.addAttribute("aVerts", aVerts, 2)
    geom.addAttribute("aUvs", aUvs, 2)
    //geom.addAttribute("aAspectRatio", [aAspectRatio], 1)

    const pgm = getShaderProgram("textured_colored")
    const shader = new Pixi.Shader(pgm, {
        uSampler2: Pixi.Texture.from(brush.texture),
        uColor: color.toRgbArray(),
        uAlpha: alpha,
        uAspectRatio,
    })
    const g = new Pixi.Mesh(geom, shader)
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.visible = brush.visible
    return g as any
}

function createShadedPolygonGraphics(
    shape: EntityPolygonShapeSpec,
    brush: ShaderBrushSpec
): Pixi.DisplayObject {
    const verts = shape.verts.map((v) => Vec2.scale(v, RENDER_SCALE))
    const indices = earcut(flattenVerts(verts))
    const mesh = expandMesh(verts, indices)
    const uvs = calcUvs(mesh)
    const aabb = AABB.from(mesh)
    const uniforms = brush.uniforms

    const geom = new Pixi.Geometry()
    const aVerts = flattenVerts(mesh)
    const aUvs = flattenVerts(uvs)
    const uAspectRatio = AABB.width(aabb) / AABB.height(aabb)
    geom.addAttribute("aVerts", aVerts, 2)
    geom.addAttribute("aUvs", aUvs, 2)
    //geom.addAttribute("aAspectRatio", [aAspectRatio], 1)

    const pgm = getShaderProgram(brush.shader)
    const shader = new Pixi.Shader(pgm, {
        ...uniforms,
        uAspectRatio,
    })
    const g = new Pixi.Mesh(geom, shader)
    g.zIndex = brush.zIndex ?? 0
    g.position.set(toRenderScale(shape.offset.x), toRenderScale(shape.offset.y))
    g.angle = shape.angle
    g.visible = brush.visible
    return g as any
}

function createColoredEdgeGraphics(
    shape: EntityEdgeShapeSpec,
    brush: ColorBrushSpec
): Pixi.DisplayObject {
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
    return g as any
}

function createTexturedEdgeGraphics(
    shape: EntityEdgeShapeSpec,
    brush: TextureBrushSpec
): Pixi.DisplayObject {
    // TODO: implement
    const g = new Pixi.Graphics()
    g.visible = brush.visible
    return g as any
}

function createShadedEdgeGraphics(
    shape: EntityEdgeShapeSpec,
    brush: ShaderBrushSpec
): Pixi.DisplayObject {
    // TODO: implement
    const g = new Pixi.Graphics()
    g.visible = brush.visible
    return g as any
}

/**
 * Returns a RenderObject for the given EntitySpec
 */
export function createRenderObj(
    entity: Entity,
    spec: EntitySpec
): RenderObject {
    const shapes = new Map<string, RenderShape>()
    spec.shapes.forEach((shape) => {
        const label = shape.label ?? "shape." + nextId()
        const gfx = createGraphics[shape.type][shape.brush.type](
            shape,
            shape.brush
        )
        shapes.set(label, new RenderShape(shape, gfx))
    })
    const renderObj = new RenderObject(entity, shapes)
    return renderObj
}
