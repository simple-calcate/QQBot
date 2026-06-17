# QQ Bot + Hermes Agent

基于 SnowLuma (OneBot) + Hermes Agent 的 QQ 群聊/私聊机器人。

## 架构

```
QQ 消息 → SnowLuma (WebSocket:3001) → qq-bridge.mjs → inbox/*.json
                                                    ↓
                                          hermes-worker-v11.mjs
                                                    ↓
                                          outbox/*.json → qq-bridge.mjs → QQ 回复
```

## 功能

- **私聊**：所有消息自动回复
- **群聊**：只回复 @机器人 的消息，附带最近群聊上下文
- **会话管理**：按群 ID / 用户 ID 维护独立会话，3 天超时淘汰
- **消息去重**：防止 SnowLuma 重复推送导致多次回复
- **会话恢复**：会话过期时自动创建新会话

## 使用的模型

- 私聊：mimo-v2.5-pro
- 群聊：mimo-v2.5

## 前置依赖

1. [SnowLuma](https://github.com/) - OneBot 协议实现，连接 QQ
2. [Hermes Agent](https://hermes-agent.nousresearch.com/) - AI Agent 运行时
3. Node.js

## 启动

```bash
# 一键启动
start-full.bat

# 或手动启动
# 1. 启动 SnowLuma
cd SnowLuma && node index.mjs

# 2. 启动 Worker
node hermes-worker-v11.mjs

# 3. 启动 Bridge
node qq-bridge.mjs
```

## 停止

```bash
# 一键停止
stop.bat
```

## 配置

在 `qq-bridge.mjs` 中修改：

```javascript
const SNOWLUMA_WS = 'ws://127.0.0.1:3001';  // SnowLuma 地址
const BOT_NICKNAME = '11';                    // 机器人昵称（用于检测@）
```

在 `hermes-worker-v11.mjs` 中修改：

```javascript
const HERMES = '...';  // Hermes Agent 可执行文件路径
```

## 文件说明

| 文件 | 说明 |
|---|---|
| `qq-bridge.mjs` | WebSocket 桥接，连接 SnowLuma，收发消息 |
| `hermes-worker-v11.mjs` | Worker，轮询 inbox，调用 Hermes 处理消息 |
| `start-full.bat` | 一键启动脚本 |
| `stop.bat` | 一键停止脚本 |
| `package.json` | 依赖声明 |

## License

MIT
