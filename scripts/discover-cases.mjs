import {createProviderRPC} from './provider-rpc.mjs';
import {writeFile} from 'node:fs/promises';
const url=process.env.ROBINHOOD_MAINNET_RPC;if(!url)throw Error('RPC secret missing');
const rpc=createProviderRPC(url);
const known='0x2671d3f54c9bf09205e9e102bab3a5791d052c5bfc082e50621dad420f22f7b0';
let reverted=null,blocksChecked=0,receiptsChecked=0,bulk=true;const height=BigInt(await rpc('eth_blockNumber'));
for(let i=0;i<60&&!reverted;i++){const block='0x'+(height-BigInt(i)).toString(16);blocksChecked++;let receipts=[];if(bulk){try{receipts=await rpc('eth_getBlockReceipts',[block]);if(!Array.isArray(receipts))throw Error();}catch{bulk=false;}}if(!bulk){const b=await rpc('eth_getBlockByNumber',[block,true]);for(const tx of (b?.transactions||[]).filter(t=>BigInt(t.gas||'0x0')>0n).slice(0,8)){if(receiptsChecked>=200)break;receipts.push(await rpc('eth_getTransactionReceipt',[tx.hash]));receiptsChecked++;}}for(const r of receipts){if(r?.status==='0x0'){const tx=await rpc('eth_getTransactionByHash',[r.transactionHash]);if(tx?.to&&BigInt(tx.gas||'0x0')>0n){reverted=r.transactionHash;break;}}}if(!bulk&&receiptsChecked>=200)break;}
if(!reverted)throw Error('No reverted user transaction found within the bounded scan. Supply a real reverted case; replay activation remains blocked.');
const cases=[{category:'success',hash:known},{category:'nested',hash:known},{category:'token',hash:known},{category:'proxy',hash:known,contractAddress:'0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec'},{category:'reverted',hash:reverted}];await writeFile('verification-cases.json',JSON.stringify(cases,null,2));console.log(JSON.stringify({blocksChecked,receiptsChecked,reverted,cases}));
