/**
 * Worker 配置常量
 */
import fs from 'fs';

export const INBOX = 'C:/Users/27554/Desktop/QQBot/inbox';
export const OUTBOX = 'C:/Users/27554/Desktop/QQBot/outbox';
export const GROUP_HISTORY_DIR = 'C:/Users/27554/Desktop/QQBot/group_history';
export const GROUP_AT_TIME_FILE = 'C:/Users/27554/Desktop/QQBot/group_at_time.json';
export const SENT_HISTORY_FILE = 'C:/Users/27554/Desktop/QQBot/sent_history.json';
export const SESSIONS_FILE = 'C:/Users/27554/Desktop/QQBot/sessions.json';

export const HERMES = 'C:/Users/27554/AppData/Roaming/cn.org.hermesagent.desktop/runtime/versions/0.16.0-cn.6/hermes-agent-cn-runtime-win32-x64.exe';
export const HERMES_HOME = 'C:/Users/27554/AppData/Roaming/cn.org.hermesagent.desktop/runtime/hermes-home';

export const SESSION_EXPIRE_MS = 3 * 24 * 60 * 60 * 1000;
export const MAX_HISTORY_LINES = 30;

export function log(msg) {
  console.log(`[${new Date().toLocaleTimeString('zh-CN')}] ${msg}`);
}

export function ensureDirs() {
  [INBOX, OUTBOX, GROUP_HISTORY_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}
