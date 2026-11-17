/* 第一期间帮助与反馈优化；只作用于本模块。Web 配置与拨号均为离线演示。 */
(function(){
 'use strict';
 const role=window.ZXH_HELP_ROLE,config=window.ZXH_HELP_CONFIG,$=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const overlay=$('hf-overlay'),dialog=$('hf-dialog'),notice=$('hf-notice');
 document.querySelector('.phone').append(overlay,notice);
 let scene=new URLSearchParams(location.search).get('service')==='multi'?'multi':'single';
 let serviceOverride=null,filter='all',emptyPreview=false,upload=[],type='功能建议',timer,previousFocus=null,detailKey='';
 // 两端示例独立；用户提交始终关联当前角色，不借用家长身份或孩子归属。
 const records=role==='teacher'?{
  open:{ty:'功能建议',st:'已提交',txt:'希望能按班级导出考勤汇总，便于核对学生出勤情况。',time:'今天 09:21'},
  replied:{ty:'问题反馈',st:'已回复',txt:'有学生已到校，但考勤记录延迟显示，请协助核查。',time:'07-02 19:45',images:['assets/photo-cap.jpg'],reply:'您好，已核查该时段记录上传情况。如再次遇到，请提供班级及发生时间，方便进一步排查。',replyTime:'07-03 15:26 · 客服中心'},
  suggest:{ty:'功能建议',st:'已回复',txt:'希望能更方便地查看本班待处理的请假申请。',time:'06-24 21:10',reply:'感谢您的建议，我们已记录并转交相关人员评估。',replyTime:'今天 14:32 · 客服中心'}
 }:{
  open:{ty:'功能建议',st:'已提交',txt:'放学播报希望能提前 5 分钟提醒我出发接孩子。',time:'今天 09:21'},
  replied:{ty:'问题反馈',st:'已回复',txt:'孩子明明 7:40 就进校了，到校提醒 8 点才收到，最近一周有两三次这样，麻烦看看。',time:'07-02 19:45',images:['assets/photo-cap.jpg'],reply:'您好，经排查为雨天网络波动导致个别到校记录延迟上传，已于 7月3日 优化重传策略；如再遇到延迟欢迎随时反馈。',replyTime:'07-03 15:26 · 客服中心'},
  suggest:{ty:'功能建议',st:'已回复',txt:'希望能按学期导出孩子的出勤记录，开家长会前想自己看一遍。',time:'06-24 21:10',reply:'感谢您的建议！按学期导出出勤记录已列入功能规划，上线后将第一时间通知您，请留意消息通知。',replyTime:'今天 14:32 · 客服中心'}
 };
 Object.values(records).forEach(r=>r.role=role);
 let order=['open','replied','suggest'];
 function notify(message){clearTimeout(timer);notice.textContent=message;notice.hidden=false;timer=setTimeout(()=>notice.hidden=true,2400);}
 function show(title,body){previousFocus=document.activeElement;dialog.innerHTML='<div class="hf-dialog-head"><span id="hf-dialog-title">'+esc(title)+'</span><button class="hf-close" aria-label="关闭弹窗" onclick="hfClose()">×</button></div>'+body;dialog.setAttribute('aria-labelledby','hf-dialog-title');const head=dialog.querySelector('.hf-dialog-head'),footer=dialog.querySelector('.hf-form-actions'),scroll=document.createElement('div');scroll.className='hf-dialog-scroll';scroll.tabIndex=0;scroll.setAttribute('aria-label','弹窗正文');[...dialog.childNodes].filter(n=>n!==head&&n!==footer).forEach(n=>scroll.append(n));dialog.append(scroll);if(footer)dialog.append(footer);overlay.hidden=false;dialog.focus();}
 window.hfClose=function(){overlay.hidden=true;if(previousFocus?.isConnected)previousFocus.focus();};
 overlay.addEventListener('click',e=>{if(e.target===overlay)hfClose();});
 document.addEventListener('keydown',e=>{
  if(overlay.hidden)return;
  if(e.key==='Escape'){e.preventDefault();hfClose();}
  if(e.key==='Tab'){
   const focusable=[...dialog.querySelectorAll('button,input,textarea,a[href]')].filter(el=>!el.hidden&&el.getClientRects().length);
   if(!focusable.length){e.preventDefault();dialog.focus();return;}
   const first=focusable[0],last=focusable.at(-1);
   if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===dialog)){e.preventDefault();first.focus();}
  }
 });
 window.hfBackToMe=function(){if(role==='parent')goTab('sc-me');else go('sc-me');};
 function renderHelp(){
  $('hf-faqs').innerHTML=config.faqs.map((f,i)=>'<div class="hf-faq"><button class="hf-question" aria-expanded="false" aria-controls="hf-answer-'+i+'" onclick="hfFaq(this)"><span>'+esc(f.question)+'</span><i aria-hidden="true">+</i></button><div id="hf-answer-'+i+'" class="hf-answer" hidden>'+esc(f.answer)+'</div></div>').join('');
  renderService();
 }
 window.hfFaq=function(button){const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));button.querySelector('i').textContent=open?'−':'+';button.nextElementSibling.hidden=!open;};
 function services(){return serviceOverride||config.services[scene];}
 function renderService(){const agents=services(),a=agents[0];$('hf-service').innerHTML='<img src="assets/help-phone.svg" alt=""><span>客服电话</span>'+(agents.length===1?'<strong>'+esc(a.phone)+'</strong><small>'+esc(a.hours)+'</small>':'');}
 window.hfSetService=function(value){scene=value==='multi'?'multi':'single';serviceOverride=null;const url=new URL(location.href);url.searchParams.set('service',scene);history.replaceState(null,'',url);hfClose();renderService();notify(scene==='single'?'已切换为单客服演示':'已切换为多客服演示');};
 window.hfContact=function(){
  const agents=services();if(!agents.length){notify('暂无客服信息');return;}
  if(agents.length===1){hfDial(0);return;}
  const groups=[...new Set(agents.map(a=>a.group))];
  show('联系客服',groups.map(group=>'<div class="hf-service-card"><h4>'+esc(group)+'</h4>'+agents.map((a,i)=>a.group===group?'<div class="hf-agent"><div><div class="hf-agent-name"><b>'+esc(a.name)+'</b><span>'+esc(a.phone)+'</span></div><small>'+esc(a.hours)+'</small></div><button class="hf-dial" onclick="hfDial('+i+')" aria-label="拨打'+esc(a.name)+'的电话">拨打</button></div>':'').join('')+'</div>').join(''));
 };
 window.hfDial=function(i){const agent=services()[i];if(!agent)return;/* HTML 原型沿用模拟拨号，避免拨打参考图中的演示号码。 */notify('演示拨号：'+agent.phone);window.dispatchEvent(new CustomEvent('zxh:help-dial',{detail:{phone:agent.phone,role}}));};
 function badge(r){return '<span class="hf-badge'+(r.st==='已回复'?' replied':'')+'">'+r.st+'</span>';}
 function renderList(){
  const all=emptyPreview?[]:order.filter(k=>records[k].role===role),visible=all.filter(k=>filter==='all'||records[k].st===filter);
  $('fb-fbar').hidden=!all.length;$('fb-empty').hidden=all.length>0;$('fb-nores').hidden=!all.length||visible.length>0;
  $('fb-list').innerHTML=visible.map(k=>{const r=records[k];return '<button class="hf-card hf-record" data-record="'+k+'" onclick="openFbDetail(\''+k+'\')"><div class="hf-record-head"><b>'+r.ty+'</b>'+badge(r)+'</div><div class="hf-record-summary">'+esc(r.txt)+'</div><div class="hf-record-time">'+esc(r.time)+'</div></button>';}).join('');
  document.querySelectorAll('#fb-fbar button').forEach((b,i)=>b.classList.toggle('on',['all','已提交','已回复'][i]===filter));
 }
 window.fbFilterPick=function(value){filter=value;renderList();};
 window.fbApplyFilter=renderList;window.fbFilterReset=function(){filter='all';renderList();};
 window.fbEmptyToggle=function(){emptyPreview=!emptyPreview;filter='all';renderList();};
 window.openFbDetail=function(key){
  const r=records[key];if(!r||r.role!==role){notify('该反馈记录不可查看');return;}
  detailKey=key;
  $('fbd-body').innerHTML='<div class="hf-card"><div class="hf-record-head"><b>'+r.ty+'</b>'+badge(r)+'</div><div class="hf-detail-text">'+esc(r.txt)+'</div>'+(r.images?.length?'<div class="hf-images">'+r.images.map((image,i)=>'<button onclick="hfPreview('+i+')" aria-label="查看反馈截图"><img src="'+esc(image)+'" alt="反馈截图"></button>').join('')+'</div>':'')+'</div><div class="hf-card"><h3>处理进展</h3><div class="hf-timeline"><b>提交</b><small>'+esc(r.time)+'</small>'+(r.reply?'<p><b>回复</b><small>'+esc(r.replyTime)+'</small>'+esc(r.reply)+'</p>':'')+'</div></div>';
  go('sc-fbdetail');
 };
 window.hfPreview=function(i){const image=records[detailKey]?.images?.[i];if(image)show('反馈截图','<img class="hf-image-large" src="'+esc(image)+'" alt="反馈截图大图">');};
 window.fbShot=function(){hfPreview(0);};
 window.feedbackSheet=function(){
  type='功能建议';upload=[];
  show('反馈建议','<div class="hf-types"><button class="on" onclick="hfType(this,\'功能建议\')">功能建议</button><button onclick="hfType(this,\'问题反馈\')">问题反馈</button></div><textarea id="fb-txt" rows="4" aria-label="反馈内容" placeholder="请描述您的建议或遇到的问题"></textarea><div class="hf-form-label">上传图片（可选） · 最多 5 张，最大 10 MB/张</div><div id="hf-uploads" class="hf-upload-grid"></div><input id="hf-file" type="file" accept="image/*" multiple hidden><div class="hf-form-actions"><button class="hf-secondary" onclick="hfClose()">取消</button><button class="hf-primary" id="hf-submit" onclick="feedbackSubmit()">提交</button></div>');
  $('hf-file').addEventListener('change',async e=>{
   const submit=$('hf-submit');submit.disabled=true;
   try{for(const f of e.target.files){
    if(upload.length>=5){notify('最多上传 5 张图片');break;}
    if(!f.type.startsWith('image/')){notify('请选择图片文件');continue;}
    if(f.size>10*1024*1024){notify('单张图片不能超过 10 MB');continue;}
    const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(f);});upload.push(data);
   }}catch{notify('图片读取失败，请重试');}finally{e.target.value='';submit.disabled=false;if(!overlay.hidden)renderUploads();}
  });
  renderUploads();
 };
 window.hfType=function(button,value){type=value;dialog.querySelectorAll('.hf-types button').forEach(b=>b.classList.toggle('on',b===button));};
 function renderUploads(){$('hf-uploads').innerHTML=upload.map((image,i)=>'<div class="hf-upload-item"><img src="'+esc(image)+'" alt="待提交截图"><button aria-label="移除第'+(i+1)+'张图片" onclick="hfRemoveUpload('+i+')">×</button></div>').join('')+(upload.length<5?'<button class="hf-upload-add" aria-label="上传图片" onclick="document.getElementById(\'hf-file\').click()">＋</button>':'');}
 window.hfRemoveUpload=function(i){upload.splice(i,1);renderUploads();};
 window.feedbackSubmit=function(){
  const txt=$('fb-txt').value.trim();if(!txt){notify('请填写反馈内容');$('fb-txt').focus();return;}
  const key='new-'+Date.now(),time='今天 '+new Intl.DateTimeFormat('zh-CN',{timeZone:'America/Los_Angeles',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
  records[key]={role,ty:type,st:'已提交',txt,time,images:upload.slice()};order.unshift(key);emptyPreview=false;filter='all';hfClose();go('sc-fblist');renderList();notify('已提交，感谢您的反馈');
 };
 // 兼容原导航和消息中的反馈落点，仅为本模块补充刷新与缺省详情。
 const originalGo=window.go;window.go=function(id){if(!overlay.hidden)hfClose();originalGo(id);if(id==='sc-fblist')renderList();};
 window.csEntryOn=()=>false;window.applyCsEntry=()=>{$('help-cs-btn').style.display='none';};window.toggleCsEntry=()=>{};
 const description='「我的」Tab 保持第一期原样。本页标题为帮助与反馈；常见问题为同一套 Web 配置的离线回显（沿用家长端原有七条问题，两端内容一致）。\n【客服电话】学校仅配置一人时展示电话和工作时间，点击直接模拟拨号；多人时入口不显示号码和工作时间，点击打开底部弹窗，按代理商客服、平台客服分组，无人员的分组不显示。\n【反馈建议】两端共用版式与流程，反馈按教师 / 家长角色区分；支持列表筛选、空态、提交内容与图片、详情与回复。原型数据仅本页面内存保存，刷新重置；未连接 Web 后台，客服姓名、号码和工作时间均为参考图演示值。在线客服隐藏。';
 if(typeof demoInfo!=='undefined'){
  demoInfo['sc-help']={t:'帮助与反馈',d:description,a:[['场景一 · 单客服',"hfSetService('single')"],['场景二 · 多客服',"hfSetService('multi')"]]};
  demoInfo['sc-fblist']={t:'我的反馈',d:'当前 '+(role==='teacher'?'教师':'家长')+' 身份的反馈记录，布局与交互两端一致。记录按角色隔离，支持状态筛选、空态、提交反馈，刷新后演示记录重置。',a:[['切换空态预览','fbEmptyToggle()']]};
  demoInfo['sc-fbdetail']={t:'反馈详情',d:'从我的反馈列表点击具体记录进入，展示当前角色的反馈全文、截图及处理进展。\n【入口与返回】返回原反馈列表，不另建重复列表；记录无效时不借用其他记录内容。\n【状态与内容】待回复、已回复按当前记录展示；回复时间、正文和截图按记录回显，点击截图查看原图，关闭回详情。\n【演示边界】当前HTML记录按角色隔离，刷新恢复示例；不代表真实受理或消息送达。',a:[]};
 }
 // 仅供本地验证，配置测试不持久化、不影响 Web 或其他模块。
 window.ZXH_HELP_PREVIEW={role,getRecords:()=>order.map(k=>({key:k,...records[k]})),setServices:agents=>{serviceOverride=agents;renderService();},getScene:()=>scene};
 renderHelp();renderList();if(location.hash==='#sc-fbdetail')openFbDetail('open');
})();
