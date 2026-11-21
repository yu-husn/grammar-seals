import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from '../src/store';
import {gradeSummary} from '../src/grading';
import {journeyOrder} from '../src/journey';
import {buildBossVolley,bossProjectileLifetime} from '../src/bossAttacks';
import {bossPlayerDamage,bossHitCooldown,bossAnswerHeal,bossAnswerRespite,bossRescueHP} from '../src/bossRules';

function beginBoss(){useGame.setState({phase:'menu'});useGame.getState().resetForNextStudent();useGame.setState({unlocked:4,journeyCleared:journeyOrder.filter(s=>s!=='realm4')});useGame.getState().start(false,4)}

test('教學彈幕速度、數量、頻率與預警留出移動時間，後段仍逐題增加',()=>{
 assert.equal(bossPlayerDamage,5);assert.equal(bossHitCooldown,4);assert.equal(bossAnswerRespite,4);
 let previous=0;for(let step=0;step<16;step++){const plan=buildBossVolley(step,0,{x:0,z:6});assert.ok(plan.shots.length>previous);assert.ok(plan.shots.length<=24);previous=plan.shots.length;assert.ok(plan.windup>=2.2);assert.ok(plan.interval>=8);for(const shot of plan.shots)assert.ok(Math.hypot(shot.vx,shot.vz)<=3.000001)}
 assert.equal(buildBossVolley(15,999,{x:0,z:0}).shots.length,24);assert.equal(bossProjectileLifetime,12);
});

test('魔王受擊扣5點，生命耗盡回復30並保留題目、成績、剩餘時間與續玩資料',async()=>{
 const previous=useGame.getState();try{
  beginBoss();useGame.setState({hp:5});const before=useGame.getState();before.hit('spell');const after=useGame.getState();assert.equal(after.hp,bossRescueHP);assert.equal(after.phase,'play');assert.equal(after.hitEvent.kind,'recovery');assert.equal(after.step,before.step);assert.deepEqual(after.grades,before.grades);assert.equal(after.seconds,before.seconds);assert.equal(after.save!.hp,30);after.hit('spell');assert.equal(useGame.getState().hp,25);assert.equal(useGame.getState().hitEvent.text,'生命值-5');
  useGame.getState().setPhase('menu');await useGame.persist.rehydrate();useGame.getState().start(true);assert.equal(useGame.getState().hp,25);assert.equal(useGame.getState().step,0);assert.equal(useGame.getState().bossHP,160);
 }finally{useGame.setState(previous)}
});

test('答對及補救確認後回血5、上限100，同一答題確認不能重複回血，分數不因回血增加',()=>{
 const previous=useGame.getState();try{
  beginBoss();const g=useGame.getState();useGame.setState({hp:60});g.open();let q=useGame.getState().question!;g.answer(q.answer);assert.equal(useGame.getState().hp,60);g.next();assert.equal(useGame.getState().hp,60+bossAnswerHeal);g.next();assert.equal(useGame.getState().hp,65);assert.equal(gradeSummary(useGame.getState().grades).score,2.5);
  useGame.setState({hp:98});g.open();q=useGame.getState().question!;g.answer((q.answer+1)%q.options.length);assert.equal(useGame.getState().retaliation,false);g.hit('spell');g.tick(20);assert.equal(useGame.getState().hp,98);assert.equal(useGame.getState().seconds,240);g.next();g.answer(q.answer);g.next();assert.equal(useGame.getState().hp,100);assert.equal(gradeSummary(useGame.getState().grades).score,3.75);assert.equal(useGame.getState().retaliation,false);
 }finally{useGame.setState(previous)}
});

test('即使反覆受傷，也可保留進度完成16題並封印魔王，成績只依作答計算',()=>{
 const previous=useGame.getState();try{
  beginBoss();const g=useGame.getState();for(let step=0;step<16;step++){for(let hit=0;hit<30;hit++)g.hit('spell');assert.equal(useGame.getState().phase,'play');assert.ok(useGame.getState().hp>0);assert.equal(useGame.getState().step,step);g.open();const q=useGame.getState().question!;if(step===0){g.answer((q.answer+1)%q.options.length);g.next()}g.answer(q.answer);g.next();assert.equal(useGame.getState().step,step+1)}
  assert.equal(useGame.getState().bossHP,0);assert.equal(gradeSummary(useGame.getState().grades).completed,16);assert.equal(gradeSummary(useGame.getState().grades).score,38.75);g.escape();assert.equal(useGame.getState().phase,'win');
 }finally{useGame.setState(previous)}
});
