import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {build} from 'esbuild';
import {resolve,dirname} from 'node:path';
import {createRequire} from 'node:module';
await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
const localFiles={name:'local-files',setup(b){b.onResolve({filter:/.*/},args=>{let path=args.kind==='entry-point'?resolve(args.path):createRequire(args.importer).resolve(args.path);path=path.replace(/([\\/])_cjs([\\/])/,'$1_esm$2').replace('cryptoNode.js','crypto.js');return {path,namespace:'local'};});b.onLoad({filter:/.*/,namespace:'local'},async args=>({contents:await readFile(args.path,'utf8'),loader:args.path.endsWith('.json')?'json':'js'}));}};
await build({absWorkingDir:resolve('.'),entryPoints:[resolve('worker/index.js')],outfile:resolve('dist/server/index.js'),tsconfigRaw:{compilerOptions:{}},plugins:[localFiles],bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true});if(existsSync('.openai/hosting.json'))await copyFile('.openai/hosting.json','dist/.openai/hosting.json');else await writeFile('dist/.openai/hosting.json','{}');
console.log('Worker artifact built');
