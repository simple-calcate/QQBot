/**
 * Hermes Agent API Server
 * 提供 HTTP API 供桥接脚本调用
 */

import http from 'http';

const PORT = 5001;

// 简单的回复逻辑
function getReply(message, userId) {
  const msg = message.toLowerCase().trim();
  
  // 问候语
  if (msg.includes('你好') || msg.includes('hi') || msg.includes('hello') || msg.includes('嗨')) {
    return '你好！我是 Hermes Agent 小助手 🤖\n\n我可以帮你：\n• 回答问题\n• 聊天解闷\n• 提供信息\n\n有什么想聊的吗？';
  }
  
  // 询问功能
  if (msg.includes('功能') || msg.includes('能做什么') || msg.includes('帮助')) {
    return '我是 Hermes Agent 小助手，功能包括：\n\n1️⃣ 智能对话 - 回答各种问题\n2️⃣ 信息查询 - 提供实时信息\n3️⃣ 任务处理 - 帮你完成任务\n4️⃣ 闲聊解闷 - 陪你聊天\n\n直接发送消息即可开始！';
  }
  
  // 时间
  if (msg.includes('时间') || msg.includes('几点')) {
    const now = new Date();
    return '现在是 ' + now.toLocaleString('zh-CN');
  }
  
  // 天气（模拟）
  if (msg.includes('天气')) {
    return '今天天气不错！☀️\n\n温度：25°C\n天气：晴\n风力：微风\n\n适合外出活动哦！';
  }
  
  // 笑话
  if (msg.includes('笑话') || msg.includes('开心')) {
    const jokes = [
      '为什么程序员喜欢暗色主题？\n因为光会吸引 bug！🐛',
      '什么动物最懒？\n当然是蜗牛，因为它连家都背着走！🐌',
      '为什么电脑永远不会感冒？\n因为它有 Windows（窗户）！💻',
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  // 默认回复
  return '收到你的消息: "' + message + '"\n\n我是 Hermes Agent 小助手，正在为你处理...\n\n💡 提示：你可以问我任何问题，或者说"帮助"查看功能列表。';
}

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 只处理 POST /api/chat
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString('utf-8');
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const message = data.message || '';
        const userId = data.user_id || 'unknown';
        
        console.log('[API] 收到请求 - 用户: ' + userId + ', 消息: ' + message);
        
        // 获取回复
        const reply = getReply(message, userId);
        
        console.log('[API] 发送回复: ' + reply.substring(0, 50) + '...');
        
        // 返回响应
        res.writeHead(200);
        res.end(JSON.stringify({ reply: reply }));
        
      } catch (err) {
        console.error('[API] 解析请求失败:', err);
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    
  } else {
    // 404
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// 启动服务器
server.listen(PORT, () => {
  console.log('========================================');
  console.log('   Hermes Agent API Server');
  console.log('========================================');
  console.log('✅ API 服务器已启动: http://127.0.0.1:' + PORT);
  console.log('');
  console.log('API 端点:');
  console.log('  POST http://127.0.0.1:' + PORT + '/api/chat');
  console.log('');
  console.log('请求格式:');
  console.log('  {');
  console.log('    "message": "你好",');
  console.log('    "user_id": "123456"');
  console.log('  }');
  console.log('');
  console.log('按 Ctrl+C 停止服务器');
  console.log('========================================');
});
