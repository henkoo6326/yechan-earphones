import {test} from 'node:test';import assert from 'node:assert/strict';
import {createCastMotion} from './cast-motion.js';
const make=()=>({config:{position:[0,0]},root:{position:{x:0,y:0,z:0},rotation:{y:0},userData:{}}});
test('NPC moves on a valid route but freezes for dialogue and nearby player',()=>{
 const n=make(),tick=createCastMotion([n],()=>true);for(let i=0;i<200;i++)tick(.05,{player:{x:20,z:20}});
 assert.ok(Math.hypot(n.root.position.x,n.root.position.z)>.1);const p={...n.root.position};
 tick(.05,{paused:true,player:{x:20,z:20}});assert.deepEqual(n.root.position,p);
 tick(.05,{player:{x:p.x+.5,z:p.z}});assert.deepEqual(n.root.position,p);
});
test('blocked routes cannot move NPCs through obstacles',()=>{const n=make(),tick=createCastMotion([n],()=>false);for(let i=0;i<400;i++)tick(.05,{player:{x:20,z:20}});assert.deepEqual(n.root.position,{x:0,y:0,z:0});});
