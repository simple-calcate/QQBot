/**
 * 图片处理 - 提取、下载、获取转发消息
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { SNOWLUMA_HTTP, HTTP_TOKEN, IMAGES_DIR, log } from './config.mjs';

export function extractImageFiles(message) {
  const files = [];
  const regex = /\[CQ:image,[^\]]*file=([^\],]+)/g;
  let match;
  while ((match = regex.exec(message)) !== null) {
    files.push(match[1]);
  }
  return files;
}

export function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
    const filepath = path.join(IMAGES_DIR, filename);
    const file = fs.createWriteStream(filepath);
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close(); fs.unlink(filepath, () => {});
        downloadImage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const contentType = res.headers['content-type'] || '';
      if (!contentType.startsWith('image/')) {
        file.close(); fs.unlink(filepath, () => {});
        reject(new Error(`非图片响应: ${contentType}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(filepath); });
    }).on('error', (err) => { file.close(); fs.unlink(filepath, () => {}); reject(err); });
  });
}

export function fetchImageViaAPI(file) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ file });
    const url = new URL(`${SNOWLUMA_HTTP}/get_image`);
    const req = http.request({
      hostname: url.hostname, port: url.port, path: url.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${HTTP_TOKEN}`, 'Content-Length': Buffer.byteLength(postData) }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.status === 'ok' && result.data?.file) {
            const filePath = result.data.file;
            if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
              downloadImage(filePath).then(resolve).catch(reject);
            } else {
              const filepath = path.join(IMAGES_DIR, `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`);
              fs.copyFile(filePath, filepath, (err) => { err ? reject(err) : resolve(filepath); });
            }
          } else {
            reject(new Error(result.wording || '获取图片失败'));
          }
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

export function extractForwardId(message) {
  const match = message.match(/\[CQ:forward,id=([^\]]+)\]/);
  return match ? match[1] : null;
}

export function fetchForwardMsg(forwardId) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ id: forwardId });
    const url = new URL(`${SNOWLUMA_HTTP}/get_forward_msg`);
    const req = http.request({
      hostname: url.hostname, port: url.port, path: url.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${HTTP_TOKEN}`, 'Content-Length': Buffer.byteLength(postData) }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.status === 'ok' && result.data?.messages) {
            const lines = result.data.messages.map(msg => {
              if (!msg.message) return '';
              if (Array.isArray(msg.message)) {
                return msg.message.filter(seg => seg.type === 'text').map(seg => seg.data?.text || '').join('');
              }
              return String(msg.message).replace(/\[CQ:[^\]]+\]/g, '').trim();
            }).filter(l => l);
            resolve(lines);
          } else {
            reject(new Error(result.wording || '获取转发消息失败'));
          }
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}
