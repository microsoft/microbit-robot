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
            fillColor: "#11B5E4",
            borderColor: "#555",
        },
    },
    wheels: [
        {
            label: "left",
            minSpeed: -100,
            maxSpeed: 100,
            pos: { x: -1.5, y: -3.8 },
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
            pos: { x: -1.5, y: 3.8 },
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
            pos: { x: 5, y: 1 },
            brush: {
                // TODO
                ...defaultColorBrush(),
            },
        },
        {
            label: "right",
            pos: { x: 5, y: -1 },
            brush: {
                // TODO
                ...defaultColorBrush(),
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
