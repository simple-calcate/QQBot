/**
 * 群聊历史记录管理
 */
import fs from 'fs';
import path from 'path';
import { GROUP_HISTORY_DIR, GROUP_AT_TIME_FILE, SESSION_EXPIRE_MS, MAX_HISTORY_LINES } from './config.mjs';

export function loadGroupAtTime() {
  try {
    if (fs.existsSync(GROUP_AT_TIME_FILE)) return JSON.parse(fs.readFileSync(GROUP_AT_TIME_FILE, 'utf-8'));
  } catch (e) {}
  return {};
}

export function saveGroupAtTime(atTime) {
  fs.writeFileSync(GROUP_AT_TIME_FILE, JSON.stringify(atTime, null, 2));
}

export function loadGroupHistory(groupId) {
  const file = path.join(GROUP_HISTORY_DIR, `${groupId}.json`);
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {}
  return [];
}

export function saveGroupHistory(groupId, history) {
  fs.writeFileSync(path.join(GROUP_HISTORY_DIR, `${groupId}.json`), JSON.stringify(history, null, 2));
}

export function recordGroupMessage(groupId, userId, message, nickname, messageId) {
  const history = loadGroupHistory(groupId);
  const entry = { time: Date.now(), userId: String(userId), nickname: nickname || String(userId), message };
  if (messageId) entry.messageId = messageId;
  history.push(entry);
  saveGroupHistory(groupId, history.filter(h => h.time > Date.now() - SESSION_EXPIRE_MS));
}

export function getRecentGroupHistory(groupId) {
  const history = loadGroupHistory(groupId);
  const atTime = loadGroupAtTime();
  const lastAt = atTime[groupId] || 0;
  const recent = history.filter(h => h.time > lastAt).slice(-MAX_HISTORY_LINES);
  if (recent.length === 0) return '';
  return recent.map(h => {
    const time = new Date(h.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const mid = h.messageId ? `[mid:${h.messageId}]` : '';
    return `[${time}]${h.nickname}: ${h.message}${mid}`;
  }).join(' | ');
}

export function markGroupAt(groupId) {
  const atTime = loadGroupAtTime();
  atTime[groupId] = Date.now();
  saveGroupAtTime(atTime);
}
