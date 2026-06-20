/**
 * Outbox 轮询 - 处理待发送消息和文件上传
 */
import fs from 'fs';
import path from 'path';
import http from 'http';
import { INBOX, OUTBOX, SNOWLUMA_HTTP, HTTP_TOKEN, log } from './config.mjs';
import { ws, sentMsgCallbacks } from './websocket.mjs';

function uploadFile(filePath, target, targetId) {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(filePath);
    const apiPath = target === 'group' ? '/upload_group_file' : '/upload_private_file';
    const params = target === 'group' ? { group_id: targetId } : { user_id: String(targetId) };
    const reqData = JSON.stringify({ ...params, file: filePath.replace(/\\\\/g, '/'), name: fileName });
    
    const req = http.request({
      hostname: '127.0.0.1', port: 3000, path: apiPath, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${HTTP_TOKEN}`, 'Content-Length': Buffer.byteLength(reqData) }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.status === 'ok' && result.data?.file_id) {
            resolve(result.data.file_id);
          } else {
            reject(new Error(result.wording || '上传文件失败'));
          }
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(reqData);
    req.end();
  });
}

export function pollOutbox() {
  setInterval(async () => {
    try {
      const files = fs.readdirSync(OUTBOX);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(OUTBOX, file);
        let data;
        try { data = JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch (e) { continue; }
        if (!ws || ws.readyState !== 1) continue; // WebSocket.OPEN = 1
        
        try {
          if (data.kind === 'file') {
            await sendFileMessage(data, filePath);
          } else {
            await sendTextMessage(data, filePath);
          }
        } catch (e) {
          log(`❌ 发送失败: ${e.message}`);
        }
      }
    } catch (e) {}
  }, 1000);
}

async function sendFileMessage(data, filePath) {
  const target = data.type === 'group' ? 'group' : 'private';
  const targetId = target === 'group' ? data.groupId : data.userId;
  
  log(`📎 上传文件: ${path.basename(data.filePath)}`);
  const fileId = await uploadFile(data.filePath, target, targetId);
  log(`📎 上传成功 file_id: ${fileId.substring(0, 20)}...`);
  
  const echo = `reply_${Date.now()}`;
  const fileMsg = [{ type: 'file', data: { file_id: fileId } }];
  const request = {
    action: target === 'group' ? 'send_group_msg' : 'send_private_msg',
    params: target === 'group' ? { group_id: data.groupId, message: fileMsg } : { user_id: data.userId, message: fileMsg },
    echo
  };
  
  sentMsgCallbacks.set(echo, (messageId) => { log(`📤 文件发送成功 [mid:${messageId}]`); });
  ws.send(JSON.stringify(request));
  log(`📤 文件发送到 [${targetId}]`);
  fs.unlinkSync(filePath);
}

async function sendTextMessage(data, filePath) {
  const echo = `reply_${Date.now()}`;
  const request = {
    action: data.type === 'private' ? 'send_private_msg' : 'send_group_msg',
    params: data.type === 'private' ? { user_id: data.userId, message: data.message } : { group_id: data.groupId, message: data.message },
    echo
  };
  
  sentMsgCallbacks.set(echo, (messageId) => {
    const sentFile = path.join(INBOX, 'sent_' + echo + '.json');
    try {
      fs.writeFileSync(sentFile, JSON.stringify({
        type: 'sent', messageId, time: Date.now(), userId: data.userId, groupId: data.groupId, message: data.message
      }));
    } catch(e) {}
    log(`📤 发送成功 [mid:${messageId}]`);
  });
  
  ws.send(JSON.stringify(request));
  log(`📤 发送到 [${data.userId || data.groupId}]`);
  fs.unlinkSync(filePath);
}
