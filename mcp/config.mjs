/**
 * MCP Server 配置
 */
export const SNOWLUMA_HTTP = process.env.SNOWLUMA_HTTP || "http://127.0.0.1:3000";

function getEnvToken() {
  return process.env.HTTP_TOKEN || "";
}
export const HTTP_TOKEN = getEnvToken();
