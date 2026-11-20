(()=>{'use strict';
const screen=document.getElementById('sc-notification'),frame=document.getElementById('notification-frame'),heading=screen?.querySelector('.sub-hd b');let demoKey='',lastTitle='';
const visible=()=>!!screen&&screen.classList.contains('show');
function readConfig(){try{return frame?.contentWindow?.getModuleDemo?.()||null}catch{return null}}
function sync(){if(!frame)return;const cfg=readConfig();let title='通知';try{title=frame.contentDocument?.querySelector('.mobile-nav strong')?.textContent?.trim()||title}catch{}let route=null;try{route=frame.contentWindow.NoticeDemo?.context}catch{}if(route?.page==='list'&&['teacher','parent'].includes(route.role))title='通知';if(heading&&title!==lastTitle){heading.textContent=title;lastTitle=title}if(cfg){demoInfo['sc-notification']={t:title,d:cfg.intro+'\\n'+(cfg.sections||[]).map(s=>'【'+s.title+'】'+s.text).join('\\n'),a:[]};if(visible()&&cfg.key!==demoKey){demoKey=cfg.key;if(document.getElementById('demo-pop')?.classList.contains('show'))window.renderDemo?.()}}}
window.notificationBack=()=>{if(!visible()){go('sc-home');return}try{if(frame.contentWindow.NotificationDemoBack?.()){sync();return}}catch{}go('sc-home')};
frame?.addEventListener('load',sync);new MutationObserver(sync).observe(screen,{attributes:true,attributeFilter:['class']});setInterval(sync,250);sync();
})();



