/**
 * Hermes Agent Worker - 真正能干活的版本
 * 可以执行命令、读写文件、搜索信息
 */

import http from 'http';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const PORT = 5001;
const WORK_DIR = 'C:/Users/27554/Desktop';

// 日志
function log(msg) {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

// 执行系统命令
function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    log(`执行命令: ${cmd}`);
    exec(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        resolve(`❌ 命令执行失败:\n${stderr || err.message}`);
      } else {
        resolve(stdout || '✅ 命令执行成功（无输出）');
      }
    });
  });
}

// 读取文件
function readFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return `📄 文件内容 (${filePath}):\n\n${content}`;
  } catch (err) {
    return `❌ 读取文件失败: ${err.message}`;
  }
}

// 写入文件
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return `✅ 文件已保存: ${filePath}`;
  } catch (err) {
    return `❌ 写入文件失败: ${err.message}`;
  }
}

// 列出目录
function listDir(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    const result = items.map(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      return stat.isDirectory() ? `📁 ${item}/` : `📄 ${item}`;
    });
    return `📂 目录内容 (${dirPath}):\n\n${result.join('\n')}`;
  } catch (err) {
    return `❌ 列出目录失败: ${err.message}`;
  }
}

// 获取系统信息
function getSystemInfo() {
  const info = {
    主机名: os.hostname(),
    系统: `${os.type()} ${os.release()}`,
    架构: os.arch(),
    CPU: `${os.cpus()[0].model} (${os.cpus().length} 核)`,
    内存: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`,
    空闲内存: `${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`,
    运行时间: `${Math.round(os.uptime() / 3600)} 小时`,
    当前目录: process.cwd(),
  };
  
  return Object.entries(info).map(([k, v]) => `${k}: ${v}`).join('\n');
}

// 处理消息
async function processMessage(message) {
  const msg = message.trim();
  
  // 帮助信息
  if (msg === '帮助' || msg === 'help' || msg === '功能' || msg === '?') {
    return `🤖 Hermes Agent 功能列表

📋 系统命令:
• 执行 <命令> - 执行系统命令
• 系统信息 - 查看系统状态
• 当前目录 - 查看当前工作目录

📁 文件操作:
• 读取 <文件路径> - 读取文件内容
• 写入 <文件路径> <内容> - 写入文件
• 列出 <目录路径> - 列出目录内容
• 列出 - 列出桌面目录

💬 其他:
• 帮助 - 显示此帮助信息
• 清空历史 - 清空对话历史

示例:
• 执行 dir
• 执行 ipconfig
• 读取 C:\test.txt
• 列出 C:/Users/27554/Desktop`;
  }
  
  // 执行命令
  if (msg.startsWith('执行 ') || msg.startsWith('exec ') || msg.startsWith('run ')) {
    const cmd = msg.replace(/^(执行s+|execs+|runs+)/, '').trim();
    return await runCommand(cmd);
  }
  
  // 系统信息
  if (msg === '系统信息' || msg === '系统' || msg === 'info' || msg === 'sysinfo') {
    return `💻 系统信息\n\n${getSystemInfo()}`;
  }
  
  // 当前目录
  if (msg === '当前目录' || msg === 'cwd' || msg === 'pwd') {
    return `📂 当前工作目录: ${process.cwd()}`;
  }
  
  // 读取文件
  if (msg.startsWith('读取 ') || msg.startsWith('read ')) {
    const filePath = msg.substring(3).trim();
    return readFile(filePath);
  }
  
  // 写入文件
  if (msg.startsWith('写入 ')) {
    const parts = msg.substring(3).trim().split(' ');
    if (parts.length < 2) {
      return '❌ 格式: 写入 <文件路径> <内容>';
    }
    const filePath = parts[0];
    const content = parts.slice(1).join(' ');
    return writeFile(filePath, content);
  }
  
  // 列出目录
  if (msg.startsWith('列出') || msg.startsWith('list') || msg.startsWith('ls')) {
    const dirPath = msg.substring(2).trim() || WORK_DIR;
    return listDir(dirPath);
  }
  
  // 默认回复
  return `收到: "${msg}"\n\n输入"帮助"查看可用功能`;
}

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString('utf-8');
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const message = data.message || '';
        const userId = data.user_id || 'unknown';
        
        log(`📩 用户 ${userId}: ${message}`);
        
        const reply = await processMessage(message);
        
        log(`📤 回复: ${reply.substring(0, 50)}...`);
        
        res.writeHead(200);
        res.end(JSON.stringify({ reply: reply }));
        
      } catch (err) {
        log(`❌ 错误: ${err.message}`);
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log('========================================');
  console.log('   🤖 Hermes Agent Worker');
  console.log('========================================');
  console.log(`✅ 服务已启动: http://127.0.0.1:${PORT}`);
  console.log('');
  console.log('功能:');
  console.log('  • 执行系统命令');
  console.log('  • 读写文件');
  console.log('  • 列出目录');
  console.log('  • 系统信息');
  console.log('');
  console.log('按 Ctrl+C 停止');
  console.log('========================================');
});
