const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
  const full = path.join(dir, item.name);
  return item.isDirectory() ? walk(full) : [full];
});
const projects = [
  {
    label: 'mini-program', root: 'E:/codex/小程序', task: '任务/T-20261117-01-客户反馈详情与操作精简',
    taskDoc: '资料/本轮文件变更清单.json',
    pre: 'E:/codex/小程序/版本快照/V-20261117-02-反馈时间线与按钮统一/修改前',
    post: 'E:/codex/小程序/版本快照/V-20261117-02-反馈时间线与按钮统一/修改后-最终核对',
    summary: '教师/家长v0.12候选、截图、验证/哈希资料、任务元数据、项目管理与项目记忆；活动基线指针不变。',
    scopes: ['任务/T-20261117-01-客户反馈详情与操作精简', '项目管理', '记忆库/项目记忆', '当前原型基线.json']
  },
  {
    label: 'customer-feedback-project', root: 'E:/codex/运营后台/客户反馈', task: '任务/T-20261117-01-客户反馈详情与追问样式对齐',
    taskDoc: '资料/本轮文件变更清单.json',
    pre: 'E:/codex/运营后台/客户反馈/版本快照/V-20261117-02-反馈时间线与按钮统一/修改前',
    post: 'E:/codex/运营后台/客户反馈/版本快照/V-20261117-02-反馈时间线与按钮统一/修改后-最终核对',
    summary: 'Markdown PRD v0.4、原/现截图、预览/验证/哈希/引用资料、任务管理、项目管理与记忆；不保存整端源码。',
    scopes: ['任务/T-20261117-01-客户反馈详情与追问样式对齐', '项目管理', '记忆库/项目记忆', '小程序引用登记.json', '小程序客户反馈接续.md']
  }
];

const result = [];
for (const project of projects) {
  if (!fs.existsSync(project.pre)) throw new Error(`Missing pre-snapshot: ${project.pre}`);
  if (fs.existsSync(project.post)) throw new Error(`Post-snapshot already exists: ${project.post}`);
  const currentFiles = project.scopes.flatMap(scope => {
    const abs = path.join(project.root, scope);
    if (!fs.existsSync(abs)) return [];
    return fs.statSync(abs).isDirectory() ? walk(abs) : [abs];
  });
  const beforeRootFiles = walk(project.pre);
  const beforeSet = new Set(beforeRootFiles.map(p => path.relative(project.pre, p).replaceAll('\\', '/')));
  const rows = currentFiles.map(current => {
    const rel = path.relative(project.root, current).replaceAll('\\', '/');
    const beforePath = path.join(project.pre, rel);
    const beforeExists = fs.existsSync(beforePath);
    const beforeHash = beforeExists ? hash(beforePath) : null;
    const currentHash = hash(current);
    const status = !beforeExists ? '新增' : beforeHash === currentHash ? '未变更' : '已修改';
    return { path: rel, status, beforeSnapshotPath: beforeExists ? path.relative(project.root, beforePath).replaceAll('\\', '/') : null, beforeSha256: beforeHash, currentSha256: currentHash };
  });
  const currentMapped = new Set(rows.filter(row => row.beforeSnapshotPath).map(row => row.path));
  const deleted = [...beforeSet].filter(rel => !currentMapped.has(rel)).map(rel => ({ beforeSnapshotPath: path.relative(project.root, path.join(project.pre, rel)).replaceAll('\\', '/'), sha256: hash(path.join(project.pre, rel)) }));
  const changed = rows.filter(row => row.status !== '未变更');
  const manifestPath = path.join(project.root, project.task, project.taskDoc);
  fs.writeFileSync(manifestPath, JSON.stringify({
    task: 'T-20261117-01', snapshotBatch: 'V-20261117-02', project: project.label,
    beforeRoot: path.relative(project.root, project.pre).replaceAll('\\', '/'),
    afterRoot: path.relative(project.root, project.post).replaceAll('\\', '/'),
    summary: project.summary,
    counts: { scopedFiles: rows.length, addedOrModified: changed.length, unchanged: rows.length - changed.length, deleted: deleted.length },
    changedFiles: changed, deletedFiles: deleted,
    manifestSelfReference: '本文件不在自身SHA-256清单内；哈希通过快照索引及快照说明登记。'
  }, null, 2) + '\n', 'utf8');

  fs.mkdirSync(project.post, { recursive: false });
  for (const scope of project.scopes) {
    const source = path.join(project.root, scope);
    if (!fs.existsSync(source)) continue;
    const destination = path.join(project.post, scope);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.cpSync(source, destination, { recursive: true, errorOnExist: true, force: false });
  }
  for (const row of rows) {
    const copied = path.join(project.post, row.path);
    if (!fs.existsSync(copied) || hash(copied) !== row.currentSha256) throw new Error(`Post-snapshot verification failed: ${row.path}`);
  }
  const note = `# 快照说明\n\n- 批次：V-20261117-02\n- 任务：T-20261117-01\n- 修改前快照：${path.relative(project.root, project.pre).replaceAll('\\', '/')}\n- 修改后快照：${path.relative(project.root, project.post).replaceAll('\\', '/')}\n- 内容：${project.summary}\n- 文件变更清单：${path.relative(project.root, manifestPath).replaceAll('\\', '/')}；SHA-256 ${hash(manifestPath)}\n- 修改后文件复制后逐项校验，当前原型基线配置未被修改。\n- 项目日志按治理规则在索引登记后最后追加。\n`;
  fs.writeFileSync(path.join(project.post, '快照说明.md'), note, 'utf8');
  result.push({ project: project.label, post: project.post, files: rows.length, changed: changed.length, unchanged: rows.length - changed.length, deleted: deleted.length, manifest: manifestPath, manifestSha256: hash(manifestPath) });
}
console.log(JSON.stringify(result, null, 2));
