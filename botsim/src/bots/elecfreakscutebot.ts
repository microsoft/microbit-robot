import { BotSpec } from "./specs"

const spec: BotSpec = {
    name: "Elecfreaks Cutebot",
    productId: 0x3818d146,
    mass: 1,
    silkColor: "#0000F0",
    chassis: {
        shape: "polygon",
        texture: "bots/elecfreakscutebot/chassis.png",
        verts: [
            { x: -4.282868525896414, y: -0.57109375 },
            { x: -4.145816733067729, y: -1.2765625 },
            { x: -3.9402390438247012, y: -1.8140625 },
            { x: -3.6661354581673304, y: -2.31796875 },
            { x: -3.049402390438247, y: -3.19140625 },
            { x: -1.952988047808765, y: -4.19921875 },
            { x: -0.650996015936255, y: -4.3 },
            { x: 0.6852589641434262, y: -4.3 },
            { x: 2.055776892430279, y: -4.13203125 },
            { x: 2.9808764940239043, y: -3.2585937499999997 },
            { x: 3.6661354581673304, y: -2.38515625 },
            { x: 4.043027888446215, y: -1.64609375 },
            { x: 4.282868525896414, y: -0.8062499999999999 },
            { x: 4.282868525896414, y: 4.26640625 },
            { x: -4.282868525896414, y: 4.26640625 },
        ],
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
