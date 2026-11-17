from pathlib import Path
import re, shutil, hashlib
root=Path(r'E:\codex\小程序\任务\T-20261117-01-客户反馈详情与操作精简')
js_rel=Path('assets/help-v1.js')
css_rel=Path('assets/help-v1.css')

def replace_line(src, pattern, replacement, label):
    out,n=re.subn(pattern, lambda m: replacement, src, count=1, flags=re.M)
    if n!=1: raise RuntimeError(f'{label}: expected exactly one line, got {n}')
    return out

src=(root/'端-教师'/'版本-v0.11'/js_rel).read_text(encoding='utf-8')
src,n=re.subn(r'<span class="hf-view-hint">查看详情 ›</span>','',src)
if n!=1: raise RuntimeError(f'list view hint replacement count {n}')
src,n=re.subn(r'<div class="hf-record-time"><span>\'\+esc\(record\.messages\.at\(-1\)\?\.displayTime\|\|timeLabel\(new Date\(record\.createdAt\)\)\)\+\'</span></div>',r'<div class="hf-record-time"><span>\' + esc(record.messages.at(-1)?.displayTime||timeLabel(new Date(record.createdAt))) + \'</span></div>',src)
# replace exact whole feedback functions
summary=r'''function renderFeedbackSummary(record){const firstMessage=(record.messages||[]).find(message=>message.messageType==='首条反馈'),content=record.firstContent||firstMessage?.content||'',attachments=firstMessage?.attachments||record.attachments||[];return '<section class="hf-card hf-detail-summary"><div class="hf-feedback-number"><span>反馈编号</span><b>'+esc(record.feedbackNo)+'</b>'+badge(record)+'</div><div class="hf-feedback-type">'+esc(record.feedbackType)+'</div><div class="hf-detail-text">'+esc(content)+'</div>'+renderAttachments(attachments)+'</section>';}
function renderMessageTimeline(record){const items=[...(record.messages||[])].filter(message=>!message.internal&&!message.isInternal&&message.kind!=='internal'&&message.visibility!=='internal'&&message.messageType!=='内部处理'&&message.messageType!=='首条反馈').map((message,index)=>({...message,__index:index}));if(record.withdrawal)items.push({__system:true,messageType:'撤回记录',authorNameSnapshot:'系统',content:'反馈已撤回',createdAt:record.withdrawal.withdrawnAt,displayTime:timeLabel(new Date(record.withdrawal.withdrawnAt)),serverSequence:Number.MAX_SAFE_INTEGER});items.sort((a,b)=>(Date.parse(b.createdAt||'')||0)-(Date.parse(a.createdAt||'')||0)||(b.serverSequence||0)-(a.serverSequence||0)||(b.__index||0)-(a.__index||0));return '<section class="hf-card hf-conversation-card"><h3>沟通记录</h3>'+(items.length?'<div class="hf-timeline">'+items.map(message=>{const withdrawn=!!message.deleted||!!message.withdrawn,body=message.__system?message.content:withdrawn?(message.messageType==='回复'?'该回复已删除':'该消息已撤回'):message.content,attachments=message.__system||withdrawn?[]:(message.attachments||[]);return '<article class="hf-message'+(message.__system?' hf-message-system':'')+'"><header class="hf-message-header"><b>'+esc(message.authorNameSnapshot||'提交人')+'</b><span>'+esc(message.messageType||'沟通消息')+'</span><time>'+esc(message.displayTime||(message.createdAt?timeLabel(new Date(message.createdAt)):'—'))+'</time></header><p>'+esc(body||'')+'</p>'+renderAttachments(attachments)+'</article>';}).join('')+'</div>':'<div class="hf-detail-empty">暂无沟通消息</div>')+'</section>';}
function renderFeedbackDetail(record){detailImages=[];detailKey=record.feedbackNo;const follow=canFollowUp(record),withdraw=canWithdraw(record);$('fbd-body').innerHTML=renderFeedbackSummary(record)+renderMessageTimeline(record)+'<div class="hf-detail-actions"><button type="button" class="hf-primary hf-detail-action"'+(follow?'':' disabled aria-disabled="true"')+' onclick="hfOpenFollowUp(\''+esc(record.feedbackNo)+'\')">追问</button><button type="button" class="hf-secondary hf-detail-action"'+(withdraw?'':' disabled aria-disabled="true"')+' onclick="hfRequestWithdraw(\''+esc(record.feedbackNo)+'\')">撤回</button></div>';}
'''
src=replace_line(src,r'^function renderMessageTimeline\(record\)\{.*$',summary,'detail rendering functions')
withdraw=r'''window.hfRequestWithdraw=function(feedbackNo){const record=records[feedbackNo||detailKey];if(!canWithdraw(record)){notify('仅待回复且尚无处理方回复的反馈可以撤回');return;}detailKey=record.feedbackNo;show('撤回这条反馈？','<p class="hf-withdraw-copy">撤回后将不再等待该反馈的回复，日志保留操作痕迹。</p><div class="hf-form-actions"><button type="button" class="hf-secondary" onclick="hfClose()">取消</button><button type="button" class="hf-primary" onclick="hfConfirmWithdraw()">确定</button></div>');};'''
src=replace_line(src,r'^window\.hfRequestWithdraw=function\(feedbackNo\)\{.*$',withdraw,'withdraw dialog')
confirm=r'''window.hfConfirmWithdraw=function(){const record=records[detailKey];if(!canWithdraw(record)){hfClose();notify('反馈状态已变化，暂不能撤回');return;}const now=new Date(),occurredAt=now.toISOString(),previousVersion=record.version||1;record.withdrawal={withdrawnAt:occurredAt,actorAccountId:actor.accountId,actorNameSnapshot:actor.nameSnapshot,reason:null};record.status='已撤回';record.updatedAt=occurredAt;record.version=previousVersion+1;record.auditEvents??=[];record.auditEvents.push({eventId:record.feedbackNo+'-EVT-WITHDRAW-'+record.version,feedbackNo:record.feedbackNo,actorAccountId:actor.accountId,actorNameSnapshot:actor.nameSnapshot,actorRole:role,sourceChannel:'mini-program',action:'feedback_withdrawn',occurredAt,result:'success',previousVersion,newVersion:record.version,requestId:'DEMO-REQ-'+record.feedbackNo+'-WITHDRAW-'+record.version});hfClose();renderFeedbackDetail(record);renderList();notify('反馈已撤回');};'''
src=replace_line(src,r'^window\.hfConfirmWithdraw=function\(\)\{.*$',confirm,'withdraw confirmation')
follow=r'''window.hfOpenFollowUp=function(feedbackNo){const record=records[feedbackNo||detailKey];if(!canFollowUp(record)){notify('当前反馈状态不支持追问');return;}detailKey=record.feedbackNo;detailImages=[];followUpDraft=[];followUpBusy=false;const context=renderFeedbackSummary(record)+renderMessageTimeline(record);show('追问','<div class="hf-followup-context">'+context+'</div><section class="hf-card hf-followup-form"><div class="hf-submit-label"><i></i><span>追问内容</span><small>必填</small></div><div class="hf-submit-text-wrap"><textarea id="hf-followup-content" rows="5" maxlength="1000" placeholder="请输入追问内容或补充说明" oninput="hfFollowUpCount(this)"></textarea><span id="hf-followup-count">0/1000</span></div></section><section class="hf-card hf-followup-attachments"><div class="hf-submit-label"><i></i><span>附件图片</span><small>最多 9 张，每张不超过 10MB</small></div><div id="hf-followup-uploads" class="hf-submit-upload-grid"></div><input id="hf-followup-file" type="file" accept="image/jpeg,image/png" multiple hidden onchange="hfReadFollowUpFiles(this)"></section><div class="hf-form-actions"><button type="button" class="hf-secondary" onclick="hfClose()">取消</button><button type="button" class="hf-primary" id="hf-followup-submit" onclick="hfSubmitFollowUp()">提交</button></div>');renderFollowUpUploads();};'''
src=replace_line(src,r'^window\.hfOpenFollowUp=function\(feedbackNo\)\{.*$',follow,'follow-up dialog')
count=r'''window.hfFollowUpCount=function(input){const counter=$('hf-followup-count');if(counter)counter.textContent=Array.from(input.value).length+'/1000';};'''
src=replace_line(src,r'^window\.hfFollowUpCount=function\(input\)\{.*$',count,'follow-up counter')
files_line="window.hfReadFollowUpFiles=async function(input){const session=++followUpSession,feedbackNo=detailKey,submit=$('hf-followup-submit');followUpBusy=true;if(submit)submit.disabled=true;try{for(const file of input.files){if(session!==followUpSession||feedbackNo!==detailKey)return;if(followUpDraft.length>=9){notify('最多上传9张图片');break;}if(!/^image\\/(jpeg|png)$/.test(file.type)){notify('请选择 JPG、JPEG 或 PNG 图片');continue;}if(file.size>10*1024*1024){notify('单张图片不能超过10MB');continue;}const previewSrc=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});if(session!==followUpSession||feedbackNo!==detailKey)return;followUpDraft.push({previewSrc,fileName:file.name,mimeType:file.type,byteSize:file.size});}}catch{if(session===followUpSession)notify('图片读取失败，请重试');}finally{input.value='';if(session===followUpSession){followUpBusy=false;const button=$('hf-followup-submit');if(button)button.disabled=false;renderFollowUpUploads();}}};"
src=replace_line(src,r'^window\.hfReadFollowUpFiles=async function\(input\)\{.*$',files_line,'follow-up file picker')
render_up=r'''window.renderFollowUpUploads=function(){const wrap=$('hf-followup-uploads');if(!wrap)return;wrap.innerHTML=followUpDraft.map((item,index)=>'<div class="hf-upload-item"><img src="'+esc(item.previewSrc)+'" alt="待发送图片"><button type="button" aria-label="移除第'+(index+1)+'张图片" onclick="hfRemoveFollowUpImage('+index+')">×</button></div>').join('')+(followUpDraft.length<9?'<button type="button" class="hf-upload-add" aria-label="添加图片" onclick="document.getElementById(\'hf-followup-file\').click()">＋</button>':'');};'''
src=replace_line(src,r'^window\.renderFollowUpUploads=function\(\)\{.*$',render_up,'follow-up upload renderer')
submit=r'''window.hfSubmitFollowUp=function(){const record=records[detailKey],input=$('hf-followup-content'),text=input?.value.trim()||'';if(!canFollowUp(record)){notify('反馈状态已变化，暂不能提交追问');return;}if(!text){notify('请填写追问内容');input?.focus();return;}if(Array.from(input.value).length>1000){notify('追问内容最多1000字');input.focus();return;}if(followUpBusy){notify('图片仍在读取，请稍候');return;}if(followUpDraft.length>9||followUpDraft.some(item=>item.byteSize>10*1024*1024||!/^image\/(jpeg|png)$/.test(String(item.mimeType||'')))){notify('附件格式、数量或大小不符合要求');return;}const now=new Date(),occurredAt=now.toISOString(),previousVersion=record.version||1,messageId=record.feedbackNo+'-MSG-'+String(record.messages.length+1).padStart(3,'0'),requestId='DEMO-REQ-'+record.feedbackNo+'-FOLLOWUP-'+(previousVersion+1),attachments=followUpDraft.map((item,index)=>attachmentRef({feedbackNo:record.feedbackNo,messageId,index,fileName:item.fileName,mimeType:item.mimeType,byteSize:item.byteSize,previewSrc:item.previewSrc,localPreview:true},occurredAt));record.messages.push({messageId,feedbackNo:record.feedbackNo,messageType:'追问',authorAccountId:actor.accountId,authorRole:role,authorNameSnapshot:actor.nameSnapshot,receiverAccountId:null,receiverOrganizationId:record.receiverOrganizationId,content:text,attachments,serverSequence:record.messages.length+1,createdAt:occurredAt,displayTime:timeLabel(now),version:1,readFact:'未知',withdrawn:false,deleted:false,requestId});record.updatedAt=occurredAt;record.status='待回复';record.version=previousVersion+1;record.auditEvents??=[];record.auditEvents.push({eventId:record.feedbackNo+'-EVT-FOLLOWUP-'+record.version,feedbackNo:record.feedbackNo,messageId,actorAccountId:actor.accountId,actorNameSnapshot:actor.nameSnapshot,actorRole:role,sourceChannel:'mini-program',action:'feedback_followup_added',occurredAt,result:'success',previousVersion,newVersion:record.version,requestId});hfClose();renderFeedbackDetail(record);renderList();notify('追问已提交');};'''
src=replace_line(src,r'^window\.hfSubmitFollowUp=function\(\)\{.*$',submit,'follow-up submit')
# Explicit image formats for new feedback uploads and file input.
src,n=re.subn(r'accept="image/\*"', 'accept="image/jpeg,image/png"', src)
if n!=1: raise RuntimeError(f'new feedback accept replacement count {n}')
src,n=re.subn(r"!file\.type\.startsWith\('image/'\)", r"!/^image\\/(jpeg|png)$/.test(file.type)", src)
if n!=2: raise RuntimeError(f'upload image validation replacements expected 2, got {n}')
# Correct the list timestamp: remove hint and keep timestamp on the right.
src,n=re.subn(r"<div class=\"hf-record-time\"><span>'\+esc\(record\.messages\.at\(-1\)\?\.displayTime\|\|timeLabel\(new Date\(record\.createdAt\)\)\)\+'</span></div>", "<div class=\"hf-record-time\"><span>'+esc(record.messages.at(-1)?.displayTime||timeLabel(new Date(record.createdAt)))+'</span></div>",src)
if n!=1: raise RuntimeError(f'timestamp markup replacement count {n}')
# Write teacher and exact role-specific shared feedback implementation to parent.
teacher=root/'端-教师'/'版本-v0.11'
parent=root/'端-家长'/'版本-v0.11'
(teacher/js_rel).write_text(src,encoding='utf-8',newline='')
(parent/js_rel).write_text(src,encoding='utf-8',newline='')
css=(teacher/css_rel).read_text(encoding='utf-8')
css += r'''
/* v0.11：详情、追问和撤回按学校Web反馈详情的结构收敛 */
.hf-record-time{justify-content:flex-end;text-align:right}
.hf-view-hint{display:none}
.hf-feedback-number{display:flex;align-items:center;gap:8px;padding:0 0 9px;border-bottom:1px solid #edf0f4;font-size:12px;color:#777f95}
.hf-feedback-number b{margin-left:auto;color:#191744;font-size:12px;overflow-wrap:anywhere;text-align:right}
.hf-feedback-number .hf-badge{margin-left:2px;flex:none}
.hf-feedback-type{padding:9px 0 4px;color:#191744;font-size:13px;font-weight:700}
.hf-detail-summary>.hf-detail-text{padding:7px 0 2px;color:#30344f}
.hf-detail-summary .hf-images{margin:8px 0 0}
.hf-detail-actions{display:flex;gap:10px;padding:0 0 18px}
.hf-detail-action{flex:1;min-width:0;height:44px;min-height:44px;border-radius:8px;font-size:14px}
.hf-detail-actions button:disabled{background:#edf0f4!important;border:1px solid #e1e5eb!important;color:#a3aabd!important;cursor:not-allowed;opacity:1}
#hf-dialog>.hf-form-actions{flex:none;margin:0 -14px -15px;padding:12px 14px calc(12px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #e6e8ee}
#hf-dialog>.hf-form-actions button{flex:1;height:42px;border-radius:8px;font-size:14px}
#hf-dialog>.hf-form-actions .hf-primary{background:linear-gradient(110deg,#76d54e,#0dbb53);color:#fff}
.hf-dialog-body>.hf-followup-context{display:flex;flex-direction:column;gap:12px}
.hf-followup-context .hf-card{margin:0}
.hf-followup-form .hf-submit-text-wrap{min-height:140px}
.hf-followup-form #hf-followup-content{min-height:140px;max-height:none}
.hf-followup-attachments{min-height:112px}
.hf-submit-upload-grid .hf-upload-item button{z-index:1}
#hf-followup-submit:disabled{opacity:.55;cursor:wait}
'''
(teacher/css_rel).write_text(css,encoding='utf-8',newline='')
(parent/css_rel).write_text(css,encoding='utf-8',newline='')
# Refresh cache-busting query strings for only the modified JS/CSS.
for end in (teacher,parent):
    index=end/'index.html'; html=index.read_text(encoding='utf-8')
    js_hash=hashlib.sha256((end/js_rel).read_bytes()).hexdigest()[:12].upper()
    css_hash=hashlib.sha256((end/css_rel).read_bytes()).hexdigest()[:12].upper()
    html,n1=re.subn(r'(assets/help-v1\.js\?v=)[A-Fa-f0-9]+',r'\g<1>'+js_hash,html)
    html,n2=re.subn(r'(assets/help-v1\.css\?v=)[A-Fa-f0-9]+',r'\g<1>'+css_hash,html)
    if (n1,n2)!=(1,1): raise RuntimeError(f'{index}: cache refs {n1},{n2}')
    index.write_text(html,encoding='utf-8',newline='')
print('patched teacher+parent v0.11')
for end in (teacher,parent):
    print(end.name,hashlib.sha256((end/js_rel).read_bytes()).hexdigest(),hashlib.sha256((end/css_rel).read_bytes()).hexdigest())
