export type HealthAnchor={id:number;x:number;y:number;width:number;height:number;visible:boolean};
export type HealthObstacle={left:number;right:number;top:number;bottom:number};
/** Keep nearby bars in separate rows. The player is placed first. */
export function layoutHealthLabels(anchors:HealthAnchor[],width:number,height:number,obstacles:HealthObstacle[]=[]){
 const placed:{left:number;right:number;top:number;bottom:number}[]=[];
 return anchors.map(a=>{if(!a.visible||a.x<0||a.x>width||a.y< -20||a.y>height+40)return {...a,visible:false};
  const x=Math.max(a.width/2+4,Math.min(width-a.width/2-4,a.x));let y=Math.max(a.height+4,Math.min(height-4,a.y));
  if(obstacles.length){
   const blocked=[...obstacles,...placed],xs=[...new Set([x,a.width/2+4,width-a.width/2-4,...blocked.flatMap(p=>[p.left-a.width/2-4,p.right+a.width/2+4])])],ys=[...new Set([y,...blocked.map(p=>p.top-4)])];
   let best:{x:number;y:number;cost:number}|null=null;
   for(const cx of xs)for(const cy of ys){if(cx-a.width/2<4||cx+a.width/2>width-4||cy<a.height+4||cy>y)continue;const cost=(cx-x)**2+(cy-y)**2*1.2;if(best&&cost>=best.cost)continue;if(blocked.some(p=>cx-a.width/2<p.right+3&&cx+a.width/2>p.left-3&&cy-a.height<p.bottom+3&&cy>p.top-3))continue;best={x:cx,y:cy,cost}}
   if(!best)return {...a,visible:false};placed.push({left:best.x-a.width/2,right:best.x+a.width/2,top:best.y-a.height,bottom:best.y});return {...a,x:best.x,y:best.y};
  }
  for(let n=0;n<anchors.length+1;n++){const overlaps=placed.filter(p=>x-a.width/2<p.right+3&&x+a.width/2>p.left-3&&y-a.height<p.bottom+3&&y>p.top-3);if(!overlaps.length)break;y=Math.min(...overlaps.map(p=>p.top))-4}
  if(y<a.height+4)return {...a,visible:false};placed.push({left:x-a.width/2,right:x+a.width/2,top:y-a.height,bottom:y});return {...a,x,y};
 });
}
