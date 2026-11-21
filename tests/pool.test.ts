import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getPracticeQuestions} from '../src/questionPool';
import {comparisonAudit} from '../src/comparedQuestions';
import {useGame} from '../src/store';
test('刪除主語中心語題，保留同句的完整主語任務',()=>{const pool=getPracticeQuestions();assert.ok(pool.some(q=>q.id==='subject-full-01'));assert.ok(!pool.some(q=>q.id==='subject-head-01'));assert.ok(!pool.some(q=>q.reviewStatus==='待教師審核'));assert.equal(pool.length,191)});

test('教師刪除繁衍題，正式題庫及核准匯入的同句均不再抽出',()=>{
 const sentence='讓生命永無止境穿越時空的方法是繁衍。',removed=comparisonAudit.find(q=>q.sentence===sentence.slice(0,-1))!;
 assert.equal(removed.status,'已刪除');
 const copy={...getPracticeQuestions()[0],id:'imported-deleted-copy',sentence,reviewStatus:'教師已核准' as const};
 assert.ok(!getPracticeQuestions([copy]).some(q=>q.sentence===sentence));
});

test('舊補給存檔待答的刪除題可換題，保留補救與已計分紀錄',()=>{
 const removed=comparisonAudit.find(q=>q.sentence==='讓生命永無止境穿越時空的方法是繁衍')!;
 const g=useGame.getState();useGame.setState({grades:{'gems:0':{questionId:removed.id,wrong:true,credit:null}}});
 assert.equal(g.assignBonus('gems',0,'replacement'),'replacement');assert.equal(useGame.getState().grades['gems:0'].wrong,true);
 g.markGrade('gems',0,'replacement',true);assert.equal(useGame.getState().grades['gems:0'].credit,.5);
 useGame.setState({grades:{'blast:0':{questionId:removed.id,wrong:false,credit:1}}});g.assignBonus('blast',0,'replacement');assert.equal(useGame.getState().grades['blast:0'].questionId,removed.id);
});

test('刪除課堂第十九句並替換舊待答槽，不影響原有補救紀錄',()=>{
 const sentence='讀書養晦堂之西偏一室。';
 assert.ok(!getPracticeQuestions().some(q=>q.sentence===sentence));
 const imported={...getPracticeQuestions()[0],id:'imported-lesson19',sentence,reviewStatus:'教師已核准' as const};
 assert.ok(!getPracticeQuestions([imported]).some(q=>q.sentence===sentence));
 const g=useGame.getState();useGame.setState({grades:{'blast:2':{questionId:'teacher-lesson-19',wrong:true,credit:null}}});
 assert.equal(g.assignBonus('blast',2,'valid-replacement'),'valid-replacement');g.markGrade('blast',2,'valid-replacement',true);
 assert.equal(useGame.getState().grades['blast:2'].credit,.5);
});

test('刪除秋山紅葉題，核准匯入與舊待答槽均不能繼續抽用',()=>{
 const sentence='一路秋山紅葉，老圃黃花。',copy={...getPracticeQuestions()[0],id:'imported-lesson20',sentence,reviewStatus:'教師已核准' as const};
 assert.ok(!getPracticeQuestions([copy]).some(q=>q.sentence===sentence));
 const g=useGame.getState();useGame.setState({grades:{'gems:1':{questionId:'teacher-lesson-20',wrong:true,credit:null}}});
 assert.equal(g.assignBonus('gems',1,'replacement20'),'replacement20');g.markGrade('gems',1,'replacement20',true);assert.equal(useGame.getState().grades['gems:1'].credit,.5);
});

test('舊主語中心語待答槽換題仍保留補救紀錄，匯入相同ID不再進入題池',()=>{
 const g=useGame.getState();useGame.setState({grades:{'gems:3':{questionId:'subject-head-01',wrong:true,credit:null}}});
 assert.equal(g.assignBonus('gems',3,'replacement-head'),'replacement-head');g.markGrade('gems',3,'replacement-head',true);assert.equal(useGame.getState().grades['gems:3'].credit,.5);
 const full=getPracticeQuestions().find(q=>q.id==='subject-full-01')!;assert.ok(full);assert.ok(!getPracticeQuestions([{...full,id:'subject-head-01',reviewStatus:'教師已核准'}]).some(q=>q.id==='subject-head-01'));
});

test('刪除指定原創題，舊待答槽與匯入同句均排除',()=>{
 for(const [sentence,id] of [['這幅畫是山水畫。','original-2-11'],['這枚印章是敘事靈印。','original-2-18'],["他有一間書房。","original-3-24"],["房內無旁人。","original-3-21"],["門口有兩盞燈籠。","original-3-17"],["箱子裡沒有鑰匙。","original-3-13"],["這座建築是圖書館。","original-2-9"],["這張紙是通行證。","original-2-10"],["竹林茂密。","original-1-19"],["泉水冰涼。","original-1-21"],["石碑古老。","original-1-26"],["衣服乾淨。","original-1-28"],["這種動物是候鳥。","original-2-23"],["旅人點燃燈籠。","original-0-5"],["守衛推開城門。","original-0-4"],["弟弟閱讀小說。","original-0-1"],["小鳥飛翔。","original-0-0"],["妹妹整理書包。","original-0-8"],["工匠修補屋頂。","original-0-9"],["孩子撿起石子。","original-0-11"],["村民種植稻米。","original-0-12"],["商人收拾貨物。","original-0-14"],["書生抄寫文章。","original-0-15"],["父親修理桌子。","original-0-17"],["僧人敲響古鐘。","original-0-18"],["士兵守護城池。","original-0-19"],["女孩打開窗戶。","original-0-24"],["村長宣布消息。","original-0-27"],["樂師吹奏笛子。","original-0-29"],["這項活動是比賽。","original-2-28"],["這個故事是寓言。","original-2-29"],["這首作品是民謠。","original-2-22"],["這件衣服是雨衣。","original-2-21"],["這個容器是茶壺。","original-2-17"],["這座橋是石橋。","original-2-15"]]){const copy={...getPracticeQuestions()[0],id:'imported-landscape',sentence,reviewStatus:'教師已核准' as const};
 assert.ok(!getPracticeQuestions([copy]).some(q=>q.sentence===sentence||q.id===id));
 const g=useGame.getState();useGame.setState({grades:{'blast:4':{questionId:id,wrong:true,credit:null}}});
 assert.equal(g.assignBonus('blast',4,'replacement-landscape'),'replacement-landscape');g.markGrade('blast',4,'replacement-landscape',true);assert.equal(useGame.getState().grades['blast:4'].credit,.5);}
});
