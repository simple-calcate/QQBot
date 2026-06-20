/**
 * Hermes Agent Worker v11 - 主入口
 */
import { ensureDirs, log } from './worker/config.mjs';
import { loadSessions } from './worker/session.mjs';
import { processInbox } from './worker/inbox.mjs';

ensureDirs();

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
