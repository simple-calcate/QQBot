/**
 * Hermes Agent Worker - 监听 inbox 并调用真正的 Hermes Agent
 * 从 inbox/ 读取消息 → 调用 Hermes → 写入 outbox/
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ============ 配置 ============
const INBOX = 'C:/Users/27554/Desktop/QQBot/inbox';
const OUTBOX = 'C:/Users/27554/Desktop/QQBot/outbox';
const HERMES_RUNTIME = 'C:/Users/27554/AppData/Roaming/cn.org.hermesagent.desktop/runtime/versions/0.16.0-cn.6/hermes-agent-cn-runtime-win32-x64.exe';
const HERMES_TIMEOUT = 120; // 秒
// ==============================

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString('zh-CN')}] ${msg}`);
}

// 确保目录存在
function ensureDirs() {
  [INBOX, OUTBOX].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`📁 创建目录: ${dir}`);
    }
  });
}

// 清除 ANSI 颜色码
function stripAnsi(str) {
  return str.replace(/\x1B\[[0-9;]*[mGKHFJ]/g, '').replace(/\r/g, '');
}

// 调用 Hermes Agent
function callHermes(message) {
  try {
    log(`🤖 调用 Hermes Agent...`);
    
    // 转义消息中的特殊字符
    const escapedMsg = message
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, ' ');
    
    const cmd = `"${HERMES_RUNTIME}" chat -q "${escapedMsg}"`;
    
    const result = execSync(cmd, {
      encoding: 'utf-8',
      timeout: HERMES_TIMEOUT * 1000,
      maxBuffer: 1024 * 1024,
      windowsHide: true
    });
    
    // 清除颜色码并分割行
    const cleanResult = stripAnsi(result);
    const lines = cleanResult.split('\n').map(l => l.trim()).filter(l => l);
    
    // 跳过系统信息，找到实际回复
    // Hermes 输出格式：
    // Query: xxx
    // Initializing agent...
    // ─  ⚕ Hermes  ─────
    //     回复内容
    // ─────────────────
    // Session: xxx
    
    let reply = '';
    let foundSeparator = false;
    
    for (const line of lines) {
      // 跳过系统行
      if (line.startsWith('Query:') ||
          line.startsWith('Initializing') ||
          line.startsWith('Browser engine') ||
          line.startsWith('Install browser') ||
          line.includes('────────────────') ||
          line.includes('⚕ Hermes') ||
          line.startsWith('Session:') ||
          line.startsWith('Duration:') ||
          line.startsWith('Messages:') ||
          line.startsWith('⚠ Auxiliary') ||
          line.startsWith('Resume this')) {
        continue;
      }
      
      // 找到分隔符后的内容就是回复
      if (foundSeparator) {
        reply = line;
        break;
      }
      
      // 检测分隔符
      if (line.includes('─') && line.includes('⚕')) {
        foundSeparator = true;
      }
    }
    
    // 如果没找到分隔符格式，取第一个非空非系统行
    if (!reply) {
      for (const line of lines) {
        if (line && 
            !line.startsWith('Query:') &&
            !line.startsWith('Initializing') &&
            !line.includes('────────────────') &&
            !line.includes('⚕ Hermes')) {
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
    return '抱歉，Hermes Agent 暂时无法响应。请稍后再试。';
  }
}

// 处理 inbox 中的消息
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
        log(`❌ 解析文件失败: ${file}`);
        fs.unlinkSync(filePath);
        continue;
      }
      
      log(`📩 处理消息 [${data.userId}]: ${data.message}`);
      
      // 调用 Hermes 获取回复
      const reply = callHermes(data.message);
      
      // 写入 outbox
      const outData = {
        type: data.type,
        userId: data.userId,
        groupId: data.groupId,
        message: reply
      };
      
      const outFile = path.join(OUTBOX, `reply_${Date.now()}.json`);
      fs.writeFileSync(outFile, JSON.stringify(outData, null, 2));
      
      log(`📤 回复已写入 outbox`);
      
      // 删除已处理的 inbox 文件
      try {
        fs.unlinkSync(filePath);
        log(`🗑️ 已删除 inbox 文件`);
      } catch (e) {
        // 文件可能已被删除
      }
    }
  } catch (err) {
    // 忽略目录不存在等错误
    if (err.code !== 'ENOENT') {
      log(`❌ 处理 inbox 失败: ${err.message}`);
    }
  }
}

// 主函数
function main() {
  console.log('');
  console.log('========================================');
  console.log('   Hermes Agent Worker');
  console.log('========================================');
  console.log('');
  console.log('配置:');
  console.log(`  Inbox: ${INBOX}`);
  console.log(`  Outbox: ${OUTBOX}`);
  console.log(`  Hermes: ${HERMES_RUNTIME}`);
  console.log('');
  console.log('功能:');
  console.log('  • 监听 inbox 目录');
  console.log('  • 调用 Hermes Agent 处理消息');
  console.log('  • 将回复写入 outbox 目录');
  console.log('');
  console.log('按 Ctrl+C 停止');
  console.log('========================================');
  console.log('');
  
  ensureDirs();
  
  // 每秒检查一次 inbox
  setInterval(processInbox, 1000);
  log('👀 开始监听 inbox...');
}

main();
