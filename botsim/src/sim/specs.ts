import { Vec2Like } from "../types/vec2"

/// Shapes

export type ShapeSpec =
    | PathShapeSpec
    | BoxShapeSpec
    | CircleShapeSpec
    | PolygonShapeSpec
    | EdgeShapeSpec

export type ShapeType = "path" | "box" | "circle" | "polygon" | "edge"

type ShapeCommonSpec = {
    type: ShapeType
    label?: string
    roles: string[]
}

export type PathShapeSpec = ShapeCommonSpec & {
    type: "path"
    verts: Vec2Like[]
    width: number // cm
    closed: boolean // if true, the path is closed
    stepSize: number // length of each step when sampling
}

export const defaultPathShape = (): PathShapeSpec => ({
    type: "path",
    verts: [
        // default to a box shape
        { x: 0, y: 0 },
        { x: 30, y: 0 },
        { x: 30, y: 30 },
        { x: 0, y: 30 },
    ],
    width: 3,
    closed: true,
    stepSize: 0.2,
    roles: [],
})

export type HorizontalAlignment = "left" | "center" | "right"
export type VerticalAlignment = "top" | "center" | "bottom"

export type BoxShapeSpec = ShapeCommonSpec & {
    type: "box"
    size: Vec2Like // cm
    halign: HorizontalAlignment
    valign: VerticalAlignment
}

export const defaultBoxShape = (): BoxShapeSpec => ({
    type: "box",
    size: { x: 20, y: 20 },
    halign: "center",
    valign: "center",
    roles: [],
})

export type CircleShapeSpec = ShapeCommonSpec & {
    type: "circle"
    radius: number // cm
}

export const defaultCircleShape = (): CircleShapeSpec => ({
    type: "circle",
    radius: 10,
    roles: [],
})

export type PolygonShapeSpec = ShapeCommonSpec & {
    type: "polygon"
    verts: Vec2Like[]
}

export const defaultPolygonShape = (): PolygonShapeSpec => ({
    type: "polygon",
    verts: [], // TODO: make an interesting default
    roles: [],
})

export type EdgeShapeSpec = ShapeCommonSpec & {
    type: "edge"
    v0: Vec2Like
    v1: Vec2Like
    vPrev?: Vec2Like
    vNext?: Vec2Like
}

export const defaultEdgeShape = (): EdgeShapeSpec => ({
    type: "edge",
    v0: { x: 0, y: 0 },
    v1: { x: 20, y: 20 },
    roles: [],
})

/// Physics of a shape

export type ShapePhysicsSpec = {
    density: number
    friction: number
    restitution: number
    sensor: boolean
    maskBits?: number
    categoryBits?: number
}

export const defaultShapePhysics = (): ShapePhysicsSpec => ({
    density: 0.1,
    friction: 0.2,
    restitution: 0.2,
    sensor: false,
})

/// Shape applied to an entity

type EntityShapeCommonSpec = {
    offset: Vec2Like // cm, offset from entity origin
    angle: number // degrees
    physics: ShapePhysicsSpec
    brush: BrushSpec
}

export type EntityBoxShapeSpec = BoxShapeSpec & EntityShapeCommonSpec
export type EntityCircleShapeSpec = CircleShapeSpec & EntityShapeCommonSpec
export type EntityPolygonShapeSpec = PolygonShapeSpec & EntityShapeCommonSpec
export type EntityEdgeShapeSpec = EdgeShapeSpec & EntityShapeCommonSpec
export type EntityPathShapeSpec = PathShapeSpec & EntityShapeCommonSpec
export type EntityShapeSpec =
    | EntityBoxShapeSpec
    | EntityCircleShapeSpec
    | EntityPolygonShapeSpec
    | EntityEdgeShapeSpec
    | EntityPathShapeSpec

export const defaultEntityShape = (): EntityShapeSpec => ({
    ...defaultBoxShape(),
    offset: { x: 0, y: 0 },
    angle: 0,
    physics: defaultShapePhysics(),
    brush: defaultColorBrush(),
})

/// Entity

export type EntitySpec = {
    label?: string
    pos: Vec2Like // cm
    angle: number // degrees
    physics: EntityPhysicsSpec
    shapes: EntityShapeSpec[]
}

export const defaultEntity = (): EntitySpec => ({
    ...defaultBoxShape(),
    pos: { x: 20, y: 20 },
    angle: 0,
    physics: defaultDynamicPhysics(),
    shapes: [],
})

/// Entity Physics

export type EntityPhysicsType = "dynamic" | "static" // TODO: Add support for kinematic

export type EntityPhysicsSpec = {
    type: EntityPhysicsType
    angularDamping: number
    linearDamping: number
    fixedRotation?: boolean
}

export const defaultDynamicPhysics = (): EntityPhysicsSpec => ({
    type: "dynamic",
    angularDamping: 0,
    linearDamping: 0,
})

export const defaultStaticPhysics = (): EntityPhysicsSpec => ({
    type: "static",
    angularDamping: 0,
    linearDamping: 0,
})

/// Brushes

export type BrushSpec = ColorBrushSpec | TextureBrushSpec | ShaderBrushSpec

export type BrushType = "color" | "texture" | "shader"

type BrushCommonSpec = {
    type: BrushType
    visible: boolean
    zIndex?: number
}

export type ColorBrushSpec = BrushCommonSpec & {
    type: "color"
    borderColor: string
    borderWidth: number // cm
    fillColor: string
}

export const defaultColorBrush = (): ColorBrushSpec => ({
    type: "color",
    borderColor: "#FF1053",
    borderWidth: 0.25,
    fillColor: "#EAD637",
    zIndex: 0,
    visible: true,
})

export type TextureBrushSpec = BrushCommonSpec & {
    type: "texture"
    texture: string
    color: string
    alpha: number
    // TODO: u, v, wrap, align, etc.
}

export const defaultTextureBrush = (): TextureBrushSpec => ({
    type: "texture",
    texture: "placeholder.png",
    color: "#FFFFFF",
    alpha: 1,
    zIndex: 0,
    visible: true,
})

export type ShaderBrushSpec = BrushCommonSpec & {
    type: "shader"
    shader: string
    uniforms: { [key: string]: any }
}

export const defaultShaderBrush = (): ShaderBrushSpec => ({
    type: "shader",
    shader: "default",
    uniforms: {},
    zIndex: 0,
    visible: true,
})
