import {bossQuestionCount} from './bossRules';
export const bossArenaCenter={x:0,z:-3};
export const bossWalkRadius=11.5;
const names=['入口側石碑','東南石碑','東側石碑','東北石碑','王座後石碑','西北石碑','西側石碑','西南石碑'];
const glyphs=['敘','表','判','有','無','主','語','封'];
export const bossStones=[{index:0,name:'中央封印碑',glyph:'封',x:0,z:-3},...names.map((name,i)=>({index:i+1,name,glyph:glyphs[i],x:Math.sin(i*Math.PI/4)*10.7,z:-3+Math.cos(i*Math.PI/4)*10.7}))];
/** Alternating flanks prevent consecutive questions from being answered at one location. */
export const bossStoneOrder=[0,8,2,1,3,7,4,6,5,2,8,3,7,4,6,0] as const;
export function bossTargetStone(step:number){return bossStones[step>=0&&step<bossQuestionCount?bossStoneOrder[step]:0]}
export function clampBossArena(x:number,z:number){const dx=x,dz=z-bossArenaCenter.z,d=Math.hypot(dx,dz);return d>bossWalkRadius?{x:dx/d*bossWalkRadius,z:bossArenaCenter.z+dz/d*bossWalkRadius}:{x,z}}
export const bossThroneBounds={left:-2.9,right:2.9,back:-13.6,front:-9.4};
export function avoidBossThrone(x:number,z:number,previousX:number,previousZ:number){
 const b=bossThroneBounds;if(x<=b.left||x>=b.right||z<=b.back||z>=b.front)return {x,z};
 if(previousX<=b.left)return {x:b.left,z};if(previousX>=b.right)return {x:b.right,z};
 if(previousZ>=b.front)return {x,z:b.front};if(previousZ<=b.back)return {x,z:b.back};
 const edges=[{d:x-b.left,x:b.left,z},{d:b.right-x,x:b.right,z},{d:z-b.back,x,z:b.back},{d:b.front-z,x,z:b.front}].sort((a,b)=>a.d-b.d);return {x:edges[0].x,z:edges[0].z};
}
