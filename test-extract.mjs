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

const cmd = `"${HERMES}" chat -q "简单介绍一下你自己，用3句话回答，每句换行"`;
const result = execSync(cmd, { encoding: 'utf-8', timeout: 60000, windowsHide: true });

const clean = cleanOutput(result);
const lines = clean.split('\n').map(l => l.trim()).filter(l => l);

console.log('=== 所有行 ===');
lines.forEach((line, i) => {
  console.log(`[${i}] "${line}"`);
});

console.log('\n=== 找到 Hermes 标题后的内容 ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Hermes') && lines[i].includes('⚕')) {
    console.log(`标题在第 ${i} 行`);
    // 收集标题后到下一个分隔符之间的所有行
    let reply = [];
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].includes('────') || lines[j].includes('Resume') || lines[j].includes('Session:')) {
        break;
      }
      if (lines[j]) {
        reply.push(lines[j]);
      }
    }
    console.log(`回复内容（${reply.length} 行）:`);
    reply.forEach((r, k) => console.log(`  ${k}: "${r}"`));
    console.log(`合并后: "${reply.join('\n')}"`);
    break;
  }
}
