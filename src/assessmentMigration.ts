import {bossQuestions} from './bossQuestions';
import type {GradeBook} from './grading';

export function migrateBossGrades(book:GradeBook):GradeBook{
 const migrated:GradeBook={};
 for(const [key,slot] of Object.entries(book)){
  if(!key.startsWith('realm4:')){migrated[key]=slot;continue}
  const index=bossQuestions.findIndex(q=>q.id===slot.questionId);
  if(index>=0)migrated[`realm4:${index}`]=slot;
  else if(slot.credit===null)migrated[key]=slot;
  else migrated[`legacy:${key}`]=slot;
 }
 return migrated;
}
