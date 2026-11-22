export const openingShots=[
 {id:'land',title:'語法大地，寧靜祥和',caption:'曾經，敘事、表態、判斷、有無四枚句型靈印，守護語法大地。萬物各安其位，生生不息。',duration:5},
 {id:'invasion',title:'無言君，奪印而來',caption:'黑暗魔王「無言君」率領四大關主入侵，奪走四枚靈印。語句錯亂、封印失控，整片大地陷入混沌。',duration:8},
 {id:'chase',title:'辨句使者，踏入禁域',caption:'現在，你將化身辨句使者「{name}」，深入四大禁域，躲避追擊、擊退魔物，奪回失落的靈印。',duration:6},
 {id:'grammar',title:'用智慧，解開封印',caption:'辨清敘事、表態、判斷、有無，回答石碑的問題，破解句型謎團，讓錯亂的語句重新歸序。',duration:7},
 {id:'items',title:'蒐集補給，善用道具',caption:'冒險途中，你可以蒐集補給、累積獎勵、兌換道具，強化自己實力，闖過重重險境。',duration:7},
 {id:'renewal',title:'集結靈印，迎戰無言君',caption:'集齊四枚靈印，開啟魔王殿大門，破解最後封印，讓大地重拾生機！辨句使者{name}，語法大地的命運，就掌握在你手中！',duration:7},
] as const;
export const openingDuration=openingShots.reduce((n,s)=>n+s.duration,0);
export const openingStart=(index:number)=>openingShots.slice(0,index).reduce((n,s)=>n+s.duration,0);
export function openingFrame(seconds:number){const time=Math.min(openingDuration,Math.max(0,seconds));let start=0;for(let index=0;index<openingShots.length;index++){const shot=openingShots[index];if(time<start+shot.duration||index===openingShots.length-1)return {index,progress:Math.min(1,(time-start)/shot.duration)};start+=shot.duration}return {index:0,progress:0}}

/** Four staggered pursuers follow the hero down the street, away from the roofs. */
export function openingChasePositions(progress:number){
 const p=Math.max(0,Math.min(1,progress)),path=(n:number)=>Math.sin(n*Math.PI*2)*1.1;
 return {
  hero:{x:.4+path(p),y:0,z:3+p*6},
  guards:[-2.1,-.7,.7,2.1].map((lane,i)=>({x:lane+path(Math.max(0,p-.1-i*.025))*.35,y:0,z:3+p*6-3.5-i*.65})),
  cameraTravel:p*6,
 };
}

export function openingGrammarPosition(progress:number){
 const u=Math.max(0,Math.min(1,progress/.55)),ease=u*u*(3-2*u);
 return {x:-2.2+3.6*ease,y:0,z:2.4-1.4*ease,walking:u<1};
}
