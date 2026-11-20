import {journeySections,type SectionId} from './grading';
import {journeyOrder} from './journey';
import {MissionChecklist} from './MissionBriefing';
export default function NextJourneyStage({realm,onAdvance}:{realm:number;onAdvance:()=>void}){
 const id=journeyOrder[journeyOrder.indexOf(`realm${realm}` as SectionId)+1],next=journeySections.find(s=>s.id===id)!;
 const supply=id==='gems'||id==='blast';
 return <><p className="muted">下一站：{next.name}<br/>{supply?'道具補給站：最多100點補給積分，可兌換符咒；不計學科成績。':`${next.count}題，每題2.5分，合計${next.points}分。`}</p><h3 className="next-mission-title">下一關任務</h3>{supply?<ol className="mission-tasks"><li><span>1</span><p>{id==='gems'?'交換相鄰寶石，連成三顆以上消除。':'瞄準符合句型的移動符石並射擊。'}</p></li><li><span>2</span><p>完成7次補給辨句，累積本站積分，最多100點。</p></li><li><span>3</span><p>疾風靴30點、縛魔索40點、逆時珠30點；兌換後帶往後續禁域與魔王戰。</p></li></ol>:<MissionChecklist realm={Number(id.slice(-1))}/>}<button className="primary" onClick={onAdvance}>前往{next.name}</button></>;
}
