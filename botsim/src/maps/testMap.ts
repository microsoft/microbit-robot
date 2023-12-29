import { MAP_ASPECT_RATIO, MICROBIT_COLORS } from "../constants"
import {
    defaultBoxShape,
    defaultColorBrush,
    defaultDynamicPhysics,
    defaultEntity,
    defaultPathShape,
    defaultShapePhysics,
    defaultStaticPhysics,
} from "../sim/specs"
import { pickRandom } from "../util"
import { MapSpec } from "./specs"

const MAP_WIDTH = 90 // cm
const MAP_HEIGHT = MAP_WIDTH / MAP_ASPECT_RATIO

export const name = "Test Map"
export const create = (): MapSpec => ({
    name,
    width: 90, // cm
    aspectRatio: MAP_ASPECT_RATIO,
    color: "#E7E9E7",
    spawns: [
        {
            pos: { x: 20.5, y: 18 },
            //pos: { x: 21, y: 45 / MAP_ASPECT_RATIO },
            angle: 90,
        },
        {
            pos: { x: 20.5, y: MAP_HEIGHT - 18 },
            angle: 90,
        },
    ],
    entities: [
        // Line-following path
        {
            ...defaultEntity(),
            pos: { x: 0, y: 0 },
            angle: 0,
            physics: defaultStaticPhysics(),
            shapes: [
                {
                    ...defaultPathShape(),
                    offset: { x: 0, y: 0 },
                    angle: 0,
                    roles: ["follow-line"],
                    width: 4, // cm
                    stepSize: 0.1,
                    closed: true,
                    verts: [
                        { x: 10, y: MAP_HEIGHT / 2 + 8 },
                        { x: 10, y: MAP_HEIGHT / 2 - 8 },
                        { x: 20, y: 19 },
                        { x: MAP_WIDTH / 2, y: 22 },
                        { x: MAP_WIDTH - 20, y: 19 },
                        { x: MAP_WIDTH - 10, y: MAP_HEIGHT / 2 - 8 },
                        { x: MAP_WIDTH - 10, y: MAP_HEIGHT / 2 + 8 },
                        { x: MAP_WIDTH - 20, y: MAP_HEIGHT - 19 },
                        { x: MAP_WIDTH / 2, y: MAP_HEIGHT - 22 },
                        { x: 20, y: MAP_HEIGHT - 19 },
                    ],
                    brush: {
                        ...defaultColorBrush(),
                        fillColor: "#555555",
                        zIndex: -5,
                    },
                    physics: {
                        ...defaultShapePhysics(),
                        sensor: true,
                    },
                },
            ],
        },
        // Box obstacles
        {
            ...defaultEntity(),
            pos: { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 },
            angle: 0,
            physics: {
                ...defaultDynamicPhysics(),
                linearDamping: 10,
                angularDamping: 10,
            },
            shapes: [
                {
                    ...defaultBoxShape(),
                    offset: { x: -8, y: 0 },
                    size: { x: 10, y: 5 },
                    angle: 90,
                    roles: ["obstacle", "mouse-target"],
                    brush: {
                        ...defaultColorBrush(),
                        fillColor: pickRandom(Object.values(MICROBIT_COLORS)),
                        borderColor: "#444444",
                        borderWidth: 0.25,
                    },
                    physics: {
                        ...defaultShapePhysics(),
                        friction: 0.1,
                        restitution: 0.5,
                        density: 3,
                    },
                },
            ],
        },
        {
            ...defaultEntity(),
            pos: { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 },
            angle: 0,
            physics: {
                ...defaultDynamicPhysics(),
                linearDamping: 10,
                angularDamping: 10,
            },
            shapes: [
                {
                    ...defaultBoxShape(),
                    offset: { x: 8, y: 0 },
                    size: { x: 10, y: 5 },
                    angle: 90,
                    roles: ["obstacle", "mouse-target"],
                    brush: {
                        ...defaultColorBrush(),
                        fillColor: pickRandom(Object.values(MICROBIT_COLORS)),
                        borderColor: "#444444",
                        borderWidth: 0.25,
                    },
                    physics: {
                        ...defaultShapePhysics(),
                        friction: 0.1,
                        restitution: 0.5,
                        density: 3,
                    },
                },
            ],
        },
    ],
})
