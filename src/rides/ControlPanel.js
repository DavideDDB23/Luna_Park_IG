import * as THREE from 'three';
import * as TWEEN from 'tween';

// ANIM CATEGORY: tweened (lever tilt, signal color)
export class ControlPanel {
  constructor(parent, rideId, offset = new THREE.Vector3(0, 0, 6)) {
    this._rideId = rideId;

    this._root = new THREE.Group();
    this._root.name = `controlPanel_${rideId}`;
    this._root.position.copy(offset);
    parent.add(this._root);

    // Pedestal
    const pedestal = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.0, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.8 }),
    );
    pedestal.name = 'pedestal';
    pedestal.position.y = 0.5;
    pedestal.castShadow = true;
    this._root.add(pedestal);

    // Signal light (sphere on top of pedestal)
    this._signalMat = new THREE.MeshStandardMaterial({
      color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 1.0,
      roughness: 0.3, metalness: 0.2,
    });
    this._signal = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 8),
      this._signalMat,
    );
    this._signal.name = 'signalLight';
    this._signal.position.set(0, 1.18, 0);
    this._root.add(this._signal);

    // Lever
    this._lever = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4 }),
    );
    this._lever.name = 'lever';
    this._lever.position.set(0, 0.95, 0.12);
    this._lever.rotation.x = 0.4; // default "off" tilt
    this._root.add(this._lever);

    // Invisible pick area — generous hitbox
    const pickMat = new THREE.MeshBasicMaterial({ visible: false });
    const pickBox = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 1.0), pickMat);
    pickBox.name = 'pickArea';
    pickBox.position.y = 0.7;
    pickBox.userData.pickable = true;
    pickBox.userData.rideRef  = rideId;
    this._root.add(pickBox);

    this._running = false;
    this._colorTween = null;
    this._leverTween = null;
  }

  setRunning(running) {
    if (this._running === running) return;
    this._running = running;

    // Signal color: red (idle) ↔ green (running) over 250 ms
    const from = running ? { r: 1, g: 0.13, b: 0 } : { r: 0, g: 0.9, b: 0.1 };
    const to   = running ? { r: 0, g: 0.9, b: 0.1 } : { r: 1, g: 0.13, b: 0 };
    this._colorTween?.stop();
    const col = { ...from };
    this._colorTween = new TWEEN.Tween(col)
      .to(to, 250)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(() => {
        this._signalMat.color.setRGB(col.r, col.g, col.b);
        this._signalMat.emissive.setRGB(col.r, col.g, col.b);
      })
      .start();

    // Lever tilt: 0.4 rad (off) ↔ -0.4 rad (on) over 400 ms
    const leverFrom = this._lever.rotation.x;
    const leverTo   = running ? -0.4 : 0.4;
    this._leverTween?.stop();
    const lt = { v: leverFrom };
    this._leverTween = new TWEEN.Tween(lt)
      .to({ v: leverTo }, 400)
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate(() => { this._lever.rotation.x = lt.v; })
      .start();
  }

  // Hover pulse
  update(elapsed) {
    if (this._running) {
      this._signalMat.emissiveIntensity = 0.85 + 0.15 * Math.sin(elapsed * 4);
    }
  }

  get root() { return this._root; }
}
