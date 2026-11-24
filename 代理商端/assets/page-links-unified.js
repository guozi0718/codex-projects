window.UnifiedPages={
  "version": 1,
  "end": "agent",
  "name": "代理商后台",
  "menu": [
    {
      "id": "menu.0",
      "t": "校务管理",
      "c": [
        {
          "id": "family-notice",
          "t": "家校通知"
        },
        {
          "id": "school-feedback",
          "t": "学校反馈"
        },
        {
          "id": "agent-feedback",
          "t": "问题反馈"
        }
      ]
    },
    {
      "id": "menu.1",
      "t": "智能校徽",
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
      "id": "menu.2",
      "t": "资金结算",
      "c": [
        {
          "id": "withdrawals",
          "t": "提现管理"
        }
      ]
    },
    {
      "id": "menu.3",
      "t": "系统管理",
      "c": [
        {
          "id": "op-log",
          "t": "操作日志"
        },
        {
          "id": "cs",
          "t": "客服管理"
        }
      ]
    }
  ],
  "pages": {
    "family-notice": {
      "title": "家校通知",
      "owner": "学校通知家长",
      "url": "../家校通知/版本-V24/index.html",
      "self": false,
      "parameters": {
        "role": "agent",
        "school": "s1",
        "embedded": "1"
      },
      "readiness": "zxh-content-v1"
    },
    "school-feedback": {
      "title": "学校反馈",
      "owner": "客户反馈",
      "url": "index.html",
      "self": true,
      "parameters": {},
      "readiness": "zxh-content-v1"
    },
    "agent-feedback": {
      "title": "问题反馈",
      "owner": "客户反馈",
      "url": "index.html",
      "self": true,
      "parameters": {},
      "readiness": "zxh-content-v1"
    },
    "badge-style": {
      "title": "校徽款式",
      "owner": "既有功能",
      "url": null,
      "self": false,
      "parameters": {},
      "readiness": "zxh-content-v1"
    },
    "handle-stats": {
      "title": "办理统计",
      "owner": "既有功能",
      "url": null,
      "self": false,
      "parameters": {},
      "readiness": "zxh-content-v1"
    },
    "handle-list": {
      "title": "办理明细",
      "owner": "既有功能",
      "url": null,
      "self": false,
      "parameters": {},
      "readiness": "zxh-content-v1"
    },
    "refunds": {
      "title": "退款管理",
      "owner": "既有功能",
      "url": null,
      "self": false,
      "parameters": {},
      "readiness": "zxh-content-v1"
    },
    "withdrawals": {
      "title": "提现管理",
      "owner": "既有功能",
      "url": null,
      "self": false,
      "parameters": {},
      "readiness": "zxh-content-v1"
    },
    "op-log": {
      "title": "操作日志",
      "owner": "既有功能",
      "url": "index.html",
      "self": true,
      "parameters": {},
      "readiness": "zxh-content-v1"
    },
    "cs": {
      "title": "客服管理",
      "owner": "客服管理",
      "url": "index.html",
      "self": true,
      "parameters": {},
      "readiness": "zxh-content-v1"
    }
  },
  "firstSecondary": "family-notice"
};