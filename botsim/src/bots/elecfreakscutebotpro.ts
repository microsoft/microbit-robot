import { BotSpec, toWheels } from "./specs"

const spec: BotSpec = {
    name: "Elecfreaks Cutebot PRO",
    productId: 0x31e95c0a,
    mass: 1,
    weight: 199,
    silkColor: "#0000F0",
    chassis: {
        shape: "polygon",
        // The vertices below are an approximation of the hull shape, a concave
        // polygon. The collidable geometry for this shape will be a convex
        // polygon wrapping these points.
        verts: [
            { x: 0.0, y: -6.5 },
            { x: 1.0, y: -6.4 },
            { x: 2.0, y: -6.3 },
            { x: 3.0, y: -6.1 },
            { x: 3.5, y: -5.75 },
            { x: 4.0, y: -5.0 },
            { x: 4.3, y: -4.0 },
            { x: 5.0, y: -2.66 },
            { x: 5.75, y: -1.33 },
            { x: 5.8, y: -1.0 },
            { x: 5.8, y: -0.4 },
            { x: 5.5, y: 0.0 },
            { x: 3.8, y: 0.0 },
            { x: 3.5, y: 0.4 },
            { x: 3.5, y: 5.6 },
            { x: 3.6, y: 5.8 },
            { x: 3.6, y: 6.1 },
            { x: 3.0, y: 6.45 },
            { x: 2.0, y: 6.8 },
            { x: 1.5, y: 6.9 },
            { x: 1.0, y: 6.7 },
            { x: 0.5, y: 6.6 },
            { x: 0.0, y: 6.6 },
            { x: -0.5, y: 6.6 },
            { x: -1.0, y: 6.7 },
            { x: -1.5, y: 6.9 },
            { x: -2.0, y: 6.8 },
            { x: -3.0, y: 6.45 },
            { x: -3.6, y: 6.1 },
            { x: -3.6, y: 5.8 },
            { x: -3.5, y: 5.6 },
            { x: -3.5, y: 0.4 },
            { x: -3.8, y: 0.0 },
            { x: -5.5, y: 0.0 },
            { x: -5.8, y: -0.4 },
            { x: -5.8, y: -1.0 },
            { x: -5.75, y: -1.33 },
            { x: -5.0, y: -2.66 },
            { x: -4.3, y: -4.0 },
            { x: -4.0, y: -5.0 },
            { x: -3.5, y: -5.75 },
            { x: -3.0, y: -6.1 },
            { x: -2.0, y: -6.3 },
            { x: -1.0, y: -6.4 },
        ],
    },
    wheels: toWheels({
        separation: 7.4,
        diameter: 5.0,
        width: 1.8,
        y: 2.9,
    }),
    rangeSensor: {
        beamAngle: 25,
        maxRange: 40,
        pos: { x: 0, y: -5 },
    },
    lineSensors: [
        {
            name: "outer-left",
            pos: { x: -2.9, y: -2.4 },
        },
        {
            name: "left",
            pos: { x: -0.58, y: -2.4 },
        },
        {
            name: "right",
            pos: { x: 0.58, y: -2.4 },
        },
        {
            name: "outer-right",
            pos: { x: 2.9, y: -2.4 },
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
