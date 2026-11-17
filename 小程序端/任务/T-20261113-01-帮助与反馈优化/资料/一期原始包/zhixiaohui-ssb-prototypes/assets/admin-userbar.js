/* admin-userbar.js —— 运管端原型共享的右上角用户区挂件
 *
 * 用法：<head> 里加 <script defer src="assets/admin-userbar.js"></script>
 * 自动：注入样式（ub- 前缀防冲突）→ 替换 .topbar 里的静态头像为可点击用户区
 *       （头像 + 姓名 + 下拉菜单：个人信息 / 退出登录）→ 注入个人信息抽屉与更换头像弹窗。
 * 头像改动写 localStorage（zxh_admin_profile），跨页生效；退出登录返回原型导航首页。
 */
(function(){
  if (document.getElementById('userTrigger')) return;

  /* ===== profile 读写 ===== */
  const PROFILE_KEY = 'zxh_admin_profile';
  const DEFAULT_PROFILE = {
    name:'秦晓峰', avatar:'运', avatarUrl:'assets/avatar-walle.jpg', email:'qinxf@zhixiaohui.cn',
    phone:'139****0088', org:'平台运营部', roles:['运营专员'], title:'运营专员',
    empNo:'OP012', joinedAt:'2024-05-06'
  };
  function readProfile(){
    try {
      const p = Object.assign({}, DEFAULT_PROFILE, JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}'));
      if (!p.avatarUrl) p.avatarUrl = DEFAULT_PROFILE.avatarUrl;   // 存量「恢复默认」写入的 '' 回落到默认头像图
      return p;
    }
    catch { return Object.assign({}, DEFAULT_PROFILE); }
  }
  function writeProfile(patch){
    const p = Object.assign(readProfile(), patch);
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
    return p;
  }
  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  /* ===== 样式 ===== */
  if (!document.getElementById('__userbarStyle')) {
    const css = `
#userTrigger { position:relative; display:flex; align-items:center; gap:6px; cursor:pointer; padding:4px 6px 4px 4px; border-radius:20px; transition:background .15s; flex-shrink:0; }
#userTrigger:hover { background:var(--color-neutral-bg,#f5f6f8); }
#userTrigger .ub-avatar { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,var(--color-primary,#2f6bff),var(--color-primary-soft,#5f8dff)); color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:600; flex-shrink:0; }
#userTrigger .uname { font-size:12.5px; color:var(--color-text-secondary,#667085); padding-right:2px; white-space:nowrap; }
#userTrigger .chev { font-size:9px; color:var(--color-text-muted,#8a93a2); margin-left:-2px; }
/* has-image 态：不用 !important（会压过内联 backgroundImage 导致预览空白），靠更高特异性盖过各处的渐变底 */
#userTrigger .ub-avatar.has-image, .ub-drawer .profile-hero .av-big.has-image, .ub-modal-mask .av-preview-circle.has-image { background:#eef0f4 center/cover no-repeat; color:transparent; }
#userMenu { position:absolute; top:calc(100% + 8px); right:0; background:#fff; border:1px solid var(--color-divider,#eef1f5); border-radius:10px; box-shadow:0 12px 32px rgba(15,23,42,.12); min-width:230px; padding:6px 0; z-index:130; opacity:0; visibility:hidden; transform:translateY(-4px); transition:opacity .15s, transform .15s, visibility 0s linear .15s; }
#userMenu.show { opacity:1; visibility:visible; transform:translateY(0); transition:opacity .15s, transform .15s; }
#userMenu .um-head { padding:12px 16px 10px; border-bottom:1px solid var(--color-divider,#eef1f5); }
#userMenu .um-name { font-size:13.5px; font-weight:600; color:var(--color-text-primary,#1f2937); }
#userMenu .um-sub { font-size:11.5px; color:var(--color-text-muted,#8a93a2); margin-top:2px; }
#userMenu .um-item { display:flex; align-items:center; gap:10px; padding:9px 16px; cursor:pointer; font-size:13px; color:var(--color-text-primary,#1f2937); transition:background .12s; user-select:none; }
#userMenu .um-item:hover { background:var(--color-neutral-bg,#f5f6f8); color:var(--color-primary,#2f6bff); }
#userMenu .um-item.danger:hover { color:#f5222d; background:#fff1f0; }
#userMenu .um-item svg { width:14px; height:14px; flex-shrink:0; color:var(--color-text-muted,#8a93a2); }
#userMenu .um-item:hover svg { color:inherit; }
#userMenu .um-divider { height:1px; background:var(--color-divider,#eef1f5); margin:4px 0; }
.ub-drawer-mask { position:fixed; inset:0; background:rgba(15,23,42,.4); z-index:190; display:none; }
.ub-drawer-mask.show { display:block; }
.ub-drawer { position:fixed; top:0; right:0; bottom:0; width:480px; max-width:94vw; background:#fff; z-index:195; transform:translateX(100%); transition:transform .25s; display:flex; flex-direction:column; box-shadow:-4px 0 24px rgba(0,0,0,.08); }
.ub-drawer.show { transform:translateX(0); }
.ub-drawer .drawer-head { height:54px; padding:0 22px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--color-divider,#eef1f5); flex-shrink:0; }
.ub-drawer .drawer-head h2 { font-size:15px; font-weight:600; margin:0; color:#1f2937; }
.ub-drawer .drawer-close { background:transparent; border:0; cursor:pointer; color:var(--color-text-muted,#8a93a2); font-size:18px; padding:0 4px; }
.ub-drawer .drawer-close:hover { color:#1f2937; }
.ub-drawer .drawer-body { flex:1; overflow-y:auto; padding:22px; }
.ub-drawer .profile-hero { display:flex; align-items:center; gap:16px; padding:18px; background:linear-gradient(135deg,#eef5ff,#f5f7fb); border:1px solid var(--color-border,#e7ebf3); border-radius:12px; margin-bottom:20px; }
.ub-drawer .profile-hero .pa { position:relative; flex-shrink:0; }
.ub-drawer .profile-hero .av-big { width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg,var(--color-primary,#2f6bff),var(--color-primary-soft,#5f8dff)); color:#fff; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:600; }
.ub-drawer .profile-hero .av-edit { position:absolute; right:-2px; bottom:-2px; width:22px; height:22px; border-radius:50%; background:#fff; border:1px solid var(--color-input-border,#d9deea); display:flex; align-items:center; justify-content:center; color:var(--color-text-secondary,#667085); cursor:pointer; transition:color .15s, border-color .15s; }
.ub-drawer .profile-hero .av-edit:hover { color:var(--color-primary,#2f6bff); border-color:var(--color-primary,#2f6bff); }
.ub-drawer .profile-hero .av-edit svg { width:11px; height:11px; }
.ub-drawer .profile-hero .pn { font-size:16px; font-weight:600; color:#1f2937; }
.ub-drawer .profile-hero .pr { display:flex; flex-wrap:wrap; gap:6px; margin-top:5px; }
.ub-drawer .profile-hero .role-tag { display:inline-block; padding:1px 8px; border-radius:10px; background:#f6ffed; color:#52c41a; border:1px solid #b7eb8f; font-size:11px; }
.ub-drawer .profile-hero .dept-tag { display:inline-block; padding:1px 8px; border-radius:10px; background:#fff; color:var(--color-primary,#2f6bff); border:1px solid var(--color-primary-border,#cfe0ff); font-size:11px; }
.ub-drawer .section { margin-bottom:22px; }
.ub-drawer .section-title { font-size:11px; color:var(--color-text-muted,#8a93a2); letter-spacing:1px; font-weight:600; margin-bottom:10px; padding-left:2px; }
.ub-drawer .section-title .meta { font-weight:400; letter-spacing:0; margin-left:6px; }
.ub-drawer .field-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px 14px; }
.ub-drawer .field-block { display:flex; flex-direction:column; gap:5px; }
.ub-drawer .field-block label { font-size:12px; color:var(--color-text-secondary,#667085); font-weight:500; }
.ub-drawer .field-block .ro { height:36px; padding:0 12px; border:1px solid var(--color-divider,#eef1f5); border-radius:8px; font-size:13px; background:var(--color-neutral-bg,#f5f6f8); color:var(--color-text-secondary,#667085); display:flex; align-items:center; }
.ub-drawer .field-block .ro.mono { font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace; font-variant-numeric:tabular-nums; }
.ub-drawer .security-row { display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border:1px solid var(--color-border,#e7ebf3); border-radius:10px; background:#fff; }
.ub-drawer .security-row .sr-l { display:flex; align-items:center; gap:12px; }
.ub-drawer .security-row .sr-ic { width:32px; height:32px; border-radius:8px; background:var(--color-primary-bg,#eef5ff); color:var(--color-primary,#2f6bff); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ub-drawer .security-row .sr-ic svg { width:15px; height:15px; }
.ub-drawer .security-row .sr-tt { font-size:13px; font-weight:500; color:#1f2937; }
.ub-drawer .security-row .sr-sub { font-size:11.5px; color:var(--color-text-muted,#8a93a2); margin-top:2px; }
.ub-drawer .security-row .sr-btn { padding:6px 14px; border:1px solid var(--color-input-border,#d9deea); background:#fff; border-radius:8px; cursor:pointer; font-size:12.5px; color:#1f2937; transition:all .15s; font-family:inherit; }
.ub-drawer .security-row .sr-btn:hover { border-color:var(--color-primary,#2f6bff); color:var(--color-primary,#2f6bff); }
.ub-modal-mask { position:fixed; inset:0; background:rgba(15,23,42,.45); z-index:210; display:none; align-items:center; justify-content:center; padding:24px; }
.ub-modal-mask.show { display:flex; }
.ub-modal-mask .modal-box2 { background:#fff; border-radius:12px; width:380px; max-width:100%; padding:22px 24px 18px; box-shadow:0 24px 60px rgba(15,23,42,.2); }
.ub-modal-mask .modal-box2 h3 { font-size:16px; font-weight:600; margin:0 0 6px; color:#1f2937; }
.ub-modal-mask .modal-sub { font-size:12px; color:var(--color-text-muted,#8a93a2); margin-bottom:12px; line-height:1.6; }
.ub-modal-mask .av-preview-area { display:flex; align-items:center; justify-content:center; padding:14px 0; }
.ub-modal-mask .av-preview-circle { width:120px; height:120px; border-radius:50%; background:linear-gradient(135deg,var(--color-primary,#2f6bff),var(--color-primary-soft,#5f8dff)); color:#fff; display:flex; align-items:center; justify-content:center; font-size:44px; font-weight:600; }
.ub-modal-mask .av-actions { display:flex; gap:10px; justify-content:center; }
.ub-modal-mask .av-error { font-size:12px; color:#f5222d; margin-top:10px; text-align:center; min-height:16px; }
.ub-modal-mask .modal-foot { display:flex; justify-content:flex-end; gap:10px; margin-top:16px; }
.ub-modal-mask .ub-btn { height:34px; padding:0 16px; border-radius:8px; border:1px solid var(--color-input-border,#d9deea); background:#fff; font-size:12.5px; cursor:pointer; transition:all .15s; color:#1f2937; font-family:inherit; }
.ub-modal-mask .ub-btn:hover { border-color:#cfd8ea; color:var(--color-primary,#2f6bff); }
.ub-modal-mask .ub-btn.primary { background:var(--color-primary,#2f6bff); color:#fff; border-color:var(--color-primary,#2f6bff); }
.ub-modal-mask .ub-btn.primary:hover { background:var(--color-primary-hover,#2458d8); }
.ub-modal-mask .ub-btn.danger2 { background:#dc2626; color:#fff; border-color:#dc2626; }
.ub-modal-mask .ub-btn.danger2:hover { background:#b91c1c; }
.ub-modal-mask .ub-btn:disabled { opacity:.5; cursor:not-allowed; }
.ub-toast { position:fixed; top:20px; left:50%; transform:translateX(-50%) translateY(-8px); background:#1f2937; color:#fff; padding:9px 18px; border-radius:6px; font-size:12.5px; z-index:300; opacity:0; transition:opacity .2s, transform .2s; pointer-events:none; box-shadow:0 8px 24px rgba(15,23,42,.18); }
.ub-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
`;
    const tag = document.createElement('style');
    tag.id = '__userbarStyle';
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  /* ===== 注入 ===== */
  function injectAll(){
    const topbar = document.querySelector('.topbar');
    if (!topbar || document.getElementById('userTrigger')) return;
    const p = readProfile();

    /* 替换页面里的静态头像 */
    const oldAvatar = topbar.querySelector(':scope > .avatar');
    if (oldAvatar) oldAvatar.remove();

    const trigger = document.createElement('div');
    trigger.id = 'userTrigger';
    trigger.innerHTML =
      `<div class="ub-avatar">${esc(p.avatar)}</div>` +
      `<span class="uname">${esc(p.name)}</span>` +
      `<span class="chev">▾</span>` +
      `<div id="userMenu">
         <div class="um-head">
           <div class="um-name">${esc(p.name)}</div>
           <div class="um-sub">${esc(p.phone)} · ${esc(p.org)}</div>
         </div>
         <div class="um-item" data-act="profile">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
           个人信息
         </div>
         <div class="um-divider"></div>
         <div class="um-item danger" data-act="logout">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
           退出登录
         </div>
       </div>`;
    topbar.appendChild(trigger);

    const root = document.createElement('div');
    root.id = 'ubRoot';
    root.innerHTML = `
<div class="ub-drawer-mask" id="ubProfMask"></div>
<aside class="ub-drawer" id="ubProf" role="dialog" aria-label="个人信息">
  <header class="drawer-head">
    <h2>个人信息</h2>
    <button class="drawer-close" type="button" id="ubProfClose" aria-label="关闭">✕</button>
  </header>
  <div class="drawer-body">
    <div class="profile-hero">
      <div class="pa">
        <div class="av-big ub-avatar" id="ubProfAvatar">${esc(p.avatar)}</div>
        <span class="av-edit" id="ubProfAvatarEdit" title="更换头像">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
        </span>
      </div>
      <div style="flex:1;min-width:0">
        <div class="pn">${esc(p.name)}</div>
        <div class="pr">${(p.roles||[]).map(r=>'<span class="role-tag">'+esc(r)+'</span>').join('')}<span class="dept-tag">${esc(p.org)}</span></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">档案信息<span class="meta">由平台管理员维护，如需变更请联系管理员</span></div>
      <div class="field-grid">
        <div class="field-block"><label>姓名</label><div class="ro">${esc(p.name)}</div></div>
        <div class="field-block"><label>登录手机号</label><div class="ro mono">${esc(p.phone)}</div></div>
        <div class="field-block"><label>邮箱</label><div class="ro mono">${esc(p.email)}</div></div>
        <div class="field-block"><label>工号</label><div class="ro mono">${esc(p.empNo)}</div></div>
        <div class="field-block"><label>角色</label><div class="ro">${esc((p.roles||[]).join('、')||'—')}</div></div>
        <div class="field-block"><label>岗位</label><div class="ro">${esc(p.title)}</div></div>
        <div class="field-block"><label>所属部门</label><div class="ro">${esc(p.org)}</div></div>
        <div class="field-block"><label>入职日期</label><div class="ro mono">${esc(p.joinedAt)}</div></div>
        <div class="field-block"><label>账号状态</label><div class="ro" style="color:#52c41a">在职</div></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">安全</div>
      <div class="security-row">
        <div class="sr-l">
          <div class="sr-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></div>
          <div>
            <div class="sr-tt">登录密码</div>
            <div class="sr-sub">上次修改 2026-05-12 · 建议定期更换</div>
          </div>
        </div>
        <button class="sr-btn" type="button" id="ubProfPwdBtn">修改</button>
      </div>
    </div>
  </div>
</aside>
<div class="ub-modal-mask" id="ubAvatarMask">
  <div class="modal-box2" role="dialog" aria-label="更换头像">
    <h3>更换头像</h3>
    <div class="modal-sub">支持 JPG / PNG，不超过 2MB；上传后自动居中裁剪为 256×256</div>
    <div class="av-preview-area"><div class="av-preview-circle ub-avatar" id="ubAvPreview">${esc(p.avatar)}</div></div>
    <div class="av-actions">
      <input type="file" id="ubAvFile" accept="image/*" style="display:none">
      <button class="ub-btn" type="button" id="ubAvPickBtn">选择图片</button>
      <button class="ub-btn" type="button" id="ubAvResetBtn" style="display:none">恢复默认</button>
    </div>
    <div class="av-error" id="ubAvError"></div>
    <div class="modal-foot">
      <button class="ub-btn" type="button" id="ubAvCancelBtn">取消</button>
      <button class="ub-btn primary" type="button" id="ubAvSaveBtn" disabled>保存</button>
    </div>
  </div>
</div>
<div class="ub-modal-mask" id="ubLogoutMask">
  <div class="modal-box2" role="dialog" aria-label="退出登录">
    <h3>退出登录</h3>
    <div class="modal-sub">确认退出当前账号「${esc(p.name)}（${esc(p.empNo)}）」？退出后将返回原型导航首页。</div>
    <div class="modal-foot">
      <button class="ub-btn" type="button" id="ubLogoutCancel">取消</button>
      <button class="ub-btn danger2" type="button" id="ubLogoutConfirm">退出</button>
    </div>
  </div>
</div>
<div class="ub-toast" id="ubToast"></div>`;
    document.body.appendChild(root);
    wireUp();
  }

  /* ===== 交互 ===== */
  function wireUp(){
    const trigger = document.getElementById('userTrigger');
    const menu = document.getElementById('userMenu');
    const profMask = document.getElementById('ubProfMask');
    const profDrawer = document.getElementById('ubProf');
    const avMask = document.getElementById('ubAvatarMask');
    const logoutMask = document.getElementById('ubLogoutMask');
    const toastEl = document.getElementById('ubToast');

    let toastTimer = null;
    function ubToast(msg){
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(()=>toastEl.classList.remove('show'), 2200);
    }
    function applyAvatarToEl(el, p){
      if (!el) return;
      if (p.avatarUrl) { el.classList.add('has-image'); el.style.backgroundImage = 'url("'+p.avatarUrl+'")'; el.textContent=''; }
      else { el.classList.remove('has-image'); el.style.backgroundImage=''; el.textContent = p.avatar; }
    }
    function refreshAllAvatars(){
      const p = readProfile();
      applyAvatarToEl(document.querySelector('#userTrigger .ub-avatar'), p);
      applyAvatarToEl(document.getElementById('ubProfAvatar'), p);
    }

    trigger.addEventListener('click', e => {
      if (e.target.closest('#userMenu')) return;
      e.stopPropagation();
      menu.classList.toggle('show');
    });
    document.addEventListener('click', e => { if (!trigger.contains(e.target)) menu.classList.remove('show'); });
    menu.addEventListener('click', e => {
      const item = e.target.closest('.um-item');
      if (!item) return;
      e.stopPropagation();
      menu.classList.remove('show');
      if (item.dataset.act === 'logout') logoutMask.classList.add('show');
      else if (item.dataset.act === 'profile') openProfile();
    });

    function openProfile(){ refreshAllAvatars(); profMask.classList.add('show'); profDrawer.classList.add('show'); }
    function closeProfile(){ profMask.classList.remove('show'); profDrawer.classList.remove('show'); }
    profMask.addEventListener('click', closeProfile);
    document.getElementById('ubProfClose').addEventListener('click', closeProfile);
    document.getElementById('ubProfPwdBtn').addEventListener('click', () => ubToast('演示原型：修改密码（略）'));
    document.getElementById('ubProfAvatarEdit').addEventListener('click', openAvatarModal);

    /* 退出登录 */
    function closeLogout(){ logoutMask.classList.remove('show'); }
    logoutMask.addEventListener('click', e => { if (e.target === logoutMask) closeLogout(); });
    document.getElementById('ubLogoutCancel').addEventListener('click', closeLogout);
    document.getElementById('ubLogoutConfirm').addEventListener('click', () => { location.href = 'index.html'; });

    /* 更换头像 */
    const avPreview = document.getElementById('ubAvPreview');
    const avFile = document.getElementById('ubAvFile');
    const avResetBtn = document.getElementById('ubAvResetBtn');
    const avSaveBtn = document.getElementById('ubAvSaveBtn');
    const avError = document.getElementById('ubAvError');
    let pendingAvatar = null;   // null=未改, ''=恢复默认, 'data:...'=新图
    function openAvatarModal(){
      const p = readProfile();
      pendingAvatar = null;
      avFile.value = '';
      avError.textContent = '';
      avSaveBtn.disabled = true;
      applyAvatarToEl(avPreview, p);
      avResetBtn.style.display = p.avatarUrl !== DEFAULT_PROFILE.avatarUrl ? '' : 'none';
      avMask.classList.add('show');
    }
    function closeAvatarModal(){ avMask.classList.remove('show'); }
    avMask.addEventListener('click', e => { if (e.target === avMask) closeAvatarModal(); });
    document.getElementById('ubAvCancelBtn').addEventListener('click', closeAvatarModal);
    document.getElementById('ubAvPickBtn').addEventListener('click', () => avFile.click());
    avFile.addEventListener('change', e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      avError.textContent = '';
      if (!/^image\//.test(file.type)) { avError.textContent = '请选择图片文件（JPG / PNG / WEBP）'; return; }
      if (file.size > 2*1024*1024) { avError.textContent = '图片不能超过 2MB'; return; }
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const SIZE = 256;
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = SIZE;
          const ctx = canvas.getContext('2d');
          const minDim = Math.min(img.width, img.height);
          ctx.drawImage(img, (img.width-minDim)/2, (img.height-minDim)/2, minDim, minDim, 0, 0, SIZE, SIZE);
          pendingAvatar = canvas.toDataURL('image/jpeg', .85);
          avPreview.classList.add('has-image');
          avPreview.style.backgroundImage = 'url("'+pendingAvatar+'")';
          avPreview.textContent = '';
          avSaveBtn.disabled = false;
          avResetBtn.style.display = '';
        };
        img.onerror = () => { avError.textContent = '无法解析所选图片'; };
        img.src = ev.target.result;
      };
      reader.onerror = () => { avError.textContent = '读取文件失败'; };
      reader.readAsDataURL(file);
    });
    avResetBtn.addEventListener('click', () => {
      pendingAvatar = '';
      applyAvatarToEl(avPreview, Object.assign(readProfile(), { avatarUrl: DEFAULT_PROFILE.avatarUrl }));
      avFile.value = '';
      avError.textContent = '';
      avSaveBtn.disabled = false;
    });
    avSaveBtn.addEventListener('click', () => {
      if (pendingAvatar === null) return;
      writeProfile({ avatarUrl: pendingAvatar });
      refreshAllAvatars();
      closeAvatarModal();
      ubToast('头像已更新（跨页面生效）');
    });

    /* ESC：仅处理挂件自己的层 */
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (logoutMask.classList.contains('show')) closeLogout();
      else if (avMask.classList.contains('show')) closeAvatarModal();
      else if (profDrawer.classList.contains('show')) closeProfile();
      else if (menu.classList.contains('show')) menu.classList.remove('show');
    });

    refreshAllAvatars();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectAll);
  else injectAll();
})();
