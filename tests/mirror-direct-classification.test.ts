import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {campaignQuestion} from '../src/campaign';
import {answerChoices} from '../src/questions';
import {useGame} from '../src/store';
test('真假鏡證直接考無法無天全句句型，不再選另一份證詞',()=>{
 const q=campaignQuestion(1,4);assert.equal(q.id,'teacher-attribute-lawless');assert.equal(q.sentence,'那群歹徒的行為簡直無法無天。');assert.equal(q.kind,'辨識');assert.equal(q.category,'表態句');assert.deepEqual(q.options,answerChoices);assert.equal(q.answer,3);assert.equal(q.options[q.answer],'表態句');assert.ok(!q.stem.includes('證詞'));assert.ok(q.explanation.includes('主要表語'));assert.ok(q.commonError.includes('無法無天'));
});
test('相同ID的舊待答紀錄採新選項D，答錯再答仍保留原補救分數',()=>{
 const previous=useGame.getState();try{
 useGame.setState({realm:1,step:4,phase:'play',question:null,feedback:null,grades:{'realm1:4':{questionId:'teacher-attribute-lawless',wrong:true,credit:null}}});const g=useGame.getState();g.open();assert.equal(useGame.getState().question!.answer,3);
 g.answer(0);assert.equal(useGame.getState().feedback,false);g.next();assert.equal(useGame.getState().step,4);
 g.answer(3);assert.equal(useGame.getState().feedback,true);g.next();assert.equal(useGame.getState().step,5);assert.equal(useGame.getState().grades['realm1:4'].credit,.5);
 }finally{useGame.setState(previous)}
});
