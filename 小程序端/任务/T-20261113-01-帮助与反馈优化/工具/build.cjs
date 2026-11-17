const fs=require('fs'),path=require('path'),crypto=require('crypto');
const task=path.resolve(__dirname,'..'),src=path.join(task,'资料/一期原始包/zhixiaohui-ssb-prototypes');
const read=p=>fs.readFileSync(p,'utf8');
function write(p,s){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);}
const parent=read(path.join(src,'parent.html'));
function screen(html,id){const start=html.lastIndexOf('<div class="screen',html.indexOf('id="'+id+'"'));let pos=start,depth=0;const re=/<\/?div\b[^>]*>/g;re.lastIndex=start;let m;while(m=re.exec(html)){depth+=m[0].startsWith('</')?-1:1;if(!depth)return {start,end:re.lastIndex,text:html.slice(start,re.lastIndex)};}throw Error(id);}
const originalHelp=screen(parent,'sc-help').text;
const faqs=[...originalHelp.matchAll(/<div class="faq" data-cat="([^"]+)"><div class="q"[^>]*>(.*?)<span[\s\S]*?<div class="a">([\s\S]*?)<\/div><\/div>/g)].map(m=>({category:m[1],question:m[2].replace(/^【.*?】/,''),answer:m[3]}));
if(faqs.length!==7)throw Error('FAQ extraction');
write(path.join(__dirname,'help-config.js'),'/* 同一份 Web 配置的离线演示回显；无真实后台连接。所有客服均为演示数据。 */\nwindow.ZXH_HELP_CONFIG='+JSON.stringify({school:'市实验一小',faqs,services:{single:[{group:'平台客服',name:'客服中心',phone:'0592-555000',hours:'每周一至周五 09:00–18:00'}],multi:[{group:'代理商客服',name:'林晓宇',phone:'18888888888',hours:'每周一至周五 09:00–18:00'},{group:'代理商客服',name:'陈思远',phone:'18888888888',hours:'每周一至周五 09:00–18:00'},{group:'平台客服',name:'林晓宇',phone:'18888888888',hours:'每周一至周五 09:00–18:00'}]}},null,2)+';\n');
const status=originalHelp.match(/<div class="statusbar">[\s\S]*?<\/div>/)[0];
const capsule='<span class="capsule" style="margin-left:auto"><i>⋯</i><i>◎</i></span>';
function header(title,back){return status+'<div class="sub-hd"><button class="back" aria-label="返回" onclick="'+back+'">‹</button><b>'+title+'</b>'+capsule+'</div>';}
const help='<div class="screen hf-screen" id="sc-help">'+header('帮助与反馈',"hfBackToMe()")+'<div class="body hf-body"><div class="hf-card"><h3>常见问题</h3><div id="hf-faqs"></div></div><div class="hf-card"><h3>联系我们</h3><div class="hf-contacts"><button id="hf-service" onclick="hfContact()"></button><button id="hf-feedback" onclick="go(\'sc-fblist\')"><img src="assets/help-feedback.svg" alt=""><span>反馈建议</span><small>问题与建议</small></button></div></div></div><div hidden class="hf-legacy"><button id="help-cs-btn"></button><button id="help-tel-btn"></button><button id="help-fb-btn"></button></div></div>';
const list='<div class="screen hf-screen" id="sc-fblist">'+header('我的反馈',"go('sc-help')")+'<div class="hf-filters" id="fb-fbar"><button class="on" onclick="fbFilterPick(\'all\',this)">全部</button><button onclick="fbFilterPick(\'已提交\',this)">已提交</button><button onclick="fbFilterPick(\'已回复\',this)">已回复</button></div><div class="body hf-body"><div id="fb-list"></div><div id="fb-empty" class="hf-empty" hidden><div>暂无反馈记录</div><small>有建议或遇到问题，欢迎提交反馈</small></div><div id="fb-nores" class="hf-empty" hidden>暂无该状态的反馈记录</div></div><div class="hf-foot"><button class="hf-primary" onclick="feedbackSheet()">＋ 提交反馈</button></div></div>';
const detail='<div class="screen hf-screen" id="sc-fbdetail">'+header('反馈详情',"go('sc-fblist')")+'<div class="body hf-body" id="fbd-body"></div></div>';
const overlay='<div id="hf-overlay" hidden><section id="hf-dialog" role="dialog" aria-modal="true" tabindex="-1"></section></div><div id="hf-notice" role="status" hidden></div>';
for(const [role,name] of [['teacher','教师'],['parent','家长']]){
 const dest=path.join(task,'端-'+name,'版本-v1.1'),assets=path.join(dest,'assets');fs.mkdirSync(assets,{recursive:true});fs.mkdirSync(path.join(dest,'资料'),{recursive:true});
 const original=read(path.join(src,role+'.html'));let html=original;
 // 完整修改前快照；原始包另行保留。
 const before=path.join(task,'../../版本快照/V-20261113-01',role+'_v20261113_修改前.html');
 if(!fs.existsSync(before))write(before,original);else if(read(before)!==original)throw Error('禁止覆盖已有修改前快照');
 for(const [id,content] of [['sc-help',help],['sc-fblist',list],['sc-fbdetail',detail]]){
  if(html.includes('id="'+id+'"')){const s=screen(html,id);html=html.slice(0,s.start)+content+html.slice(s.end);}else{const at=screen(html,'sc-help').end;html=html.slice(0,at)+'\n'+content+html.slice(at);}
 }
 html=html.replace('</head>','<link rel="stylesheet" href="assets/help-v1.css">\n</head>');
 html=html.replace('</body>',overlay+'<script>window.ZXH_HELP_ROLE="'+role+'";</script><script src="assets/help-config.js"></script><script src="assets/help-v1.js"></script>\n</body>');
 // 弹窗必须在手机壳内部，保持缩放及裁切一致。
 html=html.replace(overlay,'');const phoneClose=html.indexOf('<script src="assets/demo-panel.js"');
 // 在第一个外部脚本之前寻找手机壳闭合标签，将覆盖层挂入手机壳（运行时移入）。
 html=html.replace('<script>window.ZXH_HELP_ROLE=',overlay+'<script>window.ZXH_HELP_ROLE=');
 write(path.join(dest,'index.html'),html);
 const referenced=[...fs.readdirSync(path.join(src,'assets'))].filter(n=>!n.startsWith('admin-')&&!n.startsWith(role==='teacher'?'parent.':'teacher.'));
 for(const n of referenced){fs.copyFileSync(path.join(src,'assets',n),path.join(assets,n));}
 for(const n of ['help-v1.js','help-v1.css','help-config.js','help-phone.svg','help-feedback.svg'])fs.copyFileSync(path.join(__dirname,n),path.join(assets,n));
 // 原型原有跨身份相对地址：使用透明跳转兼容，不改原业务脚本。
 for(const other of ['teacher','parent'])write(path.join(dest,other+'.html'),'<!doctype html><meta charset="utf-8"><title>身份切换</title><script>location.replace('+JSON.stringify(other===role?'index.html':'../../端-'+(other==='teacher'?'教师':'家长')+'/版本-v1.1/index.html')+'+location.search+location.hash)</script>');
 write(path.join(dest,'资料/来源与范围.md'),'# 来源与范围\n原始资料：../../../资料/第一期原始包.zip。参考图：../../../资料/参考图1.png、参考图2.png。\n只改 sc-help、sc-fblist、sc-fbdetail 及新增 help-* 资源。原有我的 Tab、业务 JS/CSS 保留。\n两端配置文件内容完全一致，模拟同校 Web 配置回显；反馈记录仅内存存储、按当前端角色分开，刷新恢复。客服电话/工时/姓名均为演示值。\n');
}
write(path.join(task,'预览入口.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>智小徽 · 帮助与反馈优化</title><style>body{font:16px/1.8 "Microsoft YaHei",sans-serif;max-width:850px;margin:70px auto;padding:24px;background:#f2f7f5;color:#192b2b}a{display:inline-block;background:white;color:#087a40;padding:18px 26px;margin:8px;border-radius:14px}p{color:#61766a}</style><h1>智小徽 · 帮助与反馈优化</h1><p>第一期优化 v1.1 · 待验收。客服资料均为演示数据，点击电话模拟拨号。</p>'+['教师','家长'].map(n=>'<h2>'+n+'小程序</h2><a href="端-'+n+'/版本-v1.1/index.html?service=single#sc-help">场景一 · 单客服</a><a href="端-'+n+'/版本-v1.1/index.html?service=multi#sc-help">场景二 · 多客服</a>').join('')+'<p>「我的」Tab 保持原样。通过帮助页的原型演示说明也可切换客服场景；原有其他端入口仍保留于第一期原始包中。</p></html>');
console.log(JSON.stringify({task,faqs:faqs.length,roles:2}));
