import {applyItemModels} from './items.js';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export {THREE};
const matCache=new Map();
function material(color){if(!matCache.has(color))matCache.set(color,new THREE.MeshStandardMaterial({color,roughness:.85}));return matCache.get(color)}
export function box(parent,w,h,d,color,x=0,y=0,z=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function sphere(parent,r,color,x,y,z,sx=1,sy=1,sz=1){const o=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),material(color));o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;parent.add(o);return o}
function cylinder(parent,r1,r2,h,color,x,y,z){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),material(color));o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}
function sign(parent,text,w,h,x,y,z,bg='#f9eadd',fg='#706174'){const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle=fg;ctx.lineWidth=3;ctx.strokeRect(12,12,c.width-24,c.height-24);ctx.fillStyle=fg;ctx.font=`500 ${Math.round(c.height*.43)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,c.width/2,c.height/2,c.width-50);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));o.position.set(x,y,z);parent.add(o);return o}
export function createWorld(container,characters){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#edccce');scene.fog=new THREE.Fog('#edccce',45,105);
 const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,180);camera.position.set(2.4,30,33);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;container.appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight('#ffede4','#79758b',2.0));const sun=new THREE.DirectionalLight('#ffe2c2',2.5);sun.position.set(-18,30,16);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-35,right:35,top:35,bottom:-35,far:100});sun.shadow.bias=-.001;scene.add(sun);
 const environment=new THREE.Group();environment.name='environment-layer';scene.add(environment);
 const actors=new THREE.Group();actors.name='characters-layer';scene.add(actors);
 const itemLayer=new THREE.Group();itemLayer.name='items-layer';scene.add(itemLayer);
 const colliders=[];
 box(environment,65,.5,75,'#c8b8b1',0,-.35,0);
 box(environment,11,.06,56,'#b1a3a2',0,-.04,0);
 for(const x of [-6.3,6.3]){box(environment,2.5,.22,53,'#e4d2c6',x,0,0);for(let z=-26;z<26;z+=1.3)box(environment,2.46,.015,.022,'#c9b7ae',x,.12,z)}
 for(let z=-24;z<24;z+=5)box(environment,.11,.02,2.3,'#e4d2ae',0,.01,z);
 for(let i=0;i<7;i++)box(environment,1.05,.025,2.6,'#f4e9d9',-4.2+i*1.4,.015,8);
 const buildings=[[-11,2,7,7,7,'#d6a99a','카페  봄날','#927a74'],[11,-3,7,8,8,'#c7b6b0','연남 레코드','#797387'],[-11,-10,7,8,7,'#c9c9b8','꽃과 사이','#7b9b87'],[11,-16,7,11,9,'#d8b99e','서울 책방','#a78378'],[-11,16,7,9,7,'#cab9be','작은 사진관','#8d8598'],[11,16,7,6,7,'#c6c8bd','연남 24','#6e9b8f'],[-11,-23,7,12,7,'#ceb7b8','골목 작업실','#988795']];
 for(const [x,z,w,h,d,col,title,accent]of buildings){const g=new THREE.Group();g.position.set(x,0,z);environment.add(g);box(g,w,h,d,col,0,h/2,0);box(g,w+.3,.35,d+.3,'#ac9b96',0,h,0);const front=z+d/2+.02;const face=d/2+.025;
 for(let yy=3.8;yy<h-1;yy+=2.8)for(let xx=-w/2+1.25;xx<w/2;xx+=2.1){box(g,1.4,1.8,.08,'#8b8e94',xx,yy,face);box(g,.07,1.8,.12,'#ece0d5',xx,yy,face+.05);box(g,1.4,.07,.12,'#ece0d5',xx,yy,face+.05)}
 box(g,w-1,2.35,.12,'#7d888d',0,1.25,face);for(let xx=-w/2+.55;xx<w/2;xx+=1.5)box(g,.08,2.35,.18,'#eee2d2',xx,1.25,face+.1);sign(g,title,w-.5,.82,0,2.85,face+.13,'#f6eadd',accent);
 const awning=box(g,w+.3,.14,1.5,accent,0,2.3,face+.55);awning.rotation.x=.13;for(let xx=-w/2;xx<w/2;xx+=.75)box(g,.3,.18,1.55,'#eaded0',xx,2.33,face+.55).rotation.x=.13;
 box(g,w-.2,.12,1,'#bcafa4',0,.1,face+.5);colliders.push({x,z,w:w/2+.35,d:d/2+.45});
 // Rooftop water tanks and utility boxes.
 cylinder(g,.75,.75,1.1,'#c9cdd0',1,h+.7,0);box(g,1.1,.9,1.2,'#bbb4b3',-1.7,h+.55,-1.7);
 }
 // Side-facing shop signs make the street legible from the walking camera.
 const cafe=sign(environment,'카페 봄날',3,.9,-7.45,3.6,3,'#f9e7d7','#846477');cafe.rotation.y=Math.PI/2;
 const record=sign(environment,'레코드',2.4,.8,7.45,3.5,-3,'#737185','#fff3df');record.rotation.y=-Math.PI/2;
 // Small tables on the sidewalk.
 for(const z of [3,5]){cylinder(environment,.7,.7,.12,'#c39180',-6.2,.9,z);cylinder(environment,.06,.12,.9,'#716576',-6.2,.45,z);for(const dz of [-.9,.9]){box(environment,.6,.12,.6,'#e1beaa',-6.2,.52,z+dz);box(environment,.6,.65,.1,'#d4a790',-6.2,.9,z+dz+.25)}}
 // Trees, planting boxes, lanterns.
 for(const [x,z]of [[-6,12],[6,4],[-6,-5],[6,-13],[-6,-20],[6,20]]){box(environment,1.2,.5,1.2,'#cda997',x,.2,z);cylinder(environment,.1,.17,2.9,'#907d75',x,1.6,z);for(const [dx,dy,dz,r]of [[0,0,0,1.5],[-.8,-.3,0,1],[.7,-.1,.4,1.1],[0,.45,-.5,1]])sphere(environment,r,'#e3bacb',x+dx,3.7+dy,z+dz,1,.8,1);}
 for(const z of [-18,-6,7,19]){cylinder(environment,.055,.07,4.5,'#777786',5.15,2.25,z);box(environment,1,.07,.07,'#777786',4.7,4.5,z);sphere(environment,.22,'#ffe8b1',4.2,4.4,z);}
 // Bus shelter, post box, flower pots.
 box(environment,1.7,.14,4,'#8498a3',6.5,3.1,11);box(environment,.08,3,3.8,'#b7c6c7',7.2,1.6,11);for(const z of [9.2,12.8])box(environment,.09,3,.09,'#7f9098',5.9,1.6,z);box(environment,.65,.18,2.4,'#bb9b84',6.6,.65,11);sign(environment,'버스 · 연남동',2,.45,6.5,2.7,13.04,'#708b97','#fff8e9');
 box(environment,.55,1.15,.6,'#be7c80',-5.8,.65,-1);
 for(let i=0;i<18;i++){const x=i%2?-15:15;const z=-30+i*3.5;box(environment,5,10+i%5*2,4,['#c5b9c3','#cbb9ba','#c2bdc5'][i%3],x,5+i%5,z)}
 // Namsan hill and distant tower silhouette.
 sphere(environment,12,'#b1b0ad',-8,-1,-45,1.9,.65,1);cylinder(environment,.16,.6,10,'#dbd7ce',-8,10,-45);cylinder(environment,1.1,1.1,.8,'#b3b1b4',-8,13.8,-45);cylinder(environment,.08,.14,4,'#c2bdc1',-8,16,-45);
 const playerRoot=new THREE.Group();playerRoot.name='player-layer';actors.add(playerRoot);playerRoot.add(makePerson({hair:'#383545',outfit:'#6f829b',male:true}));
 const npcs=characters.map(c=>{const root=new THREE.Group();root.name=c.id;root.position.set(c.position[0],0,c.position[1]);root.add(makePerson(c));actors.add(root);const ring=new THREE.Mesh(new THREE.RingGeometry(.65,.69,48),new THREE.MeshBasicMaterial({color:c.color,side:THREE.DoubleSide,transparent:true,opacity:.7}));ring.rotation.x=-Math.PI/2;ring.position.y=.13;root.add(ring);return {config:c,root,ring}});
 const itemPositions=[[-2,6],[3,4],[-3,-2],[2,-5],[-2,-9],[3,-12],[-3,-17],[2,14],[-2,18],[3,-21]];
 const items=itemPositions.map(([x,z],i)=>{const root=new THREE.Group();root.position.set(x,.7,z);itemLayer.add(root);const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.24),new THREE.MeshStandardMaterial({color:'#ffe2aa',emissive:'#dcac69',emissiveIntensity:.3,metalness:.25,roughness:.25}));gem.name='pickup-placeholder';gem.castShadow=true;root.add(gem);const ring=new THREE.Mesh(new THREE.TorusGeometry(.42,.015,4,32),material('#fff0c9'));ring.rotation.x=Math.PI/2;root.add(ring);return {id:`gift-${i}`,root,x,z}});
 applyItemModels(items,renderer).catch(error=>{console.error('Watch item load failed',error);window.dispatchEvent(new CustomEvent('item-load-error'));});
 function canMove(x,z){return Math.abs(x)<7&&z>-25&&z<24&&!colliders.some(b=>Math.abs(x-b.x)<b.w&&Math.abs(z-b.z)<b.d)}
 return {scene,camera,renderer,environment,actors,itemLayer,playerRoot,npcs,items,canMove};
}
export function makePerson({hair='#574458',outfit='#b999c5',male=false}){const g=new THREE.Group();g.name='visual';const skin='#f2d3c0';cylinder(g,.19,.27,.64,outfit,0,1.03,0);if(!male)cylinder(g,.23,.38,.45,outfit,0,.67,0);for(const x of [-.13,.13]){cylinder(g,.065,.072,.58,male?'#55576a':skin,x,.33,0);box(g,.15,.12,.26,'#675669',x,.075,.07)}sphere(g,.31,skin,0,1.57,0,1,1.1,.92);sphere(g,.32,hair,0,1.66,-.04,1,1,.9);sphere(g,.245,skin,0,1.54,.14,1,1,.64);if(!male)for(const x of [-.25,.25])sphere(g,.17,hair,x,1.37,-.025,.7,2.3,1);for(const x of [-.105,.105]){sphere(g,.033,'#59495f',x,1.59,.29,.7,1,1);sphere(g,.01,'#ffffff',x-.006,1.602,.318)}for(const x of [-.32,.32]){const arm=cylinder(g,.068,.06,.62,outfit,x,1.02,0);arm.rotation.z=x<0?-.13:.13;sphere(g,.068,skin,x*1.12,.7,0)}if(male){const bag=box(g,.27,.4,.15,'#b39586',.22,.84,.2);bag.rotation.z=-.2;}return g}
export async function replaceModel(root,url,{height=1.85,rotation=0,environment=false,scale=1}={}){
 const gltf=await new GLTFLoader().loadAsync(url),model=gltf.scene;
 model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
 if(!Number.isFinite(size.y)||size.y<=0)throw Error('모델 크기를 읽을 수 없어요.');
 const holder=new THREE.Group();holder.name='loaded-model';
 if(environment)model.scale.setScalar(scale);
 else{const ratio=height/size.y;model.scale.setScalar(ratio);model.position.set(-(bounds.min.x+bounds.max.x)/2*ratio,-bounds.min.y*ratio,-(bounds.min.z+bounds.max.z)/2*ratio);holder.rotation.y=rotation;}
 model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});holder.add(model);
 root.userData.mixer?.stopAllAction();
 // Preserve the interaction ring when replacing only a character visual.
 for(const child of [...root.children])if(child.name!=='held-earphones'&&!(child.isMesh&&child.geometry?.type==='RingGeometry'))root.remove(child);
 root.add(holder);delete root.userData.animate;
 if(gltf.animations.length){
  const mixer=new THREE.AnimationMixer(model);root.userData.mixer=mixer;
  const idleClip=gltf.animations.find(c=>/^idle$/i.test(c.name));
  const walkClip=gltf.animations.find(c=>/walk/i.test(c.name));
  const idle=idleClip?mixer.clipAction(idleClip):null;
  const walk=walkClip?mixer.clipAction(walkClip):idle;
  let current=idle;idle?.play();
  if(!idle&&walk){walk.play();walk.paused=true;walk.time=0;mixer.update(0);}
  root.userData.animate=(dt,moving=false)=>{
   if(!idle&&walk){walk.paused=!moving;if(moving)mixer.update(dt);else{walk.time=0;mixer.update(0);}return;}
   const next=moving?walk:idle;
   if(next&&next!==current){next.reset().play();current?.crossFadeTo(next,.2,false);current=next;}
   mixer.update(dt);
  };
 }
 holder.userData.animationNames=gltf.animations.map(c=>c.name);return holder;
}
