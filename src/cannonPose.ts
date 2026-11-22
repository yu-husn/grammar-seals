export function cannonLayout(width:number,height:number){
 const compact=height<430;
 const scale=compact?.42:Math.min(width<600?.72:1,height<640?.84:1);
 return {scale,x:compact?Math.min(width*.37,width/2-115*scale-10):0,bottom:compact?86:width<600?146:height<640?151:168};
}
export function turnCannon(current:number,target:number,delta:number,instant=false){
 const difference=Math.atan2(Math.sin(target-current),Math.cos(target-current));
 return current+difference*(instant?1:1-Math.exp(-Math.max(0,delta)*14));
}
export function cannonRecoil(age:number,reduced=false){return age<0||age>=.28?0:Math.sin(age/.28*Math.PI)*(reduced?2:7)}
