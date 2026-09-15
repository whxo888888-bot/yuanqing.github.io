import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';

const baseUrl = process.env.PAGES_BASE_URL;
if (!baseUrl) {
  throw new Error('缺少 PAGES_BASE_URL。日常本地构建请使用 npm run build。');
}
const url = new URL(baseUrl);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
  throw new Error('PAGES_BASE_URL 必须是完整的 HTTPS 网站地址，不含账号、查询参数或锚点。');
}
const root = `${url.pathname.replace(/\/$/, '')}/`;
const configPath = '_config.pages.json';
writeFileSync(configPath, JSON.stringify({ url: `${url.origin}${root}`, root }));
try {
  const hexoCli = 'node_modules/hexo/bin/hexo';
  execFileSync(process.execPath, [hexoCli, 'clean'], { stdio: 'inherit' });
  execFileSync(process.execPath, [hexoCli, 'generate', '--config', `_config.yml,${configPath}`], { stdio: 'inherit' });
} finally {
  rmSync(configPath, { force: true });
}
