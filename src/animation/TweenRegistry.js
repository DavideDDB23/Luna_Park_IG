import * as TWEEN from 'tween';

// Single tween group wrapper — tick once per frame
export const TweenRegistry = {
  update(timestamp) {
    TWEEN.update(timestamp);
  },
};
