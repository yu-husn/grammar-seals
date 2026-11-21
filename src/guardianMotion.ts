import type {GuardianVariant} from './guardianDesigns';

export const guardianMotionProfiles = {
  shadow: {pattern:'fore-aft', label:'前後踱步', maxRise:.05},
  mirror: {pattern:'hover-sideways', label:'左右飄移', maxRise:.3},
  judge: {pattern:'hopping', label:'上下跳動', maxRise:.95},
  vault: {pattern:'heavy-sideways', label:'左右巡守', maxRise:.04},
} as const;

/** Visual offsets stay separate from the ground position used by gates and combat. */
export function guardianPose(variant:GuardianVariant,seconds:number,rank=0,reducedMotion=false){
  const t=seconds,phase=rank*.83;
  if(reducedMotion)return {x:0,y:variant==='mirror'?.2:0,z:0,roll:0,pitch:0};
  switch(variant){
    case 'shadow':{
      const stride=Math.sin(t*3.6+phase);
      return {x:0,y:Math.abs(stride)*.04,z:stride*.44,roll:stride*.025,pitch:stride*.065};
    }
    case 'mirror':return {x:Math.sin(t*1.75+phase)*.64,y:.2+Math.sin(t*1.25+phase)*.1,z:0,roll:Math.sin(t*1.75+phase)*.045,pitch:0};
    case 'judge':{
      const lift=Math.pow(Math.max(0,Math.sin(t*5.2+phase)),1.3);
      return {x:0,y:lift*.95,z:0,roll:0,pitch:lift*-.055};
    }
    case 'vault':{
      const stride=Math.sin(t*2.6+phase);
      return {x:stride*.38,y:Math.abs(Math.sin(t*5.2+phase))*.035,z:0,roll:-stride*.05,pitch:.015};
    }
  }
}
