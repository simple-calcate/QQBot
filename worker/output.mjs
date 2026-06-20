/**
 * 输出清理 - 从 hermes-agent CLI 输出中提取回复
 */

export function cleanOutput(str) {
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

export function extractReply(output) {
  const clean = cleanOutput(output);
  const lines = clean.split('\n').map(l => l.trim()).filter(l => l);
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Hermes') && lines[i].includes('⚕')) {
      let replyLines = [];
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].includes('────') || lines[j].includes('Resume') || lines[j].includes('Session:')) break;
        if (lines[j]) replyLines.push(lines[j]);
      }
      return replyLines.join('\n');
    }
  }
  
  const skip = [/^Query:/, /^Initializing/, /^Browser engine/, /^Install browser/, /^Session:/, /^Duration:/, /^Messages:/, /^Resume this/, /Auxiliary title/];
  return lines.filter(l => !skip.some(p => p.test(l)) && l.length > 1).join('\n');
}
