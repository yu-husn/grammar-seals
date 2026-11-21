import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getPracticeQuestions} from '../src/questionPool';
import {deletedQuestionIds,isDeletedSentence} from '../src/comparedQuestions';
import {useGame} from '../src/store';
import {campaignQuestion,realmLength} from '../src/campaign';
import {getQuestionCounts} from '../src/questionStats';
const deleted=[['original-0-2','學生走進教室'],['original-0-6','船夫划動船槳'],['original-0-7','老師批改作業'],['original-0-10','信差送來書信'],['original-0-13','獵人追蹤腳印'],['original-0-16','母親烹煮晚餐'],['original-0-20','小貓追逐蝴蝶'],['original-0-21','漁夫撒下漁網'],['original-0-22','園丁修剪樹枝'],['original-0-23','少年攀登山峰'],['original-0-25','詩人吟誦詩篇'],['original-0-28','客人放下行李']];
test('指定12題以ID及句子排除，已核准匯入及標點變體均不能復活',()=>{
 const pool=getPracticeQuestions();for(const [id,sentence] of deleted){assert.ok(deletedQuestionIds.includes(id));assert.ok(isDeletedSentence(sentence+'。'));assert.ok(!pool.some(q=>q.id===id||q.sentence===sentence+'。'));
 const imported={...pool[0],id:'import-'+id,sentence:'「'+sentence+'！」',reviewStatus:'教師已核准' as const};assert.ok(!getPracticeQuestions([imported]).some(q=>q.id===imported.id))}
 const counts=getQuestionCounts();assert.equal(counts.total,213);assert.equal(counts.userAdded,58);assert.equal(counts.rows.find(r=>r.category==='敘事句')!.total,64);
});
test('被刪除的舊補給待答槽換題保留補救旗標，固定40題仍合法',()=>{
 const originalGrades=useGame.getState().grades;
 try{for(const [id] of deleted)for(const section of ['gems','blast'] as const){useGame.setState({grades:{[`${section}:0`]:{questionId:id,wrong:true,credit:null}}});const g=useGame.getState();assert.equal(g.assignBonus(section,0,'teacher-narrative-peony'),'teacher-narrative-peony');assert.equal(useGame.getState().grades[`${section}:0`].wrong,true);g.markGrade(section,0,'teacher-narrative-peony',true);assert.equal(useGame.getState().grades[`${section}:0`].credit,.5)}}finally{useGame.setState({grades:originalGrades})}
 const actual=Array.from({length:5},(_,r)=>Array.from({length:realmLength(r)},(_,i)=>campaignQuestion(r,i))).flat();assert.equal(actual.length,40);assert.ok(actual.every(q=>!isDeletedSentence(q.sentence)));
});
