import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bossQuestions,isBossQuestion,sentenceKey} from '../src/bossQuestions';
import {campaignQuestion,realmLength} from '../src/campaign';
import {getPracticeQuestions} from '../src/questionPool';
import {validateQuestion} from '../src/questions';
import {useGame} from '../src/store';
test('魔王十六題互不重複，亦不與四域句子或證詞選項重複',()=>{assert.equal(bossQuestions.length,16);assert.equal(new Set(bossQuestions.map(q=>sentenceKey(q.sentence))).size,16);for(const q of bossQuestions)assert.deepEqual(validateQuestion(q),[]);for(let r=0;r<4;r++)for(let s=0;s<realmLength(r);s++){const q=campaignQuestion(r,s);assert.equal(isBossQuestion(q),false);for(const option of q.options)assert.ok(!bossQuestions.some(b=>sentenceKey(b.sentence)===sentenceKey(option)))}assert.ok(bossQuestions.slice(10).filter(q=>q.kind==='解剖').length>=2)});
test('額外遊戲排除魔王保留句，教師全題庫仍保留191題',()=>{const all=getPracticeQuestions(),extra=all.filter(q=>!isBossQuestion(q));assert.equal(all.length,191);assert.ok(extra.length<all.length);assert.ok(extra.every(q=>!isBossQuestion(q)))});
test('舊額外遊戲未完成題若改列魔王題，可換題但保留補救半分紀錄',()=>{const g=useGame.getState(),id=getPracticeQuestions().find(q=>isBossQuestion(q))!.id;useGame.setState({grades:{'gems:0':{questionId:id,wrong:true,credit:null}}});assert.equal(g.assignBonus('gems',0,'replacement'),'replacement');assert.equal(useGame.getState().grades['gems:0'].wrong,true);g.markGrade('gems',0,'replacement',true);assert.equal(useGame.getState().grades['gems:0'].credit,.5)});
test('魔王改用獨立題組後，舊存檔待補救題可正常完成且保留半分規則',()=>{useGame.setState({phase:'play',realm:4,step:0,question:null,grades:{'realm4:0':{questionId:'legacy-boss-question',wrong:true,credit:null}}});const g=useGame.getState();g.open();const q=useGame.getState().question!;assert.equal(useGame.getState().grades['realm4:0'].questionId,q.id);g.answer(q.answer);g.next();assert.equal(useGame.getState().grades['realm4:0'].credit,.5);assert.equal(useGame.getState().step,1)});

