export const trafficPage='https://yu-husn.github.io/grammar-seals/';
export const trafficEndpoint='https://cdn.busuanzi.cc/api.php';
export type TrafficResult={status:'ready';visitors:number;views:number}|{status:'unavailable'|'preview'};
type Site=Pick<Location,'hostname'|'pathname'|'protocol'>;
export function isTrafficLocation(site:Site){return site.protocol==='https:'&&site.hostname==='yu-husn.github.io'&&/^\/grammar-seals\/(?:index\.html)?$/.test(site.pathname)}
export function readTrafficStats(data:unknown):TrafficResult{
 if(!data||typeof data!=='object')throw Error('Invalid traffic response');
 const values=data as Record<string,unknown>;
 const number=(v:unknown)=>{if(typeof v!=='number'&&!(typeof v==='string'&&/^\d+$/.test(v)))throw Error('Invalid traffic count');const n=Number(v);if(!Number.isSafeInteger(n)||n<0)throw Error('Invalid traffic count');return n};
 return {status:'ready',visitors:number(values.busuanzi_page_uv),views:number(values.busuanzi_page_pv)};
}
// One network request per page load, shared across menus, replays and React mounts.
// Only a fixed public URL is sent: no query string, student records or referrer.
export function createTrafficLoader(fetcher:typeof fetch=fetch,timeoutMs=8000){
 let request:Promise<TrafficResult>|undefined;
 return (site:Site):Promise<TrafficResult>=>{
  if(!isTrafficLocation(site))return Promise.resolve({status:'preview'});
  return request??=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);try{
   const response=await fetcher(trafficEndpoint,{method:'POST',credentials:'omit',referrerPolicy:'no-referrer',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({url:trafficPage,referrer:''}),signal:controller.signal});
   if(!response.ok)throw Error('Traffic unavailable');return readTrafficStats(await response.json());
  }catch{return {status:'unavailable'} as const}finally{clearTimeout(timer)}})();
 };
}
export const loadTraffic=createTrafficLoader();
