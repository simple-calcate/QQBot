/**
 * MCP 工具定义 - 用户/系统
 */
export const userTools = [
  {
    "name": "get_login_info",
    "description": "get login info",
    "inputSchema": { "type": "object", "properties": {} }
  },
  {
    "name": "can_send_image",
    "description": "check",
    "inputSchema": { "type": "object", "properties": {} }
  },
  {
    "name": "can_send_record",
    "description": "check",
    "inputSchema": { "type": "object", "properties": {} }
  },
  {
    "name": "get_status",
    "description": "status",
    "inputSchema": { "type": "object", "properties": {} }
  },
  {
    "name": "get_version_info",
    "description": "version",
    "inputSchema": { "type": "object", "properties": {} }
  },
  {
    "name": "get_stranger_info",
    "description": "stranger info",
    "inputSchema": {
      "type": "object",
      "properties": {
        "user_id": { "type": "integer" },
        "no_cache": { "type": "boolean" }
      },
      "required": ["user_id"]
    }
  },
  {
    "name": "get_friend_list",
    "description": "friend list",
    "inputSchema": { "type": "object", "properties": {} }
  },
  {
    "name": "set_friend_add_request",
    "description": "friend req",
    "inputSchema": {
      "type": "object",
      "properties": {
        "flag": { "type": "string" },
        "approve": { "type": "boolean" },
        "remark": { "type": "string" }
      },
      "required": ["flag", "approve"]
    }
  },
  {
    "name": "set_group_add_request",
    "description": "group req",
    "inputSchema": {
      "type": "object",
      "properties": {
        "flag": { "type": "string" },
        "sub_type": { "type": "string" },
        "approve": { "type": "boolean" },
        "reason": { "type": "string" }
      },
      "required": ["flag", "sub_type", "approve"]
    }
  },
  {
    "name": "get_cookies",
    "description": "cookies",
    "inputSchema": {
      "type": "object",
      "properties": { "domain": { "type": "string" } },
      "required": ["domain"]
    }
  },
  {
    "name": "get_csrf_token",
    "description": "csrf",
    "inputSchema": { "type": "object", "properties": {} }
  },
  {
    "name": "get_credentials",
    "description": "creds",
    "inputSchema": {
      "type": "object",
      "properties": { "domain": { "type": "string" } },
      "required": ["domain"]
    }
  },
  {
    "name": "set_restart",
    "description": "restart",
    "inputSchema": {
      "type": "object",
      "properties": { "delay": { "type": "integer" } }
    }
  },
  {
    "name": "clean_cache",
    "description": "clean cache",
    "inputSchema": { "type": "object", "properties": {} }
  }
];
