/**
 * 消息处理 - 处理来自 SnowLuma 的消息
 */
import fs from 'fs';
import path from 'path';
import { INBOX, BOT_NICKNAME, log } from './config.mjs';
import { extractImageFiles, fetchImageViaAPI, extractForwardId, fetchForwardMsg } from './image.mjs';

const recentMsgIds = new Set();
let msgId = 0;

export function handleMessage(data) {
  const eventKey = `${data.user_id}_${data.group_id}_${data.message_id || ''}_${data.time || ''}`;
  if (recentMsgIds.has(eventKey)) return;
  recentMsgIds.add(eventKey);
  setTimeout(() => recentMsgIds.delete(eventKey), 10000);
  handleMessageAsync(data).catch(err => log(`❌ 处理消息出错: ${err.message}`));
}

async function handleMessageAsync(data) {
  const id = ++msgId;
  const selfId = String(data.self_id);
  const userId = String(data.user_id);
  const message = data.raw_message || '';
  const messageType = data.message_type;
  const nickname = data.sender?.nickname || userId;
  
  if (userId === selfId) return;
  
  if (messageType === 'group') {
    await handleGroupMessage(id, selfId, userId, message, nickname, data);
  } else {
    await handlePrivateMessage(id, selfId, userId, message, nickname, data);
  }
}

async function handleGroupMessage(id, selfId, userId, message, nickname, data) {
  const forwardId = extractForwardId(message);
  let forwardContent = '';
  if (forwardId) {
    log(`📋 检测到转发消息，尝试获取内容...`);
    try {
      const lines = await fetchForwardMsg(forwardId);
      forwardContent = lines.join(`\n`);
      log(`📋 获取转发消息: ${lines.length} 条`);
    } catch (e) {
      log(`❌ 获取转发消息失败: ${e.message}`);
      forwardContent = '[转发消息 - 内容无法获取]';
    }
  }
  
  const cleanMsg = (forwardContent || message).replace(/\[CQ:[^\]]+\]/g, '').replace(/@\S+/g, '').trim();
  
  if (cleanMsg) {
    const recordData = {
      id, time: new Date().toISOString(),
      type: 'group_record', userId, groupId: data.group_id,
      message: cleanMsg, nickname, selfId, messageId: data.message_id
    };
    fs.writeFileSync(path.join(INBOX, `record_${id}.json`), JSON.stringify(recordData, null, 2));
  }
  
  const isAtBot = message.includes(`[CQ:at,qq=${selfId}]`) || message.includes(`@${selfId}`) || message.includes(`@${BOT_NICKNAME}`) || message.includes(`@${BOT_NICKNAME} `);
  if (!isAtBot) return;
  
  const imagePaths = await extractImages(message);
  if (!cleanMsg && imagePaths.length === 0 && !forwardContent) return;
  
  let finalMsg = cleanMsg || '';
  if (forwardContent && !finalMsg) {
    finalMsg = '[转发消息] ' + forwardContent;
  } else if (forwardContent) {
    finalMsg = '[转发消息] ' + forwardContent + `\n` + finalMsg;
  }
  
  log(`📩 @消息 [${nickname}]: ${finalMsg || '[图片]'}`);
  
  const info = {
    id: id + 100000, time: new Date().toISOString(),
    type: 'group', userId, groupId: data.group_id,
    message: finalMsg, nickname, selfId, images: imagePaths, messageId: data.message_id
  };
  fs.writeFileSync(path.join(INBOX, `at_${id}.json`), JSON.stringify(info, null, 2));
}

async function handlePrivateMessage(id, selfId, userId, message, nickname, data) {
  const imagePaths = await extractImages(message);
  const cleanMsg = message.replace(/\[CQ:[^\]]+\]/g, '').trim();
  log(`📩 私聊 [${nickname}]: ${cleanMsg || '[图片]'}`);
  const info = {
    id, time: new Date().toISOString(),
    type: 'private', userId, nickname, message: cleanMsg || '', selfId, images: imagePaths, messageId: data.message_id
  };
  fs.writeFileSync(path.join(INBOX, `${id}.json`), JSON.stringify(info, null, 2));
}

async function extractImages(message) {
  const imageFiles = extractImageFiles(message);
  const imagePaths = [];
  for (const file of imageFiles) {
    try {
      const p = await fetchImageViaAPI(file);
      imagePaths.push(p);
      log(`🖼️ 获取图片: ${path.basename(p)}`);
    } catch (e) {
      log(`❌ 图片获取失败: ${e.message}`);
    }
  }
  return imagePaths;
}
