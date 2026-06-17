/**
 * SnowLuma <-> Hermes Agent 桥接脚本
 * 将 QQ 消息转发给 Hermes Agent 处理，然后将回复发送回 QQ
 */

import WebSocket from 'ws';
import http from 'http';

// 配置
const SNOWLUMA_WS = 'ws://127.0.0.1:3001';
const SNOWLUMA_TOKEN='pCuEG6dlti7GytmRgXpPBWdIOKtFvBi-4I-gGtPy9w0';
const HERMES_API = 'http://127.0.0.1:5001/api/chat';

// 日志函数
function log(level, message) {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] [${level}] ${message}`);
}

// 连接状态
let ws = null;
let reconnectTimer = null;

// 连接到 SnowLuma WebSocket
function connect() {
  const uri = `${SNOWLUMA_WS}?access_token=${SNOWLUMA_TOKEN}`;
  log('INFO', `Connecting to SnowLuma at ${SNOWLUMA_WS}...`);
  
  ws = new WebSocket(uri);
  
  ws.on('open', () => {
    log('INFO', '✅ Connected to SnowLuma!');
    log('INFO', '等待 QQ 消息中...');
  });
  
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      handleMessage(msg);
    } catch (e) {
      // 忽略非 JSON 消息
    }
  });
  
  ws.on('close', () => {
    log('WARN', '连接断开，5秒后重连...');
    scheduleReconnect();
  });
  
  ws.on('error', (err) => {
    log('ERROR', `WebSocket error: ${err.message}`);
  });
}

// 重连
function scheduleReconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connect, 5000);
}

// 处理消息
async function handleMessage(data) {
  // 只处理消息事件
  if (data.post_type !== 'message') return;
  
  const messageType = data.message_type;
  const userId = data.user_id;
  const rawMessage = data.raw_message || '';
  const selfId = data.self_id;
  
  // 忽略自己发送的消息
  if (userId === selfId) return;
  
  if (messageType === 'private') {
    log('INFO', `📩 收到私聊消息 [${userId}]: ${rawMessage}`);
    const reply = await getHermesReply(userId, rawMessage);
    if (reply) {
      await sendPrivateMessage(userId, reply);
    }
  } else if (messageType === 'group') {
    const groupId = data.group_id;
    log('INFO', `📩 收到群消息 [群${groupId}] [${userId}]: ${rawMessage}`);
    
    // 检查是否 @机器人 或包含关键词
    const atPattern = `[CQ:at,qq=${selfId}]`;
    if (rawMessage.includes(atPattern) || rawMessage.includes('hermes') || rawMessage.includes('小助手')) {
      const cleanMessage = rawMessage.replace(atPattern, '').trim();
      const reply = await getHermesReply(userId, cleanMessage);
      if (reply) {
        await sendGroupMessage(groupId, `[CQ:at,qq=${userId}] ${reply}`);
      }
    }
  }
}

// 获取 Hermes Agent 回复
async function getHermesReply(userId, message) {
  return new Promise((resolve, reject) => {
    log('INFO', `🤖 调用 Hermes Agent API...`);
    
    const postData = JSON.stringify({
      message: message,
      user_id: userId
    });
    
    const url = new URL(HERMES_API);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          log('INFO', `💬 Hermes 回复: ${result.reply.substring(0, 50)}...`);
          resolve(result.reply);
        } catch (err) {
          log('ERROR', `解析回复失败: ${err.message}`);
          resolve('抱歉，处理消息时出现错误。');
        }
      });
    });
    
    req.on('error', (err) => {
      log('ERROR', `API 请求失败: ${err.message}`);
      resolve('抱歉，连接 Hermes Agent 失败。');
    });
    
    req.write(postData);
    req.end();
  });
}

// 发送私聊消息
async function sendPrivateMessage(userId, message) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    log('ERROR', 'WebSocket 未连接');
    return;
  }
  
  const request = {
    action: 'send_private_msg',
    params: {
      user_id: userId,
      message: message
    },
    echo: `msg_${Date.now()}`
  };
  
  ws.send(JSON.stringify(request));
  log('INFO', `📤 发送私聊消息到 [${userId}]: ${message.substring(0, 50)}...`);
}

// 发送群消息
async function sendGroupMessage(groupId, message) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    log('ERROR', 'WebSocket 未连接');
    return;
  }
  
  const request = {
    action: 'send_group_msg',
    params: {
      group_id: groupId,
      message: message
    },
    echo: `msg_${Date.now()}`
  };
  
  ws.send(JSON.stringify(request));
  log('INFO', `📤 发送群消息到 [群${groupId}]: ${message.substring(0, 50)}...`);
}

// 主函数
function main() {
  log('INFO', '🚀 启动 SnowLuma <-> Hermes Agent 桥接机器人');
  log('INFO', `SnowLuma WS: ${SNOWLUMA_WS}`);
  log('INFO', `Hermes API: ${HERMES_API}`);
  log('INFO', '');
  log('INFO', '使用说明:');
  log('INFO', '1. 私聊机器人 - 直接发送消息');
  log('INFO', '2. 群聊中 @机器人 或说 "hermes"/"小助手"');
  log('INFO', '');
  
  connect();
}

main();
