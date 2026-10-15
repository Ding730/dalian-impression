# 大连印记：从过去到未来的数字漫游

一个纯静态网站（HTML5 + CSS3 + 原生 JavaScript + ECharts + GSAP），
用**交互式时间轴**、**老地图联动**、**数据可视化大屏**、**未来规划互动地图**与**城市问答**讲述大连从 1899 年建市到面向未来的城市故事。

> 部署相关说明在本文件下方：**本地网址 / 局域网网址 / 公网网址（4 种方式）**。

---

## 一、目录结构

```
数媒/
├── index.html              主页面（首页 / 历史长廊 / 今日大连 / 未来规划 / 城市问答）
├── 404.html                自定义错误页（托管平台自动生效）
├── css/style.css           样式表（设计系统 + 全部动效）
├── js/main.js              交互逻辑（时间轴、地图联动、图表、问答、留言板）
├── vendor/                 本地依赖（离线也能正常运行）
│   ├── echarts.min.js          Apache ECharts 5.4.3
│   ├── gsap.min.js             GSAP 3.12.2
│   └── ScrollTrigger.min.js    GSAP ScrollTrigger 3.12.2
├── favicon.svg             网站图标
├── site.webmanifest        站点清单（可添加到手机桌面，全屏运行）
├── robots.txt              搜索引擎抓取规则
├── sitemap.xml             站点地图
├── netlify.toml            Netlify / Cloudflare Pages 部署与缓存配置
├── .nojekyll              GitHub Pages 用（避免忽略特殊目录）
├── serve.bat               双击即可启动本地网站（生成网址）
├── publish.bat             一键推送到 GitHub / Gitee
└── backup/                 初版原型与自检脚本（可删除）
```

---

## 二、本地网址（最快，双击即可）

双击 **`serve.bat`**，会自动打开浏览器并显示：

* 本机网址：`http://localhost:8000/index.html`
* 局域网网址：`http://<本机IP>:8000/index.html`

也可以手动执行：

```powershell
cd d:\数媒
python -m http.server 8000
```

然后在浏览器打开 `http://localhost:8000/index.html`。
**局域网分享**：手机/评委电脑连同一个 Wi-Fi，用 `http://<本机IP>:8000/index.html` 打开即可（本机当前 WLAN 地址示例：`http://10.15.214.14:8000/index.html`）。
> 若打不开，请允许 Windows 防火墙放行 Python 的专用网络访问。

---

## 三、公网网址（任选一种，5 分钟搞定）

### 方式 1：Netlify Drop（最简单，无需命令行）

1. 打开 <https://app.netlify.com/drop>（注册登录后可长期保留）；
2. 把 **`d:\数媒` 整个文件夹**拖进页面；
3. 稍等几秒即获得公网网址，形如 `https://random-name-123.netlify.app`；
4. 在 Site settings → *Change site name* 可改成 `https://dalian-impression.netlify.app`；
5. 之后要更新：把这个文件夹重新拖一次即可。

### 方式 2：GitHub Pages（详细步骤，两种上传方式）

**前置**：注册/登录 GitHub（<https://github.com>）。国内若打不开，可换网络、用手机热点，或稍后再试。
**网址形式**：`https://<你的用户名>.github.io/<仓库名>/`（**结尾的 `/` 不能少**）。

#### 步骤 A：网页上传（不需要装 Git，最直观）

1. 右上角 `+` → **New repository**；
   * Repository name 填 `dalian-impression`（英文小写，会出现在网址里）；
   * 可见性选 **Public**（Private 仓库的 Pages 需要付费）；
   * **不要**勾选 Add README / .gitignore（要空仓库）→ **Create repository**。
2. 在新仓库页面点 **uploading an existing file**（或 Add file → Upload files）。
3. 打开资源管理器地址栏输入 `d:\数媒` 回车，**Ctrl+A 全选**里面的内容（`index.html`、`404.html`、`css`、`js`、`vendor`、`favicon.svg`、`site.webmanifest`、`robots.txt`、`sitemap.xml`、`netlify.toml`、`README.md` …），
   整个拖进上传框；等进度条跑完。
4. 页面底部 Commit changes → 提交完成。
5. 仓库 → **Settings → Pages** → Source 选 **Deploy from a branch** → Branch 选 `main` + `/ (root)` → **Save**。
6. 等 1–2 分钟刷新该页，顶部会出现 `Your site is live at https://<用户名>.github.io/dalian-impression/`，点开即可。
7. 把站点里的 4 处地址改成新网址（命令会自动处理子路径）：

   ```powershell
   cd d:\数媒
   powershell -ExecutionPolicy Bypass -File .\switch-domain.ps1 -Url https://<用户名>.github.io/dalian-impression/
   ```

   然后把改动过的 `index.html`、`robots.txt`、`sitemap.xml` 在仓库里重新上传一次（Add file → Upload files，同名覆盖即可）。

#### 步骤 B：Git 推送（一次配好，之后更新只需一条命令）

1. 同样先建**空仓库**，复制它的 HTTPS 地址（形如 `https://github.com/用户名/dalian-impression.git`）。
2. 双击项目里的 **`publish.bat`**，粘贴地址，脚本会自动 `init / add / commit / remote / push`。
   也可以手动执行：

   ```powershell
   cd d:\数媒
   git init
   git branch -M main
   git add -A
   git commit -m "feat: 大连印记 静态站点"
   git remote add origin https://github.com/<用户名>/<仓库名>.git
   git push -u origin main
   ```

3. **首次推送要认证**：GitHub 不再支持账号密码，请用 **Personal Access Token** 当密码 ——
   GitHub → 头像 → Settings → Developer settings → **Personal access tokens (classic)** → Generate new token →
   勾选 `repo` → 生成后复制；在弹出登录框时：用户名填 GitHub 用户名，密码粘贴这个 token（保存到凭据管理器，之后不用再输）。
   或者直接用 **GitHub Desktop** 客户端登录图形化推送。
4. 再到 **Settings → Pages** 按步骤 A 的第 5 点开启 Pages。
5. 以后更新网站：改完文件 → 双击 `publish.bat`（或 `git add -A; git commit -m update; git push`），1–2 分钟后线上自动更新。

#### 注意事项

| 事项 | 说明 |
| --- | --- |
| 仓库名 = 网址路径 | 想短一点可把仓库名取为 `<用户名>.github.io`，网址就是 `https://用户名.github.io/`（无子路径） |
| 只能托管静态文件 | 本项目正好是纯静态站，可直接托管；不要放需要服务端的东西 |
| 一定上传 `vendor/` 目录 | 否则断网时图表/动画会退回到 CDN（联网时仍可用） |
| 大小写敏感 | GitHub 服务器区分文件名大小写，`Css/`、`JS/` 会 404；保持 `css/`、`js/` 小写 |
| `.nojekyll` | 若上传了以 `_` 开头的文件，需要在根目录保留 `.nojekyll`（本项目已提供） |
| 隐藏文件 | 实测：只有 `.git` 目录带“隐藏”属性（Ctrl+A 不会选中它，也**不要**上传）；`.gitignore`、`.nojekyll` 是普通可见文件，可以一起上传。纯静态站缺少它们也能正常访问 |
| 国内访问 | `*.github.io` 一般可访问但偶尔较慢；答辩主链接仍建议用已验证可用的 netlify.app，GitHub 作为备份 |

### 方式 3：Vercel

1. 打开 <https://vercel.com/new>，用 GitHub 登录并导入上面推送的仓库；
2. Framework Preset 选 **Other**，Build Command 留空，Output Directory 留 `.`；
3. Deploy 后得到 `https://<项目名>.vercel.app` 网址。

### 方式 4：Cloudflare Pages

1. 打开 <https://pages.cloudflare.com/> → Create a project → 连接 GitHub 仓库；
2. 构建命令留空，输出目录填 `/`（根目录）；
3. 部署完成后得到 `https://<项目名>.pages.dev`，国内访问速度通常较好。

### 绑定自己的域名（可选）

在任一平台的 *Domains / 自定义域* 中填入你的域名（如 `dalian-impression.cn`），
按提示在域名服务商处添加 CNAME 记录，平台会自动签发 HTTPS 证书。

---

## 四、部署后建议替换的占位内容

| 位置 | 现状 | 建议 |
| --- | --- | --- |
| `index.html` 的 `<link rel="canonical">` | `https://dalian-impression.netlify.app/` | 换成你的真实网址 |
| `index.html` 的 `og:url` / `og:image` | 同上占位域名 | 换成真实网址；如需分享缩略图请补一张 1200×630 的 PNG |
| `robots.txt` / `sitemap.xml` | 占位域名 | 换成真实网址，便于搜索引擎收录 |
| `js/main.js` 图表数据 | 演示数据 | 如需换成官方口径，改各图 `data` 数组与首页 KPI 的 `data-count` |

---

## 五、技术要点（评审可讲）

* **离线可用**：ECharts / GSAP 已放入 `vendor/` 本地加载，断网也能正常展示；若删除 `vendor/` 会自动回退到 CDN。
* **降级兜底**：图表库缺失时显示提示而不是白屏；`prefers-reduced-motion` 下自动关闭粒子与视差。
* **纯手绘 SVG 视觉**：首页三幕地标（星海广场跨海大桥 / 东港商务区 / 中山广场）、手绘老地图、规划示意图、地铁线路图全部为矢量绘制，任意分辨率不模糊、体积小。
* **交互设计**：鼠标视差 + GSAP 滚动 scrub 视差 + Canvas 粒子、时间轴↔老地图双向联动、图表 Hover 提示、片区点击联动详情、知识问答、`localStorage` 留言板。
* **响应式与无障碍**：栅格自适应、移动端汉堡导航、键盘可操作（时间轴 ← →、片区 Tab+Enter）、语义化标签与 `aria-*`。

---

## 七、线上自检与常见问题（部署后必看）

### 1. 一键自检线上站点

```powershell
cd d:\数媒
powershell -ExecutionPolicy Bypass -File .\check-online.ps1
# 或指定网址
powershell -ExecutionPolicy Bypass -File .\check-online.ps1 -Url https://你的网址/
```

脚本会逐个请求 `index.html / css / js / vendor / favicon / manifest / 404 / robots / sitemap` 并报告状态码。

### 2. 打开网址返回 401（重点）

现象：浏览器访问线上网址时被跳到 `app.netlify.com/...` 登录页，命令行请求返回 **401 Unauthorized**，
响应正文是 `Login Redirect`。

含义：**站点已经部署成功，但开启了"访问控制 / 密码保护"**，只有登录该 Netlify 账号的人才能查看，外网访客一律被拦截。

修复步骤：

1. 登录 <https://app.netlify.com>，打开这个站点；
2. 若顶部有横幅提示（Password protected / Access control），直接点其中的 **Change / Remove**；
3. 或进入 **Site configuration → Access & security**，找到
   **Visitor access / Access control / Password protection / Edge Access**，把它**关闭并设为 Public**；
4. 打开 **Deploys**，确认最新一次部署状态为 **Published**；
5. 用**无痕窗口**或 `Ctrl+F5` 重新访问（配置生效约需 1–2 分钟）。

> 若是新建的 Netlify 站点默认带了访问控制，也可以直接在 <https://app.netlify.com/drop>
> 重新拖一次本文件夹新建站点（默认公开）；或改用**默认公开**的 Cloudflare Pages / Vercel / GitHub Pages。

### 3. 其它常见现象

| 现象 | 原因与处理 |
| --- | --- |
| 首页能开，但图表空白 | `vendor/` 未上传（或文件名大小写不符）。上传整个文件夹，保留 `vendor/echarts.min.js` 等原文件名 |
| 样式丢失（裸 HTML） | `css/style.css` 路径或大小写问题；或上传时只拖了 `index.html` |
| 打开很慢 | 首次加载需下载 ECharts（约 1MB）。可开启平台缓存（本项目 `netlify.toml` 已为 `/vendor/*` 设置 1 年缓存） |
| 修改后线上没变化 | Netlify Drop 站点需要**重新拖一次文件夹**；要长期维护请改用 Git 关联（Netlify “Deploy from Git” / Vercel / Cloudflare Pages / GitHub Pages） |
| 网址域名解析失败（浏览器报“找不到服务器 / DNS”错误） | 常见于 Cloudflare 免费子域 `*.workers.dev`、`*.pages.dev` 被本地网络/运营商 DNS 拦截。用 `nslookup 你的域名 1.1.1.1` 能解析、用默认 DNS 不能，即为此类。对策：换 DNS（1.1.1.1 / 8.8.8.8 / 223.5.5.5）、或改用已验证可用的 netlify.app、或绑定自己的域名 |
| 想把网址改好看 | Netlify：Site configuration → **Change site name**（例如改成 `dalian-impression`），改完执行 `switch-domain.ps1` 同步站点地址 |

### 4. 右下角出现 "Powered by Netlify" 徽标

**结论：它不是本项目代码里的内容**，我实测过线上 HTML：`badge`、`powered`、`nf-`、`<iframe>` 出现次数均为 **0**，
所以改 `index.html` / `css` 是去不掉的 —— 它由 Netlify 平台在你访问时额外叠加。

两种情况请先区分：

1. **只在你登录 Netlify 的浏览器里出现**（Netlify Drawer / 后台预览框的角标）→ 访客看不到。
   验证：用**无痕窗口**（不登录 Netlify）或让同学用手机打开同一网址，角标消失即属此类，无需处理。
2. **任何访客都能看到**（免费计划展示的徽标）→ 只能按平台规则处理：
   * 升级到付费团队（徽标会消失）；
   * 或在站点设置里查找相关开关（不同账号/时间可能没有该选项）。
   * ⚠️ 不建议用 CSS/JS 强行遮挡：徽标由平台注入（可能经 shadow DOM 或独立容器渲染），
     样式随时可能失效，也与免费计划的展示条款相冲突。

**想彻底、免费地不要徽标 → 换托管平台**（Cloudflare Pages / Vercel / GitHub Pages 都不注入徽标）：

1. 打开 <https://dash.cloudflare.com/> → **Workers & Pages** → **Create** → **Pages** → **Upload assets**；
2. 把 `d:\数媒` 整个文件夹拖进去 → 得到 `https://<项目名>.pages.dev`（免费、无徽标，国内访问一般更快）；
3. 换好域名后，一条命令同步站点地址：

   ```powershell
   cd d:\数媒
   powershell -ExecutionPolicy Bypass -File .\switch-domain.ps1 -Url https://你的新网址/
   ```

   该脚本会把 `index.html`（canonical / og:url / og:image）、`robots.txt`、`sitemap.xml` 里的旧域名一并替换。
4. Netlify 站点重命名后也可以用它同步，例如：

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\switch-domain.ps1 -Url https://dalian-impression.netlify.app/
   ```



* **打开是空白 / 图表不显示**：请用 `serve.bat`（http 协议）访问，而不是直接双击 html（部分浏览器对 `file://` 有额外限制）；若已联网仍异常，检查 `vendor/` 是否被删除。
* **Push 失败**：确认仓库地址以 `.git` 结尾、账号有写权限；公司/校园网络下可能需要配置代理。
* **GitHub Pages 打开是 404**：确认 Pages 源分支为 `main`、目录为 `/(root)`，并等待 1–2 分钟缓存刷新；访问地址要带仓库名（项目站点）。
* **想还原初版**：原始原型备份在 `backup/index-v1.html`。
