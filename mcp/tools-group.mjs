/**
 * MCP 工具定义 - 群管理
 */
export const groupTools = [
  {
    "name": "get_group_info",
    "description": "group info",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "no_cache": { "type": "boolean" }
      },
      "required": ["group_id"]
    }
  },
  {
    "name": "get_group_list",
    "description": "group list",
    "inputSchema": { "type": "object", "properties": {} }
  },
  {
    "name": "get_group_member_info",
    "description": "member info",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "user_id": { "type": "integer" },
        "no_cache": { "type": "boolean" }
      },
      "required": ["group_id", "user_id"]
    }
  },
  {
    "name": "get_group_member_list",
    "description": "member list",
    "inputSchema": {
      "type": "object",
      "properties": { "group_id": { "type": "integer" } },
      "required": ["group_id"]
    }
  },
  {
    "name": "get_group_honor_info",
    "description": "honor info",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "type": { "type": "string" }
      },
      "required": ["group_id", "type"]
    }
  },
  {
    "name": "set_group_kick",
    "description": "kick",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "user_id": { "type": "integer" },
        "reject_add_request": { "type": "boolean" }
      },
      "required": ["group_id", "user_id"]
    }
  },
  {
    "name": "set_group_ban",
    "description": "ban",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "user_id": { "type": "integer" },
        "duration": { "type": "integer" }
      },
      "required": ["group_id", "user_id"]
    }
  },
  {
    "name": "set_group_anonymous_ban",
    "description": "ban anon",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "flag": { "type": "string" },
        "duration": { "type": "integer" }
      },
      "required": ["group_id", "flag"]
    }
  },
  {
    "name": "set_group_whole_ban",
    "description": "whole ban",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "enable": { "type": "boolean" }
      },
      "required": ["group_id"]
    }
  },
  {
    "name": "set_group_admin",
    "description": "set admin",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "user_id": { "type": "integer" },
        "enable": { "type": "boolean" }
      },
      "required": ["group_id", "user_id"]
    }
  },
  {
    "name": "set_group_anonymous",
    "description": "enable anon",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "enable": { "type": "boolean" }
      },
      "required": ["group_id"]
    }
  },
  {
    "name": "set_group_card",
    "description": "set card",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "user_id": { "type": "integer" },
        "card": { "type": "string" }
      },
      "required": ["group_id", "user_id"]
    }
  },
  {
    "name": "set_group_name",
    "description": "set name",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "group_name": { "type": "string" }
      },
      "required": ["group_id", "group_name"]
    }
  },
  {
    "name": "set_group_leave",
    "description": "leave",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "is_dismiss": { "type": "boolean" }
      },
      "required": ["group_id"]
    }
  },
  {
    "name": "set_group_special_title",
    "description": "set title",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "user_id": { "type": "integer" },
        "special_title": { "type": "string" },
        "duration": { "type": "integer" }
      },
      "required": ["group_id", "user_id"]
    }
  }
];
