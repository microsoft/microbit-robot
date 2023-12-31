import { BotSpec, toWheels } from "./specs"

const spec: BotSpec = {
    name: "DFRobot Maqueen",
    productId: 0x325e1e40,
    mass: 1,
    weight: 126,
    silkColor: "#000000",
    chassis: {
        shape: "polygon",
        texture: "bots/dfrobotmaqueen/chassis.png",
        verts: [
            { x: -3.9867187499999996, y: -1.5899999999999999 },
            { x: -2.1199218749999997, y: -3.9 },
            { x: 2.309765625, y: -3.96 },
            { x: 3.955078125, y: -1.4399999999999997 },
            { x: 3.0691406249999997, y: 3.12 },
            { x: 2.4363281249999997, y: 3.8699999999999997 },
            { x: -2.53125, y: 3.8699999999999997 },
            { x: -3.0691406249999997, y: 3.0599999999999996 },
            { x: -3.9867187499999996, y: -0.8099999999999999 },
        ],
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
