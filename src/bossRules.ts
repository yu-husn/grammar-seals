export const bossQuestionCount=16;
export const bossMaxHP=160;
export const bossQuestionDamage=10;
export const bossPlayerDamage=10;
export const bossAnswerHeal=5;
export const bossAnswerRespite=4;
export const bossRescueHP=30;
export const bossLearningHelp=`魔王攻擊每次扣${bossPlayerDamage}點生命，受傷後不提供免傷緩衝。答對回復${bossAnswerHeal}點生命、清除咒彈，並提供${bossAnswerRespite}秒移動時間。生命耗盡時回復至${bossRescueHP}點並保留題目進度；答錯只進入補救，不加速攻擊。`;
export const bossPhaseStarts=[0,4,10] as const;
export function bossPhase(step:number){return step<4?0:step<10?1:2}
export function bossPhaseStep(step:number){return Math.max(0,step-bossPhaseStarts[bossPhase(step)])}
