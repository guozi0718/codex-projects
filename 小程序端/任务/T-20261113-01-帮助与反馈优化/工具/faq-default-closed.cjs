const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const {pathToFileURL}=require('url');
const task=path.resolve(__dirname,'..'),root=path.resolve(task,'../..'),snap=path.join(root,'版本快照/V-20261113-02');
const read=p=>fs.readFileSync(p,'utf8'),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const write=(p,s)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);};
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const note='2026-11-13｜本聊天浏览器批注：常见问题全部默认关闭，不需要第一个默认打开。两端同步修改，点击展开/收起保留；v1.1只读保留，新增v1.2。';
if(process.argv[2]==='prepare'){
 fs.mkdirSync(snap,{recursive:true});
 // 在原任务内登记本次明确修订，避免建立第二个业务范围。
 for(const relative of ['项目管理/任务登记.md','项目管理/里程碑.md','项目管理/待办清单.md','记忆库/项目记忆/非正式共识.md',path.relative(root,path.join(task,'任务信息.md')),path.relative(root,path.join(task,'变更记录.md')),path.relative(root,path.join(task,'定版信息.md'))]){
  const p=path.join(root,relative),name=relative.replace(/[\\/]/g,'_');fs.copyFileSync(p,path.join(snap,name+'_修改前.md'),fs.constants.COPYFILE_EXCL);
  fs.appendFileSync(p,'\n\n## v1.2 明确修订（T-20261113-01 / 日志002）\n'+note+'\n验收标准：首次进入和刷新均7条收起；每条点击可展开并再次收起；其余功能和内容继承v1.1。状态：实现与验证中，交付待用户验收。\n');
 }
 for(const name of ['教师','家长']){
  const before=path.join(task,'端-'+name,'版本-v1.1'),after=path.join(task,'端-'+name,'版本-v1.2');if(fs.existsSync(after))throw Error('新版本目录已存在');fs.cpSync(before,after,{recursive:true});
  const p=path.join(after,'assets/help-v1.js'),old=read(p);
  fs.writeFileSync(path.join(snap,name+'-help-v1_修改前.js'),old,{flag:'wx'});
  const updated=old.replace("'+(i===0)+'",'false').replace("'+(i===0?'−':'+')+'",'+').replace("'+(i===0?'':' hidden')+'",' hidden');
  assert.notEqual(updated,old);assert.ok(!updated.includes('i===0'));write(p,updated);
  for(const alias of ['teacher.html','parent.html']){const a=path.join(after,alias);write(a,read(a).replaceAll('版本-v1.1','版本-v1.2'));}
  const doc=path.join(after,'定版信息.md');write(doc,read(doc).replaceAll('v1.1','v1.2').replace('首条展开','全部默认收起')+'\n## 本次变更依据\n'+note+'\n继承自同端v1.1；仅FAQ初始展开状态改变，内容、顺序、客服及反馈流程不变。页面交付待验收。\n');
  const source=path.join(after,'资料/来源与范围.md');write(source,read(source)+'\nv1.2继承同端v1.1，本次仅将所有常见问题默认收起。\n');
 }
 write(path.join(task,'预览入口-v1.2.html'),read(path.join(task,'预览入口.html')).replaceAll('版本-v1.1','版本-v1.2').replaceAll('v1.1','v1.2'));
 write(path.join(task,'使用说明-v1.2.md'),read(path.join(task,'使用说明.md')).replace('预览入口.html','预览入口-v1.2.html')+'\n版本v1.2：所有常见问题初始收起，点击展开/收起，刷新恢复全部收起。\n');
 console.log('v1.2准备完成');
}else if(process.argv[2]==='verify'){
 (async()=>{
  const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1112-737-0_26.1112.737.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
  const browser=await chromium.launch({headless:true}),ctx=await browser.newContext({viewport:{width:1000,height:900}}),checks=[];
  const evidence=path.join(task,'资料/验证-v1.2');fs.mkdirSync(evidence,{recursive:true});
  try{for(const name of ['教师','家长']){
   const oldDir=path.join(task,'端-'+name,'版本-v1.1'),newDir=path.join(task,'端-'+name,'版本-v1.2');
   const changes=[];for(const p of walk(oldDir)){const rel=path.relative(oldDir,p);if(hash(p)!==hash(path.join(newDir,rel)))changes.push(rel.replaceAll('\\','/'));}
   assert.deepEqual(changes.sort(),['assets/help-v1.js','定版信息.md','资料/来源与范围.md',name==='教师'?'parent.html':'teacher.html'].sort());
   const old=read(path.join(oldDir,'assets/help-v1.js')),next=read(path.join(newDir,'assets/help-v1.js'));
   assert.equal(next,old.replace("'+(i===0)+'",'false').replace("'+(i===0?'−':'+')+'",'+').replace("'+(i===0?'':' hidden')+'",' hidden'));
   for(const scene of ['single','multi']){
    const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.join(newDir,'index.html')).href+'?service='+scene+'#sc-help');
    const closed=async()=>{assert.equal(await page.locator('.hf-question').count(),7);assert.equal(await page.locator('.hf-question[aria-expanded="false"]').count(),7);assert.equal(await page.locator('.hf-answer:visible').count(),0);assert.ok((await page.locator('.hf-question i').allTextContents()).every(t=>t==='+'));};
    await closed();for(let i=0;i<7;i++){const q=page.locator('.hf-question').nth(i),a=page.locator('.hf-answer').nth(i);await q.click();assert.equal(await a.isVisible(),true);assert.equal(await q.getAttribute('aria-expanded'),'true');await q.click();assert.equal(await a.isVisible(),false);}
    await page.locator('.hf-question').first().click();await page.reload();await closed();
    await page.locator('#sc-help .body').evaluate(el=>el.scrollTop=0);await page.locator('.phone').screenshot({path:path.join(evidence,name+'-'+scene+'-默认收起.png')});assert.deepEqual(errors,[]);await page.close();checks.push({role:name,scene,initialAllClosed:true,allSevenToggle:true,refreshAllClosed:true,errors});
   }
  }}finally{await browser.close();}
  write(path.join(evidence,'验证结果.json'),JSON.stringify({status:'passed',checks,onlyBehaviorChange:'FAQ全部默认收起',otherFiles:'除版本说明及跨身份版本路径外与v1.1哈希一致'},null,2));console.log(JSON.stringify(checks));
 })().catch(e=>{console.error(e);process.exitCode=1;});
}else if(process.argv[2]==='finish'){
 const results=JSON.parse(read(path.join(task,'资料/验证-v1.2/验证结果.json')));assert.equal(results.status,'passed');
 const metadata=['项目管理/任务登记.md','项目管理/里程碑.md','项目管理/待办清单.md','记忆库/项目记忆/非正式共识.md',path.relative(root,path.join(task,'任务信息.md')),path.relative(root,path.join(task,'变更记录.md')),path.relative(root,path.join(task,'定版信息.md'))];
 for(const rel of metadata){const p=path.join(root,rel);fs.appendFileSync(p,'\n结果：v1.2修改和浏览器验证已完成，双端×两场景首次/刷新均默认收起，7条问题逐项展开/收起通过；其他业务资源哈希一致。待用户页面验收。\n');fs.copyFileSync(p,path.join(snap,rel.replace(/[\\/]/g,'_')+'_修改后.md'),fs.constants.COPYFILE_EXCL);}
 for(const name of ['教师','家长']){
  const dir=path.join(task,'端-'+name,'版本-v1.2');fs.copyFileSync(path.join(dir,'assets/help-v1.js'),path.join(snap,name+'-help-v1_修改后.js'),fs.constants.COPYFILE_EXCL);
  const manifest=path.join(dir,'资料/文件清单-SHA256.json');write(manifest,JSON.stringify(walk(dir).filter(p=>p!==manifest).map(p=>({path:path.relative(dir,p).replaceAll('\\','/'),sha256:hash(p)})),null,2));
 }
 write(path.join(snap,'变更说明.md'),'# V-20261113-02\n任务T-20261113-01续修，日志002。\n'+note+'\n只将renderHelp中的aria-expanded、加减号、答案hidden默认值改为全部关闭；hfFaq点击逻辑、问题文案与顺序、客服和反馈不变。v1.1原件未覆盖。新v1.2跨身份兼容跳转指向同版本，清单和说明同步。\n验证见任务资料/验证-v1.2/验证结果.json。\n');
 console.log('管理记录与修改后快照已完成；待打包及最后日志');
}else if(process.argv[2]==='log'){
 const all=[...walk(path.join(task,'端-教师/版本-v1.2')),...walk(path.join(task,'端-家长/版本-v1.2')),...walk(path.join(task,'资料/验证-v1.2')),...walk(snap),path.join(task,'预览入口-v1.2.html'),path.join(task,'使用说明-v1.2.md'),path.join(task,'智小徽-帮助与反馈-v1.2.zip'),__filename];
 const index=path.join(root,'版本快照/快照索引.md');fs.appendFileSync(index,'\n\n## V-20261113-02 / FAQ默认收起 / 日志002\n\n| 文件 | SHA-256 |\n|---|---|\n'+all.map(p=>'| '+path.relative(root,p).replaceAll('\\','/')+' | '+hash(p)+' |').join('\n')+'\n');
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date()).replace(' ','T')+'-08:00';
 fs.appendFileSync(path.join(root,'日志管理.md'),'\n---\n编号：002\n时间：'+stamp+'\n会话标识：智小徽-帮助与反馈-浏览器批注-20261113\n变更类型：Changed\n任务：T-20261113-01续修\n变更原因：用户批注明确要求全部默认关闭，不需要第一个默认打开。\n变更细节：新增教师/家长v1.2，只改FAQ初始化为全部收起，保留点击展开收起；跨身份跳转路径适配新版本；旧v1.1不覆盖。\n影响范围：小程序项目帮助模块，不修改客服管理/运营后台项目。\n验证：双端×单多客服4场景，首次及刷新7条均收起，每条展开收起通过；无运行错误。其他业务资源与v1.1哈希一致。\n关联文件：任务/T-20261113-01-帮助与反馈优化/端-教师/版本-v1.2、端-家长/版本-v1.2、预览入口-v1.2.html、智小徽-帮助与反馈-v1.2.zip、资料/验证-v1.2；版本快照/V-20261113-02；相关任务/记忆/管理记录已追加。\n状态：已实现并验证，待用户验收。\n---\n');
 console.log('完成，最后写入日志002');
}else throw Error('unknown phase');
