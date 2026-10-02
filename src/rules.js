import {CAST} from './cast.js';
export const NPC_IDS=CAST.map(c=>c.id);
export const MAX_KNOTS=5;
export const PINK_CHARACTER_ID='yuna';
export const probability=count=>Math.min(.75,.25+Math.max(0,count)*.05);
export const createState=()=>({version:2,day:1,items:[],attempts:{},knots:MAX_KNOTS,position:[0,8],ending:null});
export function collect(s,id){if(!/^gift-[0-9]$/.test(id)||s.items.includes(id))return false;s.items.push(id);return true}
export function ask(s,id,random=Math.random){
 if(s.knots===0)return 'complete';
 if(!NPC_IDS.includes(id))return 'already';
 if(id===PINK_CHARACTER_ID){s.knots=0;s.ending='pink';s.attempts[id]='helped';return 'complete'}
 if(s.attempts[id])return 'already';
 const helped=random()<probability(s.items.length);s.attempts[id]=helped?'helped':'rejected';
 s.knots=helped?Math.max(0,s.knots-1):Math.min(MAX_KNOTS,s.knots+1);
 if(s.knots===0)s.ending='friends';
 return s.knots===0?'complete':s.attempts[id];
}
export function nextDay(s){s.day++;s.attempts={};s.position=[0,8]}
export function restore(raw){const s=createState();if(!raw||typeof raw!=='object')return s;s.day=Number.isInteger(raw.day)&&raw.day>0?raw.day:1;const max=raw.version===2?MAX_KNOTS:3;if(Number.isInteger(raw.knots)&&raw.knots>=0&&raw.knots<=max)s.knots=Math.round(raw.knots/max*MAX_KNOTS);s.ending=s.knots===0?(raw.ending==='pink'?'pink':'friends'):null;s.items=[...new Set((Array.isArray(raw.items)?raw.items:[]).filter(x=>/^gift-[0-9]$/.test(x)))];for(const id of NPC_IDS)if(['helped','rejected'].includes(raw.attempts?.[id]))s.attempts[id]=raw.attempts[id];if(Array.isArray(raw.position)&&raw.position.length===2&&raw.position.every(x=>Number.isFinite(x)&&Math.abs(x)<=25))s.position=raw.position;return s}
