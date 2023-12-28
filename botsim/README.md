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

For reference, see `src/bots/testBot.ts`

### Adding a texture to the bot chassis

If your bot chassis specifies a texture, it will be overlaid on the bot.

1. Take a top-down picture of the bot. Make sure it's got a micro:bit on board!
   - Tip: Use light-box lighting conditions. Shadows should be subtle or not present.
   - Tip: Place the bot on a uniformly colored, matte surface that will be easy to edit out later.
2. Crop the image, leaving a some margin between the bot and the edge of the picture.
3. Rotate the image so that the bot is facing upward.
4. Clip out the wheels and anything else that is clearly not part of the chassis.
5. Delete all background pixels around the bot.
6. Crop the image further, leaving a few margin pixels.
7. Optional: Tweak contrast, brightness, etc.
8. Optional: Add a dark outline.
9. Resize the image, making the smaller dimension 256px, preserving the image ratio.
10. Save the image to /botsim/public/bots/{your bot name}/chassis.png
11. Reference the texture in your bot's chassis spec. See an existing chassis spec for reference (found in `/botsim/src/bots/`)

#### Troubleshooting

