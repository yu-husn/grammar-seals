import {answerChoices} from '../src/questions';
import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {campaignQuestion,realmLength} from '../src/campaign';
import {useGame} from '../src/store';
test('教師刪除的思想家證詞題及相同選項改寫不再出現在關卡',()=>{for(let r=0;r<5;r++)for(let i=0;i<realmLength(r);i++){const q=campaignQuestion(r,i);assert.ok(!q.stem.includes('身分是思想家'));assert.ok(!q.options.includes('孔子閱讀古籍。'))}const q=campaignQuestion(0,3);assert.equal(q.sentence,'下午大雨滂沱。');assert.equal(q.category,'表態句');assert.equal(q.options[q.answer],'表態句')});
test('刪題後舊未完成槽可換到保留題，維持補救半分與原有40題計分',()=>{useGame.setState({questionDeck:null,save:null,phase:'play',realm:0,step:3,question:null,feedback:null,grades:{'realm0:3':{questionId:'original-2-0',wrong:true,credit:null}}});const g=useGame.getState();g.open();const q=useGame.getState().question!;assert.notEqual(q.kind,'證詞');assert.deepEqual(q.options,answerChoices);assert.ok(!q.stem.includes('身分是思想家'));g.answer(q.answer);g.next();assert.equal(useGame.getState().step,4);assert.equal(useGame.getState().grades['realm0:3'].credit,.5)});
