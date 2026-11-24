# 运营后台

[打开最新原型](https://guozi0718.github.io/codex-projects/%E8%BF%90%E8%90%A5%E5%90%8E%E5%8F%B0/index.html?page=system-field-management)

当前业务版本：v0.70；分发版本：v0.70-a58c2af5ff。修改中、未定版，不是生产系统。

- index.html：固定最新入口，保留page/view/dialog/id等查询参数。
- versions/：不可变运行版本，含完整资源、已登记通知依赖、版本说明和明确登记的产品文档及文件哈希。
- latest.json / releases.json：活动分发索引及追加历史。
- 只有用户在当前会话明确要求推送后，发布器才上传登记的活动版本；GitHub Pages跟随这次获授权的main提交部署。未得到明确推送指令时不会上传。
- 本地未采用候选、全量历史快照、凭据及会话资料不上传。

回滚：创建新commit，将最新入口和latest.json指回既有不可变版本；不重写Git历史、不强推。
