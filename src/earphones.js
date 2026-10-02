import * as THREE from 'three';
import {MAX_KNOTS} from './rules.js';
export const EARPHONE_FRAMES=Array.from({length:6},(_,i)=>`${import.meta.env?.BASE_URL??'/'}assets/earphones/0${i+1}.png`);
export const frameForKnots=knots=>Math.max(0,Math.min(5,MAX_KNOTS-knots));
export function createHeldEarphones(player){
 const group=new THREE.Group();group.name='held-earphones';player.add(group);
 const cableMaterial=new THREE.MeshStandardMaterial({color:'#fff9ec',roughness:.55});
 let current=-1;const handPosition=new THREE.Vector3();
 function setKnots(knots){if(current===knots)return;current=knots;
  for(const c of [...group.children]){group.remove(c);c.geometry?.dispose()}
  const points=[];const amount=knots/MAX_KNOTS;
  for(let i=0;i<=100;i++){const t=i/100;const envelope=Math.sin(Math.PI*t);points.push(new THREE.Vector3((t-.5)*.35+Math.sin(t*Math.PI*14)*.13*amount*envelope,-.04-Math.sin(Math.PI*t)*(.35-.15*amount)+Math.cos(t*Math.PI*14)*.1*amount*envelope,Math.sin(t*Math.PI*10)*.06*amount*envelope));}
  const cable=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),110,.008,5,false),cableMaterial);group.add(cable);
  for(const x of [-.175,.175]){const bud=new THREE.Mesh(new THREE.SphereGeometry(.026,10,8),cableMaterial);bud.position.set(x,-.04,0);group.add(bud)}
 }
 function update(){const hand=player.getObjectByName('RightHand');if(hand){player.updateMatrixWorld(true);hand.getWorldPosition(handPosition);player.worldToLocal(handPosition);group.position.copy(handPosition)}else group.position.set(.34,.72,.08)}
 return {group,setKnots,update};
}
export function createEarphoneSequence(){
 const dialog=document.getElementById('earphone-scene'),a=document.getElementById('earphone-frame-a'),b=document.getElementById('earphone-frame-b');
 let token=0,onDone=null,showing=a;
 for(const src of EARPHONE_FRAMES){const img=new Image();img.src=src;}
 function display(index,instant=false){const next=showing===a?b:a;next.src=EARPHONE_FRAMES[index];next.alt=`예찬이 들고 있는 이어폰: 풀림 ${index}/5단계`;next.style.transition=instant?'none':'';next.classList.add('visible');showing.classList.remove('visible');showing=next;document.getElementById('earphone-stage').textContent=index===5?'완전히 풀렸어!':`남은 매듭 ${5-index}개`;}
 function finish(){token++;dialog.close();const callback=onDone;onDone=null;callback?.();}
 document.getElementById('earphone-continue').onclick=finish;
 dialog.addEventListener('cancel',e=>{e.preventDefault();finish()});
 async function play(from,to,{pink=false,complete=false,done}={}){
  const run=++token;onDone=done;document.getElementById('earphone-title').textContent=pink?'“예찬아! 그러면 안돼! 내가 풀어줄게.”':to<from?'조금씩, 실마리가 보인다.':to>from?'당황해서 만지다가… 다시 꼬였네.':'아직은, 풀리지 않은 마음.';
  document.getElementById('earphone-continue').textContent=complete?'엔딩 보기':'골목으로 돌아가기';
  display(frameForKnots(from),true);dialog.showModal();
  const start=frameForKnots(from),end=frameForKnots(to),direction=Math.sign(end-start);
  for(let n=start+direction;direction&& (direction>0?n<=end:n>=end);n+=direction){await new Promise(resolve=>setTimeout(resolve,650));if(token!==run)return;display(n)}
 }
 return {play,cancel(){token++;onDone=null;if(dialog.open)dialog.close()}};
}
