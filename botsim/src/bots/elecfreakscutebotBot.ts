import { BotSpec } from "./specs"

const spec: BotSpec = {
    name: "Elecfreaks Cutebot",
    productId: 0x3818d146,
    chassis: {
        shape: "circle",
        radius: 8.6 / 2, // cm
    },
    // Recognized wheel names: "left", "right"
    wheels: [
        {
            name: "left",
            maxSpeed: 100,
            // offset to center of wheel from chassis center
            pos: { x: -3.8, y: 1.5 },
            // wheel width
            width: 1.3,
            // wheel radius
            radius: 3.6 / 2,
        },
        {
            name: "right",
            maxSpeed: 100,
            // offset to center of wheel from chassis center
            pos: { x: 3.8, y: 1.5 },
            // wheel width
            width: 1.3,
            // wheel radius
            radius: 3.6 / 2,
        },
    ],
    rangeSensor: {
        beamAngle: 25, // degrees
        maxRange: 40, // cm
        pos: { x: 0, y: -4.2 },
    },
    // Recognized line sensor names: "outer-left", "left", "middle", "right", "outer-right"
    lineSensors: [
        {
            name: "left",
            // offset to center of sensor from chassis center
            pos: { x: -0.58, y: -2.74 },
        },
        {
            name: "right",
            // offset to center of sensor from chassis center
            pos: { x: 0.58, y: -2.74 },
        },
    ],
    leds: [
        /*
        {
            name: "left",
            pos: { x: 4.5, y: 1.5 },
            brush: {
                ...defaultColorBrush(),
            },
        },
        {
            name: "right",
            pos: { x: 4.5, y: -1.5 },
            brush: {
                ...defaultColorBrush(),
            },
        },
    */
        {
            name: "general", // Generalized/non-specific LED
            pos: { x: 0, y: 0 },
            radius: 0, // The "general" LED takes its shape and size from the chassis
        },
    ],
    // Ballast can be used to adjust the center of mass of the bot.
    // Here it represents a battery located between the wheels.
    ballast: {
        pos: { x: 0, y: 1.3 },
        size: { x: 3.8, y: 1.6 },
        mass: 10,
    },
}

export default spec
