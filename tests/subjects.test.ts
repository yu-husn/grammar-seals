import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MISSION_LENGTH,validateQuestion} from '../src/questions';
import {missionQuestion} from '../src/campaign';
import {subjectChallenges} from '../src/subjectChallenges';
test('主語關卡四種挑戰均有有效答案與解析',()=>{assert.equal(subjectChallenges.length,4);for(const q of subjectChallenges)assert.deepEqual(validateQuestion(q),[])});
test('刪除中心語題後仍保留完整主語與倒裝任務',()=>{const full=subjectChallenges.find(q=>q.id==='subject-full-01')!;assert.equal(full.options[full.answer],'提著燈籠的少年');assert.ok(!subjectChallenges.some(q=>q.id==='subject-head-01'));assert.ok(subjectChallenges.some(q=>q.id==='subject-inverted-01'))});
test('主語石碑是出口前的第六道機關',()=>{assert.equal(MISSION_LENGTH,6);assert.equal(missionQuestion(5).id,'subject-full-01')});
