import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildBossVolley,projectileCapacity} from '../src/bossAttacks';
import {guardSpeed,guardDetectionRange} from '../src/realmDesign';
test('四域怪物在相同難度下逐關提高速度，仍保留玩家逃生速度',()=>{for(const difficulty of ['一般','刺激','極限'] as const){let previous=0;for(let r=0;r<4;r++){const speed=guardSpeed(r,difficulty);assert.ok(speed>previous);assert.ok(speed<4.5);if(r>0)assert.ok(guardDetectionRange(r,1)>guardDetectionRange(r-1,1));previous=speed}assert.ok(guardSpeed(3,difficulty,30,true)<4.5)}});

test('新增守衛後各難度正常追擊提速25%，六隻守衛最高速仍低於主角步速',()=>{
 const factors=[1,1.22,1.48,1.75];
 for(const [difficulty,base]of [['一般',.85],['刺激',1.35],['極限',1.9]] as const){
  for(let realm=0;realm<4;realm++){
   assert.ok(Math.abs(guardSpeed(realm,difficulty)-Math.min(4.15,base*factors[realm]*1.25))<1e-9);
   for(let guard=0;guard<realm+3;guard++)assert.ok(guardSpeed(realm,difficulty,30,true,guard)<4.5);
  }
 }
});
test('魔王彈量隨題目進度和持續戰鬥增加，保留有限物件池',()=>{let previous=0;for(let step=0;step<16;step++){const count=buildBossVolley(step,0,{x:0,z:-1}).shots.length;assert.ok(count>previous);previous=count}assert.ok(buildBossVolley(8,12,{x:0,z:0}).shots.length>buildBossVolley(8,0,{x:0,z:0}).shots.length);assert.ok(buildBossVolley(15,500,{x:0,z:0}).shots.length<=projectileCapacity/2)});
test('四種彈幕輪替並包含前後左右發射點，重複扇射也會更換發射角度',()=>{const plans=Array.from({length:4},(_,i)=>buildBossVolley(0,i,{x:0,z:-1}));assert.equal(new Set(plans.map(p=>p.label)).size,4);const ring=plans[2];assert.ok(ring.origins.some(p=>p.x< -5));assert.ok(ring.origins.some(p=>p.x>5));assert.ok(ring.origins.some(p=>p.z>3));assert.ok(ring.origins.some(p=>p.z< -8));assert.notDeepEqual(plans[0].origins,buildBossVolley(0,4,{x:0,z:-1}).origins)});
test('每個發射點都有瞄準預警位置的炮彈，固定站在碑石後仍會面臨多方向攻擊',()=>{const target={x:0,z:-1};for(let n=0;n<4;n++){const plan=buildBossVolley(8,n,target);for(const origin of plan.origins){const shot=plan.shots.find(p=>p.x===origin.x&&p.z===origin.z)!;const dx=target.x-shot.x,dz=target.z-shot.z;assert.ok(Math.abs(dx*shot.vz-dz*shot.vx)<1e-7);assert.ok(dx*shot.vx+dz*shot.vz>0)}assert.ok(plan.windup>=1.2);assert.ok(plan.shots.every(s=>[s.x,s.z,s.vx,s.vz,s.curve].every(Number.isFinite)))}});
test('旋掃炮彈具有彎曲路徑，階段越後間隔越短，相同預警重算結果一致',()=>{const first=buildBossVolley(0,3,{x:0,z:0}),last=buildBossVolley(8,1,{x:0,z:0});assert.ok(first.shots.some(p=>p.curve!==0));assert.ok(last.interval<first.interval);assert.deepEqual(buildBossVolley(8,1,{x:2,z:3}),buildBossVolley(8,1,{x:2,z:3}))});
