import {getPracticeQuestions} from './questionPool';
import {useEffect,useRef,useState} from 'react';
import {journeySections,type SectionId} from './grading';
import type {Category} from './questions';
import {grammarReview,reviewFocus} from './grammarReviewContent';
export function QuestionBankLink(){return <a className="question-bank-entry" href="/question-bank/index.html" target="_blank" rel="noreferrer"><strong>查看完整題庫 · {getPracticeQuestions().length}題</strong><small>題目、答案、解析與可確認的基測年代題號</small></a>}
export default function GrammarReview({section,onContinue,onClose}:{section:SectionId;onContinue:()=>void;onClose:()=>void}){
 const focus=reviewFocus(section),[selected,setSelected]=useState<Category>(focus??'敘事句'),heading=useRef<HTMLHeadingElement>(null),detail=grammarReview.find(r=>r.category===selected)!,stage=journeySections.find(s=>s.id===section)!;
 useEffect(()=>{heading.current?.focus({preventScroll:true});const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape)},[onClose]);
 return <div className="overlay grammar-review-overlay"><section className="panel grammar-review" role="dialog" aria-modal="true" aria-labelledby="grammar-review-heading" data-review-stage={section}>
  <header><span className="eyebrow">{stage.name} · 四大句型混合挑戰</span><h2 id="grammar-review-heading" tabIndex={-1} ref={heading}>進關前 · 句型結構複習</h2><p>每關均混合四大句型，關卡名稱不代表答案。先找主要述謂關係，再判斷句型；點選下面的句型查看例句拆解。</p></header>
  <div className="grammar-formula-list" role="group" aria-label="四大句型結構">{grammarReview.map(r=><button key={r.category} type="button" aria-pressed={selected===r.category} aria-controls="grammar-review-example" onClick={()=>setSelected(r.category)}><strong>{r.category}</strong><span>{r.structure}</span>{focus===r.category&&<em>場景靈印</em>}</button>)}</div>
  <section id="grammar-review-example" className="grammar-example" aria-label={`${selected}例句拆解`} aria-live="polite"><div className="grammar-example-heading"><h3>{selected}</h3><b>{detail.question}</b></div><p className="grammar-example-sentence">{detail.sentence}</p><div className="grammar-segments" aria-label="句子成分">{detail.segments.map((part,i)=><span className="grammar-part-wrap" key={part.text}>{i>0&&<span className="grammar-plus" aria-hidden="true">＋</span>}<span className="grammar-part"><b>{part.text}</b><small>{part.role}</small></span></span>)}</div><p>{detail.explanation}</p><p className="grammar-reminder">{detail.reminder}</p><p className="grammar-trap"><b>辨識提醒：</b>{detail.trap}</p></section>
  <p className="grammar-common-note">括號表示可省略的成分；遇到省略或倒裝，先還原語意再分析。不能只靠「有、無、是」單一字詞判斷。遊戲代號：A 敘事、B 有無、C 判斷、D 表態。</p><QuestionBankLink/>
  <footer className="grammar-review-footer"><p role="status">複習期間不倒數、不受攻擊，也不計成績。</p><div><button className="primary" onClick={onContinue}>複習完成，繼續</button><button onClick={onClose}>返回主選單</button></div></footer>
 </section></div>;
}
