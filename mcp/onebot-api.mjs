/**
 * OneBot API 调用 + 限速
 */
import http from 'http';
import { SNOWLUMA_HTTP, HTTP_TOKEN } from './config.mjs';

var lastSendTime = 0;
var SEND_INTERVAL = 600;
var SEND_TOOLS = new Set(["send_private_msg", "send_group_msg", "send_msg", "send_group_image", "send_private_image", "send_group_file", "send_private_file"]);

export function rateLimitedSend(action, params) {
  return new Promise(function(resolve, reject) {
    var now = Date.now();
    var wait = Math.max(0, lastSendTime + SEND_INTERVAL - now);
    setTimeout(function() {
      lastSendTime = Date.now();
      callOneBot(action, params).then(resolve).catch(reject);
    }, wait);
  });
}

export function callOneBot(action, params) {
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

export { SEND_TOOLS };
