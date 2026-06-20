/**
 * 会话管理
 */
import fs from 'fs';
import { SESSIONS_FILE, SESSION_EXPIRE_MS } from './config.mjs';

export function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
  } catch (e) {}
  return {};
}

export function saveSessions(sessions) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

export function getSessionId(key, sessions) {
  const session = sessions[key];
  if (!session) return null;
  if (Date.now() - session.lastUsed > SESSION_EXPIRE_MS) { delete sessions[key]; return null; }
  return session.sessionId;
}

export function updateSession(key, sessionId, sessions) {
  sessions[key] = { sessionId, lastUsed: Date.now(), messageCount: (sessions[key]?.messageCount || 0) + 1 };
  saveSessions(sessions);
}
