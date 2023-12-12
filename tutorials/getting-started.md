# Micro:bit Robot Getting Started

## Getting started @showdialog

In this tutorial, you will learn to configure your robot, use the simulator, move forward and do turns.
Let's go!

## Choose the robot type @showhint

Drag the `||robot:robot ... start||` at the start of `||basic:on start||` and choose the robot type
in the dropdown. After restarting, you should also see the robot simulator.

```blocks
// @highlight
robot.elecfreaksCuteBot.start()
```

## Simulator Pro Tips! @showdialog

The robot simulator is there to help you create cool robot programs. 
- If you are on a small screen, click on the **full screen icon** to see it.
- Drag the robot around using the mouse.
- The simulator is not perfect! There will be differences of behavior between the simulator
and your physical robot based on the motors, gearing, weight, balance, and other imperfections
of the real world!

## Move forward

Drag a `||robot:robot motor run||` block into on start. 
It will instruct the robot to go full throttle on both motors.

You will see the robot moving forward in the robot simulator.

```blocks
robot.elecfreaksCuteBot.start()
// @highlight
robot.motorRun(0, 100)
```

## Stop

Use the `||robot:robot stop||` block to stop all motors after 1 second.

```blocks
robot.elecfreaksCuteBot.start()
robot.motorRun(0, 100)
basic.pause(1000)
// @highlight
robot.motorStop()
```

## Turn Right

Add another `||robot:robot motor run with steering 100||`. The steering controls the distributing
of forces between the two motors. Positive steering will favor the right motor
where the left motor stops spinning at 100, and starts going negative beyond 100.

```blocks
robot.elecfreaksCuteBot.start()
robot.motorRun(0, 100)
basic.pause(1000)
robot.motorStop()
basic.pause(1000)
// @highlight
robot.motorRun(100, 100)
```

## Spin Right

Add another `||robot:robot motor run with steering 200||`. The left motor will spin backward
and the right motor will spin forward.

```blocks
robot.elecfreaksCuteBot.start()
robot.motorRun(0, 100)
basic.pause(1000)
robot.motorStop()
basic.pause(1000)
robot.motorRun(100, 100)
basic.pause(1000)
// @highlight
robot.motorRun(200, 100)
```

## Make it dance @showdialog

That's it. You can try to add any sequence of `||robot:motor run||` blocs to create fun
dance robot movements.
