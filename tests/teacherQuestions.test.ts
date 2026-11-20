import {test} from 'node:test';
import assert from 'node:assert/strict';
import {teacherQuestions} from '../src/teacherQuestions';
import {validateQuestion} from '../src/questions';
test('既有四十題教師指定分類保留，全部教師題通過結構驗證',()=>{assert.deepEqual(teacherQuestions.slice(0,40).map(q=>q.category),['敘事句','敘事句','判斷句','表態句','判斷句','敘事句','表態句','敘事句','有無句','敘事句','有無句','有無句','有無句','敘事句','有無句','有無句','判斷句','敘事句','敘事句','敘事句','敘事句','表態句','敘事句','敘事句','敘事句','判斷句','表態句','判斷句','表態句','敘事句','判斷句','敘事句','表態句','表態句','表態句','敘事句','判斷句','表態句','敘事句','敘事句']);for(const q of teacherQuestions){assert.equal(q.options[q.answer],q.category);assert.deepEqual(validateQuestion(q),[])}});
