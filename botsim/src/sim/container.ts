import { Entity } from "./entity"

// Container for entities. Probably overcomplicating things with this.
// TODO: Consider using a regular array, and representing parent/child relationships in a separate map.
export class Container {
    private _children: Entity[] = []

    public get children() {
        return this._children
    }

    public addChild(ent: Entity) {
        ent.parent?.removeChild(ent)
        this._children.push(ent)
        ent.parent = this
    }

    public removeChild(ent: Entity) {
        const idx = this._children.indexOf(ent)
        if (idx >= 0) {
            this._children.splice(idx, 1)
        }
    }

    public clear(destroy: boolean = true) {
        this._children.forEach((child) => child.clear(destroy))
        this._children = []
    }
}
