# QQ Bot + Hermes Agent 桥接

## 🎯 功能
- ✅ 接收 QQ 私聊消息，转发给真正的 Hermes Agent 处理
- ✅ 接收 QQ 群消息（@机器人时），转发给 Hermes Agent 处理
- ✅ 将 Hermes Agent 的回复发送回 QQ
- ✅ **支持上下文记忆** - 每个用户独立会话，机器人记住之前的对话

## 📋 前置要求
1. **SnowLuma** 已启动并绑定 QQ（端口 3001）
2. **Hermes Agent** 桌面版已安装并运行

## 🚀 启动方式

### 方法一：一键启动（推荐）
双击 `start-full.bat` 文件

### 方法二：分别启动
```bash
# 终端1：启动 Worker
cd C:\Users\27554\Desktop\QQBot
"C:\Users\27554\Desktop\SnowLuma\node.exe" hermes-worker-v6.mjs

# 终端2：启动 Bridge
cd C:\Users\27554\Desktop\QQBot
"C:\Users\27554\Desktop\SnowLuma\node.exe" qq-bridge.mjs
```

## 💬 使用说明

### 私聊
直接给机器人发送消息，会自动转发给 Hermes Agent 处理。

### 群聊
在群里 **@机器人** 时，会触发机器人回复。

### 上下文记忆
- 每个 QQ 用户有独立的对话会话
- 机器人会记住之前的对话内容
- 会话 24 小时后自动过期

## ⚙️ 工作原理

```
QQ消息 → SnowLuma → qq-bridge.mjs → inbox/
                                         ↓
                              hermes-worker-v6.mjs
                                         ↓
                              Hermes Agent 处理
                              (使用 --resume 继续会话)
                                         ↓
                              outbox/ → qq-bridge.mjs → QQ回复
```

## 📁 文件说明
- `qq-bridge.mjs` - 连接 SnowLuma，处理消息收发
- `hermes-worker-v6.mjs` - 监听 inbox，调用 Hermes Agent（支持上下文）
- `sessions.json` - 用户会话记录（自动生成）
- `start-full.bat` - 一键启动脚本
- `inbox/` - 待处理的消息
- `outbox/` - 待发送的回复

## ❓ 常见问题

### Q: 机器人没有记住我的消息？
A: 检查 `sessions.json` 文件是否正常生成，会话 ID 是否被记录。

### Q: 会话什么时候过期？
A: 默认 24 小时后自动过期，可以在 `hermes-worker-v6.mjs` 中修改 `SESSION_EXPIRE_MS` 常量。

### Q: 如何清除会话记录？
A: 删除 `sessions.json` 文件即可。
