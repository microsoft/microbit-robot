import Physics, { createPhysicsObj } from "./physics"
import Renderer, { createRenderObj } from "./renderer"
import { Entity } from "./entity"
import {
    EntitySpec,
    defaultStaticPhysics,
    defaultColorBrush,
    defaultEdgeShape,
    defaultEntity,
    defaultShapePhysics,
    defaultEntityShape,
    EntityShapeSpec,
} from "./specs"
import { BotSpec } from "../bots/specs"
import { Bot } from "./bot"
import { Vec2, Vec2Like } from "../types/vec2"
import { MapSpec, SpawnSpec } from "../maps/specs"

export type LineSensorValues = {
    ["outer-left"]: number
    ["left"]: number
    ["middle"]: number
    ["right"]: number
    ["outer-right"]: number
}

export const defaultLineSensorValues = (): LineSensorValues => ({
    ["outer-left"]: -1,
    ["left"]: -1,
    ["middle"]: -1,
    ["right"]: -1,
    ["outer-right"]: -1,
})

/**
 * The Simulation class is a small game engine. It contains a physics world and
 * a renderer. Each object in the simulation is represented by the Entity class.
 */
export class Simulation {
    private paused = false
    private running = false
    private animframe = 0

    private _physics: Physics
    private _renderer: Renderer
    private _entities: Entity[] = []
    private spawns: SpawnSpec[] = []
    private bots = new Map<number, Bot>()
    private walls?: Entity
    private mousePhysPos = Vec2.zero() // mouse position in physics space

    public debugDraw = false

    public get renderer() {
        return this._renderer
    }
    public get physics() {
        return this._physics
    }
    public get entities() {
        return this._entities
    }
    public bot(deviceId: number): Bot | undefined {
        return this.bots.get(deviceId)
    }

    private constructor() {
        //this.debugDraw = true
        this._renderer = new Renderer(this)
        this._physics = new Physics(this)
        this.buildWalls(this.renderer.logicalSize)
    }

    private static _instance: Simulation
    public static get instance() {
        if (!this._instance) {
            this._instance = new Simulation()
        }
        return this._instance
    }

    public stop() {
        if (!this.running) return
        this.running = false
        window.cancelAnimationFrame(this.animframe)
    }

    public start() {
        if (this.running) return
        this.run()
    }

    public pause() {
        this.paused = true
    }

    public unpause() {
        this.paused = false
    }

    public pauseBots() {
        for (let [_, bot] of this.bots) {
            bot.paused = true
        }
    }

    public unpauseBots() {
        for (let [_, bot] of this.bots) {
            bot.paused = false
        }
    }

    public clear() {
        this._entities.forEach((ent) => ent.destroy())
        this._entities = []
        for (let [_, bot] of this.bots) {
            bot.destroy()
        }
        this.bots = new Map<number, Bot>()
        this._physics.reinit()
        this._renderer.reinit()
    }

    private run() {
        this.running = true
        this.paused = false
        const loop = () => {
            // Use fixed timestep for more consistent physics across devices of
            // varying performance.
            const dtSecs = 1 / 60

            if (!this.paused) {
                this.step(dtSecs)
            }

            this.updateCursor()

            if (this.running) {
                this.animframe = window.requestAnimationFrame(loop)
            }
        }
        this.animframe = window.requestAnimationFrame(loop)
    }

    private step(dtSecs: number) {
        try {
            this.physics.update(dtSecs)
            this.renderer.update(dtSecs)
            this.entities.forEach((ent) => ent.update(dtSecs))
            for (let [_, bot] of this.bots) {
                bot.update(dtSecs)
            }
        } catch (e: any) {
            console.error(e.toString())
        }
    }

    public loadMap(map: MapSpec) {
        this.clear()
        const height = map.width / map.aspectRatio
        const size = Vec2.like(map.width, height)
        this.resize(size)
        this.renderer.color(map.color)
        this.spawns = map.spawns
        if (!this.spawns.length) {
            // Make sure we have at least one spawn location
            this.spawns = [{ pos: Vec2.scale(size, 0.5), angle: 0 }]
        }
        map.entities.forEach((ent) => this.createEntity(ent))
    }

    public spawnBot(
        deviceId: number,
        botSpec: BotSpec | undefined
    ): Bot | undefined {
        if (!botSpec) return

        if (this.bots.has(deviceId)) {
            this.bots.get(deviceId)?.destroy()
        }

        const spawnIndex = this.bots.size % this.spawns.length
        const spawn = this.spawns[spawnIndex]
        if (!spawn) return

        const bot = new Bot(this, spawn, botSpec)
        this.bots.set(deviceId, bot)
        return bot
    }

    public createEntity(spec: EntitySpec): Entity {
        const ent = new Entity(this, spec)
        ent.init(createRenderObj(ent, spec), createPhysicsObj(ent, spec))
        this.addEntity(ent)
        return ent
    }

    private addEntity(ent: Entity) {
        this.entities.push(ent)
        this.physics.add(ent.physicsObj)
        if (this.debugDraw && ent.physicsObj.debugRenderObj)
            this.renderer.addDebugObj(ent.physicsObj.debugRenderObj as any)
        else this.renderer.add(ent.renderObj)
    }

    public removeEntity(ent: Entity) {
        this.entities.splice(this.entities.indexOf(ent), 1)
        ent.destroy()
    }

    public resize(size: Vec2Like) {
        this.renderer.resize(size)
        this.buildWalls(size)
    }

    public mouseDown(canvasp: Vec2Like) {
        const pctp = Vec2.div(canvasp, this.renderer.canvasSize)
        this.mousePhysPos = Vec2.mul(pctp, this.renderer.logicalSize)
        this.physics.mouseDown(this.mousePhysPos)
    }
    public mouseMove(canvasp: Vec2Like) {
        const pctp = Vec2.div(canvasp, this.renderer.canvasSize)
        this.mousePhysPos = Vec2.mul(pctp, this.renderer.logicalSize)
        this.physics.mouseMove(this.mousePhysPos)
    }
    public mouseUp(canvasp: Vec2Like) {
        const pctp = Vec2.div(canvasp, this.renderer.canvasSize)
        this.mousePhysPos = Vec2.mul(pctp, this.renderer.logicalSize)
        this.physics.mouseUp(this.mousePhysPos)
    }
    private updateCursor() {
        if (this.physics.mouseJoint) {
            this.renderer.setCanvasCursor("grabbing")
        } else {
            const isMouseTarget = this.physics.isMouseTarget(this.mousePhysPos)
            this.renderer.setCanvasCursor(isMouseTarget ? "grab" : "default")
        }
    }

    private buildWalls(size: Vec2Like) {
        // TODO: Entity destoy path is not fleshed out yet
        if (this.walls) {
            this.removeEntity(this.walls)
            this.walls = undefined
        }
        const wallCommon: EntityShapeSpec = {
            ...defaultEntityShape(),
            ...defaultEdgeShape(),
            offset: { x: 0, y: 0 },
            roles: ["wall"],
            brush: {
                ...defaultColorBrush(),
                borderColor: "#fff",
            },
            physics: {
                ...defaultShapePhysics(),
                restitution: 0.5,
                friction: 0.5,
            },
        }
        this.walls = this.createEntity({
            ...defaultEntity(),
            pos: { x: 0, y: 0 },
            angle: 0,
            physics: {
                ...defaultStaticPhysics(),
            },
            shapes: [
                {
                    ...defaultEntityShape(),
                    ...defaultEdgeShape(),
                    ...wallCommon,
                    v0: { x: 0, y: 0 },
                    v1: { x: size.x, y: 0 },
                },
                {
                    ...defaultEntityShape(),
                    ...defaultEdgeShape(),
                    ...wallCommon,
                    v0: { x: size.x, y: 0 },
                    v1: { x: size.x, y: size.y },
                },
                {
                    ...defaultEntityShape(),
                    ...defaultEdgeShape(),
                    ...wallCommon,
                    v0: { x: size.x, y: size.y },
                    v1: { x: 0, y: size.y },
                },
                {
                    ...defaultEntityShape(),
                    ...defaultEdgeShape(),
                    ...wallCommon,
                    v0: { x: 0, y: size.y },
                    v1: { x: 0, y: 0 },
                },
            ],
        })
    }
}
