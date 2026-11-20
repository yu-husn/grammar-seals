import {monsterCountForRealm} from './realmDesign';
export const guardMaxHealth=[20,30,40,50] as const;
export const strikeDamage=20;
export function maxGuardHealth(realm:number){return guardMaxHealth[realm]??0}
export function freshGuardHealth(realm:number){return realm===4?[]:Array(monsterCountForRealm(realm)).fill(maxGuardHealth(realm)) as number[]}
export function normalizeGuardHealth(realm:number,raw:unknown){return freshGuardHealth(realm).map((max,i)=>{const value=Array.isArray(raw)?raw[i]:undefined;return typeof value==='number'&&Number.isFinite(value)?Math.max(0,Math.min(max,Math.floor(value))):max})}
export function liveGuardTargets(health:number[],raw:unknown):number[]{return Array.isArray(raw)?[...new Set(raw)].filter((i):i is number=>Number.isInteger(i)&&i>=0&&i<health.length&&health[i]>0):[]}
