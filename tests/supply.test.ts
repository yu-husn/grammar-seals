import './setup';
import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from '../src/store';
import {creditSupply,freshSupplyBanks,normalizeSupplyBanks,normalizeSupplySnapshot,supplyCosts} from '../src/supply';
import {formatScore,gradeSummary,markAnswer,itemInfo,itemOrder,freshItems} from '../src/grading';
beforeEach(()=>useGame.setState({phase:'gems',realm:0,journeyCleared:['realm0'],supplyBanks:freshSupplyBanks(),items:{step:0,shadow:0,time:0,strike:1,aegis:1,heal:1},grades:{},timeUsed:[],slowSeconds:0}));

test('兩補給站六種新價位都可用恰好足額積分購買，餘額不足不超扣且說明一致',()=>{
 const expected={step:10,shadow:15,time:15,strike:20,aegis:25,heal:20};assert.deepEqual(supplyCosts,expected);
 for(const section of ['gems','blast'] as const)for(const id of itemOrder){
  const price=expected[id],g=useGame.getState();useGame.setState({phase:section,journeyCleared:['realm0','gems','realm1','realm2'],supplyBanks:{...freshSupplyBanks(),[section]:{earned:price,spent:0,claims:['earned']}},items:{...freshItems(),[id]:99}});
  assert.ok(itemInfo[id].description.includes(`${price}點兌換`));assert.equal(g.buySupplyItem(section,id),true);assert.equal(useGame.getState().items[id],100);assert.equal(useGame.getState().supplyBanks[section].spent,price);assert.equal(useGame.getState().supplyBanks[section].earned,price);assert.equal(g.buySupplyItem(section,id),false);assert.equal(useGame.getState().items[id],100);assert.equal(useGame.getState().supplyBanks[section].spent,price);assert.equal(gradeSummary(useGame.getState().grades).score,0);
 }
});

test('舊版已支出積分與道具不回溯折價，載入後只按新價格扣除新增購買',()=>{
 const old=normalizeSupplyBanks({gems:{earned:100,spent:40,claims:['previous']}}),g=useGame.getState();useGame.setState({supplyBanks:old,items:{...freshItems(),strike:3}});
 assert.equal(g.buySupplyItem('gems','strike'),true);assert.equal(useGame.getState().supplyBanks.gems.spent,60);assert.equal(useGame.getState().items.strike,4);assert.deepEqual(useGame.getState().supplyBanks.gems.claims,['previous']);
});

test('舊定身符欄位移除，仍保留射擊進度、連擊、時間與暫停狀態',()=>{
 const snapshot=normalizeSupplySnapshot({seconds:123,answered:3,score:22,combo:3,questionId:'retained',stage:'paused',powers:8,frozen:5})!;
 assert.equal('powers' in snapshot,false);assert.equal('frozen' in snapshot,false);
 assert.equal(snapshot.seconds,123);assert.equal(snapshot.answered,3);assert.equal(snapshot.combo,3);assert.equal(snapshot.stage,'paused');assert.equal(snapshot.questionId,'retained');
});
test('每站最多100積分，同一消除／辨句來源只領一次，花掉不重置上限',()=>{const g=useGame.getState();assert.equal(g.awardSupplyPoints('gems','move:0:0',30),30);assert.equal(g.awardSupplyPoints('gems','move:0:0',30),0);g.awardSupplyPoints('gems','move:0:1',90);assert.equal(useGame.getState().supplyBanks.gems.earned,100);assert.ok(g.buySupplyItem('gems','step'));assert.equal(useGame.getState().supplyBanks.gems.spent,10);assert.equal(g.awardSupplyPoints('gems','move:1:0',10),0);assert.equal(useGame.getState().supplyBanks.gems.earned-useGame.getState().supplyBanks.gems.spent,90)});
test('10／15／15點兌換共用道具，積分不足與重複點擊皆不超扣',()=>{const g=useGame.getState();assert.equal(g.buySupplyItem('gems','step'),false);g.awardSupplyPoints('gems','earned',40);assert.ok(g.buySupplyItem('gems','step'));assert.ok(g.buySupplyItem('gems','shadow'));assert.ok(g.buySupplyItem('gems','time'));assert.equal(g.buySupplyItem('gems','time'),false);assert.deepEqual(useGame.getState().items,{step:1,shadow:1,time:1,strike:1,aegis:1,heal:1});assert.equal(useGame.getState().supplyBanks.gems.spent,40);assert.equal(gradeSummary(useGame.getState().grades).score,0);const saved=JSON.parse(localStorage.getItem('grammar-seals-v1')!).state;assert.equal(saved.supplyBanks.gems.spent,40)});
test('兩站帳本獨立，離開補給站不能遠端換道具，新卷會重設積分與背包',()=>{const g=useGame.getState();g.awardSupplyPoints('gems','one',100);useGame.setState({phase:'play'});assert.equal(g.buySupplyItem('gems','step'),false);assert.equal(g.awardSupplyPoints('gems','two',50),0);useGame.setState({phase:'blast',journeyCleared:['realm0','gems','realm1','realm2']});g.awardSupplyPoints('blast','one',40);assert.equal(useGame.getState().supplyBanks.blast.earned,40);assert.equal(useGame.getState().supplyBanks.gems.earned,100);g.setPhase('teacher');g.resetAssessment();assert.deepEqual(useGame.getState().supplyBanks,freshSupplyBanks());assert.deepEqual(useGame.getState().items,{step:0,shadow:0,time:0,strike:1,aegis:1,heal:1})});
test('可以兌換第三件，已兌換道具可用於後續禁域而不改學科分數',()=>{const g=useGame.getState();g.awardSupplyPoints('gems','earned',100);g.buySupplyItem('gems','time');g.buySupplyItem('gems','time');assert.equal(g.buySupplyItem('gems','time'),true);assert.equal(useGame.getState().supplyBanks.gems.spent,45);useGame.setState({phase:'play',realm:1,seconds:100});g.configure({countdown:true});g.useItem('time');assert.equal(useGame.getState().seconds,110);assert.equal(useGame.getState().items.time,2);assert.equal(gradeSummary(useGame.getState().grades).score,0)});
test('積分與學科成績分開，補救1.25分保留兩位小數、不提早四捨五入',()=>{const g=useGame.getState();for(let i=0;i<7;i++)g.markGrade('gems',i,`g${i}`,true);g.completeChallenge('gems');assert.equal(gradeSummary(useGame.getState().grades).completed,0);assert.equal(gradeSummary(useGame.getState().grades).score,0);let book=markAnswer({},'realm0',0,'a',false).book;book=markAnswer(book,'realm0',0,'a',true).book;assert.equal(gradeSummary(book).score,1.25);assert.equal(formatScore(1.25),'1.25');assert.equal(formatScore(2.5),'2.5');assert.equal(formatScore(100),'100')});
test('載入時積分與支出限制為0至100，保留領取紀錄避免重載重複領取',()=>{const banks=normalizeSupplyBanks({gems:{earned:150,spent:130,claims:['a','a']},blast:{earned:-1,spent:40,claims:[]}});assert.deepEqual(banks.gems,{earned:100,spent:100,claims:['a']});assert.deepEqual(banks.blast,{earned:0,spent:0,claims:[]});assert.equal(creditSupply(banks.gems,'a',30),banks.gems)});
