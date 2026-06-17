import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

const SNOWLUMA_WS = 'ws://127.0.0.1:3001';
const TOKEN='pCuEG6dlti7GytmRgXpPBWdIOKtFvBi-4I-gGtPy9w0';
const INBOX = 'C:/Users/27554/Desktop/QQBot/inbox';
const OUTBOX = 'C:/Users/27554/Desktop/QQBot/outbox';

// 机器人昵称（用于检测@）
const BOT_NICKNAME = '11';

let ws = null;
let msgId = 0;
const recentMsgIds = new Set();

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

function connect() {
  ws = new WebSocket(SNOWLUMA_WS, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  
  ws.on('open', () => {
    log('✅ 已连接 SnowLuma');
    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'get_status' }));
      }
    }, 30000);
  });
  
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.post_type === 'message') handleMessage(msg);
    } catch (e) {}
  });
  
  ws.on('close', () => {
    log('❌ 断开，5秒后重连...');
    setTimeout(connect, 5000);
  });
  
  ws.on('error', (err) => log(`❌ ${err.message}`));
}

function handleMessage(data) {
  // 去重：SnowLuma 可能重复推送同一事件
  const eventKey = `${data.user_id}_${data.group_id}_${data.message_id || ''}_${data.time || ''}`;
  if (recentMsgIds.has(eventKey)) return;
  recentMsgIds.add(eventKey);
  setTimeout(() => recentMsgIds.delete(eventKey), 10000); // 10秒后清除
  
  const id = ++msgId;
  const selfId = String(data.self_id);
  const userId = String(data.user_id);
  const message = data.raw_message || '';
  const messageType = data.message_type;
  const nickname = data.sender?.nickname || userId;
  
  if (userId === selfId) return;
  
  if (messageType === 'group') {
    // 记录所有群消息
    const cleanMsg = message
      .replace(/\[CQ:[^\]]+\]/g, '')  // 移除所有CQ码
      .replace(/@\S+/g, '')
      .trim();
    
    if (cleanMsg) {
      const recordData = {
        id, time: new Date().toISOString(),
        type: 'group_record', userId, groupId: data.group_id,
        message: cleanMsg, nickname, selfId
      };
      fs.writeFileSync(path.join(INBOX, `record_${id}.json`), JSON.stringify(recordData, null, 2));
    }
    
    // 检测@机器人（支持QQ号和昵称）
    const isAtBot = 
      message.includes(`[CQ:at,qq=${selfId}]`) ||  // CQ码格式
      message.includes(`@${selfId}`) ||              // @QQ号
      message.includes(`@${BOT_NICKNAME}`) ||        // @昵称
      message.includes(`@${BOT_NICKNAME} `);         // @昵称+空格
    
    if (!isAtBot) return;
    
    log(`📩 @消息 [${nickname}]: ${cleanMsg}`);
    
    const info = {
      id: id + 100000, time: new Date().toISOString(),
      type: 'group', userId, groupId: data.group_id,
      message: cleanMsg || '你好', nickname, selfId
    };
    fs.writeFileSync(path.join(INBOX, `at_${id}.json`), JSON.stringify(info, null, 2));
    
  } else {
    log(`📩 私聊 [${nickname}]: ${message}`);
    const info = {
      id, time: new Date().toISOString(),
      type: 'private', userId, nickname, message, selfId
    };
    fs.writeFileSync(path.join(INBOX, `${id}.json`), JSON.stringify(info, null, 2));
  }
}

// 轮询 outbox
function pollOutbox() {
  setInterval(() => {
    try {
      const files = fs.readdirSync(OUTBOX);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(OUTBOX, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        if (!ws || ws.readyState !== WebSocket.OPEN) continue;
        
        const request = {
          action: data.type === 'private' ? 'send_private_msg' : 'send_group_msg',
          params: data.type === 'private' 
            ? { user_id: data.userId, message: data.message }
            : { group_id: data.groupId, message: data.message },
          echo: `reply_${Date.now()}`
        };
        
        ws.send(JSON.stringify(request));
        log(`📤 发送到 [${data.userId || data.groupId}]`);
        fs.unlinkSync(filePath);
      }
    } catch (e) {}
  }, 1000);
}

log('🚀 QQ 桥接启动');
log(`📌 机器人昵称: ${BOT_NICKNAME}`);
connect();
pollOutbox();
