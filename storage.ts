namespace robot.configuration {
    //% shim=robot::writeCalibration
    export function writeCalibration(
        radioGroup: number,
        drift: number
    ): void {
        console.log("radio group:" + radioGroup)
        console.log("run drift: " + drift)
    }

    //% shim=robot::readCalibration
    export function readCalibration(field: number): number {
        // read run drift
        return 0
    }
}
