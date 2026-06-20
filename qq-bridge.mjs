/**
 * QQ Bridge - 主入口
 */
import { log } from './bridge/config.mjs';
import { connect } from './bridge/websocket.mjs';
import { handleMessage } from './bridge/handler.mjs';
import { pollOutbox } from './bridge/outbox.mjs';

log('🚀 QQ 桥接启动');
log(`📌 机器人昵称: 11`);
connect(handleMessage);
pollOutbox();
