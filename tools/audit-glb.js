#!/usr/bin/env node
// Audit all GLTF/GLB files under assets/models/ and fail if any have animation tracks.
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = new URL('../assets/models', import.meta.url).pathname;

function walk(dir) {
  const out = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function readGltfJson(path) {
  const ext = extname(path).toLowerCase();
  if (ext === '.gltf') {
    return JSON.parse(readFileSync(path, 'utf8'));
  }
  if (ext === '.glb') {
    const buf = readFileSync(path);
    let pos = 12;
    while (pos < buf.length) {
      const clen = buf.readUInt32LE(pos);
      const ctype = buf.readUInt32LE(pos + 4);
      if (ctype === 0x4E4F534A) { // JSON chunk
        return JSON.parse(buf.slice(pos + 8, pos + 8 + clen).toString('utf8').trimEnd());
      }
      pos += 8 + clen;
    }
  }
  return null;
}

let failures = 0;
for (const path of walk(ROOT)) {
  const ext = extname(path).toLowerCase();
  if (ext !== '.gltf' && ext !== '.glb') continue;
  const d = readGltfJson(path);
  if (!d) continue;
  const n = (d.animations || []).length;
  if (n > 0) {
    console.error(`FAIL ${path}: ${n} animation track(s) — strip with tools/strip_anims.py`);
    failures++;
  } else {
    console.log(`OK   ${path}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} file(s) have animations. Aborting.`);
  process.exit(1);
}
console.log('\nAll models clean (no animations).');
