import * as THREE from 'three';

export class SceneRoot {
  constructor(scene) {
    this.scene = scene;

    this.lights = new THREE.Group();
    this.lights.name = 'lights';

    this.world = new THREE.Group();
    this.world.name = 'world';

    this.visitors = new THREE.Group();
    this.visitors.name = 'visitors';

    this.rides = new THREE.Group();
    this.rides.name = 'rides';

    scene.add(this.lights, this.world, this.visitors, this.rides);
  }
}
