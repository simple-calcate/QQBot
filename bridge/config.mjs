/**
 * Bridge 配置常量
 */
export const SNOWLUMA_WS = 'ws://127.0.0.1:3001';
export const SNOWLUMA_HTTP = 'http://127.0.0.1:3000';
export const WS_TOKEN='pCuEG6dlti7GytmRgXpPBWdIOKtFvBi-4I-gGtPy9w0';
export const HTTP_TOKEN='UfPoOxHA8OBuU9ZwhozMFTn01mVs1sQ3l6ZbJhfI1Fw';
export const INBOX = 'C:/Users/27554/Desktop/QQBot/inbox';
export const OUTBOX = 'C:/Users/27554/Desktop/QQBot/outbox';
export const IMAGES_DIR = 'C:/Users/27554/Desktop/QQBot/images';
export const BOT_NICKNAME = '11';

export function log(msg) {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}
