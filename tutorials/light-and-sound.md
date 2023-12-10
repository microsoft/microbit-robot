# Lights and Sounds

## Light And Sounds @showdialog

Controls the headlights and buzzer to make your robot more communicative.

## Choose the robot type @showhint

Drag the `||robot:robot ... start||` at the start of `||basic:on start||` and choose the robot type
in the dropdown. After restarting, you should also see the robot simulator.

```blocks
// @highlight
robot.elecfreaksCuteBot.start()
```

## Light

Drag a `||robot:robot set color||` to set the color of LEDs on the robot.
If the robot does not have an RGB color, the intensity of the color will be used.

```blocks
robot.elecfreaksCuteBot.start()
// @highlight
robot.setColor(0xff0000)
robot.playTone(262, music.beat(BeatFraction.Whole))
```

## Sound

Drag a `||robot:robot play tone||` to play a tone of the robot. 
Most robot have a buzzer or the micro:bit V2 buzzer will be used.

```blocks
robot.elecfreaksCuteBot.start()
robot.setColor(0xff0000)
// @highlight
robot.playTone(262, music.beat(BeatFraction.Whole))
```
