export const KEY_BINDINGS = {
  HELP:            ['KeyH'],
  FPS_TOGGLE:      ['Backquote'],
  GONDOLA_ENTER:   ['KeyG'],
  GONDOLA_EXIT:    ['Escape'],
  TIME_BACK:       ['BracketLeft'],
  TIME_FORWARD:    ['BracketRight'],
  DAY_NIGHT_PAUSE: ['KeyP'],
  CAMERA_RESET:    ['KeyR'],
  FLY_RIDE_1:      ['Digit1'],
  FLY_RIDE_2:      ['Digit2'],
  FLY_RIDE_3:      ['Digit3'],
  FLY_RIDE_4:      ['Digit4'],
  SG_DEBUG_PRINT:  ['KeyT'],
};

export function matchesBinding(name, code) {
  return KEY_BINDINGS[name]?.includes(code) ?? false;
}
