/**
 * WebSocket 连接管理
 */
import WebSocket from 'ws';
import { SNOWLUMA_WS, WS_TOKEN, log } from './config.mjs';

export let ws = null;
export const sentMsgCallbacks = new Map();

export function connect(onMessage) {
  ws = new WebSocket(SNOWLUMA_WS, {
    headers: { 'Authorization': `Bearer ${WS_TOKEN}` }
  });
  
  ws.on('open', () => {
    log('✅ 已连接 SnowLuma');
    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'get_status' }));
      }
    }, 30000);
  });
  
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.post_type === 'message') { onMessage(msg); return; }
      if (msg.echo && msg.status === 'ok' && msg.data && msg.data.message_id) {
        const cb = sentMsgCallbacks.get(msg.echo);
        if (cb) { cb(msg.data.message_id); sentMsgCallbacks.delete(msg.echo); }
      }
    } catch (e) {}
  });
  
  ws.on('close', () => {
    log('❌ 断开，5秒后重连...');
    setTimeout(() => connect(onMessage), 5000);
  });
  
  ws.on('error', (err) => log(`❌ ${err.message}`));
}
