/**
 * MCP 工具定义 - 文件/图片
 */
export const fileTools = [
  {
    "name": "get_image",
    "description": "get image",
    "inputSchema": {
      "type": "object",
      "properties": { "file": { "type": "string" } },
      "required": ["file"]
    }
  },
  {
    "name": "get_record",
    "description": "get record",
    "inputSchema": {
      "type": "object",
      "properties": {
        "file": { "type": "string" },
        "out_format": { "type": "string" }
      },
      "required": ["file", "out_format"]
    }
  },
  {
    "name": "send_group_image",
    "description": "send image to group (local file path or URL)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "file": { "type": "string", "description": "local file path or URL" }
      },
      "required": ["group_id", "file"]
    }
  },
  {
    "name": "send_private_image",
    "description": "send image to private chat (local file path or URL)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "user_id": { "type": "integer" },
        "file": { "type": "string", "description": "local file path or URL" }
      },
      "required": ["user_id", "file"]
    }
  },
  {
    "name": "send_group_file",
    "description": "send file to group (PDF, doc, etc - local path or URL)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": { "type": "integer" },
        "file": { "type": "string", "description": "local file path or URL" }
      },
      "required": ["group_id", "file"]
    }
  },
  {
    "name": "send_private_file",
    "description": "send file to private chat (PDF, doc, etc - local path or URL)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "user_id": { "type": "integer" },
        "file": { "type": "string", "description": "local file path or URL" }
      },
      "required": ["user_id", "file"]
    }
  }
];
