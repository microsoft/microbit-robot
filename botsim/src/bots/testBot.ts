import { defaultCircleShape, defaultColorBrush } from "../maps/specs"
import { BotSpec } from "./specs"

const spec: BotSpec = {
    name: "Test Bot",
    chassis: {
        shape: {
            ...defaultCircleShape(),
            radius: 8.6 / 2, // cm
            //...defaultBoxShape(),
            //size: { x: 8.6, y: 8.6 },
        },
        brush: {
            // TODO: Make this a texture
            ...defaultColorBrush(),
            fillColor: "#11B5E499",
            borderColor: "#555555",
        },
    },
    wheels: [
        {
            label: "left",
            maxSpeed: 100,
            pos: { x: -3.8, y: 1.5 },
            width: 1.3,
            radius: 3.6 / 2,
            brush: {
                // TODO: Make this an animated texture or pattern
                ...defaultColorBrush(),
                fillColor: "#212738",
                borderColor: "black",
                borderWidth: 0.2,
                zIndex: 1,
            },
        },
        {
            label: "right",
            maxSpeed: 100,
            pos: { x: 3.8, y: 1.5 },
            width: 1.3,
            radius: 3.6 / 2,
            brush: {
                // TODO: Make this an animated texture or pattern
                ...defaultColorBrush(),
                fillColor: "#212738",
                borderColor: "black",
                borderWidth: 0.2,
                zIndex: 1,
            },
        },
    ],
    rangeSensor: {
        angle: 10,
        pos: { x: 4.5, y: 0 },
        brush: {
            // TODO
            ...defaultColorBrush(),
        },
    },
    lineSensors: [
        {
            label: "left",
            pos: { x: -0.58, y: -2.74 },
            brush: {
                on: {
                    // TODO make look nice
                    ...defaultColorBrush(),
                    fillColor: "white",
                    borderColor: "white",
                    borderWidth: 0.1,
                },
                off: {
                    // TODO make look nice
                    ...defaultColorBrush(),
                    fillColor: "black",
                    borderColor: "black",
                    borderWidth: 0.1,
                },
            },
        },
        {
            label: "right",
            pos: { x: 0.58, y: -2.74 },
            brush: {
                on: {
                    // TODO make look nice
                    ...defaultColorBrush(),
                    fillColor: "white",
                    borderColor: "white",
                    borderWidth: 0.1,
                },
                off: {
                    // TODO make look nice
                    ...defaultColorBrush(),
                    fillColor: "black",
                    borderColor: "black",
                    borderWidth: 0.1,
                },
            },
        },
    ],
    leds: [
        {
            label: "left",
            pos: { x: 4.5, y: 1.5 },
            brush: {
                // TODO
                ...defaultColorBrush(),
            },
        },
        {
            label: "right",
            pos: { x: 4.5, y: -1.5 },
            brush: {
                // TODO
                ...defaultColorBrush(),
            },
        },
    ],
    ballast: {
        pos: { x: 0, y: -0.8 },
        size: { x: 3.8, y: 1.6 },
        mass: 10,
    },
}

export default spec
