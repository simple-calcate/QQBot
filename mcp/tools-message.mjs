/**
 * MCP 工具定义 - 消息相关
 */
export const messageTools = [
  {
    "name": "send_private_msg",
    "description": "send private msg",
    "inputSchema": {
      "type": "object",
      "properties": {
        "user_id": { "type": "integer" },
        "message": { "type": "string" },
        "auto_escape": { "type": "boolean" }
      },
      "required": ["user_id", "message"]
    }
  },
  {
    "name": "send_group_msg",
    "description": "send group msg",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "message": { "type": "string" },
        "auto_escape": { "type": "boolean" }
      },
      "required": ["group_id", "message"]
    }
  },
  {
    "name": "send_msg",
    "description": "send msg",
    "inputSchema": {
      "type": "object",
      "properties": {
        "message_type": { "type": "string" },
        "user_id": { "type": "integer" },
        "group_id": { "type": "integer" },
        "message": { "type": "string" },
        "auto_escape": { "type": "boolean" }
      },
      "required": ["message"]
    }
  },
  {
    "name": "delete_msg",
    "description": "delete msg",
    "inputSchema": {
      "type": "object",
      "properties": { "message_id": { "type": "integer" } },
      "required": ["message_id"]
    }
  },
  {
    "name": "get_msg",
    "description": "get msg",
    "inputSchema": {
      "type": "object",
      "properties": { "message_id": { "type": "integer" } },
      "required": ["message_id"]
    }
  },
  {
    "name": "get_forward_msg",
    "description": "get forward msg",
    "inputSchema": {
      "type": "object",
      "properties": { "id": { "type": "string" } },
      "required": ["id"]
    }
  },
  {
    "name": "send_like",
    "description": "send like",
    "inputSchema": {
      "type": "object",
      "properties": {
        "user_id": { "type": "integer" },
        "times": { "type": "integer" }
      },
      "required": ["user_id"]
    }
  }
];
