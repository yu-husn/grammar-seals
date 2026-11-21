import './setup';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assessmentSections,assessmentResult,passingScore,type GradeBook} from '../src/grading';
import {useGame} from '../src/store';
import {journeyOrder} from '../src/journey';
import {stages} from '../src/stageProgress';

function book(firstCorrect:number):GradeBook{let i=0;return Object.fromEntries(assessmentSections.flatMap(s=>Array.from({length:s.count},(_,n)=>{const full=i++<firstCorrect;return [`${s.id}:${n}`,{questionId:`pass-test-${s.id}-${n}`,wrong:!full,credit:full?1:.5}]})))}
function finalState(grades:GradeBook){useGame.setState({phase:'play',realm:4,step:16,bossHP:0,seals:[0,1,2,3],journeyCleared:journeyOrder.slice(0,-1),passedStages:stages.map(s=>s.id),grades,question:null,save:{version:4,realm:4,step:16,seals:[0,1,2,3],hp:30,seconds:150,mistakes:24,combo:1,cleared:false}})}

test('滿40題且70分才達標：68.75未過、70剛好過、71.25通過，補給不計分',()=>{
 assert.equal(passingScore,70);for(const [n,score,passed]of [[15,68.75,false],[16,70,true],[17,71.25,true]] as const){const result=assessmentResult(book(n));assert.equal(result.completed,40);assert.equal(result.score,score);assert.equal(result.passed,passed)}
 const low=book(15);for(const section of ['gems','blast'])for(let i=0;i<7;i++)low[`${section}:${i}`]={questionId:'bonus',wrong:false,credit:1};assert.equal(assessmentResult(low).score,68.75);assert.equal(assessmentResult(low).passed,false);
 const unfinished=book(40);delete unfinished['realm0:0'];assert.equal(assessmentResult(unfinished).score,97.5);assert.equal(assessmentResult(unfinished).passed,false);
});

test('魔王生命歸零但未達70分只顯示未達標，保留成績且不授予魔王通關',()=>{
 const previous=useGame.getState();try{const grades=book(15);finalState(grades);useGame.getState().escape();const g=useGame.getState();assert.equal(g.phase,'notPassed');assert.equal(g.save,null);assert.deepEqual(g.grades,grades);assert.equal(g.journeyCleared.includes('realm4'),false);assert.equal(g.passedStages.includes('boss'),false)}finally{useGame.setState(previous)}
});

test('70分完成40題可正常封印，缺一題即使高分也不授予通關',()=>{
 const previous=useGame.getState();try{finalState(book(16));useGame.getState().escape();assert.equal(useGame.getState().phase,'win');assert.ok(useGame.getState().journeyCleared.includes('realm4'));assert.ok(useGame.getState().passedStages.includes('boss'));const incomplete=book(40);delete incomplete['realm0:0'];finalState(incomplete);useGame.getState().escape();assert.equal(useGame.getState().phase,'notPassed');assert.equal(useGame.getState().passedStages.includes('boss'),false)}finally{useGame.setState(previous)}
});

test('第15版低分舊通關撤回本卷魔王標記，成績、作答、道具與教師設定均保留',async()=>{
 const grades=book(15),raw={grades,journeyCleared:[...journeyOrder],passedStages:[...stages.map(s=>s.id),'boss'],unlocked:4,items:{step:5,shadow:6,time:7,strike:8,aegis:9,heal:10},records:[{id:'retained',category:'敘事句',sentence:'原紀錄',correct:true,explanation:'原解析',time:'now'}],settings:{audio:false,quality:'低'},save:null};
 const result=await useGame.persist.getOptions().migrate!(raw,15);assert.equal(result.journeyCleared!.includes('realm4'),false);assert.equal(result.passedStages!.includes('boss'),false);assert.equal(result.passedStages!.length,6);assert.deepEqual(result.grades,raw.grades);assert.deepEqual(result.records,raw.records);assert.deepEqual(result.items,raw.items);assert.equal(result.settings!.audio,false);
 const passed=await useGame.persist.getOptions().migrate!({...raw,grades:book(16)},15);assert.ok(passed.journeyCleared!.includes('realm4'));assert.ok(passed.passedStages!.includes('boss'));
});

test('未達標的已完成成績卷不能靠重入魔王或重答刷分，必須另開新卷',()=>{
 const previous=useGame.getState();try{finalState(book(15));useGame.setState({phase:'menu',unlocked:4});const g=useGame.getState(),before=useGame.getState().grades;g.start(false,4);assert.equal(useGame.getState().phase,'notPassed');assert.deepEqual(useGame.getState().grades,before);g.markGrade('realm0',0,before['realm0:0'].questionId,true);assert.equal(assessmentResult(useGame.getState().grades).score,68.75);g.setPhase('menu');g.resetForNextStudent();assert.equal(assessmentResult(useGame.getState().grades).score,0);assert.equal(useGame.getState().journeyCleared.length,0)}finally{useGame.setState(previous)}
});
