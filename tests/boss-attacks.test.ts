import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildBossVolley,bossProjectileSpeed,projectileCapacity} from '../src/bossAttacks';
import {guardSpeed,guardDetectionRange,maxGuardSpeed} from '../src/realmDesign';
test('四域關主依教師指定固定為2.1、2.3、2.6、2.9，均慢於主角',()=>{
 const reference=[2.1,2.3,2.6,2.9];
 for(let realm=0;realm<4;realm++){
  assert.equal(guardSpeed(realm),reference[realm]);assert.ok(guardSpeed(realm)<4.5);
  if(realm){assert.ok(guardSpeed(realm)>guardSpeed(realm-1));assert.ok(guardDetectionRange(realm,1)>guardDetectionRange(realm-1,1))}
 }
 assert.equal(guardSpeed(0),2.1);assert.equal(guardSpeed(1),2.3);assert.equal(guardSpeed(2),2.6);assert.equal(guardSpeed(3),2.9);
});

test('四域追擊上限2.9，魔王彈速仍採獨立設定',()=>{
 assert.equal(maxGuardSpeed,2.9);assert.ok(Math.abs(bossProjectileSpeed(15,100)-3)<1e-9);
 for(let realm=0;realm<4;realm++)assert.ok(guardSpeed(realm)<=maxGuardSpeed);
});
test('魔王彈量隨題目進度和持續戰鬥增加，保留有限物件池',()=>{let previous=0;for(let step=0;step<16;step++){const count=buildBossVolley(step,0,{x:0,z:-1}).shots.length;assert.ok(count>previous);previous=count}assert.ok(buildBossVolley(8,12,{x:0,z:0}).shots.length>buildBossVolley(8,0,{x:0,z:0}).shots.length);assert.ok(buildBossVolley(15,500,{x:0,z:0}).shots.length<=projectileCapacity/2)});
test('四種彈幕輪替並包含前後左右發射點，重複扇射也會更換發射角度',()=>{const plans=Array.from({length:4},(_,i)=>buildBossVolley(0,i,{x:0,z:-1}));assert.equal(new Set(plans.map(p=>p.label)).size,4);const ring=plans[2];assert.ok(ring.origins.some(p=>p.x< -5));assert.ok(ring.origins.some(p=>p.x>5));assert.ok(ring.origins.some(p=>p.z>3));assert.ok(ring.origins.some(p=>p.z< -8));assert.notDeepEqual(plans[0].origins,buildBossVolley(0,4,{x:0,z:-1}).origins)});
test('每個發射點都有瞄準預警位置的炮彈，固定站在碑石後仍會面臨多方向攻擊',()=>{const target={x:0,z:-1};for(let n=0;n<4;n++){const plan=buildBossVolley(8,n,target);for(const origin of plan.origins){const shot=plan.shots.find(p=>p.x===origin.x&&p.z===origin.z)!;const dx=target.x-shot.x,dz=target.z-shot.z;assert.ok(Math.abs(dx*shot.vz-dz*shot.vx)<1e-7);assert.ok(dx*shot.vx+dz*shot.vz>0)}assert.ok(plan.windup>=1.2);assert.ok(plan.shots.every(s=>[s.x,s.z,s.vx,s.vz,s.curve].every(Number.isFinite)))}});
test('旋掃炮彈具有彎曲路徑，階段越後間隔越短，相同預警重算結果一致',()=>{const first=buildBossVolley(0,3,{x:0,z:0}),last=buildBossVolley(8,1,{x:0,z:0});assert.ok(first.shots.some(p=>p.curve!==0));assert.ok(last.interval<first.interval);assert.deepEqual(buildBossVolley(8,1,{x:2,z:3}),buildBossVolley(8,1,{x:2,z:3}))});
