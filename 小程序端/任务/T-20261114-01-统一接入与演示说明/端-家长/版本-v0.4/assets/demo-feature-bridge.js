(()=>{'use strict';const old=window.renderDemo;let key='';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function frame(){const f=document.getElementById('baseline-notice-frame');try{return f?.contentWindow?.getModuleDemo?f:null}catch{return null}}
function notice(){const el=document.getElementById('sc-family-notice');return el&&el.getClientRects().length&&getComputedStyle(el).display!=='none'?frame():null}
function helpModal(){const overlay=document.getElementById('hf-overlay');return overlay&&!overlay.hidden&&getComputedStyle(overlay).display!=='none'?document.getElementById('hf-dialog-title')?.textContent:null}
window.renderDemo=function(){const f=notice(),title=helpModal();if(f){const cfg=f.contentWindow.getModuleDemo();if(cfg){demoPanelRender({key:cfg.key,t:escape(cfg.title),d:escape(cfg.intro)+'\n'+cfg.sections.map(s=>'【'+escape(s.title)+'】'+escape(s.text)).join('\n'),acts:cfg.actions.map(a=>'<button type="button" onclick="noticeDemoAction(\''+a.id+'\')">'+escape(a.label)+'</button>').join(''),gen:''});return}}
 if(title){const type=title==='联系客服'?'客服电话名单':title==='反馈建议'?'反馈提交':title==='反馈截图'?'反馈附件原图':title;const d={
 '客服电话名单':'按当前学校和角色展示负责机构配置的客服名单，可选择具体客服。\n【分组与拨打】多人按负责机构分组展示；每人显示姓名、电话及工作时间，点击该人的拨打入口仅模拟拨号，不触达真实号码。\n【关闭与恢复】关闭名单返回帮助与反馈，保持当前角色和客服配置场景；单客服场景直接显示电话和工作时间。',
 '反馈提交':'从帮助与反馈或我的反馈进入，向当前身份的反馈记录追加一条本地示例。\n【字段与校验】类型为功能建议、问题反馈；正文必填。截图最多5张、每张不超过10MB；读取期间提交不可用，移除暂选截图不改变已提交记录。\n【提交与返回】校验失败保留输入；正常提交后更新当前角色列表。关闭只退出当前输入弹层，不改其他角色记录。\n【演示边界】当前HTML记录刷新重置，不代表真实受理或消息通知。',
 '反馈附件原图':'只预览当前反馈所选截图。\n【关闭与返回】关闭原图恢复当前反馈详情，不替换记录，不重复创建详情页。\n【资源异常】截图不可访问时保留关闭入口，不能用其他反馈图片代替。'
 }[type]||'当前帮助与反馈弹窗。\n【关闭与返回】关闭后返回所属业务页，保留当前身份和合法记录上下文。';
 demoPanelRender({key:'help-modal/'+(window.ZXH_HELP_ROLE||'')+'/'+type,t:escape(title),d,acts:'',gen:''});return}old?.()};
window.noticeDemoAction=id=>{const f=notice();if(f)f.contentWindow.demoAction(id);renderDemo()};
setInterval(()=>{const f=notice(),cfg=f?.contentWindow.getModuleDemo(),next=cfg?.key||helpModal()||location.hash;if(next!==key){key=next;if(document.getElementById('demo-pop')?.classList.contains('show'))renderDemo()}},250);
document.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.matches('#demo-pop .dp-sh,#dp-all,#demo-pop .dp-more')){e.preventDefault();e.target.click()}});
})();
