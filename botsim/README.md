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

## Adding your robot to the simulator

For reference, see existing bot specifications in `src/bots`

### Adding a chassis image to your bot

If your bot chassis specifies a texture, it will be overlaid on the bot.

1. Take a top-down picture of the bot. Make sure it's got a micro:bit on board!
   - Tip: Use light-box lighting conditions. Shadows should be subtle or not present.
   - Tip: Place the bot on a uniformly colored, matte surface that will be easy to edit out later.
   - Tip: Take the picture from a few feet above the bot to minimize perspective effects.
2. Crop the image, leaving a some margin between the bot and the edge of the picture.
3. Rotate the image so that the bot is facing upward.
4. Clip out the wheels and anything else that is clearly not part of the chassis.
5. Delete all background pixels around the bot.
6. Crop the image further, leaving a few margin pixels.
7. Optional: Tweak contrast, brightness, etc.
8. Optional: Add a dark outline.
9. Resize the image, making the smaller dimension 256px, preserving the image ratio.
11. Save the image to "/botsim/public/bots/{your bot name}/chassis.png"
12. Generate polygon vertices from the chassis image using `scripts/img2hull.js`
    -  For the script's "scale" parameter, pass the width of the bot in centimeters.
13. Copy the resulting verts to your bot spec.
    - Set chassis type to "polygon".
    - Copy the generated vertices to the chassis' "verts" field.
14. Reference the texture in your bot's chassis spec
    - Set the chassis' "texture" field to the texture's relative path.
15. Specify where the (two) wheels are on the chassis
16. Specify the location of range sensor and line sensors 
17. Copy over leds section (individual LEDs not supported)
18. Add bot to botsim/src/bots/index.ts



