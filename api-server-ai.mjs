/**
 * Hermes Agent API Server - AI 版本
 * 接入 DeepSeek AI 大模型
 */

import http from 'http';
import https from 'https';

const PORT = 5001;

// DeepSeek API 配置
// 请替换为你自己的 API Key
const DEEPSEEK_API_KEY = 'YOUR_DEEPSEEK_API_KEY';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 对话历史（简单实现，重启后清空）
const chatHistory = {};

// 调用 DeepSeek API
async function callDeepSeek(userId, message) {
  return new Promise((resolve, reject) => {
    // 获取或创建对话历史
    if (!chatHistory[userId]) {
      chatHistory[userId] = [];
    }
    
    // 添加用户消息
    chatHistory[userId].push({
      role: 'user',
      content: message
    });
    
    // 只保留最近 10 条消息
    if (chatHistory[userId].length > 20) {
      chatHistory[userId] = chatHistory[userId].slice(-20);
    }
    
    // 构建请求
    const postData = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是 Hermes Agent 小助手，一个友好、智能的 AI 助手。请用中文回复，保持简洁友好。'
        },
        ...chatHistory[userId]
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    const url = new URL(DEEPSEEK_API_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (result.choices && result.choices[0]) {
            const reply = result.choices[0].message.content;
            
            // 添加助手回复到历史
            chatHistory[userId].push({
              role: 'assistant',
              content: reply
            });
            
            resolve(reply);
          } else {
            console.error('[DeepSeek] API 返回异常:', result);
            resolve('抱歉，AI 处理出现问题，请稍后再试。');
          }
        } catch (err) {
          console.error('[DeepSeek] 解析响应失败:', err);
          resolve('抱歉，处理消息时出现错误。');
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('[DeepSeek] 请求失败:', err);
      resolve('抱歉，连接 AI 服务失败，请检查网络。');
    });
    
    req.write(postData);
    req.end();
  });
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
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const message = data.message || '';
        const userId = data.user_id || 'unknown';
        
        console.log(`[API] 收到请求 - 用户: ${userId}, 消息: ${message}`);
        
        // 调用 DeepSeek AI
        const reply = await callDeepSeek(userId, message);
        
        console.log(`[API] AI 回复: ${reply.substring(0, 50)}...`);
        
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
  console.log('   Hermes Agent AI Server');
  console.log('========================================');
  console.log(`✅ API 服务器已启动: http://127.0.0.1:${PORT}`);
  console.log('');
  console.log('AI 配置:');
  console.log(`  模型: DeepSeek Chat`);
  console.log(`  API: ${DEEPSEEK_API_URL}`);
  console.log('');
  console.log('⚠️  请确保已配置 DEEPSEEK_API_KEY');
  console.log('');
  console.log('按 Ctrl+C 停止服务器');
  console.log('========================================');
});
