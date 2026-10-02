// Update NPC patrols without tying the route logic to a renderer.
export function createCastMotion(npcs,canMove){
 const agents=npcs.map((npc,i)=>({npc,wait:1+i*.31,index:0,route:[[.55,1.1],[-.5,1.2],[-.55,-1.05],[.4,-.9]].map(([x,z])=>({x:npc.config.position[0]+x,z:npc.config.position[1]+z}))}));
 return (dt,{paused=false,player=null}={})=>{
  dt=Math.max(0,Math.min(dt,.1));
  for(const a of agents){const {npc}=a,p=npc.root.position;let moving=false;
   const near=player&&Math.hypot(player.x-p.x,player.z-p.z)<2.9;
   if(!paused&&!near){
    if(a.wait>0)a.wait-=dt;
    else{const goal=a.route[a.index],dx=goal.x-p.x,dz=goal.z-p.z,d=Math.hypot(dx,dz),step=Math.min(d,.48*dt);
     if(d<.035){a.index=(a.index+1)%a.route.length;a.wait=1.8;}
     else{const x=p.x+dx/d*step,z=p.z+dz/d*step;
      // Include the model's footprint in obstacle tests.
      if([[0,0],[.32,0],[-.32,0],[0,.32],[0,-.32]].every(([ox,oz])=>canMove(x+ox,z+oz))){p.x=x;p.z=z;npc.root.rotation.y=Math.atan2(dx,dz);moving=true;}
      else{a.index=(a.index+1)%a.route.length;a.wait=.6;}
     }
    }
   }else if(near&&!paused)npc.root.rotation.y=Math.atan2(player.x-p.x,player.z-p.z);
   npc.root.userData.animate?.(dt,moving);
  }
 };
}
