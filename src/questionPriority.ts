import type {Question} from './questions';
import {teacherQuestions} from './teacherQuestions';

export type DrawGroup='teacher'|'exam'|'original';
export const drawOrder=['直接新增題','其他教師指定題','歷屆考題改編','其他原創題'] as const;
export const drawPolicyText='以教師直接新增題為第一優先，答案依教師最新指定分類；本次可用新增題答完後，才依序補其他教師指定題、歷屆改編題與原創題。先套用句型、題型及魔王專用題限制，優先避免同次重複；保留已記錄的待答題與成績。歷屆來源目前為基測，與會考分開標示。';
const sentenceKey=(s:string)=>(s.match(/「([^」]+)」/)?.[1]??s).replace(/[\p{P}\p{Z}\s]/gu,'');
export function uniqueQuestionSentences(pool:Question[]){const seen=new Set<string>();return pool.filter(q=>{const key=sentenceKey(q.sentence);if(seen.has(key))return false;seen.add(key);return true})}
const addedSentences=new Set(teacherQuestions.map(q=>sentenceKey(q.sentence)));
export function isUserAddedQuestion(q:Question){return addedSentences.has(sentenceKey(q.sentence))}
export function questionDrawTier(q:Question){return isUserAddedQuestion(q)?0:questionDrawGroup(q)==='teacher'?1:questionDrawGroup(q)==='exam'?2:3}

export function questionDrawGroup(q:Question):DrawGroup{
 if(q.sourceType==='真實考題'||q.sourceType==='歷屆選項改編'||q.examYear||q.id.startsWith('teacher-compared-'))return 'exam';
 if(q.sourceType==='教師審核題'||q.reviewStatus==='教師已核准')return 'teacher';
 return 'original';
}

/** Exhaust eligible, unseen user additions before falling back to the next source tier. */
export function pickPriorityQuestion(pool:Question[],excludeIds:Iterable<string>=[],random:()=>number=Math.random):Question{
 if(!pool.length)throw Error('沒有可用的已確認題目');
 const excluded=new Set(excludeIds),fresh=pool.filter(q=>!excluded.has(q.id)),eligible=fresh.length?fresh:pool;
 const tier=Math.min(...eligible.map(questionDrawTier)),rows=eligible.filter(q=>questionDrawTier(q)===tier);
 return rows[Math.min(rows.length-1,Math.max(0,Math.floor(random()*rows.length)))];
}
