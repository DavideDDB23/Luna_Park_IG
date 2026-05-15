import * as THREE from 'three';

export function addAxesHelper(scene, size = 10) {
  scene.add(new THREE.AxesHelper(size));
}

export function printSceneGraph(obj, depth = 0) {
  console.log('  '.repeat(depth) + `${obj.type} "${obj.name}" [${obj.uuid.slice(0, 6)}]`);
  for (const child of obj.children) printSceneGraph(child, depth + 1);
}
