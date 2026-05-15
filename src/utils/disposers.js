export function deepDispose(obj) {
  obj.traverse(node => {
    if (node.geometry) node.geometry.dispose();
    if (node.material) {
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      for (const m of mats) {
        for (const key of Object.keys(m)) {
          if (m[key] && typeof m[key].dispose === 'function') m[key].dispose();
        }
        m.dispose();
      }
    }
  });
}
