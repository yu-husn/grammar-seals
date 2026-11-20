import {campaignQuestion,realmLength,realmNames} from './campaign';
import {bossQuestions,isBossQuestion,sentenceKey} from './bossQuestions';
import {getPracticeQuestions} from './questionPool';
import {questionDrawTier} from './questionPriority';
import {answerChoices,validateQuestion,type Question} from './questions';
import {isDeletedSentence,deletedQuestionIds} from './comparedQuestions';
import {journeySections,slotKey,type GradeBook,type SectionId} from './grading';

export type QuestionDeck={version:1;questions:Record<string,Question>};
export const questionSlots=journeySections.flatMap(s=>Array.from({length:s.count},(_,i)=>slotKey(s.id,i)));
const clone=(q:Question):Question=>({...q,options:[...q.options],components:q.components.map(c=>({...c}))});
const allowed=(q:Question)=>!deletedQuestionIds.includes(q.id)&&!isDeletedSentence(q.sentence)&&q.reviewStatus!=='待教師審核'&&validateQuestion(q).length===0;
export function isQuestionDeck(raw:unknown):raw is QuestionDeck{
 if(!raw||typeof raw!=='object')return false;const d=raw as QuestionDeck;
 return d.version===1&&!!d.questions&&questionSlots.every(key=>{const q=d.questions[key];return !!q&&allowed(q)&&(key.startsWith('realm4:')?isBossQuestion(q):!isBossQuestion(q))});
}
export function shuffleQuestions<T>(rows:T[],random:()=>number=Math.random):T[]{
 const copy=[...rows];for(let i=copy.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy;
}
type Input={review?:Question[];grades?:GradeBook;current?:{realm:number;step:number}|null;pending?:Record<string,string>;existing?:QuestionDeck|null};
/** A persisted, sentence-unique deck for one assessment, including both supply stops. */
export function createQuestionDeck(input:Input={},random:()=>number=Math.random):QuestionDeck{
 const pool=getPracticeQuestions(input.review).filter(allowed),questions:Record<string,Question>={},used=new Set<string>();
 const pin=(key:string,q:Question|undefined)=>{if(q&&allowed(q)&&(key.startsWith('realm4:')?isBossQuestion(q):!isBossQuestion(q))){questions[key]=clone(q);used.add(sentenceKey(q.sentence))}};
 const legacy=(key:string,id?:string)=>{
  const match=key.match(/^realm([0-4]):(\d+)$/);let q:Question|undefined;
  if(match&&Number(match[2])<realmLength(Number(match[1]))){const original=campaignQuestion(Number(match[1]),Number(match[2]));if(!id||original.id===id)q=original}
  return q??pool.find(q=>q.id===id);
 };
 // Already displayed/graded questions are historical facts, even if an older version repeated them.
 for(const key of questionSlots){const prior=input.existing?.questions[key],id=input.grades?.[key]?.questionId??input.pending?.[key];if(prior)pin(key,prior);else if(id)pin(key,legacy(key,id))}
 if(input.current){const {realm,step}=input.current;if(step<realmLength(realm)){const key=slotKey(`realm${realm}` as SectionId,step);if(!questions[key])pin(key,legacy(key))}}
 const pick=(eligible:Question[])=>{const fresh=eligible.filter(q=>!used.has(sentenceKey(q.sentence)));if(!fresh.length)throw Error('可用的不重複題目不足，請補充已確認題庫。');const tier=Math.min(...fresh.map(questionDrawTier)),rows=fresh.filter(q=>questionDrawTier(q)===tier),q=rows[Math.min(rows.length-1,Math.max(0,Math.floor(random()*rows.length)))];used.add(sentenceKey(q.sentence));return clone(q)};
 // Preserve the three battle phases, while randomizing the order within each phase.
 for(const [start,end] of [[0,4],[4,10],[10,16]]){const slots=Array.from({length:end-start},(_,i)=>`realm4:${start+i}`).filter(key=>!questions[key]),rows=shuffleQuestions(bossQuestions.slice(start,end).filter(q=>!used.has(sentenceKey(q.sentence))),random);for(const key of slots){const q=rows.shift();if(!q)throw Error('魔王題目不足');questions[key]={...clone(q),kind:q.kind==='解剖'?'解剖':'連擊',level:realmNames[4]};used.add(sentenceKey(q.sentence))}}
 const regular=pool.filter(q=>!isBossQuestion(q));
 const classify=(q:Question)=>q.kind!=='解剖'&&q.kind!=='證詞'&&q.options.length===4&&q.options.every(o=>answerChoices.includes(o as Question['category']));
 const plans=Array.from({length:4},(_,realm)=>Array.from({length:6},(_,step)=>({realm,step,key:`realm${realm}:${step}`,template:campaignQuestion(realm,step)}))).flat().filter(p=>!questions[p.key]);
 // Allocate constrained component questions first so later random draws cannot exhaust their pool.
 plans.sort((a,b)=>Number(b.template.kind==='解剖')-Number(a.template.kind==='解剖'));
 for(const p of plans){const t=p.template;let q:Question;
  if(t.kind==='解剖'){
   const originalRole=t.components.find(c=>c.text===t.options[t.answer])?.role??'主語',role=originalRole.includes('主語')?'主語':originalRole;
   q=pick(regular.filter(q=>q.category===t.category&&!q.sentence.includes('「')&&q.components.length>=2&&q.components.length<=6&&new Set(q.components.map(c=>c.text)).size===q.components.length&&q.components.filter(c=>c.role===role).length===1));
   q={...q,kind:'解剖',stem:`點選句中的${role==='主語'?'完整主語':role}，解除機關。`,options:q.components.map(c=>c.text),answer:q.components.findIndex(c=>c.role===role)};
   q.explanation=`本題的${role}是「${q.options[q.answer]}」。${q.explanation}`;
  }else{q=pick(regular.filter(q=>q.category===t.category&&classify(q)));q={...q,kind:t.kind,stem:q.sentence.includes('「')?'只判斷引號內的部分，依主要述謂關係選出句型。':t.kind==='陷阱'?'不要只看「有、無、是、非」等字，請依主要述謂關係判斷句型。':'依主要述謂關係判斷句型。'}}
  questions[p.key]={...q,level:realmNames[p.realm]};
 }
 for(let realm=0;realm<4;realm++){const slots=plans.filter(p=>p.realm===realm).map(p=>p.key),rows=shuffleQuestions(slots.map(key=>questions[key]),random);slots.forEach((key,i)=>questions[key]=rows[i])}
 for(const section of ['gems','blast'] as const)for(let i=0;i<7;i++){const key=slotKey(section,i);if(!questions[key])questions[key]=pick(regular.filter(classify))}
 return {version:1,questions};
}
