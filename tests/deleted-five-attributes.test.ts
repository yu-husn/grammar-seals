import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bank} from '../src/questions';
import {getPracticeQuestions} from '../src/questionPool';
import {deletedQuestionIds,isDeletedSentence} from '../src/comparedQuestions';
import {createQuestionDeck} from '../src/questionDeck';
import {useGame} from '../src/store';

test('五道表態題刪除，同句匯入不復活，舊主線及補給待答可保留補救半分換題',()=>{
 const ids=['original-1-3','original-1-12','original-1-25','original-1-0','original-1-1'],removed=bank.filter(q=>ids.includes(q.id)),pool=getPracticeQuestions();assert.equal(removed.length,5);assert.equal(pool.length,170);assert.equal(pool.filter(q=>q.category==='表態句').length,40);
 const previous=useGame.getState();try{for(const q of removed){
  assert.ok(deletedQuestionIds.includes(q.id));assert.ok(isDeletedSentence(q.sentence));assert.ok(!pool.some(p=>p.id===q.id));const copy={...q,id:'import-'+q.id,sentence:`「${q.sentence.replace('。','')}！」`,reviewStatus:'教師已核准' as const};assert.ok(!getPracticeQuestions([copy]).some(p=>p.id===copy.id));
  useGame.setState({phase:'menu'});useGame.getState().resetForNextStudent();const deck=createQuestionDeck();deck.questions['realm0:0']=q;useGame.setState({phase:'play',realm:0,step:0,questionDeck:deck,grades:{'realm0:0':{questionId:q.id,wrong:true,credit:null},'realm0:1':{questionId:deck.questions['realm0:1'].id,wrong:false,credit:1}}});const g=useGame.getState(),completed=g.grades['realm0:1'];g.open();const next=useGame.getState().question!;assert.ok(!isDeletedSentence(next.sentence));assert.equal(useGame.getState().grades['realm0:0'].wrong,true);g.answer(next.answer);g.next();assert.equal(useGame.getState().grades['realm0:0'].credit,.5);assert.deepEqual(useGame.getState().grades['realm0:1'],completed);
  for(const section of ['gems','blast'] as const){useGame.setState({phase:'menu'});g.resetForNextStudent();const key=`${section}:0`;useGame.setState({grades:{[key]:{questionId:q.id,wrong:true,credit:null}}});const next=g.ensureQuestions().questions[key];g.assignBonus(section,0,next.id);assert.ok(!isDeletedSentence(next.sentence));g.markGrade(section,0,next.id,true);g.markGrade(section,0,next.id,true);assert.equal(useGame.getState().grades[key].credit,.5)}
 }}finally{useGame.setState(previous)}
});
