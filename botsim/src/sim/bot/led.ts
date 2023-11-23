import { Bot } from "."
import { LEDSpec } from "../../bots/specs"

export class LED {
    constructor(
        private bot: Bot,
        private spec: LEDSpec
    ) {}

    public destroy() {}

    public beforePhysicsStep(dtSecs: number) {}

    public update(dtSecs: number) {}
}
