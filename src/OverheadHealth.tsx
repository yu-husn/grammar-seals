import type {RefObject} from 'react';
import {useGame} from './store';
import {heroes} from './heroes';
import {realmInfo} from './campaign';
import {monsterCountForRealm} from './realmDesign';
import {maxGuardHealth} from './guardHealth';
import {bossMaxHP} from './bossRules';
export type HealthRefs={hero:RefObject<HTMLDivElement|null>;guards:RefObject<(HTMLDivElement|null)[]>};
function HealthBar({name,value,max,boss=false}:{name:string;value:number;max:number;boss?:boolean}){return <><i className="overhead-health-tether" aria-hidden="true"/><div className="overhead-health-label"><b>{name}{boss?' · 盾':''}</b><span>{value}/{max}</span></div><div className="overhead-health-track" role="progressbar" aria-label={`${name}${boss?'封印護盾':'生命值'}`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}><i style={{width:`${max?value/max*100:0}%`}}/></div></>}
export default function OverheadHealth({refs}:{refs:HealthRefs}){
 const realm=useGame(s=>s.realm),hp=useGame(s=>s.hp),health=useGame(s=>s.guardHP),bossHP=useGame(s=>s.bossHP),hero=useGame(s=>s.hero);
 return <div className="overhead-health-layer" aria-label="角色頭上生命條"><div ref={refs.hero} className="overhead-health hero-health" data-health-owner="hero" style={{display:'none'}}><HealthBar name={heroes[hero].name} value={hp} max={100}/></div>{Array.from({length:monsterCountForRealm(realm)},(_,i)=><div key={`${realm}-${i}`} ref={node=>{refs.guards.current[i]=node}} className={`overhead-health ${realm===4?'boss-health':'guard-health'}`} data-health-owner={`guard-${i}`} data-guard-index={i} style={{display:'none'}}><HealthBar name={realmInfo[realm].guardian} value={realm===4?bossHP:health[i]??maxGuardHealth(realm)} max={realm===4?bossMaxHP:maxGuardHealth(realm)} boss={realm===4}/></div>)}</div>;
}
