import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pickPriorityQuestion,questionDrawGroup,isUserAddedQuestion,questionDrawTier} from '../src/questionPriority';
import {getPracticeQuestions} from '../src/questionPool';
import {campaignQuestion,realmLength} from '../src/campaign';
import {isBossQuestion} from '../src/bossQuestions';

test('優先答完58道直接新增題，原創題數量與隨機值不會降低優先順序',()=>{
 const all=getPracticeQuestions(),original=all.find(q=>questionDrawGroup(q)==='original')!;
 const pool=[...all,...Array.from({length:500},(_,i)=>({...original,id:`extra-${i}`,sentence:`額外原創${i}`}))],used=new Set<string>();
 assert.equal(all.filter(isUserAddedQuestion).length,58);
 for(let i=0;i<58;i++){const q=pickPriorityQuestion(pool,used,()=>i%2===0?0:.999999);assert.ok(isUserAddedQuestion(q));assert.equal(used.has(q.id),false);used.add(q.id)}
 const next=pickPriorityQuestion(pool,used);assert.equal(isUserAddedQuestion(next),false);assert.equal(questionDrawTier(next),1);
 const merchant=all.find(q=>q.sentence==='賈人搬有運無。')!;assert.ok(isUserAddedQuestion(merchant),'同句教材去重後仍辨認為直接新增題');
});

test('保留外部限制，逐級補足題目且全數答過後才重抽新增題',()=>{
 const pool=getPracticeQuestions().filter(q=>!isBossQuestion(q)),used=new Set<string>();
 let prior=0;for(let i=0;i<pool.length;i++){const q=pickPriorityQuestion(pool,used,()=>.4),tier=questionDrawTier(q);assert.ok(tier>=prior);assert.equal(used.has(q.id),false);assert.equal(isBossQuestion(q),false);used.add(q.id);prior=tier}
 assert.ok(isUserAddedQuestion(pickPriorityQuestion(pool,used)));
});

test('排除已出題、缺少來源組及全數答過時都有可用題，且保留外部篩選',()=>{
 const state=getPracticeQuestions().filter(q=>q.category==='表態句'&&!isBossQuestion(q));const used=new Set<string>();
 for(let i=0;i<30;i++){const q=pickPriorityQuestion(state,used);assert.equal(q.category,'表態句');assert.equal(isBossQuestion(q),false);assert.equal(used.has(q.id),false);used.add(q.id)}
 const only=[state[0]];assert.equal(pickPriorityQuestion(only,[only[0].id]).id,only[0].id);assert.throws(()=>pickPriorityQuestion([]));
});

test('主線40題以教師與歷屆為主，保留兩道主語補充題及原本互動題型',()=>{
 const rows=Array.from({length:5},(_,r)=>Array.from({length:realmLength(r)},(_,i)=>campaignQuestion(r,i))).flat();
 assert.equal(rows.length,40);assert.equal(rows.filter(q=>questionDrawGroup(q)!=='original').length,38);
 assert.deepEqual(rows.filter(q=>questionDrawGroup(q)==='original').map(q=>q.id).sort(),['subject-full-01','subject-inverted-01']);
 for(const kind of ['解剖','陷阱'])assert.ok(rows.some(q=>q.kind===kind));
});
