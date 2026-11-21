import {test} from 'node:test';
import assert from 'node:assert/strict';
import {openingShots,openingDuration,openingFrame,openingStart,openingChasePositions,openingGrammarPosition} from '../src/openingStory';
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

test('主角由圈外走進四句字印之間，停在碑前且不穿過石碑',()=>{
 const start=openingGrammarPosition(0),end=openingGrammarPosition(1);
 assert.ok(Math.hypot(start.x-1.4,start.z+.4)>2.5);
 assert.ok(Math.hypot(end.x-1.4,end.z+.4)<2);
 assert.equal(start.walking,true);assert.equal(end.walking,false);
 assert.deepEqual(openingGrammarPosition(.55),end);
 for(let i=0;i<=100;i++)assert.ok(openingGrammarPosition(i/100).z>=1);
});
