import assert from 'node:assert/strict';
import {analyze} from '../worker/index.js';
const original=globalThis.fetch,hash='0x'+'1'.repeat(64),address='0x'+'2'.repeat(40);let traceRequests=0;
globalThis.fetch=async(url,options)=>{const {method}=JSON.parse(options.body);if(method.includes('trace'))traceRequests++;return Response.json({result:({eth_chainId:'0x1237',eth_getTransactionByHash:{hash,from:address,to:address,value:'0x0',gasPrice:'0x1'},eth_getTransactionReceipt:{blockHash:hash,blockNumber:'0x1',gasUsed:'0x1',status:'0x1',logs:[]},eth_getBlockByHash:{number:'0x1',timestamp:'0x1'}})[method]});};
try{const result=await analyze({query:hash},{DEPLOYMENT_MODE:'receipt',ENRICHMENT_DISABLED:'1'});assert.equal(traceRequests,0);assert.equal(result.availability.calls,false);assert.equal(result.calls.length,0);assert.match(result.traceError,/Receipt-only deployment/);console.log('Passed: receipt deployment never requests or invents internal traces');}finally{globalThis.fetch=original;}
