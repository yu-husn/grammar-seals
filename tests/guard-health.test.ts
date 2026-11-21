import './setup';
import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {useGame,migrateSave} from '../src/store';
import {freshGuardHealth,normalizeGuardHealth,maxGuardHealth,strikeDamage} from '../src/guardHealth';
import {layoutHealthLabels} from '../src/healthLabelLayout';
import {normalizeItems,freshItems,gradeSummary} from '../src/grading';
beforeEach(()=>{useGame.setState({phase:'menu'});useGame.getState().resetAssessment();useGame.setState({unlocked:0,realm:0});useGame.getState().configure({chase:true,countdown:true});useGame.getState().start()});
test('四域怪物生命20、30、40、50，數量依序1、2、3、4，誅邪彈傷害20',()=>{
 assert.equal(strikeDamage,20);for(let r=0;r<4;r++){assert.equal(maxGuardHealth(r),20+r*10);assert.deepEqual(freshGuardHealth(r),Array(r+1).fill(20+r*10))}assert.deepEqual(freshGuardHealth(4),[]);
});
test('誅邪彈每個目標只傷害一次，生命歸零不能再作為攻擊目標',()=>{
 const g=useGame.getState();useGame.setState({realm:2,guardHP:[30,10,0],items:{...freshItems(),strike:4}});g.useItem('strike');assert.equal(g.resolveAttack(useGame.getState().attackRequest,[0,0,1,2,-1,99]),true);assert.deepEqual(useGame.getState().guardHP,[10,0,0]);assert.equal(useGame.getState().attackResult.defeated,1);assert.equal(useGame.getState().attackResult.hits,2);assert.equal(useGame.getState().items.strike,3);
 g.useItem('strike');assert.equal(g.resolveAttack(useGame.getState().attackRequest,[1,2]),false);assert.equal(useGame.getState().items.strike,3);assert.equal(gradeSummary(useGame.getState().grades).score,0);
});
test('怪物受傷與擊倒寫入存檔，暫停、讀題、續行不回血，重試當域才重置',()=>{
 const g=useGame.getState();g.useItem('strike');g.resolveAttack(useGame.getState().attackRequest,[0]);assert.deepEqual(useGame.getState().guardHP,[0]);assert.deepEqual(useGame.getState().save?.guardHP,[0]);g.open();g.tick(3);assert.deepEqual(useGame.getState().guardHP,[0]);useGame.setState({question:null});g.setPhase('menu');g.start(true);assert.deepEqual(useGame.getState().guardHP,[0]);g.retry();assert.deepEqual(useGame.getState().guardHP,[20]);assert.equal(useGame.getState().items.strike,0);
});
test('舊存檔補入正確怪物生命，死亡0不被預設值覆蓋，過高及非法值修正',async()=>{
 assert.deepEqual(normalizeGuardHealth(2,[0,20,999,NaN]),[0,20,40]);assert.deepEqual(migrateSave({realm:3,step:1,version:3})?.guardHP,[50,50,50,50]);const migrated=await useGame.persist.getOptions().migrate!({save:{version:3,realm:1,step:1,guardHP:[0,10,30]},items:{step:12,shadow:8,time:4,strike:5,aegis:3,heal:7}},10) as ReturnType<typeof useGame.getState>;assert.deepEqual(migrated.save?.guardHP,[0,10]);assert.equal(migrated.items.step,12);assert.equal(migrated.items.heal,7);
});
test('背包不截斷大於2的數量，非法數量仍不能成為負數或無限值',()=>{
 assert.deepEqual(normalizeItems({step:250,shadow:3.9,time:-1,strike:9,aegis:Infinity,heal:12345}),{step:250,shadow:3,time:0,strike:9,aegis:0,heal:12345});
});
test('主角受傷也會保存生命，歸零不留下可續行的復活存檔',()=>{
 const g=useGame.getState();useGame.setState({hp:20});g.hit();assert.equal(useGame.getState().save?.hp,10);g.hit();assert.equal(useGame.getState().hp,0);assert.equal(useGame.getState().save,null);
});
test('同位置血條分行不互相遮擋，保留主角優先並限制於螢幕內',()=>{
 const positions=layoutHealthLabels(Array.from({length:7},(_,id)=>({id,x:190,y:400,width:86,height:30,visible:true})),390,844);assert.equal(positions[0].y,400);assert.equal(positions.every(p=>p.visible),true);for(let i=1;i<positions.length;i++)assert.ok(positions[i].y<=positions[i-1].y-34);assert.equal(layoutHealthLabels([{id:0,x:-30,y:100,width:86,height:30,visible:true}],390,844)[0].visible,false);
});
test('鏡頭邊緣標籤不超出左右邊界；不強行把畫面外怪物血條拉進來',()=>{
 const labels=layoutHealthLabels([{id:0,x:2,y:80,width:86,height:30,visible:true},{id:1,x:500,y:20,width:86,height:30,visible:true}],320,740);assert.ok(labels[0].x>=47);assert.equal(labels[1].visible,false);
});
test('血條避開右側道具列等HUD，偏移後仍在角色上方',()=>{
 const box={left:250,right:376,top:330,bottom:600},labels=layoutHealthLabels([{id:0,x:350,y:480,width:86,height:30,visible:true}],390,844,[box]);const p=labels[0];assert.equal(p.visible,true);assert.ok(p.y<=480);assert.equal(p.x-43<box.right&&p.x+43>box.left&&p.y-30<box.bottom&&p.y>box.top,false);
});
