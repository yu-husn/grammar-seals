import {test} from 'node:test';
import assert from 'node:assert/strict';
import {comparedQuestions,comparisonAudit,deletedSentences} from '../src/comparedQuestions';
import {validateQuestion} from '../src/questions';
test('對照清單保留指定刪除、兩題待審及教師分類修正',()=>{assert.equal(comparisonAudit.length,73);assert.equal(comparisonAudit.filter(r=>r.status==='已刪除').length,7);assert.equal(comparedQuestions.length,66);assert.equal(comparedQuestions.filter(q=>q.reviewStatus==='待教師審核').length,2);assert.equal(comparedQuestions.find(q=>q.sentence.startsWith('張老伯'))?.category,'表態句');assert.equal(comparedQuestions.find(q=>q.sentence.startsWith('人世間'))?.category,'敘事句');for(const q of comparedQuestions){assert.deepEqual(validateQuestion(q),[]);assert.ok(!deletedSentences.some(s=>q.sentence.replace(/。$/,'')===s))}});
test('改寫溫暖的家及引號受測範圍保留',()=>{assert.ok(comparedQuestions.some(q=>q.sentence==='他有一個溫暖的家。'&&q.category==='有無句'));assert.ok(!comparedQuestions.some(q=>q.sentence.includes('卻不知珍惜')));for(const q of comparedQuestions.filter(q=>q.sentence.includes('「')))assert.ok(q.stem.includes('引號'))});
