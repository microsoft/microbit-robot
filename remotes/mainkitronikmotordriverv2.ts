robot.kitronikMotorDriverV2.start()
robot.startCompactRadio()
robot.startCalibrationButtons()
while (true) {
    basic.pause(1000)
    robot.motorTank(50, 50, 3000)
    robot.motorStop()
    robot.motorTank(50, 0, 3000)
    robot.motorStop()
    robot.motorTank(0, 50, 3000)
    robot.motorStop()
}