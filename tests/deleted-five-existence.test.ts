import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bank} from '../src/questions';
import {getPracticeQuestions} from '../src/questionPool';
import {isDeletedSentence,deletedQuestionIds} from '../src/comparedQuestions';
import {createQuestionDeck,isQuestionDeck} from '../src/questionDeck';
import {sentenceKey} from '../src/bossQuestions';
import {useGame} from '../src/store';

const removed=bank.filter(q=>['original-3-25','original-3-26','original-3-27','original-3-28','original-3-29'].includes(q.id));
test('指定第214至218題全數排除，同句核准匯入和標點變體亦不能重新出題',()=>{
 assert.equal(removed.length,5);const pool=getPracticeQuestions();assert.equal(pool.length,191);
 for(const q of removed){assert.ok(deletedQuestionIds.includes(q.id));assert.ok(isDeletedSentence(q.sentence));assert.ok(!pool.some(p=>p.id===q.id));const copy={...q,id:'import-'+q.id,sentence:`「${q.sentence.replace('。','')}！」`,reviewStatus:'教師已核准' as const};assert.ok(!getPracticeQuestions([copy]).some(p=>p.id===copy.id))}
 for(let seed=1;seed<=20;seed++){let n=seed;const deck=createQuestionDeck({},()=>((n=(n*1664525+1013904223)>>>0)/2**32));assert.ok(isQuestionDeck(deck));const rows=Object.values(deck.questions);assert.equal(rows.length,54);assert.equal(new Set(rows.map(q=>sentenceKey(q.sentence))).size,54);assert.ok(rows.every(q=>!isDeletedSentence(q.sentence)))}
});

test('舊卷刪題僅更換題目，保留已計分、作答紀錄、道具及待補救的半分規則',()=>{
 const previous=useGame.getState();try{
  const deck=createQuestionDeck(),slots=['realm0:0','realm0:1','gems:0','blast:0','realm3:0'];removed.forEach((q,i)=>deck.questions[slots[i]]={...q});assert.equal(isQuestionDeck(deck),false);
  const grades={'realm0:0':{questionId:removed[0].id,wrong:true,credit:null},'realm0:1':{questionId:removed[1].id,wrong:false,credit:1}} as const;
  useGame.setState({questionDeck:deck,grades,phase:'play',realm:0,step:0,question:null,feedback:null,selected:null,save:null,journeyCleared:[],review:[]});const before=useGame.getState(),records=before.records,items=before.items;
  const renewed=before.ensureQuestions();assert.ok(isQuestionDeck(renewed));assert.ok(Object.values(renewed.questions).every(q=>!isDeletedSentence(q.sentence)));assert.deepEqual(useGame.getState().grades,grades);assert.deepEqual(useGame.getState().records,records);assert.deepEqual(useGame.getState().items,items);
  before.open();const q=useGame.getState().question!;assert.ok(!isDeletedSentence(q.sentence));assert.equal(useGame.getState().grades['realm0:0'].questionId,q.id);assert.equal(useGame.getState().grades['realm0:0'].wrong,true);before.answer(q.answer);before.next();assert.equal(useGame.getState().grades['realm0:0'].credit,.5);assert.deepEqual(useGame.getState().grades['realm0:1'],grades['realm0:1']);
 }finally{useGame.setState(previous)}
});

test('兩個補給站舊待答刪題可更換，不清除補救旗標或重複計分',()=>{
 const previous=useGame.getState();try{for(const q of removed)for(const section of ['gems','blast'] as const){const key=`${section}:0`;useGame.setState({phase:'menu'});useGame.getState().resetForNextStudent();useGame.setState({grades:{[key]:{questionId:q.id,wrong:true,credit:null}}});const g=useGame.getState(),replacement=g.ensureQuestions().questions[key];assert.ok(!isDeletedSentence(replacement.sentence));g.assignBonus(section,0,replacement.id);assert.equal(useGame.getState().grades[key].wrong,true);g.markGrade(section,0,replacement.id,true);assert.equal(useGame.getState().grades[key].credit,.5);g.markGrade(section,0,replacement.id,true);assert.equal(useGame.getState().grades[key].credit,.5)}}finally{useGame.setState(previous)}
});
