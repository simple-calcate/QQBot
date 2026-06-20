/**
 * 消息处理 - 轮询 inbox 处理消息
 */
import fs from 'fs';
import path from 'path';
import { INBOX, OUTBOX, SENT_HISTORY_FILE, log } from './config.mjs';
import { loadSessions } from './session.mjs';
import { recordGroupMessage, markGroupAt } from './group-history.mjs';
import { callHermes } from './hermes.mjs';

function loadSentHistory() {
  try { return JSON.parse(fs.readFileSync(SENT_HISTORY_FILE, 'utf-8')); } catch { return {}; }
}

function saveSentHistory(history) {
  fs.writeFileSync(SENT_HISTORY_FILE, JSON.stringify(history, null, 2));
}

export function processInbox() {
  try {
    const files = fs.readdirSync(INBOX);
    const sessions = loadSessions();
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(INBOX, file);
      let data;
      try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch (e) {
        try { fs.unlinkSync(filePath); } catch(e) {}
        continue;
      }
      
      try { fs.unlinkSync(filePath); } catch(e) {}
      
      if (data.type === 'sent' && data.messageId) {
        const sent = loadSentHistory();
        sent[String(data.messageId)] = { time: data.time, userId: data.userId, groupId: data.groupId, message: data.message };
        const keys = Object.keys(sent);
        if (keys.length > 500) { keys.slice(0, keys.length - 500).forEach(k => delete sent[k]); }
        saveSentHistory(sent);
        continue;
      }
      
      const userId = String(data.userId);
      const isGroup = data.type === 'group';
      const isRecord = data.type === 'group_record';
      const groupId = data.groupId;
      const nickname = data.nickname || userId;
      
      if (isRecord && groupId) {
        recordGroupMessage(groupId, userId, data.message, nickname, data.messageId);
        continue;
      }
      
      if (isGroup && groupId) {
        markGroupAt(groupId);
      }
      
      log(`📩 [${isGroup ? '群' : '私聊'}] [${nickname}]: ${data.message || '[图片]'}`);
      
      const sessionKey = isGroup ? `group_${groupId}` : userId;
      const images = data.images || [];
      const reply = callHermes(data.message, sessionKey, sessions, isGroup, groupId, nickname, images);
      
      const mediaMatch = reply.match(/MEDIA:(.+)/);
      if (mediaMatch) {
        const mediaFilePath = mediaMatch[1].trim();
        if (fs.existsSync(mediaFilePath)) {
          const outFile = path.join(OUTBOX, `file_${Date.now()}.json`);
          fs.writeFileSync(outFile, JSON.stringify({
            kind: 'file', type: data.type, userId, groupId, filePath: mediaFilePath, fileName: path.basename(mediaFilePath)
          }));
          const textPart = reply.replace(/MEDIA:.+/, '').trim();
          if (textPart) {
            const textFile = path.join(OUTBOX, `reply_${Date.now()}.json`);
            fs.writeFileSync(textFile, JSON.stringify({ type: data.type, userId, groupId, message: textPart }));
          }
          log(`📎 已发送文件: ${path.basename(mediaFilePath)}`);
        } else {
          log(`❌ 文件不存在: ${mediaFilePath}`);
          const outFile = path.join(OUTBOX, `reply_${Date.now()}.json`);
          fs.writeFileSync(outFile, JSON.stringify({ type: data.type, userId, groupId, message: reply }));
        }
      } else {
        const outFile = path.join(OUTBOX, `reply_${Date.now()}.json`);
        fs.writeFileSync(outFile, JSON.stringify({ type: data.type, userId, groupId, message: reply }));
        log(`📤 已发送`);
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') log(`❌ ${err.message}`);
  }
}
