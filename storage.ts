namespace microcode {
    //% shim=microcode::__writeCalibration
    export function __writeCalibration(
        radioGroup: number,
        drift: number
    ): void {
        console.log("radio group:" + radioGroup)
        console.log("run drift: " + drift)
    }

    //% shim=microcode::__readCalibration
    export function __readCalibration(field: number): number {
        // read run drift
        return 0
    }
}
