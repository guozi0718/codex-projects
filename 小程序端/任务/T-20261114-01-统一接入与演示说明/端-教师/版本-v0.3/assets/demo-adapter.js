/* Prototype-only, audited local adapters; never executes text from a URL or a message. */
(()=>{'use strict';
const settings=window.FeatureEntryConfig||{},params=new URLSearchParams(location.search),mini=!!document.querySelector('.phone')&&['teacher','parent'].includes(settings.end||window.ZXH_HELP_ROLE),end=settings.end||window.ZXH_HELP_ROLE||params.get('role')||document.body.dataset.end||'school';
const visible=e=>!!e&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none',esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current=null,lastKey='',fingerprint='',undo=[],activeScene='',queued=false,noticeReading=false;
const coverage=new Map,originalRender=window.renderDemo;
function businessRoot(){if(mini)return document.querySelector('.screen.show')||document.querySelector('.screen.active')||document.querySelector('.phone');return document.querySelector('#feature-business')||document.querySelector('#workspace')||document.querySelector('#app')||document.body}
function context(){
 const q=Object.fromEntries(new URLSearchParams(location.search));let page=q.page||'',module=settings.module||'',root=businessRoot(),title='';
 if(settings.module==='notice'){page=window.NoticeDemoBridge?.route?.().noticeView||q.noticeView||'list';module='notice';title=({list:'家校通知',detail:'通知详情',edit:'通知编辑',print:'通知打印',withdrawn:'通知已删除',sign:'通知签字'})[page]||'家校通知';}
 else if(mini){page=root?.id||'';if(page==='sc-family-notice')return null;module=['sc-help'].includes(page)?'cs':/sc-fb/.test(page)?'feedback':'';if(!module)return null;title=({'sc-help':'帮助与反馈','sc-fblist':'我的反馈','sc-fbdetail':'反馈详情'})[page]||'反馈建议';}
 else title=({cs:'客服管理','customer-service.list':'客服列表','customer-service.detail':'客服详情','school-feedback':end==='agent'?'学校反馈':'问题反馈','agent-feedback':'问题反馈','feedback.replies':'反馈回复','feedback.detail':'反馈详情','feedback.user-data':'用户数据查询','feedback.faqs':'常见问题配置'})[page]||'';
 if(!title)return null;
 const dialogs=[...document.querySelectorAll('.cs-mask .cs-dlg,.v5-mask .dlg,.mask .dlg,#hf-dialog,.modal,.drawer,[role="dialog"]')].filter(e=>visible(e)&&!e.closest('#demo-pop'));
 const dialog=dialogs.at(-1);if(dialog){root=dialog;const heading=dialog.querySelector('.cs-dh,.dh,.modal-header h2,.modal-header h3,h2,h3,.hf-dialog-title');const t=(heading?.textContent||dialog.getAttribute('aria-label')||'').replace(/×|✕/g,'').trim();if(t)title=t;else if(mini&&document.querySelector('#hf-overlay:not([hidden])'))title='反馈建议';}
 const tabs=[...root.querySelectorAll('[role="tab"][aria-selected="true"],.ltabs .on,.tabs .active,.tab.active,.hf-types .on')].filter(visible).map(e=>e.textContent.trim()).join(' / ');
 const alert=[...root.querySelectorAll('[role="alert"],.form-error,.cs-error,.v5-error,.notice-error')].find(e=>visible(e)&&e.textContent.trim());
 const mode=settings.module==='notice'?window.NoticeDemoBridge?.mode?.()||'':q.dialog||q.view||'';
 if(!dialog&&module==='cs'&&mode==='logs')title='客服日志';
 if(mini&&document.querySelector('#hf-overlay:not([hidden]) #fb-txt'))module='feedback';
 const key=[settings.project||module,end,page,tabs,mode,title.replace(/[·：:].*$/,'').trim(),alert?'validation':'normal'].join('/');
 return{key,module,page,title,tabs,mode,root,alert:alert?.textContent.trim()||'',dialog:!!dialog};
}
function restore(){for(const fn of undo.splice(0).reverse())try{fn()}catch{}activeScene='';}
function hide(el){const old=el.getAttribute('style');el.style.setProperty('display','none','important');undo.push(()=>old===null?el.removeAttribute('style'):el.setAttribute('style',old))}
function run(id){
 restore();const c=context();if(!c)return;const root=c.root;
 if(['service-single','service-multi'].includes(id)&&mini&&typeof window.hfSetService==='function'){window.hfSetService(id==='service-single'?'single':'multi');refresh(true);return}
 if(id==='mobile-empty'&&mini&&typeof window.fbEmptyToggle==='function'){window.fbEmptyToggle();refresh(true);return}
 if(id==='restore'){refresh(true);return}
 if(id==='read-only'){
  const changed=[];for(const el of root.querySelectorAll('input,select,textarea,button,[contenteditable=true]')){if(!visible(el))continue;changed.push([el,el.disabled,el.getAttribute('contenteditable')]);if('disabled'in el)el.disabled=true;else el.setAttribute('contenteditable','false')}
  undo.push(()=>changed.forEach(([e,d,a])=>{if('disabled'in e)e.disabled=d;if(a!==null)e.setAttribute('contenteditable',a)}));
  const note=document.createElement('div');note.className='demo-scene-notice';note.textContent='只读权限预览：本层操作已禁用；恢复默认可继续操作。';root.prepend(note);undo.push(()=>note.remove());
 }else if(['empty','no-match'].includes(id)&&root.querySelector('tbody')){
  const tbody=root.querySelector('tbody');[...tbody.children].forEach(hide);const row=document.createElement('tr');const cell=document.createElement('td');cell.colSpan=root.querySelectorAll('thead th').length||20;cell.className='demo-scene-empty';cell.textContent=id==='empty'?'暂无数据':'暂无符合条件的记录';row.append(cell);tbody.append(row);undo.push(()=>row.remove());
 }else{
  const labels={empty:['暂无数据','本页空数据预览，恢复默认可返回原界面。'],'no-match':['暂无匹配结果','当前条件没有匹配内容；演示不会改写实际查询条件。'],loading:['正在加载','演示加载中；不发起业务请求。'],network:['加载失败','网络异常预览，请重试或恢复默认。'],permission:['暂无访问权限','当前演示角色不可操作；恢复默认返回原页面。'],expired:['记录已失效','该演示对象不存在或已被处理；请返回或恢复默认。'],conflict:['数据已更新','操作版本已变化，请重新读取后再操作。'],validation:['校验未通过','请检查当前页面的必填字段和格式；本次没有提交。'],duplicate:['请勿重复提交','本次为重复操作提示预览，没有重复写入数据。'],upload:['附件校验未通过','请按当前表单展示的格式、数量和大小限制重新选择。'],retry:['暂时无法完成操作','重试失败预览；原输入和数据未被提交。']};
  const [title,text]=labels[id]||labels.network;const overlay=document.createElement('div');overlay.className='demo-scene-preview';overlay.innerHTML='<h3>'+esc(title)+'</h3><p>'+esc(text)+'</p><button type="button">恢复默认</button>';overlay.querySelector('button').onclick=()=>run('restore');
  if(['validation','upload','duplicate','conflict'].includes(id)){overlay.classList.add('inline');overlay.setAttribute('role','alert');root.prepend(overlay)}else{[...root.children].forEach(hide);root.append(overlay)}undo.push(()=>overlay.remove());
 }
 activeScene=id;refresh(true);
}
function describe(c){
 const controls=[...c.root.querySelectorAll('input:not([type=hidden]),select,textarea,[contenteditable=true]')].filter(visible).filter(e=>!e.closest('#demo-pop'));
 const fields=controls.map(e=>{const label=e.getAttribute('aria-label')||e.closest('label')?.querySelector('span')?.textContent||e.closest('.fr,.fi')?.querySelector('label')?.textContent||e.placeholder||e.name||'输入项';const limits=[e.required?'必填':'',e.maxLength>0?'最多'+e.maxLength+'字':'',e.type==='number'?'数字输入':'',e.disabled?'当前不可编辑':'',e.readOnly?'只读':''].filter(Boolean).join('，');return label.trim()+(limits?'：'+limits:'')}).slice(0,20);
 const buttons=[...c.root.querySelectorAll('button,[data-cs],[data-v5]')].filter(visible).filter(e=>!e.closest('#demo-pop')&&!e.closest('.demo-scene-preview')).map(e=>({label:e.textContent.trim().replace(/\s+/g,' '),disabled:e.disabled,reason:e.title})).filter(x=>x.label&&x.label.length<35).slice(0,22);
 const role=({enterprise:'运营',agent:'代理商',school:'学校',teacher:'教师',parent:'家长',ops:'运营'})[end]||end;
 let text=`当前${role}端的“${c.title}”，从本功能菜单或所属页面进入。`+(c.tabs?'当前页内Tab：'+c.tabs+'。':'');
 if(mini&&typeof demoInfo!=='undefined'&&demoInfo[c.page]?.d)text+='\n【本页既有说明】'+demoInfo[c.page].d;
 text+='\n【入口与返回】主菜单和顶部页签由所属端基线提供；本功能只提供内容入口。关闭弹窗返回所属页面；合法对象可刷新恢复，无效对象显示错误，URL不执行保存、发送或删除。';
 if(c.module==='cs')text+='\n【客服规则】当前学校可关联多名专属客服，展示时代理商组在平台组之前；无专属时按负责机构的默认客服或联系人兜底。代理商端只处理本机构范围。默认客服删除受当前模型校验约束，不能通过演示预览绕过。关联选择以确认保存为准，取消不保存未提交选择。';
 if(c.module==='cs'&&c.mode==='logs')text+='\n【日志筛选】默认近30天；日期快捷范围或自定义完整开始/结束日期，开始不能晚于结束。客服姓名和时间范围在点击查询后应用；返回客服列表清理日志路由，不改写历史事件时间。';
 if(c.page==='feedback.faqs')text+='\n【分类与问题配置】分类顺序固定；同一分类内可拖动调整问题顺序。当前分类只展示其问题，切分类后说明跟随。新增、编辑、启用状态和删除遵守当前表单的必填与确认校验；取消不保存。所有学校共用同一套问题配置；当前为离线原型，不能把本页修改当小程序已实时更新。';
 else if(c.page==='feedback.user-data')text+='\n【用户查询与资料】只查询已有账号目录，支持当前模型中的家长、教师、学校和代理商账号；姓名或电话先选取候选再执行查询，资料按账号ID读取，不把反馈中的历史姓名/单位快照当当前资料。家长详情的孩子、考勤、校徽、办理、退款、反馈页内Tab按当前选中账号显示；规则和说明随Tab切换，空结果保持可返回。';
 else if(c.module==='feedback')text+='\n【反馈规则】当前端可用操作以本页实际按钮为准；不同角色不共用不适用的回复、追问或协作权限。类型、状态和消息上下文参与提交校验；查看、追问、回复、撤回或删除的提交均由当前功能模型复验。筛选候选和查询结果分离，点击查询后更新列表。附件按当前表单明确限制处理，不把小程序与Web的数量限制混用。';
 if(c.module==='notice')text+='\n【通知规则】查看和操作范围由当前角色、学校模式、接收范围和通知状态共同决定。已有功能为新增、编辑、删除、查看、打印、阅读统计；不额外添加撤回操作。家长按实际查收方式确认或签字，不能操作其他孩子的通知。提交时再次校验编辑权限和版本，统计和回执使用本地演示数据。';
 if(fields.length)text+='\n【字段与校验】'+fields.join('；')+'。必填标记、格式和附件限制以当前表单呈现及提交校验为准；不同新增/编辑业务布局保留差异。';
 if(buttons.length)text+='\n【当前操作】'+buttons.map(x=>x.label+(x.disabled?'（当前不可用'+(x.reason?'：'+x.reason:'')+'）':'')).join('；')+'。有二次确认时须在确认后才执行，取消返回当前上下文。';
 if(c.alert)text+='\n【当前校验提示】'+c.alert;
 text+='\n【状态与异常】演示操作只影响本页当前层的展示，不写入业务模型、不发送通知、不触达真实人员。无数据、无匹配、只读、无权限和失败预览仅在适用上下文显示；恢复默认还原本层原界面。';
 text+='\n【演示边界】本说明用于原型开发评审。业务原型沿用现有本地存储与模拟能力；演示预览为当前阅读上下文临时状态，切页、切弹窗或刷新恢复默认。预览不是生产服务或真实权限判定，原始输入和已保存记录不因预览被清空。';
 return text;
}
function actions(c){let a=c.dialog?[['validation','预览 · 校验失败'],['read-only','预览 · 只读权限'],['conflict','预览 · 数据已更新'],['duplicate','预览 · 重复操作']]:[['empty','预览 · 无数据'],['no-match','预览 · 无匹配'],['loading','预览 · 加载中'],['network','预览 · 网络失败'],['permission','预览 · 无权限'],['read-only','预览 · 只读权限'],['expired','预览 · 对象失效'],['retry','预览 · 重试失败']];if(mini&&c.page==='sc-help'&&!c.dialog)a.unshift(['service-single','场景一 · 单客服'],['service-multi','场景二 · 多客服']);if(mini&&c.page==='sc-fblist'&&!c.dialog)a.unshift(['mobile-empty','切换空态预览']);if(c.dialog&&c.root.querySelector('input[type=file],#v5-upload,#hf-file,[data-action=upload-media]'))a.push(['upload','预览 · 附件校验失败']);a.push(['restore','恢复 · 默认场景']);return a}
function noticeFrame(){return mini&&document.getElementById('sc-family-notice')?.classList.contains('show')?document.getElementById('baseline-notice-frame'):null}
function refresh(force=false){const c=context();if(!c){const f=noticeFrame();if(f&&document.getElementById('demo-pop')?.classList.contains('show')){closeDemo(1);const forward=()=>f.contentWindow.postMessage({channel:'feature-demo-ensure-open'},location.origin);f.addEventListener('load',forward,{once:true});forward()}else if(mini&&!f&&originalRender&&document.getElementById('demo-pop')?.classList.contains('show'))originalRender();return}
 if(lastKey&&lastKey!==c.key)restore();current=c;const panel=document.getElementById('demo-pop');if(!panel)return;
 const d=describe(c),fp=c.key+'|'+d;if(!force&&fp===fingerprint)return;fingerprint=fp;lastKey=c.key;
 coverage.set(c.key,{key:c.key,title:c.title,module:c.module,page:c.page,mode:c.mode,tabs:c.tabs});panel.dataset.contextKey=c.key;
 window.demoPanelRender({key:c.key,t:esc(c.title),d:esc(d),acts:actions(c).map(([id,label])=>'<button type="button" onclick="UnifiedDemo.run(\''+id+'\')"'+(activeScene===id?' aria-pressed="true"':'')+'>'+label+'</button>').join(''),gen:''});
 if(mini&&noticeReading&&!noticeFrame()&&!panel.classList.contains('show')){noticeReading=false;toggleDemo()}
 for(const e of panel.querySelectorAll('.dp-sh,#dp-all,.dp-more')){e.tabIndex=0;e.setAttribute('role','button')}
}
function init(){if(!document.getElementById('demo-pop')){const fab=document.createElement('div');fab.id='demo-fab';fab.innerHTML='<button type="button" class="demo-chip" onclick="toggleDemo()" aria-label="演示说明">演示说明</button><section id="demo-pop" class="demo-pop"></section>';document.body.append(fab)}
 window.renderDemo=function(){const c=context();if(c||noticeFrame())refresh(true);else if(originalRender)originalRender()};
 if(mini){const oldToggle=window.toggleDemo;window.toggleDemo=function(){const f=noticeFrame();if(f){f.contentWindow.postMessage({channel:'feature-demo-open'},location.origin);return}return oldToggle()};addEventListener('message',e=>{const f=document.getElementById('baseline-notice-frame');if(e.origin===location.origin&&e.source===f?.contentWindow&&e.data?.channel==='feature-content-state')noticeReading=!!e.data.demoOpen})}
 new MutationObserver(list=>{if(list.every(m=>m.target.closest?.('#demo-pop')||m.target.closest?.('.demo-scene-preview')))return;if(queued)return;queued=true;queueMicrotask(()=>{queued=false;refresh()})}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
 document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('.dp-sh,#dp-all,.dp-more')){e.preventDefault();e.target.click()}const overlay=[...document.querySelectorAll('.v5-mask,.cs-mask,.mask,#modal-root>.dialog-mask,#hf-overlay:not([hidden])')].some(visible);if(e.key==='Escape'&&!overlay&&document.getElementById('demo-pop')?.classList.contains('show')){e.preventDefault();closeDemo(1)}},true);
 if(params.get('hosted')==='1'){document.body.dataset.demoHosted='true';addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin)return;if(e.data?.channel==='feature-demo-open')toggleDemo();else if(e.data?.channel==='feature-demo-ensure-open'&&!document.getElementById('demo-pop').classList.contains('show'))toggleDemo();else if(e.data?.channel==='feature-demo-close')closeDemo(1)})}
 window.UnifiedDemo={run,restore,refresh,context:()=>current,get coverage(){return [...coverage.values()]}};refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
