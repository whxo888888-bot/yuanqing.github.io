# 我的技术博客

使用 Hexo 8 和官方 Landscape 主题的中文博客。已配置首页、文章、归档、标签和分类，附带一篇可替换的示例文章。

## 1. 本地预览

推荐 Node.js 24。第一次下载项目后安装依赖：

```bash
cd yuanqing.github.io
npm ci
npm run dev
```

如果已安装依赖，直接在项目目录运行 `npm run dev` 即可。打开 <http://127.0.0.1:4000/>，终端按 `Ctrl+C` 停止。预览只监听本机，修改文章后刷新页面；修改配置后需重启预览。

如果提示端口占用，先使用已经运行的预览，或停止旧服务。也可以临时使用 `npm run dev -- --port 4001`。

## 2. 写一篇文章

```bash
npm run new -- "我的第一篇文章"
```

打开 `source/_posts/我的第一篇文章.md`，在顶部的文章信息之后写正文：

```markdown
---
title: 我的第一篇文章
date: 2026-09-15 20:00:00
tags:
  - 学习笔记
categories:
  - 技术
---

这是首页展示的摘要。

<!-- more -->

## 我的记录

这里写正文。
```

`date` 填写实际发布时间。`<!-- more -->` 前面的内容出现在首页，文章页显示全文。示例文章是 `source/_posts/hello-hexo.md`，可以编辑或删除。

图片放到 `source/images/`，例如 `source/images/example.png`。站点发布在域名根目录时，可以这样引用：

```markdown
![图片说明](/images/example.png)
```

如果部署在 `/blog/` 等子目录，以上路径需相应改成 `/blog/images/example.png`。

## 3. 修改博客资料

编辑 `_config.yml`：

```yaml
title: 我的技术博客
subtitle: 记录开发与学习
description: 开发笔记、学习记录与实践总结。
author: 博主
language: zh-CN
timezone: Asia/Singapore
```

主题菜单及侧边栏在 `_config.landscape.yml`。当前沿用官方主题的星空横幅、文章卡片和侧边栏，中文字体和阅读间距在 `source/css/blog.css`。不要编辑 `node_modules` 或 `public`，重新安装或生成会覆盖它们。

RSS 和评论尚未启用。官方主题依赖 Google 收录的搜索入口已隐藏；部分主题图标样式使用 jsDelivr CDN。

## 4. 发布到 GitHub Pages

发布工作流已经准备好，目标仓库为 `whxo888888-bot/yuanqing.github.io`。博客网址为 <https://whxo888888-bot.github.io/yuanqing.github.io/>，是否发布成功以 Actions 执行结果及线上实际访问为准。

1. 在 GitHub 创建一个空仓库，如 `你的用户名.github.io`；也可以使用 `blog` 等项目仓库。初始仓库不要添加 README、License 或 .gitignore，避免与本地项目冲突。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 按实际仓库地址关联并推送：

```bash
git add .
git commit -m "Set up Chinese Hexo blog"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

以上地址是需要替换的示例。如果已经有 `origin`，先用 `git remote -v` 确认地址，不要重复添加。GitHub 登录用本机已有的 Git 凭据或官方登录流程，不把令牌放进仓库。

4. 在仓库 **Actions** 查看 `Publish Hexo to GitHub Pages`。等待 build 和 deploy 都成功后，再打开 Pages 提供的网址，确认首页、文章页、样式和图片正常。

工作流使用 GitHub Pages 返回的真实网站地址生成生产配置，自动处理根域名、项目子路径和已配置的自定义域名。本地 `_config.yml` 仍保留本地预览地址；`.github/workflows/pages.yml` 默认在推送到 `main` 时发布，也支持手动触发。

配置流程参考 [Hexo 官方 GitHub Pages 文档](https://hexo.io/zh-cn/docs/github-pages)。

## 5. 日常更新

写文章并本地检查后执行：

```bash
git add .
git commit -m "Write a new post"
git push
```

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 本地预览 |
| `npm run new -- "标题"` | 创建文章 |
| `npm run build` | 生成网页到 `public/` |
| `npm run clean` | 清理生成文件和 Hexo 缓存 |
| `npm run build:pages` | CI 发布构建，需要 `PAGES_BASE_URL` 环境变量 |

生成结果异常时，先停止预览，运行 `npm run clean`，再启动预览。修改文章文件名会改变默认文章网址；上线后尽量保留已有文件名。

## 项目结构

```text
_config.yml               博客资料与 Hexo 设置
_config.landscape.yml     官方主题配置
source/_posts/            文章 Markdown 源文件
source/css/blog.css       项目阅读样式
scaffolds/                新文章模板
scripts/blog-style.js     通过 Hexo 扩展入口加载项目样式
tools/build-pages.mjs     生成带正确线上网址和路径的网页
.github/workflows/        GitHub Pages 自动发布
public/                  自动生成，不直接编辑、不提交
```
