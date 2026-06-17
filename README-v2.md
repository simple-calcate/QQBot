# QQ Bot + Hermes Agent 桥接

## 🎯 功能
- ✅ 接收 QQ 私聊消息，转发给真正的 Hermes Agent 处理
- ✅ 接收 QQ 群消息（@机器人时），转发给 Hermes Agent 处理
- ✅ 将 Hermes Agent 的回复发送回 QQ

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
"C:\Users\27554\Desktop\SnowLuma\node.exe" hermes-worker-v2.mjs

# 终端2：启动 Bridge
cd C:\Users\27554\Desktop\QQBot
"C:\Users\27554\Desktop\SnowLuma\node.exe" qq-bridge.mjs
```

## 💬 使用说明

### 私聊
直接给机器人发送消息，会自动转发给 Hermes Agent 处理。

### 群聊
在群里 **@机器人** 时，会触发机器人回复。

## ⚙️ 工作原理

```
QQ消息 → SnowLuma → qq-bridge.mjs → inbox/
                                         ↓
                              hermes-worker-v2.mjs
                                         ↓
                              Hermes Agent 处理
                                         ↓
                              outbox/ → qq-bridge.mjs → SnowLuma → QQ回复
```

## 📁 文件说明
- `qq-bridge.mjs` - 连接 SnowLuma，处理消息收发
- `hermes-worker-v2.mjs` - 监听 inbox，调用 Hermes Agent
- `start-full.bat` - 一键启动脚本
- `inbox/` - 待处理的消息
- `outbox/` - 待发送的回复

## ❓ 常见问题

### Q: 没有收到回复？
A: 确保 SnowLuma 已启动，且端口 3001 可访问。

### Q: Hermes Agent 没有响应？
A: 检查 Hermes 桌面版是否正在运行。

### Q: 如何修改配置？
A: 编辑 `hermes-worker-v2.mjs` 中的路径配置。
