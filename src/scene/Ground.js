import * as THREE from 'three';

const GROUND_SIZE = 120;

export class Ground {
  constructor(parent) {
    // Grass base
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x4a7c59,
      roughness: 1.0,
      metalness: 0,
    });
    grassMat.name = 'mat_ground_placeholder';

    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
      grassMat,
    );
    this.mesh.name = 'ground';
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.receiveShadow = true;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.updateMatrix();
    parent.add(this.mesh);

    // Gravel path overlay (simple tinted cross, Y-offset to prevent z-fight)
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0xa08060,
      roughness: 0.95,
      metalness: 0,
    });
    pathMat.name = 'mat_path_placeholder';

    const hPath = new THREE.Mesh(new THREE.PlaneGeometry(GROUND_SIZE, 5), pathMat);
    hPath.name = 'path_h';
    hPath.rotation.x = -Math.PI / 2;
    hPath.position.y = 0.002;
    hPath.matrixAutoUpdate = false;
    hPath.updateMatrix();
    parent.add(hPath);

    const vPath = new THREE.Mesh(new THREE.PlaneGeometry(5, GROUND_SIZE), pathMat);
    vPath.name = 'path_v';
    vPath.rotation.x = -Math.PI / 2;
    vPath.position.y = 0.002;
    vPath.matrixAutoUpdate = false;
    vPath.updateMatrix();
    parent.add(vPath);
  }
}
