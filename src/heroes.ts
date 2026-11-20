export const heroes={
  shenmo:{name:'沈墨',gender:'男',variant:'player',robe:'#294f67',trim:'#aebbbd',description:'墨藍長袍、高束長髮與溫潤眉眼，提燈執筆的青年書生。',tool:'辨句筆'},
  suying:{name:'蘇映',gender:'女',variant:'playerAlt',robe:'#6688ad',trim:'#bfd6df',description:'霜青層疊長裙、柔順垂髮與細緻玉簪，攜燈持卷的青年女使。',tool:'靈印卷'},
} as const;
export type HeroId=keyof typeof heroes;
export const heroIds:HeroId[]=['shenmo','suying'];
export function normalizeHero(value:unknown):HeroId{return value==='suying'?'suying':'shenmo'}
