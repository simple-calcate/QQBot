#!/usr/bin/env node
import http from "http";

const SNOWLUMA_HTTP = process.env.SNOWLUMA_HTTP || "http://127.0.0.1:3000";
const HTTP_TOKEN=*** || "";

const TOOLS = [
  {
    "name": "send_private_msg",
    "description": "send private msg",
    "inputSchema": {
      "type": "object",
      "properties": {
        "user_id": {
          "type": "integer"
        },
        "message": {
          "type": "string"
        },
        "auto_escape": {
          "type": "boolean"
        }
      },
      "required": [
        "user_id",
        "message"
      ]
    }
  },
  {
    "name": "send_group_msg",
    "description": "send group msg",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        },
        "message": {
          "type": "string"
        },
        "auto_escape": {
          "type": "boolean"
        }
      },
      "required": [
        "group_id",
        "message"
      ]
    }
  },
  {
    "name": "send_msg",
    "description": "send msg",
    "inputSchema": {
      "type": "object",
      "properties": {
        "message_type": {
          "type": "string"
        },
        "user_id": {
          "type": "integer"
        },
        "group_id": {
          "type": "integer"
        },
        "message": {
          "type": "string"
        },
        "auto_escape": {
          "type": "boolean"
        }
      },
      "required": [
        "message"
      ]
    }
  },
  {
    "name": "delete_msg",
    "description": "delete msg",
    "inputSchema": {
      "type": "object",
      "properties": {
        "message_id": {
          "type": "integer"
        }
      },
      "required": [
        "message_id"
      ]
    }
  },
  {
    "name": "get_msg",
    "description": "get msg",
    "inputSchema": {
      "type": "object",
      "properties": {
        "message_id": {
          "type": "integer"
        }
      },
      "required": [
        "message_id"
      ]
    }
  },
  {
    "name": "get_forward_msg",
    "description": "get forward msg",
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "send_like",
    "description": "send like",
    "inputSchema": {
      "type": "object",
      "properties": {
        "user_id": {
          "type": "integer"
        },
        "times": {
          "type": "integer"
        }
      },
      "required": [
        "user_id"
      ]
    }
  },
  {
    "name": "get_login_info",
    "description": "get login info",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "can_send_image",
    "description": "check",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "can_send_record",
    "description": "check",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "get_status",
    "description": "status",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "get_version_info",
    "description": "version",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "get_stranger_info",
    "description": "stranger info",
    "inputSchema": {
      "type": "object",
      "properties": {
        "user_id": {
          "type": "integer"
        },
        "no_cache": {
          "type": "boolean"
        }
      },
      "required": [
        "user_id"
      ]
    }
  },
  {
    "name": "get_friend_list",
    "description": "friend list",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "get_group_info",
    "description": "group info",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        },
        "no_cache": {
          "type": "boolean"
        }
      },
      "required": [
        "group_id"
      ]
    }
  },
  {
    "name": "get_group_list",
    "description": "group list",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "get_group_member_info",
    "description": "member info",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        },
        "user_id": {
          "type": "integer"
        },
        "no_cache": {
          "type": "boolean"
        }
      },
      "required": [
        "group_id",
        "user_id"
      ]
    }
  },
  {
    "name": "get_group_member_list",
    "description": "member list",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        }
      },
      "required": [
        "group_id"
      ]
    }
  },
  {
    "name": "get_group_honor_info",
    "description": "honor info",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        },
        "type": {
          "type": "string"
        }
      },
      "required": [
        "group_id",
        "type"
      ]
    }
  },
  {
    "name": "set_group_kick",
    "description": "kick",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        },
        "user_id": {
          "type": "integer"
        },
        "reject_add_request": {
          "type": "boolean"
        }
      },
      "required": [
        "group_id",
        "user_id"
      ]
    }
  },
  {
    "name": "set_group_ban",
    "description": "ban",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        },
        "user_id": {
          "type": "integer"
        },
        "duration": {
          "type": "integer"
        }
      },
      "required": [
        "group_id",
        "user_id"
      ]
    }
  },
  {
    "name": "set_group_anonymous_ban",
    "description": "ban anon",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        },
        "flag": {
          "type": "string"
        },
        "duration": {
          "type": "integer"
        }
      },
      "required": [
        "group_id",
        "flag"
      ]
    }
  },
  {
    "name": "set_group_whole_ban",
    "description": "whole ban",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        },
        "enable": {
          "type": "boolean"
        }
      },
      "required": [
        "group_id"
      ]
    }
  },
  {
    "name": "set_group_admin",
    "description": "set admin",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        },
        "user_id": {
          "type": "integer"
        },
        "enable": {
          "type": "boolean"
        }
      },
      "required": [
        "group_id",
        "user_id"
      ]
    }
  },
  {
    "name": "set_group_anonymous",
    "description": "enable anon",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        },
        "enable": {
          "type": "boolean"
        }
      },
      "required": [
        "group_id"
      ]
    }
  },
  {
    "name": "set_group_card",
    "description": "set card",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        },
        "user_id": {
          "type": "integer"
        },
        "card": {
          "type": "string"
        }
      },
      "required": [
        "group_id",
        "user_id"
      ]
    }
  },
  {
    "name": "set_group_name",
    "description": "set name",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        },
        "group_name": {
          "type": "string"
        }
      },
      "required": [
        "group_id",
        "group_name"
      ]
    }
  },
  {
    "name": "set_group_leave",
    "description": "leave",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        },
        "is_dismiss": {
          "type": "boolean"
        }
      },
      "required": [
        "group_id"
      ]
    }
  },
  {
    "name": "set_group_special_title",
    "description": "set title",
    "inputSchema": {
      "type": "object",
      "properties": {
        "group_id": {
          "type": "integer"
        },
        "user_id": {
          "type": "integer"
        },
        "special_title": {
          "type": "string"
        },
        "duration": {
          "type": "integer"
        }
      },
      "required": [
        "group_id",
        "user_id"
      ]
    }
  },
  {
    "name": "get_image",
    "description": "get image",
    "inputSchema": {
      "type": "object",
      "properties": {
        "file": {
          "type": "string"
        }
      },
      "required": [
        "file"
      ]
    }
  },
  {
    "name": "get_record",
    "description": "get record",
    "inputSchema": {
      "type": "object",
      "properties": {
        "file": {
          "type": "string"
        },
        "out_format": {
          "type": "string"
        }
      },
      "required": [
        "file",
        "out_format"
      ]
    }
  },
  {
    "name": "set_friend_add_request",
    "description": "friend req",
    "inputSchema": {
      "type": "object",
      "properties": {
        "flag": {
          "type": "string"
        },
        "approve": {
          "type": "boolean"
        },
        "remark": {
          "type": "string"
        }
      },
      "required": [
        "flag",
        "approve"
      ]
    }
  },
  {
    "name": "set_group_add_request",
    "description": "group req",
    "inputSchema": {
      "type": "object",
      "properties": {
        "flag": {
          "type": "string"
        },
        "sub_type": {
          "type": "string"
        },
        "approve": {
          "type": "boolean"
        },
        "reason": {
          "type": "string"
        }
      },
      "required": [
        "flag",
        "sub_type",
        "approve"
      ]
    }
  },
  {
    "name": "get_cookies",
    "description": "cookies",
    "inputSchema": {
      "type": "object",
      "properties": {
        "domain": {
          "type": "string"
        }
      },
      "required": [
        "domain"
      ]
    }
  },
  {
    "name": "get_csrf_token",
    "description": "csrf",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "get_credentials",
    "description": "creds",
    "inputSchema": {
      "type": "object",
      "properties": {
        "domain": {
          "type": "string"
        }
      },
      "required": [
        "domain"
      ]
    }
  },
  {
    "name": "set_restart",
    "description": "restart",
    "inputSchema": {
      "type": "object",
      "properties": {
        "delay": {
          "type": "integer"
        }
      }
    }
  },
  {
    "name": "clean_cache",
    "description": "clean cache",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  }
];

console.log(TOOLS.length + " tools");

// Rate limiter for send_*_msg: max 1 per 600ms to avoid Tencent ban
var lastSendTime = 0;
var SEND_INTERVAL = 600;
var SEND_TOOLS = new Set(["send_private_msg", "send_group_msg", "send_msg"]);

function rateLimitedSend(action, params) {
  return new Promise(function(resolve, reject) {
    var now = Date.now();
    var wait = Math.max(0, lastSendTime + SEND_INTERVAL - now);
    setTimeout(function() {
      lastSendTime = Date.now();
      callOneBot(action, params).then(resolve).catch(reject);
    }, wait);
  });
}

function callOneBot(action, params) {
  if (!params) params = {};
  return new Promise(function(resolve, reject) {
    var postData = JSON.stringify(params);
    var url = new URL(SNOWLUMA_HTTP + "/" + action);
    var headers = { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(postData) };
    if (HTTP_TOKEN) headers.Authorization = "Bearer " + HTTP_TOKEN;
    var req = http.request({ hostname: url.hostname, port: url.port || 80, path: url.pathname, method: "POST", headers: headers, timeout: 15000 }, function(res) {
      var body = "";
      res.on("data", function(c) { body += c; });
      res.on("end", function() { try { resolve(JSON.parse(body)); } catch(e) { resolve({ retcode: -1, msg: "parse error" }); } });
    });
    req.on("error", reject);
    req.on("timeout", function() { req.destroy(); reject(new Error("timeout")); });
    req.write(postData);
    req.end();
  });
}

var TOOL_SET = new Set(TOOLS.map(function(t) { return t.name; }));

async function handleTool(name, args) {
  if (!TOOL_SET.has(name)) return { content: [{ type: "text", text: "Unknown: " + name }], isError: true };
  var r;
  if (SEND_TOOLS.has(name)) {
    r = await rateLimitedSend(name, args);
  } else {
    r = await callOneBot(name, args);
  }
  return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
}

var server = http.createServer(async function(req, res) {
  if (req.method !== "POST") { res.writeHead(405); res.end(); return; }
  var body = "";
  req.on("data", function(c) { body += c; });
  req.on("end", async function() {
    var rpc; try { rpc = JSON.parse(body); } catch(e) { res.writeHead(400); res.end(JSON.stringify({jsonrpc:"2.0",error:{code:-32700,message:"Parse error"},id:null})); return; }
    var method = rpc.method, params = rpc.params, id = rpc.id;
    try {
      var result;
      if (method === "initialize") { result = { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "onebot-v11-mcp", version: "1.1.0" } }; }
      else if (method === "notifications/initialized") { res.writeHead(202); res.end(); return; }
      else if (method === "tools/list") { result = { tools: TOOLS }; }
      else if (method === "tools/call") { result = await handleTool(params.name, params.arguments || {}); }
      else { res.writeHead(200); res.end(JSON.stringify({jsonrpc:"2.0",error:{code:-32601,message:"Method not found"},id:id})); return; }
      res.writeHead(200); res.end(JSON.stringify({jsonrpc:"2.0",result:result,id:id}));
    } catch (e) { res.writeHead(200); res.end(JSON.stringify({jsonrpc:"2.0",error:{code:-32000,message:e.message},id:id})); }
  });
});

var PORT = process.env.MCP_PORT || 3100;
server.listen(PORT, function() { console.log("[OneBot MCP] :" + PORT + " -> " + SNOWLUMA_HTTP); });
