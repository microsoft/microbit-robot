/**
 *
 * This file contains the data structures that describe a bot.
 *
 */
import { Vec2Like } from "../types/vec2"
import { BoxShapeSpec, CircleShapeSpec } from "../sim/specs"

/**
 * A specification for a bot.
 *
 * - the coordinate 0,0 is the center of the chassis.
 * - x is horizontal, y is inverted vertical
 * - all units are `cm`, `degrees` and `g` unless specified
 *
 *    ---------
 *   /   o  o   \
 *   |          |
 *  []    ->  x []
 *   |    |     |
 *   |    y     |
 *.   \ - - - - /
 */
export type BotSpec = {
    name: string
    productId: number
    /**
     * mass of the robot without the ballast
     * TODO: replace with weight?
     */
    mass: number
    /**
     * weight of the robot without the ballast in grams
     */
    weight?: number
    /**
     * Robot PCB chassi color, default is black.
     */
    silkColor?: string
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

export type WheelSlotName = "left" | "right"
export type LineSensorSlotName = keyof typeof LINE_SENSORS
export type LEDSlotName = "left" | "right" | "general" // TODO: rename to all

export type ChassisShapeSpec = CircleShapeSpec | BoxShapeSpec

export type CircleChassisSpec = {
    shape: "circle"
    /**
     * unit: cm
     */
    radius: number
}

export type BoxChassisSpec = {
    shape: "box"
    /**
     * unit: cm
     */
    size: Vec2Like
}

export type ChassisSpec = CircleChassisSpec | BoxChassisSpec

export type WheelSpec = {
    name: WheelSlotName
    /**
     * max speed forward (positive).
     * no units, just influences force computation.
     */
    maxSpeed: number

    /**
     * Time to move at 80% over 1m.
     */
    dashTime: number

    /**
     * offset from chassis center
     * TODO: maybe position of the inside edge
     */
    pos: Vec2Like
    /**
     * unit: cm
     */
    width: number
    /**
     * unit: cm
     */
    radius: number
}

export type LineSensorSpec = {
    name: LineSensorSlotName
    /**
     * offset from chassis center
     */
    pos: Vec2Like
}

export type RangeSensorSpec = {
    /**
     * offset from chassis center
     */
    pos: Vec2Like
    /**
     * degrees
     * TODO: make optional, provide defaults for SR04
     */
    beamAngle: number
    /**
     * TODO: make optional, provide defaults for SR04
     */
    maxRange: number
}

export type LEDSpec = {
    name: LEDSlotName
    /**
     * offset from chassis center
     */
    pos: Vec2Like
    /**
     * Radius
     * exception: the "general" LED takes its shape and size from the chassis
     */
    radius: number
    /**
     *
     */
    filter?: [number, number, number]
}

// Ballast is an invisible mass that can be added to the bot to change its
// center of mass and movement characteristics. It can be used to simulate a
// battery or other heavy component.
export type BallastSpec = {
    /**
     * offset from chassis center
     */
    pos: Vec2Like
    size: Vec2Like
    /**
     * Additional mass added to the robot
     */
    mass: number
}

export function toWheels(spec: {
    separation: number
    diameter: number
    width: number
    y: number
}): WheelSpec[] {
    const { separation, diameter, width, y } = spec
    const radius = diameter / 2
    return [
        {
            name: "left",
            maxSpeed: 100,
            pos: { x: -(separation + width) / 2, y },
            width,
            radius,
            dashTime: 0.5,
        },
        {
            name: "right",
            maxSpeed: 100,
            pos: { x: (separation + width) / 2, y },
            width,
            radius,
            dashTime: 0.5,
        },
    ]
}
