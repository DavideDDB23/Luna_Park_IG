const params = new URLSearchParams(window.location.search);

export const isDebug    = params.has('debug');
export const isFast     = params.has('fast');
export const isMobile   = params.has('mobile');
export const initTime   = params.has('time')   ? parseFloat(params.get('time'))  : 0.5;
export const initRide   = params.get('ride')   ?? null;
export const initSite   = params.get('site')   ?? null;

export function get(key, fallback = null) {
  return params.has(key) ? params.get(key) : fallback;
}
