import { BotSpec, toWheels } from "./specs"

const spec: BotSpec = {
    name: "DFRobot Maqueen Plus V2",
    productId: 0x3375036b,
    mass: 1,
    weight: 208,
    silkColor: "#000000",
    chassis: {
        shape: "box",
        size: { x: 10.0, y: 10.7 },
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
