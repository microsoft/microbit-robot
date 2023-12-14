import { defaultCircleShape, defaultColorBrush } from "../sim/specs"
import { BotSpec } from "./specs"

const wheelBrush = {
    // TODO: Make this an animated texture or pattern
    ...defaultColorBrush(),
    fillColor: "#212738",
    borderColor: "black",
    borderWidth: 0.2,
    zIndex: 1,
}

const lineSensorBrush = {
    on: {
        ...defaultColorBrush(),
        fillColor: "white",
        borderColor: "white",
        borderWidth: 0.1,
    },
    off: {
        ...defaultColorBrush(),
        fillColor: "black",
        borderColor: "black",
        borderWidth: 0.1,
    },
}

const spec: BotSpec = {
    name: "Test Bot",
    productId: 0,
    chassis: {
        shape: {
            ...defaultCircleShape(),
            radius: 8.6 / 2, // cm
        },
        brush: {
            ...defaultColorBrush(),
            fillColor: "#11B5E499",
            borderColor: "#555555",
        },
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
            brush: wheelBrush,
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
            brush: wheelBrush,
        },
    ],
    rangeSensor: {
        beamAngle: 25, // degrees
        maxRange: 40, // cm
        pos: { x: 0, y: -4.2 },
        brush: {
            positive: {
                ...defaultColorBrush(),
                fillColor: "#00F76530",
                borderColor: "#00F76540",
                borderWidth: 0.25,
            },
            negative: {
                ...defaultColorBrush(),
                fillColor: "#A1A1A120",
                borderColor: "#A1A1A130",
                borderWidth: 0.25,
            },
        },
    },
    // Recognized line sensor names: "outer-left", "left", "middle", "right", "outer-right"
    lineSensors: [
        {
            name: "left",
            // offset to center of sensor from chassis center
            pos: { x: -0.58, y: -2.74 },
            brush: lineSensorBrush,
        },
        {
            name: "right",
            // offset to center of sensor from chassis center
            pos: { x: 0.58, y: -2.74 },
            brush: lineSensorBrush,
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
