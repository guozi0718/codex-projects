const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const dir = __dirname;
let script = fs.readFileSync(path.join(dir, '采集手机原型截图.js'), 'utf8');
const needle = "await evaluate(c,\"hfRequestWithdraw('DEMO-'+\"+JSON.stringify(prefix)+\"+'-FB-2026-001')\");await capture(c,'现-v0.11-'+role+'-撤回确认弹窗.png');";
const addition = needle + "await load(c,'/端-'+rolePath+'/版本-v0.11/index.html#sc-fblist');await evaluate(c,\"openFbDetail('DEMO-'+\"+JSON.stringify(prefix)+\"+'-FB-2026-003')\");await capture(c,'现-v0.11-'+role+'-已撤回详情.png');";
if (!script.includes(needle)) throw new Error('Could not locate the withdrawal capture step.');
script = script
  .replace(needle, addition)
  .replace('资料','资料')
  .replaceAll('现-v0.11', '原-v0.11')
  .replaceAll('mini-feedback-v011-capture', 'mini-feedback-v011-reference')
  .replaceAll('9228', '9230');
const target = path.join(dir, '采集手机原型截图-原-v0.11.js');
fs.writeFileSync(target, script, 'utf8');
const result = spawnSync(process.execPath, [target], { stdio: 'inherit', windowsHide: true });
process.exit(result.status ?? 1);
