import {bank,type Question} from './questions';
import {comparedQuestions,isDeletedSentence,deletedQuestionIds} from './comparedQuestions';
import {lessonQuestions} from './lessonQuestions';
import {teacherQuestions} from './teacherQuestions';
import {subjectChallenges} from './subjectChallenges';
import {adaptedBank} from './adaptedQuestions';
export function getPracticeQuestions(review:Question[]=[]):Question[]{
const candidates=[...review.filter(q=>q.reviewStatus==='教師已核准'),...comparedQuestions.filter(q=>q.reviewStatus!=='待教師審核'),...lessonQuestions,...teacherQuestions,...subjectChallenges,...adaptedBank.filter(q=>q.reviewStatus!=='待教師審核'&&q.id!=='adapted-20100825095125-B'),...bank];
const seen=new Set<string>();return candidates.filter(q=>{if(deletedQuestionIds.includes(q.id)||isDeletedSentence(q.sentence))return false;const key=q.kind==='解剖'?q.id:(q.sentence.match(/「([^」]+)」/)?.[1]??q.sentence).replace(/[\p{P}\p{Z}\s]/gu,'');if(seen.has(key))return false;seen.add(key);return true});
}
