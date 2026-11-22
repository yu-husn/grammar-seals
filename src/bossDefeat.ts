export const bossDefeatDuration=2.8;
export const reducedBossDefeatDuration=.9;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(n:number)=>n*n*(3-2*n);
export function bossDefeatPose(elapsed:number,reduced=false){
 const t=Number.isFinite(elapsed)?Math.max(0,elapsed):0;
 const fallTime=reduced?.3:1.1,hold=reduced?.1:.25,fadeTime=reduced?.5:1.2;
 const duration=reduced?reducedBossDefeatDuration:bossDefeatDuration;
 const fall=clamp(t/fallTime),fade=clamp((t-fallTime-hold)/fadeTime);
 const gone=t>=duration;
 return {stage:gone?'gone':t<fallTime?'falling':t<fallTime+hold?'fallen':'fading',angle:Math.PI*.48*fall*fall,lean:.08*fall,lift:.45*fall,opacity:gone?0:1-smooth(fade),particles:!reduced&&t>=fallTime+hold&&!gone,progress:clamp((t-fallTime-hold)/(duration-fallTime-hold)),gone} as const;
}
