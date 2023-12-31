import { BotSpec, toWheels } from "./specs"

const spec: BotSpec = {
    name: "DFRobot Maqueen Plus V2",
    productId: 0x3375036b,
    mass: 1,
    weight: 208,
    silkColor: "#000000",
    chassis: {
        shape: "polygon",
        texture: "bots/dfrobotmaqueenplusv2/chassis.png",
        verts: [
            { x: -5, y: 0.5185185185185185 },
            { x: -4.6484375, y: -1.5555555555555556 },
            { x: -2.0703125, y: -4.851851851851852 },
            { x: 1.484375, y: -4.962962962962963 },
            { x: 4.8046875, y: -0.8888888888888888 },
            { x: 4.8828125, y: 3.8518518518518516 },
            { x: 3.125, y: 4.851851851851852 },
            { x: -2.96875, y: 4.888888888888889 },
            { x: -4.84375, y: 3.962962962962963 },
            { x: -5, y: 0.7407407407407407 },
        ],
    },
    wheels: toWheels({
        separation: 8.7,
        diameter: 4.2,
        width: 1,
        y: 1.4,
    }),
    rangeSensor: {
        beamAngle: 25, // degrees
        maxRange: 40, // cm
        pos: { x: 0, y: -4.7 },
    },
    // Recognized line sensor names: "outer-left", "left", "middle", "right", "outer-right"
    lineSensors: [
        {
            name: "left",
            // offset to center of sensor from chassis center
            pos: { x: -0.9, y: -3.8 },
        },
        {
            name: "middle",
            // offset to center of sensor from chassis center
            pos: { x: 0, y: -3.8 },
        },
        {
            name: "right",
            // offset to center of sensor from chassis center
            pos: { x: 0.9, y: -3.8 },
        },
    ],
    leds: [
        {
            name: "general", // Generalized/non-specific LED
            pos: { x: 0, y: 0 },
            radius: 0, // The "general" LED takes its shape and size from the chassis
        },
    ],
}

export default spec
