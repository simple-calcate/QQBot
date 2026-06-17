/**
 * NapCatQQ <-> Hermes Agent 真实桥接
 * 将 QQ 消息转发给真正的 Hermes Agent 处理
 */

import WebSocket from 'ws';
import { execSync } from 'child_process';

// ============ 配置 ============
// NapCatQQ 的 WebSocket 地址（OneBot 协议）
const NAPCAT_WS = 'ws://127.0.0.1:3001';
const NAPCAT_TOKEN = ''; // 如果 NapCatQQ 设置了 token 就填这里

// Hermes Agent CLI 路径（根据你的安装调整）
const HERMES_CLI = 'hermes';

// 超时设置（秒）
const HERMES_TIMEOUT = 120;
// ==============================

function log(level, msg) {
  const time = new Date().toLocaleTimeString('zh-CN');
  console.log(`[${time}] [${level}] ${msg}`);
}

let ws = null;
let reconnectTimer = null;

// 连接 NapCatQQ
function connect() {
  const url = NAPCAT_TOKEN 
    ? `${NAPCAT_WS}?access_token=${NAPCAT_TOKEN}` 
    : NAPCAT_WS;
  
  log('INFO', `连接 NapCatQQ: ${NAPCAT_WS}`);
  ws = new WebSocket(url);

  ws.on('open', () => {
    log('INFO', '✅ 已连接到 NapCatQQ！');
    log('INFO', '等待 QQ 消息...');
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
    log('ERROR', `WebSocket 错误: ${err.message}`);
  });
}

function scheduleReconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connect, 5000);
}

// 处理收到的消息
async function handleMessage(data) {
  if (data.post_type !== 'message') return;

  const { message_type, user_id, group_id, raw_message, self_id } = data;

  // 忽略自己发的消息
  if (user_id === self_id) return;

  if (message_type === 'private') {
    log('INFO', `📩 私聊 [${user_id}]: ${raw_message}`);
    const reply = await callHermes(raw_message, user_id);
    if (reply) {
      sendPrivateMessage(user_id, reply);
    }
  } else if (message_type === 'group') {
    log('INFO', `📩 群消息 [群${group_id}] [${user_id}]: ${raw_message}`);
    
    // 检查是否 @机器人
    const atPattern = `[CQ:at,qq=${self_id}]`;
    if (raw_message.includes(atPattern)) {
      const cleanMsg = raw_message.replace(atPattern, '').trim();
      const reply = await callHermes(cleanMsg, user_id);
      if (reply) {
        sendGroupMessage(group_id, `[CQ:at,qq=${user_id}] ${reply}`);
      }
    }
  }
}

// 调用真正的 Hermes Agent
function callHermes(message, userId) {
  return new Promise((resolve) => {
    try {
      log('INFO', `🤖 调用 Hermes Agent...`);
      
      // 使用 hermes chat -q 发送消息
      const escapedMsg = message.replace(/"/g, '\\"');
      const cmd = `${HERMES_CLI} chat -q "${escapedMsg}"`;
      
      log('INFO', `执行命令: ${cmd}`);
      
      const result = execSync(cmd, {
        encoding: 'utf-8',
        timeout: HERMES_TIMEOUT * 1000,
        maxBuffer: 1024 * 1024,
        windowsHide: true
      });
      
      const reply = result.trim();
      if (reply) {
        log('INFO', `💬 回复: ${reply.substring(0, 80)}...`);
        resolve(reply);
      } else {
        log('WARN', 'Hermes 返回空回复');
        resolve('抱歉，我没有理解你的意思。');
      }
      
    } catch (err) {
      log('ERROR', `Hermes 调用失败: ${err.message}`);
      
      // 如果 hermes CLI 不可用，尝试通过 webhook API
      resolve('抱歉，Hermes Agent 暂时无法响应。请稍后再试。');
    }
  });
}

// 发送私聊消息
function sendPrivateMessage(userId, message) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    log('ERROR', 'WebSocket 未连接');
    return;
  }

  ws.send(JSON.stringify({
    action: 'send_private_msg',
    params: { user_id: userId, message },
    echo: `msg_${Date.now()}`
  }));
  log('INFO', `📤 发送到 [${userId}]: ${message.substring(0, 50)}...`);
}

// 发送群消息
function sendGroupMessage(groupId, message) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    log('ERROR', 'WebSocket 未连接');
    return;
  }

  ws.send(JSON.stringify({
    action: 'send_group_msg',
    params: { group_id: groupId, message },
    echo: `msg_${Date.now()}`
  }));
  log('INFO', `📤 发送到群 [${groupId}]: ${message.substring(0, 50)}...`);
}

// 启动
function main() {
  console.log('');
  console.log('========================================');
  console.log('   NapCatQQ <-> Hermes Agent 桥接');
  console.log('========================================');
  console.log('');
  console.log('配置:');
  console.log(`  NapCatQQ: ${NAPCAT_WS}`);
  console.log(`  Hermes: ${HERMES_CLI}`);
  console.log('');
  console.log('说明:');
  console.log('  • 私聊机器人 - 直接发送消息');
  console.log('  • 群聊中 @机器人 - 触发回复');
  console.log('');
  console.log('按 Ctrl+C 停止');
  console.log('========================================');
  console.log('');

  connect();
}

main();
