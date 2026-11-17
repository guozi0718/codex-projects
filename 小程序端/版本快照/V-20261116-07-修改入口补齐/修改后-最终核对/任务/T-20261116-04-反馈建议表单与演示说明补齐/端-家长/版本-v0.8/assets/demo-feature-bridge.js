(()=>{'use strict';const old=window.renderDemo;let key='';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function frame(){const f=document.getElementById('baseline-notice-frame');try{return f?.contentWindow?.getModuleDemo?f:null}catch{return null}}
function notice(){const el=document.getElementById('sc-family-notice');return el&&el.getClientRects().length&&getComputedStyle(el).display!=='none'?frame():null}
function helpModal(){const overlay=document.getElementById('hf-overlay');return overlay&&!overlay.hidden&&getComputedStyle(overlay).display!=='none'?document.getElementById('hf-dialog-title')?.textContent:null}
function feedbackGuide(role){
 const common='\n【字段与校验】问题反馈、功能建议二选一；正文必填，最多500字。图片附件最多9张，每张不超过10MB；只接收图片。文件读取期间禁用提交，移除暂选图片不改变已提交记录。新记录状态为待回复，反馈编号同时是唯一记录ID和业务编号。';
 const teacher='\n【教师提交时身份与权限】由当前登录教师角色发起；提交请求需在服务端复核登录账号仍为教师身份、教师与当前学校的有效任职关系，并按该学校当前负责方配置确定受理组织。sourceRole、submitterAccountId、学校/地区快照、姓名及绑定电话均由可信登录态和任职关系生成，不能采用前端自报值；教师记录不关联学生。用户已确认学校归属与受理路由，但未定义独立的“反馈提交权限”开关，原型不虚构权限点或开关。当前HTML只展示有权登录的教师样例，未模拟服务端拒绝。\n【教师记录可见范围】提交后只在当前教师角色+本人账号下显示，不按当前学校筛除历史；同校其他教师不能查看，切换家长角色后也不混入家长记录。\n【演示路径】以教师端当前身份进入帮助与反馈→反馈建议，提交后回到“我的反馈”查看新记录；学校归属和受理组织以提交时快照演示。';
 const parent='\n【家长提交时孩子状态】提交时使用进入表单前当前选中的孩子上下文；服务端需重新核验当前家长账号与该孩子的关联，并从该孩子关系确定学校和受理组织。记录保存studentId、姓名、班级、学校及studentStatusSnapshot（在读生/毕业生/离校生）快照，不让前端传值替代服务端校验。可先在首页切换林晓乐/林晓晴/林晓帆，再进入反馈表单，分别查看在读、毕业、离校示例。\n【状态变化与历史】学生解绑、转校或从当前孩子列表移除，不改写既有反馈的提交时快照；孩子原资料入口按既有规则保留一年，超期后家长仍可按本人账号查看反馈并看到原学生快照。本人反馈列表跨所选孩子显示；同家庭其他家长账号不可见。新提交只使用提交时可选且关系有效的当前孩子，资格由服务端复核。\n【演示路径】在家长端先选一个孩子，再进入帮助与反馈→反馈建议；新记录快照取表单打开时的当前孩子。切换到其他孩子查看本人列表时，旧记录仍在。';
 return (role==='teacher'?teacher:parent)+common+'\n【提交与返回】校验失败保留表单内容；提交成功只在当前角色的本地演示列表新增记录。取消或关闭退出当前表单。\n【权限与演示边界】原型账号/学生/学校/反馈编号均为虚构值；HTML的本地过滤不是生产权限。真实登录鉴权、教师任职/功能授权、家长孩子关系校验、服务端编号、受理路由、数据库写入、附件存储与通知均未接入；刷新后本地新增内容重置。';
}
window.renderDemo=function(){const f=notice(),title=helpModal();if(f){const cfg=f.contentWindow.getModuleDemo();if(cfg){demoPanelRender({key:cfg.key,t:escape(cfg.title),d:escape(cfg.intro)+'\n'+cfg.sections.map(s=>'【'+escape(s.title)+'】'+escape(s.text)).join('\n'),acts:cfg.actions.map(a=>'<button type="button" onclick="noticeDemoAction(\''+a.id+'\')">'+escape(a.label)+'</button>').join(''),gen:''});return}}
 if(title){const role=window.ZXH_HELP_ROLE||'',type=title==='联系客服'?'客服电话名单':title==='提交反馈'||title==='反馈建议'?'反馈提交':title==='反馈截图'?'反馈附件原图':title;const d={
 '客服电话名单':'按当前学校和角色展示负责机构配置的客服名单，可选择具体客服。\n【分组与拨打】多人按负责机构分组展示；每人显示姓名、电话及工作时间，点击该人的拨打入口仅模拟拨号，不触达真实号码。\n【关闭与恢复】关闭名单返回帮助与反馈，保持当前角色和客服配置场景；单客服场景直接显示电话和工作时间。',
 '反馈提交':feedbackGuide(role),
 '反馈附件原图':'只预览当前反馈所选截图。\n【关闭与返回】关闭原图恢复当前反馈详情，不替换记录，不重复创建详情页。\n【资源异常】截图不可访问时保留关闭入口，不能用其他反馈图片代替。'
 }[type]||'当前帮助与反馈弹窗。\n【关闭与返回】关闭后返回所属业务页，保留当前身份和合法记录上下文。';
 demoPanelRender({key:'help-modal/'+role+'/'+type,t:escape(title),d,acts:'',gen:''});return}old?.()};
window.noticeDemoAction=id=>{const f=notice();if(f)f.contentWindow.demoAction(id);renderDemo()};
setInterval(()=>{const f=notice(),cfg=f?.contentWindow.getModuleDemo(),next=cfg?.key||helpModal()||location.hash;if(next!==key){key=next;if(document.getElementById('demo-pop')?.classList.contains('show'))renderDemo()}},250);
document.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.matches('#demo-pop .dp-sh,#dp-all,#demo-pop .dp-more')){e.preventDefault();e.target.click()}});
})();