import * as TWEEN from 'tween';

// Curated aliases so ride code doesn't import tween directly
export const Easing = {
  QuadIn:    TWEEN.Easing.Quadratic.In,
  QuadOut:   TWEEN.Easing.Quadratic.Out,
  QuadInOut: TWEEN.Easing.Quadratic.InOut,
  CubicIn:   TWEEN.Easing.Cubic.In,
  CubicOut:  TWEEN.Easing.Cubic.Out,
  CubicInOut: TWEEN.Easing.Cubic.InOut,
  Linear:    TWEEN.Easing.Linear.None,
};
