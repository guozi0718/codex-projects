(()=>{'use strict';const old=window.renderDemo;let key='';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function frame(id){const f=document.getElementById(id||'notification-frame');try{return f?.contentWindow?.getModuleDemo?f:null}catch{return null}}
function notice(){const mini=document.getElementById('sc-notification');if(mini&&mini.classList.contains('show')&&getComputedStyle(mini).display!=='none')return frame('notification-frame');const el=document.getElementById('sc-family-notice');return el&&el.getClientRects().length&&getComputedStyle(el).display!=='none'?frame('baseline-notice-frame'):null}
function helpModal(){const overlay=document.getElementById('hf-overlay');return overlay&&!overlay.hidden&&getComputedStyle(overlay).display!=='none'?document.getElementById('hf-dialog-title')?.textContent:null}
function feedbackGuide(role){
 const common="【反馈字段与校验】反馈类型为问题反馈或功能建议；首条反馈内容必填且≤500字，追问内容必填且≤1000字。每条消息最多9张图片、每张≤10MB，仅接受JPG/JPEG/PNG；读取期间禁用提交。feedbackNo同时是唯一记录ID和业务反馈编号。状态使用待回复/已回复/已撤回；已提交记录及消息不可修改。详情先展示feedbackNo，再展示类型/状态及完整首条内容；不显示独立提交时间，不展示学校/学生快照或内部处理信息。公开沟通记录按时间逆序，最新消息在上，无后续消息时不显示空沟通卡。列表整卡可进入详情，时间右对齐。详情始终显示等宽“追问”“撤回”；不满足资格的操作置灰。";
 const teacher="【教师提交时身份与权限】服务端须复核当前登录账号、教师角色、当前学校有效任职关系及该校当前反馈提交授权；任职、身份或授权失效时拒绝创建，不生成反馈编号/消息/附件/通知。受理组织按当前学校负责方配置确定。submitterAccountId、sourceRole、学校/地区及姓名快照取可信登录态和任职关系，不接受前端自报值；教师记录不关联学生。真实权限码/接口尚未接入，原型不新增权限点，也不以可见按钮表示生产有权。\n【教师记录隔离】只按当前教师角色+本人提交账号列出记录；不按当前学校筛掉本人历史；同校其他教师账号不可见，切到家长身份不混显教师记录。详情不展示学校快照。\n【教师演示路径】帮助与反馈→反馈建议→提交；提交完成后回到我的反馈，点整张记录卡进入详情。使用待回复样例查看两个可操作按钮；使用已回复样例查看“撤回”置灰；无学校任职/提交权限的真实拒绝结果待接服务端后验证。";
 const parent="【家长提交时孩子关系与状态】提交表单使用打开表单时当前选中的孩子；服务端重新核验当前账号的家长身份、与该孩子的有效关系、孩子及学校当前状态和Web规定的提交资格，再按服务端权威数据写入studentId、学生姓名、学校/班级及提交时学籍状态快照。快照用于历史关联/审计，不在详情页回显。原型里的学生状态仅是样例上下文，不代表所有状态均可提交；允许状态枚举须映射学校Web/服务端字典，未映射前不能推断资格。\n【家长记录隔离与历史】按当前家长角色+本人提交账号读取，不按当前选中孩子过滤；同家庭其他家长不可查看。孩子解绑、转校、移出当前列表或既有一年入口到期，不删除本人历史反馈；家长仍可在本人列表查看并使用提交时学生名称快照。详情不显示学校/学生快照。\n【家长演示路径】先在首页切换不同孩子，再打开帮助与反馈→反馈建议；演示说明应标出表单打开时所选孩子及该样例当时状态。提交后切换其他孩子，仍能在本人反馈列表查看旧记录。生产资格拒绝与状态枚举须在接入服务端后验证。";
 return (role==='teacher'?teacher:parent)+common+'\n'+"【提交与返回】校验失败保留当前表单内容；成功后仅在当前角色的本人列表增加记录。关闭/取消不提交。\n【离线边界】样例账号、学生、学校、编号为虚构值；真实登录鉴权、数据库、权限、受理路由、幂等、附件存储和通知未接入，刷新后本地新增数据重置。";
}
function detailGuide(role){return (role==='teacher'?"【教师】本人教师账号可查看自己的记录；不关联学生，不显示学校快照。":"【家长】本人家长账号可查看自己的记录，不按当前孩子过滤；详情不显示孩子/学校快照。")+"【反馈详情】feedbackNo兼记录ID排在反馈类型之前，同卡展示状态、完整首条正文与原始附件；不显示提交时间字段。公开沟通按消息时间倒序、同刻按服务端顺序倒序，初始正文不重复进入时间线，内部处理消息过滤。数据不可访问时不返回正文/附件，不以其他记录替代。";}
function followUpGuide(role){return (role==='teacher'?"【当前角色】教师；服务端复核本人账号、教师权限和受理关系。":"【当前角色】家长；服务端复核本人账号、本人记录权限和受理关系。")+"【追问】弹窗先展示原反馈完整业务内容、原附件及已有公开沟通记录，再展示必填追问内容模块；不显示额外说明语。仅待回复/已回复可追问；内容≤1000字、附件最多9张/每张≤10MB。提交时服务端复核当前角色、本人记录权限、状态、受理关系和版本；沿用原feedbackNo追加消息，待回复保持待回复，已回复转待回复，更新消息/记录时间、版本和受理通知。取消不写入。空内容、字数/附件超限、读取失败、状态或授权变化时不创建消息；未知网络结果按同一requestId查询，避免重复追加。";}
function withdrawGuide(role){return (role==='teacher'?"【当前角色】教师；只可操作本人可见且受理/状态复核通过的记录。":"【当前角色】家长；只可操作本人可见且受理/状态复核通过的记录。")+"【撤回】仅待回复且没有处理方回复时可以撤回。弹窗与学校Web一致：标题“撤回这条消息？”，正文“撤回后将不再等待该消息的回复，日志保留操作痕迹。”，按钮“取消/确定”；无原因输入。取消无副作用；确定前服务端再次核验本人、当前角色、状态、处理回复事实和版本。成功后保留记录、消息和附件，状态改已撤回并记录操作者/时间/审计；之后追问和撤回均置灰。并发状态变化时拒绝并刷新详情。";}
window.renderDemo=function(){const f=notice(),title=helpModal();if(f){const cfg=f.contentWindow.getModuleDemo();if(cfg){demoPanelRender({key:cfg.key,t:escape(cfg.title),d:escape(cfg.intro)+'\n'+cfg.sections.map(s=>'【'+escape(s.title)+'】'+escape(s.text)).join('\n'),acts:cfg.actions.map(a=>'<button type="button" onclick="noticeDemoAction(\''+a.id+'\')">'+escape(a.label)+'</button>').join(''),gen:''});return}}
 if(title){const role=window.ZXH_HELP_ROLE||'',type=title==='联系客服'?'客服电话名单':title==='提交反馈'||title==='反馈建议'?'反馈提交':title==='反馈截图'?'反馈附件原图':title;const d={
 '客服电话名单':'按当前学校和角色展示负责机构配置的客服名单，可选择具体客服。\n【分组与拨打】多人按负责机构分组展示；每人显示姓名、电话及工作时间，点击该人的拨打入口仅模拟拨号，不触达真实号码。\n【关闭与恢复】关闭名单返回帮助与反馈，保持当前角色和客服配置场景；单客服场景直接显示电话和工作时间。',
 '反馈提交':feedbackGuide(role),
  '反馈详情':detailGuide(role),'追问':followUpGuide(role),'撤回这条消息？':withdrawGuide(role),
 '反馈附件原图':'只预览当前反馈所选截图。\n【关闭与返回】关闭原图恢复当前反馈详情，不替换记录，不重复创建详情页。\n【资源异常】截图不可访问时保留关闭入口，不能用其他反馈图片代替。'
 }[type]||'当前帮助与反馈弹窗。\n【关闭与返回】关闭后返回所属业务页，保留当前身份和合法记录上下文。';
 demoPanelRender({key:'help-modal/'+role+'/'+type,t:escape(title),d,acts:'',gen:''});return}old?.()};
window.noticeDemoAction=id=>{const f=notice();if(f)f.contentWindow.demoAction(id);renderDemo()};
setInterval(()=>{const f=notice(),cfg=f?.contentWindow.getModuleDemo(),next=cfg?.key||helpModal()||location.hash;if(next!==key){key=next;if(document.getElementById('demo-pop')?.classList.contains('show'))renderDemo()}},250);
document.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.matches('#demo-pop .dp-sh,#dp-all,#demo-pop .dp-more')){e.preventDefault();e.target.click()}});
})();

