import {journeySections,type SectionId} from './grading';
import {canEnterSection,nextJourneySection} from './journey';
import {useGame} from './store';

const themes=['敘事之境','道具補給站','表態之境','判斷之境','道具補給站','有無之境','最終魔王'];
export default function CampaignRoute({onEnter}:{onEnter:(section:SectionId)=>void}){
 const cleared=useGame(s=>s.journeyCleared),next=nextJourneySection(cleared);
 return <section className="campaign-route full-campaign" aria-labelledby="campaign-route-heading"><h2 id="campaign-route-heading">七關主線 · 40題計分 · 每題2.5分</h2><ol>{journeySections.map((s,i)=>{const done=cleared.includes(s.id),available=canEnterSection(cleared,s.id);return <li key={s.id} className={done?'cleared':available?'available':'locked'} data-route-stage={s.id} data-unlocked={available}><button disabled={!available} onClick={()=>onEnter(s.id)}><span className="route-number">{i+1}</span><div><b>{s.name}</b><small>{themes[i]} · {s.points?`${s.count}題／${s.points}分`:'限玩一次／最多100點'}</small><small>{done?(s.id==='gems'||s.id==='blast'?'本卷已結束 · 查看兌換':'已通過 · 可重訪'):s.id===next?'目前任務':'待解鎖'}</small></div></button></li>})}</ol><p>兩個補給站每卷各限一局，合計最多200點；尚未結束可續玩同一局。</p><p>行跡 → 寶石補給 → 幻象 → 審判 → 轟擊補給 → 虛實 → 魔王</p></section>;
}
