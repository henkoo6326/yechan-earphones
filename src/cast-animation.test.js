import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';import {AnimationMixer,Vector3} from 'three';import {CAST} from './cast.js';
// Node has no image decoder; strip only texture references while keeping the
// original geometry, joints, inverse bind matrices and animation buffers.
async function loadRig(path){
 const b=fs.readFileSync(new URL('../public'+path,import.meta.url)),n=b.readUInt32LE(12),doc=JSON.parse(b.toString('utf8',20,20+n));
 const binary=b.subarray(28+n);doc.buffers[0].uri='data:application/octet-stream;base64,'+binary.toString('base64');
 delete doc.images;delete doc.textures;delete doc.samplers;for(const m of doc.materials)delete m.pbrMetallicRoughness.baseColorTexture;
 const manager=new GLTFLoader().manager;manager.setURLModifier(url=>url);
 return new GLTFLoader(manager).parseAsync(JSON.stringify(doc),'');
}
if(!globalThis.ProgressEvent)globalThis.ProgressEvent=class{constructor(type,values){Object.assign(this,{type},values)}};
test('all eight exported Walk clips actually move the rig feet',async()=>{
 for(const c of CAST){const gltf=await loadRig(c.model),mixer=new AnimationMixer(gltf.scene);mixer.clipAction(gltf.animations.find(a=>a.name==='Walk')).play();mixer.update(0);gltf.scene.updateMatrixWorld(true);
 const foot=gltf.scene.getObjectByName('FootL')||gltf.scene.getObjectByName('Foot.L');assert.ok(foot,c.id+' foot bone');const before=foot.getWorldPosition(new Vector3());mixer.update(.25);gltf.scene.updateMatrixWorld(true);const after=foot.getWorldPosition(new Vector3());assert.ok(before.distanceTo(after)>.025,c.id+' walking movement');}
});
