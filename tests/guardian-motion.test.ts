import {test} from 'node:test';
import assert from 'node:assert/strict';
import {guardianPose,guardianMotionProfiles} from '../src/guardianMotion';
import {guardianDesigns} from '../src/guardianDesigns';

test('關主各有明顯動作軸向，跳躍保持地面接觸且不落入地底',()=>{
 const range=(variant:typeof guardianDesigns[number]['variant'],axis:'x'|'y'|'z')=>{
  const values=Array.from({length:240},(_,i)=>guardianPose(variant,i/60)[axis]);
  return Math.max(...values)-Math.min(...values);
 };
 assert.ok(range('shadow','z')>.8);
 assert.equal(range('shadow','x'),0);
 assert.ok(range('mirror','x')>1.2);
 assert.ok(range('judge','y')>.9);
 assert.equal(range('judge','x'),0);
 assert.ok(range('vault','x')>.7);
 for(const {variant}of guardianDesigns)for(let i=0;i<240;i++){
  const pose=guardianPose(variant,i/60);
  assert.ok(pose.y>=0&&pose.y<=guardianMotionProfiles[variant].maxRise+.00001);
  assert.ok(Math.abs(pose.x)<=.65&&Math.abs(pose.z)<=.45);
 }
});

test('減少動態時取消來回位移與跳躍；同關多隻怪物動作錯開',()=>{
 for(const {variant}of guardianDesigns){
  assert.deepEqual(guardianPose(variant,0,0,true),guardianPose(variant,12,4,true));
  assert.notDeepEqual(guardianPose(variant,.2,0),guardianPose(variant,.2,1));
 }
});
