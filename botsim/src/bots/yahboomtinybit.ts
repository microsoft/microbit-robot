import { BotSpec } from "./specs"

const spec: BotSpec = {
    name: "Yahboom Tiny:bit",
    productId: 0x345f8369,
    mass: 1,
    weight: 179,
    silkColor: "#000000",
    chassis: {
        shape: "circle",
        radius: 10 / 2,
    },
    wheels: [
        {
            name: "left",
            maxSpeed: 100,
            pos: { x: -(7.2 / 2 - 1.7 / 2), y: 1.9 },
            width: 1.7,
            radius: 4.2 / 2,
            dashTime: 0.5,
        },
        {
            name: "right",
            maxSpeed: 100,
            pos: { x: 7.2 / 2 - 1.7 / 2, y: 1.9 },
            width: 1.7,
            radius: 4.2 / 2,
            dashTime: 0.5,
        },
    ],
    rangeSensor: {
        beamAngle: 25, // degrees
        maxRange: 40, // cm
        pos: { x: 0, y: -2.5 },
    },
    // Recognized line sensor names: "outer-left", "left", "middle", "right", "outer-right"
    lineSensors: [
        {
            name: "left",
            // offset to center of sensor from chassis center
            pos: { x: -2.8 / 3, y: -2.3 },
        },
        {
            name: "right",
            // offset to center of sensor from chassis center
            pos: { x: 2.8 / 2, y: -2.3 },
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
