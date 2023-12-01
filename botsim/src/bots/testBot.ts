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
            fillColor: "#11B5E477",
            borderColor: "#555555",
        },
    },
    wheels: [
        {
            label: "left",
            minSpeed: -100,
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
            minSpeed: -100,
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
                // TODO make look nice
                ...defaultColorBrush(),
                fillColor: "red",
                borderColor: "black",
                borderWidth: 0.1,
            },
        },
        {
            label: "right",
            pos: { x: 0.58, y: -2.74 },
            brush: {
                // TODO make look nice
                ...defaultColorBrush(),
                fillColor: "red",
                borderColor: "black",
                borderWidth: 0.1,
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
        pos: { x: -0.8, y: 0 },
        size: { x: 1.6, y: 3.8 },
        mass: 10,
    },
}

export default spec
