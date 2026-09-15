'use strict';

// 保留官方主题的模板，仅加载项目自己的少量阅读样式。
hexo.extend.injector.register('head_end', function () {
  const urlFor = hexo.extend.helper.get('url_for').bind(hexo);
  return `<link rel="stylesheet" href="${urlFor('/css/blog.css')}">`;
});
