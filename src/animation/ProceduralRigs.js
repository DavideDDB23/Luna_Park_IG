// Sinusoidal drivers and Frenet frame helpers — used by rides.
export function sinDriver(elapsed, freq, amp, phase = 0) {
  return Math.sin(elapsed * freq * Math.PI * 2 + phase) * amp;
}

export function cosDriver(elapsed, freq, amp, phase = 0) {
  return Math.cos(elapsed * freq * Math.PI * 2 + phase) * amp;
}
