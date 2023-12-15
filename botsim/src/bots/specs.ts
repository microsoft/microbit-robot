import { Vec2Like } from "../types/vec2"
import { BoxShapeSpec, CircleShapeSpec } from "../sim/specs"

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

export type CircleChassisSpec = {
    shape: "circle"
    radius: number // cm
}

export type BoxChassisSpec = {
    shape: "box"
    size: Vec2Like // cm
}

export type ChassisSpec = CircleChassisSpec | BoxChassisSpec

export type WheelSpec = {
    name: WheelSlotName // identification label
    maxSpeed: number // max speed forward (positive). no units, just influences force computation.
    pos: Vec2Like // offset from chassis center
    width: number // cm
    radius: number // cm
}

export type LineSensorSpec = {
    name: LineSensorSlotName // identification label
    pos: Vec2Like // offset from chassis center
}

export type RangeSensorSpec = {
    pos: Vec2Like // offset from chassis center
    beamAngle: number // degrees
    maxRange: number // cm
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
