import { BotSpec, toWheels } from "./specs"

const spec: BotSpec = {
    name: "Forward Education Smart Vehicle",
    productId: 0xdeadbeef,
    mass: 1,
    weight: 126,
    silkColor: "#000000",
    chassis: {
        shape: "polygon",
        texture: "bots/fwdeducakit/chassis.png",
        verts: [{ "x": -5.494855004677269, "y": 1.5931909982688979 },
            { "x": -4.568755846585594, "y": -4.043277553375649 },
            { "x": -4.476145930776426, "y": -4.144835545297172 },
            { "x": -1.6875584658559402, "y": -5.477784189267167 },
            { "x": 1.7081384471468661, "y": -5.496826312752453 },
            { "x": 4.373246024321796, "y": -4.278130409694172 },
            { "x": 4.496725912067353, "y": -4.170225043277553 },
            { "x": 4.5481758652946676, "y": -3.986151182919792 },
            { "x": 4.836295603367633, "y": -2.354875937680323 },
            { "x": 5.494855004677269, "y": 1.624927870744374 },
            { "x": 5.494855004677269, "y": 2.177149451817657 },
            { "x": 4.7025257249766135, "y": 5.173110213502596 },
            { "x": 4.332086061739944, "y": 5.471436814772072 },
            { "x": -4.270346117867166, "y": 5.477784189267167 },
            { "x": -4.681945743685688, "y": 5.071552221581073 },
            { "x": -5.494855004677269, "y": 2.240623196768609 } ]
    },
    wheels: toWheels({
        separation: 13.5,
        diameter: 6.0,
        width: 0.7,
        y: 3.0,
    }),
    rangeSensor: {
        beamAngle: 25, // degrees
        maxRange: 40, // cm
        pos: { x: 0, y: -10.5 },
    },
    // Recognized line sensor names: "outer-left", "left", "middle", "right", "outer-right"
    lineSensors: [
        {
            name: "left",
            // offset to center of sensor from chassis center
            pos: { x: -1.0, y: -9.5 },
        },
        {
            name: "middle",
            // offset to center of sensor from chassis center
            pos: { x: -0.0, y: -9.5 },
        },
        {
            name: "right",
            // offset to center of sensor from chassis center
            pos: { x: 1.0, y: -9.5 },
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
