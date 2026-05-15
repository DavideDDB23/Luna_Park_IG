import * as THREE from 'three';

// M6: park furniture as InstancedMesh to reduce draw calls.
// Benches (N_BENCHES ≥ 6) and fence posts (N_POSTS ≥ 50).

const N_BENCHES = 8;
const N_POSTS   = 52;  // 13 per side × 4 sides

export class Furniture {
  constructor(worldGroup, matLib = null) {
    const woodMat  = matLib ? matLib.get('wood.varnished')  : new THREE.MeshStandardMaterial({ color: 0x7a5030 });
    const metalMat = matLib ? matLib.get('metal.painted')   : new THREE.MeshStandardMaterial({ color: 0x334455 });

    this._addBenches(worldGroup, woodMat, metalMat);
    this._addFencePosts(worldGroup, metalMat);
  }

  _addBenches(parent, woodMat, metalMat) {
    // Bench = seat slab + 2 legs. Build as simple Box combos.
    // Seat (InstancedMesh)
    const seatGeo  = new THREE.BoxGeometry(1.4, 0.08, 0.45);
    const seatInst = new THREE.InstancedMesh(seatGeo, woodMat, N_BENCHES);
    seatInst.name = 'benchSeat';
    seatInst.castShadow = true;

    // Legs (InstancedMesh — 2 legs per bench = 2N instances)
    const legGeo  = new THREE.BoxGeometry(0.06, 0.42, 0.45);
    const legInst = new THREE.InstancedMesh(legGeo, metalMat, N_BENCHES * 2);
    legInst.name = 'benchLeg';
    legInst.castShadow = false;

    const mx = new THREE.Matrix4();

    // Place benches evenly along the E-W and N-S paths
    const positions = [
      new THREE.Vector3( 8,  0,  0),
      new THREE.Vector3(-8,  0,  0),
      new THREE.Vector3( 8,  0, -20),
      new THREE.Vector3(-8,  0, -20),
      new THREE.Vector3( 8,  0,  20),
      new THREE.Vector3(-8,  0,  20),
      new THREE.Vector3( 25, 0, -5),
      new THREE.Vector3(-25, 0, -5),
    ];
    const rotations = [0, Math.PI, 0, Math.PI, 0, Math.PI, Math.PI / 2, -Math.PI / 2];

    for (let i = 0; i < N_BENCHES; i++) {
      const p  = positions[i];
      const ay = rotations[i] ?? 0;
      const q  = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ay, 0));

      // Seat
      const seatPos = new THREE.Vector3(p.x, 0.44, p.z);
      mx.compose(seatPos, q, new THREE.Vector3(1, 1, 1));
      seatInst.setMatrixAt(i, mx);

      // Left leg
      const lOff = new THREE.Vector3(-0.55, 0.21, 0).applyQuaternion(q);
      mx.compose(p.clone().add(lOff), q, new THREE.Vector3(1, 1, 1));
      legInst.setMatrixAt(i * 2, mx);

      // Right leg
      const rOff = new THREE.Vector3( 0.55, 0.21, 0).applyQuaternion(q);
      mx.compose(p.clone().add(rOff), q, new THREE.Vector3(1, 1, 1));
      legInst.setMatrixAt(i * 2 + 1, mx);
    }

    seatInst.instanceMatrix.needsUpdate = true;
    legInst.instanceMatrix.needsUpdate  = true;
    parent.add(seatInst, legInst);
  }

  _addFencePosts(parent, metalMat) {
    // Square park perimeter fence posts; 13 per side of a 100m square, 4 sides
    const postGeo  = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6);
    const postInst = new THREE.InstancedMesh(postGeo, metalMat, N_POSTS);
    postInst.name = 'fencePost';
    postInst.castShadow = false;

    // Horizontal rails (InstancedMesh)
    const railGeo  = new THREE.CylinderGeometry(0.02, 0.02, 8.0, 5);
    const railInst = new THREE.InstancedMesh(railGeo, metalMat, N_POSTS);
    railInst.name = 'fenceRail';

    const mx      = new THREE.Matrix4();
    const railRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
    const halfSize = 52;
    const gap      = (halfSize * 2) / 13;  // spacing between posts

    let idx = 0;
    const sides = [
      { axis: 'x', sign:  1 }, // north (Z=-halfSize)
      { axis: 'x', sign: -1 }, // south (Z=+halfSize)
      { axis: 'z', sign:  1 }, // east  (X=+halfSize)
      { axis: 'z', sign: -1 }, // west  (X=-halfSize)
    ];

    for (const side of sides) {
      for (let k = 0; k < 13 && idx < N_POSTS; k++, idx++) {
        const offset = -halfSize + k * gap + gap / 2;
        let px, pz;
        if (side.axis === 'x') { px = offset; pz = side.sign * halfSize; }
        else                    { px = side.sign * halfSize; pz = offset; }

        // Post
        mx.makeTranslation(px, 0.5, pz);
        postInst.setMatrixAt(idx, mx);

        // Rail between this and next post
        const nx = side.axis === 'x' ? offset + gap / 2 : side.sign * halfSize;
        const nz = side.axis === 'z' ? offset + gap / 2 : side.sign * halfSize;
        mx.compose(new THREE.Vector3(nx, 0.8, nz), railRot, new THREE.Vector3(1, 1, 1));
        railInst.setMatrixAt(idx, mx);
      }
    }

    postInst.instanceMatrix.needsUpdate = true;
    railInst.instanceMatrix.needsUpdate  = true;
    parent.add(postInst, railInst);
  }
}
