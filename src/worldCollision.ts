import {stationPositions} from './campaign';
import {bossStones,clampBossArena,avoidBossThrone,bossWalkRadius,bossThroneBounds} from './bossArena';

export const mechanismRadii=[1.4,1.25,1.55,1.2];
/** Keep the player's body outside solid mechanisms; interaction still works at 2.5 units. */
export function keepClearOfMechanisms(realm:number,x:number,z:number,previousX=x,previousZ=z){
  if(realm===4){const bounded=clampBossArena(x,z);x=bounded.x;z=bounded.z}
  const centers=realm===4?bossStones.map(s=>[s.x,s.z]):stationPositions;
  for(let index=0;index<centers.length;index++){const [cx,cz]=centers[index],radius=realm===4?(index===0?1.1:.8):mechanismRadii[realm];let dx=x-cx,dz=z-cz;const distance=Math.hypot(dx,dz);if(distance>=radius)continue;
    if(distance<.0001){dx=previousX-cx;dz=previousZ-cz;if(Math.hypot(dx,dz)<.0001){dx=0;dz=1}}
    const length=Math.hypot(dx,dz);x=cx+dx/length*radius;z=cz+dz/length*radius;
  }
  if(realm===4){let clear=avoidBossThrone(x,z,previousX,previousZ);
    // The rear stone and throne borders meet: choose a legal contact arc rather than
    // projecting the hero back and forth between the two solid objects.
    for(const stone of bossStones){const radius=stone.index===0?1.1:.8;if(Math.hypot(clear.x-stone.x,clear.z-stone.z)>=radius-.0000001)continue;
      let best:{x:number;z:number;cost:number}|undefined;
      for(let i=0;i<64;i++){const angle=i*Math.PI/32,candidate={x:stone.x+Math.cos(angle)*(radius+.002),z:stone.z+Math.sin(angle)*(radius+.002)},b=bossThroneBounds;
        if(Math.hypot(candidate.x,candidate.z+3)>bossWalkRadius||candidate.x>b.left&&candidate.x<b.right&&candidate.z>b.back&&candidate.z<b.front)continue;
        if(bossStones.some(s=>Math.hypot(candidate.x-s.x,candidate.z-s.z)<(s.index===0?1.1:.8)-.000001))continue;
        const cost=Math.hypot(candidate.x-clear.x,candidate.z-clear.z)+Math.hypot(candidate.x-previousX,candidate.z-previousZ)*.001;if(!best||cost<best.cost)best={...candidate,cost};
      }if(best)clear={x:best.x,z:best.z};
    }return clampBossArena(clear.x,clear.z);
  }return {x,z};
}
