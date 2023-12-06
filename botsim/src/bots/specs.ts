import { Vec2Like } from "../types/vec2"
import {
    BoxShapeSpec,
    BrushSpec,
    CircleShapeSpec,
    PolygonShapeSpec,
} from "../sim/specs"

export const LINE_SENSORS = {
    ["outer-left"]: 0,
    ["left"]: 1,
    ["middle"]: 2,
    ["right"]: 3,
    ["outer-right"]: 4,
}

export type WheelSlotName = "left" | "right"
export type LineSensorSlotName = keyof typeof LINE_SENSORS
export type LEDSlotName = "left" | "right" | "general"

export type ChassisShapeSpec = CircleShapeSpec | BoxShapeSpec

export type ChassisSpec = {
    shape: ChassisShapeSpec
    brush: BrushSpec
}

export type WheelSpec = {
    name: WheelSlotName // identification label
    maxSpeed: number // max speed forward (positive). no units, just influences force computation.
    pos: Vec2Like // offset from chassis center
    width: number // cm
    radius: number // cm
    brush: BrushSpec
}

export type LineSensorSpec = {
    name: LineSensorSlotName // identification label
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
    name: LEDSlotName // identification label
    pos: Vec2Like // offset from chassis center
    radius: number // cm. exception: the "general" LED takes its shape and size from the chassis
}

// Ballast is an invisible mass that can be added to the bot to change its
// center of mass and movement characteristics. It can be used to simulate a
// battery or other heavy component.
export type BallastSpec = {
    pos: Vec2Like // offset from chassis center
    size: Vec2Like // cm
    mass: number
}

export type BotSpec = {
    name: string
    productId: number
    chassis: ChassisSpec
    wheels: WheelSpec[]
    rangeSensor?: RangeSensorSpec
    lineSensors?: LineSensorSpec[]
    leds?: LEDSpec[]
    ballast?: BallastSpec
}
