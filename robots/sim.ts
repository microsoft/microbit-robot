namespace robot.robots {
    /**
     * A robot simulator that prevents using any kind of hardware services
     */
    export class SimRobot extends Robot {
        constructor(p: Robot) {
            super(p.productId)

            this.lineDetectors = new drivers.SimLineDetectors()
            this.sonar = new drivers.SimSonar()

            // copy parameters to presever characteristices
            // TODO: validate this make sense
            this.stopThreshold = p.stopThreshold
            this.targetSpeedThreshold = p.targetSpeedThreshold
            this.speedTransitionAlpha = p.speedTransitionAlpha
            this.speedBrakeTransitionAlpha = p.speedBrakeTransitionAlpha
            this.targetTurnRatioThreshold = p.targetTurnRatioThreshold
            this.turnRatioTransitionAlpha = p.turnRatioTransitionAlpha
            this.sonarMinReading = p.sonarMinReading
            this.lineLostThreshold = p.lineLostThreshold
            this.lineHighThreshold = p.lineHighThreshold
            this.commands = p.commands
        }
    }
}