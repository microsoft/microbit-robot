import { Vec2Like } from "../types/vec2"
import { BrushSpec, ShapeSpec } from "../maps/specs"

export type ChassisSpec = {
    shape: ShapeSpec
    brush: BrushSpec
}

export type WheelSpec = {
    label: string // identification label
    maxSpeed: number // max speed forward (positive). no units, just influences force computation.
    pos: Vec2Like // offset from chassis center
    width: number // cm
    radius: number // cm
    brush: BrushSpec
}

export type LineSensorSpec = {
    label: string // identification label
    pos: Vec2Like // offset from chassis center
    brush: {
        on: BrushSpec
        off: BrushSpec
    }
}

export type RangeSensorSpec = {
    pos: Vec2Like // offset from chassis center
    angle: number // beam angle
    brush: BrushSpec
}

export type LEDSpec = {
    label: string // identification label
    pos: Vec2Like // offset from chassis center
    brush: BrushSpec
}

// Ballast is an invisible mass that can be added to the bot to change its
// center of mass and movement characteristics. It can be used to simulate a
// battery or other heavy component.
export type BallastSpec = {
    pos: Vec2Like // offset from chassis center
    size: Vec2Like // cm
    mass: number // mg (converted to density as mass/area)
}

export type BotSpec = {
    name: string
    chassis: ChassisSpec
    wheels: WheelSpec[]
    rangeSensor?: RangeSensorSpec
    lineSensors?: LineSensorSpec[]
    leds?: LEDSpec[]
    ballast?: BallastSpec
}

export const LINE_SENSORS = {
    ["outer-left"]: 0,
    ["left"]: 1,
    ["middle"]: 2,
    ["right"]: 3,
    ["outer-right"]: 4,
}
