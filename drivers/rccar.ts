namespace robot.drivers {
    /**
     * Converts tank speed commands to [speed,direction] throggle
     * @param left 
     * @param right 
     * @returns 
     */
    export function tankToRCMotors(left: number, right: number): number[] {
        const speed = clampSpeed((left + right) / 2)
        const dir = speed === 0 ? 0 : clampSpeed(((left - right) / speed) * 100)
        return [speed, dir]
    }
}