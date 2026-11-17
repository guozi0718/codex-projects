const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const dir = __dirname;
const source = fs.readFileSync(path.join(dir, '采集手机原型截图.js'), 'utf8');
const needle = "await evaluate(c,\"hfRequestWithdraw('DEMO-'+\"+JSON.stringify(prefix)+\"+'-FB-2026-001')\");await capture(c,'现-v0.11-'+role+'-撤回确认弹窗.png');";
const addition = needle + "await load(c,'/端-'+rolePath+'/版本-v0.11/index.html#sc-fblist');await evaluate(c,\"openFbDetail('DEMO-'+\"+JSON.stringify(prefix)+\"+'-FB-2026-003')\");await capture(c,'现-v0.11-'+role+'-已撤回详情保留原始信息.png');";
if (!source.includes(needle)) throw new Error('Could not locate the withdrawal capture step.');
const script = source
  .replace(needle, addition)
  .replaceAll('现-v0.11', '现-v0.12')
  .replaceAll('版本-v0.11', '版本-v0.12')
  .replace('mini-feedback-v011-capture', 'mini-feedback-v012-capture')
  .replaceAll('9228', '9229');
const target = path.join(dir, '采集手机原型截图-v0.12.js');
fs.writeFileSync(target, script, 'utf8');
const result = spawnSync(process.execPath, [target], { stdio: 'inherit', windowsHide: true });
process.exit(result.status ?? 1);
