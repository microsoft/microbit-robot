namespace robot {
    export function startCalibrationButtons() {
        const d = RobotDriver.instance()
        input.onButtonPressed(Button.A, () =>
            control.inBackground(() => {
                if (d.configDrift !== undefined) {
                    d.playTone(440, 500)
                    if (d.configDrift) d.setRunDrift(d.runDrift - 1)
                    else d.setRadioGroup(d.radioGroup - 1)
                }
                showConfigurationState(d)
            })
        )
        input.onButtonPressed(Button.B, () =>
            control.inBackground(() => {
                if (d.configDrift !== undefined) {
                    d.playTone(640, 500)
                    if (d.configDrift) d.setRunDrift(d.runDrift + 1)
                    else d.setRadioGroup(d.radioGroup + 1)
                }
                showConfigurationState(d)
            })
        )
        input.onButtonPressed(Button.AB, () =>
            control.inBackground(() => {
                d.playTone(840, 500)
                d.configDrift = !d.configDrift
                showConfigurationState(d, true)
            })
        )
    }

    function showConfigurationState(d: RobotDriver, showTitle?: boolean) {
        d.showConfiguration++
        try {
            led.stopAnimation()
            if (d.configDrift === undefined) {
                basic.showString(
                    `RADIO ${d.radioGroup} DRIFT ${d.runDrift}`,
                    SCROLL_SPEED
                )
            } else {
                const title = d.configDrift ? "DRIFT" : "RADIO"
                const value = d.configDrift ? d.runDrift : d.radioGroup
                basic.showString(title + " " + value, SCROLL_SPEED)
            }
        } finally {
            d.showConfiguration--
        }
    }
}
