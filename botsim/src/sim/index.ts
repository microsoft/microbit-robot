import Physics, { createPhysicsObj } from "./physics"
import Renderer, { createRenderObj } from "./renderer"
import { Entity } from "./entity"
import {
    MapSpec,
    EntitySpec,
    SpawnSpec,
    defaultSpawn,
    defaultStaticPhysics,
    defaultColorBrush,
    defaultEdgeShape,
    defaultEntity,
    defaultShapePhysics,
    defaultEntityShape,
} from "../maps/specs"
import { BotSpec } from "../bots/specs"
import { Bot } from "./bot"
import { Container } from "./container"
import { InputState, registerInputState } from "../services/inputService"
import { Vec2, Vec2Like } from "../types/vec2"

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

export class Simulation extends Container {
    private paused = false
    private running = false
    private animframe = 0

    private _physics: Physics
    private _renderer: Renderer
    private _input: InputState

    private _spawn: SpawnSpec
    private _bot?: Bot
    private walls?: Entity

    public debugDraw = false

    public get renderer() {
        return this._renderer
    }
    public get physics() {
        return this._physics
    }
    public get input() {
        return this._input
    }
    public get spawn() {
        return this._spawn
    }
    public get bot() {
        return this._bot
    }

    private constructor() {
        super()
        this.debugDraw = true
        this._renderer = new Renderer(this)
        this._physics = new Physics(this)
        this._spawn = defaultSpawn()

        this.buildWalls(this.renderer.size)

        this._input = new InputState(
            [
                // left wheel motor
                "KeyW",
                "KeyS",
                "GamepadAxisLeftStickY",
                // right wheel motor
                "KeyI",
                "KeyK",
                "GamepadAxisRightStickY",
                // general direction
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight",
            ],
            {}
        )

        registerInputState(this._input)
    }

    // To complicate things, make allocating the simulation async
    public static async createAsync() {
        const sim = new this()
        return sim
    }

    // To simplify things, make a static instance available
    static instance: Promise<Simulation>
    static async getAsync(): Promise<Simulation> {
        if (!this.instance) {
            this.instance = new Promise<Simulation>(async (resolve) => {
                const sim = await this.createAsync()
                resolve(sim)
            })
        }
        return this.instance
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

    public clear() {
        super.clear(true)
        this._bot = undefined
        this._physics.reinit()
        this._renderer.reinit()
    }

    private run() {
        this.running = true
        this.paused = false
        let prevMs = performance.now()
        const loop = () => {
            const currMs = performance.now()
            let dtMs = currMs - prevMs
            prevMs = currMs
            // Avoid instabilities from large time jumps (window was in background)
            if (dtMs > 100) dtMs = 100
            let dtSecs = dtMs / 1000

            if (!this.paused) {
                this.step(dtSecs)
            }

            if (this.running) {
                this.animframe = window.requestAnimationFrame(loop)
            }
        }
        this.animframe = window.requestAnimationFrame(loop)
    }

    private step(dtSecs: number) {
        try {
            this.physics.update(dtSecs)
            this.children.forEach((ent) => ent.update(dtSecs))
            // Update bot (and other controllers?) to step things (like animations (and AI?))
            this._bot?.update(dtSecs)
        } catch (e: any) {
            console.error(e.toString())
        }
    }

    public beforePhysicsStep(dtSecs: number) {
        this._bot?.beforePhysicsStep(dtSecs)
        this.children.forEach((ent) => ent.beforePhysicsStep(dtSecs))
    }

    public afterPhysicsStep(dtSecs: number) {
        this.children.forEach((ent) => ent.afterPhysicsStep(dtSecs))
    }

    public loadMap(map: MapSpec) {
        this.clear()
        const height = map.width / map.aspectRatio
        const size = new Vec2(map.width, height)
        this.resize(size)
        this.renderer.color(map.color)
        this._spawn = map.spawn ?? {
            pos: {
                x: size.x / 2,
                y: size.y / 2,
            },
            angle: 90,
        }
        map.entities.forEach((ent) => this.createEntity(ent))
    }

    public createBot(botSpec: BotSpec) {
        if (this._bot) {
            this._bot.destroy()
        }
        this._bot = new Bot(this, botSpec)
    }

    public createEntity(spec: EntitySpec, parent?: Container): Entity {
        if (!parent) parent = this
        const ent = new Entity(this, spec)
        ent.init(createRenderObj(ent, spec), createPhysicsObj(ent, spec))
        parent.addChild(ent)
        spec.children?.forEach((child) => this.createEntity(child, ent))
        return ent
    }

    public addChild(ent: Entity) {
        super.addChild(ent)
        this.physics.add(ent.physicsObj)
        this.renderer.add(ent.renderObj)
        //this.renderer.addDebugObj(ent.physicsObj.debugRenderObj as any)
    }

    public resize(size: Vec2Like) {
        this.renderer.resize(size)
        this.buildWalls(size)
    }

    private buildWalls(size: Vec2Like) {
        // TODO: Entity destoy path is not fleshed out yet
        if (this.walls) {
            this.removeChild(this.walls)
            this.walls.physicsObj.destroy()
        }
        const wallCommon = {
            ...defaultEntityShape(),
            ...defaultEdgeShape(),
            offset: { x: 0, y: 0 },
            brush: {
                ...defaultColorBrush(),
                borderColor: "#fff",
            },
            physics: {
                ...defaultShapePhysics(),
                restitution: 1,
            },
        }
        this.walls = this.createEntity({
            ...defaultEntity(),
            pos: { x: 0, y: 0 },
            angle: 0,
            physics: defaultStaticPhysics(),
            shapes: [
                {
                    ...defaultEntityShape(),
                    ...defaultEdgeShape(),
                    ...wallCommon,
                    v0: { x: 0, y: 0 },
                    v1: { x: this.renderer.size.x, y: 0 },
                    label: "wall.top",
                },
                {
                    ...defaultEntityShape(),
                    ...defaultEdgeShape(),
                    ...wallCommon,
                    v0: { x: this.renderer.size.x, y: 0 },
                    v1: { x: this.renderer.size.x, y: this.renderer.size.y },
                    label: "wall.right",
                },
                {
                    ...defaultEntityShape(),
                    ...defaultEdgeShape(),
                    ...wallCommon,
                    v0: { x: this.renderer.size.x, y: this.renderer.size.y },
                    v1: { x: 0, y: this.renderer.size.y },
                    label: "wall.bottom",
                },
                {
                    ...defaultEntityShape(),
                    ...defaultEdgeShape(),
                    ...wallCommon,
                    v0: { x: 0, y: this.renderer.size.y },
                    v1: { x: 0, y: 0 },
                    label: "wall.left",
                },
            ],
        })
    }

    public setMotors(deviceId: number, left: number, right: number) {
        // TODO: Lookup or create bot by deviceId
        this._bot?.setMotors(left, right)
    }

    public readLineSensors(deviceId: number): LineSensorValues {
        if (this.bot) {
            return this.bot.readLineSensors()
        } else {
            return defaultLineSensorValues()
        }
    }

    public readRangeSensor(deviceId: number): number {
        if (this.bot) {
            return this.bot.readRangeSensor()
        } else {
            return -1
        }
    }
}
