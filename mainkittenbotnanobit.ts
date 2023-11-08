microcode.kittenbotNanobit.start()
microcode.startCompactRadio()
// there is no screen on the nanobit, set the radio group to 1
microcode.RobotDriver.instance().setRadioGroup(1)
microcode.startCalibrationButtons()
pins.analogSetPitchVolume(168)
