import {movementLimit} from './realmDesign';
export const strikeRange=6;
export const strikeStunSeconds=3;
export const strikeKnockback=3;
export type StrikePoint={x:number;z:number};
/** Closed gates block the pulse as well as movement. */
export function inStrikeRange(realm:number,step:number,origin:StrikePoint,target:StrikePoint){
 const barrier=movementLimit(realm,step);
 return Math.hypot(target.x-origin.x,target.z-origin.z)<=strikeRange&&(barrier===null||(target.z-barrier)*(origin.z-barrier)>=0);
}
export function repelGuard(realm:number,step:number,origin:StrikePoint,target:StrikePoint):StrikePoint{
 const dx=target.x-origin.x,dz=target.z-origin.z,length=Math.hypot(dx,dz);
 const next={x:Math.max(-4.5,Math.min(4.5,target.x+(length?dx/length:0)*strikeKnockback)),z:Math.max(-28,Math.min(23,target.z+(length?dz/length:1)*strikeKnockback))};
 const barrier=movementLimit(realm,step);
 if(barrier!==null&&(next.z-barrier)*(target.z-barrier)<0)next.z=barrier+(target.z>=barrier?.3:-.3);
 return next;
}
