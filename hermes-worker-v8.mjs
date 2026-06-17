/**
 * Hermes Agent Worker v8
 * - 群聊：按群ID建会话，@时附带最近群聊记录
 * - 私聊：按用户ID建会话
 * - 3天超时淘汰
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const INBOX = 'C:/Users/27554/Desktop/QQBot/inbox';
const OUTBOX = 'C:/Users/27554/Desktop/QQBot/outbox';
const GROUP_HISTORY_DIR = 'C:/Users/27554/Desktop/QQBot/group_history';
const SESSIONS_FILE = 'C:/Users/27554/Desktop/QQBot/sessions.json';
const HERMES = 'C:/Users/27554/AppData/Roaming/cn.org.hermesagent.desktop/runtime/versions/0.16.0-cn.6/hermes-agent-cn-runtime-win32-x64.exe';

// 配置
const SESSION_EXPIRE_MS = 3 * 24 * 60 * 60 * 1000; // 3天
const MAX_HISTORY_LINES = 30; // @时附带最近30条群聊记录
const GROUP_PERSONA = `你正在一个QQ群里和大家一起聊天。规则：
- 保持自然、简洁，像普通群友一样
- 不要自称AI或Hermes Agent
- 回复要简短，不要长篇大论
- 如果问题不确定，就说不知道
- 下面是最近的群聊记录，你可以参考上下文来回复`;

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString('zh-CN')}] ${msg}`);
}

// ============ 初始化 ============

[INBOX, OUTBOX, GROUP_HISTORY_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ============ 群聊历史管理 ============

function getGroupHistoryFile(groupId) {
  return path.join(GROUP_HISTORY_DIR, `${groupId}.json`);
}

function loadGroupHistory(groupId) {
  const file = getGroupHistoryFile(groupId);
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
  } catch (e) {}
  return [];
}

function saveGroupHistory(groupId, history) {
  const file = getGroupHistoryFile(groupId);
  fs.writeFileSync(file, JSON.stringify(history, null, 2));
}

// 记录群聊消息（所有人的消息都记录）
function recordGroupMessage(groupId, userId, message, nickname) {
  const history = loadGroupHistory(groupId);
  history.push({
    time: Date.now(),
    userId: String(userId),
    nickname: nickname || String(userId),
    message: message
  });
  
  // 清理超过3天的消息
  const cutoff = Date.now() - SESSION_EXPIRE_MS;
  const filtered = history.filter(h => h.time > cutoff);
  
  saveGroupHistory(groupId, filtered);
}

// 获取最近群聊记录（用于上下文）
function getRecentGroupHistory(groupId) {
  const history = loadGroupHistory(groupId);
  const recent = history.slice(-MAX_HISTORY_LINES);
  
  if (recent.length === 0) return '';
  
  return recent.map(h => {
    const time = new Date(h.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    return `[${time}] ${h.nickname}: ${h.message}`;
  }).join('\n');
}

// ============ 会话管理 ============

function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
    }
  } catch (e) {}
  return {};
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

function getSessionId(key, sessions) {
  const session = sessions[key];
  if (!session) return null;
  
  if (Date.now() - session.lastUsed > SESSION_EXPIRE_MS) {
    delete sessions[key];
    return null;
  }
  
  return session.sessionId;
}

function updateSession(key, sessionId, sessions) {
  sessions[key] = {
    sessionId: sessionId,
    lastUsed: Date.now(),
    messageCount: (sessions[key]?.messageCount || 0) + 1
  };
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
        const line = lines[j];
        if (line.includes('────') || line.includes('Resume') || line.includes('Session:')) break;
        if (line) replyLines.push(line);
      }
      return replyLines.join('\n');
    }
  }
  
  const skipPatterns = [
    /^Query:/, /^Initializing/, /^Browser engine/, /^Install browser/,
    /^Session:/, /^Duration:/, /^Messages:/, /^Resume this/, /Auxiliary title/,
  ];
  
  return lines.filter(l => !skipPatterns.some(p => p.test(l)) && l.length > 1).join('\n');
}

// ============ 调用 Hermes ============

function callHermes(message, sessionKey, sessions, isGroup, groupId, nickname) {
  try {
    const model = isGroup ? 'mimo-v2.5' : 'mimo-v2.5-pro';
    const existingSessionId = getSessionId(sessionKey, sessions);
    
    // 构建完整消息
    let fullMessage = message;
    
    if (isGroup) {
      // 获取最近群聊记录
      const history = getRecentGroupHistory(groupId);
      if (history) {
        fullMessage = `${GROUP_PERSONA}\n\n最近群聊记录：\n${history}\n\n当前消息 [${nickname}]: ${message}`;
      } else {
        fullMessage = `${GROUP_PERSONA}\n\n当前消息 [${nickname}]: ${message}`;
      }
    }
    
    let cmd;
    if (existingSessionId) {
      log(`🔄 继续会话 ${existingSessionId} (模型: ${model})...`);
      cmd = `"${HERMES}" chat --resume ${existingSessionId} -m ${model} -q "${fullMessage.replace(/"/g, '\\"')}"`;
    } else {
      log(`🆕 创建新会话 (模型: ${model})...`);
      cmd = `"${HERMES}" chat -m ${model} -q "${fullMessage.replace(/"/g, '\\"')}"`;
    }
    
    const result = execSync(cmd, {
      encoding: 'utf-8',
      timeout: 120000,
      maxBuffer: 1024 * 1024,
      windowsHide: true
    });
    
    const sessionMatch = result.match(/Session:\s+([a-z0-9_]+)/);
    if (sessionMatch) {
      updateSession(sessionKey, sessionMatch[1], sessions);
      log(`📝 会话 ID: ${sessionMatch[1]}`);
    }
    
    let reply = extractReply(result);
    if (!reply) reply = '抱歉，没理解你的意思。';
    
    log(`💬 回复: ${reply.substring(0, 60)}...`);
    return reply;
    
  } catch (err) {
    log(`❌ 调用失败: ${err.message}`);
    
    if (err.message.includes('resume') || err.message.includes('session')) {
      delete sessions[sessionKey];
      saveSessions(sessions);
      return callHermes(message, sessionKey, sessions, isGroup, groupId, nickname);
    }
    
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
      
      const userId = String(data.userId);
      const isGroup = data.type === 'group';
      const isRecord = data.type === 'group_record';
      const groupId = data.groupId;
      const nickname = data.nickname || userId;
      
      // 群聊记录消息：只记录历史，不触发回复
      if (isRecord && groupId) {
        recordGroupMessage(groupId, userId, data.message, nickname);
        log(`📝 记录群聊 [${groupId}] [${nickname}]: ${data.message}`);
        try { fs.unlinkSync(filePath); } catch(e) {}
        continue;
      }
      
      // 群聊@消息：记录历史 + 触发回复
      if (isGroup && groupId) {
        recordGroupMessage(groupId, userId, data.message, nickname);
      }
      
      log(`📩 [${isGroup ? '群聊' : '私聊'}] [${nickname}]: ${data.message}`);
      
      // 群聊用 groupId 作为会话 key，私聊用 userId
      const sessionKey = isGroup ? `group_${groupId}` : userId;
      
      const reply = callHermes(data.message, sessionKey, sessions, isGroup, groupId, nickname);
      
      const outData = {
        type: data.type,
        userId: data.userId,
        groupId: data.groupId,
        message: reply
      };
      
      const outFile = path.join(OUTBOX, `reply_${Date.now()}.json`);
      fs.writeFileSync(outFile, JSON.stringify(outData, null, 2));
      log(`📤 回复已发送`);
      
      try { fs.unlinkSync(filePath); } catch(e) {}
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      log(`❌ 错误: ${err.message}`);
    }
  }
}

// ============ 清理过期历史 ============

function cleanExpiredHistory() {
  const cutoff = Date.now() - SESSION_EXPIRE_MS;
  
  try {
    const files = fs.readdirSync(GROUP_HISTORY_DIR);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const filePath = path.join(GROUP_HISTORY_DIR, file);
      const history = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const filtered = history.filter(h => h.time > cutoff);
      
      if (filtered.length === 0) {
        fs.unlinkSync(filePath);
        log(`🗑️ 清理过期群聊记录: ${file}`);
      } else if (filtered.length < history.length) {
        fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
        log(`🗑️ 清理过期消息: ${file} (${history.length} -> ${filtered.length})`);
      }
    }
  } catch (e) {}
}

// ============ 启动 ============

console.log('');
console.log('========================================');
console.log('   Hermes Agent Worker v8');
console.log('========================================');
console.log('');
console.log('配置:');
console.log('  私聊: mimo-v2.5-pro（按用户ID）');
console.log('  群聊: mimo-v2.5（按群ID，附带聊天记录）');
console.log('  超时: 3天自动淘汰');
console.log('');

const sessions = loadSessions();
const sessionCount = Object.keys(sessions).length;
if (sessionCount > 0) {
  log(`📋 已有 ${sessionCount} 个会话记录`);
}

// 每小时清理一次过期历史
setInterval(cleanExpiredHistory, 60 * 60 * 1000);
cleanExpiredHistory();

setInterval(processInbox, 1000);
log('👀 监听中...');
