/**
 * MCP HTTP Server
 */
import http from 'http';
import { TOOLS } from './tools.mjs';
import { handleTool } from './handler.mjs';

export function createServer() {
  return http.createServer(async function(req, res) {
    if (req.method !== "POST") { res.writeHead(405); res.end(); return; }
    var body = "";
    req.on("data", function(c) { body += c; });
    req.on("end", async function() {
      var rpc;
      try { rpc = JSON.parse(body); } catch(e) {
        res.writeHead(400);
        res.end(JSON.stringify({jsonrpc:"2.0",error:{code:-32700,message:"Parse error"},id:null}));
        return;
      }
      var method = rpc.method, params = rpc.params, id = rpc.id;
      try {
        var result;
        if (method === "initialize") {
          result = { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "onebot-v11-mcp", version: "1.2.0" } };
        } else if (method === "notifications/initialized") {
          res.writeHead(202); res.end(); return;
        } else if (method === "tools/list") {
          result = { tools: TOOLS };
        } else if (method === "tools/call") {
          result = await handleTool(params.name, params.arguments || {});
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({jsonrpc:"2.0",error:{code:-32601,message:"Method not found"},id:id}));
          return;
        }
        res.writeHead(200);
        res.end(JSON.stringify({jsonrpc:"2.0",result:result,id:id}));
      } catch (e) {
        res.writeHead(200);
        res.end(JSON.stringify({jsonrpc:"2.0",error:{code:-32000,message:e.message},id:id}));
      }
    });
  });
}
