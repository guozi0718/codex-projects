const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const miniRoot = 'E:/codex/小程序';
const miniTask = path.join(miniRoot, '任务/T-20261117-01-客户反馈详情与操作精简');
const customerRoot = 'E:/codex/运营后台/客户反馈';
const customerTask = path.join(customerRoot, '任务/T-20261117-01-客户反馈详情与追问样式对齐');
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
const walk = (dir, prefix = '') => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const rel = path.posix.join(prefix, entry.name);
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full, rel) : [{ full, rel }];
});
const shaEntry = (file, role, base) => ({
  role,
  path: path.relative(miniTask, file.full).replaceAll('\\', '/'),
  bytes: fs.statSync(file.full).size,
  sha256: hash(file.full)
});

const candidateFiles = [];
for (const [role, folder] of [['教师', '端-教师'], ['家长', '端-家长']]) {
  const dir = path.join(miniTask, folder, '版本-v0.12');
  for (const file of walk(dir)) candidateFiles.push(shaEntry(file, role, dir));
}
fs.writeFileSync(path.join(miniTask, '资料/候选文件SHA256.json'), JSON.stringify({
  task: 'T-20261117-01', candidateVersion: 'v0.12', status: '评审候选，未定版、未发布',
  activityBaseline: 'T-20261114-01 v0.5，未改变', files: candidateFiles
}, null, 2) + '\n', 'utf8');

const screenshotFiles = [];
for (const dirname of ['原-v0.11', '现-v0.12']) {
  const dir = path.join(miniTask, '资料/截图对比', dirname);
  for (const file of walk(dir)) {
    const name = path.basename(file.full);
    const role = name.includes('-教师-') ? '教师' : '家长';
    screenshotFiles.push({ role, stage: dirname, name, path: path.relative(miniTask, file.full).replaceAll('\\', '/'), bytes: fs.statSync(file.full).size, sha256: hash(file.full), crop: '裁切至手机原型框边缘' });
  }
}
fs.writeFileSync(path.join(miniTask, '资料/截图对比/截图清单-v0.12.json'), JSON.stringify({ task: 'T-20261117-01', version: 'v0.12', screenshots: screenshotFiles }, null, 2) + '\n', 'utf8');

const prdPath = path.join(customerTask, '交付/智小徽小程序-客户反馈功能优化第一期-需求说明-v0.4.md');
const markdown = fs.readFileSync(prdPath, 'utf8');
const imageRows = [...markdown.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((match, i) => {
  const full = path.resolve(path.dirname(prdPath), match[2]);
  if (!fs.existsSync(full)) throw new Error(`Missing PRD image #${i + 1}: ${match[2]}`);
  return { index: i + 1, alt: match[1], path: path.relative(customerRoot, full).replaceAll('\\', '/'), bytes: fs.statSync(full).size, sha256: hash(full), crop: '手机原型框内，无手机外桌面空白' };
});
fs.writeFileSync(path.join(customerTask, '资料/截图对比/截图清单-v0.4.json'), JSON.stringify({ task: 'T-20261117-01', prdVersion: 'v0.4', total: imageRows.length, images: imageRows }, null, 2) + '\n', 'utf8');

const registrationPath = path.join(customerRoot, '小程序引用登记.json');
const registration = JSON.parse(fs.readFileSync(registrationPath, 'utf8'));
const prior = registration.currentCandidate;
if (prior?.version === 'v0.11') registration.previousCandidate = { ...prior };
const teacher = path.join(miniTask, '端-教师/版本-v0.12');
const parent = path.join(miniTask, '端-家长/版本-v0.12');
const teacherEntry = path.join(teacher, 'index.html');
const parentEntry = path.join(parent, 'index.html');
const teacherJs = path.join(teacher, 'assets/help-v1.js');
const parentJs = path.join(parent, 'assets/help-v1.js');
const teacherCss = path.join(teacher, 'assets/help-v1.css');
const parentCss = path.join(parent, 'assets/help-v1.css');
const demoBridge = path.join(teacher, 'assets/demo-feature-bridge.js');
const endpoint = (role, view) => `http://127.0.0.1:56385/${encodeURIComponent(`端-${role}`)}/${encodeURIComponent('版本-v0.12')}/index.html#sc-${view}`;
const updatedRules = {
  ...(prior?.rules || {}),
  detailDisplay: '反馈编号先于类型/状态；类型与状态同行，状态靠右；完整展示首条内容/附件；无独立提交时间字段；详情不回显学校/学生快照、手机号或内部处理信息',
  timeline: '公开沟通按时间倒序；首条动作显示“提交”，日期时间靠右为MM-dd HH:mm；已撤回记录仍展示原始内容/附件和状态；内部处理消息过滤；无后续消息时不显示空沟通卡',
  withdrawal: '仅待回复且无处理方回复时可撤回；每条详情固定显示等宽按钮，不可用时置灰；学校Web同标题/正文/按钮，仅二次确认、无原因；已撤回详情保留原文、附件和状态',
  pairedButtons: '详情追问/撤回、提交页取消/提交、追问弹窗取消/提交均等宽等高；禁用按钮保留同尺寸'
};
const current = {
  task: 'T-20261117-01-客户反馈详情与操作精简', version: 'v0.12', sourceRoot: 'E:/codex/小程序',
  parentEntry: '任务/T-20261117-01-客户反馈详情与操作精简/端-家长/版本-v0.12/index.html',
  teacherEntry: '任务/T-20261117-01-客户反馈详情与操作精简/端-教师/版本-v0.12/index.html',
  parentIndexSha256: hash(parentEntry), teacherIndexSha256: hash(teacherEntry),
  helpJsSha256: hash(teacherJs), helpCssSha256: hash(teacherCss), demoBridgeSha256: hash(demoBridge),
  parentHelpJsSha256: hash(parentJs), parentHelpCssSha256: hash(parentCss),
  status: '评审候选，待用户评审；未定版、未发布；活动基线仍v0.5', activityPointerChanged: false,
  preview: {
    parent: endpoint('家长', 'fblist'), parentDetail: endpoint('家长', 'fbdetail'),
    teacher: endpoint('教师', 'fblist'), teacherDetail: endpoint('教师', 'fbdetail'), fallbackPort: '56385'
  },
  rules: updatedRules
};
registration.currentCandidate = current;
registration.historicalCandidates ||= [];
if (prior?.version === 'v0.11' && !registration.historicalCandidates.some(item => item.version === 'v0.11' && item.task === prior.task)) {
  registration.historicalCandidates.push({ task: prior.task, version: prior.version, teacherEntry: prior.teacherEntry, parentEntry: prior.parentEntry, teacherIndexSha256: prior.teacherIndexSha256, parentIndexSha256: prior.parentIndexSha256, status: prior.status, activityPointerChanged: false });
}
registration.currentCandidate.rules = { ...registration.currentCandidate.rules, ...updatedRules };
registration.rules.timeline = updatedRules.timeline;
registration.rules.detailDisplay = updatedRules.detailDisplay;
registration.rules.withdrawal = updatedRules.withdrawal;
registration.rules.pairedButtons = updatedRules.pairedButtons;
fs.writeFileSync(registrationPath, JSON.stringify(registration, null, 2) + '\n', 'utf8');

fs.writeFileSync(path.join(customerTask, '资料/小程序候选文件SHA256-v0.12.json'), JSON.stringify({
  task: 'T-20261117-01', version: 'v0.12', sourceRoot: 'E:/codex/小程序', status: current.status,
  activityBaseline: 'T-20261114-01 v0.5，未改变', files: {
    teacherIndex: current.teacherIndexSha256, parentIndex: current.parentIndexSha256,
    teacherHelpJs: current.helpJsSha256, parentHelpJs: current.parentHelpJsSha256,
    teacherHelpCss: current.helpCssSha256, parentHelpCss: current.parentHelpCssSha256,
    demoFeatureBridge: current.demoBridgeSha256
  }
}, null, 2) + '\n', 'utf8');

console.log(JSON.stringify({ candidateFiles: candidateFiles.length, screenshots: screenshotFiles.length, prdImages: imageRows.length, currentCandidate: current.version, hashes: { teacherIndex: current.teacherIndexSha256, parentIndex: current.parentIndexSha256 } }, null, 2));
