// Tunable constants — override via URL params where noted (see utils/url.js)

export const FRAME_TARGET_MS   = 16.67;   // 60 fps target
export const MAX_DT            = 1 / 30;  // clamp pathological delta after tab-switch

// Renderer
export const SHADOW_MAP_SIZE   = 2048;
export const MAX_DRAW_CALLS    = 200;

// Day / night
export const SUN_RADIUS        = 80;
export const DAY_TURN_DURATION = 60;     // seconds for a full day cycle when auto-rotating
export const LAMP_ON_THRESHOLD = 0.15;   // sunElevation below this → lights on

// Rides — defaults (individual ride files may add their own)
export const RAMP_DURATION_MS  = 1500;   // tween duration for speed ramp

// Debug
export const DEBUG_AXES        = false;
export const DEBUG_SCENE_GRAPH = false;
export const DEBUG_RAYCAST     = false;
