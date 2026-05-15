import * as THREE from 'three';
import * as TWEEN from 'tween';
import { EventBus } from '../core/EventBus.js';

// ANIM CATEGORY: tweened (camera tween, Quadratic.InOut)
const MIN_CAM_Y    = 2.0;
const FLY_DURATION = 1200;

export class ClickToFly {
  constructor(rig, groundMesh) {
    this._rig       = rig;
    this._raycaster = new THREE.Raycaster();
    this._groundMesh = groundMesh;
    this._active    = false;

    EventBus.on('raycast:miss', ({ ndc }) => this._onGroundClick(ndc));
    EventBus.on('raycast:hit',  ({ object, point }) => {
      // Clicking a non-panel ride body → fly to 6 m away at eye level
      if (!object.userData.rideRef && !object.userData.lamppostInstance) {
        this._flyNear(point);
      }
    });
  }

  _onGroundClick(ndc) {
    const cam = this._rig.camera;
    this._raycaster.setFromCamera(ndc, cam);
    const hits = this._raycaster.intersectObject(this._groundMesh, false);
    if (!hits.length) return;
    this._flyNear(hits[0].point);
  }

  _flyNear(worldPoint) {
    const cam = this._rig.camera;
    const offset = cam.position.clone().sub(this._rig._orbit.controls.target);
    offset.y = Math.max(offset.y, MIN_CAM_Y + 2);
    const targetCamPos = worldPoint.clone().add(offset);
    targetCamPos.y = Math.max(targetCamPos.y, MIN_CAM_Y);
    this._rig.flyTo(targetCamPos, worldPoint, FLY_DURATION, TWEEN.Easing.Quadratic.InOut);
  }

  update(_dt) {}
}
