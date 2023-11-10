namespace robot.drivers {
    /**
     * A ws2812b LED strip
     */
    export interface LEDStrip {
        start(): void
        setColor(red: number, green: number, blue: number): void
    }

    export interface Sonar {
        start(): void
        distance(maxCmDistance: number): number
    }

    export interface LineDetectors {
        start(): void
        lineState(): RobotLineState
    }

    export interface Arm {
        start(): void
        open(aperture: number): void
    }
}
