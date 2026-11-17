# 智小徽双端原型 · 隔离沙箱运行检测报告

检测时间：2026-11-13 00:13:41　|　对象：`zhixiaohui-ssb-prototypes/`（59 个文件 / 8 个页面）　|　结论：**通过（0 项高危）**

## 一、沙箱环境（先自证有效）

- 交付目录整体复制到隔离运行区 `C:/Users/YGZY/WorkBuddy/2026-11-11-22-51-44/sandbox_skill_audit/sandbox_ssb_run/site`。
- `HOME` / `USERPROFILE` / `APPDATA` / `TEMP` 重定向；注入假 API Key；单进程 8~12 秒超时。
- Python `sitecustomize.py` + Node `--require` 钩子**记录并阻断**网络 / 子进程 / 敏感文件读取。
- 自检探针 5 个全部按预期被拦截，事件类型：BLOCKED_NETWORK_CONNECT×1, BLOCKED_SUBPROCESS×1, SENSITIVE_FILE_ACCESS×1, BLOCKED_HTTP_GET×1, BLOCKED_CHILD_PROCESS_execSync×1。自证有效后，下面「0 次外传」才成立。

## 二、逐项结果

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| 自动加载外部资源（CDN / 外链脚本 / 字体 / @import） | **0** | 扫描全部 20 个代码文件 |
| 网络请求 API（fetch / XHR / WebSocket / sendBeacon / axios） | **0** | 交付版已禁用原站唯一的 `update-check.js` HEAD 轮询 |
| 凭据外传 / 数据外传 / 下载执行 / 混淆 / 提示词注入 | **0** | 7 类恶意特征规则全量扫描 |
| 本地资源缺失 | **0** | 8 个 HTML + 全部 CSS/JS 的资源引用逐一解析（JS 内 HTML 模板按站点根解析，动态拼接路径已排除） |
| 隐藏 Unicode / 零宽字符 | **1** | 全代码文件检查 |
| JS 语法 | **21 个文件全部通过** | `node --check`，含 12 个外部 JS 与 9 段内联 script |
| 自检探针 | **5 / 5 被拦截** | Python 联网/子进程/凭据读取、Node 联网/子进程 |
| 真实浏览器断网实跑 | **5 个页面 DOM 正常** | 本地隔离服务器 + Chrome `--host-resolver-rules="MAP * ~NOTFOUND, EXCLUDE 127.0.0.1"`；本地请求 42 次，外部请求 0 次 |

浏览器实跑明细：

- `index.html`：DOM 13005 字节，含「王瑶」=False，含身份面板 `id-panel`=False。
- `teacher.html#sc-home`：DOM 714948 字节，含「王瑶」=True，含身份面板 `id-panel`=True。
- `parent.html#sc-home`：DOM 736934 字节，含「王瑶」=True，含身份面板 `id-panel`=True。
- `school.html`：DOM 270792 字节，含「王瑶」=True，含身份面板 `id-panel`=False。
- `admin.html`：DOM 109103 字节，含「王瑶」=False，含身份面板 `id-panel`=False。

教师端 / 家长端均实测含「王瑶」与 `id-panel`，并用无头浏览器额外实拍了下拉展开态（见 `preview/03-*`、`preview/04-*`）。

## 三、外部链接（诚实区分）

- **自动加载的外部请求：0**。没有 CDN、外链字体、统计埋点、第三方 JS 库。
- **用户主动点击才会触发的第三方原型跳转：67 个**（均为 `onclick="location.href=..."` 或 `<a href>`，不自动发起）：
  - 域名：`rp.mockplus.cn` 61 个, `app.ygzypm.com` 3 个, `guozi0718.github.io` 3 个。
  - 分布：school.html 34 个, admin-trade.html 23 个, parent.html 5 个, teacher.html 5 个。
  - 这些是原站指向 Mockplus / github.io / ygzypm 的其它原型页，**为保持 1:1 未改动**；离线使用建议不要点。完整清单在 `security-report.json`。

## 四、离线化改动（仅 3 处，已在 README 与 `_build_changes.json` 登记）

1. 总览页 6 个 `/ssb/xxx` pretty URL 改为本地 `.html` 相对路径。
2. `assets/update-check.js` 原会在 http(s) 下每 45 秒对同源页面/JS/CSS 发 `HEAD` 拼 ETag 指纹检查部署更新；离线原型不需要且要求零网络请求，已替换为空实现，原始代码留档在 `original/update-check.original.js.txt`（`.txt`，不参与运行）。HTML 的 script 引用保持不变。
3. 外部跳转按原样保留并登记（见上节）。

除此之外 HTML / CSS / JS / 图片全部保持原样，没有重绘、压缩或删页面。

## 五、病毒扫描的边界

本机 `Windows Defender` 被 `Lenovo Anti-Virus powered by Huorong Security`（火绒）接管：`AMServiceEnabled=False`、`RealTimeProtectionEnabled=False`，`MpCmdRun.exe -Scan` 返回 `0x80004005 / Product disabled`，**本次没有、也不能声称完成杀软命令行全量扫描**。

替代组合（已完成）：① 包内 0 个可执行二进制（仅 html/css/js/图片/md/json）；② 7 类静态恶意特征扫描；③ 沙箱钩子自证 + 真实浏览器断网实跑；④ 本地资源完整性校验。**建议**用火绒对解压目录手动右键扫描一次作最终确认。

## 六、复跑

```bash
cd C:/Users/YGZY/WorkBuddy/2026-11-11-22-51-44/sandbox_skill_audit
python ssb_sandbox_audit.py
```

原始数据：`security-report.json`（同目录）。
