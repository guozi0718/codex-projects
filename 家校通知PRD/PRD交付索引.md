### 家校通知一期 PRD 交付索引

需求范围：第一期新增，修改中、待评审、未定版
文档批次：V0.7
任务：T-20261118-03｜各端 PRD 与原型对齐
核对日期：2026-11-23

#### 1. 交付内容

本交付包含一份全端共通规则及五份分端 PRD：学校 Web、代理商 Web、运营后台、教师小程序、家长小程序。

六份 PRD 采用用户指定的客服管理代理商端 PRD 框架，逐页面列明入口和用途、字段、默认值、操作、校验、异常表现、结果和后续操作。文档描述产品需求，不下达代码、技术框架或后台实现方式的任务。

- [全端共通规则](家校通知一期产品需求文档-全端共通规则.md)：通知类型和来源、对象范围、时限、查收、编辑、删除、提醒、统计、预览/打印、异常及待确认规则。
- [学校 Web](家校通知一期产品需求文档-学校Web.md)：两步发布、学校内通知展示、列表、编辑、统计、打印和删除。
- [代理商 Web](家校通知一期产品需求文档-代理商Web.md)：选学校、填写通知、发布设置三步代发与管理。
- [运营后台](家校通知一期产品需求文档-运营后台.md)：平台代学校发布和管理通知。
- [教师小程序](家校通知一期产品需求文档-教师小程序.md)：学校通知、我发布、我接收、草稿箱、普通/美文通知和模板。
- [家长小程序](家校通知一期产品需求文档-家长小程序.md)：当前登录学生的通知列表、全部/待办、阅读和回执。
- [原型映射与同步规则](原型映射与同步规则.md)：基线菜单、V24 直达页、后续同步方法。
- [文档核对记录](文档核对记录.md)：需求与页面核对结果。
- [原型发布登记](原型发布登记.json)：GitHub 提交号、页面链接、版本和文件校验值。

#### 2. 最新 Web 原型链接

| 端 | 当前菜单入口 | 固定菜单壳 | 通知页面 |
|---|---|---|---|
| 学校 Web | [校务管理 → 家校通知](https://guozi0718.github.io/codex-projects/%E5%AD%A6%E6%A0%A1%E7%AB%AF/index.html?page=family-notice) | [学校 Web v0.57](https://guozi0718.github.io/codex-projects/%E5%AD%A6%E6%A0%A1%E7%AB%AF/releases/v0.57/index.html?page=family-notice) | [V24 学校端](https://guozi0718.github.io/codex-projects/%E5%AE%B6%E6%A0%A1%E9%80%9A%E7%9F%A5/%E7%89%88%E6%9C%AC-V24/index.html?role=school&school=s1&embedded=1) |
| 代理商 Web | [校务管理 → 家校通知](https://guozi0718.github.io/codex-projects/%E4%BB%A3%E7%90%86%E5%95%86%E7%AB%AF/index.html?page=family-notice) | [代理商 Web v0.66](https://guozi0718.github.io/codex-projects/%E4%BB%A3%E7%90%86%E5%95%86%E7%AB%AF/versions/v0.66/index.html?page=family-notice) | [V24 代理商端](https://guozi0718.github.io/codex-projects/%E5%AE%B6%E6%A0%A1%E9%80%9A%E7%9F%A5/%E7%89%88%E6%9C%AC-V24/index.html?role=agent&school=s1&embedded=1) |
| 运营后台 | [校务管理 → 家校通知](https://guozi0718.github.io/codex-projects/%E8%BF%90%E8%90%A5%E5%90%8E%E5%8F%B0/index.html?page=family-notice) | [运营后台 v0.68-6b45240dfc](https://guozi0718.github.io/codex-projects/%E8%BF%90%E8%90%A5%E5%90%8E%E5%8F%B0/versions/v0.68-6b45240dfc/index.html?page=family-notice) | [V24 运营后台](https://guozi0718.github.io/codex-projects/%E5%AE%B6%E6%A0%A1%E9%80%9A%E7%9F%A5/%E7%89%88%E6%9C%AC-V24/index.html?role=ops&school=s2&embedded=1) |

教师和家长小程序原型链接本轮不提供；原型与模板资料留在本地，没有修改或发布。

#### 3. 本轮已落实

- 通知来源统一；家长只接收，不是通知来源。
- 类型统一为普通通知、美文通知；正文链接不是第三种类型。
- Web 新发布为美文通知；Web 可按原权限编辑无任何查收记录且未过期的各端通知；普通通知以单文本内容块编辑，保留原类型。
- 代理商与运营后台代发必须使用学校名义，开关固定开启且不可关闭。
- 代理商和运营后台无草稿；教师小程序的草稿只保存通知内容并保留在教师端。
- 学校 Web 可看到同校教师、学校、代理商和平台端发布的所有通知，不因个人或学校名义隐藏；原编辑权限不变。
- 小程序原型按要求保留，不改、不发布。

#### 4. 尚待确认

Q70、Q71 仍待确认，详见[全端共通规则第9节](家校通知一期产品需求文档-全端共通规则.md)。第72–76项已按用户答复同步为已确认规则。