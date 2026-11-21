import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from '../src/store';
import {createQuestionDeck,isQuestionDeck} from '../src/questionDeck';
import {freshItems,gradeSummary,type GradeBook} from '../src/grading';
import {freshSupplyBanks} from '../src/supply';
import {freshGuardHealth} from '../src/guardHealth';
import {journeyOrder} from '../src/journey';
import {stages} from '../src/stageProgress';
import {teacherQuestions} from '../src/teacherQuestions';

function previousStudent(){
 const deck=createQuestionDeck(),grades:GradeBook=Object.fromEntries(Object.entries(deck.questions).map(([key,q])=>[key,{questionId:q.id,wrong:false,credit:1}]));
 useGame.setState({phase:'menu',questionDeck:deck,grades,journeyCleared:[...journeyOrder],passedStages:[...stages.map(s=>s.id),'boss'],unlocked:4,realm:4,step:16,seals:[0,1,2,3],hp:30,seconds:43,combo:8,mistakes:3,bossHP:0,retaliation:true,question:deck.questions['realm4:15'],feedback:true,selected:0,guardHP:[0],items:{step:20,shadow:20,time:20,strike:20,aegis:20,heal:20},rewardCount:40,rewardNotice:'上一位獎勵',slowSeconds:2,aegisSeconds:5,timeUsed:[0,1,2,3,4],attackPending:true,attackRequest:9,attackResult:{id:3,hits:4,defeated:2},hitEvent:{id:2,text:'生命值-10',kind:'grab'},dodgeReady:false,save:{version:4,realm:4,step:15,seals:[0,1,2,3],hp:30,seconds:43,mistakes:3,combo:8,cleared:false},records:[{id:'previous-student',sentence:'上一位的作答',category:'敘事句',correct:false,explanation:'紀錄',time:'2026-11-21T00:00:00Z'}],review:[{...teacherQuestions[0],id:'retained-teacher-question',reviewStatus:'教師已核准'}],hero:'suying',supplyBanks:{gems:{earned:100,spent:60,claims:['previous'],attempt:{finished:true}},blast:{earned:100,spent:50,claims:['previous'],attempt:{finished:true}}}});
 useGame.getState().configure({audio:false,quality:'低',difficulty:'刺激',volume:.4});
}

test('換學生重新計分完整清除學生資料，保留教師題庫、設定與角色選擇，重載仍有效',async()=>{
 const original=useGame.getState();try{
  previousStudent();const before=useGame.getState();assert.equal(gradeSummary(before.grades).score,100);
  before.resetForNextStudent();const after=useGame.getState();
  assert.deepEqual(after.grades,{});assert.deepEqual(after.records,[]);assert.equal(after.questionDeck,null);assert.equal(after.save,null);assert.deepEqual(after.supplyBanks,freshSupplyBanks());assert.deepEqual(after.items,freshItems());
  for(const key of ['journeyCleared','passedStages','seals','timeUsed'] as const)assert.deepEqual(after[key],[]);
  for(const key of ['unlocked','realm','step','combo','mistakes','rewardCount','slowSeconds','aegisSeconds'] as const)assert.equal(after[key],0);
  assert.equal(after.hp,100);assert.equal(after.seconds,200);assert.equal(after.bossHP,160);assert.deepEqual(after.guardHP,freshGuardHealth(0));assert.equal(after.phase,'menu');assert.equal(after.rewardNotice,'');assert.equal(after.retaliation,false);assert.equal(after.attackPending,false);assert.equal(after.dodgeReady,true);
  assert.equal(after.attackResult.hits,0);assert.equal(after.hitEvent.text,'');for(const key of ['question','feedback','selected'] as const)assert.equal(after[key],null);
  assert.ok(after.attackRequest>before.attackRequest);assert.ok(after.dodgeReset>before.dodgeReset);assert.deepEqual(after.review,before.review);assert.deepEqual(after.settings,before.settings);assert.equal(after.hero,'suying');
  await useGame.persist.rehydrate();const loaded=useGame.getState();assert.deepEqual(loaded.grades,{});assert.deepEqual(loaded.records,[]);assert.deepEqual(loaded.passedStages,[]);assert.deepEqual(loaded.supplyBanks,freshSupplyBanks());assert.equal(loaded.unlocked,0);assert.equal(loaded.save,null);assert.equal(loaded.questionDeck,null);assert.deepEqual(loaded.review,before.review);assert.deepEqual(loaded.settings,before.settings);
 }finally{useGame.setState(original)}
});

test('下一位學生從第一關重新抽卷及計分，第一題首答2.5分、不沿用上一位補給次數',()=>{
 const original=useGame.getState();try{
  previousStudent();const g=useGame.getState();g.resetForNextStudent();g.start();assert.equal(useGame.getState().realm,0);assert.equal(useGame.getState().step,0);assert.equal(useGame.getState().hp,100);assert.equal(useGame.getState().seconds,200);assert.ok(isQuestionDeck(useGame.getState().questionDeck));assert.equal(gradeSummary(useGame.getState().grades).score,0);
  g.open();const q=useGame.getState().question!;g.answer(q.answer);g.next();assert.equal(gradeSummary(useGame.getState().grades).score,2.5);assert.equal(gradeSummary(useGame.getState().grades).completed,1);assert.equal(useGame.getState().records.length,1);assert.equal(useGame.getState().records[0].id,q.id);assert.deepEqual(useGame.getState().supplyBanks,freshSupplyBanks());
 }finally{useGame.setState(original)}
});

test('入口重新計分僅限主選單，遊玩、暫停與教師畫面不能誤清資料',()=>{
 const original=useGame.getState();try{
  previousStudent();for(const phase of ['play','pause','teacher','gems','blast','realmClear','win','lose','notPassed'] as const){useGame.setState({phase});const before=useGame.getState();before.resetForNextStudent();assert.equal(useGame.getState(),before)}
 }finally{useGame.setState(original)}
});
