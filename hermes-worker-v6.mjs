/**
 * Hermes Agent Worker v6 - 支持上下文记忆
 * 每个 QQ 用户独立会话，机器人能记住之前的对话
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const INBOX = 'C:/Users/27554/Desktop/QQBot/inbox';
const OUTBOX = 'C:/Users/27554/Desktop/QQBot/outbox';
const SESSIONS_FILE = 'C:/Users/27554/Desktop/QQBot/sessions.json';
const HERMES = 'C:/Users/27554/AppData/Roaming/cn.org.hermesagent.desktop/runtime/versions/0.16.0-cn.6/hermes-agent-cn-runtime-win32-x64.exe';

// 会话过期时间（24小时）
const SESSION_EXPIRE_MS = 24 * 60 * 60 * 1000;

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString('zh-CN')}] ${msg}`);
}

// ============ 会话管理 ============

function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      return data;
    }
  } catch (e) {
    log(`⚠ 加载会话记录失败: ${e.message}`);
  }
  return {};
}

function saveSessions(sessions) {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  } catch (e) {
    log(`⚠ 保存会话记录失败: ${e.message}`);
  }
}

function getSessionId(userId, sessions) {
  const session = sessions[userId];
  if (!session) return null;
  
  // 检查是否过期
  if (Date.now() - session.lastUsed > SESSION_EXPIRE_MS) {
    log(`⏰ 用户 ${userId} 会话已过期，将创建新会话`);
    delete sessions[userId];
    return null;
  }
  
  return session.sessionId;
}

function updateSession(userId, sessionId, sessions) {
  sessions[userId] = {
    sessionId: sessionId,
    lastUsed: Date.now(),
    messageCount: (sessions[userId]?.messageCount || 0) + 1
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
  
  // 找到 ⚕ Hermes 标题行
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Hermes') && lines[i].includes('⚕')) {
      let replyLines = [];
      for (let j = i + 1; j < lines.length; j++) {
        const line = lines[j];
        if (line.includes('────') || line.includes('Resume') || line.includes('Session:')) {
          break;
        }
        if (line) {
          replyLines.push(line);
        }
      }
      return replyLines.join('\n');
    }
  }
  
  // 备用方案
  const skipPatterns = [
    /^Query:/, /^Initializing/, /^Browser engine/, /^Install browser/,
    /^Session:/, /^Duration:/, /^Messages:/, /^Resume this/, /Auxiliary title/,
  ];
  
  let replyLines = [];
  for (const line of lines) {
    if (!skipPatterns.some(p => p.test(line)) && line.length > 1) {
      replyLines.push(line);
    }
  }
  return replyLines.join('\n');
}

// ============ 调用 Hermes ============

function callHermes(message, userId, sessions) {
  try {
    const existingSessionId = getSessionId(userId, sessions);
    
    let cmd;
    if (existingSessionId) {
      log(`🔄 继续会话 ${existingSessionId}...`);
      cmd = `"${HERMES}" chat --resume ${existingSessionId} -q "${message.replace(/"/g, '\\"')}"`;
    } else {
      log(`🆕 创建新会话...`);
      cmd = `"${HERMES}" chat -q "${message.replace(/"/g, '\\"')}"`;
    }
    
    const result = execSync(cmd, {
      encoding: 'utf-8',
      timeout: 120000,
      maxBuffer: 1024 * 1024,
      windowsHide: true
    });
    
    // 提取 session ID
    const sessionMatch = result.match(/Session:\s+([a-z0-9_]+)/);
    if (sessionMatch) {
      const sessionId = sessionMatch[1];
      updateSession(userId, sessionId, sessions);
      log(`📝 会话 ID: ${sessionId}`);
    }
    
    // 提取回复
    let reply = extractReply(result);
    if (!reply) {
      reply = '抱歉，我没有理解你的意思。';
    }
    
    log(`💬 回复: ${reply.substring(0, 60)}...`);
    return reply;
    
  } catch (err) {
    log(`❌ 调用失败: ${err.message}`);
    
    // 如果 resume 失败，尝试新会话
    if (err.message.includes('resume') || err.message.includes('session')) {
      log(`⚠ 会话可能已失效，创建新会话...`);
      delete sessions[userId];
      saveSessions(sessions);
      return callHermes(message, userId, sessions);
    }
    
    return '抱歉，Hermes 暂时无法响应。';
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
        log(`❌ 解析失败: ${file}`);
        try { fs.unlinkSync(filePath); } catch(e) {}
        continue;
      }
      
      const userId = String(data.userId);
      log(`📩 [${userId}]: ${data.message}`);
      
      const reply = callHermes(data.message, userId, sessions);
      
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

// ============ 启动 ============

console.log('');
console.log('========================================');
console.log('   Hermes Agent Worker v6');
console.log('   (支持上下文记忆)');
console.log('========================================');
console.log('');
console.log('特性:');
console.log('  ✅ 每个 QQ 用户独立会话');
console.log('  ✅ 机器人记住之前的对话');
console.log('  ✅ 24小时后自动过期');
console.log('');

[INBOX, OUTBOX].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 启动时显示已有会话数
const sessions = loadSessions();
const sessionCount = Object.keys(sessions).length;
if (sessionCount > 0) {
  log(`📋 已有 ${sessionCount} 个用户会话记录`);
}

setInterval(processInbox, 1000);
log('👀 监听中...');
