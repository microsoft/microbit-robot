import { BotSpec } from "./specs"

const spec: BotSpec = {
    name: "Elecfreaks Cutebot",
    productId: 0x3818d146,
    mass: 1,
    silkColor: "#0000F0",
    chassis: {
        shape: "circle",
        texture: "bots/elecfreakscutebot/chassis.png",
        radius: 8.6 / 2, // cm
    },
    wheels: [
        {
            name: "left",
            maxSpeed: 100,
            pos: { x: -3.8, y: 1.5 },
            width: 1.3,
            radius: 3.6 / 2,
            dashTime: 0.5,
        },
        {
            name: "right",
            maxSpeed: 100,
            pos: { x: 3.8, y: 1.5 },
            width: 1.3,
            radius: 3.6 / 2,
            dashTime: 0.5,
        },
    ],
    rangeSensor: {
        beamAngle: 25,
        maxRange: 40,
        pos: { x: 0, y: -4.2 },
    },
    lineSensors: [
        {
            name: "left",
            pos: { x: -0.58, y: -2.74 },
        },
        {
            name: "right",
            pos: { x: 0.58, y: -2.74 },
        },
    ],
    leds: [
        {
            name: "general",
            pos: { x: 0, y: 0 },
            radius: 0,
        },
    ],
    ballast: {
        pos: { x: 0, y: 1.3 },
        size: { x: 3.8, y: 1.6 },
        mass: 10,
    },
}

export default spec
