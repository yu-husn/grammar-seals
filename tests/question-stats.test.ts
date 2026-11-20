import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getQuestionCounts} from '../src/questionStats';
test('完整218題與直接新增58題分開計數，去重同句不會漏算新增題',()=>{
 const stats=getQuestionCounts();assert.equal(stats.total,218);assert.equal(stats.userAdded,58);
 assert.deepEqual(stats.rows,[{category:'敘事句',total:64,userAdded:25},{category:'表態句',total:56,userAdded:13},{category:'判斷句',total:51,userAdded:10},{category:'有無句',total:47,userAdded:10}]);
 assert.ok(stats.rows.every(r=>r.userAdded<=r.total));
});
