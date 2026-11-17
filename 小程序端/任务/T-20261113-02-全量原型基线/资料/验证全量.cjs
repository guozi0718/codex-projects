const fs=require('fs'),p=require('path'),assert=require('assert/strict'),crypto=require('crypto'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1112-737-0_26.1112.737.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const root='E:/codex/小程序',task=p.join(root,'任务/T-20261113-02-全量原型基线'),old=p.join(root,'任务/T-20261113-01-帮助与反馈优化');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
(async()=>{const out=p.join(task,'资料/验证');fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true}),results=[];try{
for(const [role,name,routes]of [['teacher','教师',['sc-home','sc-msgs','sc-me','sc-apply','sc-att','sc-dismiss','sc-eval','sc-leave','sc-stumgr','sc-help']],['parent','家长',['sc-home','sc-msgs','sc-me','sc-apply','sc-atthist','sc-dismiss','sc-eval','sc-leave-tab','sc-kids','sc-help']]]){
const dest=p.join(task,'端-'+name,'版本-v0.1'),src=p.join(old,'端-'+name,'版本-v1.2');assert.equal(hash(p.join(dest,'index.html')),hash(p.join(src,'index.html')));
const assets=fs.readdirSync(p.join(src,'assets'));for(const a of assets)assert.equal(hash(p.join(dest,'assets',a)),hash(p.join(src,'assets',a)),a);
const ctx=await browser.newContext({viewport:{width:1100,height:940}}),page=await ctx.newPage(),errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url())});page.on('requestfailed',r=>missing.push(r.url()));
await page.goto(pathToFileURL(p.join(dest,'index.html')).href);await page.waitForTimeout(400);assert.equal(await page.locator('.screen.show').getAttribute('id'),'sc-home');await page.locator('.phone').screenshot({path:p.join(out,name+'-完整首页.png')});
const visited=[];for(const route of routes){await page.evaluate(r=>go(r),route);await page.waitForTimeout(80);assert.equal(await page.locator('.screen.show').getAttribute('id'),route);visited.push(route);}
assert.equal(await page.locator('#hf-faqs .hf-faq').count(),7);assert.equal(await page.locator('.hf-answer:visible').count(),0);
await page.evaluate(()=>go('sc-home'));if(role==='teacher'){await page.evaluate(()=>idToParent('林晓乐'));await page.waitForURL('**/端-家长/**/index.html*');}else{await page.evaluate(()=>idToTeacher());await page.waitForURL('**/端-教师/**/index.html*');}await page.waitForTimeout(200);assert.equal(await page.locator('.screen.show').getAttribute('id'),'sc-home');assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
results.push({role,name,htmlIdenticalToV12:true,assetsIdentical:assets.length,visited,faqDefaultClosed:true,crossIdentity:true,runtimeErrors:errors,missingRequests:missing});await ctx.close();}
fs.writeFileSync(p.join(task,'资料/验证结果.json'),JSON.stringify({date:'2026-11-13',status:'passed',results,limits:['完整复制并校验全部页面和资源；浏览器验证首页、主要模块和身份互切，未逐一重测全部复杂业务分支。','保留原型外链、隐藏阶段和演示数据；未接入真实登录、支付、工单或微信服务。']},null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
