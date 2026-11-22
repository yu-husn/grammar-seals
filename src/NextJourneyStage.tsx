import {journeySections,type SectionId} from './grading';
import {journeyOrder} from './journey';
export default function NextJourneyStage({realm,onAdvance}:{realm:number;onAdvance:()=>void}){
 const id=journeyOrder[journeyOrder.indexOf(`realm${realm}` as SectionId)+1],next=journeySections.find(s=>s.id===id)!;
 return <><p className="muted">下一站：{next.name}</p><button className="primary" onClick={onAdvance}>前往{next.name}</button></>;
}
