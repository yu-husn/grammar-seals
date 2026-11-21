import {test} from 'node:test';
import assert from 'node:assert/strict';
import {openingShots,openingDuration,openingFrame,openingStart,openingChasePositions} from '../src/openingStory';
test('四十秒序章依序展現大地、佔領、追擊、辨句、道具與復甦',()=>{
 assert.equal(openingDuration,40);assert.deepEqual(openingShots.map(s=>s.id),['land','invasion','chase','grammar','items','renewal']);
 for(let i=0;i<openingShots.length;i++){const start=openingStart(i);assert.equal(openingFrame(start).index,i);assert.equal(openingFrame(start).progress,0);assert.equal(openingFrame(start+openingShots[i].duration-.01).index,i)}
 assert.deepEqual(openingFrame(-1),{index:0,progress:0});assert.deepEqual(openingFrame(40),{index:5,progress:1});assert.deepEqual(openingFrame(100),{index:5,progress:1});
});

test('開場四大關主全數從主角後方追來，不留在原地或屋頂',()=>{
 for(let n=0;n<=20;n++){
  const p=n/20,frame=openingChasePositions(p);
  assert.equal(frame.guards.length,4);
  assert.equal(new Set(frame.guards.map(g=>g.x)).size,4);
  assert.ok(frame.guards.every(g=>g.z<frame.hero.z&&g.y===0&&Math.abs(g.x)<3));
  if(n>0){const before=openingChasePositions(p-.05);frame.guards.forEach((g,i)=>assert.ok(g.z>before.guards[i].z));assert.ok(frame.hero.z>before.hero.z)}
 }
});
