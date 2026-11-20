import {categories,type Question} from './questions';
import {getPracticeQuestions} from './questionPool';
import {isUserAddedQuestion} from './questionPriority';

export function getQuestionCounts(pool:Question[]=getPracticeQuestions()){
 const rows=categories.map(category=>({category,total:pool.filter(q=>q.category===category).length,userAdded:pool.filter(q=>q.category===category&&isUserAddedQuestion(q)).length}));
 return {rows,total:rows.reduce((n,r)=>n+r.total,0),userAdded:rows.reduce((n,r)=>n+r.userAdded,0)};
}
