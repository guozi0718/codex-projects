/* 反馈一期候选：家长/教师共用交互，角色与提交上下文分离；仅本地演示，不连接真实接口。 */
(function(){
 'use strict';
 const role=window.ZXH_HELP_ROLE,config=window.ZXH_HELP_CONFIG,$=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const overlay=$('hf-overlay'),dialog=$('hf-dialog'),notice=$('hf-notice');
 document.querySelector('.phone').append(overlay,notice);
 let scene=new URLSearchParams(location.search).get('service')==='multi'?'multi':'single';
 let serviceOverride=null,filter='all',emptyPreview=false,type='功能建议',timer,previousFocus=null,detailKey='',draft=null,eligibilityOverride=null,previewImageSrc='';
 const who=role==='teacher'?'教师':'家长';
 const sampleSchool='市实验一小';
 const records=role==='teacher'?{
  open:{id:'FB-DEMO-T-001',role,ty:'问题反馈',title:'考勤记录延迟显示',school:'市实验一小',student:'--',time:'2026-11-15 09:21:00',submitter:'王瑶老师',messages:[{id:'TM-001',kind:'submit',actor:'王瑶老师',time:'2026-11-15 09:21:00',body:'有学生已到校，但考勤记录延迟显示，请协助核查。',attachments:[]}]},
  replied:{id:'FB-DEMO-T-002',role,ty:'问题反馈',title:'到校提醒延迟',school:'市实验一小',student:'--',time:'2026-11-12 19:45:00',submitter:'王瑶老师',messages:[{id:'TM-002A',kind:'submit',actor:'王瑶老师',time:'2026-11-12 19:45:00',body:'到校提醒偶尔延迟，请协助核查。',attachments:[]},{id:'TM-002B',kind:'reply',actor:'学校反馈处理人',time:'2026-11-13 15:26:00',body:'您好，已核查该时段记录上传情况。如再次遇到，请提供班级及发生时间，方便进一步排查。',attachments:[]}]},
  rounds:{id:'FB-DEMO-T-003',role,ty:'功能建议',title:'增加考勤汇总导出',school:'市实验一小',student:'--',time:'2026-11-10 08:00:00',submitter:'王瑶老师',messages:[{id:'TM-003A',kind:'submit',actor:'王瑶老师',time:'2026-11-10 08:00:00',body:'希望能按班级导出考勤汇总，便于核对学生出勤情况。',attachments:[]},{id:'TM-003B',kind:'reply',actor:'学校反馈处理人',time:'2026-11-10 11:30:00',body:'已记录该建议，正在评估导出字段。',attachments:[]},{id:'TM-003C',kind:'followup',actor:'王瑶老师',time:'2026-11-11 09:10:00',body:'希望导出结果包含请假和迟到信息。',attachments:[]},{id:'TM-003D',kind:'reply',actor:'学校反馈处理人',time:'2026-11-11 17:40:00',body:'已补充记录，后续方案确认后会在此回复。',attachments:[]}]}
 }:{
  open:{id:'FB-DEMO-P-001',role,ty:'功能建议',title:'放学提醒时间',school:'市实验一小',student:'林晓乐',time:'2026-11-15 09:21:00',submitter:'林晓乐家长',messages:[{id:'PM-001',kind:'submit',actor:'林晓乐家长',time:'2026-11-15 09:21:00',body:'放学播报希望能提前 5 分钟提醒我出发接孩子。',attachments:[]}]},
  replied:{id:'FB-DEMO-P-002',role,ty:'问题反馈',title:'到校提醒延迟',school:'市实验一小',student:'林晓乐',time:'2026-11-12 19:45:00',submitter:'林晓乐家长',messages:[{id:'PM-002A',kind:'submit',actor:'林晓乐家长',time:'2026-11-12 19:45:00',body:'孩子明明 7:40 就进校了，到校提醒 8 点才收到，最近一周有两三次这样，麻烦看看。',attachments:[{name:'反馈截图.png',data:'assets/photo-cap.jpg'}]},{id:'PM-002B',kind:'reply',actor:'学校反馈处理人',time:'2026-11-13 15:26:00',body:'您好，经排查为网络波动导致个别到校记录延迟上传，已优化重传策略；如再遇到延迟欢迎随时反馈。',attachments:[]}]},
  otherChild:{id:'FB-DEMO-P-003',role,ty:'功能建议',title:'按学期导出出勤记录',school:'市实验二小',student:'林晓宁',time:'2026-11-10 21:10:00',submitter:'林晓宁家长',messages:[{id:'PM-003A',kind:'submit',actor:'林晓宁家长',time:'2026-11-10 21:10:00',body:'希望能按学期导出孩子的出勤记录。',attachments:[]},{id:'PM-003B',kind:'reply',actor:'学校反馈处理人',time:'2026-11-11 14:32:00',body:'感谢您的建议，已记录并转交相关人员评估。',attachments:[]}]}
 };
 let order=Object.keys(records);
 function notify(message){clearTimeout(timer);notice.textContent=message;notice.hidden=false;timer=setTimeout(()=>notice.hidden=true,2600);}
 function show(title,body){
  previousFocus=document.activeElement;
  dialog.innerHTML='<div class="hf-dialog-head"><span id="hf-dialog-title">'+esc(title)+'</span><button class="hf-close" aria-label="关闭弹窗" onclick="hfClose()">×</button></div><div class="hf-dialog-body">'+body+'</div>';
  const footer=dialog.querySelector('.hf-form-actions');if(footer)dialog.append(footer);
  dialog.setAttribute('aria-labelledby','hf-dialog-title');overlay.hidden=false;dialog.focus();
 }
 function closeDialog(){overlay.hidden=true;dialog.dataset.view='';if(previousFocus?.isConnected)previousFocus.focus();}
 function captureDraft(){
  if(!draft||dialog.dataset.view!=='composer')return;
  draft.type=dialog.querySelector('.hf-types .on')?.dataset.type||draft.type;
  draft.title=$('fb-title')?.value??draft.title;
  draft.text=$('fb-txt')?.value??draft.text;
  draft.files=draft.files||[];
 }
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
 window.hfDial=function(i){const agent=services()[i];if(!agent)return;notify('演示拨号：'+agent.phone);window.dispatchEvent(new CustomEvent('zxh:help-dial',{detail:{phone:agent.phone,role}}));};
 function statusOf(r){
  if(r.withdrawn)return '已撤回';
  const last=(r.messages||[]).filter(m=>!m.deleted&&m.kind!=='system').at(-1);
  return last&&['reply','correction'].includes(last.kind)?'已回复':'待回复';
 }
 function badge(r){const st=statusOf(r);return '<span class="hf-badge '+(st==='已回复'?'replied':st==='已撤回'?'withdrawn':'pending')+'">'+st+'</span>';}
 function currentChild(){
  let name='林晓乐',info=null;
  try{if(typeof curKid!=='undefined'&&curKid)name=curKid;if(typeof kidInfo!=='undefined')info=kidInfo[name]||null;}catch{}
  return {id:name,name,school:info?.[4]||sampleSchool,className:info?.[1]||'',state:info?.[2]??null};
 }
 function teacherProfile(){
  let teacher=null;
  try{if(typeof dutyLoad==='function'){const state=dutyLoad();teacher=state?.teachers?.find(t=>t.id==='t26'||t.n==='王瑶')||null;}}catch{}
  return {id:teacher?.id||'t26',name:teacher?.n||'王瑶',state:teacher?.st||'on',school:window.ZXH_HELP_CONTEXT?.school||sampleSchool};
 }
 function eligible(studentName){
  if(eligibilityOverride==='blocked')return {ok:false,reason:role==='parent'?'当前孩子已离校或毕业，不能提交反馈。请切换到在读孩子后重试。':'当前教师身份非在职状态，不能提交反馈。请联系学校管理员恢复在职。'};
  if(eligibilityOverride==='eligible')return {ok:true};
  if(role==='parent'){
   const child=studentName?(()=>{try{return typeof kidInfo!=='undefined'?kidInfo[studentName]:null}catch{return null}})():currentChild();
   if(!child)return {ok:false,reason:'当前关联学生资料不可用，历史反馈仍可查看，但不能继续提交。'};
   if(child[2]===1)return {ok:false,reason:'当前孩子已毕业，不能提交或继续追问反馈。'};
   if(child[2]===2)return {ok:false,reason:'当前孩子已离校，不能提交或继续追问反馈。'};
   if(child[2]!==0)return {ok:false,reason:'暂时无法核验当前孩子是否在读，请返回后重试。'};
   return {ok:true};
  }
  const teacher=teacherProfile();
  if(teacher.state!=='on')return {ok:false,reason:teacher.state==='off'?'当前教师身份已离职，不能提交或继续追问反馈。请联系学校管理员恢复在职。':'当前教师身份尚未在职，暂不能提交反馈。'};
  return {ok:true};
 }
 function currentContext(){
  if(role==='parent'){const c=currentChild();return {studentId:c.id,student:c.name,schoolId:'DEMO-SCHOOL-'+(c.school===sampleSchool?'01':'02'),school:c.school,employment:'--'};}
  const t=teacherProfile();return {studentId:'--',student:'--',schoolId:'DEMO-SCHOOL-01',school:t.school,employment:t.state,teacherId:t.id,teacherName:t.name+'老师'};
 }
 function currentPhone(){return window.ZXH_HELP_ACCOUNT_PHONE||'--';}
 function allRecords(){
  return emptyPreview?[]:order.filter(k=>records[k]&&records[k].role===role);
 }
 function renderList(){
  const all=allRecords(),visible=all.filter(k=>filter==='all'||statusOf(records[k])===filter);
  $('fb-fbar').hidden=!all.length;$('fb-empty').hidden=all.length>0;$('fb-nores').hidden=!all.length||visible.length>0;
  $('fb-list').innerHTML=visible.map(k=>{const r=records[k],association=role==='parent'?'反馈关联学生：'+esc(r.student||'--'):'任职学校：'+esc(r.school||'--');return '<button class="hf-card hf-record" data-record="'+esc(k)+'" onclick="openFbDetail(\''+esc(k)+'\')"><div class="hf-record-head"><b>'+esc(r.ty)+' · '+esc(r.title)+'</b>'+badge(r)+'</div><div class="hf-record-summary">'+esc(r.messages[0]?.body||'')+'</div><div class="hf-record-meta">'+association+'</div><div class="hf-record-time">'+esc(r.time)+'</div></button>';}).join('');
  document.querySelectorAll('#fb-fbar button').forEach((b,i)=>b.classList.toggle('on',['all','待回复','已回复','已撤回'][i]===filter));
 }
 window.fbFilterPick=function(value){filter=value;renderList();};
 window.fbApplyFilter=renderList;window.fbFilterReset=function(){filter='all';renderList();};
 window.fbEmptyToggle=function(){emptyPreview=!emptyPreview;filter='all';renderList();};
 function renderAttachments(items,recordKey){
  if(!items?.length)return '<div class="hf-attachment-empty">附件　--</div>';
  return '<div class="hf-images">'+items.map((file,i)=>'<button onclick="hfPreview(\''+esc(recordKey)+'\',\''+esc(file.data||file.src||'')+'\')" aria-label="查看附件"><img src="'+esc(file.data||file.src||'')+'" alt="反馈附件"></button>').join('')+'</div>';
 }
 function renderTimeline(r){
  const messages=(r.messages||[]).map((m,i)=>({m,i})).sort((a,b)=>String(b.m.time).localeCompare(String(a.m.time))||b.i-a.i);
  return messages.map(({m})=>{
   const kind=m.kind==='submit'?'首次反馈':m.kind==='followup'?'追问':m.kind==='reply'?'回复':m.kind==='correction'?'更正回复':'系统记录';
   const marked=m.deleted?'（已删除）':m.withdrawn?'（已撤回）':'';
   const body=m.deleted||m.withdrawn?'<span class="hf-deleted-content">该消息'+(m.deleted?'已删除':'已撤回')+'，原文仍保留</span>':esc(m.body||'');
   return '<article class="hf-timeline-item '+(m.deleted?'deleted':m.withdrawn?'withdrawn':'')+'"><div class="hf-timeline-head"><b>'+esc(m.actor||'系统')+'</b><span>'+kind+marked+'</span><time>'+esc(m.time||'')+'</time></div><div class="hf-timeline-body">'+esc(m.body||'')+'</div>'+renderAttachments(m.attachments||[],r.id)+'</article>';
  }).join('');
 }
 function canFollow(r){
  if(r.withdrawn)return {ok:false,reason:'反馈已撤回，仅可查看时间线。'};
  const check=eligible(r.student&&r.student!=='--'?r.student:null);if(!check.ok)return check;
  return {ok:true};
 }
 function canWithdraw(r){
  if(r.withdrawn)return {ok:false,reason:'反馈已撤回。'};
  const check=canFollow(r);if(!check.ok)return check;
  const activeReply=(r.messages||[]).some(m=>!m.deleted&&['reply','correction'].includes(m.kind));
  if(activeReply)return {ok:false,reason:'该反馈已有有效回复，无法撤回。'};
  return {ok:true};
 }
 window.openFbDetail=function(key){
  const r=records[key];if(!r||r.role!==role){notify('该反馈记录不可查看');return;}
  detailKey=key;const st=statusOf(r),follow=canFollow(r),withdraw=canWithdraw(r);
  let actions='';
  if(!r.withdrawn){
   actions+='<div class="hf-detail-actions"><button class="hf-secondary" '+(follow.ok?'':'disabled title="'+esc(follow.reason)+'"')+' onclick="hfStartFollow(\''+esc(key)+'\')">继续追问</button><button class="hf-withdraw" '+(withdraw.ok?'':'disabled title="'+esc(withdraw.reason)+'"')+' onclick="hfWithdraw(\''+esc(key)+'\')">撤回反馈</button></div>';
   if(!follow.ok)actions+='<p class="hf-readonly-note">'+esc(follow.reason)+'</p>';
  }else actions+='<p class="hf-readonly-note">该反馈已撤回，保留完整时间线供查看。</p>';
  $('fbd-body').innerHTML='<div class="hf-card"><div class="hf-record-head"><b>'+esc(r.ty)+' · '+esc(r.title)+'</b>'+badge(r)+'</div><div class="hf-case-meta"><span>反馈编号：'+esc(r.id)+'</span><span>反馈时间：'+esc(r.time)+'</span><span>所属学校：'+esc(r.school||'--')+'</span><span>反馈关联学生：'+esc(r.student||'--')+'</span></div></div><div class="hf-card"><h3>反馈时间线</h3><div class="hf-timeline">'+renderTimeline(r)+'</div>'+actions+'</div>';
  go('sc-fbdetail');
 };
 window.hfPreview=function(key,src){const r=records[key];if(!r||!src)return;previewImageSrc=src;show('反馈附件','<img class="hf-image-large" src="'+esc(src)+'" alt="反馈附件大图">');};
 window.fbShot=function(){const r=records[detailKey];const src=r?.messages?.flatMap(m=>m.attachments||[])[0]?.data;if(src)hfPreview(detailKey,src);};
 function makeDraft(mode,recordKey,previousScreen){
  const context=mode==='new'?currentContext():records[recordKey];
  draft={mode,recordKey,previousScreen,type:mode==='new'?'功能建议':(records[recordKey]?.ty||'功能建议'),title:'',text:'',files:[],uploading:false,context};
 }
 window.feedbackSheet=function(){makeDraft('new','', 'sc-fblist');renderComposer();};
 window.hfStartFollow=function(key){
  const r=records[key];if(!r||r.role!==role){notify('该反馈记录不可继续追问');return;}
  const check=canFollow(r);if(!check.ok){notify(check.reason);return;}
  makeDraft('follow',key,'sc-fbdetail');renderComposer();
 };
 function renderComposer(){
  if(!draft)return;
  const isFollow=draft.mode==='follow',context=draft.context;
  const snapshot=role==='parent'?'反馈关联学生：'+context.student+' · '+context.school:'任职学校：'+context.school+' · 反馈人：'+context.teacherName;
  const typeField=isFollow?'':'<div class="hf-types" role="group" aria-label="反馈类型"><button class="'+(draft.type==='功能建议'?'on':'')+'" data-type="功能建议" onclick="hfType(this,\'功能建议\')">功能建议</button><button class="'+(draft.type==='问题反馈'?'on':'')+'" data-type="问题反馈" onclick="hfType(this,\'问题反馈\')">问题反馈</button></div>';
  const titleField=isFollow?'':'<label class="hf-field-label" for="fb-title">反馈标题 <i>*</i></label><input id="fb-title" class="hf-input" maxlength="50" placeholder="请输入反馈标题" value="'+esc(draft.title)+'" oninput="hfCount(\'fb-title\',50,\'fb-title-count\')"><div class="hf-counter" id="fb-title-count">'+draft.title.length+'/50</div>';
  const limit=isFollow?1000:200,label=isFollow?'追问内容':'反馈内容',placeholder=isFollow?'请输入追问内容':'请输入反馈内容';
  const content='<div class="hf-context-line">'+esc(snapshot)+'</div>'+typeField+titleField+'<label class="hf-field-label" for="fb-txt">'+label+' <i>*</i></label><textarea id="fb-txt" rows="4" maxlength="'+limit+'" placeholder="'+placeholder+'" oninput="hfCount(\'fb-txt\','+limit+',\'fb-text-count\')">'+esc(draft.text)+'</textarea><div class="hf-counter" id="fb-text-count">'+draft.text.length+'/'+limit+'</div><div class="hf-form-label">附件 <span>（选填）</span></div><div class="hf-upload-tip">支持 JPEG、JPG、PNG 格式图片，最多 9 张，每张不超过 10 MB。</div><div id="hf-uploads" class="hf-upload-grid">'+renderUploads()+'</div><input id="hf-file" type="file" accept="image/png,image/jpeg" multiple hidden><div class="hf-form-actions"><button class="hf-secondary" onclick="hfClose()">返回</button><button class="hf-primary" id="hf-submit" onclick="feedbackSubmit()">'+(isFollow?'提交追问':'提交反馈')+'</button></div>';
  show(isFollow?'继续追问':'提交反馈',content);dialog.dataset.view='composer';
  $('fb-title')?.addEventListener('input',captureDraft);$('fb-txt')?.addEventListener('input',captureDraft);
  $('hf-file').addEventListener('change',handleFiles);
 }
 function renderUploads(){
  const items=draft?.files||[];
  return items.map((f,i)=>'<div class="hf-upload-item"><img src="'+esc(f.data)+'" alt="待提交附件"><button aria-label="移除第'+(i+1)+'张附件" onclick="hfRemoveUpload('+i+')">×</button></div>').join('')+(items.length<9?'<button class="hf-upload-add" aria-label="选择图片" onclick="document.getElementById(\'hf-file\').click()">＋</button>':'');
 }
 async function handleFiles(event){
  captureDraft();if(!draft)return;
  const files=[...event.target.files];draft.uploading=true;
  const submit=$('hf-submit');if(submit)submit.disabled=true;
  for(const file of files){
   if(draft.files.length>=9){notify('最多上传 9 张图片');break;}
   if(!['image/jpeg','image/png'].includes(file.type)){notify('仅支持 JPEG、JPG、PNG 格式图片');continue;}
   if(file.size>10*1024*1024){notify('单张图片不能超过 10 MB');continue;}
   try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});draft.files.push({name:file.name,data,size:file.size,type:file.type});}
   catch{notify('图片读取失败，请重新选择');}
  }
  if(draft){draft.uploading=false;renderComposer();}
 }
 window.hfRemoveUpload=function(index){captureDraft();if(!draft)return;draft.files.splice(index,1);renderComposer();};
 window.hfType=function(button,value){if(!draft)return;captureDraft();draft.type=value;renderComposer();};
 window.hfCount=function(id,limit,countId){const field=$(id),counter=$(countId);if(field&&counter)counter.textContent=field.value.length+'/'+limit;captureDraft();};
 function requestClose(){
  if(draft&&dialog.dataset.view==='composer'){captureDraft();confirmLeave();return;}
  closeDialog();
 }
 function confirmLeave(){
  const body='<p class="hf-confirm-text">返回后会清空本次填写内容和附件。要继续填写，还是确认返回反馈列表/详情？</p><div class="hf-form-actions"><button class="hf-secondary" onclick="hfKeepFeedback()">继续填写</button><button class="hf-primary" onclick="hfDiscardFeedback()">确认返回</button></div>';
  show('确认返回',body);dialog.dataset.view='leave-confirm';
 }
 window.hfKeepFeedback=function(){if(!draft)return;renderComposer();};
 window.hfDiscardFeedback=function(){const destination=draft?.previousScreen||'sc-fblist';draft=null;closeDialog();if(destination)go(destination);};
 window.hfClose=requestClose;
 overlay.addEventListener('click',event=>{if(event.target===overlay)requestClose();});
 document.addEventListener('keydown',event=>{
  if(overlay.hidden)return;
  if(event.key==='Escape'){event.preventDefault();requestClose();}
  if(event.key==='Tab'){
   const focusable=[...dialog.querySelectorAll('button,input,textarea,a[href]')].filter(el=>!el.hidden&&el.getClientRects().length&&!el.disabled);
   if(!focusable.length){event.preventDefault();dialog.focus();return;}
   const first=focusable[0],last=focusable.at(-1);
   if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===dialog)){event.preventDefault();first.focus();}
  }
 });
 window.hfWithdraw=function(key){
  const r=records[key],check=r&&canWithdraw(r);if(!r||!check?.ok){notify(check?.reason||'该反馈当前不可撤回');return;}
  const body='<div class="hf-confirm-card"><b>'+esc(r.title)+'</b><p>'+esc(r.messages[0]?.body||'')+'</p><small>撤回后将保留完整时间线，当前反馈及关联处理记录只读展示。</small></div><div class="hf-form-actions"><button class="hf-secondary" onclick="hfClose()">取消</button><button class="hf-withdraw" onclick="hfConfirmWithdraw(\''+esc(key)+'\')">确认撤回</button></div>';
  show('撤回反馈',body);dialog.dataset.view='withdraw-confirm';
 };
 window.hfConfirmWithdraw=function(key){
  const r=records[key],check=r&&canWithdraw(r);if(!r||!check?.ok){notify(check?.reason||'该反馈当前不可撤回');return;}
  r.withdrawn=true;r.withdrawnAt=nowText();r.messages.push({id:'SYS-'+Date.now(),kind:'system',actor:role==='parent'?'反馈人':'反馈人',time:r.withdrawnAt,body:'反馈人撤回了该反馈。',withdrawn:true,attachments:[]});
  closeDialog();renderList();openFbDetail(key);notify('反馈已撤回');
 };
 function nowText(){return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date()).replace(/\//g,'-');}
 window.feedbackSubmit=function(){
  captureDraft();if(!draft)return;
  if(draft.uploading){notify('附件仍在读取，请稍候');return;}
  const isFollow=draft.mode==='follow',limit=isFollow?1000:200,text=String(draft.text||'').trim(),title=String(draft.title||'').trim();
  if(!isFollow&&!draft.type){notify('请选择反馈类型');return;}
  if(!isFollow&&(!title||title.length>50)){notify('请输入 1-50 字反馈标题');$('fb-title')?.focus();return;}
  if(!text){notify(isFollow?'请填写追问内容':'请填写反馈内容');$('fb-txt')?.focus();return;}
  if(text.length>limit){notify('内容不能超过 '+limit+' 字');return;}
  const check=isFollow?canFollow(records[draft.recordKey]):eligible(draft.context.student!=='--'?draft.context.student:null);
  if(!check?.ok){notify(check?.reason||'当前身份状态不符合提交条件');return;}
  if(draft.files.length>9||draft.files.some(f=>f.size>10*1024*1024||!['image/jpeg','image/png'].includes(f.type))){notify('附件格式、数量或大小不符合要求');return;}
  const time=nowText(),messageId='MSG-'+Date.now();
  if(isFollow){
   const r=records[draft.recordKey];if(!r||r.withdrawn){notify('反馈状态已变化，请返回刷新后重试');return;}
   r.messages.push({id:messageId,kind:'followup',actor:role==='parent'?draft.context.student+'家长':draft.context.teacherName,time,body:text,attachments:draft.files.slice()});
   r.updated=time;
   const destination=draft.previousScreen,key=draft.recordKey;draft=null;closeDialog();renderList();if(destination)go(destination);if(destination==='sc-fbdetail')openFbDetail(key);notify('追问已提交');
   return;
  }
  const key='FB-'+(role==='parent'?'P':'T')+'-'+Date.now(),context=draft.context;
  const name=role==='parent'?context.student+'家长':context.teacherName;
  const record={id:key,role,ty:draft.type,title,school:context.school,schoolId:context.schoolId,student:context.student,studentId:context.studentId,submitter:name,submitterPhoneSnapshot:currentPhone(),time,updated:time,withdrawn:false,messages:[{id:messageId,kind:'submit',actor:name,time,body:text,attachments:draft.files.slice()}]};
  records[key]=record;order.unshift(key);emptyPreview=false;filter='all';draft=null;closeDialog();go('sc-fblist');renderList();notify('已提交，感谢您的反馈');
 };
 window.hfSetEligibility=function(value){eligibilityOverride=value==='blocked'?'blocked':value==='eligible'?'eligible':null;notify(eligibilityOverride==='blocked'?'已切换为不符合提交条件的演示场景':'已恢复按当前账号状态校验');};
 window.hfBackToMe=function(){if(role==='parent')goTab('sc-me');else go('sc-me');};
 const originalGo=window.go;window.go=function(id){if(!overlay.hidden&&!(draft&&dialog.dataset.view==='composer'))requestClose();originalGo(id);if(id==='sc-fblist')renderList();};
 window.csEntryOn=()=>false;window.applyCsEntry=()=>{$('help-cs-btn').style.display='none';};window.toggleCsEntry=()=>{};
 const description='「我的」Tab 保持原样。本页为帮助与反馈；教师、家长使用相同字段及交互，提交记录按当前登录角色和当前账号本人隔离。\n【反馈提交】反馈类型、标题（必填，最多50字）、内容（必填，最多200字）、附件（选填，JPEG/JPG/PNG，最多9张，每张不超过10MB）。家长提交时关联当前选中且在读的孩子并保存学校/学生快照；教师自动记录当前任职学校，反馈关联学生显示“--”。提交时复验家长孩子在读状态或教师在职状态；不符合时显示原因并保留页面、文字与附件。退出表单需再次确认，确认后清空并返回。\n【我的反馈】只展示当前角色、当前账号本人记录；家长列表包含本人不同孩子的记录，不随当前孩子筛除。状态为待回复/已回复/已撤回；时间线倒序展示所有消息，撤回/删除消息保留原文及附件并标记状态。页面仅有反馈时间线，不展示操作日志。提交后消息不提供修改按钮或编辑能力。\n【处理操作】可继续追问，追问再次校验在读/在职条件；反馈撤回遵循Web已确认规则。身份状态失效后历史记录仍可查看，但不可继续提交或追问。当前为本地演示数据，刷新重置，不代表真实账号、学生、学校、服务端权限或通知接收状态。';
 function renderSceneActions(){
  if(typeof demoInfo==='undefined')return;
  demoInfo['sc-help']={t:'帮助与反馈',d:description,a:[['场景一 · 单客服',"hfSetService('single')"],['场景二 · 多客服',"hfSetService('multi')"]]};
  demoInfo['sc-fblist']={t:'我的反馈',d:'仅显示当前'+who+'角色下当前提交账号本人记录。家长记录不按当前孩子筛选，记录关联学生以提交快照为准。三态筛选：待回复、已回复、已撤回；历史信息保留。',a:[['切换空态预览','fbEmptyToggle()'],[role==='parent'?'预览 · 当前孩子离校/毕业':'预览 · 当前教师离职',"hfSetEligibility('blocked')"],['恢复真实身份状态校验',"hfSetEligibility('current')"]]};
  demoInfo['sc-fbdetail']={t:'反馈详情',d:'按时间倒序展示完整反馈时间线，包含首次反馈、追问、回复及已撤回/已删除标记；附件跟随原消息保留。本端不展示操作日志。无效记录不能跳转读取其他记录。提交后不提供消息修改入口。',a:[]};
 }
 // 仅供页面演示说明切换资格状态，不写入教师名册、孩子名册或其他业务存储。
 window.ZXH_HELP_PREVIEW={role,getRecords:()=>order.map(k=>({key:k,...records[k],status:statusOf(records[k])})),setServices:agents=>{serviceOverride=agents;renderService();},getScene:()=>scene,getEligibility:()=>eligibilityOverride,setEligibility:value=>window.hfSetEligibility(value)};
 renderHelp();renderList();renderSceneActions();if(location.hash==='#sc-fbdetail')openFbDetail('open');
})();
