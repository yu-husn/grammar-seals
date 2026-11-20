import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateQuestion,type Question} from '../src/questions';
const selected=JSON.parse(fs.readFileSync('deliverables/句型精選100題_含答案.json','utf8')) as Question[],all=JSON.parse(fs.readFileSync('deliverables/完整句型題庫_218題.json','utf8')) as Question[];
test('精選100題四類各25，答案與218題確認版相同且不重複句子',()=>{assert.equal(selected.length,100);for(const category of ['敘事句','表態句','判斷句','有無句'])assert.equal(selected.filter(q=>q.category===category).length,25);assert.equal(new Set(selected.map(q=>q.sentence.replace(/[\p{P}\p{Z}\s]/gu,''))).size,100);for(const q of selected){assert.deepEqual(validateQuestion(q),[]);const original=all.find(b=>b.id===q.id);assert.ok(original);assert.equal(q.answer,original.answer);assert.equal(q.explanation,original.explanation);assert.notEqual(q.reviewStatus,'待教師審核')}});
test('精選100題保留教師指定的分類修正與簡化句',()=>{for(const [sentence,category]of [['人世間的是是非非極難分辨','敘事句'],['張老伯一向實事求是','表態句'],['他有一個溫暖的家','有無句']])assert.ok(selected.some(q=>q.sentence.includes(sentence)&&q.category===category));assert.ok(!selected.some(q=>q.sentence.includes('卻不知珍惜')))});
