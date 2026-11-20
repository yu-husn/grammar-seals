import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const requested=process.argv[process.argv.indexOf('--base')+1];
const base=process.argv.includes('--base')?requested:process.env.GITHUB_REPOSITORY?`/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`:'/grammar-seals/';
if(!/^\/[A-Za-z0-9._/-]*\/$/.test(base)||base.includes('..'))throw Error('Invalid GitHub Pages base path');
for(const [script,args] of [['typescript/bin/tsc',['-b']],['vite/bin/vite.js',['build','--base',base]]]){
 const result=spawnSync(process.execPath,[path.join(root,'node_modules',script),...args],{cwd:root,stdio:'inherit'});if(result.status!==0)process.exit(result.status??1);
}
const dist=path.join(root,'dist');let changed=0;
async function adapt(directory){for(const entry of await fs.readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory()){await adapt(file);continue}if(!/\.(html|js|css|json)$/.test(entry.name))continue;const original=await fs.readFile(file,'utf8');let text=original.replace(/(["'`(])\/(items|fonts|music|seals|guide|question-bank)\//g,(_,quote,folder)=>`${quote}${base}${folder}/`).replace(/(["'`(])\/ambience\.wav/g,(_,quote)=>`${quote}${base}ambience.wav`);if(entry.name.endsWith('.html'))text=text.replace(/(href\s*=\s*["'])\/(?=["'])/g,`$1${base}`);if(text!==original){await fs.writeFile(file,text);changed++}}}
await adapt(dist);await fs.writeFile(path.join(dist,'.nojekyll'),'');
await fs.writeFile(path.join(dist,'deployment.json'),JSON.stringify({application:'語法禁域：四句封印',base,commit:process.env.GITHUB_SHA??null,builtAt:new Date().toISOString()},null,2));
console.log(`GitHub Pages build: ${base}; updated asset URLs in ${changed} files.`);
