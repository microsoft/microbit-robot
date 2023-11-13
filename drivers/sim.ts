namespace robot.drivers {
    /**
     * Simulator line detectors; used to marshal simmessages into the robot driver
     */
    export class SimLineDetectors implements LineDetectors {
        current: number[] = [-1, -1, -1, -1, -1]
        constructor() {}

        start(): void {}

        lineState(state: number[]): void {
            for (let i = 0; i < this.current.length; ++i)
                state[i] = this.current[i]
        }
    }

    /**
     * Simulator sonar; used to marshal simmessages into the robot driver
     */
    export class SimSonar implements Sonar {
        current: number = -1
        start(): void {}
        distance(maxCmDistance: number): number {
            return Math.min(this.current, maxCmDistance)
        }
    }
}
