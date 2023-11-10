robot.kittenbotNanobit.start()
robot.startCompactRadio()
// there is no screen on the nanobit, set the radio group to 1
robot.RobotDriver.instance().setRadioGroup(1)
robot.startCalibrationButtons()
pins.analogSetPitchVolume(168)
