import type {Question} from './questions';
import {lessonQuestions} from './lessonQuestions';
import {teacherQuestions} from './teacherQuestions';
import {subjectChallenges} from './subjectChallenges';
import {bossQuestions} from './bossQuestions';
import {bossTargetStone} from './bossArena';
import {bossQuestionCount,bossPhase} from './bossRules';
export {bossPhase} from './bossRules';
export const realmNames=['行跡迷城','幻象迷宮','真假審判','虛實禁域','四句審判殿'];
export const sealNames=['敘事靈印','表態靈印','判斷靈印','有無靈印'];
export const bossPhaseNames=['四句混沌','字面陷阱','文脈終審'];
export const realmInfo=[
{chapter:'壹',title:'行跡迷城',theme:'敘事之境',guardian:'巡夜影衛',color:'#75d9d2',fog:'#101f27',intro:'巡夜影衛抹去了城中行跡。找出動作的主人，讓無聲的街巷重現足跡。',clear:'行跡復原，敘事靈印回應了你的召喚。先前往靈印寶石陣兌換補給，再進入鏡宮。',exit:'北城出口',stations:['行跡碑','動詞輪','否定鏡','行動紀錄臺','靈印壇','尋主石碑']},
{chapter:'貳',title:'幻象迷宮',theme:'表態之境',guardian:'鏡面仕女',color:'#b2a0f1',fog:'#1a182b',intro:'鏡面仕女把動作偽裝成狀態。辨明真正的表語，讓幻牆退去，尋找鏡宮唯一的出口。',clear:'六面虛鏡碎成微光，表態靈印重現。真正的身分，將在審判庭中揭曉。',exit:'真鏡之門',stations:['寒霜鏡','表語鏡輪','常開幻鏡','倒影主語','真假鏡證','明鏡出口']},
{chapter:'參',title:'真假審判',theme:'判斷之境',guardian:'喪屍判官',color:'#edc478',fog:'#231d22',intro:'喪屍判官以一字之差定人生死。判別身分、斷語與文言判斷，讓失衡的天秤重新歸正。',clear:'假判官的面具落下，判斷靈印落入掌心。先經句型石轟擊兌換補給，再前往藏著最後靈印的寶庫。',exit:'正名之門',stations:['身分天秤','繫詞法印','隱逸古碑','公共法碑','判官證詞','斷語玉衡']},
{chapter:'肆',title:'虛實禁域',theme:'有無之境',guardian:'虛藏守將',color:'#90d9bd',fog:'#132726',intro:'虛藏守將令寶物時隱時現。只有辨清存在、領有與否定動作，才能讓真正的道路留下。',clear:'虛影退散，最後一枚有無靈印歸位。四印與兩站補給齊備，前往四句審判殿挑戰無言君。',exit:'實相之門',stations:['存在寶匣','領有印臺','否定虛橋','搬運貨陣','無人藏室','此地銀印']},
{chapter:'終',title:'四句審判殿',theme:'無言君決戰',guardian:'無言君',color:'#e3919f',fog:'#1a1526',intro:'無言君封住了四枚靈印。沿發光標記走近中央與周邊石碑，以十六次辨句削減無言君生命值；避開蓄力的咒波，完成最後的封印。',clear:'四道靈印相互應和，無言君的王座化為流光。語言的秩序終於重返世間。',exit:'四印終封',stations:['四句混沌','字面陷阱','文脈終審']}
];
export const stationPositions:[number,number][]=[[-3,6],[3,1],[-3,-5],[3,-11],[-3,-16],[3,-20]];
export const bossPosition:[number,number]=[0,-3];
export function realmLength(realm:number){return realm===4?bossQuestionCount:6}
export function currentTarget(realm:number,step:number):[number,number]{if(realm===4){const stone=bossTargetStone(step);return [stone.x,stone.z]}return step<6?stationPositions[step]:[0,-26]}
export const interactionRadius=2.5;
export function isNearTarget(realm:number,step:number,x:number,z:number){const target=currentTarget(realm,step);return Math.hypot(x-target[0],z-target[1])<interactionRadius}
export function targetName(realm:number,step:number){return step>=realmLength(realm)?realmInfo[realm].exit:realm===4?`第${step+1}題 · ${bossTargetStone(step).name}`:realmInfo[realm].stations[step]}
function anatomy(q:Question,role:string):Question{const answer=q.components.findIndex(c=>c.role===role);if(answer<0)throw Error(q.id+' 缺少 '+role);return {...q,kind:'解剖',stem:`點選句中的${role}，解除機關。`,options:q.components.map(c=>c.text),answer}}
function teacher(id:string):Question{const q=teacherQuestions.find(q=>q.id===id);if(!q)throw Error('教師指定題不存在：'+id);return q}
const town=[teacher('teacher-narrative-exam-reading'),anatomy(teacher('teacher-narrative-mother-care'),'述語'),{...teacher('teacher-judgement-unrelated'),kind:'陷阱' as const,stem:'句中有「非」，請依主要述謂關係判斷句型。'},teacher('teacher-attribute-downpour'),teacher('teacher-existence-heaven-earth'),subjectChallenges.find(q=>q.id==='subject-full-01')!];
export function missionQuestion(step:number):Question{if(!town[step])throw Error('第一域題號超出範圍');return {...town[step],options:[...town[step].options],components:town[step].components.map(c=>({...c}))}}
const mirror=[teacher('teacher-narrative-moonlight'),anatomy(teacher('teacher-attribute-silent-boss'),'表語'),teacher('teacher-existence-night-moon'),{...lessonQuestions[4],kind:'解剖' as const,stem:'倒影顛倒了語序，請找出完整主語。',options:['靜極了','這朝來水溶溶的大道','大道','水溶溶'],answer:1},teacher('teacher-attribute-lawless'),teacher('teacher-judgement-lotus')];
const court=[teacher('teacher-judgement-shizhi'),anatomy(teacher('teacher-judgement-yuxun'),'繫詞'),{...teacher('teacher-narrative-tingwei-fine'),kind:'陷阱' as const},teacher('teacher-existence-state-advisers'),teacher('teacher-attribute-wang-lantian'),anatomy(teacher('teacher-judgement-courage'),'斷語')];
const vault=[teacher('teacher-existence-mountain-years'),teacher('teacher-attribute-liang-cautious'),{...teacher('teacher-narrative-orderly'),stem:'句中有「有」，一定是有無句嗎？依主要述語判斷。'},teacherQuestions[0],anatomy(teacher('teacher-existence-heaven-eyes'),'述語'),teacher('teacher-judgement-tingwei-standard')];
const boss=bossQuestions;
export function campaignQuestion(realm:number,step:number):Question{if(realm<0||realm>4||step<0||step>=realmLength(realm))throw Error('關卡題號超出範圍');const base=realm===0?missionQuestion(step):[mirror,court,vault,boss][realm-1][step];const q={...base,components:base.components.map(c=>({...c})),options:[...base.options],level:realmNames[realm],sourceNote:[base.sourceNote,'關卡互動引用已確認題庫；原始題庫與教師修正保留。'].filter(Boolean).join(' ')};if(realm===4&&q.kind!=='解剖')q.kind='連擊';if(realm===1&&step===2||realm===3&&[2,3].includes(step))q.kind='陷阱';return q}
