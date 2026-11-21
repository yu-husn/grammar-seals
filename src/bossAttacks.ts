import {bossPhase,bossPhaseStep} from './bossRules';
export const projectileCapacity=96;
export const bossPatterns=['追蹤扇射','側翼交叉','環陣包圍','旋掃彈幕'];
type Point={x:number;z:number};
export type BossShot={x:number;z:number;vx:number;vz:number;curve:number};
export type BossVolley={pattern:number;label:string;shots:BossShot[];origins:Point[];interval:number;windup:number};
export function bossProjectileSpeed(step:number,volley=0){return 3.1+bossPhase(step)*.7+Math.min(volley*.025,.4)}
/** Seeded by volley number: repeatable for testing, varied across the battle. */
export function buildBossVolley(step:number,volley:number,target:Point):BossVolley{
  const phase=bossPhase(step),pattern=(volley+phase)%4;
  const count=Math.min(40,[8,16,28][phase]+bossPhaseStep(step)*2+Math.floor(volley/3)*2);
  const speed=bossProjectileSpeed(step,volley),turn=volley*2.39996323;
  const origins:Point[]=pattern===0?[{x:Math.sin(turn)*2.5,z:-10.5}]:pattern===1?[{x:-8.4,z:-7+Math.sin(turn)*3},{x:8.4,z:3+Math.cos(turn)*3}]:pattern===2?Array.from({length:8},(_,i)=>({x:Math.sin(turn+i*Math.PI/4)*9.1,z:-3+Math.cos(turn+i*Math.PI/4)*9.1})):[{x:-8.5,z:3},{x:8.5,z:-8},{x:Math.sin(turn)*4,z:10}];
  const shots=Array.from({length:count},(_,i)=>{
    const origin=origins[i%origins.length],base=Math.atan2(target.x-origin.x,target.z-origin.z);
    // The first shot from every emitter targets the telegraphed position exactly.
    const waveIndex=Math.floor(i/origins.length),waveCount=Math.ceil(count/origins.length);
    const spread=waveIndex===0?0:((waveIndex-1)/Math.max(1,waveCount-2)-.5)*(pattern===0?1.5:pattern===3?1.25:.7);
    const angle=base+spread;
    return {x:origin.x,z:origin.z,vx:Math.sin(angle)*speed,vz:Math.cos(angle)*speed,curve:pattern===3?(waveIndex%2?-.17:.17):0};
  });
  return {pattern,label:bossPatterns[pattern],shots,origins,interval:5.8-phase*1.1,windup:1.6-phase*.15};
}
