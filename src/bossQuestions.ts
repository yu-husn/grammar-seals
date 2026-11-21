import type {Question} from './questions';
import {lessonQuestions} from './lessonQuestions';
import {teacherQuestions} from './teacherQuestions';
import {subjectChallenges} from './subjectChallenges';
import {getPracticeQuestions} from './questionPool';
export function sentenceKey(sentence:string){return (sentence.match(/「([^」]+)」/)?.[1]??sentence).replace(/[\p{P}\p{Z}\s]/gu,'')}
function component(q:Question,role:string):Question{const answer=q.components.findIndex(c=>c.role===role);if(answer<0)throw Error('魔王題成分缺漏 '+q.id+role);return {...q,kind:'解剖',stem:`找出句中的${role}，削減無言君生命值。`,options:q.components.map(c=>c.text),answer}}
const hardNarrative=getPracticeQuestions().find(q=>q.sentence==='人世間的是是非非極難分辨。')!;
/** These sentences belong exclusively to the boss encounter, including their anatomy variants. */
function teacher(id:string):Question{const q=teacherQuestions.find(q=>q.id===id);if(!q)throw Error('魔王指定題不存在：'+id);return q}
function practice(sentence:string):Question{const q=getPracticeQuestions().find(q=>q.sentence===sentence);if(!q)throw Error('歷屆指定句不存在：'+sentence);return q}
export const bossQuestions:Question[]=[
 teacher('teacher-narrative-quiet-help'),teacher('teacher-attribute-first-love'),teacher('teacher-judgement-simayi'),practice('他有一顆善良的心。'),
 teacher('teacher-trap-gossip'),teacher('teacher-narrative-must'),hardNarrative,teacher('teacher-narrative-crying'),teacher('teacher-narrative-finance-desire'),teacher('teacher-attribute-significant-impact'),
 subjectChallenges.find(q=>q.id==='subject-inverted-01')!,component(teacher('teacher-judgement-opportunity'),'斷語'),lessonQuestions[5],
 {...lessonQuestions[3],kind:'解剖',stem:'先還原「父母唯憂其疾」，再選出前置賓語。',options:['父母','唯','其疾','憂'],answer:2},
 component(teacher('teacher-attribute-unlimited-items'),'表語'),component(teacher('teacher-judgement-rumor'),'斷語'),
];
const sentences=new Set(bossQuestions.map(q=>sentenceKey(q.sentence))),ids=new Set([...bossQuestions.map(q=>q.id),...getPracticeQuestions().filter(q=>sentences.has(sentenceKey(q.sentence))).map(q=>q.id)]);
export function isBossQuestion(q:Question){return sentences.has(sentenceKey(q.sentence))}
export function isBossQuestionId(id:string,review:Question[]=[]){return ids.has(id)||review.some(q=>q.id===id&&isBossQuestion(q))}
