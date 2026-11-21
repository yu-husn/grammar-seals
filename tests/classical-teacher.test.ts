import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classicalTeacherQuestions as added} from '../src/classicalTeacherQuestions';
import {getPracticeQuestions} from '../src/questionPool';
import {validateQuestion} from '../src/questions';
import {questionDrawGroup} from '../src/questionPriority';
test('十八道文言教師題依指定分類進入正式優先題池，來源不冒標考試',()=>{
 assert.deepEqual(added.map(q=>q.category),['表態句','判斷句','表態句','敘事句','有無句','敘事句','敘事句','判斷句','敘事句','表態句','敘事句','有無句','有無句','表態句','敘事句','敘事句','有無句','判斷句']);
 const all=getPracticeQuestions();assert.equal(all.length,213);
 for(const q of added){assert.equal(all.filter(r=>r.id===q.id).length,1);assert.equal(q.options[q.answer],q.category);assert.deepEqual(validateQuestion(q),[]);assert.equal(questionDrawGroup(q),'teacher');assert.equal(q.examYear,null);assert.equal(q.examNumber,null);assert.equal(q.sourceUrl,'');assert.ok(q.explanation.length>35);assert.ok(q.components.length>=2)}
 assert.deepEqual(['敘事句','表態句','判斷句','有無句'].map(c=>all.filter(q=>q.category===c).length),[64,56,51,42]);
});
test('乃與為依語境說明功能，括號補說、截句、省略及處所成分明示',()=>{
 const byId=(id:string)=>added.find(q=>q.id===id)!;
 assert.ok(byId('teacher-narrative-tingwei-fine').components.some(c=>c.text==='乃'&&c.role==='副詞'));
 assert.ok(byId('teacher-judgement-shizhi').components.some(c=>c.text==='為'&&c.role==='繫詞'));
 assert.ok(byId('teacher-attribute-lovable-flowers').explanation.includes('教師補充'));
 assert.ok(byId('teacher-existence-state-advisers').explanation.includes('截出'));
 assert.ok(byId('teacher-narrative-insects').components.some(c=>c.role==='省略主語'));
 assert.ok(byId('teacher-narrative-shun').commonError.includes('不應一律當賓語'));
});
