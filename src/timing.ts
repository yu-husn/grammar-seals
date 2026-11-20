export const explorationSeconds=200;
export const bossExplorationSeconds=240;
export function explorationSecondsForRealm(realm:number){return realm===4?bossExplorationSeconds:explorationSeconds}
/** Saved remaining time is retained; changing the starting budget never refills a run. */
export function clampRemainingSeconds(value:unknown,bonus=0,realm=0){
 const seconds=Number(value);
 const budget=explorationSecondsForRealm(realm);
 return Number.isFinite(seconds)&&value!==null&&value!==undefined?Math.max(0,Math.min(budget+bonus,seconds)):budget;
}
