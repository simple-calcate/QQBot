/**
 * Hermes Agent 调用封装
 */
import { execSync } from 'child_process';
import { HERMES, HERMES_HOME, log } from './config.mjs';
import { getSessionId, updateSession, saveSessions } from './session.mjs';
import { getRecentGroupHistory } from './group-history.mjs';
import { extractReply } from './output.mjs';

export function callHermes(message, sessionKey, sessions, isGroup, groupId, nickname, images = []) {
  try {
    const existingSessionId = getSessionId(sessionKey, sessions);
    
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
    
    const result = execSync(cmd, { encoding: 'utf-8', timeout: 300000, maxBuffer: 1024 * 1024, windowsHide: true, env: { ...process.env, HERMES_HOME, PYTHONIOENCODING: 'utf-8', LANG: 'en_US.UTF-8', PYTHONUTF8: '1' } });
    
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
