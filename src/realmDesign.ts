export const realmDesigns = [
  { scene: '雨夜荒城', mechanism: '行跡輪與雙閘城道', result: '行動紀錄復原、足跡亮起；完成第3、6處機關，分別打開兩道閘門。', danger: '兩名巡夜影衛從城門追入街巷。', floor: '#486573', fog: '#172b3b', accent: '#8ad5dd', ambient: .72, sky: '#8496b1', light: 2.6 },
  { scene: '碎鏡迴廊', mechanism: '照影鏡與三重閘門', result: '照影鏡復原；完成第2、4、6處機關，依序打開三道幻鏡閘門。', danger: '三名鏡面仕女從入口追入鏡廊。', floor: '#514f70', fog: '#25233e', accent: '#bdabff', ambient: .72, sky: '#9eacd0', light: 2.6 },
  { scene: '赤燭審判殿', mechanism: '證詞天秤與四重判門', result: '天秤歸正、法印點亮；完成第2、3、5、6處機關，依序開啟四道判門。', danger: '四名喪屍判官由殿門追入審判庭。', floor: '#674f55', fog: '#362630', accent: '#ecc17c', ambient: .72, sky: '#b7a0a7', light: 2.6 },
  { scene: '深淵懸浮寶庫', mechanism: '虛實寶匣與凝光石橋', result: '完成第1、2、4、5、6處機關，開啟五道閘門並凝成石橋。', danger: '五名虛藏守將從入口追入寶庫。', floor: '#386665', fog: '#163e45', accent: '#8cebc9', ambient: .72, sky: '#83b6bd', light: 2.6 },
];

export const barrierZ = [3, -2, -8, -13, -18, -23];
export const maxGuardCount=5;
export const monsterCounts=[2,3,4,5];
export function monsterCountForRealm(realm:number){return realm===4?1:monsterCounts[realm]??2}
export const realmSpeedFactors = [1, 1.22, 1.48, 1.75];
export const gateSteps=[[3,6],[2,4,6],[2,3,5,6],[1,2,4,5,6]];
export function gatesForRealm(realm:number){return (gateSteps[realm]??[]).map(unlockStep=>({unlockStep,z:barrierZ[unlockStep-1]}))}
export function guardDetectionRange(realm:number,index=0){return index===0?13+realm*.6:9+realm*1.3}
export function guardSpeed(realm:number,difficulty:'一般'|'刺激'|'極限',mistakes=0,rushing=false,index=0){
  const base={一般:.85,刺激:1.35,極限:1.9}[difficulty];
  return Math.min(4.15,base*(realmSpeedFactors[realm]??1)+Math.min(mistakes*.1,.6)+(rushing?.75:0)+(index===0?0:-.12+index*.035));
}

/** The four realms share question order, while their physical locks differ. */
export function movementLimit(realm: number, step: number): number | null {
  if (step >= 6 || realm === 4) return null;
  const next=gatesForRealm(realm).find(g=>step<g.unlockStep);
  return next?next.z+.65:null;
}

export function guardSpawns(realm:number,_playerZ=11):[number,number][]{const lanes=[-1.4,1.4,0,-2.6,2.6];return Array.from({length:monsterCountForRealm(realm)},(_,i)=>[lanes[i],18+i*1.1])}
export function guardNavigationTarget(realm:number,step:number,index:number,guard:{x:number;z:number},player:{x:number;z:number}):[number,number]{
 const lane=[-.7,.7,0,-1.1,1.1][index]??0,gates=gatesForRealm(realm),closed=gates.find(g=>step<g.unlockStep);
 if(closed&&(guard.z-closed.z)*(player.z-closed.z)<0)return [lane,closed.z+(guard.z>closed.z?1.25:-1.25)];
 const crossing=gates.filter(g=>step>=g.unlockStep&&(guard.z-g.z)*(player.z-g.z)<0).sort((a,b)=>Math.abs(a.z-guard.z)-Math.abs(b.z-guard.z))[0];
 if(crossing)return [lane,crossing.z+(player.z>guard.z?1.25:-1.25)];
 return guard.z-player.z>4?[lane,player.z+2]:[player.x,player.z];
}
