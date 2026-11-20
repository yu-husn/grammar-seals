import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame,migrateSave} from '../src/store';
import {explorationSeconds,clampRemainingSeconds,explorationSecondsForRealm} from '../src/timing';
import {normalizeSupplyBanks,freshSupplyBanks} from '../src/supply';
test('一般關卡200秒、魔王240秒，教師不能改秒數；新關與重試依關別起始',()=>{
 const previous=useGame.getState();try{const g=useGame.getState();assert.equal(explorationSeconds,200);for(const seconds of [30,240,1800]){g.configure({seconds});assert.equal(useGame.getState().settings.seconds,200)}
 for(let realm=0;realm<5;realm++){useGame.setState({unlocked:4,save:null,journeyCleared:['realm0','gems','realm1','realm2','blast','realm3'],settings:{...useGame.getState().settings,seconds:999}});g.start(false,realm);assert.equal(useGame.getState().seconds,explorationSecondsForRealm(realm));g.tick(1);assert.equal(useGame.getState().seconds,explorationSecondsForRealm(realm)-1);g.retry();assert.equal(useGame.getState().seconds,explorationSecondsForRealm(realm))}
 useGame.setState({phase:'realmClear',realm:1,seals:[0,1],seconds:123,journeyCleared:['realm0','gems','realm1']});g.advance();assert.equal(useGame.getState().realm,2);assert.equal(useGame.getState().seconds,200);
 }finally{useGame.setState(previous)}
});
test('第12版存檔改為起始200秒，續玩不補滿，補給當局不重開且合法逆時珠加時保留',async()=>{
 const snapshot={seconds:173,answered:1,score:50,combo:1,moves:27,freeMoves:2},raw={settings:{seconds:1800},journeyCleared:['realm0'],grades:{'realm0:0':{questionId:'kept',wrong:true,credit:.5}},items:{step:1,shadow:0,time:0,strike:1,aegis:1,heal:1},timeUsed:[0],save:{version:4,realm:0,step:1,seals:[],hp:70,seconds:205,mistakes:1,combo:0,cleared:false},supplyBanks:{...freshSupplyBanks(),gems:{earned:25,spent:0,claims:['one'],attempt:{finished:false,snapshot}}}};
 const migrated=await useGame.persist.getOptions().migrate!(raw,12);assert.equal(migrated.settings!.seconds,200);assert.equal(migrated.save!.seconds,205);assert.equal(migrated.supplyBanks!.gems.attempt!.snapshot!.seconds,173);assert.equal(migrated.supplyBanks!.gems.earned,25);assert.deepEqual(migrated.grades,raw.grades);
 assert.equal(migrateSave({...raw.save,seconds:260})!.seconds,200);assert.equal(migrateSave({...raw.save,seconds:126})!.seconds,126);assert.equal(clampRemainingSeconds(0),0);assert.equal(normalizeSupplyBanks({gems:{earned:0,spent:0,claims:[],attempt:{finished:false,snapshot:{...snapshot,seconds:240}}}}).gems.attempt!.snapshot!.seconds,200);
 const previous=useGame.getState();try{useGame.setState({...migrated,phase:'menu'});useGame.getState().start(true);assert.equal(useGame.getState().seconds,205);useGame.setState({timeUsed:[],save:{...migrated.save!,seconds:126}});useGame.getState().start(true);assert.equal(useGame.getState().seconds,126)}finally{useGame.setState(previous)}
});
test('固定起始時間不影響讀題、解析、暫停停表與逆時珠加10秒',()=>{
 const previous=useGame.getState();try{const g=useGame.getState();useGame.setState({phase:'menu',journeyCleared:[],grades:{},save:null,timeUsed:[],items:{...g.items,time:1},settings:{...g.settings,countdown:true}});g.start();g.useItem('time');assert.equal(useGame.getState().seconds,210);g.open();g.tick(10);assert.equal(useGame.getState().seconds,210);g.answer(1);g.tick(10);assert.equal(useGame.getState().seconds,210);useGame.setState({question:null,phase:'pause'});g.tick(10);assert.equal(useGame.getState().seconds,210);g.setPhase('play');g.tick(1);assert.equal(useGame.getState().seconds,209)}finally{useGame.setState(previous)}
});
test('暫停及返回主選單保存當下剩餘秒數，續玩不回到200',()=>{
 const previous=useGame.getState();try{const g=useGame.getState();useGame.setState({journeyCleared:[],save:null,timeUsed:[],settings:{...g.settings,countdown:true}});g.start();g.tick(37);g.setPhase('pause');assert.equal(useGame.getState().save!.seconds,163);g.setPhase('menu');g.start(true);assert.equal(useGame.getState().seconds,163)}finally{useGame.setState(previous)}
});
