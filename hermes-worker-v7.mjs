/**
 * Hermes Agent Worker v7 - 群聊使用 v2.5，私聊使用 v2.5-pro
 * 群聊人设：谨慎、简洁
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const INBOX = 'C:/Users/27554/Desktop/QQBot/inbox';
const OUTBOX = 'C:/Users/27554/Desktop/QQBot/outbox';
const SESSIONS_FILE = 'C:/Users/27554/Desktop/QQBot/sessions.json';
const HERMES = 'C:/Users/27554/AppData/Roaming/cn.org.hermesagent.desktop/runtime/versions/0.16.0-cn.6/hermes-agent-cn-runtime-win32-x64.exe';

const SESSION_EXPIRE_MS = 24 * 60 * 60 * 1000;

// 群聊人设前缀（谨慎、简洁）
const GROUP_PERSONA = '[群聊模式] 你正在 QQ 群里与多人对话。请保持谨慎、简洁，不要透露过多个人信息或系统细节。回复要简短自然，像普通群友一样交流。不要提及你是 AI 或 Hermes Agent。';

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString('zh-CN')}] ${msg}`);
}

// ============ 会话管理 ============

function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
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
  
  if (Date.now() - session.lastUsed > SESSION_EXPIRE_MS) {
    log(`⏰ 用户 ${userId} 会话已过期`);
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

function callHermes(message, userId, sessions, isGroup) {
  try {
    const existingSessionId = getSessionId(userId, sessions);
    
    // 根据群聊/私聊选择模型和人设
    const model = isGroup ? 'mimo-v2.5' : 'mimo-v2.5-pro';
    const finalMessage = isGroup ? `${GROUP_PERSONA}\n\n用户消息：${message}` : message;
    
    let cmd;
    if (existingSessionId) {
      log(`🔄 继续会话 ${existingSessionId} (模型: ${model})...`);
      cmd = `"${HERMES}" chat --resume ${existingSessionId} -m ${model} -q "${finalMessage.replace(/"/g, '\\"')}"`;
    } else {
      log(`🆕 创建新会话 (模型: ${model})...`);
      cmd = `"${HERMES}" chat -m ${model} -q "${finalMessage.replace(/"/g, '\\"')}"`;
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
    
    if (err.message.includes('resume') || err.message.includes('session')) {
      log(`⚠ 会话可能已失效，创建新会话...`);
      delete sessions[userId];
      saveSessions(sessions);
      return callHermes(message, userId, sessions, isGroup);
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
        log(`❌ 解析失败: ${file}`);
        try { fs.unlinkSync(filePath); } catch(e) {}
        continue;
      }
      
      const userId = String(data.userId);
      const isGroup = data.type === 'group';
      
      log(`📩 [${isGroup ? '群聊' : '私聊'}] [${userId}]: ${data.message}`);
      
      const reply = callHermes(data.message, userId, sessions, isGroup);
      
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
console.log('   Hermes Agent Worker v7');
console.log('========================================');
console.log('');
console.log('配置:');
console.log('  私聊: mimo-v2.5-pro（完整功能）');
console.log('  群聊: mimo-v2.5（谨慎人设）');
console.log('');

[INBOX, OUTBOX].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const sessions = loadSessions();
const sessionCount = Object.keys(sessions).length;
if (sessionCount > 0) {
  log(`📋 已有 ${sessionCount} 个用户会话记录`);
}

setInterval(processInbox, 1000);
log('👀 监听中...');
