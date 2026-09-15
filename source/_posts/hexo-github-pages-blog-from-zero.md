---
title: 从零搭建自己的技术博客：我与 Codex 使用 Hexo 和 GitHub Pages 的完整实录
date: 2026-09-15 20:06:30
updated: 2026-09-15 20:06:30
author: whxo888888
description: 详细记录我与 Codex 从了解 Hexo、创建中文博客、本地预览，到 GitHub Pages 自动发布、解决私有仓库问题、修改用户名与网址的全过程，附完整配置、命令、分工和排错方法。
tags:
  - Hexo
  - GitHub Pages
  - GitHub Actions
  - Codex
  - 建站实录
categories:
  - 博客搭建
---

这篇文章从一个很简单的问题开始：**“Hexo 是什么东西？”**

随后，我提出想搭建自己的技术博客。经过本地初始化、中文配置、创建 GitHub 仓库、自动发布，以及一次账号与仓库改名，最终得到现在这个网站：[https://whxo888888.github.io/](https://whxo888888.github.io/)。

这里完整记录这次实际操作：**我做了什么，Codex 做了什么，文件是怎样变成网页的，网站又是怎样发布出去的。** 文中“我”指博客作者，“Codex”指协助我操作项目的 AI 编程助手。命令分为“本次实际操作”和“读者复现方法”，避免把教程中的建议误认为已经执行过的动作。

<!-- more -->

> **记录日期：2026 年 9 月 15 日。** 文中的版本、账号名、发布结果都是本次搭建时的记录。界面和平台规则可能变化，相关章节附有官方文档。

## 目录

1. [最终搭出了什么](#result)
2. [先认识这套博客里的几个角色](#concepts)
3. [我和 Codex 分别完成了哪些事情](#roles)
4. [检查电脑环境与创建项目](#setup)
5. [把默认博客改成中文技术博客](#configuration)
6. [启动本地预览，理解 localhost](#preview)
7. [创建 GitHub 仓库，处理 Pages 不可用](#repository)
8. [让 GitHub Actions 自动构建并发布](#workflow)
9. [为什么要区分本地网址和线上网址](#production-config)
10. [首次上传的实际经过](#first-publish)
11. [怎么证明博客真的发布成功](#verification)
12. [把网址改为 whxo888888.github.io](#rename)
13. [以后如何写文章、加图片和更新博客](#daily-use)
14. [本次遇到的问题与排查顺序](#troubleshooting)
15. [从头复现的最短路线](#reproduce)
16. [项目文件地图与总结](#summary)

<a id="result"></a>

## 一、最终搭出了什么

这次完成的是一个可以公开访问的静态技术博客。

| 项目 | 最终结果 |
| --- | --- |
| 博客网址 | [https://whxo888888.github.io/](https://whxo888888.github.io/) |
| 源码仓库 | [whxo888888/whxo888888.github.io](https://github.com/whxo888888/whxo888888.github.io) |
| 博客生成工具 | Hexo，实际安装版本 8.1.2 |
| 主题 | 官方 Landscape 主题，实际安装版本 1.1.0 |
| 语言 | 简体中文 |
| 内容 | 首页、文章页、归档、分类、标签 |
| 写作方式 | 在本地编辑 Markdown 文件 |
| 发布方式 | 提交到 GitHub 的 main 分支，由 GitHub Actions 构建，再交给 GitHub Pages 托管 |
| 服务器 | 没有购买或维护自己的服务器 |
| 独立域名 | 没有购买，使用 GitHub 提供的 github.io 地址 |

本次没有接入评论系统、后台编辑器、RSS 订阅生成或站内全文搜索。第一步先把“写文章 → 预览 → 发布 → 别人访问”这条完整流程跑通。

<a id="concepts"></a>

## 二、先认识这套博客里的几个角色

### 2.1 Hexo：把文章加工成网页

我写的源文件是 Markdown，例如：

```markdown
## 今天学到了什么

这是我的一段学习记录。
```

浏览器最终展示的是 HTML 页面。Hexo 负责读取文章、网站配置和主题模板，把它们组合成 HTML、CSS、JavaScript 等静态文件。[Hexo 官方介绍](https://hexo.io/zh-cn/docs/)

可以把整个过程想象成：

```text
文章 Markdown + 网站配置 + 主题模板
                  │
                  ▼
              Hexo 生成
                  │
                  ▼
            public/ 中的网页
```

### 2.2 Node.js 和 npm：运行工具、安装依赖

- **Node.js**：让 Hexo 这样的 JavaScript 程序在电脑或构建机器上运行。
- **npm**：安装 Hexo、主题、Markdown 渲染器等依赖，也用来执行项目中定义好的命令。
- **package.json**：列出项目需要哪些依赖，以及 `npm run build` 这样的命令具体执行什么。
- **package-lock.json**：记录实际解析出的依赖版本，让下一次安装尽量复现同一组依赖。

访问博客的读者不需要安装 Node.js。Node.js 在生成网站的时候发挥作用。

### 2.3 Git 与 GitHub：记录版本、保存源码

Git 在本地管理修改记录；GitHub 保存远程仓库。我的文章、配置和发布流程都能跟随 Git 提交保存下来。

这也意味着：文章误改之后，可以通过历史记录找到之前的版本。

### 2.4 GitHub Actions 与 GitHub Pages：一个负责执行，一个负责托管

| 名称 | 在本项目中的职责 | 我通常在哪里查看 |
| --- | --- | --- |
| GitHub Actions | 启动构建机器、安装依赖、运行 Hexo、调用发布步骤 | 仓库顶部 Actions |
| GitHub Pages | 提供网站托管与公开访问地址 | 仓库 Settings → Pages |

完整链路如下：

```text
我的电脑                        GitHub
────────                        ──────
修改 Markdown
    │
本地预览
    │
提交、上传源码 ────────────────► main 分支更新
                                    │
                                    ▼
                              Actions 开始运行
                                    │
                              npm ci 安装依赖
                                    │
                              Hexo 生成 public/
                                    │
                              发布网页产物
                                    │
                                    ▼
                              GitHub Pages 托管
                                    │
                                    ▼
                             读者通过 HTTPS 访问
```

因此，我的电脑关机以后，已经发布的网站仍由 GitHub Pages 提供访问。平台的静态托管方式可见 [GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)。

<a id="roles"></a>

## 三、我和 Codex 分别完成了哪些事情

这次并不是“我复制了一组命令，然后所有事情都自动成功”。实际过程包含需求确认、页面操作、代码修改、上传和验证。

| 阶段 | 我做的事情 | Codex 做的事情 |
| --- | --- | --- |
| 了解工具 | 询问 Hexo 是什么、怎么搭建 | 解释静态博客、工具分工和实现步骤 |
| 确定范围 | 先要求讲清流程，随后明确要求实现 | 先检查环境；得到实现指令后才创建项目 |
| 本地建站 | 提供当前博客工作目录 | 初始化 Hexo，安装依赖，配置中文和主题 |
| 内容与预览 | 查看搭建结果 | 创建示例文章，启动服务，检查页面和资源 |
| 公开访问 | 询问怎样让别人访问 | 提出 GitHub Pages 方案，准备自动发布文件 |
| GitHub 准备 | 在自己的账号下准备仓库，提供 Pages 页面截图 | 根据截图识别私有仓库导致的 Pages 限制，并说明设置位置 |
| 开启 Pages | 将仓库改为公开，按指引完成 Pages 设置并告知“现在好了” | 确认仓库公开、读取权限和默认分支，然后开始上传 |
| 首次发布 | 提供目标仓库地址 | 上传源码、触发构建、检查发布任务和线上网页 |
| 修改网址 | 选择新网址，实际修改 GitHub 用户名和仓库名 | 解释命名规则，更新本地远程地址、文档并重新发布 |
| 记录过程 | 要求把整个过程写成详细博客并发布 | 整理本篇文章、检查生成结果并提交到发布流程 |

账号改名和仓库改名是我在 GitHub 页面完成的。项目文件、发布脚本和验证工作主要由 Codex 完成。阅读这份记录时，需要把这两类动作分开。

<a id="setup"></a>

## 四、检查电脑环境与创建项目

### 4.1 先检查，不盲目重复安装

Codex 先检查了当前目录、Git 状态，以及电脑里是否已有 Node.js、npm 和 Git。

本次机器上的实际结果是：

```text
Node.js  v24.19.0
npm      11.17.0
Git      2.50.1（Apple Git）
```

这些工具已经存在，所以本次没有重新安装 Node.js 或 Git。Hexo 8 要求的最低 Node.js 版本为 20.19.0，本次环境满足要求。选择版本时应查看官方文档的兼容性表，不要只照抄页面中可能较旧的安装示例。[Hexo 版本要求](https://hexo.io/zh-cn/docs/)

读者可以在终端自行检查：

```bash
node --version
npm --version
git --version
```

如果提示命令不存在，需要先安装相应工具，再继续初始化。

### 4.2 我看到的是“空项目”，工具看到的却不是空文件夹

当前博客目录没有业务文件，但已经包含 `.git` 目录。

Codex 最初尝试：

```bash
npx --yes hexo-cli init .
```

实际失败提示包含：

```text
target not empty
```

原因是 Hexo 初始化要求目标目录为空；已有的 `.git` 也属于目录内容。

**这不是 Node.js 安装失败，也不需要删除现有 Git 仓库。**

### 4.3 本次采用的办法：临时目录初始化，再保留原仓库复制文件

Codex 在临时目录初始化官方脚手架，先不安装依赖，然后把模板文件复制到原博客目录，保留原来的 `.git`，最后在正式工作目录运行 `npm install`。

下面是这一办法的可复现写法。临时目录名经过泛化，操作含义与本次一致；执行时应站在自己的博客项目目录内：

```bash
temp_blog_dir=$(mktemp -d)
npx --yes hexo-cli init "$temp_blog_dir" --no-install
rsync -a --exclude=.git --exclude=.github "$temp_blog_dir/" ./
npm install
```

- `npx` 临时调用 Hexo CLI；本次没有使用全局安装 `hexo-cli` 的方式。
- `--no-install` 将下载模板和安装依赖分开。
- `rsync` 复制模板内容，包括需要的隐藏文件。
- 排除 `.github` 是为了随后使用本项目自己的发布工作流。
- 这条复制命令只适合目标目录没有需要保护的同名业务文件时；已有博客不应该重新初始化覆盖。

**如果读者从一个全新的目录开始，通常不需要这一步绕行：**

```bash
npx --yes hexo-cli init my-blog
cd my-blog
```

这是一条替代路线，不要在已经初始化好的博客上再运行一次。

### 4.4 安装以后得到哪些东西

本次安装得到 Hexo 8.1.2 和 Landscape 1.1.0，以及文章索引、归档、标签、分类等生成器和渲染器。

安装时出现了部分上游包的弃用提示，当次审计报告为 `0 vulnerabilities`。这个结果只代表那次依赖审计，并不等于之后永远没有漏洞。真正判断项目是否能用，还要继续执行生成和访问检查。

<a id="configuration"></a>

## 五、把默认博客改成中文技术博客

### 5.1 修改站点信息

Codex 在 `_config.yml` 中设置了：

```yaml
title: 我的技术博客
subtitle: 记录开发与学习
description: 开发笔记、学习记录与实践总结。
author: 博主
language: zh-CN
timezone: Asia/Singapore

url: http://localhost:4000
permalink: :year/:month/:day/:title/

theme: landscape
```

几个字段的意义：

| 字段 | 作用 |
| --- | --- |
| title | 网站名称，与 GitHub 用户名无关 |
| subtitle | 网站副标题 |
| author | 默认作者名称 |
| language | 主题使用的语言 |
| timezone | 日期和时间采用的时区 |
| url | 生成完整链接时使用的网站基础地址 |
| permalink | 文章网址的组织规则 |
| theme | 当前使用的主题 |

这里最容易疑惑的是 `url` 仍然是本地地址。**线上构建会读取另一份临时配置覆盖它**，详细机制放在第九节；它不会让已经发布的博客必须依赖本地电脑。

### 5.2 主题配置独立保存

主题来自 npm 包，没有把它复制成一整套自己维护的主题。Codex 在根目录的 `_config.landscape.yml` 中写入以下覆盖项：

```yaml
menu:
  首页: /
  归档: /archives/

excerpt_link: 阅读全文
rss: false
favicon: false
fancybox: false
widgets:
  - category
  - tag
  - archive
  - recent_posts
```

结果是导航和“阅读全文”按钮中文化，侧边栏保留分类、标签、归档和最近文章。没有配置 RSS 生成器时，先关闭 RSS 入口，避免出现指向不存在订阅文件的链接。

### 5.3 用少量样式改善中文阅读

Codex 保留官方主题的横幅、文章卡片与布局，另外创建 `source/css/blog.css`，主要调整：

- 中文系统字体优先，正文为 16px。
- 正文行高为 1.9。
- 长文本可以换行，代码块可以横向滚动。
- 图片最大宽度不超过正文区域。
- 链接增加键盘焦点轮廓。
- 小屏幕下调整博客名称字号。

通过 `scripts/blog-style.js` 的 Hexo 扩展入口加载该样式：

```javascript
'use strict';

hexo.extend.injector.register('head_end', function () {
  const urlFor = hexo.extend.helper.get('url_for').bind(hexo);
  return `<link rel="stylesheet" href="${urlFor('/css/blog.css')}">`;
});
```

这里使用 `url_for`，是为了让链接跟随站点的根路径变化：博客曾经部署在子目录，后来才迁移到域名根目录。

这些自定义内容放在项目自己的源文件里，没有直接修改 `node_modules` 中的主题文件。这样重新安装依赖时，自己的修改仍然存在。

### 5.4 创建一篇真正可以打开的示例文章

Codex 替换了默认 Hello World，创建：

```text
source/_posts/hello-hexo.md
```

文章包含标题、日期、分类、标签、小标题、列表、引用和 JavaScript 代码示例。首页只展示摘要，点击“阅读全文”进入完整文章。

这一步既是示范，也是最基本的内容验证：需要有一篇真实文章，才能检查首页、文章页、分类与标签是否相互连通。

<a id="preview"></a>

## 六、启动本地预览，理解 localhost

### 6.1 项目命令是什么

本项目 `package.json` 中的脚本如下：

```json
{
  "build": "hexo generate",
  "build:pages": "node tools/build-pages.mjs",
  "clean": "hexo clean",
  "dev": "hexo server --ip 127.0.0.1",
  "server": "hexo server --ip 127.0.0.1",
  "new": "hexo new"
}
```

这段是 `scripts` 字段的内容，不是让读者用它替换完整的 `package.json`。

在项目目录运行：

```bash
npm run build
npm run dev
```

本次生成成功后，服务输出：

```text
Hexo is running at http://127.0.0.1:4000/
```

打开这个地址，就能在自己的电脑上看博客。修改文章后刷新页面；修改配置后通常需要停止并重启预览。终端按 `Ctrl+C` 停止服务。

### 6.2 为什么把这个地址发给别人没有用

`127.0.0.1` 是回环地址，表示访问者自己的电脑。`localhost` 通常也指向本机。

我打开 `http://127.0.0.1:4000/`，访问的是我的电脑；朋友打开同样的地址，访问的却是朋友自己的电脑。

而且本项目启动命令明确监听 `127.0.0.1`，服务只提供本机预览。所以本地预览成功之后，仍然需要另一个“发布到互联网”的步骤。

### 6.3 本地做了哪些检查

首次搭建时，Codex 完成了静态网页生成、生成文件中的内部链接检查，以及 HTTP 请求验证。其中：

- 共检查了 8 个生成的 HTML 页面。
- 验证了按项目子目录部署时，链接是否带上正确前缀。
- 本地 13 个页面和资源地址返回 HTTP 200。

这些是生成结果和 HTTP 层面的检查。它们并不代表做过全面的浏览器兼容性、手机截图或所有交互测试。

<a id="repository"></a>

## 七、创建 GitHub 仓库，处理 Pages 不可用

### 7.1 最初准备的仓库

我最初使用的账号与仓库是：

```text
用户名：whxo888888-bot
仓库名：yuanqing.github.io
```

这个仓库一开始是私有的。打开 Settings → Pages 时，页面显示需要升级套餐或把仓库改为公开，才能启用 Pages。

我把这个页面截图发给 Codex，询问“GitHub Actions 在哪”。

### 7.2 当时看不到选项的真正原因

页面顶部已经有 Actions 标签，但我们要设置的是 **Settings → Pages 中的发布来源**。

当时真正阻挡操作的是私有仓库限制，并不是我没有找到顶部的 Actions。GitHub Free 支持公开仓库的 Pages；私有仓库的 Pages 可用性取决于套餐。[官方适用范围](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

我按指引完成仓库公开设置。相关路径是：

```text
仓库 Settings
    → General
    → 页面底部 Danger Zone
    → Change repository visibility
    → Public
```

公开仓库意味着文章源文件和配置也会公开，不能把登录令牌、私人资料或不准备公开的文件混在其中。

### 7.3 设置发布来源

随后在仓库页面进入：

```text
Settings → Pages → Build and deployment → Source
```

选择：

```text
GitHub Actions
```

这个项目已经准备了工作流文件，因此不需要再在页面上挑选 Jekyll 模板或另建一套工作流。[Hexo 官方部署说明](https://hexo.io/zh-cn/docs/github-pages)

我告知设置完成后，Codex 通过 GitHub 连接确认仓库已经公开，并确认有写入权限、默认分支为 `main`，再继续上传。

<a id="workflow"></a>

## 八、让 GitHub Actions 自动构建并发布

### 8.1 为什么要写一个 YAML 文件

GitHub 不会仅凭“仓库里存在 Markdown”就知道怎样运行 Hexo。需要一个文件告诉它：什么时候运行、准备什么环境、执行什么命令、发布哪个目录。

这个文件是：

```text
.github/workflows/pages.yml
```

以下是本项目实际使用的完整工作流：

```yaml
name: Publish Hexo to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: github-pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Read Pages URL
        id: pages
        uses: actions/configure-pages@v5
      - name: Generate blog
        run: npm run build:pages
        env:
          PAGES_BASE_URL: ${{ steps.pages.outputs.base_url }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: public

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Publish
        id: deployment
        uses: actions/deploy-pages@v4
```

这些 Action 版本是本次验证通过的配置，不表示之后永远不需要维护。

### 8.2 逐步读懂这个文件

| 配置 | 实际发生的事情 |
| --- | --- |
| push → main | main 分支出现新提交时，自动开始 |
| workflow_dispatch | 登录后可以在 Actions 页面手动运行 |
| runs-on: ubuntu-latest | GitHub 为任务提供一台 Linux 构建机器 |
| checkout | 把当前仓库源码取到构建机器 |
| setup-node | 按 `.nvmrc` 安装 Node.js，本项目写的是 `24` |
| npm ci | 根据锁文件安装依赖 |
| configure-pages | 读取当前 Pages 的站点信息，包括线上基础网址 |
| npm run build:pages | 用线上网址生成 HTML 和资源 |
| upload-pages-artifact | 把 `public/` 打包成供发布步骤使用的产物 |
| deploy 的 needs: build | 只有构建成功，才执行发布 |
| deploy-pages | 把网页产物发布到 GitHub Pages |

`cache: npm` 主要复用 npm 下载缓存，并不意味着不再安装依赖。真正安装仍由 `npm ci` 完成。

`contents: read` 用于读取源码；部署任务单独需要 `pages: write` 和 `id-token: write`。本项目没有把个人访问令牌写进 YAML 文件。

### 8.3 为什么不把 public 目录提交上去

`public/` 是生成产物。文章和配置发生变化时，构建机器会重新生成它。

仓库提交的是“原料和加工说明”，发布任务接收的是“加工后的网页”。这样避免源文件和旧生成文件一起维护，产生版本不一致。

本项目 `.gitignore` 排除了：

```gitignore
node_modules/
public/
db.json
*.log
.deploy*/
_multiconfig.yml
_config.pages.json
.env
.env.*
!.env.example
```

其中 `_config.pages.json` 是稍后说明的临时线上配置。忽略规则只影响尚未被 Git 跟踪的文件；如果秘密已经提交过，事后加一条 `.gitignore` 并不能抹掉历史。

<a id="production-config"></a>

## 九、为什么要区分本地网址和线上网址

### 9.1 我们实际经历了两种网站路径

| 阶段 | 网址 | 站点根路径 |
| --- | --- | --- |
| 首次发布 | `https://whxo888888-bot.github.io/yuanqing.github.io/` | `/yuanqing.github.io/` |
| 改名以后 | `https://whxo888888.github.io/` | `/` |

假设样式文件位于 `public/css/blog.css`：

- 首次发布时，它对应 `/yuanqing.github.io/css/blog.css`。
- 改名以后，它对应 `/css/blog.css`。

如果路径写错，可能出现“首页能打开，但没有样式”“点击归档就 404”等问题。

### 9.2 本项目的实际做法

Codex 编写了 `tools/build-pages.mjs`，从环境变量读取 Pages 提供的网址，为这一次构建写入临时配置。

完整代码如下：

```javascript
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
```

### 9.3 用新网址走一遍

Actions 传入：

```text
PAGES_BASE_URL=https://whxo888888.github.io
```

临时配置相当于：

```json
{
  "url": "https://whxo888888.github.io/",
  "root": "/"
}
```

Hexo 同时读取原始配置和临时配置，后一份覆盖前一份的同名字段；`finally` 确保生成结束或出错后清理临时文件。

这样，本地继续使用 `npm run dev`，线上通过 `npm run build:pages` 使用真实网址，不必每次发布前手动把 `_config.yml` 改来改去。

### 9.4 在本地模拟一次线上构建

下面的命令是在 macOS/Linux 终端中的复现方式，会重新生成本地 `public/`：

```bash
PAGES_BASE_URL=https://whxo888888.github.io npm run build:pages
```

执行它只是在本地生成文件，**不会自动上传到 GitHub 或发布到 Pages**。真正发布还需要提交源码并触发工作流。

本次在首次上线前，还用一个带 `/blog/` 前缀的测试网址构建过，检查了 8 个 HTML 页面中的内部链接和资源引用。确认子目录规则正确后，又恢复了本地预览构建。

<a id="first-publish"></a>

## 十、首次上传的实际经过

### 10.1 原本准备使用普通 Git 推送

确认远程仓库为空后，Codex 创建本地提交，关联当时的远程仓库，然后尝试推送 `main` 分支。

一般情况下，读者可以使用以下流程。这里已经替换成最终的仓库地址：

```bash
git add .
git commit -m "Set up Chinese Hexo blog"
git remote add origin https://github.com/whxo888888/whxo888888.github.io.git
git push -u origin main
```

如果已经存在 `origin`，就不该再次执行 `git remote add origin`。应先用 `git remote -v` 检查，必要时改用 `git remote set-url origin 新地址`。

### 10.2 本次推送没有顺利完成

本地提交成功了，但随后上传进程中断，命令返回码为 137。

Codex 再次查询远程分支，确认远程仍然没有收到提交。因此，当时不能把“本地 commit 成功”说成“GitHub 已收到源码”。

**这次没有查明中断的确切原因。** 不能仅凭返回码，就把它断言成 GitHub 密码错误、权限不足或网络故障。

### 10.3 改用已经连接的 GitHub 工具上传

本次实际成功的上传路径，是 Codex 已连接的 GitHub 工具。它使用仓库 API 完成以下步骤：

1. 在空仓库创建 README，初始化远程分支。
2. 读取已经检查过的 16 个项目文件。
3. 创建一个包含这些文件内容的 Git tree。
4. 创建指向该 tree 的提交。
5. 将远程 `main` 分支推进到新提交，未使用强制覆盖。

这里的 tree 可以理解为“这一版提交中，路径分别对应哪些文件内容”；commit 则记录这份快照及其历史关系。

**普通读者不需要为了搭博客学习这套 API。** 如果本机 Git 推送正常，用正常的 `git push` 即可。之所以记下这个过程，是为了准确交代此次确实采用的上传方式。

### 10.4 为什么后来要同步本地历史

API 创建的远程提交与先前本地创建的提交，文件内容可以相同，但提交编号和历史并不相同。

Codex 先 fetch 远程提交，比较本地和远程文件完全一致，再同步本地分支到远程记录并设置上游分支。这里没有删除文章内容，也没有把不同内容强行覆盖到一起。

如果只是按普通 Git 命令推送，通常不会遇到这一段历史同步问题。日常使用以 `git pull --ff-only`、正常 commit 和 push 为主，不要把本次特殊处理照搬成每次发布的固定步骤。

<a id="verification"></a>

## 十一、怎么证明博客真的发布成功

### 11.1 需要分开看三件事

| 看到的证据 | 证明了什么 | 还不能证明什么 |
| --- | --- | --- |
| GitHub 上能看到文件 | 源码上传成功 | 不代表网页已经生成 |
| Actions 的 build 成功 | 依赖安装与 Hexo 构建成功 | 不代表 Pages 已完成发布 |
| deploy 成功，线上页面和资源能访问 | 这次部署已完成，抽查的访问链路正常 | 不代表所有设备和网络都经过完整测试 |

这次 Codex 检查了 build 和 deploy 两个任务的结果，再访问真实网址。

### 11.2 首次发布留下的记录

首次完整建站提交为：

```text
522f79e  Set up Chinese Hexo blog with GitHub Pages deployment
```

对应的 [首次发布工作流记录](https://github.com/whxo888888/whxo888888.github.io/actions/runs/34965150606) 中，build 与 deploy 都成功。

随后对当时的公开网址请求了首页、示例文章、归档、两份 CSS、横幅图片和 JavaScript 文件，7 个请求均返回 HTTP 200。文章标题、正文以及生成的绝对网址也进行了检查。

### 11.3 本次验证的边界

HTTP 200 表示服务器成功响应；它需要与页面内容检查一起看，避免“返回了一页错误提示，但状态码碰巧是 200”。

本次确认了关键页面内容与资源路径，没有做全面的跨浏览器测试，也没有把手机实测、搜索引擎收录或外部 CDN 在所有地区的可用性写成已经验证的结果。

<a id="rename"></a>

## 十二、把网址改为 whxo888888.github.io

### 12.1 第一次网址为什么比较长

最开始的组合是：

```text
账号：whxo888888-bot
仓库：yuanqing.github.io
```

账号名和仓库名没有构成 GitHub 用户站点要求的对应关系，因此使用的是项目站点地址：

```text
https://whxo888888-bot.github.io/yuanqing.github.io/
```

我最初询问能否改成 `yuanqing.github.io`，后来决定使用 `whxo888888.github.io`。

GitHub 的用户或组织站点需要仓库名为 `账号名.github.io`。仅把仓库取名为某个 `.github.io`，不会得到任意同名子域名。[GitHub Pages 命名规则](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

### 12.2 我实际修改了两处

| 对象 | 修改前 | 修改后 |
| --- | --- | --- |
| GitHub 用户名 | whxo888888-bot | whxo888888 |
| 博客仓库名 | yuanqing.github.io | whxo888888.github.io |

**第一处：修改账号用户名。**

1. 点击 GitHub 右上角头像，进入个人 Settings。
2. 左侧选择 Account。
3. 找到 Change username。
4. 阅读改名提示，输入 `whxo888888`。
5. 确认名称可用后完成修改。

这里修改的是账号用户名，个人资料里的显示名称不能改变 `github.io` 地址。[官方修改用户名步骤](https://docs.github.com/en/account-and-profile/how-tos/account-management/changing-your-username)

用户名改动会影响账号级链接，旧个人主页也不会全部自动跳转。如果账号已经用于很多项目，应先阅读 [用户名变更影响](https://docs.github.com/en/account-and-profile/concepts/username-changes)。

**第二处：修改仓库名。**

1. 打开博客仓库。
2. 进入 Settings → General。
3. 在 Repository name 中填入 `whxo888888.github.io`。
4. 点击 Rename。

这是 GitHub 仓库本身的名称，与电脑上保存项目的文件夹名字可以不同。[官方仓库改名步骤](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)

### 12.3 我改好后，Codex 接着完成了什么

我告知“改好了”以后，Codex 没有直接假设改名成功，而是重新读取仓库信息，确认新的账号、仓库和公开状态。

接着执行本地远程地址更新：

```bash
git remote set-url origin https://github.com/whxo888888/whxo888888.github.io.git
git fetch origin
```

然后更新 README 中的仓库名和博客网址，提交这次文档修改，让 `main` 出现新提交并触发重新发布，再使用 `git pull --ff-only` 同步回本地。

对应提交是：

```text
82851c1  Update blog URL after account and repository rename
```

### 12.4 为什么改名之后还要重新发布

已经生成的 HTML 可能仍包含旧域名或旧子目录。账号与仓库改名，并不能代替 Hexo 重新生成正确的链接。

新的构建从 Pages 读取新网址，由 `build-pages.mjs` 得到根路径 `/`，于是文章和资源引用也一起更新。

这次 [改名后的发布记录](https://github.com/whxo888888/whxo888888.github.io/actions/runs/34966525124) 显示 build、deploy 均成功。之后对新域名上的 7 个页面及资源请求进行了检查，均为 HTTP 200；首页和示例文章的生成链接不再残留旧域名、旧项目路径。

### 12.5 不要依赖旧博客网址自动跳转

GitHub 对仓库地址提供的重定向，不等于旧的 Pages 项目网址一定会继续工作。官方仓库改名说明明确区分了项目站点网址。[仓库改名与重定向说明](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)

所以，我之后对外分享统一使用新网址：[https://whxo888888.github.io/](https://whxo888888.github.io/)。

<a id="daily-use"></a>

## 十三、以后如何写文章、加图片和更新博客

### 13.1 从已有项目继续写

在已有博客项目目录打开终端：

```bash
git pull --ff-only
npm run new -- "我的下一篇技术笔记"
```

如果是第一次把远程仓库下载到一台新电脑，可以先执行：

```bash
git clone https://github.com/whxo888888/whxo888888.github.io.git
cd whxo888888.github.io
npm ci
```

`npm run new -- "标题"` 中的 `--` 用于把后面的参数传给 Hexo。[Hexo 写作说明](https://hexo.io/zh-cn/docs/writing)

### 13.2 文章文件怎么写

新文件位于 `source/_posts/`。示例：

```markdown
---
title: 我的下一篇技术笔记
date: 2026-09-16 10:00:00
tags:
  - 学习笔记
categories:
  - 技术
---

这里写一小段摘要，说明文章解决什么问题。

<!-- more -->

## 背景

说明遇到了什么问题。

## 处理过程

记录执行的步骤和观察到的结果。

## 总结

写下结论，以及仍没有验证的部分。
```

顶部两条 `---` 之间叫 Front-matter，是文章元数据；下面才是正文。日期应填写实际写作或发布时间。当前项目允许生成未来日期的文章，所以不要把上述示例时间当成定时发布开关。

### 13.3 图片怎么放

当前站点部署在域名根目录，可以在 `source/images/` 放图片：

```text
source/images/my-first-post/screenshot.png
```

正文中引用：

```markdown
![操作截图](/images/my-first-post/screenshot.png)
```

Hexo 会把源图片复制到生成目录。这里的图片名只是示例，需要先放入真实文件。

如果将来再次部署到项目子目录，手写的图片绝对路径也需要带上站点前缀。主题里通过 `url_for` 生成的链接可以自动处理路径，但普通 Markdown 中自己写死的路径不能一概认为会自动修正。

### 13.4 预览和生成检查

```bash
npm run dev
```

打开本地地址，检查：

- 标题和摘要是否正确。
- “阅读全文”能否进入文章。
- 小标题、列表、表格和代码块是否清楚。
- 图片是否存在。
- 分类、标签是否符合预期。

需要生成静态文件时：

```bash
npm run build
```

### 13.5 提交文章，等待自动发布

可以只添加本次文章和对应图片，提交前先确认修改范围：

```bash
git status
git add source/_posts/我的下一篇技术笔记.md
git diff --cached
git commit -m "Add a new technical post"
git push
```

如果添加了图片，还需要把相应的 `source/images/` 文件加入提交。

推送后打开 [Actions 页面](https://github.com/whxo888888/whxo888888.github.io/actions)，查看最新提交对应的工作流，等待 build 和 deploy 成功，再访问公开文章地址。

本次初始环境中的命令行推送曾中断，因此这里的 `git push` 是标准使用方法，不代表那次命令行认证问题已经被彻底排除。若再次遇到问题，应先检查 Git 凭据和命令输出；通过已经授权的 GitHub 连接提交文件也是这次验证过的替代路径。

### 13.6 哪些东西可以改，哪些不要直接改

| 内容 | 应该修改的位置 |
| --- | --- |
| 文章正文 | source/_posts/*.md |
| 网站名称、默认作者 | _config.yml |
| 导航和侧边栏 | _config.landscape.yml |
| 自己的阅读样式 | source/css/blog.css |
| 新文章默认模板 | scaffolds/post.md |
| 发布步骤 | .github/workflows/pages.yml |

不要直接编辑 `public/` 中的文章 HTML，也不要把 `node_modules` 中主题文件的修改当成长期保存办法。前者会被下一次生成覆盖，后者会受重新安装影响。

文章文件名参与默认 URL 的生成。上线后改名可能改变文章网址，已有分享链接也需要随之处理。

<a id="troubleshooting"></a>

## 十四、本次遇到的问题与排查顺序

| 现象 | 本次的原因或判断 | 采取的处理 |
| --- | --- | --- |
| Hexo 初始化提示 target not empty | 项目里已有 .git，目录不是空的 | 临时目录初始化，再复制模板并保留原仓库 |
| 本地能看，别人打不开 | 访问的是本机回环地址 | 发布到 GitHub Pages |
| Pages 页面看不到发布来源 | 当时仓库私有，当前套餐不能直接启用 | 我将博客仓库改为公开，再选择 Actions |
| 找不到“GitHub Actions 在哪里” | 混淆顶部运行记录入口与 Pages 发布来源选项 | 分清 Actions 页与 Settings → Pages |
| 本地提交成功但远程仍为空 | 上传进程中断，原因未确定 | 查询远程确认未收到，再通过 GitHub 连接上传 |
| 仓库叫 yuanqing.github.io，却拿不到同名网址 | 账号名与用户站点命名要求不匹配 | 解释规则，并按最终目标同时修改账号与仓库名 |
| 改名后担心 CSS 和文章链接仍指向旧路径 | 静态文件中的链接需要重新生成 | 用 Pages 的真实地址重新构建、发布和检查 |
| 读取发布状态遇到 API 限流 | 当次未认证接口返回 403 rate limit exceeded | 通过公开 Actions 页面定位运行记录，再用已连接工具查询任务状态 |
| 未登录浏览器打开仓库 Settings 显示 404 | 那个浏览器会话没有登录 | 不把设置页 404 当成仓库丢失，使用已授权连接及公开发布记录确认状态 |

后两项是这次操作工具时遇到的问题，读者正常在自己的已登录浏览器中操作，不一定会遇到。

### 14.1 如果 Actions 红了，先找到失败的步骤

建议按顺序排查：

1. **安装依赖失败**：检查 Node.js 版本、锁文件是否提交、下载错误。
2. **读取 Pages URL 失败**：检查 Settings → Pages 的发布来源和仓库状态。
3. **生成文章失败**：查看报错文件，检查 YAML 缩进、Front-matter 和模板语法。
4. **上传产物失败**：确认 `public/` 已生成，而且配置的目录正确。
5. **部署失败**：查看 deploy 任务的具体错误、Pages 权限及环境要求。

错误出在哪一步，就先看那一步的日志；不能把所有失败都归结为“GitHub 没刷新”。

### 14.2 如果网页 404 或没有样式

依次确认：

1. 正在访问的是否为最终网址，而不是旧域名或旧子路径。
2. 最新发布是否对应自己的最新提交。
3. deploy 是否完成，不能只看 build。
4. 页面中实际引用的 CSS、图片、文章链接路径是否正确。
5. 本地生成目录中是否确实存在目标文件。

如果是缓存或传播延迟，可以稍等后重新请求；如果文件路径本身错误，就需要修正配置并重新构建。

<a id="reproduce"></a>

## 十五、从头复现的最短路线

前文是完整实录。如果读者想自己搭一个类似博客，可以按下面的顺序执行：

1. **先决定账号和仓库名。** 如果希望使用 `你的用户名.github.io`，仓库名就设置为 `你的用户名.github.io`。
2. **准备环境。** 安装与所选 Hexo 版本兼容的 Node.js 和 Git。
3. **初始化空目录。** 使用 `npx --yes hexo-cli init my-blog`，再进入项目。
4. **配置中文与主题。** 修改 `_config.yml`、主题配置，写一篇测试文章。
5. **本地预览。** 用 Hexo server 或项目脚本启动，确认文章、归档和图片可访问。
6. **准备公开仓库与 Pages。** 使用符合自己套餐条件的仓库，发布来源选择 GitHub Actions。
7. **加入工作流与生产构建脚本。** 本文给出了本项目的完整文件，并且还需要 `.nvmrc` 写入 `24`、`package.json` 中定义相应脚本。
8. **提交源码和锁文件。** `public/`、`node_modules/`、缓存和秘密文件不提交。
9. **推送 main。** 在 Actions 看构建及部署结果。
10. **访问真正的网址。** 至少检查首页、一篇文章、归档、CSS 和图片。

如果采用本项目源码作为起点，还要把博客名称、作者、仓库地址、README 和示例文章替换成自己的信息。不要把本文的用户名直接当成自己的账号。

<a id="summary"></a>

## 十六、项目文件地图与总结

```text
博客项目/
├── _config.yml                 站点资料与 Hexo 配置
├── _config.landscape.yml       Landscape 主题覆盖配置
├── package.json                依赖声明与常用命令
├── package-lock.json           实际依赖版本记录
├── .nvmrc                      构建使用的 Node.js 主版本
├── .gitignore                  不提交的文件规则
├── README.md                   项目使用说明
├── scaffolds/                  新文章、页面与草稿模板
├── scripts/
│   └── blog-style.js            加载自定义阅读样式
├── tools/
│   └── build-pages.mjs          线上网址与路径的构建入口
├── source/
│   ├── _posts/                  文章源文件，包括本文
│   └── css/blog.css             自定义样式
├── .github/workflows/
│   └── pages.yml                自动构建与发布
├── themes/                     当前仅保留目录占位
├── node_modules/               安装的依赖和官方主题，不提交
└── public/                     自动生成的网页，不直接修改
```

这次搭建让我真正分清了几件事：

- **写好文章**，是源文件层面的完成。
- **Hexo 生成成功**，是网页产物层面的完成。
- **上传 GitHub**，是源码进入远程仓库。
- **GitHub Actions 执行成功**，需要进一步区分 build 和 deploy。
- **读者能打开正确的网页和资源**，才是这次发布最终要确认的结果。

我主要负责需求、GitHub 页面上的账号与仓库操作，以及最终网址的选择；Codex 负责具体项目实现、发布配置、源码上传和结果检查。

最终建立起来的日常流程很简单：

```text
写 Markdown → 本地预览 → 提交到 main → 自动构建与发布 → 检查线上文章
```

以后网站内容的增长，主要发生在 `source/_posts/`。从记录一个具体问题开始，再把排查过程、证据与结论写清楚，就是这个技术博客最实际的用途。

### 参考与实际记录

- [Hexo 官方文档与版本要求](https://hexo.io/zh-cn/docs/)
- [Hexo 写作说明](https://hexo.io/zh-cn/docs/writing)
- [Hexo 部署到 GitHub Pages](https://hexo.io/zh-cn/docs/github-pages)
- [GitHub Pages 类型与适用范围](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [修改 GitHub 用户名](https://docs.github.com/en/account-and-profile/how-tos/account-management/changing-your-username)
- [用户名变更影响](https://docs.github.com/en/account-and-profile/concepts/username-changes)
- [修改仓库名称](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)
- [本博客源码仓库](https://github.com/whxo888888/whxo888888.github.io)
- [首次完整发布记录](https://github.com/whxo888888/whxo888888.github.io/actions/runs/34965150606)
- [改名后的发布记录](https://github.com/whxo888888/whxo888888.github.io/actions/runs/34966525124)
