import * as THREE from 'three';
import { EventBus } from '../core/EventBus.js';

export class Raycaster {
  constructor(camera, scene) {
    this._camera  = camera;
    this._scene   = scene;
    this._ray     = new THREE.Raycaster();

    EventBus.on('input:click', ({ ndc }) => this._pick(ndc));
  }

  _pick(ndc) {
    this._ray.setFromCamera(ndc, this._camera);
    const hits = this._ray.intersectObjects(this._scene.children, true)
      .filter(h => h.object.userData.pickable === true);

    if (hits.length === 0) {
      EventBus.emit('raycast:miss', { ndc });
      return;
    }

    const hit = hits[0];
    EventBus.emit('raycast:hit', {
      object:     hit.object,
      point:      hit.point,
      instanceId: hit.instanceId ?? null,
    });

    const ref = hit.object.userData.rideRef;
    if (ref) EventBus.emit('ride:toggle', { rideId: ref });
  }
}
