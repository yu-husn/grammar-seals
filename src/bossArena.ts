import {bossQuestionCount} from './bossRules';
export const bossArenaCenter={x:0,z:-3};
export const bossWalkRadius=11.5;
// Keep stable stone IDs while leaving the area behind the boss free of questions.
const perimeter=[{index:1,name:'入口側石碑',glyph:'敘'},{index:2,name:'東南石碑',glyph:'表'},{index:3,name:'東側石碑',glyph:'判'},{index:4,name:'東北石碑',glyph:'有'},{index:6,name:'西北石碑',glyph:'主'},{index:7,name:'西側石碑',glyph:'語'},{index:8,name:'西南石碑',glyph:'封'}];
export const bossStones=[{index:0,name:'中央封印碑',glyph:'封',x:0,z:-3},...perimeter.map(stone=>({...stone,x:Math.sin((stone.index-1)*Math.PI/4)*10.7,z:-3+Math.cos((stone.index-1)*Math.PI/4)*10.7}))];
/** Alternating flanks prevent consecutive questions from being answered at one location. */
export const bossStoneOrder=[0,8,2,1,3,7,4,6,1,2,8,3,7,4,6,0] as const;
export function bossTargetStone(step:number){const index=step>=0&&step<bossQuestionCount?bossStoneOrder[step]:0;return bossStones.find(stone=>stone.index===index)!}
export function clampBossArena(x:number,z:number){const dx=x,dz=z-bossArenaCenter.z,d=Math.hypot(dx,dz);return d>bossWalkRadius?{x:dx/d*bossWalkRadius,z:bossArenaCenter.z+dz/d*bossWalkRadius}:{x,z}}
export const bossThroneBounds={left:-2.9,right:2.9,back:-13.6,front:-9.4};
export function avoidBossThrone(x:number,z:number,previousX:number,previousZ:number){
 const b=bossThroneBounds;if(x<=b.left||x>=b.right||z<=b.back||z>=b.front)return {x,z};
 if(previousX<=b.left)return {x:b.left,z};if(previousX>=b.right)return {x:b.right,z};
 if(previousZ>=b.front)return {x,z:b.front};if(previousZ<=b.back)return {x,z:b.back};
 const edges=[{d:x-b.left,x:b.left,z},{d:b.right-x,x:b.right,z},{d:z-b.back,x,z:b.back},{d:b.front-z,x,z:b.front}].sort((a,b)=>a.d-b.d);return {x:edges[0].x,z:edges[0].z};
}
