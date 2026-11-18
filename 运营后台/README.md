# 运营后台

[打开最新原型](https://guozi0718.github.io/codex-projects/%E8%BF%90%E8%90%A5%E5%90%8E%E5%8F%B0/index.html?page=system-field-management)

当前业务版本：v0.59；分发版本：v0.59-4a09dacfb2。修改中、未定版，不是生产系统。

- index.html：固定最新入口，保留page/view/dialog/id等查询参数。
- versions/：不可变运行版本，含完整资源、已登记通知依赖及文件哈希。
- latest.json / releases.json：活动分发索引及追加历史。
- 后续已登记活动版本由本地自动同步任务推送；GitHub Pages跟随main分支部署。电脑关闭、退出登录、网络/认证失败时不会声称同步成功。
- 本地未采用候选、全量历史快照、凭据及会话资料不上传。

回滚：创建新commit，将最新入口和latest.json指回既有不可变版本；不重写Git历史、不强推。
