import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cannonLayout,turnCannon,cannonRecoil} from '../src/cannonPose';
test('單管砲在電腦、平板、手機與窄橫向畫面保留完整底座並位於畫面內',()=>{for(const [w,h] of [[1440,736],[1024,604],[390,680],[320,404],[844,226]]){const p=cannonLayout(w,h);assert.ok(p.scale>0&&p.scale<=1);assert.ok(Math.abs(p.x)+115*p.scale<w/2);assert.ok(p.bottom-70*p.scale>0);assert.ok(p.bottom+135*p.scale<h)}assert.ok(cannonLayout(844,226).x>0,'矮橫向使用側邊迷你砲台，讓出中央題目');});
test('瞄準採最短旋轉路徑，不會繞一整圈；射擊時能對準目標',()=>{const start=Math.PI-.05,target=-Math.PI+.05;const first=turnCannon(start,target,.016);assert.ok(first>start&&first<start+.1);const fired=turnCannon(start,target,.016,true);assert.ok(Math.abs(Math.sin(fired)-Math.sin(target))<1e-10);assert.ok(Math.abs(Math.cos(fired)-Math.cos(target))<1e-10);assert.equal(turnCannon(1,2,0),1);});
test('後座力只短暫回縮、歸零，減少動畫模式幅度較小',()=>{assert.equal(cannonRecoil(0),0);assert.equal(cannonRecoil(.3),0);assert.equal(cannonRecoil(-1),0);for(let t=0;t<=.28;t+=.01){assert.ok(cannonRecoil(t)>=0&&cannonRecoil(t)<=7);assert.ok(cannonRecoil(t,true)<=cannonRecoil(t))}assert.ok(cannonRecoil(.14)>6.9);});
