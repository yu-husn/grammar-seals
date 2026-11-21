import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from '../src/store';
import {freshGuardHealth} from '../src/guardHealth';

test('第16版舊存檔縮減為1至4隻，保留前方守衛受傷與死亡及所有學習資料',async()=>{
 for(let realm=0;realm<4;realm++){
  const hp=[20,30,40,50][realm],health=Array(realm+3).fill(hp);health[0]=0;if(realm>0)health[1]=hp-5;
  const raw={guardHP:health,save:{version:4,realm,step:1,seals:Array.from({length:realm},(_,i)=>i),hp:70,seconds:123,mistakes:4,combo:0,cleared:false,guardHP:health},grades:{'realm0:0':{questionId:'retained',wrong:false,credit:1}},records:[{id:'retained',sentence:'保留作答'}],items:{step:5,shadow:6,time:7,strike:8,aegis:9,heal:10},settings:{audio:false},journeyCleared:[]};
  const migrated=await useGame.persist.getOptions().migrate!(raw,16);assert.deepEqual(migrated.guardHP,health.slice(0,realm+1));assert.deepEqual(migrated.save!.guardHP,health.slice(0,realm+1));assert.equal(migrated.save!.hp,70);assert.equal(migrated.save!.seconds,123);assert.equal(migrated.save!.step,1);assert.deepEqual(migrated.grades,raw.grades);assert.deepEqual(migrated.records,raw.records);assert.deepEqual(migrated.items,raw.items);assert.equal(freshGuardHealth(realm).length,realm+1);
 }
});
