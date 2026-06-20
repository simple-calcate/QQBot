# QQBot 项目结构详解

## 核心架构

```
QQ用户 ←→ SnowLuma(:3000/:3001) ←→ qq-bridge.mjs ←→ inbox/outbox ←→ hermes-worker ←→ hermes-agent CLI
                                                    ↕
                                              onebot-mcp.mjs(:3100)
                                                    ↕
                                              SnowLuma HTTP API(:3000)
```

## 四个核心进程

### 1. SnowLuma (端口 3000/3001)
- **位置**: `C:\Users\27554\Desktop\SnowLuma\`
- **作用**: OneBot v11 协议实现，连接 QQ 服务器
- **端口**: HTTP:3000 (API), WS:3001 (事件推送)

### 2. qq-bridge.mjs
- **位置**: `QQBot/bridge/` 子目录
- **作用**: 消息桥接器
  - 监听 SnowLuma WebSocket 事件
  - 收到消息 → 写入 `inbox/` 目录
  - 读取 `outbox/` 目录 → 调 SnowLuma HTTP API 发送
  - 处理图片（通过 SnowLuma get_image API）

### 3. hermes-worker-v11.mjs
- **位置**: `QQBot/worker/` 子目录
- **作用**: AI 工作进程
  - 每秒轮询 `inbox/` 目录
  - 读取消息 → 调用 `hermes-agent chat` CLI
  - 解析 AI 回复 → 写入 `outbox/` 目录
  - 支持群聊历史记录、会话管理

### 4. onebot-mcp.mjs
- **位置**: `QQBot/mcp/` 子目录
- **端口**: 3100
- **作用**: 把 SnowLuma OneBot API 包装成 MCP 工具
- **工具数量**: 41 个

## QQ Bot 工具体系（3层）

### 1. OneBot MCP 工具（41个）— 直接操作 QQ

**发消息（可发到任意会话）：**
- `send_group_msg` / `send_private_msg` / `send_msg` — 发文本消息
- `send_group_image` / `send_private_image` — 发图片
- `send_group_file` / `send_private_file` — 发文件
- `send_like` — 点赞
- `delete_msg` — 撤回消息

**查信息：**
- `get_group_list` / `get_group_info` / `get_group_member_list` 等
- `get_msg` / `get_forward_msg` / `get_image` / `get_record`
- `get_login_info` / `get_stranger_info` / `get_friend_list`

**群管理：**
- `set_group_kick` / `set_group_ban` / `set_group_admin` 等

**处理请求：**
- `set_friend_add_request` / `set_group_add_request`

### 2. Hermes 内置工具
- `terminal` — 执行命令行
- `file` — 读写本地文件
- `browser` — 打开网页

### 3. MEDIA: 标记 — Worker 文件发送
- 只能回复**触发消息的那个会话**
- 格式: `MEDIA:/path/to/file`
- Worker 检测后通过 outbox 发送

### 场景对照

| 场景 | 用什么 |
|------|--------|
| 回复当前会话的文字 | 直接输出文字 |
| 回复当前会话的文件 | `MEDIA:/path` |
| 主动发消息到其他群/人 | MCP `send_group_msg` |
| 查群信息/成员 | MCP `get_*` 工具 |
| 执行系统命令 | `terminal` |
| 读写本地文件 | `file` |
| 打开网页/搜索 | `browser` |

## 文件目录

```
QQBot/
├── hermes-worker-v11.mjs     # Worker 主入口（薄包装）
├── qq-bridge.mjs             # 桥接器主入口（薄包装）
├── onebot-mcp.mjs            # MCP Server 主入口（薄包装）
│
├── worker/                   # Worker 子模块
│   ├── config.mjs            #   配置常量
│   ├── group-history.mjs     #   群聊历史管理
│   ├── session.mjs           #   会话管理
│   ├── output.mjs            #   输出清理
│   ├── hermes.mjs            #   Hermes 调用封装
│   └── inbox.mjs             #   消息处理
│
├── bridge/                   # Bridge 子模块
│   ├── config.mjs            #   配置常量
│   ├── image.mjs             #   图片处理
│   ├── websocket.mjs         #   WebSocket 连接
│   ├── handler.mjs           #   消息处理
│   └── outbox.mjs            #   文件上传 + Outbox 轮询
│
├── mcp/                      # MCP Server 子模块
│   ├── config.mjs            #   配置常量
│   ├── tools.mjs             #   工具汇总
│   ├── tools-message.mjs     #   消息工具定义
│   ├── tools-group.mjs       #   群管理工具定义
│   ├── tools-user.mjs        #   用户/系统工具定义
│   ├── tools-file.mjs        #   文件/图片工具定义
│   ├── onebot-api.mjs        #   OneBot API 调用 + 限速
│   ├── handler.mjs           #   工具处理逻辑
│   └── server.mjs            #   HTTP Server
│
├── inbox/                    # 待处理消息（worker 读取后删除）
├── outbox/                   # 待发送消息（bridge 读取后删除）
├── group_history/            # 群聊历史记录（按群ID存JSON）
├── images/                   # 下载的图片缓存
├── sessions.json             # 会话管理
├── sent_history.json         # 已发消息记录
├── group_at_time.json        # 群@时间标记
│
├── start-full.bat            # 一键启动（推荐）
├── stop.bat                  # 停止所有进程
├── PROJECT_STRUCTURE.md      # 本文档
└── README.md                 # 项目说明
```

## 配置文件

| 文件 | 位置 | 作用 |
|------|------|------|
| `config.yaml` | `hermes-home/config.yaml` | 全局配置（模型、provider） |
| `config.yaml` | `hermes-home/profiles/qqbot/config.yaml` | QQ Bot 配置（MCP、人格） |
| `SOUL.md` | `hermes-home/profiles/qqbot/SOUL.md` | Agent 人格 + 工具说明 |
