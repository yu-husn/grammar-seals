import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lessonQuestions} from '../src/lessonQuestions';
import {validateQuestion} from '../src/questions';
test('教師課堂題刪去第十九與二十句後保留18題及原分類',()=>{assert.equal(lessonQuestions.length,18);assert.deepEqual(lessonQuestions.map(q=>'ABCD'[q.answer]),['D','A','A','A','D','A','C','A','C','B','B','D','C','A','B','C','C','A']);for(const q of lessonQuestions)assert.deepEqual(validateQuestion(q),[])});
test('刪去第十九與二十句不改其他課堂題ID',()=>{assert.ok(!lessonQuestions.some(q=>q.id==='teacher-lesson-19'));assert.ok(!lessonQuestions.some(q=>q.id==='teacher-lesson-20'));assert.equal(lessonQuestions.at(-1)?.id,'teacher-lesson-18')});
