import { Bot } from "."
import { LineSensorSpec } from "../../bots/specs"

export class LineSensor {
    constructor(
        private bot: Bot,
        private spec: LineSensorSpec
    ) {}

    public destroy() {}

    public beforePhysicsStep(dtSecs: number) {}

    public update(dtSecs: number) {}
}
