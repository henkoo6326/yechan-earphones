import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ASSETS} from './assets.js';
import {createState,ask,restore} from './rules.js';
test('all eight reference characters can be encountered and restored without changing the chance cap',()=>{
 assert.equal(ASSETS.characters.length,8);
 for(const c of ASSETS.characters){const s=createState();const special=c.id==='yuna';assert.equal(ask(s,c.id,()=>.99),special?'complete':'rejected');assert.equal(restore(s).attempts[c.id],special?'helped':'rejected');assert.equal(ask(s,c.id,()=>0),special?'complete':'already');}
});

import fs from 'node:fs';
test('each shipped model contains a full skinned body, mapped reference face and idle/walk clips',()=>{
 for(const c of ASSETS.characters){
  const bytes=fs.readFileSync(new URL('../public'+c.model,import.meta.url));
  assert.equal(bytes.toString('utf8',0,4),'glTF');const size=bytes.readUInt32LE(12);const gltf=JSON.parse(bytes.toString('utf8',20,20+size));
  assert.ok(gltf.skins.some(s=>s.joints.length>=16),c.id+' skeleton');
  for(const name of ['Idle','Walk']){const a=gltf.animations.find(a=>a.name===name);assert.ok(a,c.id+' '+name);assert.ok(a.channels.length>=16);}
  const face=gltf.materials.find(m=>m.name?.startsWith('Reference face'));assert.equal(face.pbrMetallicRoughness.baseColorTexture.texCoord,1,c.id+' face UV');
  const bounds=gltf.meshes.flatMap(m=>m.primitives).map(p=>gltf.accessors[p.attributes.POSITION]);
  assert.ok(bounds.every(a=>a.min.every(Number.isFinite)&&a.max.every(Number.isFinite)));
  assert.ok(bounds.reduce((n,a)=>n+a.count,0)>5000);
 }
});
