/**
 * Index of the line detectors
 */
enum LineDetector {
    /**
     * block="outer left"
     */
    OuterLeft = 0,
    /**
     * block="left"
     */
    Left = 1,
    /**
     * block="middle"
     */
    Middle = 2,
    /**
     * block="right"
     */
    Right = 3,
    /**
     * block="outer right"
     */
    OuterRight = 4,
}

namespace robot.drivers {
    /**
     * A LED strip
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
        /**
         * Updates the state vector with the current line detector state.
         * @param state a number of size 5, indexed by LineDetectors, with 0 for white and 1 for black
         */
        lineState(state: number[]): void
    }

    export interface Arm {
        start(): void
        open(aperture: number): void
    }
}
