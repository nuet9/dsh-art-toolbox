import {z} from 'zod';
import {stat,readFile} from 'node:fs/promises';
import {isAbsolute} from 'node:path';
import {Toolbox,spec,parameters} from './model-v5.js';
export const inject=['storageDomain','connection','tools','sessionController','attachments'];
export async function apply(ctx){
 const domain=await ctx.storageDomain.open(spec(z));
 const box=new Toolbox(domain,{async preview(f){const size=(await stat(f)).size;if(size>4*1024*1024)return undefined;const ext=f.split('.').pop().toLowerCase();return 'data:image/'+(ext==='jpg'?'jpeg':ext)+';base64,'+(await readFile(f)).toString('base64');},saveImage:a=>ctx.attachments.saveImage(a),imagePath:r=>ctx.attachments.imageHostPath(r),prompt:(r,s)=>ctx.sessionController.prompt(r,s),async checkFile(f){if(typeof f!=='string'||!isAbsolute(f)||!(await stat(f)).isFile())throw Error('Deliverable must be an existing absolute file: '+f);}});
 const disposers=[];let closing;const dispose=()=>closing??=(async()=>{for(const d of disposers.reverse())await d();await box.close();await domain.close();})();ctx.effect(()=>dispose);
 try{
 disposers.push(ctx.connection.fetch.register({path:'/api/art-toolbox',methods:['POST'],requestBody:'buffered',async fetch(request){
 if(!request.headers.get('content-type')?.startsWith('application/json'))return new Response('Expected JSON',{status:415});let e;try{e=await request.json();}catch{return new Response('Invalid JSON',{status:400});}if(e?.type!=='client-request'||typeof e.rpcId!=='string'||e.method!=='art-toolbox')return new Response('Invalid envelope',{status:400});let result;try{if(e.payload?.action==='report')throw Error('Results must be reported by task session');result={ok:true,value:await box.execute(e.payload,request.signal)};}catch(error){result={ok:false,error:{code:'ART_TOOLBOX_ERROR',message:String(error.message||error),details:{}}};}return Response.json({type:'server-response',rpcId:e.rpcId,result});
 }}));
 disposers.push(ctx.tools.register({name:'art_toolbox',description:'Read/save defaults and submit material, photo modeling, general procedural geometry-node modeling, project cleanup or asset-library tasks to the current session. get returns settings and recent results; report updates progress and deliverables. Project tasks preserve originals and write separate outputs. Submitted means queued, not completed.',parameters,output:{schema:{type:'object',additionalProperties:true},render:(_a,v)=>[{type:'text',text:JSON.stringify(v)}]},execute(a,exec){if(!exec.agent)throw Error('Session required');return box.execute({...a,sessionId:exec.agent.id},exec.signal);}}));
 }catch(e){await dispose();throw e;}
}
