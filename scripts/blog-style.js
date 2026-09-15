'use strict';

const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

function assetUrl(path) {
  const hash = createHash('sha256')
    .update(readFileSync(join(hexo.source_dir, path)))
    .digest('hex').slice(0, 12);
  return `${hexo.extend.helper.get('url_for').call(hexo, path)}?v=${hash}`;
}

// 在样式加载及正文绘制之前应用主题，避免已选深色时先闪出浅色页面。
hexo.extend.injector.register('head_begin', function () {
  return `<script src="${assetUrl('js/theme.js')}"></script>`;
});

// 保留官方主题的模板，通过扩展入口覆盖配色和阅读样式。
hexo.extend.injector.register('head_end', function () {
  return `<link rel="stylesheet" href="${assetUrl('css/blog.css')}">`;
});
