import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createQuestionDeck,isQuestionDeck,questionSlots} from '../src/questionDeck';
import {bossQuestions,isBossQuestion,sentenceKey} from '../src/bossQuestions';
import {answerChoices,validateQuestion} from '../src/questions';
import {isUserAddedQuestion,uniqueQuestionSentences} from '../src/questionPriority';
import {getPracticeQuestions} from '../src/questionPool';
import {useGame} from '../src/store';
import {gradeSummary} from '../src/grading';
const seeded=(seed:number)=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};

test('五十種隨機種子：54題以句子去重，四域各六題含四類，魔王題與其他站分開',()=>{
 for(let seed=0;seed<50;seed++){
  const deck=createQuestionDeck({},seeded(seed)),rows=Object.values(deck.questions);assert.equal(rows.length,54);assert.equal(new Set(rows.map(q=>sentenceKey(q.sentence))).size,54);assert.ok(isQuestionDeck(deck));
  for(const [key,q] of Object.entries(deck.questions)){assert.deepEqual(validateQuestion(q),[]);assert.equal(isBossQuestion(q),key.startsWith('realm4:'));if(q.kind!=='解剖')assert.equal(q.options[q.answer],q.category);else assert.ok(q.explanation.includes(q.options[q.answer]))}
  for(let r=0;r<4;r++){const main=Array.from({length:6},(_,i)=>deck.questions[`realm${r}:${i}`]);assert.deepEqual([...new Set(main.filter(q=>q.kind!=='解剖').map(q=>q.category))].sort(),[...answerChoices].sort());assert.ok(main.some(q=>q.kind==='解剖')||r===3);assert.ok(main.every(isUserAddedQuestion),'四域優先採直接新增題')}
  assert.equal(Array.from({length:6},(_,i)=>deck.questions[`realm4:${i+10}`]).filter(q=>q.kind==='解剖').length,5);
 }
});
test('不同種子會抽出不同句子與順序，不只是重排固定主線題組',()=>{
 const a=createQuestionDeck({},seeded(1)),b=createQuestionDeck({},seeded(2));assert.notDeepEqual(a,b);const main=(d:typeof a)=>new Set(Object.entries(d.questions).filter(([k])=>/^realm[0-3]:/.test(k)).map(([,q])=>sentenceKey(q.sentence)));assert.notDeepEqual(main(a),main(b));
});

test('舊卷魔王護盾提示改成生命值，保留所有題目答案、成績與續玩進度',async()=>{
 const previous=useGame.getState();try{
  const deck=createQuestionDeck({},seeded(25)),key=Object.keys(deck.questions).find(key=>key.startsWith('realm4:')&&deck.questions[key].stem.includes('削減無言君生命值'))!;
  assert.ok(key);deck.questions[key].stem=deck.questions[key].stem.replace('削減無言君生命值','擊破無言君護盾');
  const before=JSON.parse(JSON.stringify(deck)),grades={[key]:{questionId:deck.questions[key].id,wrong:true,credit:null}},save={version:4 as const,realm:4,step:10,seals:[0,1,2,3],hp:70,seconds:123,mistakes:1,combo:2,cleared:false};
  useGame.setState({phase:'menu',questionDeck:deck,grades,save});const updated=useGame.getState().ensureQuestions();
  assert.notEqual(updated,deck);assert.ok(deck.questions[key].stem.includes('護盾'),'不改動原題卷物件');assert.ok(updated.questions[key].stem.includes('削減無言君生命值'));
  for(const slot of questionSlots){const {stem:oldStem,...oldQuestion}=before.questions[slot],{stem:newStem,...newQuestion}=updated.questions[slot];assert.deepEqual(newQuestion,oldQuestion);if(slot!==key)assert.equal(newStem,oldStem)}
  assert.deepEqual(useGame.getState().grades,grades);assert.deepEqual(useGame.getState().save,save);assert.equal(useGame.getState().ensureQuestions(),updated);
  await useGame.persist.rehydrate();assert.equal(useGame.getState().questionDeck!.questions[key].stem,updated.questions[key].stem);assert.deepEqual(useGame.getState().save,save);
  assert.ok(bossQuestions.every(q=>!/護盾|破盾/u.test(q.stem)));
 }finally{useGame.setState(previous)}
});
test('已有成績、補救題和舊未答題會固定，未來新題避開歷史句子',()=>{
 const grades={'realm0:0':{questionId:'teacher-narrative-exam-reading',wrong:false,credit:1 as const},'gems:0':{questionId:'teacher-attribute-first-love',wrong:true,credit:null}},d=createQuestionDeck({grades,current:{realm:0,step:1}},seeded(3));assert.equal(d.questions['realm0:0'].id,grades['realm0:0'].questionId);assert.equal(d.questions['realm0:1'].id,'teacher-narrative-mother-care');assert.ok(!Object.entries(d.questions).filter(([k])=>k!=='realm0:0').some(([,q])=>q.id===grades['realm0:0'].questionId));assert.equal(d.questions['gems:0'].id===grades['gems:0'].questionId,false,'舊魔王保留句不再出補給站');
});
test('題卷持久化、續玩與重試不換題，補救仍半分；新卷才重新隨機',async()=>{
 const previous=useGame.getState();try{
  useGame.setState({phase:'menu'});useGame.getState().resetAssessment();useGame.getState().start();const initial=JSON.stringify(useGame.getState().questionDeck);const g=useGame.getState();g.open();const q=useGame.getState().question!;g.answer((q.answer+1)%q.options.length);g.next();assert.equal(useGame.getState().question!.id,q.id);g.setPhase('pause');g.setPhase('menu');await useGame.persist.rehydrate();g.start(true);g.open();assert.equal(useGame.getState().question!.id,q.id);g.answer(q.answer);g.next();assert.equal(gradeSummary(useGame.getState().grades).score,1.25);g.retry();g.open();assert.equal(useGame.getState().question!.id,q.id);assert.equal(JSON.stringify(useGame.getState().questionDeck),initial);
  g.setPhase('menu');g.resetAssessment();assert.equal(useGame.getState().questionDeck,null);g.start();assert.notEqual(JSON.stringify(useGame.getState().questionDeck),initial);
 }finally{useGame.setState(previous)}
});
test('兩補給站取用全卷預留題，重新取題不重抽、不跨站重複',()=>{
 const previous=useGame.getState();try{useGame.setState({phase:'menu'});useGame.getState().resetAssessment();const g=useGame.getState(),d=g.ensureQuestions(),ids=[];for(const s of ['gems','blast'] as const)for(let i=0;i<7;i++){const q=g.assignedQuestion(s,i);assert.equal(q.id,d.questions[`${s}:${i}`].id);assert.deepEqual(g.assignedQuestion(s,i),q);ids.push(sentenceKey(q.sentence))}assert.equal(new Set(ids).size,14);assert.equal(questionSlots.length,54)}finally{useGame.setState(previous)}
});
test('第14版舊卷遷移保留時間、題號、成績及道具，首次續玩才建立未來題目',async()=>{
 const previous=useGame.getState();try{
  const raw={grades:{'realm0:0':{questionId:'teacher-narrative-exam-reading',wrong:true,credit:null}},save:{version:4 as const,realm:0,step:0,seals:[],hp:70,seconds:123,mistakes:1,combo:0,cleared:false},items:{step:9,shadow:8,time:7,strike:6,aegis:5,heal:4},journeyCleared:[],settings:{seconds:200}};
  const migrated=await useGame.persist.getOptions().migrate!(raw,14);assert.equal(migrated.questionDeck,null);assert.deepEqual(migrated.grades,raw.grades);assert.deepEqual(migrated.items,raw.items);useGame.setState({...migrated,phase:'menu'});useGame.getState().start(true);useGame.getState().open();assert.equal(useGame.getState().question!.id,raw.grades['realm0:0'].questionId);assert.equal(useGame.getState().seconds,123);assert.equal(useGame.getState().hp,70);assert.ok(isQuestionDeck(useGame.getState().questionDeck));assert.deepEqual(useGame.getState().grades,raw.grades);
 }finally{useGame.setState(previous)}
});
test('自主練習以句子去重，主語分析與辨識的同句變體不重複抽出',()=>{
 const pool=getPracticeQuestions(),unique=uniqueQuestionSentences(pool);assert.equal(new Set(unique.map(q=>sentenceKey(q.sentence))).size,unique.length);assert.ok(unique.every(q=>pool.includes(q)));for(const c of answerChoices)assert.ok(unique.filter(q=>q.category===c).length>=30);
});
