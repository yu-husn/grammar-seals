import './setup';
import {reachBoss} from './journeyHelpers';
import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {campaignQuestion,realmLength,bossPhase} from '../src/campaign';
import {validateQuestion} from '../src/questions';
import {migrateSave,useGame} from '../src/store';
import {deletedSentences} from '../src/comparedQuestions';
beforeEach(()=>{useGame.setState({phase:'menu',journeyCleared:[],grades:{},unlocked:0,save:null,records:[]});useGame.getState().start()});
function solve(){const g=useGame.getState();g.open();g.answer(useGame.getState().question!.answer);g.next()}

test('刪題後第一域與魔王待補救槽換題，保留半分與原來進度',()=>{
 const g=useGame.getState();
 for(const [realm,step,oldId,newId] of [[0,0,'original-0-0','teacher-narrative-exam-reading'],[0,1,'original-0-1','teacher-narrative-mother-care'],[0,3,'original-0-5','teacher-attribute-downpour'],[0,3,'original-0-12','teacher-attribute-downpour'],[4,8,'original-0-11','teacher-narrative-finance-desire'],[4,2,'original-2-15','teacher-judgement-simayi']] as const){
  const key=`realm${realm}:${step}`;useGame.setState({phase:'play',realm,step,questionDeck:null,save:null,question:null,feedback:null,grades:{[key]:{questionId:oldId,wrong:true,credit:null}}});g.open();
  const q=useGame.getState().question!;assert.notEqual(q.id,oldId);assert.deepEqual(validateQuestion(q),[]);assert.equal(useGame.getState().grades[key].wrong,true);g.answer(q.answer);g.next();
  assert.equal(useGame.getState().grades[key].credit,.5);assert.equal(useGame.getState().step,step+1);assert.equal(useGame.getState().save?.step,step+1);
 }
});
test('四域與三階段決戰的40道互動均合法且不含刪除或待審句',()=>{let count=0;for(let r=0;r<5;r++)for(let s=0;s<realmLength(r);s++){const q=campaignQuestion(r,s);assert.deepEqual(validateQuestion(q),[]);assert.notEqual(q.reviewStatus,'待教師審核');assert.ok(!deletedSentences.some(text=>q.sentence.replace(/。$/,'')===text));assert.ok(q.options.every(option=>!deletedSentences.some(text=>option.replace(/。$/,'')===text)));count++}assert.equal(count,40)});
test('依新順序完成補給站與四域後，十六次辨句完成魔王封印',()=>{reachBoss();const g=useGame.getState();assert.equal(useGame.getState().realm,4);for(let i=0;i<16;i++){solve();assert.equal(useGame.getState().bossHP,160-(i+1)*10)}g.escape();assert.equal(useGame.getState().phase,'win')});
test('不能以未解鎖章節或缺少靈印直接取得真正結局',()=>{useGame.getState().start(false,4);assert.equal(useGame.getState().realm,0);useGame.setState({realm:4,step:12,bossHP:0,seals:[0,1,2]});useGame.getState().escape();assert.equal(useGame.getState().phase,'play')});
test('碰撞、咒彈與陷阱均直接扣10生命並發送浮字事件',()=>{const g=useGame.getState();for(const [i,kind] of (['grab','spell','trap'] as const).entries()){g.hit(kind);assert.equal(useGame.getState().hp,90-i*10);assert.equal(useGame.getState().hitEvent.text,'生命值-10')}assert.equal('shield' in useGame.getState().save!,false)});
test('魔王答錯只補救，閱讀與解析不扣生命或時間，重答不加速反擊',()=>{useGame.setState({realm:4,seals:[0,1,2,3],step:0,seconds:240});const g=useGame.getState();g.open();const answer=useGame.getState().question!.answer;g.answer((answer+1)%4);g.hit('spell');g.tick(10);assert.equal(useGame.getState().hp,100);assert.equal(useGame.getState().seconds,240);assert.equal(useGame.getState().bossHP,160);assert.equal(useGame.getState().retaliation,false);g.next();g.answer(answer);g.next();assert.equal(useGame.getState().bossHP,150);assert.equal(useGame.getState().retaliation,false)});
test('第一章舊存檔遷移並保留題庫審核、錯題與新跨關存檔',()=>{const old=migrateSave({step:5,hp:70,shield:10,seconds:160,mistakes:2});assert.equal(old?.realm,0);assert.equal(old?.step,5);assert.equal(old?.hp,70);useGame.setState({save:old});useGame.getState().start(true);assert.equal(useGame.getState().step,5);solve();useGame.getState().escape();const saved=useGame.getState().save!;assert.equal(saved.cleared,true);useGame.setState({save:saved});useGame.getState().start(true);assert.equal(useGame.getState().phase,'realmClear');useGame.getState().advance();assert.equal(useGame.getState().phase,'gems');assert.deepEqual(useGame.getState().seals,[0])});
test('失敗重試保留先前靈印與題目紀錄，重設當前關卡',()=>{useGame.setState({realm:2,journeyCleared:['realm0','gems','realm1'],seals:[0,1],hp:5});const g=useGame.getState();g.hit();assert.equal(useGame.getState().phase,'lose');g.retry();assert.equal(useGame.getState().realm,2);assert.deepEqual(useGame.getState().seals,[0,1]);assert.equal(useGame.getState().hp,100);assert.equal(useGame.getState().step,0)});
