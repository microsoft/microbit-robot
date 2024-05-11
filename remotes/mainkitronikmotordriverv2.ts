robot.kitronikMotorDriverV2.start()
robot.startCompactRadio()
robot.startCalibrationButtons()
input.onButtonPressed(Button.A, () => {
    basic.pause(1000)
    robot.motorTank(50, 50, 3000)
    robot.motorStop()
    robot.motorTank(100, 0, 3000)
    robot.motorStop()
    robot.motorTank(0, 100, 3000)
    robot.motorStop()
})