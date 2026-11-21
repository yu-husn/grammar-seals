import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bank} from '../src/questions';
import {subjectChallenges} from '../src/subjectChallenges';
import {getPracticeQuestions} from '../src/questionPool';
import {deletedQuestionIds,isDeletedSentence} from '../src/comparedQuestions';
import {createQuestionDeck,isQuestionDeck} from '../src/questionDeck';
import {sentenceKey} from '../src/bossQuestions';
import {useGame} from '../src/store';

const sentences=['請推開城門','石階濕滑','天空晴朗','花朵鮮豔','道路寬闊','城牆高大','茶水滾燙','風聲尖銳','腳步聲急促','空氣潮濕','視線模糊','晚霞絢麗','寶庫裡有一枚靈印','村中有一位醫師','山上有一座古寺','村裡沒有學校'];
const removed=[...bank,...subjectChallenges].filter(q=>sentences.includes(sentenceKey(q.sentence)));
test('指定16題與同句匯入排除，包含省略主語題，175題池仍可產生54道不重複題卷',()=>{
 assert.equal(removed.length,16);assert.equal(removed.filter(q=>q.category==='表態句').length,11);assert.equal(removed.filter(q=>q.category==='有無句').length,4);const pool=getPracticeQuestions();assert.equal(pool.length,175);assert.ok(!pool.some(q=>q.id==='subject-omitted-01'));
 for(const q of removed){assert.ok(deletedQuestionIds.includes(q.id));assert.ok(isDeletedSentence(q.sentence));assert.ok(!pool.some(p=>p.id===q.id));const copy={...q,id:'import-'+q.id,sentence:`「${q.sentence.replace('。','')}！」`,reviewStatus:'教師已核准' as const};assert.ok(!getPracticeQuestions([copy]).some(p=>p.id===copy.id))}
 for(let seed=1;seed<=30;seed++){let n=seed;const deck=createQuestionDeck({},()=>((n=(n*1664525+1013904223)>>>0)/2**32)),rows=Object.values(deck.questions);assert.ok(isQuestionDeck(deck));assert.equal(rows.length,54);assert.equal(new Set(rows.map(q=>sentenceKey(q.sentence))).size,54);assert.ok(rows.every(q=>!isDeletedSentence(q.sentence)))}
});
test('16道舊待補救題在主線與兩站均能換題，保留半分旗標和已計分紀錄',()=>{
 const previous=useGame.getState();try{for(const q of removed){
  const deck=createQuestionDeck();deck.questions['realm0:0']=q;useGame.setState({phase:'menu'});useGame.getState().resetForNextStudent();useGame.setState({phase:'play',realm:0,step:0,questionDeck:deck,grades:{'realm0:0':{questionId:q.id,wrong:true,credit:null},'realm0:1':{questionId:deck.questions['realm0:1'].id,wrong:false,credit:1}}});const g=useGame.getState(),history=g.grades['realm0:1'];g.open();const next=useGame.getState().question!;assert.ok(!isDeletedSentence(next.sentence));assert.equal(useGame.getState().grades['realm0:0'].wrong,true);g.answer(next.answer);g.next();assert.equal(useGame.getState().grades['realm0:0'].credit,.5);assert.deepEqual(useGame.getState().grades['realm0:1'],history);
  for(const section of ['gems','blast'] as const){const key=`${section}:0`;useGame.setState({phase:'menu'});g.resetForNextStudent();useGame.setState({grades:{[key]:{questionId:q.id,wrong:true,credit:null}}});const replacement=g.ensureQuestions().questions[key];g.assignBonus(section,0,replacement.id);assert.ok(!isDeletedSentence(replacement.sentence));assert.equal(useGame.getState().grades[key].wrong,true);g.markGrade(section,0,replacement.id,true);g.markGrade(section,0,replacement.id,true);assert.equal(useGame.getState().grades[key].credit,.5)}
 }}finally{useGame.setState(previous)}
});
