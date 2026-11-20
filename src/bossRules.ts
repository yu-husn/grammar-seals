export const bossQuestionCount=16;
export const bossMaxHP=160;
export const bossQuestionDamage=10;
export const bossPhaseStarts=[0,4,10] as const;
export function bossPhase(step:number){return step<4?0:step<10?1:2}
export function bossPhaseStep(step:number){return Math.max(0,step-bossPhaseStarts[bossPhase(step)])}
