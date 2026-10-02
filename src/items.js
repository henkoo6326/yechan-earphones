import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

// Item visuals are independent of inventory IDs, collection and probability rules.
export const ITEM_ASSET={url:(import.meta.env?.BASE_URL??'/')+'assets/items/rolex-watch.glb',size:1.05,name:'시계'};
export async function applyItemModels(items,renderer){
 const {scene:model}=await new GLTFLoader().loadAsync(ITEM_ASSET.url);
 const bounds=new THREE.Box3().setFromObject(model);
 const dimensions=bounds.getSize(new THREE.Vector3());
 const scale=ITEM_ASSET.size/Math.max(dimensions.x,dimensions.y,dimensions.z);
 if(!Number.isFinite(scale)||scale<=0)throw new Error('Invalid item model bounds');
 const center=bounds.getCenter(new THREE.Vector3());
 model.scale.setScalar(scale);model.position.copy(center).multiplyScalar(-scale);
 const generator=new THREE.PMREMGenerator(renderer);
 const room=new RoomEnvironment();const reflection=generator.fromScene(room,.04);
 room.dispose();generator.dispose();
 model.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
  for(const m of Array.isArray(o.material)?o.material:[o.material]){m.envMap=reflection.texture;m.envMapIntensity=1.3;if(m.transparent)m.depthWrite=false;m.needsUpdate=true;}
 });
 for(const item of items){
  const visual=new THREE.Group();visual.name='watch-visual';visual.add(model.clone(true));
  const previous=item.root.getObjectByName('pickup-placeholder');
  if(previous){item.root.remove(previous);previous.geometry.dispose();previous.material.dispose();}
  item.root.add(visual);item.root.userData.itemAsset=ITEM_ASSET.url;
 }
 return {count:items.length,reflection};
}
