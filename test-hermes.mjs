/**
 * 测试脚本 - 直接测试 Hermes 输出解析
 */

import { execSync } from 'child_process';

const HERMES = 'C:/Users/27554/AppData/Roaming/cn.org.hermesagent.desktop/runtime/versions/0.16.0-cn.6/hermes-agent-cn-runtime-win32-x64.exe';

function cleanOutput(str) {
  return str
    .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/\x1B\][^\x07\x1B]*(\x07|\x1B\\)/g, '')
    .replace(/[─━│┃┄┅┆┇┈┉┊┋┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┳┼┽┾┿╀╁╂╃╄╅╆╇═══║╔╗╚╝╠╣╦╩╬]/g, '')
    .replace(/[\u2800-\u28FF]/g, '')
    .replace(/[\u2500-\u257F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

console.log('测试 Hermes 输出解析...\n');

const cmd = `"${HERMES}" chat -q "你好"`;
console.log('执行命令:', cmd, '\n');

const result = execSync(cmd, {
  encoding: 'utf-8',
  timeout: 60000,
  windowsHide: true
});

console.log('=== 原始输出 ===');
console.log(result);
console.log('\n=== 清理后输出 ===');
const clean = cleanOutput(result);
console.log(clean);
console.log('\n=== 逐行分析 ===');
const lines = clean.split('\n').map(l => l.trim()).filter(l => l);
lines.forEach((line, i) => {
  console.log(`[${i}] "${line}"`);
});
