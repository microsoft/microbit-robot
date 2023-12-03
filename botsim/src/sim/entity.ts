import { RenderObject } from "./renderer"
import { PhysicsObject } from "./physics"
import { Vec2Like } from "../types/vec2"
import { Simulation } from "."
import { Container } from "./container"
import { EntitySpec } from "../maps/specs"

/**
 * An Entity is a container for a RenderObject and a PhysicsObject. These two
 * objects represent the visual and physical aspects of the entity,
 * respectively. The Entity class is responsible for keeping these two objects
 * in sync with each other, and for managing the entity's children.
 */
export class Entity extends Container {
    parent: Container | undefined

    private _renderObj!: RenderObject
    private _physicsObj!: PhysicsObject
    public label: string | undefined

    public get sim(): Simulation {
        return this._sim
    }
    public get renderObj() {
        return this._renderObj
    }
    public get physicsObj() {
        return this._physicsObj
    }
    public get pos(): Vec2Like {
        return this.physicsObj.pos
    }
    public set pos(pos: Vec2Like) {
        this.physicsObj.pos = pos
        this.renderObj.sync()
    }
    public get angle(): number {
        return this.physicsObj.angle
    }
    public set angle(angle: number) {
        this.physicsObj.angle = angle
        this.renderObj.sync()
    }

    constructor(
        private _sim: Simulation,
        spec: EntitySpec
    ) {
        super()
        this.label = spec.label
    }

    public init(renderObj: RenderObject, physicsObj: PhysicsObject) {
        this._renderObj = renderObj
        this._physicsObj = physicsObj
        this._renderObj.sync()
    }

    public addChild(ent: Entity): void {
        super.addChild(ent)
        this.physicsObj.add(ent.physicsObj)
        this.sim.renderer.add(ent.renderObj)
    }

    public clear(destroy: boolean = true) {
        if (destroy) {
            this.renderObj.destroy()
            this.physicsObj.destroy()
        }
        super.clear()
    }

    public update(dtSecs: number) {
        this.renderObj.update(dtSecs)
        this.physicsObj.update(dtSecs)
    }

    public beforePhysicsStep(dtSecs: number) {
        this.physicsObj.beforePhysicsStep(dtSecs)
        this.children.forEach((child) => child.beforePhysicsStep(dtSecs))
    }

    public afterPhysicsStep(dtSecs: number) {
        this.physicsObj.afterPhysicsStep(dtSecs)
        this.renderObj.afterPhysicsStep(dtSecs)
        this.children.forEach((child) => child.afterPhysicsStep(dtSecs))
    }
}
