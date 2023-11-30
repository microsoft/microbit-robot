import { MAP_ASPECT_RATIO } from "../sim/constants"
import {
    BrushSpec,
    MapSpec,
    ShapePhysicsSpec,
    defaultBoxShape,
    defaultColorBrush,
    defaultEntity,
    defaultPathShape,
    defaultShapePhysics,
    defaultStaticPhysics,
} from "./specs"

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
        pos: { x: 45, y: 45 / MAP_ASPECT_RATIO },
        angle: 0,
    },
    entities: [
        {
            ...defaultEntity(),
            label: "path entity",
            pos: { x: 0, y: 0 },
            angle: 0,
            physics: defaultStaticPhysics(),
            shapes: [
                {
                    ...defaultPathShape(),
                    label: "path shape",
                    offset: { x: 0, y: 0 },
                    angle: 0,
                    width: 1.5, // cm
                    verts: [
                    
                        { x: 25, y: 10 },
                        { x: 55, y: 10 },
                        { x: 70, y: 20 },
                        { x: 70, y: 50 },
                        { x: 55, y: 60 },
                        { x: 25, y: 60 },
                        { x: 10, y: 50 },
                        { x: 10, y: 20 },
                        
                        /*
                        { x: 25, y: 10 },
                        { x: 30, y: 10 },
                        { x: 35, y: 10 },
                        { x: 40, y: 10 },
                        { x: 45, y: 10 },
                        { x: 50, y: 10 },
                        */
                        /*
                        { x: 10, y: 10 },
                        { x: 20, y: 20 },
                        { x: 30, y: 30 },
                        { x: 40, y: 40 },
                        */
                    ],
                    closed: true,
                    brush: {
                        ...defaultColorBrush(),
                        fillColor: "#2A2B2E",
                        zIndex: -5,
                    },
                    physics: {
                        ...defaultShapePhysics(),
                        sensor: true,
                    },
                }
            ]
        },
        /*
        // This entity is a group of static boxes. Alternatively, each box could
        // be specified as an individual entity.
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
