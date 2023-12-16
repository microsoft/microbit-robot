import { BotSpec, toWheels } from "./specs"

const spec: BotSpec = {
    name: "DFRobot Maqueen",
    productId: 0x325e1e40,
    mass: 1,
    weight: 126,
    silkColor: "#000000",
    chassis: {
        shape: "box",
        size: { x: 8.1, y: 8.4 },
    },
    wheels: toWheels({
        separation: 6.2,
        diameter: 4.2,
        width: 1,
        y: 1.9,
    }),
    rangeSensor: {
        beamAngle: 25, // degrees
        maxRange: 40, // cm
        pos: { x: 0, y: -1.5 },
    },
    // Recognized line sensor names: "outer-left", "left", "middle", "right", "outer-right"
    lineSensors: [
        {
            name: "left",
            // offset to center of sensor from chassis center
            pos: { x: -0.6, y: -1.6 },
        },
        {
            name: "right",
            // offset to center of sensor from chassis center
            pos: { x: 0.6, y: -1.6 },
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
