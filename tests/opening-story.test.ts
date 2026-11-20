import {test} from 'node:test';
import assert from 'node:assert/strict';
import {openingShots,openingDuration,openingFrame,openingStart} from '../src/openingStory';
test('四十秒序章依序展現大地、佔領、追擊、辨句、道具與復甦',()=>{
 assert.equal(openingDuration,40);assert.deepEqual(openingShots.map(s=>s.id),['land','invasion','chase','grammar','items','renewal']);
 for(let i=0;i<openingShots.length;i++){const start=openingStart(i);assert.equal(openingFrame(start).index,i);assert.equal(openingFrame(start).progress,0);assert.equal(openingFrame(start+openingShots[i].duration-.01).index,i)}
 assert.deepEqual(openingFrame(-1),{index:0,progress:0});assert.deepEqual(openingFrame(40),{index:5,progress:1});assert.deepEqual(openingFrame(100),{index:5,progress:1});
});
