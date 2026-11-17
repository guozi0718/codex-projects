const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1112-737-0_26.1112.737.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const task=path.resolve(__dirname,'..'),src=path.join(task,'资料/一期原始包/zhixiaohui-ssb-prototypes'),out=path.join(task,'资料/验证');
const read=p=>fs.readFileSync(p,'utf8'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function screens(html){const result={};const re=/<div class="screen[^\"]*"[^>]*id="([^"]+)"[^>]*>/g;let m;while(m=re.exec(html)){let depth=1,tag,rx=/<\/?div\b[^>]*>/g;rx.lastIndex=re.lastIndex;while(depth&&(tag=rx.exec(html)))depth+=tag[0].startsWith('</')?-1:1;result[m[1]]=html.slice(m.index,rx.lastIndex);}return result;}
(async()=>{
 fs.mkdirSync(out,{recursive:true});const results=[],browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:1100,height:940},timezoneId:'America/Los_Angeles'});let submitted='';
 const pages={};
 try{
 for(const [role,name] of [['teacher','教师'],['parent','家长']]){
  const dest=path.join(task,'端-'+name,'版本-v1.1'),original=read(path.join(src,role+'.html')),current=read(path.join(dest,'index.html'));
  const a=screens(original),b=screens(current);let unchanged=0;
  for(const id in a)if(!['sc-help','sc-fblist','sc-fbdetail'].includes(id)){assert.equal(b[id],a[id],role+': '+id+' changed');unchanged++;}
  for(const f of fs.readdirSync(path.join(dest,'assets')))if(!f.startsWith('help-'))assert.equal(hash(fs.readFileSync(path.join(dest,'assets',f))),hash(fs.readFileSync(path.join(src,'assets',f))));
  const page=await ctx.newPage(),errors=[];pages[role]=page;page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(dest,'index.html')).href+'?service=single#sc-help');
  assert.equal(await page.locator('.screen.show').getAttribute('id'),'sc-help');assert.equal(await page.locator('#hf-faqs .hf-faq').count(),7);
  assert.equal(await page.locator('#hf-service strong').textContent(),'0592-555000');assert.equal(await page.locator('#help-cs-btn').isVisible(),false);
  await page.evaluate(()=>{localStorage.setItem('proto-csentry','on');applyCsEntry();});assert.equal(await page.locator('#help-cs-btn').isVisible(),false);
  await page.evaluate(()=>{window.lastDial=null;addEventListener('zxh:help-dial',e=>window.lastDial=e.detail);});await page.locator('#hf-service').click();
  assert.equal(await page.locator('#hf-overlay').isVisible(),false);assert.equal((await page.evaluate(()=>window.lastDial)).phone,'0592-555000');
  await page.locator('.hf-question').first().click();assert.equal(await page.locator('.hf-answer').first().isVisible(),false);await page.locator('.hf-question').first().click();
  await page.evaluate(()=>document.getElementById('hf-notice').hidden=true);
  await page.locator('#sc-help .body').evaluate(el=>el.scrollTop=el.scrollHeight);
  await page.locator('.phone').screenshot({path:path.join(out,name+'-单客服.png')});
  await page.evaluate(()=>{hfSetService('multi');document.getElementById('hf-notice').hidden=true;document.querySelector('#sc-help .body').scrollTop=0;});
  assert.equal(await page.locator('#hf-service').innerText(),'客服电话');await page.locator('#hf-service').click();assert.equal(await page.locator('.hf-agent').count(),3);assert.equal(await page.locator('.hf-service-card').count(),2);
  await page.locator('.phone').screenshot({path:path.join(out,name+'-多客服.png')});
  await page.locator('.hf-dial').nth(1).click();assert.equal((await page.evaluate(()=>window.lastDial)).phone,'18888888888');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#hf-overlay').isVisible(),false);
  await page.evaluate(()=>ZXH_HELP_PREVIEW.setServices([{group:'平台客服',name:'A',phone:'10000',hours:'09:00–18:00'},{group:'平台客服',name:'B',phone:'10001',hours:'09:00–18:00'}]));await page.locator('#hf-service').click();assert.equal(await page.locator('.hf-service-card').count(),1);await page.locator('.hf-close').click();
  await page.locator('#hf-feedback').click();assert.equal(await page.locator('#fb-list .hf-record').count(),3);
  await page.getByRole('button',{name:'已提交',exact:true}).click();assert.equal(await page.locator('#fb-list .hf-record').count(),1);
  await page.evaluate(()=>fbEmptyToggle());assert.equal(await page.locator('#fb-empty').isVisible(),true);assert.equal(await page.locator('#fb-fbar').isVisible(),false);
  await page.getByRole('button',{name:'＋ 提交反馈',exact:true}).click();await page.locator('#hf-submit').click();assert.equal(await page.locator('#hf-overlay').isVisible(),true);assert.match(await page.locator('#hf-notice').textContent(),/请填写/);
  await page.getByRole('button',{name:'问题反馈',exact:true}).click();const text=name+'验证记录 <script>未执行</script>';await page.locator('#fb-txt').fill(text);
  await page.locator('#hf-file').setInputFiles(path.join(src,'assets/photo-cap.jpg'));await page.waitForFunction(()=>document.querySelectorAll('.hf-upload-item').length===1);
  await page.locator('#hf-submit').click();assert.equal(await page.locator('#fb-list .hf-record').count(),4);
  await page.locator('#fb-list .hf-record').first().click();assert.match(await page.locator('#fbd-body').innerText(),new RegExp(name+'验证记录'));assert.equal(await page.locator('#fbd-body script').count(),0);assert.equal(await page.locator('#fbd-body .hf-images img').count(),1);
  await page.locator('#fbd-body .hf-images button').click();assert.equal(await page.locator('.hf-image-large').isVisible(),true);await page.locator('.hf-close').click();
  await page.evaluate(()=>document.getElementById('hf-notice').hidden=true);await page.locator('.phone').screenshot({path:path.join(out,name+'-反馈详情.png')});
  const recs=await page.evaluate(()=>ZXH_HELP_PREVIEW.getRecords());assert.ok(recs.every(r=>r.role===role));if(role==='teacher')submitted=recs[0].txt;else assert.ok(!recs.some(r=>r.txt===submitted));
  await page.evaluate(()=>go('sc-me'));
  const baseline=await ctx.newPage();await baseline.goto(pathToFileURL(path.join(src,role+'.html')).href+'#sc-me');
  await page.mouse.move(0,0);await baseline.mouse.move(0,0);
  await baseline.locator('.phone').screenshot({animations:'disabled',path:path.join(out,name+'-我的-原版.png')});await page.locator('.phone').screenshot({animations:'disabled',path:path.join(out,name+'-我的-当前.png')});
  // Chromium 的圆角裁切边缘因合成层产生 111 个抗锯齿像素差；比较内侧矩形内容区。
  const clipOf=async p=>{const r=await p.locator('.phone').boundingBox();return{x:r.x+14,y:r.y+14,width:r.width-28,height:r.height-28};};
  const baselineShot=await baseline.screenshot({clip:await clipOf(baseline),animations:'disabled'}),currentShot=await page.screenshot({clip:await clipOf(page),animations:'disabled'});assert.equal(hash(currentShot),hash(baselineShot),role+' 我的 Tab content visual diff');await baseline.close();
  assert.deepEqual(errors,[]);results.push({role,unchangedScreens:unchanged,originalAssetsUnchanged:true,myTabContentPixelIdentical:true,checks:'FAQ折叠/在线客服强制隐藏/单客服拨号/多客服入口与分组/无空分组/弹窗关闭/反馈筛选与空态/必填校验/图片上传与预览/提交详情/文本转义/角色隔离',runtimeErrors:errors});
 }
 assert.equal(read(path.join(task,'端-教师/版本-v1.1/assets/help-config.js')),read(path.join(task,'端-家长/版本-v1.1/assets/help-config.js')));
 const mobile=await browser.newContext({viewport:{width:375,height:812},timezoneId:'America/Los_Angeles'}),mp=await mobile.newPage();await mp.goto(pathToFileURL(path.join(task,'端-家长/版本-v1.1/index.html')).href+'?service=multi#sc-help');await mp.locator('#hf-service').click();assert.equal(await mp.locator('#hf-dialog').isVisible(),true);assert.ok(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mp.locator('.phone').screenshot({path:path.join(out,'375px-多客服.png')});await mobile.close();
 fs.writeFileSync(path.join(out,'验证结果.json'),JSON.stringify({date:'2026-11-13',status:'passed',results,mobile375:'passed',commonConfigIdentical:true,limitations:['纯静态原型；未接入真实 Web 配置、拨号和反馈工单服务。','反馈数据为各页面独立内存演示，刷新重置。']},null,2));console.log(JSON.stringify(results,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
