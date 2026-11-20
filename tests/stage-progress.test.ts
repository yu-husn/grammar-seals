import './setup';
import {reachBoss} from './journeyHelpers';
import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from '../src/store';
import {stages,migratePassedStages} from '../src/stageProgress';
import {markAnswer} from '../src/grading';
beforeEach(()=>{useGame.setState({phase:'menu',passedStages:[],unlocked:0,save:null});useGame.getState().resetAssessment();useGame.getState().start()});
function solve(){const g=useGame.getState();g.open();g.answer(useGame.getState().question!.answer);g.next()}
test('六關為四域加寶石與轟擊，魔王另列；六道機關未全解或未離開不授予通關章',()=>{assert.equal(stages.length,6);assert.deepEqual(stages.map(s=>s.id),['realm0','gems','realm1','realm2','blast','realm3']);const g=useGame.getState();g.escape();assert.deepEqual(useGame.getState().passedStages,[]);for(let i=0;i<6;i++)solve();assert.deepEqual(useGame.getState().passedStages,[]);g.escape();assert.deepEqual(useGame.getState().passedStages,['realm0']);assert.deepEqual(JSON.parse(localStorage.getItem('grammar-seals-v1')!).state.passedStages,['realm0']);g.setPhase('menu');g.start();assert.deepEqual(useGame.getState().passedStages,['realm0'])});
test('六站與魔王分開蓋章，魔王不增加六站分母',()=>{reachBoss();const g=useGame.getState();for(let i=0;i<16;i++)solve();assert.ok(!useGame.getState().passedStages.includes('boss'));g.escape();assert.ok(useGame.getState().passedStages.includes('boss'));assert.equal(stages.filter(s=>useGame.getState().passedStages.includes(s.id)).length,6)});
test('主線試煉須七題補救或首答成功才通關，重答不重複章；開新成績卷保留通關紀錄',()=>{const g=useGame.getState();for(const mode of ['gems','blast'] as const){for(let i=0;i<6;i++)g.markGrade(mode,i,`${mode}-${i}`,true);g.markGrade(mode,6,`${mode}-6`,false);assert.ok(!useGame.getState().passedStages.includes(mode));g.markGrade(mode,6,`${mode}-6`,true);g.markGrade(mode,6,`${mode}-6`,true);assert.equal(useGame.getState().passedStages.filter(s=>s===mode).length,1)}g.setPhase('teacher');g.resetAssessment();assert.deepEqual(useGame.getState().passedStages,['gems','blast'])});
test('第五版遷移保留已證明的四域與七題加分章，不將解鎖魔王或十六題分數冒充魔王封印',async()=>{let grades={};for(const id of ['gems','realm4'] as const)for(let i=0;i<(id==='gems'?7:16);i++)grades=markAnswer(grades,id,i,`${id}-${i}`,true).book;const result=await useGame.persist.getOptions().migrate!({unlocked:4,grades,passedStages:['bogus','realm0','realm0']},5);assert.deepEqual(result.passedStages,['realm0','realm1','realm2','realm3','gems']);assert.ok(!result.passedStages.includes('boss'));assert.equal(migratePassedStages(null,0,{}).length,0)});
