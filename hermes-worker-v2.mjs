/**
 * Hermes Agent Worker v2 - 正确解析 Hermes 输出
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const INBOX = 'C:/Users/27554/Desktop/QQBot/inbox';
const OUTBOX = 'C:/Users/27554/Desktop/QQBot/outbox';
const HERMES = 'C:/Users/27554/AppData/Roaming/cn.org.hermesagent.desktop/runtime/versions/0.16.0-cn.6/hermes-agent-cn-runtime-win32-x64.exe';

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString('zh-CN')}] ${msg}`);
}

function stripAnsi(str) {
  // 移除所有 ANSI 转义序列
  return str
    .replace(/\x1B\[[0-9;]*[mGKHFJ]/g, '')
    .replace(/\x1B\[[0-9;]*[~]/g, '')
    .replace(/\x1B\].*?\x07/g, '')
    .replace(/\r/g, '')
    .replace(/[\u2500-\u257F]/g, '-') // 替换方框绘制字符
    .replace(/[\u2800-\u28FF]/g, ''); // 替换盲文字符
}

function callHermes(message) {
  try {
    log(`🤖 调用 Hermes Agent...`);
    
    const escapedMsg = message.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const cmd = `"${HERMES}" chat -q "${escapedMsg}"`;
    
    const result = execSync(cmd, {
      encoding: 'utf-8',
      timeout: 120000,
      maxBuffer: 1024 * 1024,
      windowsHide: true
    });
    
    const clean = stripAnsi(result);
    const lines = clean.split('\n').map(l => l.trim()).filter(l => l);
    
    // 查找回复内容
    // 格式: 在 "Hermes" 标题行之后，分隔线之前的内容
    let reply = '';
    let foundHeader = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 跳过系统行
      if (line.startsWith('Query:') ||
          line.startsWith('Initializing') ||
          line.startsWith('Browser engine') ||
          line.startsWith('Install browser') ||
          line.startsWith('Session:') ||
          line.startsWith('Duration:') ||
          line.startsWith('Messages:') ||
          line.startsWith('Resume this') ||
          line.includes('Auxiliary title')) {
        continue;
      }
      
      // 找到 Hermes 标题
      if (line.includes('Hermes') && line.includes('-')) {
        foundHeader = true;
        continue;
      }
      
      // 标题后的内容就是回复
      if (foundHeader && line && !line.includes('---')) {
        reply = line;
        break;
      }
    }
    
    // 备用方案：找第一个看起来像回复的行
    if (!reply) {
      for (const line of lines) {
        if (line && 
            !line.startsWith('Query:') &&
            !line.startsWith('Initializing') &&
            !line.startsWith('Browser') &&
            !line.startsWith('Session:') &&
            !line.includes('---') &&
            !line.includes('Hermes') &&
            line.length > 2) {
          reply = line;
          break;
        }
      }
    }
    
    if (!reply) {
      reply = '抱歉，我没有理解你的意思。';
    }
    
    log(`💬 回复: ${reply.substring(0, 80)}...`);
    return reply;
    
  } catch (err) {
    log(`❌ Hermes 调用失败: ${err.message}`);
    return '抱歉，Hermes Agent 暂时无法响应。';
  }
}

function processInbox() {
  try {
    const files = fs.readdirSync(INBOX);
    
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
      
      log(`📩 [${data.userId}]: ${data.message}`);
      
      const reply = callHermes(data.message);
      
      const outData = {
        type: data.type,
        userId: data.userId,
        groupId: data.groupId,
        message: reply
      };
      
      const outFile = path.join(OUTBOX, `reply_${Date.now()}.json`);
      fs.writeFileSync(outFile, JSON.stringify(outData, null, 2));
      log(`📤 回复已写入`);
      
      try { fs.unlinkSync(filePath); } catch(e) {}
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      log(`❌ 错误: ${err.message}`);
    }
  }
}

// 启动
console.log('');
console.log('========================================');
console.log('   Hermes Agent Worker v2');
console.log('========================================');
console.log('');

[INBOX, OUTBOX].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

setInterval(processInbox, 1000);
log('👀 监听中...');
