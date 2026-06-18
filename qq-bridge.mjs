import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

const SNOWLUMA_WS = 'ws://127.0.0.1:3001';
const SNOWLUMA_HTTP = 'http://127.0.0.1:3000';
const WS_TOKEN='pCuEG6dlti7GytmRgXpPBWdIOKtFvBi-4I-gGtPy9w0';
const HTTP_TOKEN='UfPoOxHA8OBuU9ZwhozMFTn01mVs1sQ3l6ZbJhfI1Fw';
const INBOX = 'C:/Users/27554/Desktop/QQBot/inbox';
const OUTBOX = 'C:/Users/27554/Desktop/QQBot/outbox';
const IMAGES_DIR = 'C:/Users/27554/Desktop/QQBot/images';

import https from 'https';
import http from 'http';

// 机器人昵称（用于检测@）
const BOT_NICKNAME = '11';

let ws = null;
let msgId = 0;
const recentMsgIds = new Set();
const sentMsgCallbacks = new Map(); // echo -> callback for tracking sent message_ids

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

// 提取消息中的图片文件名
function extractImageFiles(message) {
  const files = [];
  const regex = /\[CQ:image,[^\]]*file=([^\],]+)/g;
  let match;
  while ((match = regex.exec(message)) !== null) {
    files.push(match[1]);
  }
  return files;
}

// 通过 SnowLuma HTTP API 获取图片
function fetchImageViaAPI(file) {
  return new Promise((resolve, reject) => {
    const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
    const filepath = path.join(IMAGES_DIR, filename);
    
    const postData = JSON.stringify({ file });
    const url = new URL(`${SNOWLUMA_HTTP}/get_image`);
    
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HTTP_TOKEN}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.status === 'ok' && result.data?.file) {
            const filePath = result.data.file;
            // 如果返回的是 URL，直接下载
            if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
              downloadImage(filePath).then(resolve).catch(reject);
            } else {
              // 返回的是本地路径，复制到 images 目录
              fs.copyFile(filePath, filepath, (err) => {
                if (err) reject(err);
                else resolve(filepath);
              });
            }
          } else {
            reject(new Error(result.wording || '获取图片失败'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 下载图片到本地（直接下载 CDN）
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
    const filepath = path.join(IMAGES_DIR, filename);
    const file = fs.createWriteStream(filepath);
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        fs.unlink(filepath, () => {});
        downloadImage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      // 检查 Content-Type 是否为图片
      const contentType = res.headers['content-type'] || '';
      if (!contentType.startsWith('image/')) {
        file.close();
        fs.unlink(filepath, () => {});
        reject(new Error(`非图片响应: ${contentType}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(filepath); });
    }).on('error', (err) => { file.close(); fs.unlink(filepath, () => {}); reject(err); });
  });
}

function connect() {
  ws = new WebSocket(SNOWLUMA_WS, {
    headers: { 'Authorization': `Bearer ${WS_TOKEN}` }
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
      if (msg.post_type === 'message') { handleMessage(msg); return; }
      // Handle send response: capture message_id
      if (msg.echo && msg.status === 'ok' && msg.data && msg.data.message_id) {
        const cb = sentMsgCallbacks.get(msg.echo);
        if (cb) { cb(msg.data.message_id); sentMsgCallbacks.delete(msg.echo); }
      }
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
  
  handleMessageAsync(data).catch(err => log(`❌ 处理消息出错: ${err.message}`));
}

async function handleMessageAsync(data) {
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
        message: cleanMsg, nickname, selfId,
        messageId: data.message_id
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
    
    // 提取图片
    const imageFiles = extractImageFiles(message);
    let imagePaths = [];
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        try {
          const p = await fetchImageViaAPI(file);
          imagePaths.push(p);
          log(`🖼️ 获取图片: ${path.basename(p)}`);
        } catch (e) {
          log(`❌ 图片获取失败: ${e.message}`);
        }
      }
    }
    
    // 如果@后面没有实际内容也没有图片，跳过
    if (!cleanMsg && imagePaths.length === 0) return;
    
    log(`📩 @消息 [${nickname}]: ${cleanMsg || '[图片]'}`);
    
    const info = {
      id: id + 100000, time: new Date().toISOString(),
      type: 'group', userId, groupId: data.group_id,
      message: cleanMsg || '', nickname, selfId,
      images: imagePaths,
      messageId: data.message_id
    };
    fs.writeFileSync(path.join(INBOX, `at_${id}.json`), JSON.stringify(info, null, 2));
    
  } else {
    // 提取图片
    const imageFiles = extractImageFiles(message);
    let imagePaths = [];
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        try {
          const p = await fetchImageViaAPI(file);
          imagePaths.push(p);
          log(`🖼️ 获取图片: ${path.basename(p)}`);
        } catch (e) {
          log(`❌ 图片获取失败: ${e.message}`);
        }
      }
    }
    
    const cleanMsg = message.replace(/\[CQ:[^\]]+\]/g, '').trim();
    log(`📩 私聊 [${nickname}]: ${cleanMsg || '[图片]'}`);
    const info = {
      id, time: new Date().toISOString(),
      type: 'private', userId, nickname, message: cleanMsg || '', selfId,
      images: imagePaths,
      messageId: data.message_id
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
        
        const echo = `reply_${Date.now()}`;
        const request = {
          action: data.type === 'private' ? 'send_private_msg' : 'send_group_msg',
          params: data.type === 'private' 
            ? { user_id: data.userId, message: data.message }
            : { group_id: data.groupId, message: data.message },
          echo: echo
        };
        
        // Track sent message_id
        sentMsgCallbacks.set(echo, (messageId) => {
          const sentFile = path.join(INBOX, 'sent_' + echo + '.json');
          try {
            fs.writeFileSync(sentFile, JSON.stringify({
              type: 'sent', messageId, time: Date.now(),
              userId: data.userId, groupId: data.groupId, message: data.message
            }));
          } catch(e) {}
          log(`📤 发送成功 [mid:${messageId}]`);
        });
        
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
