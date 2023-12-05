import { MAP_ASPECT_RATIO } from "../sim/constants"
import {
    BrushSpec,
    ShapePhysicsSpec,
    defaultColorBrush,
    defaultEntity,
    defaultPathShape,
    defaultShapePhysics,
    defaultStaticPhysics,
} from "../sim/specs"
import { MapSpec } from "./specs"

const boxBrush: BrushSpec = {
    ...defaultColorBrush(),
    fillColor: "#DC965A",
    borderColor: "#D85E44",
    borderWidth: 0.5,
}

const boxPhysics: ShapePhysicsSpec = {
    ...defaultShapePhysics(),
    friction: 0.001,
    restitution: 1,
}

const spec: MapSpec = {
    name: "Test Map",
    width: 90, // cm
    aspectRatio: MAP_ASPECT_RATIO, // width / height
    color: "#ffffff",
    spawn: {
        pos: { x: 18, y: 16 },
        angle: 90,
    },
    entities: [
        {
            ...defaultEntity(),
            label: "path",
            pos: { x: 0, y: 0 },
            angle: 0,
            physics: defaultStaticPhysics(),
            shapes: [
                {
                    ...defaultPathShape(),
                    offset: { x: 0, y: 0 },
                    angle: 0,
                    roles: ["follow-line"],
                    width: 3, // cm
                    stepSize: 0.1,
                    closed: true,
                    verts: [
                        { x: 15, y: 18 },
                        { x: 45, y: 20 },
                        { x: 75, y: 18 },
                        { x: 75, y: 57 },
                        { x: 45, y: 55 },
                        { x: 15, y: 57 },
                    ],
                    brush: {
                        ...defaultColorBrush(),
                        fillColor: "#666666",
                        zIndex: -5,
                    },
                    physics: {
                        ...defaultShapePhysics(),
                        sensor: true,
                    },
                },
            ],
        },

        // This entity is a group of static boxes. Alternatively, each box could
        // be specified as an individual entity.
        /*
        {
            ...defaultEntity(),
            label: "boxes",
            pos: { x: 0, y: 0 },
            angle: 0,
            physics: defaultStaticPhysics(),
            shapes: [
                {
                    ...defaultBoxShape(),
                    label: "box1",
                    offset: { x: 10, y: 40 },
                    size: { x: 5, y: 5 },
                    angle: 20,
                    brush: boxBrush,
                    physics: boxPhysics,
                },
                {
                    ...defaultBoxShape(),
                    label: "box2",
                    offset: { x: 40, y: 60 },
                    size: { x: 5, y: 10 },
                    angle: 90,
                    brush: boxBrush,
                    physics: boxPhysics,
                },
                {
                    ...defaultBoxShape(),
                    label: "box3",
                    offset: { x: 86, y: 45 },
                    size: { x: 6, y: 30 },
                    angle: 170,
                    brush: boxBrush,
                    physics: boxPhysics,
                },
            ],
        },
        */
    ],
}

export default spec
