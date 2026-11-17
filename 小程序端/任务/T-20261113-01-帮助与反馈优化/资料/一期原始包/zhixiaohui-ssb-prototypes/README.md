# 智小徽 · 教师端 / 家长端共用小程序 — 1:1 离线原型

完整镜像自线上静态原型站，双击 `index.html` 即可打开，**无需联网、无需服务器、无需登录**。

## 源站（附链接）

| 页面 | 线上地址 | 本地文件 |
| --- | --- | --- |
| 产品原型总览 | https://olivebird.netlify.app/ssb/ | `index.html` |
| **老师端小程序** | https://olivebird.netlify.app/ssb/teacher.html | `teacher.html` |
| **家长端小程序** | https://olivebird.netlify.app/ssb/parent.html | `parent.html` |
| 学校端 | https://olivebird.netlify.app/ssb/school | `school.html` |
| 运管端 | https://olivebird.netlify.app/ssb/admin | `admin.html` |
| 运管端 · 智能校徽 | https://olivebird.netlify.app/ssb/admin-trade | `admin-trade.html` |
| 校徽二维码 H5 兜底页 | https://olivebird.netlify.app/ssb/badge-h5 | `badge-h5.html` |
| 原型更新日志 | https://olivebird.netlify.app/ssb/changelog | `changelog.html` |

抓取时间：2026-11-13　|　镜像规模：**8 个页面 / 50 个文件 / 约 5 MB**；教师端 55 个 screen、家长端 56 个 screen。

## 你特别提到的：首页「王瑶」下拉切换双端

这两个小程序是**同一账号体系下的教师 / 家长双身份原型**，共用同一份身份数据、请假数据（`assets/leave-store.js`）、职务名册（`assets/duty-store.js`）与视觉规范，源码注释里也明确写了「与家长端 parent.html 身份面板同一份数据、同一口径」。

- **教师端 `teacher.html#sc-home`**：点首页头部「王瑶 ▾」→ `idPanel()` 滑出身份面板，共 7 行：
  - 王瑶 · 市实验一小 · 班主任（当前，✓）
  - 王瑶 · 红旗小学 · 校长（`idToPrincipal()`，演示 toast）
  - 林晓乐 / 林晓阳 / 林晓宁（在读生）、林晓晴（毕业生）、林晓帆（离校生）
  - **点任一孩子 → `idToParent('姓名')` → `parent.html#kid=姓名`**，落到该孩子的家长端首页；毕业 / 离校孩子进归档态。
- **家长端 `parent.html#sc-home`**：同一位置也有身份下拉 → `idToTeacher()` → `teacher.html`，可切回教师端；面板里 `idPick()` 还能在几个孩子之间直接切换。
- 另有一条「我的 → 账号切换」页（`sc-switch`）用同一份身份数据，双向闭环。

`preview/` 里有下拉打开状态的实拍图，可直接看效果。

## 离线化做了什么（只改 3 处，视觉与交互保持 1:1）

1. **站内 pretty URL 改写**：总览页 `index.html` 里的 `/ssb/teacher`、`/ssb/parent` 等 6 个 Netlify 无后缀地址改成对应的 `.html` 相对路径，离线双击也能跳转。
2. **禁用唯一的后台网络探测**：原站 `assets/update-check.js` 会在 http(s) 下每 45 秒对同源页面/JS/CSS 发 `HEAD` 请求拼 ETag 指纹检查部署更新（`file://` 下自动跳过）。离线原型不需要这个功能，已把该文件替换成说明性空实现，**原始代码备份在 `original/update-check.original.js.txt`**。HTML 的 script 引用保持不变，结构不变。
3. **外部原型跳转保留但已登记**：全站共 **67 个**外链（教师端 5、家长端 5、学校端 34、运管端·智能校徽 23），域名分布 `rp.mockplus.cn` 61 个、`app.ygzypm.com` 3 个、`guozi0718.github.io` 3 个，原本以 `onclick="location.href='https://...'"` 或 `<a href>` 跳到第三方原型站。它们是**用户点击才触发**的跳转，不是自动请求，为保持 1:1 未改动；离线使用建议不要点。完整清单见 `SECURITY-AUDIT.md` 与 `security-report.json`。

除此之外，HTML / CSS / JS / 图片全部保持原样，**没有重绘、没有压缩、没有删页面**。

## 数据说明

所有学生、班级、考勤、点评、请假、校徽订单等均为原站自带的**演示 mock 数据**，不含真实个人信息；`localStorage` 只用于记住演示状态（手机壳显隐、排序偏好、上次选中班级等），不上传。

## 安全

已按相同标准做隔离沙箱运行检测：语法校验、7 类恶意特征扫描、资源完整性、断外网浏览器实跑、自检探针、断网本地服务验证。逐项结论见 `SECURITY-AUDIT.md` 与 `security-report.json`。

## 合规

仅用于自有 / 已授权系统的原型评审与演示；页面文案、Logo 与数据版权归原站所有。
