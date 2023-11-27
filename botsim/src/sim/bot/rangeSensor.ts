import { Bot } from "."
import { RangeSensorSpec } from "../../bots/specs"

export class RangeSensor {
    constructor(
        private bot: Bot,
        private spec: RangeSensorSpec
    ) {}

    public destroy() {}

    public beforePhysicsStep(dtSecs: number) {}

    public update(dtSecs: number) {}
}
