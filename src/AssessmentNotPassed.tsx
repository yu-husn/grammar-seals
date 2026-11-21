import {useEffect,useRef} from 'react';
import {ScoreCard} from './Assessment';
import {assessmentResult,formatScore,passingScore} from './grading';
import {useGame} from './store';

export default function AssessmentNotPassed(){
 const g=useGame(),result=assessmentResult(g.grades),heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>heading.current?.focus({preventScroll:true}),[]);
 const returnToEntry=()=>{g.setPhase('menu');requestAnimationFrame(()=>{const button=document.querySelector<HTMLButtonElement>('.student-reset-button');button?.scrollIntoView({block:'center'});button?.focus({preventScroll:true})})};
 return <div className="overlay ending"><section className="panel assessment-not-passed" role="dialog" aria-modal="true" aria-labelledby="assessment-not-passed-heading">
  <span className="eyebrow">本次練習完成 · 尚未通關</span>
  <h2 id="assessment-not-passed-heading" ref={heading} tabIndex={-1}>尚未達到通關門檻</h2>
  <p>通關須完成40題，總成績達{passingScore}分。{result.completed===40?`本次${formatScore(result.score)}分，還差${formatScore(result.needed)}分。`:`目前完成${result.completed}題，請完成整份成績卷。`}</p>
  <ScoreCard/>
  <p>本次成績與作答紀錄已保留。可先查看錯題解析，再回入口按「重新計分」，開始新的一輪練習。</p>
  <button className="primary" onClick={returnToEntry}>回入口重新計分</button><button onClick={()=>g.setPhase('teacher')}>查看錯題與練習</button>
 </section></div>;
}
