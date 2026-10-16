import http from 'node:http';
import {existsSync} from 'node:fs';
if(existsSync('.env')&&process.loadEnvFile)process.loadEnvFile('.env');
const compiled=process.argv.includes('--production');
const worker=(await import(new URL(compiled?'../dist/server/index.js':'../worker/index.js',import.meta.url))).default;
const port=Number(process.env.PORT||4173),host=process.env.HOST||'127.0.0.1';
const server=http.createServer(async(req,res)=>{try{const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>2048){res.writeHead(413,{'content-type':'application/json','connection':'close'});res.end(JSON.stringify({error:'Request body exceeds 2 KB.'}));req.destroy();return;}chunks.push(chunk);}const headers=new Headers();for(const [name,value] of Object.entries(req.headers)){if(value&&!['cf-connecting-ip','x-forwarded-for'].includes(name))headers.set(name,Array.isArray(value)?value.join(','):value);}headers.set('cf-connecting-ip',req.socket.remoteAddress||'local');const request=new Request('http://'+req.headers.host+req.url,{method:req.method,headers,...(chunks.length?{body:Buffer.concat(chunks)}:{})});const response=await worker.fetch(request,process.env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(500,{'content-type':'application/json'});res.end(JSON.stringify({error:'Internal server error'}));}});
server.requestTimeout=60000;server.headersTimeout=10000;server.listen(port,host,()=>console.log('Local: http://'+host+':'+port));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
