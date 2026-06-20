/**
 * MCP 工具处理
 */
import fs from 'fs';
import path from 'path';
import { TOOLS } from './tools.mjs';
import { rateLimitedSend, callOneBot, SEND_TOOLS } from './onebot-api.mjs';

var TOOL_SET = new Set(TOOLS.map(function(t) { return t.name; }));

export async function handleTool(name, args) {
  if (!TOOL_SET.has(name)) return { content: [{ type: "text", text: "Unknown: " + name }], isError: true };

  // Handle image sending tools
  if (name === "send_group_image" || name === "send_private_image") {
    try {
      var fileData = await resolveFile(args.file);
      var msg = [{ type: "image", data: { file: fileData } }];
      var params = { message: msg };
      if (name === "send_group_image") params.group_id = args.group_id;
      else params.user_id = args.user_id;
      var r = await rateLimitedSend(name.replace("_image", "_msg"), params);
      return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: "Error: " + e.message }], isError: true };
    }
  }

  // Handle file sending tools
  if (name === "send_group_file" || name === "send_private_file") {
    try {
      var fileData = await resolveFile(args.file);
      var msg = [{ type: "file", data: { file: fileData } }];
      var params = { message: msg };
      if (name === "send_group_file") params.group_id = args.group_id;
      else params.user_id = args.user_id;
      var r = await rateLimitedSend(name.replace("_file", "_msg"), params);
      return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: "Error: " + e.message }], isError: true };
    }
  }

  var r;
  if (SEND_TOOLS.has(name)) {
    r = await rateLimitedSend(name, args);
  } else {
    r = await callOneBot(name, args);
  }
  return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
}

async function resolveFile(file) {
  var isUrl = file.startsWith("http://") || file.startsWith("https://");
  var isBase64 = file.startsWith("base64://");
  if (isUrl || isBase64) return file;

  var absPath = file.replace(/\\/g, "/");
  if (!absPath.match(/^[A-Z]:\//i)) absPath = path.resolve(absPath);
  if (!fs.existsSync(absPath)) throw new Error("File not found: " + absPath);
  var buf = fs.readFileSync(absPath);
  return "base64://" + buf.toString("base64");
}
