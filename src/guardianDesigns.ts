export const guardianDesigns=[
 {variant:'shadow',name:'巡夜影衛',silhouette:'lanky-hood-torn-cloak',height:3.45,scene:'wet-haunted-town',description:'瘦長駝背、深兜帽與破披風，冷藍眼光藏在黑暗面孔裡；鐵戟與鎖燈沿雨巷拖行。'},
 {variant:'mirror',name:'鏡面仕女',silhouette:'floating-porcelain-shattered-halo',height:3.35,scene:'silver-mirror-cathedral',description:'浮空長裙與垂髮，半裂瓷面一明一暗；身後懸著碎鏡，手持裂面鏡扇。'},
 {variant:'judge',name:'喪屍判官',silhouette:'heavy-winged-hat-sealed-mask',height:3.65,scene:'towering-judgment-court',description:'寬肩重袍、橫翼高帽、封面銅甲與長鬚，符紙垂在眼前；掌中法笏與鎖印壓迫近身。'},
 {variant:'vault',name:'虛藏守將',silhouette:'massive-bronze-caged-jade-core',height:3.7,scene:'chained-abyss-vault',description:'巨大青銅石甲、分離關節與空洞面甲，胸口囚著青綠靈核；腰間懸著寶庫鎖鑰。'},
] as const;
export type GuardianVariant=typeof guardianDesigns[number]['variant'];
export function isGuardianVariant(value:unknown):value is GuardianVariant{return guardianDesigns.some(d=>d.variant===value)}
