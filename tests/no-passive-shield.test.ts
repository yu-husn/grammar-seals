import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from '../src/store';
import {freshItems} from '../src/grading';

test('第11版護盾存檔遷移後保留生命、成績、道具、金鐘罩時間與關卡進度',async()=>{
 const previous={shield:5,save:{version:3,realm:1,step:2,seals:[0],hp:70,shield:5,seconds:126,mistakes:1,combo:2,cleared:false,guardHP:[0,10,30]},journeyCleared:['realm0','gems'],grades:{'realm1:0':{questionId:'retained',wrong:false,credit:1}},items:{...freshItems(),shadow:12},aegisSeconds:4,settings:{},records:[]};
 const migrated=await useGame.persist.getOptions().migrate!(previous,11) as ReturnType<typeof useGame.getState>;
 assert.equal('shield' in migrated,false);assert.equal('shield' in migrated.save!,false);
 assert.equal(migrated.save?.version,4);assert.equal(migrated.save?.hp,70);assert.equal(migrated.save?.seconds,126);assert.equal(migrated.save?.step,2);
 assert.deepEqual(migrated.save?.guardHP,[0,10,30,30]);assert.deepEqual(migrated.grades,previous.grades);assert.deepEqual(migrated.items,previous.items);assert.deepEqual(migrated.journeyCleared,previous.journeyCleared);assert.equal(migrated.aegisSeconds,4);
});

test('首次答對、重試及跨關均不恢復常駐護盾，答對仍給分與累計道具',()=>{
 const g=useGame.getState();useGame.setState({phase:'menu',journeyCleared:[],grades:{},save:null,unlocked:0,realm:0});g.resetAssessment();g.start();
 g.hit();g.open();g.answer(useGame.getState().question!.answer);g.next();
 assert.equal(useGame.getState().hp,90);assert.equal('shield' in useGame.getState(),false);assert.equal('shield' in useGame.getState().save!,false);assert.equal(useGame.getState().rewardCount,1);
 g.retry();assert.equal(useGame.getState().hp,100);assert.equal('shield' in useGame.getState().save!,false);
 useGame.setState({realm:1,phase:'realmClear',journeyCleared:['realm0','gems','realm1'],seals:[0,1],hp:50});g.advance();assert.equal(useGame.getState().realm,2);assert.equal(useGame.getState().hp,80);assert.equal('shield' in useGame.getState().save!,false);
});
