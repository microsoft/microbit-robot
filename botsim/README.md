# BOTSIM - A simulator for the microbit-robot MakeCode extension

## Local testing and development

### First-time setup
```
cd botsim
npm install
```

### Start the dev server
```
npm start
```

##  Adding your robot to the simulator

For reference, see `src/bots/testBot.ts`

TBD

When tuning your bot's movement model, set `KEYBOARD_CONTROL_ENABLED` in `src/sim/bot/index.ts`. This will allow you to control your bot with keyboard or gamepad.
* <kbd><b>W</b></kbd>/<kbd><b>S</b></kbd>: Control left motor
* <kbd><b>I</b></kbd>/<kbd><b>K</b></kbd>: Control right motor
* <kbd><b>↑</b></kbd><kbd><b>↓</b></kbd><kbd><b>←</b></kbd><kbd><b>→</b></kbd>: General motor movement
* <b>Gamepad Left Stick Up/Down</b>: Control left motor
* <b>Gamepad Right Stick Up/Down</b>: Control right motor

TODO: Add more keyboard controls to enable line sensors, set LEDs, etc.

