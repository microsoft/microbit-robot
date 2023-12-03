// The number of canvas pixels per logical centimeter.
export const PIXELS_PER_CM = 12
//export const PHYSICS_SCALE = 100
export const PHYSICS_SCALE = 1
export const PHYSICS_TO_RENDER_SCALE = PIXELS_PER_CM / PHYSICS_SCALE

// Collision category bits for physics objects.
export const PHYS_CAT_DECORATION = 0x0001
export const PHYS_CAT_ROBOT = 0x0002

export const MAP_ASPECT_RATIO = 1.22
