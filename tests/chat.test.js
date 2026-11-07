import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/chat.js';

async function request(method, body, envKey) {
  const old=process.env.OPENAI_API_KEY;
  if(envKey===undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY=envKey;
  const req={method,body};
  const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;return this},status(n){this.statusCode=n;return this},json(data){this.data=data;return this}};
  try {await handler(req,res);return res;} finally {if(old===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=old;}
}

test('rejects GET',async()=>{const r=await request('GET',{});assert.equal(r.statusCode,405)});
test('requires server-side key',async()=>{const r=await request('POST',{messages:[{role:'user',content:'سلام'}]});assert.equal(r.statusCode,503)});
test('rejects empty messages',async()=>{const r=await request('POST',{messages:[]},'test-key');assert.equal(r.statusCode,400)});
test('rejects overlong history',async()=>{const r=await request('POST',{messages:Array.from({length:25},()=>({role:'user',content:'سلام'}))},'test-key');assert.equal(r.statusCode,400)});
test('rejects assistant as final turn',async()=>{const r=await request('POST',{messages:[{role:'assistant',content:'سلام'}]},'test-key');assert.equal(r.statusCode,400)});
