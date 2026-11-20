import './setup';
import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from '../src/store';
import {freshSupplyBanks,normalizeSupplyBanks,type SupplySnapshot} from '../src/supply';
import {canEnterSection} from '../src/journey';
import {gradeSummary} from '../src/grading';
beforeEach(()=>useGame.setState({phase:'menu',journeyCleared:['realm0'],passedStages:[],grades:{},supplyBanks:freshSupplyBanks(),items:{step:0,shadow:0,time:0,strike:1,aegis:1,heal:1}}));
const snapshot:SupplySnapshot={seconds:173,answered:2,score:250,combo:1,moves:23,freeMoves:1,board:Array.from({length:6},(_,r)=>Array.from({length:6},(_,c)=>(r+c)%5)),questionId:'teacher-narrative-peony',result:false,picked:1,wrong:true,paused:true};
test('離開與重新載入保存同局時間、步數、盤面及錯答狀態，不能由重入重新開局',async()=>{
 const g=useGame.getState();g.enterChallenge('gems');g.saveSupplyAttempt('gems',snapshot);g.awardSupplyPoints('gems','move:2:0',3);g.setPhase('menu');g.enterChallenge('gems');assert.deepEqual(useGame.getState().supplyBanks.gems.attempt!.snapshot,snapshot);await useGame.persist.rehydrate();assert.deepEqual(useGame.getState().supplyBanks.gems.attempt!.snapshot,snapshot);assert.equal(useGame.getState().supplyBanks.gems.earned,3);
});
test('一局結束就不能再答題、存新盤或領分；仍可兌換，主線能繼續',()=>{
 const g=useGame.getState();g.enterChallenge('gems');g.awardSupplyPoints('gems','earned',60);g.saveSupplyAttempt('gems',snapshot);g.finishSupplyAttempt('gems');assert.ok(canEnterSection(useGame.getState().journeyCleared,'realm1'));assert.equal(useGame.getState().passedStages.includes('gems'),false);
 g.setPhase('menu');g.enterChallenge('gems');assert.equal(useGame.getState().supplyBanks.gems.attempt!.finished,true);g.saveSupplyAttempt('gems',{...snapshot,seconds:240,moves:30});assert.equal(useGame.getState().supplyBanks.gems.attempt!.snapshot!.seconds,173);assert.equal(g.awardSupplyPoints('gems','new-play',40),0);g.markGrade('gems',0,'new-question',true);assert.equal(Object.keys(useGame.getState().grades).length,0);assert.ok(g.buySupplyItem('gems','step'));assert.equal(useGame.getState().supplyBanks.gems.earned,60);assert.equal(useGame.getState().supplyBanks.gems.spent,30);
});
test('兩站總取得最多200點，兌換、結束、重入皆不恢復額度，也不影響學科成績',()=>{
 const g=useGame.getState();g.enterChallenge('gems');g.awardSupplyPoints('gems','many',500);g.buySupplyItem('gems','step');g.finishSupplyAttempt('gems');useGame.setState({journeyCleared:['realm0','gems','realm1','realm2']});g.enterChallenge('blast');g.awardSupplyPoints('blast','many',500);g.finishSupplyAttempt('blast');for(const id of ['gems','blast'] as const){g.enterChallenge(id);assert.equal(g.awardSupplyPoints(id,'more',999),0)}assert.equal(useGame.getState().supplyBanks.gems.earned+useGame.getState().supplyBanks.blast.earned,200);assert.equal(gradeSummary(useGame.getState().grades).score,0);
});
test('舊通關站只能看結算，開立新成績卷才恢復一次機會',()=>{
 const g=useGame.getState();useGame.setState({journeyCleared:['realm0','gems'],supplyBanks:{...freshSupplyBanks(),gems:{earned:80,spent:30,claims:['old']}}});g.enterChallenge('gems');assert.equal(useGame.getState().supplyBanks.gems.attempt!.finished,true);assert.equal(g.awardSupplyPoints('gems','extra',20),0);g.setPhase('teacher');g.resetAssessment();assert.deepEqual(useGame.getState().supplyBanks,freshSupplyBanks());assert.deepEqual(useGame.getState().journeyCleared,[]);
});
test('重訪已結束商店保留當前主線檢查點',()=>{
 const save={version:4 as const,realm:1,step:3,seals:[0],hp:70,seconds:150,mistakes:1,combo:0,cleared:false};
 useGame.setState({journeyCleared:['realm0','gems'],save});useGame.getState().enterChallenge('gems');assert.deepEqual(useGame.getState().save,save);useGame.getState().setPhase('menu');assert.deepEqual(useGame.getState().save,save);
});
test('存檔遷移保留當局快照與結束旗標，非法盤面不作有效盤面使用',()=>{
 const data=normalizeSupplyBanks({gems:{earned:40,spent:0,claims:[],attempt:{finished:false,snapshot}},blast:{earned:100,spent:20,claims:[],attempt:{finished:true}}});assert.deepEqual(data.gems.attempt!.snapshot!.board,snapshot.board);assert.equal(data.gems.attempt!.snapshot!.wrong,true);assert.equal(data.blast.attempt!.finished,true);const invalid=normalizeSupplyBanks({gems:{earned:0,spent:0,claims:[],attempt:{finished:false,snapshot:{...snapshot,board:[[99]]}}}});assert.equal(invalid.gems.attempt!.snapshot!.board,undefined);
});
