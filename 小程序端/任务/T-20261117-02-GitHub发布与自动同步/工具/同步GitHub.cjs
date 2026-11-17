const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const root=path.resolve(__dirname,'../../..'),cfg=JSON.parse(fs.readFileSync(path.join(root,'GitHub发布配置.json'),'utf8'));
const repo=path.resolve(root,cfg.cloneDirectory),prefix=cfg.repositoryDirectory;
const push=process.argv.includes('--push'),prepare=process.argv.includes('--prepare');
const git=(args,allowFailure=false)=>{const r=cp.spawnSync('git',args,{cwd:repo,encoding:'utf8',windowsHide:true,env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'never'},maxBuffer:12*1024*1024});if(r.status!==0&&!allowFailure)throw Error((r.stderr||r.stdout||'Git失败').trim());return{status:r.status,out:args.includes('-z')?r.stdout:r.stdout.trim()};};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
if(!fs.existsSync(path.join(repo,'.git')))throw Error('请先将指定仓库克隆到配置的隔离工作区，不能初始化或重置主项目');
if(git(['remote','get-url','origin']).out!==cfg.repository)throw Error('远程仓库不匹配');
if(git(['branch','--show-current']).out!=='main')throw Error('只能同步main分支；先处理未完成的分支或rebase');
git(['config','core.autocrlf','false']);git(['config','core.longpaths','true']);
git(['config','user.name','guozi0718']);git(['config','user.email','308202363+guozi0718@users.noreply.github.com']);
const dirty=git(['status','--porcelain','-z']).out;
for(const entry of dirty.split('\0').filter(Boolean)){const f=entry.slice(3);if(f!==prefix&&!f.startsWith(prefix+'/'))throw Error('仓库有其他项目未提交改动，停止：'+f);}
if(!dirty){git(['fetch','origin','main']);git(['merge','--ff-only','origin/main']);}
const excluded=cfg.excludeDirectories.map(r=>path.resolve(root,r));
let count=0,bytes=0,changed=0;
const secret=/gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|sk-proj-[A-Za-z0-9_-]{20,}/;
function copy(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const src=path.join(dir,e.name);if(e.isSymbolicLink())throw Error('不自动发布符号链接：'+src);if(e.isDirectory()){if(['.git','node_modules'].includes(e.name)||excluded.some(d=>src===d||src.startsWith(d+path.sep)))continue;copy(src);continue;}if(/^\.env(?:\.|$)/.test(e.name)||/\.(pem|key)$/i.test(e.name))throw Error('发现需人工核对的私密文件：'+path.relative(root,src));const b=fs.readFileSync(src);if(/\.(js|json|md|ps1|html|cjs|yaml|yml)$/i.test(e.name)&&secret.test(b.toString('utf8')))throw Error('发现疑似凭据，停止发布：'+path.relative(root,src));if(b.length>=95*1024*1024)throw Error('文件过大，需另行处理：'+src);const dest=path.join(repo,prefix,path.relative(root,src));count++;bytes+=b.length;if(!fs.existsSync(dest)||sha(fs.readFileSync(dest))!==sha(b)){fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,b);changed++;}}}
copy(root);
const attrs=path.join(repo,prefix,'.gitattributes');if(!fs.existsSync(attrs))fs.writeFileSync(attrs,'* -text\n');
git(['add','--',prefix]);
const staged=git(['diff','--cached','--name-only','-z']).out.split('\0').filter(Boolean);
if(staged.some(x=>!x.startsWith(prefix+'/')))throw Error('暂存区包含授权目录以外内容');
if(!push){console.log(JSON.stringify({mode:prepare?'prepared':'check',files:count,bytes,changed,staged:staged.length}));process.exit(0);}
if(staged.length)git(['commit','-m',process.env.MINIAPP_COMMIT_MESSAGE||'publish(小程序端): '+cfg.release.id+' with project history']);
let pushed=false;
for(let attempt=0;attempt<3;attempt++){git(['fetch','origin','main']);git(['rebase','origin/main']);const r=git(['push','origin','HEAD:main'],true);if(r.status===0){pushed=true;break;}}
if(!pushed)throw Error('普通推送失败，已保留本地提交；禁止强制推送');
const commit=git(['rev-parse','HEAD']).out;
if(process.argv.includes('--tag')){const tag='miniapp-'+cfg.release.id;const existing=git(['rev-parse','--verify','refs/tags/'+tag],true);if(existing.status!==0)git(['tag','-a',tag,'-m','小程序端 '+cfg.release.id+'；'+cfg.release.status]);else if(git(['rev-list','-n','1',tag]).out!==commit)throw Error('发布标签已存在且不同，禁止覆盖');git(['push','origin','refs/tags/'+tag]);}
console.log(JSON.stringify({mode:'pushed',commit,files:count,bytes,changed,staged:staged.length,release:cfg.release.id,pages:cfg.pagesBase,tag:process.argv.includes('--tag')?'miniapp-'+cfg.release.id:null}));
