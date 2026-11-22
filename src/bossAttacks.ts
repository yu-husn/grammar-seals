import {bossPhase} from './bossRules';
export const projectileCapacity=96;
export const bossEmitterCapacity=10;
export const bossProjectileLifetime=12;
export const bossWindupSeconds=[3.2,3.0,2.8] as const;
export const bossPatterns=['追蹤扇射','側翼交叉','環陣包圍','旋掃彈幕'];
type Point={x:number;z:number};
export type BossShot={x:number;z:number;vx:number;vz:number;curve:number};
export type BossVolley={pattern:number;label:string;shots:BossShot[];origins:Point[];interval:number;windup:number};
export function bossProjectileSpeed(step:number,volley=0){return 2.5+bossPhase(step)*.3+Math.min(volley*.01,.2)}
/** Seeded by volley number: repeatable for testing, varied across the battle. */
export function buildBossVolley(step:number,volley:number,target:Point):BossVolley{
  const phase=bossPhase(step),pattern=(volley+phase)%4;
  const count=Math.min(36,16+Math.max(0,Math.min(15,step))+Math.floor(volley/6));
  const speed=bossProjectileSpeed(step,volley),turn=volley*2.39996323;
  const origins:Point[]=pattern===0?[-1,1].map(side=>({x:side*3.4+Math.sin(turn)*.9,z:-10.5}))
    :pattern===1?[{x:-8.4,z:-8+Math.sin(turn)*1.2},{x:8.4,z:3+Math.cos(turn)*1.2},{x:8.4,z:-8+Math.cos(turn)*1.2},{x:-8.4,z:3+Math.sin(turn)*1.2}]
    // Ten of eleven angular slots leave a wider, rotating escape gap.
    :pattern===2?Array.from({length:bossEmitterCapacity},(_,i)=>({x:Math.sin(turn+i*Math.PI*2/11)*9.1,z:-3+Math.cos(turn+i*Math.PI*2/11)*9.1}))
    :[{x:-8.5,z:3},{x:8.5,z:-8},{x:Math.sin(turn)*4,z:10},{x:-Math.sin(turn)*4,z:-14.4}];
  const shots=Array.from({length:count},(_,i)=>{
    const origin=origins[i%origins.length],base=Math.atan2(target.x-origin.x,target.z-origin.z);
    // The first shot from every emitter targets the telegraphed position exactly.
    const waveIndex=Math.floor(i/origins.length),waveCount=Math.ceil(count/origins.length);
    const spread=waveIndex===0?0:((waveIndex-1)/Math.max(1,waveCount-2)-.5)*(pattern===0?1.5:pattern===3?1.25:.7);
    const angle=base+spread;
    return {x:origin.x,z:origin.z,vx:Math.sin(angle)*speed,vz:Math.cos(angle)*speed,curve:pattern===3?(waveIndex%2?-.17:.17)*(Math.floor(volley/4)%2?-1:1):0};
  });
  return {pattern,label:bossPatterns[pattern],shots,origins,interval:9-phase*.5,windup:bossWindupSeconds[phase]};
}
