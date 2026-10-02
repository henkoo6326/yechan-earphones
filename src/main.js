import './style.css';
import {ASSETS} from './assets.js';
import {createState,probability,collect,ask,nextDay,restore,MAX_KNOTS,PINK_CHARACTER_ID} from './rules.js';
import {createWorld,replaceModel,THREE} from './world.js';
import {portraitSVG} from './portrait.js';
import {setupIntro} from './intro.js';
import {createCastMotion} from './cast-motion.js';
import {createHeldEarphones,createEarphoneSequence,EARPHONE_FRAMES,frameForKnots} from './earphones.js';
const $=id=>document.getElementById(id);
let state;try{state=restore(JSON.parse(localStorage.getItem('seoul-knot-save')))}catch{state=createState()}
let introActive=true,active=null,nearest=null,target=null,toastTimer,world,heldEarphones,earphoneSequence;
const keys=new Set();
const save=()=>{if(world)state.position=[world.playerRoot.position.x,world.playerRoot.position.z];try{localStorage.setItem('seoul-knot-save',JSON.stringify(state))}catch{toast('저장 공간을 사용할 수 없어 이번 진행은 현재 화면에서만 유지돼요.')}};
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200)}
addEventListener('item-load-error',()=>toast('시계 모델을 불러오지 못해 임시 아이템으로 표시합니다. 새로고침해주세요.'));
const intro=setupIntro(()=>{introActive=false;keys.clear();target=null;if(!world)return;if(state.knots===0)showEnding();else toast('골목을 걸어보세요. 반짝이는 아이템을 모으면 행운이 올라가요.');});
try{world=createWorld($('world'),ASSETS.characters)}catch(e){console.error(e);const notice=document.createElement('div');notice.style.cssText='position:fixed;inset:30%;padding:30px;background:#fff8f0;z-index:20';notice.textContent='3D 화면을 시작하지 못했어요. WebGL을 지원하는 브라우저에서 하드웨어 가속을 켜고 다시 열어주세요.';$('world').append(notice);}
if(world)boot();
function boot(){
 const {scene,camera,renderer,playerRoot,npcs,items}=world;
 const updateCast=createCastMotion(npcs,world.canMove);
 heldEarphones=createHeldEarphones(playerRoot);earphoneSequence=createEarphoneSequence();
 $('earphone-status').onclick=()=>earphoneSequence.play(state.knots,state.knots);
 playerRoot.position.set(state.position[0],0,state.position[1]);
 if(!world.canMove(playerRoot.position.x,playerRoot.position.z))playerRoot.position.set(0,0,8);
 const labels=npcs.map(n=>{const el=document.createElement('div');el.className='npc-label';el.innerHTML=`<b>♡</b> ${n.config.name}`;$('npc-labels').append(el);return el});
 const raycaster=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),pointer=new THREE.Vector2();
 function paused(){return introActive||!!active||!!document.querySelector('dialog[open]')}
 renderer.domElement.addEventListener('pointerdown',e=>{if(paused())return;pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);raycaster.setFromCamera(pointer,camera);const p=new THREE.Vector3();if(raycaster.ray.intersectPlane(plane,p)&&world.canMove(p.x,p.z))target=p;});
 addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)&&!paused())e.preventDefault();if(e.key==='Escape'&&active){closeDialogue();return}if(paused())return;keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='e'&&!e.repeat&&nearest)openDialogue(nearest)});
 addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>{keys.clear();target=null;save()});
 document.querySelectorAll('[data-dir]').forEach(btn=>{const map={up:'w',down:'s',left:'a',right:'d'};btn.addEventListener('pointerdown',e=>{e.preventDefault();if(paused())return;btn.setPointerCapture(e.pointerId);keys.add(map[btn.dataset.dir])});for(const ev of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(ev,()=>keys.delete(map[btn.dataset.dir]))});
 $('talk').onclick=()=>nearest&&openDialogue(nearest);
 $('settings').onclick=()=>{$('settings-panel').showModal();keys.clear();target=null};$('guide-toggle').onclick=()=>$('guide').showModal();
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
 $('next-day').onclick=()=>{if(state.knots===0){showEnding();return}nextDay(state);playerRoot.position.set(0,0,8);target=null;save();hud();toast(`${state.day}일째, 새로운 만남을 시작해요. 모아둔 행운은 그대로예요.`)};
 $('reset').onclick=()=>{$('reset-confirm').hidden=false;$('reset').hidden=true};
 $('reset-confirm').onclick=()=>{resetGame();$('settings-panel').close();$('reset-confirm').hidden=true;$('reset').hidden=false};
 $('replay').onclick=()=>{resetGame();$('ending').close()};
 setupAssets();setupAudio();hud();
 // Load separately configured assets without coupling environment to character visuals.
 if(ASSETS.player.url)replaceModel(playerRoot,ASSETS.player.url,ASSETS.player).catch(()=>toast('플레이어 모델을 불러오지 못해 임시 모델로 표시합니다.'));
 if(ASSETS.environment.url)replaceModel(world.environment,ASSETS.environment.url,{environment:true,scale:ASSETS.environment.scale}).catch(()=>toast('배경 모델을 불러오지 못해 기본 골목으로 표시합니다.'));
 for(const n of npcs)if(n.config.model)replaceModel(n.root,n.config.model,n.config).catch(()=>toast(`${n.config.name} 모델을 불러오지 못했어요.`));
 let last=performance.now(),lastSave=0;
 const look=new THREE.Vector3(0,0,0),desired=new THREE.Vector3();
 renderer.setAnimationLoop(time=>{
 const dt=Math.min((time-last)/1000,.045);last=time;
 let moving=false;
 if(!paused()){
 let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));let dz=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
 if(dx||dz){target=null;const mag=Math.hypot(dx,dz);const a=dx/mag,b=dz/mag;dx=a*.86+b*.5;dz=-a*.5+b*.86}
 else if(target){dx=target.x-playerRoot.position.x;dz=target.z-playerRoot.position.z;const len=Math.hypot(dx,dz);if(len<.15){target=null;dx=dz=0}else{dx/=len;dz/=len}}
 if(dx||dz){const speed=4*dt;const x=playerRoot.position.x+dx*speed,z=playerRoot.position.z+dz*speed;if(world.canMove(x,playerRoot.position.z))playerRoot.position.x=x;if(world.canMove(playerRoot.position.x,z))playerRoot.position.z=z;playerRoot.rotation.y=Math.atan2(dx,dz);moving=true;}
 nearest=null;let dist=2.65;for(const n of npcs){const d=playerRoot.position.distanceTo(n.root.position);if(d<dist){nearest=n;dist=d}}
 $('interaction').hidden=!nearest||state.knots===0;if(nearest){$('near-name').textContent=nearest.config.name; $('talk').innerHTML=state.attempts[nearest.config.id]?'<kbd>E</kbd> 다시 인사하기':'<kbd>E</kbd> 말 걸기'}
 for(const item of items)if(item.root.visible&&Math.hypot(playerRoot.position.x-item.x,playerRoot.position.z-item.z)<.8&&collect(state,item.id)){item.root.visible=false;save();hud();toast(`시계를 주웠어요! 도움 확률 ${Math.round(probability(state.items.length)*100)}%`);playChime()}
 }else $('interaction').hidden=true;
 updateCast(dt,{paused:paused(),player:playerRoot.position});
 playerRoot.userData.animate?.(dt,moving);
 heldEarphones.update();
 playerRoot.position.y=moving?Math.abs(Math.sin(time*.012))*.07:0;
 const focusZ=playerRoot.position.z-3;
 // Keep the street visible to the right of the quest panel.
 const horizontal=innerWidth>850?2.4:0;
 desired.set(playerRoot.position.x*.25+horizontal,30,focusZ+28);
 camera.position.lerp(desired,1-Math.exp(-dt*4));look.set(playerRoot.position.x*.25+horizontal,0,focusZ);camera.lookAt(look);
 for(const [i,n]of npcs.entries()){const p=n.root.position.clone();p.y=2.5;p.project(camera);labels[i].style.left=`${(p.x*.5+.5)*innerWidth}px`;labels[i].style.top=`${(-p.y*.5+.5)*innerHeight}px`;labels[i].hidden=!!active||p.z>1||p.x<-1||p.x>1||p.y<-1||p.y>1;labels[i].innerHTML=`<b>${state.attempts[n.config.id]?'✓':'♡'}</b> ${n.config.name}`;}
 for(const [i,item]of items.entries()){item.root.rotation.y=time*.001+i;item.root.position.y=.7+Math.sin(time*.002+i)*.1}
 renderer.render(scene,camera);
 if(time-lastSave>2000&&!introActive){lastSave=time;save()}
 });
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2))});
}
function hud(){if(!world)return;const p=Math.round(probability(state.items.length)*100);$('day').textContent=`${state.day}일째 · 17:30`;$('chance').innerHTML=`${p}<span>%</span>`;$('chance-bar').style.width=p+'%';$('inventory').textContent=state.items.length+' / 10';$('slots').innerHTML=Array.from({length:10},(_,i)=>`<i class="${i<state.items.length?'collected':''}"></i>`).join('');$('knot-count').textContent=state.knots+' / '+MAX_KNOTS;$('knot-icons').textContent=Array.from({length:MAX_KNOTS},(_,i)=>i<state.knots?'⌁':'♡').join('  ');for(const item of world.items)item.root.visible=!state.items.includes(item.id);heldEarphones?.setKnots(state.knots);$('earphone-thumb').src=EARPHONE_FRAMES[frameForKnots(state.knots)];$('earphone-state-label').textContent=state.knots===0?'완전히 풀린 이어폰':`내 이어폰 · 매듭 ${state.knots}개`;}
function setChoices(options){$('choices').replaceChildren(...options.map(([label,action])=>{const b=document.createElement('button');b.textContent=label;b.onclick=action;return b}));}
function openDialogue(n){active=n;keys.clear();target=null;$('dialogue').hidden=false;const c=n.config;const p=$('portrait');p.replaceChildren();if(c.portrait){const img=new Image();img.src=c.portrait;img.alt=c.name;img.onerror=()=>{p.innerHTML=portraitSVG(c)};p.append(img)}else p.innerHTML=portraitSVG(c);$('character-name').textContent=c.name;$('character-role').textContent=c.role;$('speaker').textContent=c.name;$('speaker').style.background=c.color;
 if(c.id===PINK_CHARACTER_ID&&state.knots>0){requestHelp(n);return;}
 if(state.attempts[c.id]){$('line').textContent=state.attempts[c.id]==='helped'?'남은 매듭도 꼭 풀리면 좋겠어요. 다음에 또 봐요!':'오늘은 조금 어려울 것 같아요. 내일 다시 이야기해요.';setChoices([['다음에 또 봐요',closeDialogue]])}else{$('line').textContent=c.greeting;setChoices([['이 줄 좀 풀어주세요.',()=>requestHelp(n)],['아, 다음에 이야기할게요.',closeDialogue]])}requestAnimationFrame(()=>$('choices').querySelector('button')?.focus());}
function requestHelp(n){
 const previous=state.knots;const result=ask(state,n.config.id);save();hud();if(result==='already')return;
 const pink=n.config.id===PINK_CHARACTER_ID,success=result!=='rejected';
 const playResult=()=>{closeDialogue();earphoneSequence.play(previous,state.knots,{pink,complete:state.knots===0,done:()=>{if(state.knots===0)showEnding();else if(Object.keys(state.attempts).length===ASSETS.characters.length)toast('오늘은 모두 만났어요. 내일 다시 만나보세요.')}})};
 if(success)playChime();
 if(pink){playResult();return;}
 $('line').textContent=success?n.config.help:n.config.reject+' 당황해서 줄을 만지다가 조금 더 꼬여버렸다…';
 $('speaker').textContent=n.config.name+(success?' · 매듭 하나 해결!':'');
 setChoices([[success?'이어폰을 확인해볼까?':'이어폰을 다시 살펴보기',playResult]]);
}
function closeDialogue(){active=null;$('dialogue').hidden=true;keys.clear();$('talk').focus();}
function showEnding(){
 $('ending').querySelector('h2').textContent=state.ending==='pink'?'예찬아, 이제 같이 듣자.':'풀린 건, 이어폰만이 아니었어.';
 $('ending-text').textContent=state.ending==='pink'?'분홍빛 옷의 유나가 웃으며 손을 내밀었다. 복잡하게 엉킨 줄이 한 번에 풀리고, 드디어 둘이 함께 들을 음악이 시작됐다.':`${state.day}일 동안의 작은 부탁 끝에 이어폰이 풀렸어요. 우연히 나눈 인사들이 오늘의 가장 좋은 음악이 되었네요.`;
 if(!$('ending').open)$('ending').showModal();
}
function resetGame(){earphoneSequence?.cancel();state=createState();world.playerRoot.position.set(0,0,8);target=null;active=null;$('dialogue').hidden=true;save();hud();toast('새로운 이야기가 시작됩니다.')}
function setupAssets(){const rows=[['남자 주인공 · 3D 모델','model',world.playerRoot,null],['서울 배경 · 3D 모델','environment',world.environment,null],...world.npcs.flatMap(n=>[[`${n.config.name} · 3D 모델`,'model',n.root,n.config],[`${n.config.name} · 대화 초상`,'portrait',null,n.config]])];for(const [name,type,root,config]of rows){const label=document.createElement('label');label.className='asset-row';label.textContent=name;const input=document.createElement('input');input.type='file';input.accept=type==='portrait'?'image/png,image/jpeg,image/webp':'.glb';input.addEventListener('change',async()=>{const file=input.files[0];if(!file)return;const url=URL.createObjectURL(file);input.disabled=true;try{if(type==='portrait'){const probe=new Image();probe.src=url;await probe.decode();if(config.portrait?.startsWith('blob:'))URL.revokeObjectURL(config.portrait);config.portrait=url}else{await replaceModel(root,url,{environment:type==='environment'});URL.revokeObjectURL(url)}toast(`${name}을 교체했어요.`)}catch{URL.revokeObjectURL(url);toast('파일을 불러오지 못했어요. GLB 또는 이미지 형식을 확인해주세요.')}finally{input.disabled=false}});label.append(input);$('asset-inputs').append(label)}}
let audio=null,muted=true,musicTimer=null,beat=0;
function tone(freq,start,duration,volume=.035){if(!audio||muted)return;const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(volume,start+.02);g.gain.exponentialRampToValueAtTime(.001,start+duration);o.connect(g);g.connect(audio.destination);o.start(start);o.stop(start+duration+.02)}
function playChime(){if(audio&&!muted)[523.25,659.25,783.99].forEach((f,i)=>tone(f,audio.currentTime+i*.1,.5))}
function setupAudio(){$('sound').onclick=async()=>{try{audio??=new AudioContext();await audio.resume();muted=!muted;$('sound').textContent=muted?'♫':'♪';$('sound').setAttribute('aria-label',muted?'음악 켜기':'음악 끄기');$('sound').setAttribute('aria-pressed',String(!muted));if(musicTimer)clearInterval(musicTimer);if(!muted){playChime();musicTimer=setInterval(()=>{if(document.hidden)return;const notes=[261.63,329.63,392,493.88,440,392,329.63,293.66];tone(notes[beat++%8],audio.currentTime,1.6,.018);if(beat%4===0)tone(130.81,audio.currentTime,2,.014)},650)}}catch{toast('이 브라우저에서는 음악을 재생할 수 없어요.')}}}
