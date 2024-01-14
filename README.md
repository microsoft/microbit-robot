# Micro:bit Robot for MakeCode

This extension contains **blocks for most 2 wheeled robots available for the micro:bit**
and **a web simulator**.
This library is compatible with micro:bit V2 and V1. However, the code space in V1 is limited and you may need to remove some features to fit your program.

> The library is still in beta and is subject to changes.

![3 micro:bit robots](https://microsoft.github.io/microbit-robot/assets/images/robots.jpg)

-   [DFRobot Maqueen](#dfrobot-maq)
-   [DFRobot Maqueen Plus](#dfrobot-maq-plus)
-   [Elecfreaks Cutebot](#cutebot)
-   [Elecfreaks Cutebot PRO](#cutebot-pro)
-   [InkSmith K8](#inksmith-k8)
-   [KeyStudio KS0426 Mini Smart Robot](#keystudio-mini)
-   [KittenBot MiniLFR](#kittenbot-mlfr)
-   [KittenBot Robotbit](#kittenbot-robotbit)
-   [KittenBot Nanobit](#kittenbot-nanobit)
-   [Yahboom Tiny:bit](#yahboom)

### Hardware requirements

The firmware is designed for popular rover robots found in the micro:bit ecosystem
(and more can be added):

-   2 motors that can be forward, backward, left, right turns. Precise detection of distance is **not** needed.
-   2 or more line sensors
-   a distance sensor, typically an ultrasonic sensor

The following features are found often those robots:

-   one or more servo connectors
-   Buzzer
-   RGB LEDs (headlights)
-   Programmable LED strip (undercarriage)

## Using this extension

-   Open https://makecode.microbit.org
-   Add this extension to your project by adding url [https://github.com/microsoft/microbit-robot](https://github.com/microsoft/microbit-robot)

## Tutorials

-   [Getting started](https://makecode.microbit.org/#tutorial:github:microsoft/microbit-robot/tutorials/getting-started)
-   [Light and Sound](https://makecode.microbit.org/#tutorial:github:microsoft/microbit-robot/tutorials/light-and-sound)
-   [Line follower](https://makecode.microbit.org/#tutorial:github:microsoft/microbit-robot/tutorials/line-follower)

## Simulator

The simulator will load automatically in MakeCode once you use a robot block.
It is designed to help programming this kind of robot.

<video src="https://microsoft.github.io/microbit-robot/assets/docs/sim.mp4" controls loop autoplay muted>
</video>

-   The simulator supports the line sensors and obstacle detectors.
-   You can drag the robot using the mouse to reset the movements.
-   If you use radio, you will see a single simulator with multiple robots.
-   On a small screen, click on the **full screen icon** to show the simulator.
-   Remember that the simulation is not perfect. It does not capture all the subtle imperfections of the physical robot
    (motor wear, battery level, weight distribution, ground friction, ...).

## Blocks

### Understanding the screen

The extension uses the 5x5 screen to show the state of the robot (you can turn off this behavior see configuration).
This is particularly useful to debug your robot program.

-   left and right LED column show the line detector state
-   center column shows the obstacle distance in multiple of 5cm
-   2nd and 4th column show the motor throttle

### Choosing the robot type

At the start of any robot program, you need add the block to select the robot model you will be using.

> **This should be done before using any other blocks**.

```blocks
robot.elecfreaksCuteBot.start()
```

This is the only code that is specific to the robot you are using. The rest of the blocks are the same for all robots.

### Output

-   move

```blocks
input.onButtonPressed(Button.A, () => {
    robot.motorRun(0, 100)
})
```

The move block takes a `steering` and `speed`parameters.
The`steering`controls how much "turn",`speed` controls the throttle on the motors.

-   stop the robot

```blocks
input.onButtonPressed(Button.B, () => {
    robot.motorStop()
})
```

-   open a claw/arm (some robots support one or more servos)

```blocks
input.onButtonPressed(Button.B, () => {
    robot.armOpen(0, 50)
})
```

-   set LED and headlights color

```blocks
input.onButtonPressed(Button.A, function () {
    robot.setColor(0xff0000)
})
```

-   play tone

```blocks
input.onButtonPressed(Button.A, function () {
    robot.playTone(262, music.beat(BeatFraction.Whole))
})
```

### Input

-   detect when an obstacle is changing
    and read the current distance (in cm)

```blocks
let dist = 0
robot.onObstacleDistanceChanged(function () {
    dist = robot.obstacleDistance()
})
```

-   detect line changes or read line state

```blocks
let left = false
robot.onLineDetected(function () {
    left = robot.detectLines(RobotLineDetector.Left)
})
```

### Configuration

-   turn off robot screen

```blocks
robot.setAssist(RobotAssist.Display, false)
```

-   configure the motor drift

```blocks
robot.setMotorDrift(10)
```

-   disable or enable line assist

```blocks
robot.setAssist(RobotAssist.LineFollowing, false)
```

-   disable or speed smoothing assist

```blocks
robot.setAssist(RobotAssist.Speed, false)
```

## Usage with MicroCode

Use micro:code to remote control a robot using this library.

-   [Documentation](https://microsoft.github.io/microcode/docs/robot)

## Supported targets

-   for PXT/microbit
-   for PXT/calliope

## Supported Robots

### DFRobot Maqueen V2+ <a id="dfrobot-maq"></a>

![Photograph of the Maqueen](https://microsoft.github.io/microbit-robot/assets/images/maqueen.jpeg)

-   [Home](https://wiki.dfrobot.com/micro_Maqueen_for_micro_bit_SKU_ROB0148-EN)

### DFRobot Maqueen Plus V2 <a id="dfrobot-maq-plus"></a>

![Photograph of the Maqueen plus](https://microsoft.github.io/microbit-robot/assets/images/dfrobotmaqueenplusv2.jpg)

-   [Home](https://www.dfrobot.com/product-2026.html)

### Elecfreaks Cutebot <a id="cutebot"></a>

![Photograph of the Cutebot](https://microsoft.github.io/microbit-robot/assets/images/cutebot.jpeg)

-   [Home](https://www.elecfreaks.com/micro-bit-smart-cutebot.html)

### Elecfreaks Cutebot PRO <a id="cutebot-pro"></a>

![Photograph of the Cutebot PRO](https://microsoft.github.io/microbit-robot/assets/images/cutebotpro.jpeg)

-   [Home](https://shop.elecfreaks.com/products/elecfreaks-smart-cutebot-pro-v2-programming-robot-car-for-micro-bit)

## InkSmith K8 <a id="inksmith-k8"></a>

![Photograph of the K8](https://microsoft.github.io/microbit-robot/assets/images/inksmithk8.webp)

-   [Home](https://www.inksmith.ca/products/k8-robotics-kit)

### KeyStudio KS0426 Mini Smart Robot <a id="keystudio-mini"></a>

-   [Home](https://wiki.keyestudio.com/KS0426_Keyestudio_Micro%EF%BC%9Abit_Mini_Smart_Robot_Car_Kit_V2)

### KittenBot MiniLFR <a id="kittenbot-mlfr"></a>

![Photo of the MiniLFR robot](https://microsoft.github.io/microbit-robot/assets/images/minilfr.png)

-   [Home](https://www.kittenbot.cc/products/kittenbot-minilfr-programmable-robot-car-kit-for-microbit)

### KittenBot Robotbit <a id="kittenbot-robotbit"></a>

![Photo of the Robotbit robot](https://microsoft.github.io/microbit-robot/assets/images/robotbit.webp)

-   [Home](https://www.kittenbot.cc/products/robotbit-robotics-expansion-board-for-micro-bit)

### KittenBot Nanobit <a id="kittenbot-nanobit"></a>

![Photo of the Nanobit robot](https://microsoft.github.io/microbit-robot/assets/images/nanobit.webp)

-   [Home](https://www.kittenbot.cc/products/kittenbot-nanobit-with-kb-link-downloader-for-makecode-python-and-arduino-programming)

### Yahboom Tiny:bit <a id="yahboom"></a>

![Photograph of the Tiny:bit](https://microsoft.github.io/microbit-robot/assets/images/tinybit.jpeg)

-   [Home](http://www.yahboom.net/study/Tiny:bit)

## License

MIT

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

### How to prepare a pull request <a id="new-robot"></a>

To add a new robot to the list, prepare a pull request in [microsoft/microbit-robot](https://github.com/microsoft/microbit-robot) with:

-   a new class extending `Robot` and configuring the hardware (see other robots)
-   a global field instance instantiating the robot (see other robots)
-   a URL in the jsdocs of the class pointing to the robot homepage
-   add `main{company}{productname}.ts` file that starts the robot
-   add `pxt-{company}{productname}.json` file that overrides the test files to load `main{company}{productname}.ts`
-   add call to `mkc -c pxt-{company}{productname}.json` in `.github/workflows/makecode.yml`
-   add image under `assets`

Make sure to test and tune the configuration options in the robot class for your particular
chassis/motor/line detectors. You may want to tweak some of the constants in the robot class to optimize the behavior of the robot.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.

<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script
