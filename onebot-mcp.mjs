#!/usr/bin/env node
/**
 * OneBot v11 MCP Server - 主入口
 */
import { createServer } from './mcp/server.mjs';
import { TOOLS } from './mcp/tools.mjs';
import { SNOWLUMA_HTTP } from './mcp/config.mjs';

console.log(TOOLS.length + " tools");

var PORT = process.env.MCP_PORT || 3100;
var server = createServer();
server.listen(PORT, function() {
  console.log("[OneBot MCP] :" + PORT + " -> " + SNOWLUMA_HTTP);
});
