import {supplyCosts} from './itemPrices';

export const pointsPerQuestion=2.5;
export const scoredQuestionCount=40;
export function formatScore(value:number){return value.toFixed(2).replace(/\.?0+$/,'')}
export const journeySections=[
  {id:'realm0',name:'行跡迷城',count:6,points:15},
  {id:'gems',name:'靈印寶石陣',count:7,points:0},
  {id:'realm1',name:'幻象迷宮',count:6,points:15},
  {id:'realm2',name:'真假審判',count:6,points:15},
  {id:'blast',name:'句型石轟擊',count:7,points:0},
  {id:'realm3',name:'虛實禁域',count:6,points:15},
  {id:'realm4',name:'無言君決戰',count:16,points:40},
] as const;
export type SectionId=typeof journeySections[number]['id'];
export const assessmentSections=journeySections.filter(s=>s.points>0);
export type GradeSlot={questionId:string;wrong:boolean;credit:null|.5|1};
export type GradeBook=Record<string,GradeSlot>;
export const slotKey=(section:SectionId,index:number)=>`${section}:${index}`;
export function sectionGrade(book:GradeBook,id:SectionId){
  const section=journeySections.find(s=>s.id===id)!;
  let completed=0,credit=0;
  for(let i=0;i<section.count;i++){const slot=book[slotKey(id,i)];if(slot?.credit!=null){completed++;credit+=slot.credit}}
  return {...section,completed,earned:section.points>0?credit*pointsPerQuestion:0};
}
export function gradeSummary(book:GradeBook){
  const sections=assessmentSections.map(s=>sectionGrade(book,s.id));
  return {sections,completed:sections.reduce((n,s)=>n+s.completed,0),score:sections.reduce((n,s)=>n+s.earned,0)};
}
export function markAnswer(book:GradeBook,section:SectionId,index:number,questionId:string,correct:boolean){
  const definition=journeySections.find(s=>s.id===section);
  if(!definition||!Number.isInteger(index)||index<0||index>=definition.count)return {book,fresh:false};
  const key=slotKey(section,index),old=book[key];
  if(old?.credit!=null||old&&old.questionId!==questionId)return {book,fresh:false};
  const slot:GradeSlot={questionId,wrong:Boolean(old?.wrong||!correct),credit:correct?(old?.wrong ? .5 : 1):null};
  return {book:{...book,[key]:slot},fresh:correct};
}
export type ItemId='step'|'shadow'|'time'|'strike'|'aegis'|'heal';
export const itemInfo:Record<ItemId,{name:string;symbol:string;unit:string;image:string;effect:string;description:string}>={
  step:{name:'疾風靴',symbol:'步',unit:'雙',image:'/items/step.svg',effect:'重置閃避',description:`立即重置靈步閃避的冷卻；閃避已就緒時不消耗。補給站可用${supplyCosts.step}點兌換。`},
  shadow:{name:'縛魔索',symbol:'影',unit:'條',image:'/items/shadow.svg',effect:'半速3秒',description:`使守衛移速或魔王飛行咒彈速度降至50%（原本的一半），持續3秒。研讀與暫停時停止計時。補給站可用${supplyCosts.shadow}點兌換。`},
  time:{name:'逆時珠',symbol:'時',unit:'個',image:'/items/time.svg',effect:'+10秒',description:`探索倒數增加10秒；同一禁域每份成績卷限用一次。關閉倒數時不消耗。補給站可用${supplyCosts.time}點兌換。`},
  strike:{name:'誅邪彈',symbol:'彈',unit:'顆',image:'/items/strike.svg',effect:'傷害20＋擊退',description:`引爆六步範圍的靈光，對附近守衛造成20點傷害、擊退並定身3秒；生命歸零則擊倒；無法穿過未開閘門。魔王戰改為消除六步內的飛行咒彈，不直接削減魔王生命值。未命中不消耗。開卷獲得1顆，兩站皆可用${supplyCosts.strike}點兌換，持有數量不限，每次命中消耗1顆。`},
  aegis:{name:'金鐘罩',symbol:'護',unit:'個',image:'/items/aegis.svg',effect:'無傷8秒',description:`全身籠罩金光，8秒內怪物碰觸、咒彈及陷阱均不扣生命。研讀、解析與暫停時停止效果計時，生效期間不能疊用。開卷獲得1個，兩站皆可用${supplyCosts.aegis}點兌換，持有數量不限。`},
  heal:{name:'延命丹',symbol:'丹',unit:'顆',image:'/items/heal.svg',effect:'生命＋20',description:`立即恢復20點生命，最高100點；生命已滿時不消耗。只能在探索與魔王戰存活時使用，不能在失敗後復活。開卷獲得1顆，兩站皆可用${supplyCosts.heal}點兌換，持有數量不限。`},
};
export const itemOrder:ItemId[]=['step','shadow','time','strike','aegis','heal'];
export const freshItems=():Record<ItemId,number>=>({step:0,shadow:0,time:0,strike:1,aegis:1,heal:1});
export function normalizeItems(raw:unknown):Record<ItemId,number>{const result=freshItems();if(!raw||typeof raw!=='object')return result;for(const id of itemOrder){const n=(raw as Partial<Record<ItemId,number>>)[id];if(n!==undefined)result[id]=Number.isFinite(n)?Math.max(0,Math.floor(n)):0}return result}
