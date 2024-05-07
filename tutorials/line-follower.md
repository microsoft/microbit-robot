# Line follower

## Line follow @showdialog

In this tutorial you will learn how to use the line sensors to follow a line
on their left side. We will use the left and right sensors typically located near the metal ball under the robot
(some robots have more).

## Choose the robot type @showhint

Drag the `||robot:robot ... start||` at the start of `||basic:on start||` and choose the robot type
in the dropdown. After restarting, you should also see the robot simulator.

```blocks
// @highlight
robot.elecfreaksCuteBot.start()
```

## Detect when the robot is over the Line

Add an event block to run code when both sensors detect a line.

```blocks
robot.onLineLeftRightDetected(true, true, function () {
    robot.motorSteer(50, 100)
})
```

## Turn right slightly.

Add a `||robot:motor run||` block to run right when both lines are detected.

```blocks
robot.onLineLeftRightDetected(true, true, function () {
    // @highlight
    robot.motorSteer(50, 100)
})
```

## Turn left when loosing the line

Add blocks to turn left when the line is lost, when the right line sensor stops detecting the line.

```blocks
robot.onLineLeftRightDetected(false, false, function () {
    robot.motorSteer(-50, 100)
})
```

## Improve your code! @showdialog

Try to improve your code to make your robot follow better the line. Good luck!
