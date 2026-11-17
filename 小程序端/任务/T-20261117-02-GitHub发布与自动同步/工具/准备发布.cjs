const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
const root=path.resolve(__dirname,'../../..');
const config=JSON.parse(fs.readFileSync(path.join(root,'GitHub发布配置.json'),'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const output=path.resolve(root,config.release.directory);
if(!output.startsWith(root+path.sep))throw Error('发布目录必须位于项目内');
const planned=new Map();
function copyTree(src,rel){for(const item of fs.readdirSync(src,{withFileTypes:true})){const f=path.join(src,item.name),r=path.posix.join(rel,item.name);if(item.isSymbolicLink())throw Error('发布不跟随符号链接');if(item.isDirectory())copyTree(f,r);else planned.set(r,fs.readFileSync(f));}}
for(const end of config.release.ends)copyTree(path.join(root,end.source),end.destination);
copyTree(config.release.noticeSource,'通知模块');
const adaptations=[];
for(const end of config.release.ends){
  const prefix=end.destination;
  const changelog=path.join(root,'任务/T-20261113-01-帮助与反馈优化/资料/一期原始包/zhixiaohui-ssb-prototypes/changelog.html');
  planned.set(path.posix.join(prefix,'changelog.html'),fs.readFileSync(changelog));
  for(const role of config.release.ends){const name=role.role+'.html',r=path.posix.join(prefix,name);const target=role.role===end.role?'index.html':path.posix.relative(prefix,role.destination)+'/index.html';planned.set(r,Buffer.from('<!doctype html><meta charset="utf-8"><title>身份切换</title><script>location.replace('+JSON.stringify(target)+'+location.search+location.hash)</script>'));adaptations.push(r+'：桥接本发布版本对应端');}
  const rel=path.posix.join(prefix,'assets/notice-entry.js'),old=planned.get(rel).toString();
  const replacement="new URL('../../通知模块/index.html',document.baseURI)";
  if(!old.includes("new URL('/notice/index.html',location.origin)"))throw Error('通知入口与适配前提不符');
  planned.set(rel,Buffer.from(old.replace("new URL('/notice/index.html',location.origin)",replacement)));
  adaptations.push(rel+'：将本机根目录通知地址适配为发布包相对路径');
}
const manifest={id:config.release.id,status:config.release.status,sourceVersion:config.release.sourceVersion,adaptations,files:[...planned].map(([file,b])=>({file,bytes:b.length,sha256:sha(b)}))};
planned.set('发布清单.json',Buffer.from(JSON.stringify(manifest,null,2)));
planned.set('发布说明.md',Buffer.from('# '+config.release.id+'\n\n状态：'+config.release.status+'。线上预览发布不等于用户页面定版。\n来源：'+config.release.sourceVersion+'。活动基线指针保持原样。\n仅适配身份切换与通知相对路径；业务HTML、CSS及其他JS原样继承。通知模块为既有依赖V11的只读发布副本，未改其源项目。\n原始项目、历史版本和快照与发布目录并存。\n'));
let refresh=false;
if(process.argv.includes('--refresh-unpublished')){const repo=path.join(root,config.cloneDirectory),r=cp.spawnSync('git',['ls-files','--',config.repositoryDirectory+'/'+config.release.directory],{cwd:repo,encoding:'utf8',windowsHide:true});if(r.status!==0||r.stdout.trim())throw Error('已纳入Git的版本不得原位重建');refresh=true;}
for(const [r,b]of planned){const dest=path.join(output,r);if(fs.existsSync(dest)){if(sha(fs.readFileSync(dest))!==sha(b)){if(!refresh)throw Error('不可变发布已有差异，必须新建发布编号：'+r);fs.writeFileSync(dest,b);}}else{fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,b);}}
const links={release:config.release.id,status:config.release.status,sourceVersion:config.release.sourceVersion,entries:config.release.ends.map(e=>({name:e.name,entry:config.pagesBase+config.release.directory+'/'+e.destination+'/index.html',home:config.pagesBase+config.release.directory+'/'+e.destination+'/index.html#sc-home',feedback:config.pagesBase+config.release.directory+'/'+e.destination+'/index.html#sc-fblist'}))};
const update=(f,content)=>{fs.mkdirSync(path.dirname(f),{recursive:true});if(!fs.existsSync(f)||fs.readFileSync(f,'utf8')!==content)fs.writeFileSync(f,content);};
for(const e of config.release.ends)update(path.join(root,e.name,'index.html'),'<!doctype html><meta charset="utf-8"><title>智小徽'+e.name+'端</title><script>location.replace('+JSON.stringify('../'+config.release.directory+'/'+e.destination+'/index.html')+'+location.search+location.hash)</script>');
update(path.join(root,'线上原型链接.json'),JSON.stringify(links,null,2));
console.log(JSON.stringify({release:config.release.id,files:planned.size,output,adaptations}));
