import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/inquiry.js';

const data = {fullName:'Test', company:'Primjer d.o.o.', city:'Rijeka', phone:'+385991234567', email:'test@example.com', message:'Veći poslovni objekt', gdpr:true, turnstileToken:'token'};
const secrets = {RESEND_API_KEY:'test', RESEND_FROM:'test@example.com', TURNSTILE_SECRET_KEY:'test'};
async function request(payload, env=secrets) {
 const req = new Request('https://redcarpet.hr/api/inquiry', {method:'POST', headers:{origin:'https://redcarpet.hr'}, body:JSON.stringify(payload)});
 return onRequestPost({request:req,env});
}
assert.equal((await request(data, {})).status,503);
assert.equal((await request({...data,company:''})).status,400);
assert.equal((await request({...data,email:'invalid'})).status,400);
assert.equal((await request({...data,gdpr:false})).status,400);
assert.equal((await request({...data,message:'x'.repeat(13000)})).status,413);
const oldFetch=globalThis.fetch;
let count=0;
globalThis.fetch=async (url, opts)=>{
 count++;
 if(String(url).includes('siteverify')) return Response.json({success:true,hostname:'redcarpet.hr'});
 if(String(url).includes('resend.com')) {
  const body=JSON.parse(opts.body);
  assert.equal(body.to[0],'redcarpet.hrvatska@gmail.com');
  return Response.json({id:'test-send'});
 }
 throw new Error('Unexpected call');
};
try {
 assert.equal((await request(data)).status,200);
 assert.equal(count,2);
} finally {globalThis.fetch=oldFetch}
console.log('B2B inquiry tests passed');
