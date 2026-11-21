import {test} from 'node:test';
import assert from 'node:assert/strict';
import {studentHint,studentCommonError,reasoningOnly} from '../src/studentHints';
import {getPracticeQuestions} from '../src/questionPool';
import {bossQuestions} from '../src/bossQuestions';

test('口是心非補救保留成分分析，不直接告知句型',()=>{
 const q=getPracticeQuestions().find(q=>q.sentence==='他的言行常常口是心非。')!;
 const hint=studentHint(q);
 assert.ok(hint.includes('口是心非')&&hint.includes('主語')&&hint.includes('表語'));
 assert.ok(!hint.includes('表態')&&!hint.includes('因此是'));
 assert.ok(q.explanation.includes('表態句')); // Teacher/source data stays intact.
});

test('所有正式與魔王題的學生解析及錯誤提醒均不宣告四大句型',()=>{
 for(const q of [...getPracticeQuestions(),...bossQuestions]){
  for(const hint of [studentHint(q),studentCommonError(q)]){
   assert.ok(hint.length>0,q.id);
   assert.doesNotMatch(hint,/敘事|表態|判斷句|有無(?:句|結構)/u,q.id);
  }
  if(q.kind==='解剖')assert.ok(!studentHint(q).includes(q.options[q.answer]),q.id);
 }
});

test('移除正反分類與答案代號，保留引號內逗點的完整分析；內容不足時有方法提示',()=>{
 assert.equal(reasoningOnly('答案：D。屬表態句，不是敘事句。「他，是我的朋友」是完整引文。'), '「他，是我的朋友」是完整引文。');
 const q={...getPracticeQuestions()[0],explanation:'應選A，因此是敘事句。'};
 assert.ok(studentHint(q).includes('主要述語'));
});
