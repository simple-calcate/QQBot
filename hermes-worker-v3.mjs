/**
 * Hermes Agent Worker v3 - 完美清理输出
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

function cleanOutput(str) {
  return str
    // 移除所有 ANSI 转义序列 (颜色、光标等)
    .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/\x1B\[[0-9;]*~]/g, '')
    .replace(/\x1B\][^\x07\x1B]*(\x07|\x1B\\)/g, '')
    // 移除 UTF-8 方框绘制字符
    .replace(/[─━│┃┄┅┆┇┈┉┊┋┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┳┼┽┾┿╀╁╂╃╄╅╆╇═══║╔╗╚╝╠╣╦╩╬]/g, '')
    // 移除盲文点阵字符 (用于绘制线条)
    .replace(/[\u2800-\u28FF]/g, '')
    // 移除其他可能的特殊字符
    .replace(/[\u2500-\u257F]/g, '')
    .replace(/[\u2580-\u259F]/g, '')
    .replace(/[\u25A0-\u25FF]/g, '')
    // 清理多余空格和换行
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

function callHermes(message) {
  try {
    log(`🤖 调用 Hermes...`);
    
    const escapedMsg = message.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const cmd = `"${HERMES}" chat -q "${escapedMsg}"`;
    
    const result = execSync(cmd, {
      encoding: 'utf-8',
      timeout: 120000,
      maxBuffer: 1024 * 1024,
      windowsHide: true
    });
    
    const clean = cleanOutput(result);
    const lines = clean.split('\n').map(l => l.trim()).filter(l => l);
    
    // 需要过滤的系统行
    const skipPatterns = [
      /^Query:/,
      /^Initializing/,
      /^Browser engine/,
      /^Install browser/,
      /^Session:/,
      /^Duration:/,
      /^Messages:/,
      /^Resume this/,
      /Auxiliary title/,
      /^───/,
      /^── /,
      /^  hermes /,
      /^\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,  // 时间戳
      /^$/,  // 空行
    ];
    
    // 找到回复内容
    let reply = '';
    let foundHermesHeader = false;
    
    for (const line of lines) {
      // 跳过系统行
      if (skipPatterns.some(p => p.test(line))) {
        continue;
      }
      
      // 找到 Hermes 标题行
      if (line.includes('Hermes') && line.length < 50) {
        foundHermesHeader = true;
        continue;
      }
      
      // 标题后的第一个非空行就是回复
      if (foundHermesHeader) {
        reply = line;
        break;
      }
    }
    
    // 备用方案
    if (!reply) {
      for (const line of lines) {
        if (!skipPatterns.some(p => p.test(line)) && line.length > 1) {
          reply = line;
          break;
        }
      }
    }
    
    if (!reply) {
      reply = '抱歉，我没有理解你的意思。';
    }
    
    // 最终清理
    reply = cleanOutput(reply);
    
    log(`💬 回复: ${reply.substring(0, 60)}...`);
    return reply;
    
  } catch (err) {
    log(`❌ 调用失败: ${err.message}`);
    return '抱歉，Hermes 暂时无法响应。';
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
      log(`📤 回复已发送`);
      
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
console.log('   Hermes Agent Worker v3');
console.log('========================================');
console.log('');

[INBOX, OUTBOX].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

setInterval(processInbox, 1000);
log('👀 监听中...');
