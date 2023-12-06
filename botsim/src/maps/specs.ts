import { EntitySpec } from "../sim/specs"
import { Vec2Like } from "../types/vec2"

/// Spawn

export type SpawnSpec = {
    pos: Vec2Like
    angle: number
}

/// Map

export type MapSpec = {
    name: string
    width: number // cm
    aspectRatio: number // width / height
    color: string // background color
    spawns: SpawnSpec[] // robot spawn location
    entities: EntitySpec[] // obstacles, etc.
}
