import test from 'node:test';
import assert from 'node:assert/strict';
import {createTrafficLoader,isTrafficLocation,readTrafficStats,trafficEndpoint,trafficPage} from '../src/traffic';
const production={hostname:'yu-husn.github.io',pathname:'/grammar-seals/',protocol:'https:'};
test('traffic is limited to the production game, including its index alias',()=>{
 assert.ok(isTrafficLocation(production));assert.ok(isTrafficLocation({...production,pathname:'/grammar-seals/index.html'}));
 for(const site of [{...production,hostname:'localhost'},{...production,hostname:'example.com'},{...production,pathname:'/another-game/'},{...production,protocol:'http:'}])assert.equal(isTrafficLocation(site),false);
});
test('traffic only consumes page visitors, ignoring views and other GitHub projects',()=>{
 assert.deepEqual(readTrafficStats({busuanzi_page_uv:'12',busuanzi_page_pv:34,busuanzi_site_uv:999999}),{status:'ready',visitors:12});
 assert.deepEqual(readTrafficStats({busuanzi_page_uv:0}),{status:'ready',visitors:0});
 assert.deepEqual(readTrafficStats({busuanzi_page_uv:12,busuanzi_page_pv:'invalid'}),{status:'ready',visitors:12});
 for(const n of [undefined,null,-1,NaN,Infinity,1.5,'',true,'<img>',Number.MAX_SAFE_INTEGER+1])assert.throws(()=>readTrafficStats({busuanzi_page_uv:n,busuanzi_page_pv:34}));
 assert.throws(()=>readTrafficStats({busuanzi_site_pv:10,busuanzi_site_uv:2}));
});
test('mounts/replays share one request; no credentials, student records or URL params are sent',async()=>{
 let calls=0;
 const loader=createTrafficLoader((async(url,options)=>{calls++;assert.equal(url,trafficEndpoint);assert.equal(options?.credentials,'omit');assert.equal(options?.referrerPolicy,'no-referrer');assert.deepEqual(JSON.parse(options?.body as string),{url:trafficPage,referrer:''});return new Response(JSON.stringify({busuanzi_page_uv:12,busuanzi_page_pv:34}))}) as typeof fetch);
 const a=loader(production),b=loader(production);assert.equal(a,b);assert.deepEqual(await a,{status:'ready',visitors:12});assert.deepEqual(await loader(production),await a);assert.equal(calls,1);
});
test('preview never contacts or increments the production counter',async()=>{
 let calls=0;const loader=createTrafficLoader((async()=>{calls++;throw Error('unexpected request')}) as typeof fetch);
 assert.deepEqual(await loader({...production,hostname:'127.0.0.1'}),{status:'preview'});assert.equal(calls,0);
});
test('network, HTTP and malformed responses fail safely without repeated increments',async()=>{
 for(const mode of ['network','http','json']){let calls=0;const loader=createTrafficLoader((async()=>{calls++;if(mode==='network')throw Error('offline');return mode==='http'?new Response('',{status:503}):new Response('not JSON')}) as typeof fetch);assert.deepEqual(await loader(production),{status:'unavailable'});assert.deepEqual(await loader(production),{status:'unavailable'});assert.equal(calls,1)}
});
test('slow analytics times out without blocking game startup',async()=>{
 const loader=createTrafficLoader((async(_url,options)=>new Promise((_resolve,reject)=>options?.signal?.addEventListener('abort',()=>reject(new Error('aborted'))))) as typeof fetch,5);assert.deepEqual(await loader(production),{status:'unavailable'});
});
