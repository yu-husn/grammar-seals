import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shouldPauseOnWindowBlur} from '../src/focusPolicy';
test('手機頁面仍可見時短暫失焦不跳出暫停，背景頁面及桌面失焦維持安全暫停',()=>{
 assert.equal(shouldPauseOnWindowBlur(false,true),false);
 assert.equal(shouldPauseOnWindowBlur(true,true),true);
 assert.equal(shouldPauseOnWindowBlur(false,false),true);
 assert.equal(shouldPauseOnWindowBlur(true,false),true);
});
