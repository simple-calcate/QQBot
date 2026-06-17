#!/usr/bin/env python3
"""
SnowLuma <-> Hermes Agent 桥接脚本
将 QQ 消息转发给 Hermes Agent 处理，然后将回复发送回 QQ
"""

import json
import asyncio
import websockets
import requests
import logging
from datetime import datetime

# 配置
SNOWLUMA_WS = "ws://127.0.0.1:3001"
SNOWLUMA_TOKEN = "pCuEG6dlti7GytmRgXpPBWdIOKtFvBi-4I-gGtPy9w0"
HERMES_API = "http://127.0.0.1:5001/api/chat"  # Hermes Agent API

# 日志配置
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 存储消息历史
message_history = {}

async def send_to_hermes(user_id, message):
    """发送消息到 Hermes Agent 并获取回复"""
    try:
        # 构建请求
        payload = {
            "message": message,
            "user_id": str(user_id),
            "timestamp": datetime.now().isoformat()
        }
        
        # 发送到 Hermes Agent
        response = requests.post(
            HERMES_API,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("reply", "抱歉，我暂时无法回复。")
        else:
            logger.error(f"Hermes API error: {response.status_code}")
            return "抱歉，处理消息时出现错误。"
            
    except Exception as e:
        logger.error(f"Error calling Hermes API: {e}")
        return "抱歉，连接 Hermes Agent 失败。"

async def send_qq_message(ws, user_id, message, message_type="private"):
    """通过 SnowLuma 发送 QQ 消息"""
    try:
        if message_type == "private":
            action = "send_private_msg"
            params = {
                "user_id": user_id,
                "message": message
            }
        else:  # group
            action = "send_group_msg"
            params = {
                "group_id": user_id,
                "message": message
            }
        
        # 构建 OneBot 请求
        request = {
            "action": action,
            "params": params,
            "echo": f"msg_{datetime.now().timestamp()}"
        }
        
        # 发送请求
        await ws.send(json.dumps(request))
        logger.info(f"Sent message to {user_id}: {message[:50]}...")
        
    except Exception as e:
        logger.error(f"Error sending QQ message: {e}")

async def handle_message(ws, data):
    """处理接收到的消息"""
    try:
        # 解析消息
        if "post_type" not in data:
            return
            
        post_type = data.get("post_type")
        
        # 处理私聊消息
        if post_type == "message" and data.get("message_type") == "private":
            user_id = data.get("user_id")
            message = data.get("raw_message", "")
            message_id = data.get("message_id")
            
            logger.info(f"Received private message from {user_id}: {message}")
            
            # 忽略自己发送的消息
            if data.get("self_id") == user_id:
                return
            
            # 发送到 Hermes Agent
            reply = await send_to_hermes(user_id, message)
            
            # 发送回复
            await send_qq_message(ws, user_id, reply, "private")
            
        # 处理群消息
        elif post_type == "message" and data.get("message_type") == "group":
            group_id = data.get("group_id")
            user_id = data.get("user_id")
            message = data.get("raw_message", "")
            
            logger.info(f"Received group message from {user_id} in group {group_id}: {message}")
            
            # 忽略自己发送的消息
            if data.get("self_id") == user_id:
                return
            
            # 检查是否是 @机器人 或包含特定关键词
            if "[CQ:at,qq=" in message or "hermes" in message.lower() or "小助手" in message:
                # 提取实际消息内容（去掉 @机器人 部分）
                clean_message = message.replace("[CQ:at,qq=2608589652]", "").strip()
                
                # 发送到 Hermes Agent
                reply = await send_to_hermes(user_id, clean_message)
                
                # 发送回复到群
                await send_qq_message(ws, group_id, f"[CQ:at,qq={user_id}] {reply}", "group")
                
    except Exception as e:
        logger.error(f"Error handling message: {e}")

async def connect_to_snowluma():
    """连接到 SnowLuma WebSocket"""
    uri = f"{SNOWLUMA_WS}?access_token={SNOWLUMA_TOKEN}"
    
    while True:
        try:
            logger.info(f"Connecting to SnowLuma at {SNOWLUMA_WS}...")
            
            async with websockets.connect(uri) as ws:
                logger.info("Connected to SnowLuma!")
                
                # 发送心跳
                async def heartbeat():
                    while True:
                        try:
                            await ws.send(json.dumps({"action": "get_status"}))
                            await asyncio.sleep(30)
                        except:
                            break
                
                # 启动心跳任务
                heartbeat_task = asyncio.create_task(heartbeat())
                
                # 接收消息
                async for message in ws:
                    try:
                        data = json.loads(message)
                        await handle_message(ws, data)
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid JSON: {message}")
                    except Exception as e:
                        logger.error(f"Error processing message: {e}")
                
                # 取消心跳任务
                heartbeat_task.cancel()
                
        except websockets.exceptions.ConnectionClosed:
            logger.warning("Connection closed, reconnecting in 5 seconds...")
            await asyncio.sleep(5)
        except Exception as e:
            logger.error(f"Connection error: {e}, reconnecting in 5 seconds...")
            await asyncio.sleep(5)

async def main():
    """主函数"""
    logger.info("Starting SnowLuma <-> Hermes Agent bridge...")
    logger.info(f"SnowLuma WS: {SNOWLUMA_WS}")
    logger.info(f"Hermes API: {HERMES_API}")
    
    await connect_to_snowluma()

if __name__ == "__main__":
    asyncio.run(main())
