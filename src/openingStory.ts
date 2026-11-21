export const openingShots=[
 {id:'land',title:'語法大地',caption:'動作、狀態、身分與存在，各有秩序。四枚句型靈印，守護著這片大地的生機。',duration:5},
 {id:'invasion',title:'無言君，率眾而來',caption:'大魔王無言君率領巡夜影衛、鏡面仕女、喪屍判官與虛藏守將，佔領語法大地，奪走四枚靈印。',duration:8},
 {id:'chase',title:'躲過四大關主的追擊',caption:'四大關主全數追來！辨句使者，穿越四大禁域，避開追擊、及時閃避，守住你的生命。',duration:6},
 {id:'grammar',title:'用判斷，解開封印',caption:'辨清敘事句、表態句、判斷句與有無句，回答石碑的問題，讓正確的語法判斷改變世界。',duration:7},
 {id:'items',title:'善用六種道具',caption:'疾風靴助你閃避，縛魔索減緩追擊；逆時珠、誅邪彈、金鐘罩與延命丹，將助你闖過險境。',duration:7},
 {id:'renewal',title:'讓大地，重拾生機',caption:'收回四枚靈印，挑戰無言君。讓四句歸序，讓語法大地再次綻放。你的冒險，現在開始。',duration:7},
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
