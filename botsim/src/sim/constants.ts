// The number of canvas pixels per logical centimeter.
export const PIXELS_PER_CM = 12

// The physics engine's fixed timestep.
export const PHYS_TIMESTEP_MS = 1000 / 60
export const PHYS_TIMESTEP_SECS = PHYS_TIMESTEP_MS / 1000

// Collision category bits for physics objects.
export const PHYS_CAT_DECORATION = 0x0001
export const PHYS_CAT_ROBOT = 0x0002
