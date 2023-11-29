import { MAP_ASPECT_RATIO } from "../sim/constants"
import {
    BrushSpec,
    MapSpec,
    ShapePhysicsSpec,
    defaultBoxShape,
    defaultColorBrush,
    defaultEntity,
    defaultShapePhysics,
    defaultStaticPhysics,
} from "./specs"

const boxBrush: BrushSpec = {
    ...defaultColorBrush(),
    fillColor: "#DC965A",
    borderColor: "FBFBFF",
    borderWidth: 0.5,
}

const boxPhysics: ShapePhysicsSpec = {
    ...defaultShapePhysics(),
    friction: 0.001,
    restitution: 1,
}

const spec: MapSpec = {
    name: "Test Map",
    size: { x: 90 * MAP_ASPECT_RATIO, y: 90 }, // about 3 feet square (30cm ~ 1ft)
    color: "#50C878",
    spawn: {
        pos: { x: 10, y: 10 },
        angle: 30,
    },
    entities: [
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
    ],
}

export default spec
