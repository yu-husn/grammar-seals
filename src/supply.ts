import {clampRemainingSeconds} from './timing';
import type {ItemId} from './grading';
export type SupplyId='gems'|'blast';
export type SupplySnapshot={seconds:number;answered:number;score:number;combo:number;board?:number[][];moves?:number;freeMoves?:number;questionId?:string|null;result?:boolean|null;picked?:number|null;wrong?:boolean;paused?:boolean;mode?:'click'|'type';stage?:'paused'|'fire'|'explain'|'done';correct?:boolean;target?:number|null;powers?:number;frozen?:number};
export type SupplyBank={earned:number;spent:number;claims:string[];attempt?:{finished:boolean;snapshot?:SupplySnapshot}};
export type SupplyBanks=Record<SupplyId,SupplyBank>;
export const supplyCosts:Record<ItemId,number>={step:30,shadow:40,time:30,strike:40,aegis:50,heal:30};
export const freshSupplyBanks=():SupplyBanks=>({gems:{earned:0,spent:0,claims:[]},blast:{earned:0,spent:0,claims:[]}});
export function normalizeSupplyBanks(raw:unknown):SupplyBanks{
 const banks=freshSupplyBanks();if(!raw||typeof raw!=='object')return banks;
 for(const id of ['gems','blast'] as const){const b=(raw as Partial<SupplyBanks>)[id];if(!b)continue;const earned=Math.min(100,Math.max(0,Math.floor(Number(b.earned)||0))),spent=Math.min(earned,Math.max(0,Math.floor(Number(b.spent)||0)));banks[id]={earned,spent,claims:Array.isArray(b.claims)?[...new Set(b.claims.filter(s=>typeof s==='string'))].slice(0,128):[]};if(b.attempt&&typeof b.attempt==='object')banks[id].attempt={finished:b.attempt.finished===true,snapshot:normalizeSupplySnapshot(b.attempt.snapshot)}}
 return banks;
}
export function normalizeSupplySnapshot(raw:unknown):SupplySnapshot|undefined{
 if(!raw||typeof raw!=='object')return;const s=raw as SupplySnapshot;
 if(![s.seconds,s.answered,s.score,s.combo].every(Number.isFinite))return;
 const number=(v:unknown,fallback=0,max=100000)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(0,Math.floor(v))):fallback;
 const choice=(v:unknown)=>Number.isInteger(v)&&Number(v)>=0&&Number(v)<4?Number(v):null;
 const snapshot:SupplySnapshot={seconds:clampRemainingSeconds(s.seconds),answered:number(s.answered,0,7),score:Math.max(-100000,Math.min(100000,s.score)),combo:number(s.combo),moves:number(s.moves,30,100),freeMoves:number(s.freeMoves,0,3),questionId:typeof s.questionId==='string'?s.questionId.slice(0,150):null,result:typeof s.result==='boolean'?s.result:null,picked:choice(s.picked),wrong:s.wrong===true,paused:s.paused===true,mode:s.mode==='type'?'type':'click',stage:s.stage==='paused'||s.stage==='explain'||s.stage==='done'?s.stage:'fire',correct:s.correct===true,target:choice(s.target),powers:number(s.powers),frozen:number(s.frozen,0,5)};
 if(Array.isArray(s.board)&&s.board.length===6&&s.board.every(row=>Array.isArray(row)&&row.length===6&&row.every(n=>Number.isInteger(n)&&n>=0&&n<=5)))snapshot.board=s.board.map(row=>[...row]);
 return snapshot;
}
export function creditSupply(bank:SupplyBank,key:string,points:number):SupplyBank{
 if(bank.claims.includes(key)||!Number.isFinite(points)||points<=0)return bank;
 return {...bank,earned:Math.min(100,bank.earned+Math.floor(points)),claims:[...bank.claims,key]};
}
