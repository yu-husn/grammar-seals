import './setup';
import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from '../src/store';
import {freshItems,gradeSummary,normalizeItems} from '../src/grading';
import {freshSupplyBanks} from '../src/supply';
import {inStrikeRange,repelGuard} from '../src/strike';
beforeEach(()=>{useGame.setState({phase:'menu'});useGame.getState().resetAssessment();useGame.setState({unlocked:0,question:null,attackPending:false,aegisSeconds:0});useGame.getState().configure({countdown:true,chase:true});useGame.getState().start()});
test('舊背包保留三種道具，新道具只補一次，已耗盡的新道具不補發',async()=>{
 const g=await useGame.persist.getOptions().migrate!({items:{step:2,shadow:1,time:0},grades:{},settings:{},records:[]},9) as ReturnType<typeof useGame.getState>;
 assert.deepEqual(g.items,{step:2,shadow:1,time:0,strike:1,aegis:1,heal:1});
 assert.deepEqual(normalizeItems({...g.items,strike:0,aegis:0,heal:1}),{step:2,shadow:1,time:0,strike:0,aegis:0,heal:1});
});
test('誅邪彈只在實際命中後扣一次，空發與重複處理不扣道具或成績',()=>{
 const g=useGame.getState();useGame.setState({realm:1,guardHP:[30,30]});g.useItem('strike');let request=useGame.getState().attackRequest;
 assert.equal(g.resolveAttack(request,0),false);assert.equal(useGame.getState().items.strike,1);
 g.useItem('strike');request=useGame.getState().attackRequest;g.useItem('strike');assert.equal(useGame.getState().attackRequest,request);
 assert.equal(g.resolveAttack(request,[0,1]),true);assert.equal(g.resolveAttack(request,2),false);assert.equal(useGame.getState().items.strike,0);
 assert.equal(useGame.getState().attackResult.hits,2);assert.equal(gradeSummary(useGame.getState().grades).score,0);
});
test('讀題、暫停、追擊關閉不能投彈；讀題會取消尚未處理的攻擊',()=>{
 const g=useGame.getState();g.useItem('strike');const id=useGame.getState().attackRequest;g.open();assert.equal(g.resolveAttack(id,[0,1]),false);g.useItem('strike');g.useItem('aegis');assert.deepEqual(useGame.getState().items,freshItems());
 useGame.setState({question:null});g.setPhase('pause');g.useItem('strike');assert.equal(useGame.getState().attackPending,false);
 g.setPhase('play');g.configure({chase:false});g.useItem('strike');assert.equal(useGame.getState().attackPending,false);
});
test('誅邪彈六步範圍、閘門阻擋及擊退邊界',()=>{
 assert.equal(inStrikeRange(0,0,{x:0,z:11},{x:0,z:17}),true);
 assert.equal(inStrikeRange(0,0,{x:0,z:11},{x:0,z:17.01}),false);
 assert.equal(inStrikeRange(0,0,{x:0,z:-5},{x:0,z:-9}),false);
 assert.equal(inStrikeRange(0,3,{x:0,z:-5},{x:0,z:-9}),true);
 assert.deepEqual(repelGuard(0,0,{x:0,z:10},{x:0,z:12}),{x:0,z:15});
 const pushed=repelGuard(0,0,{x:0,z:-4},{x:0,z:-7});assert.ok(pushed.z>-7.35);
 assert.ok(repelGuard(3,6,{x:0,z:0},{x:4,z:1}).x<=4.5);
});
test('金鐘罩全傷害免疫，不能疊加消耗；到期恢復正常受傷',()=>{
 const g=useGame.getState();useGame.setState({items:{...freshItems(),aegis:2,heal:1},hp:100});g.useItem('aegis');g.useItem('aegis');assert.equal(useGame.getState().items.aegis,1);
 for(const kind of ['grab','spell','trap'] as const)g.hit(kind);assert.equal(useGame.getState().hp,100);assert.equal(useGame.getState().hitEvent.kind,'block');
 g.tick(8);assert.equal(useGame.getState().aegisSeconds,0);g.hit();assert.equal(useGame.getState().hp,90);
});
test('金鐘罩研讀、解析、暫停停止計時，倒數停用時保護仍會到期',()=>{
 const g=useGame.getState();g.useItem('aegis');g.open();g.tick(20);assert.equal(useGame.getState().aegisSeconds,8);
 const q=useGame.getState().question!;g.answer(q.answer);g.tick(20);assert.equal(useGame.getState().aegisSeconds,8);g.next();
 g.setPhase('pause');g.tick(20);assert.equal(useGame.getState().aegisSeconds,8);g.setPhase('play');g.configure({countdown:false});const seconds=useGame.getState().seconds;g.tick(3);assert.equal(useGame.getState().aegisSeconds,5);assert.equal(useGame.getState().seconds,seconds);
});
test('保護剩餘秒數隨存檔續行，重試不重發道具、不重置為8秒',()=>{
 const g=useGame.getState();g.useItem('aegis');g.tick(2);g.setPhase('menu');g.start(true);assert.equal(useGame.getState().aegisSeconds,6);assert.equal(useGame.getState().items.aegis,0);g.retry();assert.equal(useGame.getState().aegisSeconds,0);assert.equal(useGame.getState().items.aegis,0);
});
test('補給以20點與25點兌換道具，數量超過2仍可購買，沒有學科加分',()=>{
 const g=useGame.getState();useGame.setState({phase:'gems',journeyCleared:['realm0'],supplyBanks:freshSupplyBanks(),items:{...freshItems(),strike:9,aegis:7}});g.awardSupplyPoints('gems','earned',100);
 assert.equal(g.buySupplyItem('gems','strike'),true);assert.equal(g.buySupplyItem('gems','aegis'),true);assert.equal(useGame.getState().items.strike,10);assert.equal(useGame.getState().items.aegis,8);assert.equal(useGame.getState().supplyBanks.gems.spent,45);assert.equal(gradeSummary(useGame.getState().grades).score,0);
});

test('魔王戰誅邪彈清咒事件不削減魔王生命，金鐘罩擋咒彈不改題數',()=>{
 const g=useGame.getState();useGame.setState({realm:4,bossHP:160});g.useItem('strike');g.resolveAttack(useGame.getState().attackRequest,4);g.useItem('aegis');g.hit('spell');assert.equal(useGame.getState().bossHP,160);assert.equal(gradeSummary(useGame.getState().grades).completed,0);assert.equal(useGame.getState().hp,100);
});
test('延命丹滿血不消耗，恢復20點並上限100，保存至續玩且不影響學科分數',()=>{
 const g=useGame.getState();g.useItem('heal');assert.equal(useGame.getState().items.heal,1);useGame.setState({hp:70});g.useItem('heal');assert.equal(useGame.getState().hp,90);assert.equal(useGame.getState().save?.hp,90);assert.equal(useGame.getState().items.heal,0);
 useGame.setState({items:{...freshItems(),heal:2},hp:95});g.useItem('heal');g.useItem('heal');assert.equal(useGame.getState().hp,100);assert.equal(useGame.getState().items.heal,1);assert.equal(gradeSummary(useGame.getState().grades).score,0);
});
test('延命丹研讀、暫停與失敗時不消耗，無法用來復活',()=>{
 const g=useGame.getState();useGame.setState({hp:70});g.open();g.useItem('heal');assert.equal(useGame.getState().hp,70);useGame.setState({question:null});g.setPhase('pause');g.useItem('heal');assert.equal(useGame.getState().items.heal,1);useGame.setState({phase:'lose',hp:0});g.useItem('heal');assert.equal(useGame.getState().hp,0);assert.equal(useGame.getState().items.heal,1);
});
test('延命丹可用20補給積分兌換，帶入一般關卡恢復生命',()=>{
 const g=useGame.getState();useGame.setState({phase:'gems',journeyCleared:['realm0'],supplyBanks:freshSupplyBanks()});g.awardSupplyPoints('gems','earned',20);assert.equal(g.buySupplyItem('gems','heal'),true);assert.equal(useGame.getState().supplyBanks.gems.spent,20);assert.equal(useGame.getState().items.heal,2);useGame.setState({phase:'play',realm:1,hp:60});g.useItem('heal');assert.equal(useGame.getState().hp,80);assert.equal(useGame.getState().items.heal,1);
});
