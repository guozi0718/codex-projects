/* 主项目唯一导航登记。新增链接须由主项目按来源登记生成，不从URL接受任意目标。 */
window.AgentPageRegistry={
  "schemaVersion": 1,
  "endpoint": "agent",
  "release": "v0.58",
  "menu": [
    {
      "t": "校务管理",
      "ic": "school",
      "c": [
        {
          "id": "family-notice",
          "t": "家校通知",
          "route": "family-notice"
        },
        {
          "id": "school-feedback",
          "t": "学校反馈",
          "route": "school-feedback"
        },
        {
          "id": "agent-feedback",
          "t": "问题反馈",
          "route": "agent-feedback"
        }
      ]
    },
    {
      "t": "智能校徽",
      "ic": "badge",
      "c": [
        {
          "id": "badge-style",
          "t": "校徽款式"
        },
        {
          "id": "handle-stats",
          "t": "办理统计"
        },
        {
          "id": "handle-list",
          "t": "办理明细"
        },
        {
          "id": "refunds",
          "t": "退款管理"
        }
      ]
    },
    {
      "t": "资金结算",
      "ic": "money",
      "c": [
        {
          "id": "withdrawals",
          "t": "提现管理"
        }
      ]
    },
    {
      "t": "系统管理",
      "ic": "settings",
      "c": [
        {
          "id": "op-log",
          "t": "操作日志",
          "route": "op-log"
        },
        {
          "id": "cs",
          "t": "客服管理",
          "route": "cs"
        }
      ]
    }
  ],
  "pages": {
    "family-notice": {
      "title": "家校通知",
      "kind": "embedded",
      "url": "notice/index.html",
      "parameters": {
        "role": "agent",
        "school": "s1",
        "embedded": "1",
        "v": "20261118-20"
      },
      "owner": "家校通知功能项目",
      "dependency": "家校通知 V20；相对路径接入代理商端 V0.58"
    },
    "school-feedback": {
      "title": "学校反馈",
      "kind": "native",
      "module": "feedback",
      "owner": "客户反馈功能项目"
    },
    "agent-feedback": {
      "title": "问题反馈",
      "kind": "native",
      "module": "feedback",
      "owner": "客户反馈功能项目"
    },
    "badge-style": {
      "title": "校徽款式",
      "kind": "unconnected"
    },
    "handle-stats": {
      "title": "办理统计",
      "kind": "unconnected"
    },
    "handle-list": {
      "title": "办理明细",
      "kind": "unconnected"
    },
    "refunds": {
      "title": "退款管理",
      "kind": "unconnected"
    },
    "withdrawals": {
      "title": "提现管理",
      "kind": "unconnected"
    },
    "op-log": {
      "title": "操作日志",
      "kind": "legacy",
      "owner": "继承活动基线操作日志"
    },
    "cs": {
      "title": "客服管理",
      "kind": "native",
      "module": "customer",
      "owner": "客服管理功能项目"
    }
  }
};
