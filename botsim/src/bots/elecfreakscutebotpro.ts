import { BotSpec, toWheels } from "./specs"

const spec: BotSpec = {
    name: "Elecfreaks Cutebot PRO",
    productId: 0x31e95c0a,
    mass: 1,
    weight: 199,
    silkColor: "#0000F0",
    chassis: {
        shape: "box",
        size: { x: 11.4, y: 12.8 },
    },
    wheels: toWheels({
        separation: 7.4,
        diameter: 5.0,
        width: 1.8,
        y: 1.5,
    }),
    rangeSensor: {
        beamAngle: 25,
        maxRange: 40,
        pos: { x: 0, y: -5 },
    },
    lineSensors: [
        {
            name: "outer-left",
            pos: { x: -2.9, y: -2.8 },
        },
        {
            name: "left",
            pos: { x: -0.58, y: -2.8 },
        },
        {
            name: "right",
            pos: { x: 0.58, y: -2.8 },
        },
        {
            name: "outer-right",
            pos: { x: 2.9, y: -2.8 },
        },
    ],
    leds: [
        {
            name: "general",
            pos: { x: 0, y: 0 },
            radius: 0,
        },
    ],
}

export default spec
