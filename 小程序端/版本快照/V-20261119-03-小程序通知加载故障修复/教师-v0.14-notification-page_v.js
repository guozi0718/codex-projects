(()=>{'use strict';
const screen=document.getElementById('sc-notification');
const body=screen?.querySelector('.body');
const heading=screen?.querySelector('.sub-hd b');
const back=screen?.querySelector('.sub-hd .back');
if(!screen||!body)return;
const role=document.querySelector('#home-rl')?'teacher':'parent';
let root=document.getElementById('notification-mini-root');
if(!root){root=document.createElement('div');root.id='notification-mini-root';root.className='notice-module notice-module-'+role;body.replaceChildren(root);}
else if(root.parentElement!==body)body.replaceChildren(root);
const css=document.createElement('link');css.rel='stylesheet';css.href='assets/notification-mini.css?v=20261119-02';document.head.appendChild(css);
window.NotificationMiniHost=(title)=>{if(heading)heading.textContent=title||'通知';};
if(back){back.removeAttribute('onclick');back.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(window.NotificationMini?.back)window.NotificationMini.back();else window.go?.('sc-home');},true);}
function loadScript(src,next){if(document.querySelector('script[data-notice-src="'+src+'"]')){next();return;}const s=document.createElement('script');s.dataset.noticeSrc=src;s.src=src;s.onload=next;s.onerror=()=>{root.innerHTML='<div class="nm-load-error">通知模块资源加载失败，请刷新后重试。</div>';};document.body.appendChild(s);}
try{demoInfo['sc-notification']={t:'通知 · 开发演示说明',d:'【页面与栈】当前视图位于 sc-notification。模块列表、页签、编辑、详情和弹层均通过同一页面内的视图状态切换；不新增小程序页面路由。',a:[]};}catch{}
loadScript('assets/notification-mini/core.js?v=20261119-02',()=>loadScript('assets/notification-mini/catalog.js?v=20261119-02',()=>loadScript('assets/notification-mini/app.js?v=20261119-02',()=>{window.NotificationMini?.setHost?.('通知');})));
})();
