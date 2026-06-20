/**
 * MCP 工具定义 - 汇总
 */
import { messageTools } from './tools-message.mjs';
import { groupTools } from './tools-group.mjs';
import { userTools } from './tools-user.mjs';
import { fileTools } from './tools-file.mjs';

export const TOOLS = [...messageTools, ...groupTools, ...userTools, ...fileTools];
