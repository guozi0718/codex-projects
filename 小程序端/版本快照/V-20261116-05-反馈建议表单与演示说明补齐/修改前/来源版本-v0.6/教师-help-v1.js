/* 小程序客户反馈字段与权限展示v0.6：独立离线演示模型，不连接生产服务。 */
(function(){
 'use strict';
 const role=window.ZXH_HELP_ROLE,config=window.ZXH_HELP_CONFIG,$=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const overlay=$('hf-overlay'),dialog=$('hf-dialog'),notice=$('hf-notice');
 document.querySelector('.phone').append(overlay,notice);
 let scene=new URLSearchParams(location.search).get('service')==='multi'?'multi':'single';
 let serviceOverride=null,filter='all',emptyPreview=false,upload=[],type='功能建议',timer,previousFocus=null,detailKey='';
 const actor={
  role,
  accountId:role==='teacher'?'DEMO-ACCOUNT-TEACHER-001':'DEMO-ACCOUNT-PARENT-001',
  nameSnapshot:role==='teacher'?'王老师':'林晓乐家长',
  phoneSnapshot:role==='teacher'?'138****0002':'138****0001'
 };
 const schoolByName=name=>({
  '市实验一小':{schoolId:'DEMO-SCHOOL-001',schoolNameSnapshot:'市实验一小',regionId:'DEMO-REGION-XM-SM',regionNameSnapshot:'厦门市思明区'},
  '市实验二小':{schoolId:'DEMO-SCHOOL-002',schoolNameSnapshot:'市实验二小',regionId:'DEMO-REGION-XM-HL',regionNameSnapshot:'厦门市湖里区'}
 }[name]||{schoolId:'DEMO-SCHOOL-001',schoolNameSnapshot:name||'市实验一小',regionId:'DEMO-REGION-XM-SM',regionNameSnapshot:'厦门市思明区'});
 function studentSnapshot(name){
  const parentContext=role==='parent'&&typeof curKid!=='undefined'&&typeof kidInfo!=='undefined'&&kidInfo[curKid];
  const studentName=name||(parentContext?curKid:'林晓乐');
  const profile=typeof kidInfo!=='undefined'&&kidInfo[studentName];
  const schoolName=profile?.[4]||'市实验一小';
  return {studentId:'DEMO-STUDENT-'+(studentName||'UNKNOWN').replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g,''),studentNameSnapshot:studentName,studentGradeClassSnapshot:profile?.[1]||'3年级-2班',...schoolByName(schoolName),studentListVisibilityExpired:studentName==='林晓帆',studentProfileStatus:studentName==='林晓帆'?'离校生':studentName==='林晓晴'?'毕业生':'在读生'};
 }
 function timeLabel(date){return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date).replace('/','-');}
 const serviceFor=schoolName=>schoolName==='市实验二小'?{receiverRole:'operations',receiverOrganizationId:'DEMO-OPS-ORG-001',receiverOrganizationName:'运营平台'}:{receiverRole:'agent',receiverOrganizationId:'DEMO-AGENT-ORG-001',receiverOrganizationName:'代理商'};
 function attachmentRef({feedbackNo,messageId,index=0,fileName='反馈截图.jpg',mimeType='image/jpeg',byteSize=184320,previewSrc='assets/photo-cap.jpg',localPreview=false},now){
  const attachmentId=feedbackNo+'-ATT-'+String(index+1).padStart(2,'0');
  return {attachmentId,feedbackNo,messageId,fileName,mimeType,byteSize,checksum:localPreview?null:'demo-sha256-'+attachmentId.toLowerCase(),storageKey:localPreview?null:'demo://feedback/'+feedbackNo+'/'+attachmentId,uploadedAt:now,retentionExpiresAt:null,uploadState:localPreview?'local_preview':'available',accessPolicy:'submitter_or_current_receiver',previewSrc};
 }
 function makeRecord({feedbackNo,feedbackType,content,status,createdAt,displayTime,schoolName='市实验一小',studentName=null,reply=null,replyAt=null,withImage=false,withdrawnAt=null,transferredFrom=null}){
  const school=schoolByName(schoolName),student=role==='parent'?studentSnapshot(studentName):null,receiver=serviceFor(schoolName),requestId='DEMO-REQ-'+feedbackNo+'-CREATE';
  const initialMessageId=feedbackNo+'-MSG-001',attachments=withImage?[attachmentRef({feedbackNo,messageId:initialMessageId},createdAt)]:[];
  const initialMessage={messageId:initialMessageId,feedbackNo,messageType:'首条反馈',authorAccountId:actor.accountId,authorRole:role,authorNameSnapshot:actor.nameSnapshot,receiverAccountId:null,receiverOrganizationId:transferredFrom?.organizationId||receiver.receiverOrganizationId,content,attachments,serverSequence:1,createdAt,displayTime,version:1,readFact:'已读',withdrawn:false,deleted:false,requestId};
  const messages=[initialMessage];
  if(reply){
   const messageId=feedbackNo+'-MSG-002',replyRequestId='DEMO-REQ-'+feedbackNo+'-REPLY';
   messages.push({messageId,feedbackNo,messageType:'回复',authorAccountId:'DEMO-SERVICE-ACCOUNT-001',authorRole:receiver.receiverRole,authorNameSnapshot:receiver.receiverOrganizationName+'客服',receiverAccountId:actor.accountId,receiverOrganizationId:null,content:reply,attachments:[],serverSequence:2,createdAt:replyAt,displayTime:timeLabel(new Date(replyAt)),version:2,readFact:'未查看',withdrawn:false,deleted:false,requestId:replyRequestId});
  }
  const receiverHistory=[{assignmentId:feedbackNo+'-ASG-001',fromOrganizationId:null,toOrganizationId:transferredFrom?.organizationId||receiver.receiverOrganizationId,toRole:transferredFrom?.role||receiver.receiverRole,schoolConfigVersion:'DEMO-SCHOOL-CONFIG-V1',reason:'首次提交受理分配',assignedAt:createdAt,eventId:feedbackNo+'-EVT-ASSIGN-001'}];
  if(transferredFrom)receiverHistory.push({assignmentId:feedbackNo+'-ASG-002',fromOrganizationId:transferredFrom.organizationId,toOrganizationId:receiver.receiverOrganizationId,toRole:receiver.receiverRole,schoolConfigVersion:'DEMO-SCHOOL-CONFIG-V2',reason:'学校负责方配置变更；待回复记录转派',assignedAt:new Date(new Date(createdAt).getTime()+3600000).toISOString(),eventId:feedbackNo+'-EVT-ASSIGN-002'});
  const withdrawal=withdrawnAt?{withdrawalId:feedbackNo+'-WDR-001',withdrawnAt,actorAccountId:actor.accountId,reasonSnapshot:null,requestId:'DEMO-REQ-'+feedbackNo+'-WITHDRAW'}:null;
  const auditEvents=[{eventId:feedbackNo+'-EVT-CREATE',feedbackNo,messageId:initialMessageId,actorAccountId:actor.accountId,actorNameSnapshot:actor.nameSnapshot,actorRole:role,sourceChannel:'mini-program',action:'feedback_created',occurredAt:createdAt,result:'success',previousVersion:null,newVersion:1,requestId}];
  if(reply)auditEvents.push({eventId:feedbackNo+'-EVT-REPLY',feedbackNo,messageId:feedbackNo+'-MSG-002',actorAccountId:'DEMO-SERVICE-ACCOUNT-001',actorNameSnapshot:receiver.receiverOrganizationName+'客服',actorRole:receiver.receiverRole,sourceChannel:'web',action:'message_replied',occurredAt:replyAt,result:'success',previousVersion:1,newVersion:2,requestId:'DEMO-REQ-'+feedbackNo+'-REPLY'});
  if(transferredFrom)auditEvents.push({eventId:feedbackNo+'-EVT-ASSIGN-002',feedbackNo,actorAccountId:'DEMO-SYSTEM',actorNameSnapshot:'系统',actorRole:'system',sourceChannel:'system',action:'receiver_reassigned',occurredAt:receiverHistory[1].assignedAt,result:'success',previousVersion:1,newVersion:2,requestId:'DEMO-REQ-'+feedbackNo+'-REASSIGN',fromOrganizationId:transferredFrom.organizationId,toOrganizationId:receiver.receiverOrganizationId});
  if(withdrawal)auditEvents.push({eventId:feedbackNo+'-EVT-WITHDRAW',feedbackNo,actorAccountId:actor.accountId,actorNameSnapshot:actor.nameSnapshot,actorRole:role,sourceChannel:'mini-program',action:'feedback_withdrawn',occurredAt:withdrawnAt,result:'success',previousVersion:reply?2:1,newVersion:reply?3:2,requestId:withdrawal.requestId});
  const notifications=reply?[{notificationId:feedbackNo+'-NOTICE-001',requestId:'DEMO-REQ-'+feedbackNo+'-NOTICE',feedbackNo,messageId:feedbackNo+'-MSG-002',recipientAccountId:actor.accountId,channel:'mini_program',templateVersion:'DEMO-TPL-V1',providerRequestId:'DEMO-PROVIDER-001',status:'sent',createdAt:replyAt,operatorAccountId:'DEMO-SERVICE-ACCOUNT-001',failureCode:null}]:[];
  return {feedbackNo,sourceRole:role,sourceChannel:'mini-program',submitterAccountId:actor.accountId,submitterNameSnapshot:actor.nameSnapshot,submitterPhoneSnapshot:actor.phoneSnapshot,regionId:school.regionId,regionNameSnapshot:school.regionNameSnapshot,schoolId:school.schoolId,schoolNameSnapshot:school.schoolNameSnapshot,studentId:student?.studentId||null,studentNameSnapshot:student?.studentNameSnapshot||null,studentSnapshot:student,feedbackType,title:null,firstContent:content,attachments,createdAt,updatedAt:[createdAt,replyAt,withdrawnAt,transferredFrom?receiverHistory[1].assignedAt:null].filter(Boolean).sort().at(-1),status,version:1+(reply?1:0)+(withdrawal?1:0)+(transferredFrom?1:0),receiverRole:receiver.receiverRole,receiverOrganizationId:receiver.receiverOrganizationId,receiverOrganizationName:receiver.receiverOrganizationName,receiverAccountId:null,receiverHistory,withdrawal,deletion:null,messages,notifications,auditEvents,requestId};
 }
 const seed=role==='teacher'?[
  ['open',{feedbackNo:'DEMO-T-FB-2026-001',feedbackType:'功能建议',content:'希望能按班级导出考勤汇总，便于核对学生出勤情况。',status:'待回复',createdAt:'2026-07-02T09:21:00+08:00',displayTime:'今天 09:21',transferredFrom:{organizationId:'DEMO-AGENT-ORG-OLD',role:'agent'}}],
  ['replied',{feedbackNo:'DEMO-T-FB-2026-002',feedbackType:'问题反馈',content:'有学生已到校，但考勤记录延迟显示，请协助核查。',status:'已回复',createdAt:'2026-07-02T19:45:00+08:00',displayTime:'07-02 19:45',reply:'您好，已核查该时段记录上传情况。如再次遇到，请提供班级及发生时间，方便进一步排查。',replyAt:'2026-07-03T15:26:00+08:00',withImage:true}],
  ['withdrawn',{feedbackNo:'DEMO-T-FB-2026-003',feedbackType:'功能建议',content:'希望能更方便地查看本班待处理的请假申请。',status:'已撤回',createdAt:'2026-06-24T21:10:00+08:00',displayTime:'06-24 21:10',withdrawnAt:'2026-06-25T10:15:00+08:00',schoolName:'市实验二小'}]
 ].map(([key,value])=>[key,makeRecord(value)]):[
  ['open',{feedbackNo:'DEMO-P-FB-2026-001',feedbackType:'功能建议',content:'放学播报希望能提前 5 分钟提醒我出发接孩子。',status:'待回复',createdAt:'2026-07-02T09:21:00+08:00',displayTime:'今天 09:21',studentName:'林晓乐',transferredFrom:{organizationId:'DEMO-AGENT-ORG-OLD',role:'agent'}}],
  ['replied',{feedbackNo:'DEMO-P-FB-2026-002',feedbackType:'问题反馈',content:'孩子明明 7:40 就进校了，到校提醒 8 点才收到，最近一周有两三次这样，麻烦看看。',status:'已回复',createdAt:'2026-07-02T19:45:00+08:00',displayTime:'07-02 19:45',studentName:'林晓宁',schoolName:'市实验二小',reply:'您好，经排查为雨天网络波动导致个别到校记录延迟上传，已于 7月3日优化重传策略；如再遇到延迟欢迎随时反馈。',replyAt:'2026-07-03T15:26:00+08:00',withImage:true}],
  ['withdrawn',{feedbackNo:'DEMO-P-FB-2026-003',feedbackType:'功能建议',content:'希望能按学期导出孩子的出勤记录，开家长会前想自己看一遍。',status:'已撤回',createdAt:'2026-06-24T21:10:00+08:00',displayTime:'06-24 21:10',studentName:'林晓帆',withdrawnAt:'2026-06-25T10:15:00+08:00'}]
 ].map(([key,value])=>[key,makeRecord(value)]);
 const records=Object.fromEntries(seed),order=seed.map(([key])=>key);
 function notify(message){clearTimeout(timer);notice.textContent=message;notice.hidden=false;timer=setTimeout(()=>notice.hidden=true,2400);}
 function show(title,body){previousFocus=document.activeElement;dialog.innerHTML='<div class="hf-dialog-head"><span id="hf-dialog-title">'+esc(title)+'</span><button class="hf-close" aria-label="关闭弹窗" onclick="hfClose()">×</button></div>'+'<div class="hf-dialog-body">'+body+'</div>';const footer=dialog.querySelector('.hf-form-actions');if(footer)dialog.append(footer);dialog.setAttribute('aria-labelledby','hf-dialog-title');overlay.hidden=false;dialog.focus();}
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
 window.hfDial=function(i){const agent=services()[i];if(!agent)return;/* 离线原型模拟拨号，不拨打参考图中的演示号码。 */notify('演示拨号：'+agent.phone);window.dispatchEvent(new CustomEvent('zxh:help-dial',{detail:{phone:agent.phone,role}}));};
 function canReadAsSubmitter(record){return !!record&&record.sourceRole===role&&record.submitterAccountId===actor.accountId;}
 function visibleRecords(){return order.map(key=>records[key]).filter(canReadAsSubmitter);}
 function badge(record){const css=record.status==='已回复'?' replied':record.status==='已撤回'?' withdrawn':'';return '<span class="hf-badge'+css+'">'+esc(record.status)+'</span>';}
 function renderList(){
  const all=emptyPreview?[]:visibleRecords(),visible=all.filter(record=>filter==='all'||record.status===filter);
  $('fb-fbar').hidden=!all.length;$('fb-empty').hidden=all.length>0;$('fb-nores').hidden=!all.length||visible.length>0;
  $('fb-list').innerHTML=visible.map(record=>'<button class="hf-card hf-record" data-record="'+esc(record.feedbackNo)+'" onclick="openFbDetail(\''+esc(record.feedbackNo)+'\')"><div class="hf-record-head"><b>'+esc(record.feedbackType)+'</b>'+badge(record)+'</div><div class="hf-record-summary">'+esc(record.firstContent)+'</div><div class="hf-record-time">'+esc(record.messages[0]?.displayTime||timeLabel(new Date(record.createdAt)))+'</div></button>').join('');
  document.querySelectorAll('#fb-fbar button').forEach(button=>button.classList.toggle('on',(button.dataset.status||'all')===filter));
 }
 window.fbFilterPick=function(value){filter=['all','待回复','已回复','已撤回'].includes(value)?value:'all';renderList();};
 window.fbApplyFilter=renderList;window.fbFilterReset=function(){filter='all';renderList();};
 window.fbEmptyToggle=function(){emptyPreview=!emptyPreview;filter='all';renderList();};
 function renderAttachments(items){return items?.length?'<div class="hf-images">'+items.map((item,i)=>'<button onclick="hfPreview('+i+')" aria-label="查看反馈截图"><img src="'+esc(item.previewSrc||'assets/photo-cap.jpg')+'" alt="反馈截图"></button>').join('')+'</div>':'';}
 function renderMessageTimeline(record){return '<div class="hf-card"><h3>处理进展</h3><div class="hf-timeline">'+record.messages.map(message=>'<p><b>'+esc(message.messageType==='首条反馈'?'提交':message.messageType)+'</b><small>'+esc(message.displayTime||timeLabel(new Date(message.createdAt)))+'</small><span>'+esc(message.content)+'</span>'+renderAttachments(message.attachments)+'</p>').join('')+(record.withdrawal?'<p><b>已撤回</b><small>'+esc(timeLabel(new Date(record.withdrawal.withdrawnAt)))+'</small><span>该反馈已撤回</span></p>':'')+'</div></div>';}
 window.openFbDetail=function(feedbackNo){
  const record=records[feedbackNo];if(!canReadAsSubmitter(record)){notify('该反馈记录不可查看');return;}
  detailKey=feedbackNo;
  const student=record.studentSnapshot;
  $('fbd-body').innerHTML='<div class="hf-card"><div class="hf-record-head"><b>'+esc(record.feedbackType)+'</b>'+badge(record)+'</div><div class="hf-meta-row"><span>反馈编号</span><b>'+esc(record.feedbackNo)+'</b></div>'+(role==='parent'&&student?'<div class="hf-meta-row"><span>关联学生</span><b>'+esc(student.studentNameSnapshot)+' · '+esc(student.schoolNameSnapshot)+'</b></div>':'')+'<div class="hf-detail-text">'+esc(record.firstContent)+'</div>'+renderAttachments(record.attachments)+'</div>'+renderMessageTimeline(record);
  go('sc-fbdetail');
 };
 window.hfPreview=function(i){const record=records[detailKey];const image=record?.attachments?.[i]?.previewSrc;if(image)show('反馈截图','<img class="hf-image-large" src="'+esc(image)+'" alt="反馈截图大图">');};
 window.fbShot=function(){hfPreview(0);};
 window.feedbackSheet=function(){
  type='功能建议';upload=[];
  show('反馈建议','<div class="hf-types"><button class="on" onclick="hfType(this,\'功能建议\')">功能建议</button><button onclick="hfType(this,\'问题反馈\')">问题反馈</button></div><textarea id="fb-txt" rows="4" aria-label="反馈内容" placeholder="请描述您的建议或遇到的问题"></textarea><div class="hf-form-label">上传图片（可选） · 最多 5 张，最大 10 MB/张</div><div id="hf-uploads" class="hf-upload-grid"></div><input id="hf-file" type="file" accept="image/*" multiple hidden><div class="hf-form-actions"><button class="hf-secondary" onclick="hfClose()">取消</button><button class="hf-primary" id="hf-submit" onclick="feedbackSubmit()">提交</button></div>');
  $('hf-file').addEventListener('change',async e=>{
   const submit=$('hf-submit');submit.disabled=true;
   try{for(const file of e.target.files){
    if(upload.length>=5){notify('最多上传 5 张图片');break;}
    if(!file.type.startsWith('image/')){notify('请选择图片文件');continue;}
    if(file.size>10*1024*1024){notify('单张图片不能超过 10 MB');continue;}
    const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
    upload.push({previewSrc:data,fileName:file.name,mimeType:file.type,byteSize:file.size});
   }}catch{notify('图片读取失败，请重试');}finally{e.target.value='';submit.disabled=false;if(!overlay.hidden)renderUploads();}
  });
  renderUploads();
 };
 window.hfType=function(button,value){type=value;dialog.querySelectorAll('.hf-types button').forEach(b=>b.classList.toggle('on',b===button));};
 function renderUploads(){$('hf-uploads').innerHTML=upload.map((item,i)=>'<div class="hf-upload-item"><img src="'+esc(item.previewSrc)+'" alt="待提交截图"><button aria-label="移除第'+(i+1)+'张图片" onclick="hfRemoveUpload('+i+')">×</button></div>').join('')+(upload.length<5?'<button class="hf-upload-add" aria-label="上传图片" onclick="document.getElementById(\'hf-file\').click()">＋</button>':'');}
 window.hfRemoveUpload=function(i){upload.splice(i,1);renderUploads();};
 window.feedbackSubmit=function(){
  const text=$('fb-txt').value.trim();if(!text){notify('请填写反馈内容');$('fb-txt').focus();return;}
  const now=new Date(),createdAt=now.toISOString(),feedbackNo='DEMO-'+(role==='teacher'?'T':'P')+'-FB-'+now.getTime(),messageId=feedbackNo+'-MSG-001',requestId='DEMO-REQ-'+feedbackNo+'-CREATE',schoolName=role==='parent'&&typeof curKid!=='undefined'&&typeof kidInfo!=='undefined'?((kidInfo[curKid]||[])[4]||'市实验一小'):'市实验一小',school=schoolByName(schoolName),student=role==='parent'?studentSnapshot():null,receiver=serviceFor(school.schoolNameSnapshot);
  const attachments=upload.map((item,index)=>attachmentRef({feedbackNo,messageId,index,fileName:item.fileName,mimeType:item.mimeType,byteSize:item.byteSize,previewSrc:item.previewSrc,localPreview:true},createdAt));
  const firstMessage={messageId,feedbackNo,messageType:'首条反馈',authorAccountId:actor.accountId,authorRole:role,authorNameSnapshot:actor.nameSnapshot,receiverAccountId:null,receiverOrganizationId:receiver.receiverOrganizationId,content:text,attachments,serverSequence:1,createdAt,displayTime:timeLabel(now),version:1,readFact:'已读',withdrawn:false,deleted:false,requestId};
  records[feedbackNo]={feedbackNo,sourceRole:role,sourceChannel:'mini-program',submitterAccountId:actor.accountId,submitterNameSnapshot:actor.nameSnapshot,submitterPhoneSnapshot:actor.phoneSnapshot,regionId:school.regionId,regionNameSnapshot:school.regionNameSnapshot,schoolId:school.schoolId,schoolNameSnapshot:school.schoolNameSnapshot,studentId:student?.studentId||null,studentNameSnapshot:student?.studentNameSnapshot||null,studentSnapshot:student,feedbackType:type,title:null,firstContent:text,attachments,createdAt,updatedAt:createdAt,status:'待回复',version:1,receiverRole:receiver.receiverRole,receiverOrganizationId:receiver.receiverOrganizationId,receiverOrganizationName:receiver.receiverOrganizationName,receiverAccountId:null,receiverHistory:[{assignmentId:feedbackNo+'-ASG-001',fromOrganizationId:null,toOrganizationId:receiver.receiverOrganizationId,toRole:receiver.receiverRole,schoolConfigVersion:'DEMO-SCHOOL-CONFIG-V1',reason:'首次提交受理分配',assignedAt:createdAt,eventId:feedbackNo+'-EVT-ASSIGN-001'}],withdrawal:null,deletion:null,messages:[firstMessage],notifications:[],auditEvents:[{eventId:feedbackNo+'-EVT-CREATE',feedbackNo,messageId,actorAccountId:actor.accountId,actorNameSnapshot:actor.nameSnapshot,actorRole:role,sourceChannel:'mini-program',action:'feedback_created',occurredAt:createdAt,result:'success',previousVersion:null,newVersion:1,requestId}],requestId};
  order.unshift(feedbackNo);emptyPreview=false;filter='all';hfClose();go('sc-fblist');renderList();notify('反馈已提交（离线演示，编号仅供原型展示）');
 };
 const originalGo=window.go;window.go=function(id){if(!overlay.hidden)hfClose();originalGo(id);if(id==='sc-fblist')renderList();};
 window.csEntryOn=()=>false;window.applyCsEntry=()=>{$('help-cs-btn').style.display='none';};window.toggleCsEntry=()=>{};
 const description='「我的」Tab 保持第一期原样。本页常见问题沿用同一套Web配置离线回显，两端一致且默认全部收起。客服电话保持单客服直拨演示与多客服弹窗演示；在线客服隐藏。反馈记录字段与权限为离线模型：反馈编号兼唯一记录ID；新记录初始待回复，标签和筛选使用待回复/已回复/已撤回；家长详情展示提交时学生快照。记录按当前角色和当前账号ID隔离，不按当前学校或当前孩子过滤；模拟提交数据刷新后重置。真实登录、服务端生成编号、组织权限、文件存储和消息通知均未接入。';
 if(typeof demoInfo!=='undefined'){
  demoInfo['sc-help']={t:'帮助与反馈',d:description,a:[['场景一 · 单客服',"hfSetService('single')"],['场景二 · 多客服',"hfSetService('multi')"]]};
  demoInfo['sc-fblist']={t:'我的反馈',d:'当前 '+(role==='teacher'?'教师':'家长')+' 角色下由当前账号本人提交的记录。跨学校/孩子的本人记录仍可见；同校其他教师或同家庭其他家长账号不可见；教师/家长角色切换后分开显示。筛选使用待回复、已回复、已撤回三态。当前为离线演示数据。',a:[['切换空态预览','fbEmptyToggle()']]};
  demoInfo['sc-fbdetail']={t:'反馈详情',d:'详情展示反馈编号（唯一记录ID）、状态、类型、正文、提交时间、处理消息和附件；家长端同时展示提交时学生姓名/学校快照，即使孩子资料离开当前列表仍保留。当前登录账号与角色重新校验记录访问；原型数据仅本地内存保存，不连接生产后端。',a:[]};
 }
 function listResponse(){const items=visibleRecords().map(record=>({feedbackNo:record.feedbackNo,sourceRole:record.sourceRole,status:record.status,feedbackType:record.feedbackType,title:record.title,contentSummary:record.firstContent.slice(0,80),createdAt:record.createdAt,updatedAt:record.updatedAt,studentSnapshot:record.studentSnapshot,version:record.version}));return {items,total:items.length,pageNo:1,pageSize:20,hasMore:false,requestId:'DEMO-REQ-LIST-'+role+'-'+Date.now(),scope:{sourceRole:role,submitterAccountId:actor.accountId}};}
 window.ZXH_HELP_PREVIEW={role,getRecords:()=>visibleRecords().map(record=>JSON.parse(JSON.stringify(record))),getListResponse:listResponse,getScene:()=>scene,setServices:agents=>{serviceOverride=agents;renderService();}};
 renderHelp();renderList();if(location.hash==='#sc-fbdetail')openFbDetail(order[0]);
})();



