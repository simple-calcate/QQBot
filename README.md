# QQBot - OneBot v11 QQ 机器人

基于 SnowLuma + Hermes Agent 的 QQ 群聊/私聊 AI 机器人，通过 OneBot v11 协议与 QQ 交互。

## 架构

```
┌─────────────┐    WebSocket     ┌──────────────────┐    inbox/outbox    ┌──────────────────┐
│   QQ 用户    │ ←─────────────── │    SnowLuma       │ ←───────────────── │  qq-bridge.mjs   │
│             │    HTTP API      │  (OneBot v11)     │                    │  (消息桥接)       │
└─────────────┘ ←─────────────── │  WS:3001 HTTP:3000│                    └────────┬─────────┘
                                └──────────────────┘                             │
                                                                                 │ inbox
                                                                                 ▼
                                ┌──────────────────┐                    ┌──────────────────┐
                                │   Hermes Agent   │ ←───────────────── │ hermes-worker    │
                                │   (AI 推理)      │   hermes chat      │ v11.mjs          │
                                └──────────────────┘                    └──────────────────┘
                                         │
                                         ▼
                                ┌──────────────────┐
                                │  onebot-mcp.mjs  │
                                │ (38个OneBot API) │
                                │  MCP Server      │
                                └──────────────────┘
```

## 文件说明

| 文件 | 作用 |
|------|------|
| `start-full.bat` | **一键启动脚本**（双击运行） |
| `qq-bridge.mjs` | 消息桥接：连接 SnowLuma WS，收发消息，处理图片 |
| `hermes-worker-v11.mjs` | Worker：读 inbox，调 Hermes AI，写 outbox |
| `onebot-mcp.mjs` | MCP Server：38 个 OneBot v11 API，含限速 |
| `start.bat` | 仅启动 SnowLuma |
| `start-all.bat` | 启动 SnowLuma + Worker |
| `stop.bat` | 停止所有 node 进程 |

## 依赖文件位置

所有路径在各 `.mjs` 文件顶部硬编码（Windows 绝对路径）：

```
C:\Users\27554\Desktop\
├── SnowLuma\              # OneBot v11 实现（QQ 协议端）
│   ├── node.exe           # SnowLuma 自带的 node 运行时
│   ├── index.mjs          # SnowLuma 主程序
│   └── config\
│       ├── onebot_*.json  # OneBot 配置（HTTP:3000, WS:3001）
│       └── webui.json     # WebUI 配置（端口 5099）
│
└── QQBot\                 # 本项目
    ├── node_modules\      # npm 依赖（ws 包）
    ├── inbox\             # 桥接→Worker 的消息队列
    ├── outbox\            # Worker→桥接 的回复队列
    ├── images\            # 下载的图片缓存
    ├── group_history\     # 群聊历史（按群号 JSON）
    ├── sent_history.json  # bot 发送的消息 message_id 记录
    ├── sessions.json      # Hermes 会话状态
    └── group_at_time.json # 群聊 @时间 记录
```

## 启动步骤

### 方式一：一键启动（推荐）

双击 `start-full.bat`，脚本会：

1. **清理旧进程** - `taskkill /F /IM node.exe`
2. **启动 SnowLuma** - 等待 WebUI (5099) 就绪
3. **等待 QQ 登录** - 提示你打开 http://localhost:5099 登录
4. **等待 OneBot 端口** - 检测端口 3000 开放后继续
5. **启动 Worker** - 在新窗口启动 hermes-worker
6. **启动 Bridge** - 在当前窗口启动 qq-bridge（Ctrl+C 停止）

### 方式二：手动启动

```bash
# 1. 启动 SnowLuma
cd C:\Users\27554\Desktop\SnowLuma
node.exe index.mjs

# 2. 浏览器打开 http://localhost:5099 登录 QQ

# 3. 启动 Worker（新终端）
cd C:\Users\27554\Desktop\QQBot
node hermes-worker-v11.mjs

# 4. 启动 Bridge（新终端）
cd C:\Users\27554\Desktop\QQBot
node qq-bridge.mjs
```

## 消息流转

### 收到群消息（有人 @bot）

```
1. SnowLuma 收到群消息 → WebSocket 推送给 qq-bridge
2. qq-bridge 保存到 inbox/at_{id}.json（含 message_id、图片）
3. hermes-worker 读取 inbox，调用 Hermes Agent 生成回复
4. hermes-worker 写回复到 outbox/reply_{id}.json
5. qq-bridge 读 outbox，通过 SnowLuma 发送回复
6. SnowLuma 返回 message_id → qq-bridge 保存到 sent_history.json
```

### 收到群消息（无人 @bot）

```
1. 同上，但 qq-bridge 只保存到 inbox/record_{id}.json
2. hermes-worker 记录到 group_history/{群号}.json（含 message_id）
3. 不触发 AI 回复
```

## MCP Server（onebot-mcp.mjs）

38 个 OneBot v11 API，通过 MCP 协议暴露：

### 消息 API（自动限速 600ms）
- `send_private_msg` - 发私聊消息
- `send_group_msg` - 发群消息
- `send_msg` - 通用发消息
- `delete_msg` - 撤回消息（需要 message_id）
- `get_msg` - 获取消息详情
- `get_forward_msg` - 获取合并转发消息
- `send_like` - 点赞

### 群管理 API
- `set_group_kick` - 踢人
- `set_group_ban` - 禁言
- `set_group_whole_ban` - 全员禁言
- `set_group_admin` - 设管理员
- `set_group_card` - 改群名片
- `set_group_name` - 改群名
- `set_group_leave` - 退群
- `set_group_special_title` - 设专属头衔
- `set_group_anonymous` - 开关匿名
- `set_group_anonymous_ban` - 禁言匿名用户

### 查询 API
- `get_login_info` - 自己的信息
- `get_stranger_info` - 陌生人信息
- `get_friend_list` - 好友列表
- `get_group_info` - 群信息
- `get_group_list` - 群列表
- `get_group_member_info` - 群成员信息
- `get_group_member_list` - 群成员列表
- `get_group_honor_info` - 群荣誉

### 其他 API
- `get_image` / `get_record` - 获取图片/语音
- `can_send_image` / `can_send_record` - 检查能力
- `set_friend_add_request` / `set_group_add_request` - 处理请求
- `get_cookies` / `get_csrf_token` / `get_credentials` - 凭证
- `get_status` / `get_version_info` - 状态
- `set_restart` / `clean_cache` - 系统

### 限速说明

发送消息 API 自动限速 600ms 间隔（约 1.6 条/秒），防止腾讯封号。调用方无需关心，内部排队执行。

### MCP 启动

```bash
node onebot-mcp.mjs
# 监听 http://localhost:3100
# 需要 SnowLuma 先启动（端口 3000/3001）
```

## 消息撤回功能

### 机制

- 群聊历史自动记录 `message_id`，格式：`[mid:123456]`
- bot 发送的消息 ID 保存在 `sent_history.json`
- 撤回用 `delete_msg` + `message_id`

### 限制

- OneBot `delete_msg` **只能撤回 bot 自己发的消息**
- 无法撤回其他用户的消息（QQ 协议限制）

## 配置

### SnowLuma 配置

`C:\Users\27554\Desktop\SnowLuma\config\onebot_*.json`：

```json
{
  "networks": {
    "httpServers": [{ "host": "0.0.0.0", "port": 3000 }],
    "wsServers": [{ "host": "0.0.0.0", "port": 3001 }]
  }
}
```

### Token 配置

各 `.mjs` 文件顶部的 `WS_TOKEN` 和 `HTTP_TOKEN` 需与 SnowLuma 配置一致：

```javascript
const WS_TOKEN = 'your_ws_token';
const HTTP_TOKEN = 'your_http_token';
```

### 机器人昵称

`qq-bridge.mjs` 中的 `BOT_NICKNAME` 用于检测 @：

```javascript
const BOT_NICKNAME = '11';  // 改成你的 bot 昵称
```

## 依赖安装

```bash
cd C:\Users\27554\Desktop\QQBot
npm install ws
```

唯一外部依赖是 `ws`（WebSocket 客户端）。Hermes Agent 需单独安装。

## 日志

- SnowLuma: `C:\Users\27554\Desktop\SnowLuma\logs\`
- Hermes Worker: 控制台输出
- QQ Bridge: 控制台输出

## 故障排查

| 问题 | 解决 |
|------|------|
| 启动后端口 3000 不开 | 检查 SnowLuma WebUI 是否登录 QQ |
| bot 不回复 @消息 | 检查 `BOT_NICKNAME` 是否正确 |
| 图片获取失败 | 检查 SnowLuma HTTP API 是否正常 |
| 消息发送太慢 | 正常，限速 600ms 防封号 |
| 撤回失败 | 只能撤回 bot 自己的消息，且需要 message_id |

## GitHub

https://github.com/simple-calcate/QQBot
