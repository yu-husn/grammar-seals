import {getPracticeQuestions} from '../src/questionPool';
import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {campaignQuestion,realmLength} from '../src/campaign';
import {answerChoices,validateQuestion} from '../src/questions';
import {isUserAddedQuestion} from '../src/questionPriority';
import {isBossQuestion,sentenceKey} from '../src/bossQuestions';
import {useGame} from '../src/store';
test('四域各六題與辨識題本身均涵蓋四大句型，四關排列不同且不重複主線句子',()=>{
 const sequences:string[]=[],sentences=new Set<string>();
 for(let realm=0;realm<4;realm++){
 const rows=Array.from({length:realmLength(realm)},(_,i)=>campaignQuestion(realm,i)),classify=rows.filter(q=>q.kind!=='解剖');
 assert.equal(rows.length,6);assert.deepEqual([...new Set(rows.map(q=>q.category))].sort(),[...answerChoices].sort());assert.deepEqual([...new Set(classify.map(q=>q.category))].sort(),[...answerChoices].sort());
 for(const q of rows){assert.deepEqual(validateQuestion(q),[]);assert.equal(isBossQuestion(q),false);assert.equal(sentences.has(sentenceKey(q.sentence)),false);sentences.add(sentenceKey(q.sentence))}
 for(const q of classify){assert.deepEqual(q.options,answerChoices);assert.equal(q.options[q.answer],q.category);assert.ok(isUserAddedQuestion(q))}
 sequences.push(classify.map(q=>q.category).join('／'));
 }assert.equal(new Set(sequences).size,4);
});
test('隨機題卷保留合法舊待答題、錯答旗標及已完成得分',()=>{
 const previous=useGame.getState();try{
 for(const [realm,step,oldId] of [[0,2,'teacher-narrative-reluctant'],[0,3,'teacher-compared-47'],[1,0,'teacher-attribute-downpour'],[1,2,'teacher-compared-13'],[1,5,'teacher-lesson-12'],[2,0,'teacher-compared-2'],[2,2,'teacher-lesson-09'],[2,3,'teacher-lesson-13'],[2,4,'teacher-lesson-17'],[3,1,'teacher-existence-compassion'],[3,5,'teacher-existence-affection']] as const){
 const key=`realm${realm}:${step}`,completed='realm0:0';useGame.setState({questionDeck:null,save:null,realm,step,phase:'play',question:null,feedback:null,grades:{[key]:{questionId:oldId,wrong:true,credit:null},[completed]:{questionId:'teacher-narrative-exam-reading',wrong:false,credit:1}}});
 const g=useGame.getState();g.open();const q=useGame.getState().question!,old=getPracticeQuestions().find(q=>q.id===oldId);if(old&&!isBossQuestion(old))assert.equal(q.id,oldId);else assert.notEqual(q.id,oldId);assert.deepEqual(validateQuestion(q),[]);assert.equal(useGame.getState().grades[key].wrong,true);g.answer(useGame.getState().question!.answer);g.next();assert.equal(useGame.getState().grades[key].credit,.5);assert.equal(useGame.getState().grades[completed].credit,1);
 }
 }finally{useGame.setState(previous)}
});
