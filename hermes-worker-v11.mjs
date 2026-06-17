/**
 * Hermes Agent Worker v11 - 修复群聊消息格式
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const INBOX = 'C:/Users/27554/Desktop/QQBot/inbox';
const OUTBOX = 'C:/Users/27554/Desktop/QQBot/outbox';
const GROUP_HISTORY_DIR = 'C:/Users/27554/Desktop/QQBot/group_history';
const SESSIONS_FILE = 'C:/Users/27554/Desktop/QQBot/sessions.json';
const HERMES = 'C:/Users/27554/AppData/Roaming/cn.org.hermesagent.desktop/runtime/versions/0.16.0-cn.6/hermes-agent-cn-runtime-win32-x64.exe';

const SESSION_EXPIRE_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_HISTORY_LINES = 30;

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString('zh-CN')}] ${msg}`);
}

[INBOX, OUTBOX, GROUP_HISTORY_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ============ 群聊历史 ============

// 记录每个群上次@的时间点
const GROUP_AT_TIME_FILE = 'C:/Users/27554/Desktop/QQBot/group_at_time.json';

function loadGroupAtTime() {
  try {
    if (fs.existsSync(GROUP_AT_TIME_FILE)) return JSON.parse(fs.readFileSync(GROUP_AT_TIME_FILE, 'utf-8'));
  } catch (e) {}
  return {};
}

function saveGroupAtTime(atTime) {
  fs.writeFileSync(GROUP_AT_TIME_FILE, JSON.stringify(atTime, null, 2));
}

function loadGroupHistory(groupId) {
  const file = path.join(GROUP_HISTORY_DIR, `${groupId}.json`);
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {}
  return [];
}

function saveGroupHistory(groupId, history) {
  fs.writeFileSync(path.join(GROUP_HISTORY_DIR, `${groupId}.json`), JSON.stringify(history, null, 2));
}

function recordGroupMessage(groupId, userId, message, nickname) {
  const history = loadGroupHistory(groupId);
  history.push({ time: Date.now(), userId: String(userId), nickname: nickname || String(userId), message });
  saveGroupHistory(groupId, history.filter(h => h.time > Date.now() - SESSION_EXPIRE_MS));
}

function getRecentGroupHistory(groupId) {
  const history = loadGroupHistory(groupId);
  const atTime = loadGroupAtTime();
  const lastAt = atTime[groupId] || 0;
  // 只取上次@之后的新消息
  const recent = history.filter(h => h.time > lastAt).slice(-MAX_HISTORY_LINES);
  if (recent.length === 0) return '';
  return recent.map(h => {
    const time = new Date(h.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    return `[${time}]${h.nickname}: ${h.message}`;
  }).join(' | ');
}

function markGroupAt(groupId) {
  const atTime = loadGroupAtTime();
  atTime[groupId] = Date.now();
  saveGroupAtTime(atTime);
}

// ============ 会话管理 ============

function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
  } catch (e) {}
  return {};
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

function getSessionId(key, sessions) {
  const session = sessions[key];
  if (!session) return null;
  if (Date.now() - session.lastUsed > SESSION_EXPIRE_MS) { delete sessions[key]; return null; }
  return session.sessionId;
}

function updateSession(key, sessionId, sessions) {
  sessions[key] = { sessionId, lastUsed: Date.now(), messageCount: (sessions[key]?.messageCount || 0) + 1 };
  saveSessions(sessions);
}

// ============ 输出清理 ============

function cleanOutput(str) {
  return str
    .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/\x1B\][^\x07\x1B]*(\x07|\x1B\\)/g, '')
    .replace(/[─━│┃┄┅┆┇┈┉┊┋┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┳┼┽┾┿╀╁╂╃╄╅╆╇═══║╔╗╚╝╠╣╦╩╬]/g, '')
    .replace(/[\u2800-\u28FF]/g, '')
    .replace(/[\u2500-\u257F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

function extractReply(output) {
  const clean = cleanOutput(output);
  const lines = clean.split('\n').map(l => l.trim()).filter(l => l);
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Hermes') && lines[i].includes('⚕')) {
      let replyLines = [];
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].includes('────') || lines[j].includes('Resume') || lines[j].includes('Session:')) break;
        if (lines[j]) replyLines.push(lines[j]);
      }
      return replyLines.join('\n');
    }
  }
  
  const skip = [/^Query:/, /^Initializing/, /^Browser engine/, /^Install browser/, /^Session:/, /^Duration:/, /^Messages:/, /^Resume this/, /Auxiliary title/];
  return lines.filter(l => !skip.some(p => p.test(l)) && l.length > 1).join('\n');
}

// ============ 调用 Hermes ============

function callHermes(message, sessionKey, sessions, isGroup, groupId, nickname, images = []) {
  try {
    const model = 'mimo-v2.5';
    const existingSessionId = getSessionId(sessionKey, sessions);
    
    // 构建消息：群聊附带历史
    let fullMessage;
    if (isGroup) {
      const history = getRecentGroupHistory(groupId);
      if (history) {
        fullMessage = `[群聊上下文] ${history} | [用户消息] ${nickname}: ${message}`;
      } else {
        fullMessage = message;
      }
    } else {
      fullMessage = message;
    }
    
    // 图片参数
    const imageArgs = images.map(img => `--image "${img}"`).join(' ');
    
    let cmd;
    if (existingSessionId) {
      log(`🔄 继续 ${existingSessionId}`);
      cmd = `"${HERMES}" chat --resume ${existingSessionId} --profile qqbot -q "${fullMessage.replace(/"/g, '\\"')}" ${imageArgs}`;
    } else {
      log(`🆕 新会话`);
      cmd = `"${HERMES}" chat --profile qqbot -q "${fullMessage.replace(/"/g, '\\"')}" ${imageArgs}`;
    }
    log(`🔧 CMD: ${cmd.substring(0, 100)}...`);
    
    const result = execSync(cmd, { encoding: 'utf-8', timeout: 300000, maxBuffer: 1024 * 1024, windowsHide: true, env: { ...process.env, HERMES_HOME: 'C:/Users/27554/AppData/Roaming/cn.org.hermesagent.desktop/runtime/hermes-home' } });
    
    // 检查会话是否失效
    if (result.includes('Session not found')) {
      log(`⚠️ 会话 ${existingSessionId} 已失效，创建新会话`);
      delete sessions[sessionKey];
      saveSessions(sessions);
      return callHermes(message, sessionKey, sessions, isGroup, groupId, nickname, images);
    }
    
    const sessionMatch = result.match(/Session:\s+([a-z0-9_]+)/);
    if (sessionMatch) {
      updateSession(sessionKey, sessionMatch[1], sessions);
      log(`📝 ${sessionMatch[1]}`);
    }
    
    let reply = extractReply(result);
    if (!reply) reply = '抱歉，没理解你的意思。';
    
    log(`💬 ${reply.substring(0, 50)}...`);
    return reply;
    
  } catch (err) {
    log(`❌ ${err.message}`);
    if (err.message.includes('resume') || err.message.includes('session')) {
      delete sessions[sessionKey];
      saveSessions(sessions);
      return callHermes(message, sessionKey, sessions, isGroup, groupId, nickname, images);
    }
    log(`❌ stderr: ${err.stderr ? err.stderr.substring(0, 200) : "none"}`);
    return '抱歉，暂时无法响应。';
  }
}

// ============ 消息处理 ============

function processInbox() {
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
      
      // 立即删除，防止重复处理
      try { fs.unlinkSync(filePath); } catch(e) {}
      
      const userId = String(data.userId);
      const isGroup = data.type === 'group';
      const isRecord = data.type === 'group_record';
      const groupId = data.groupId;
      const nickname = data.nickname || userId;
      
      // 只记录历史
      if (isRecord && groupId) {
        recordGroupMessage(groupId, userId, data.message, nickname);
        try { fs.unlinkSync(filePath); } catch(e) {}
        continue;
      }
      
      // 群聊@消息（bridge已记录group_record，此处不再重复记录）
      if (isGroup && groupId) {
        markGroupAt(groupId);
      }
      
      log(`📩 [${isGroup ? '群' : '私聊'}] [${nickname}]: ${data.message || '[图片]'}`);
      
      const sessionKey = isGroup ? `group_${groupId}` : userId;
      const images = data.images || [];
      const reply = callHermes(data.message, sessionKey, sessions, isGroup, groupId, nickname, images);
      
      const outFile = path.join(OUTBOX, `reply_${Date.now()}.json`);
      fs.writeFileSync(outFile, JSON.stringify({ type: data.type, userId, groupId, message: reply }));
      log(`📤 已发送`);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') log(`❌ ${err.message}`);
  }
}

// ============ 启动 ============

console.log('');
console.log('========================================');
console.log('   Hermes Agent Worker v11');
console.log('========================================');
console.log('');

const sessions = loadSessions();
const count = Object.keys(sessions).length;
if (count > 0) log(`📋 ${count} 个会话`);

setInterval(processInbox, 1000);
log('👀 监听中...');
