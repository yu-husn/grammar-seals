import {useGame} from '../src/store';
import {realmLength} from '../src/campaign';
import {journeyOrder} from '../src/journey';
export function solveCurrent(){const g=useGame.getState();g.open();g.answer(useGame.getState().question!.answer);g.next()}
export function reachBoss(){const g=useGame.getState();for(const id of journeyOrder.slice(0,-1)){if(id==='gems'||id==='blast'){g.enterChallenge(id);for(let i=0;i<7;i++)g.markGrade(id,i,`${id}-${i}`,true);g.completeChallenge(id);g.setPhase('menu')}else{const realm=Number(id.slice(-1));g.start(false,realm);for(let i=0;i<realmLength(realm);i++)solveCurrent();g.escape();g.setPhase('menu')}}g.start(false,4)}
