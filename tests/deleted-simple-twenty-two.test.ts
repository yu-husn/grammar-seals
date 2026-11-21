import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bank} from '../src/questions';
import {getPracticeQuestions} from '../src/questionPool';
import {deletedQuestionIds,isDeletedSentence} from '../src/comparedQuestions';
import {createQuestionDeck,isQuestionDeck} from '../src/questionDeck';
import {sentenceKey} from '../src/bossQuestions';
import {useGame} from '../src/store';

const sentences=['我沒有零用錢','河裡有魚','庭院裡有一棵梅樹','書架上有五本書','井裡沒有水','袋子裡沒有金幣','城外有一座橋','桌上有一本書','鯨魚是哺乳類動物','竹子是植物','他是守門人','這本書是字典','王老師是國文教師','這把鑰匙是寶庫的鑰匙','那位老人是村長','這件物品是古董','這個地方是驛站','這個房間是書房','那個人是船夫','這座島嶼是火山島','這條河是淡水河','這位客人是醫師'];
const removed=bank.filter(q=>sentences.includes(sentenceKey(q.sentence)));
test('指定22題依句子及ID刪除，匯入同句亦排除，縮減後仍可產生54道不重複題目',()=>{
 assert.equal(removed.length,22);assert.equal(removed.filter(q=>q.category==='有無句').length,8);assert.equal(removed.filter(q=>q.category==='判斷句').length,14);const pool=getPracticeQuestions();assert.equal(pool.length,175);
 for(const q of removed){assert.ok(deletedQuestionIds.includes(q.id));assert.ok(isDeletedSentence(q.sentence));assert.ok(!pool.some(p=>p.id===q.id));const copy={...q,id:'import-'+q.id,sentence:`「${q.sentence.replace('。','')}！」`,reviewStatus:'教師已核准' as const};assert.ok(!getPracticeQuestions([copy]).some(p=>p.id===copy.id))}
 for(let seed=1;seed<=50;seed++){let n=seed;const deck=createQuestionDeck({},()=>((n=(n*1664525+1013904223)>>>0)/2**32)),rows=Object.values(deck.questions);assert.ok(isQuestionDeck(deck));assert.equal(rows.length,54);assert.equal(new Set(rows.map(q=>sentenceKey(q.sentence))).size,54);assert.ok(rows.every(q=>!isDeletedSentence(q.sentence)))}
});
test('22題舊待補救槽在主線與兩站均可換題，保留成績與補救旗標，不重複加分',()=>{
 const previous=useGame.getState();try{for(const q of removed){
  const deck=createQuestionDeck();deck.questions['realm0:0']=q;useGame.setState({phase:'menu'});useGame.getState().resetForNextStudent();useGame.setState({phase:'play',realm:0,step:0,questionDeck:deck,grades:{'realm0:0':{questionId:q.id,wrong:true,credit:null},'realm0:1':{questionId:deck.questions['realm0:1'].id,wrong:false,credit:1}}});const g=useGame.getState(),history=g.grades['realm0:1'];g.open();const next=useGame.getState().question!;assert.ok(!isDeletedSentence(next.sentence));assert.equal(useGame.getState().grades['realm0:0'].wrong,true);g.answer(next.answer);g.next();assert.equal(useGame.getState().grades['realm0:0'].credit,.5);assert.deepEqual(useGame.getState().grades['realm0:1'],history);
  for(const section of ['gems','blast'] as const){const key=`${section}:0`;useGame.setState({phase:'menu'});g.resetForNextStudent();useGame.setState({grades:{[key]:{questionId:q.id,wrong:true,credit:null}}});const replacement=g.ensureQuestions().questions[key];g.assignBonus(section,0,replacement.id);assert.ok(!isDeletedSentence(replacement.sentence));assert.equal(useGame.getState().grades[key].wrong,true);g.markGrade(section,0,replacement.id,true);g.markGrade(section,0,replacement.id,true);assert.equal(useGame.getState().grades[key].credit,.5)}
 }}finally{useGame.setState(previous)}
});
