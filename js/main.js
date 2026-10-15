/* ==========================================================================
   大连印记：从过去到未来的数字漫游  ·  main.js
   模块
   01 工具与全局状态    02 开场加载      03 顶部导航      04 首屏 Hero
   05 滚动进场动效      06 历史长廊      07 今日大连      08 未来规划
   09 其他收尾
   ========================================================================== */
(function () {
    'use strict';

    /* ---------- 01 工具与全局状态 ---------- */
    const $ = (sel, ctx) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
    const hasGsap = typeof window.gsap !== 'undefined';
    const hasScrollTrigger = hasGsap && typeof window.ScrollTrigger !== 'undefined';
    const hasEcharts = typeof window.echarts !== 'undefined';
    const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    // 动画库缺失或用户偏好减少动态效果时，直接展示静态内容
    if (!hasGsap || reduceMotion) document.body.classList.add('no-anim');
    if (hasScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);

    /* ---------- 02 开场加载 ---------- */
    const loader = $('#loader');
    function hideLoader() {
        if (loader) loader.classList.add('is-done');
    }
    window.addEventListener('load', function () {
        setTimeout(hideLoader, reduceMotion ? 0 : 450);
    });
    setTimeout(hideLoader, 4200); // 兜底

    const footerYear = $('#footerYear');
    if (footerYear) footerYear.textContent = String(new Date().getFullYear());

    /* ---------- 03 顶部导航 ---------- */
    const nav = $('#nav');
    const navProgress = $('#navProgress');
    const navLinks = $('#navLinks');
    const navToggle = $('#navToggle');
    const toTop = $('#toTop');

    function updateScrollUI() {
        const y = window.pageYOffset || document.documentElement.scrollTop || 0;
        if (nav) nav.classList.toggle('is-solid', y > 40);
        if (toTop) toTop.classList.toggle('is-show', y > 640);
        if (navProgress) {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const percent = total > 0 ? Math.min(100, (y / total) * 100) : 0;
            navProgress.style.width = percent.toFixed(2) + '%';
        }
    }

    window.addEventListener('scroll', updateScrollUI, { passive: true });
    updateScrollUI();

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            const opened = navLinks.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', String(opened));
        });
        $$('#navLinks a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    if (toTop) {
        toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    // 当前浏览章节高亮
    if ('IntersectionObserver' in window) {
        const sectionIds = ['hero', 'history', 'data', 'future', 'quiz'];
        const navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                $$('#navLinks a').forEach(function (link) {
                    link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sectionIds.forEach(function (id) {
            const el = document.getElementById(id);
            if (el) navObserver.observe(el);
        });
    }

    /* ---------- 04 首屏 Hero ---------- */
    const scenes = $$('.scene');
    const sceneDots = $$('#sceneDots button');
    let sceneIndex = 0;
    let sceneTimer = null;

    function showScene(index) {
        if (!scenes.length) return;
        sceneIndex = (index + scenes.length) % scenes.length;
        scenes.forEach(function (scene, i) { scene.classList.toggle('is-active', i === sceneIndex); });
        sceneDots.forEach(function (dot, i) { dot.classList.toggle('is-active', i === sceneIndex); });
        // 重新触发凯旋式缩放动画
        const art = scenes[sceneIndex].querySelector('.scene-art');
        if (art && !reduceMotion) {
            art.style.animation = 'none';
            void art.offsetWidth;
            art.style.animation = '';
        }
    }

    function startSceneLoop() {
        if (sceneTimer) clearInterval(sceneTimer);
        if (reduceMotion || scenes.length < 2) return;
        sceneTimer = setInterval(function () { showScene(sceneIndex + 1); }, 7000);
    }

    sceneDots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showScene(Number(dot.getAttribute('data-scene-to')) || 0);
            startSceneLoop();
        });
    });
    startSceneLoop();

    // 鼠标移动视差
    const heroMouse = $('#heroMouse');
    if (heroMouse && !reduceMotion) {
        let targetX = 0, targetY = 0, curX = 0, curY = 0;
        const strength = 18;
        window.addEventListener('pointermove', function (e) {
            targetX = (e.clientX / window.innerWidth - 0.5) * strength;
            targetY = (e.clientY / window.innerHeight - 0.5) * strength * 0.7;
        }, { passive: true });
        (function loop() {
            curX += (targetX - curX) * 0.06;
            curY += (targetY - curY) * 0.06;
            heroMouse.style.transform = 'translate3d(' + curX.toFixed(2) + 'px,' + curY.toFixed(2) + 'px,0)';
            window.requestAnimationFrame(loop);
        })();
    }

    // Canvas 粒子星尘（首屏不可见时自动暂停）
    const canvas = $('#particles');
    if (canvas && !reduceMotion && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let particles = [], width = 0, height = 0, visible = true, rafId = null;

        function buildParticles() {
            const rect = canvas.getBoundingClientRect();
            width = Math.max(1, canvas.clientWidth || rect.width);
            height = Math.max(1, canvas.clientHeight || rect.height);
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.round(Math.min(88, Math.max(26, width / 22)));
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.24,
                    r: Math.random() * 1.8 + 0.7,
                    a: Math.random() * 0.5 + 0.28
                });
            }
        }

        function drawParticles() {
            if (!visible) { rafId = null; return; }
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -20) p.x = width + 20;
                if (p.x > width + 20) p.x = -20;
                if (p.y < -20) p.y = height + 20;
                if (p.y > height + 20) p.y = -20;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(163,222,255,' + p.a.toFixed(2) + ')';
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
                    if (d2 < 12000) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = 'rgba(100,200,255,' + (0.13 * (1 - d2 / 12000)).toFixed(3) + ')';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            rafId = window.requestAnimationFrame(drawParticles);
        }

        function startParticles() {
            if (!rafId && visible) rafId = window.requestAnimationFrame(drawParticles);
        }

        buildParticles();
        startParticles();
        let resizeTimer = null;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(buildParticles, 220);
        });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                visible = entries[0].isIntersecting;
                if (visible) startParticles();
            }, { threshold: 0 }).observe(canvas);
        }
    }

    // GSAP 首屏分层入场 + 滚动视差
    if (hasGsap && !reduceMotion) {
        const intro = window.gsap.timeline({ delay: 0.3 });
        intro.from('#heroEyebrow', { y: 26, opacity: 0, duration: 0.8, ease: 'power3.out' })
            .from('#heroTitle', { y: 46, opacity: 0, duration: 1.05, ease: 'power3.out' }, '-=0.5')
            .from('#heroSub', { y: 26, opacity: 0, duration: 0.85, ease: 'power3.out' }, '-=0.65')
            .from('#heroDesc', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
            .from('#heroActions .btn', { y: 18, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, '-=0.5')
            .from('#heroStats > div', { y: 18, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, '-=0.45');

        if (hasScrollTrigger) {
            const scrollTrigger = { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true };
            window.gsap.to('#heroBg', { yPercent: 14, scale: 1.08, ease: 'none', scrollTrigger: scrollTrigger });
            window.gsap.to('.hero-inner', { y: -150, opacity: 0, ease: 'none', scrollTrigger: scrollTrigger });
            window.gsap.to('.scene-caption', { yPercent: -60, opacity: 0, ease: 'none', scrollTrigger: scrollTrigger });
            window.gsap.to('.hero-grid', { y: -70, ease: 'none', scrollTrigger: scrollTrigger });
            window.gsap.to('.hero-waves', { y: 46, ease: 'none', scrollTrigger: scrollTrigger });
            window.gsap.to('.scroll-hint', { opacity: 0, ease: 'none', scrollTrigger: scrollTrigger });
        }
    }

    /* ---------- 05 滚动进场动效 ---------- */
    const revealEls = $$('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        const revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-in'); });
    }

    /* ---------- 06 历史长廊 ---------- */
    // 老地图地标（SVG 坐标基于 600 × 460 地图视窗）
    const MAP_POINTS = [
        { id: 'lvshun', x: 78, y: 368, label: '旅顺口', tx: 10, ty: 4 },
        { id: 'xinghai', x: 198, y: 290, label: '星海广场', tx: -66, ty: 24 },
        { id: 'gaoxin', x: 216, y: 239, label: '高新区', tx: -58, ty: -12 },
        { id: 'shipyard', x: 252, y: 170, label: '香炉礁', tx: 10, ty: 4 },
        { id: 'zhongshan', x: 294, y: 230, label: '中山广场', tx: 8, ty: -14 },
        { id: 'qingniwa', x: 264, y: 267, label: '青泥洼', tx: -54, ty: 26 },
        { id: 'port', x: 354, y: 212, label: '大连港', tx: 10, ty: 4 },
        { id: 'donggang', x: 402, y: 184, label: '东港', tx: 8, ty: 18 },
        { id: 'kaifaqu', x: 474, y: 156, label: '开发区', tx: 10, ty: 4 }
    ];

    // 时代剪影：不同时期的档案配图（纯 SVG，离线可用）
    function eraArt(type) {
        const layout = {
            port: '<rect x="24" y="86" width="46" height="46" rx="4"/><rect x="86" y="70" width="30" height="62"/><rect x="132" y="98" width="52" height="34" rx="4"/><path d="M196 132 H300 L286 152 H210 Z"/><rect x="236" y="84" width="8" height="48"/>',
            war: '<path d="M30 132 L96 84 L162 132 Z"/><path d="M120 132 L196 96 L272 132 Z"/><rect x="200" y="60" width="6" height="72"/><path d="M206 62 L246 74 L206 86 Z"/>',
            colony: '<rect x="28" y="72" width="44" height="60"/><circle cx="50" cy="66" r="12"/><rect x="92" y="88" width="58" height="44"/><rect x="170" y="64" width="46" height="68"/><circle cx="193" cy="58" r="13"/><rect x="238" y="96" width="54" height="36"/>',
            liberation: '<rect x="36" y="60" width="8" height="72"/><rect x="120" y="60" width="8" height="72"/><rect x="204" y="60" width="8" height="72"/><rect x="36" y="96" width="176" height="10"/><rect x="60" y="106" width="128" height="26" rx="6"/>',
            industry: '<rect x="24" y="96" width="72" height="36"/><rect x="106" y="76" width="54" height="56"/><path d="M172 132 V64 L212 92 V132 Z"/><rect x="228" y="98" width="64" height="34"/><rect x="288" y="46" width="12" height="86"/>',
            open: '<rect x="34" y="86" width="46" height="46"/><rect x="92" y="62" width="42" height="70"/><rect x="146" y="98" width="52" height="34"/><rect x="210" y="80" width="40" height="52"/><rect x="262" y="104" width="40" height="28"/>',
            bond: '<path d="M24 132 H320" /><rect x="40" y="82" width="58" height="50" rx="4"/><rect x="112" y="66" width="44" height="66"/><path d="M172 132 V96 L212 76 L252 96 V132 Z"/><rect x="266" y="88" width="44" height="44"/>',
            revitalize: '<rect x="30" y="98" width="60" height="34"/><path d="M104 132 L134 74 L164 132 Z"/><rect x="178" y="70" width="46" height="62"/><rect x="238" y="90" width="62" height="42" rx="4"/><circle cx="146" cy="58" r="9"/>',
            modern: '<rect x="26" y="80" width="52" height="52"/><rect x="90" y="54" width="52" height="78"/><rect x="154" y="88" width="46" height="44"/><path d="M214 132 L248 62 L282 132 Z"/><rect x="292" y="96" width="22" height="36"/>'
        };
        const body = layout[type] || layout.modern;
        return '<g fill="rgba(230,241,255,.28)">' + body + '</g><path d="M0 132 H320" stroke="rgba(100,255,218,.45)" stroke-width="2"/>';
    }

    // 时代档案数据（依据公开史料与公开报道整理，用于作品演示）
    const ERAS = [
        {
            year: '1899', label: '建市之初', color: 'rgba(0,210,255,.5)', art: 'port',
            title: '1899 · 达里尼建市',
            desc: '沙俄在大连湾南岸的青泥洼一带辟建港口城市，取名「达里尼」（Дальний，意为“远方”）。城市以自由港与铁路终点为核心，按近代规划理念铺设道路与街区，成为这座城市可考的起点。',
            facts: ['1898 年《旅大租地条约》签订，旅大地区被租借', '1899 年宣布建市，青泥洼由此成为城市原点', '港口与铁路同步动工，自由港定位吸引各国商船'],
            tags: ['近代城市规划', '自由港', '东清铁路'],
            map: { point: 'qingniwa', text: '青泥洼 · 1899 年建市原点' }
        },
        {
            year: '1904', label: '日俄战争', color: 'rgba(255,123,123,.5)', art: 'war',
            title: '1904 · 战火中的旅大',
            desc: '日俄战争爆发，旅顺成为双方争夺的焦点。战争结束后，旅大地区被转让给日本，城市的发展轨迹由此改变，军事要塞与港口成为这一时期的关键词。',
            facts: ['1904 年 2 月日俄战争爆发，双方争夺旅大', '1905 年旅顺要塞陷落，成为战争转折点', '战后旅大地区被转让给日本，进入新的管控时期'],
            tags: ['军事要塞', '城市转折', '旅顺口'],
            map: { point: 'lvshun', text: '旅顺口 · 要塞与战争记忆' }
        },
        {
            year: '1905', label: '殖民岁月', color: 'rgba(246,196,106,.45)', art: 'colony',
            title: '1905 — 1945 · 港口与近代市政',
            desc: '这一时期城市被改称「大连」。港口大规模扩建，码头、仓库与近代市政设施陆续建成，中山广场、青泥洼桥一带成为商业与行政中心，大连港成为东北物资外运的重要口岸。',
            facts: ['1907 年南满洲铁道株式会社在大连设立', '中山广场周边陆续建成一批近代欧式建筑', '有轨电车、上下水等近代市政系统投入使用'],
            tags: ['港口扩建', '近代建筑', '市政建设'],
            map: { point: 'port', text: '大连港 · 近代港口扩建与航线开通' }
        },
        {
            year: '1945', label: '解放新生', color: 'rgba(100,255,218,.45)', art: 'liberation',
            title: '1945 · 城市解放',
            desc: '1945 年大连解放，旅大地区随后进入苏军管制时期。城市工业设施得到保护与恢复，为新中国成立后承接大规模工业建设打下了基础。',
            facts: ['1945 年 8 月大连解放', '旅大地区进入苏军管制时期', '留存企业与设备成为后续工业骨干'],
            tags: ['城市解放', '工业恢复'],
            map: { point: 'zhongshan', text: '中山广场 · 城市中心的时代更迭' }
        },
        {
            year: '1955', label: '全面接管', color: 'rgba(30,144,255,.5)', art: 'industry',
            title: '1955 · 回归与工业奠基',
            desc: '苏军从旅顺、大连撤离，城市全面回归中国管理。此后，造船、机车车辆、化工、纺织等骨干企业迅速成长，大连成为新中国重要的机械与造船工业基地。',
            facts: ['1955 年苏军撤离，城市实现全面接管', '大连造船等企业成长为行业骨干', '机械、化工、纺织构成城市经济支柱'],
            tags: ['造船工业', '老工业基地'],
            map: { point: 'shipyard', text: '香炉礁 · 造船与机械工业带' }
        },
        {
            year: '1984', label: '沿海开放', color: 'rgba(61,220,151,.45)', art: 'open',
            title: '1984 · 首批沿海开放城市',
            desc: '大连被列为全国首批 14 个沿海开放城市之一，大连经济技术开发区随即在荒滩上起步。外资、外贸与新兴产业快速集聚，城市开始从工业基地向开放前沿转型。',
            facts: ['1984 年成为全国首批沿海开放城市', '同年大连经济技术开发区成立', '电子、服装、机械等外向型产业崛起'],
            tags: ['沿海开放城市', '经济技术开发区', '外向型经济'],
            map: { point: 'kaifaqu', text: '金马路 · 开发区起步区' }
        },
        {
            year: '1992', label: '开放深化', color: 'rgba(167,139,250,.45)', art: 'bond',
            title: '1992 · 保税区与功能升级',
            desc: '大连保税区获批设立，成为东北地区对外开放的新平台。此后集装箱运输、软件与信息服务等新业态兴起，城市功能从工业主导迈向贸易、金融、服务多元并进。',
            facts: ['1992 年大连保税区获批设立', '20 世纪 90 年代软件及信息服务产业起步', '港口集装箱业务与口岸功能持续增强'],
            tags: ['保税区', '口岸经济', '现代服务业'],
            map: { point: 'donggang', text: '东港 · 港口功能与开放空间扩张' }
        },
        {
            year: '2003', label: '东北振兴', color: 'rgba(246,196,106,.5)', art: 'revitalize',
            title: '2003 · 东北振兴与城市更新',
            desc: '中央作出实施东北地区等老工业基地振兴战略的决策。大连以软件与服务外包、装备制造、石化等产业为突破口，星海广场、东港商务区等新地标相继成形。',
            facts: ['2003 年东北振兴战略启动', '软件和服务外包产业形成全国影响力', '星海广场、东港商务区等新地标成形'],
            tags: ['东北振兴', '软件名城', '城市更新'],
            map: { point: 'xinghai', text: '星海广场 · 面向海湾的城市客厅' }
        },
        {
            year: '2024', label: '向海图强', color: 'rgba(0,210,255,.55)', art: 'modern',
            title: '2024 · 面向未来的滨海城市',
            desc: '今天的大连，是东北亚国际航运中心、国际物流中心与区域性金融中心。海洋经济、数字经济、先进制造与文旅产业协同发力，金州湾国际机场等重大工程加快推进。',
            facts: ['东北亚国际航运中心、国际物流中心定位', '海洋经济与数字经济成为新增长点', '金州湾国际机场等重大工程推动城市能级提升'],
            tags: ['东北亚航运中心', '海洋经济', '数字大连'],
            map: { point: 'gaoxin', text: '高新区 · 数字与海洋经济新引擎' }
        }
    ];

    // 渲染老地图地标
    const mapPointsGroup = $('#mapPoints');
    if (mapPointsGroup) {
        mapPointsGroup.innerHTML = MAP_POINTS.map(function (p) {
            return '<g class="map-point" data-point="' + p.id + '" data-label="' + p.label + '"' +
                ' transform="translate(' + p.x + ',' + p.y + ')" tabindex="0" role="button" aria-label="' + p.label + '">' +
                '<circle class="pulse" r="9" fill="none" stroke="#1f6f9c" stroke-width="2"></circle>' +
                '<circle class="dot" r="6"></circle>' +
                '<text x="' + p.tx + '" y="' + p.ty + '">' + p.label + '</text>' +
                '</g>';
        }).join('');
    }

    // 渲染时间轴节点
    const timelineTrack = $('#timelineTrack');
    if (timelineTrack) {
        timelineTrack.innerHTML = ERAS.map(function (era, i) {
            return '<button class="tl-node' + (i === 0 ? ' is-active' : '') + '" type="button" role="tab"' +
                ' aria-selected="' + (i === 0) + '" data-index="' + i + '">' +
                '<span class="tl-dot"></span>' +
                '<span class="tl-year">' + era.year + '</span>' +
                '<span class="tl-label">' + era.label + '</span>' +
                '</button>';
        }).join('');
    }

    let eraIndex = 0;

    function selectEra(index, keepScroll) {
        if (!ERAS.length) return;
        eraIndex = Math.max(0, Math.min(ERAS.length - 1, index));
        const era = ERAS[eraIndex];

        $$('.tl-node').forEach(function (node, i) {
            const active = i === eraIndex;
            node.classList.toggle('is-active', active);
            node.setAttribute('aria-selected', String(active));
            if (active && !keepScroll) {
                node.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
            }
        });

        const year = $('#eraYear');
        if (year) year.innerHTML = era.year + '<small>' + era.label + '</small>';
        const stamp = $('#eraStamp');
        if (stamp) stamp.textContent = 'DALIAN ARCHIVE · ' + era.year;
        const title = $('#eraTitle');
        if (title) title.textContent = era.title;
        const desc = $('#eraDesc');
        if (desc) desc.textContent = era.desc;
        const facts = $('#eraFacts');
        if (facts) facts.innerHTML = era.facts.map(function (f) { return '<li>' + f + '</li>'; }).join('');
        const tags = $('#eraTags');
        if (tags) tags.innerHTML = era.tags.map(function (t) { return '<span>' + t + '</span>'; }).join('');
        const media = $('#eraMedia');
        if (media) media.style.setProperty('--era-color', era.color);
        const art = $('#eraArt');
        if (art) art.innerHTML = eraArt(era.art);
        const indexLabel = $('#eraIndex');
        if (indexLabel) {
            indexLabel.textContent = ('0' + (eraIndex + 1)).slice(-2) + ' / ' + ('0' + ERAS.length).slice(-2);
        }

        // 地图联动：高亮地标 + 更新固定位置的事件信息条（不再用浮动气泡遮挡其他地标）
        let targetPoint = null;
        $$('.map-point').forEach(function (point) {
            const hit = point.getAttribute('data-point') === era.map.point;
            point.classList.toggle('is-active', hit);
            if (hit) targetPoint = point;
        });
        const eventTag = $('#mapEventTag');
        const eventName = $('#mapEventName');
        const eventText = $('#mapEventText');
        if (targetPoint) {
            if (eventTag) eventTag.textContent = era.year + ' · ' + era.label;
            if (eventName) eventName.textContent = targetPoint.getAttribute('data-label') || era.title;
            if (eventText) eventText.textContent = era.map.text;
        }

        // 档案卡片内容切换动画
        if (hasGsap && !reduceMotion) {
            window.gsap.fromTo('#eraCard .era-body > *', { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out' });
            window.gsap.fromTo('.era-year', { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' });
        }
    }

    if (timelineTrack) {
        timelineTrack.addEventListener('click', function (event) {
            const node = event.target.closest ? event.target.closest('.tl-node') : null;
            if (node) selectEra(Number(node.getAttribute('data-index')));
        });
        timelineTrack.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowRight') { event.preventDefault(); selectEra(eraIndex + 1); }
            if (event.key === 'ArrowLeft') { event.preventDefault(); selectEra(eraIndex - 1); }
        });
    }

    const eraPrev = $('#eraPrev');
    const eraNext = $('#eraNext');
    if (eraPrev) eraPrev.addEventListener('click', function () { selectEra(eraIndex - 1); });
    if (eraNext) eraNext.addEventListener('click', function () { selectEra(eraIndex + 1); });

    // 点击老地图地标 → 反向定位到对应历史时期（就地更新，不跳转页面，避免遮挡与视角丢失）
    function jumpFromMapPoint(point) {
        if (!point) return;
        const id = point.getAttribute('data-point');
        const index = ERAS.findIndex(function (era) { return era.map.point === id; });
        if (index < 0) return;
        selectEra(index, true);
    }

    if (mapPointsGroup) {
        mapPointsGroup.addEventListener('click', function (event) {
            if (!event.target.closest) return;
            jumpFromMapPoint(event.target.closest('.map-point'));
        });
        mapPointsGroup.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            if (!event.target.closest) return;
            const point = event.target.closest('.map-point');
            if (!point) return;
            event.preventDefault();
            jumpFromMapPoint(point);
        });
    }

    selectEra(0, true);

    /* ---------- 07 今日大连 · 数据看板 ---------- */
    function animateCounters() {
        $$('.kpi-num').forEach(function (el) {
            const target = parseFloat(el.getAttribute('data-count') || '0');
            const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
            if (reduceMotion) {
                el.textContent = target.toFixed(decimals);
                return;
            }
            const duration = 1500;
            const startTime = performance.now();
            (function step(now) {
                const progress = Math.min(1, (now - startTime) / duration);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = (target * eased).toFixed(decimals);
                if (progress < 1) window.requestAnimationFrame(step);
                else el.textContent = target.toFixed(decimals);
            })(startTime);
        });
    }

    const charts = {};
    let chartsReady = false;

    function chartTooltip() {
        return {
            backgroundColor: 'rgba(4,16,31,.94)',
            borderColor: 'rgba(100,255,218,.4)',
            borderWidth: 1,
            textStyle: { color: '#e6f1ff', fontSize: 12 },
            extraCssText: 'box-shadow:0 10px 26px rgba(2,10,24,.5);'
        };
    }

    function initCharts() {
        if (chartsReady) return;
        chartsReady = true;

        if (!hasEcharts) {
            $$('.chart').forEach(function (el) {
                el.classList.add('chart-fallback');
                el.textContent = '图表库加载失败（可能处于离线环境）。请联网后刷新页面，即可查看 ECharts 数据可视化图表。';
            });
            return;
        }

        const axisLabel = { color: '#93a9c9', fontSize: 11 };
        const axisLine = { lineStyle: { color: 'rgba(100,168,255,.28)' } };
        const splitLine = { lineStyle: { color: 'rgba(100,168,255,.12)' } };
        const years = ['2019', '2020', '2021', '2022', '2023', '2024'];

        // 1. 经济总量与增速（柱状 + 折线双轴）
        const gdpDom = $('#chartGdp');
        if (gdpDom) {
            charts.gdp = window.echarts.init(gdpDom);
            charts.gdp.setOption({
                backgroundColor: 'transparent',
                tooltip: Object.assign({ trigger: 'axis' }, chartTooltip()),
                legend: { data: ['地区生产总值', '同比增长'], right: 0, top: 0, textStyle: { color: '#a8b2d1', fontSize: 11 }, itemWidth: 12, itemHeight: 8 },
                grid: { left: 6, right: 6, top: 48, bottom: 4, containLabel: true },
                xAxis: { type: 'category', data: years, axisLabel: axisLabel, axisLine: axisLine, axisTick: { show: false } },
                yAxis: [
                    { type: 'value', name: '亿元', nameTextStyle: { color: '#93a9c9', fontSize: 11 }, axisLabel: axisLabel, splitLine: splitLine },
                    { type: 'value', name: '增速 %', max: 10, nameTextStyle: { color: '#93a9c9', fontSize: 11 }, axisLabel: axisLabel, splitLine: { show: false } }
                ],
                series: [
                    {
                        name: '地区生产总值', type: 'bar', barWidth: 26,
                        data: [7002, 7030, 7826, 8431, 8753, 9517],
                        itemStyle: {
                            borderRadius: [6, 6, 0, 0],
                            color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#63c8ff' },
                                { offset: 1, color: 'rgba(30,144,255,.22)' }
                            ])
                        }
                    },
                    {
                        name: '同比增长', type: 'line', yAxisIndex: 1, smooth: true, symbolSize: 8,
                        data: [6.5, 0.9, 8.1, 4.0, 6.0, 5.2],
                        lineStyle: { width: 3, color: '#f6c46a' },
                        itemStyle: { color: '#f6c46a' },
                        areaStyle: { color: 'rgba(246,196,106,.12)' }
                    }
                ]
            });
        }

        // 2. 三次产业结构（玫瑰图）
        const industryDom = $('#chartIndustry');
        if (industryDom) {
            charts.industry = window.echarts.init(industryDom);
            charts.industry.setOption({
                backgroundColor: 'transparent',
                tooltip: Object.assign({ trigger: 'item', formatter: '{b}<br/>占比 {c}%' }, chartTooltip()),
                legend: { bottom: 0, textStyle: { color: '#a8b2d1', fontSize: 11 }, itemWidth: 10, itemHeight: 10 },
                series: [{
                    type: 'pie',
                    radius: ['36%', '64%'],
                    center: ['50%', '44%'],
                    roseType: 'radius',
                    itemStyle: { borderColor: '#0a192f', borderWidth: 2 },
                    label: { color: '#cfe6ff', fontSize: 11, formatter: '{b}\n{c}%' },
                    labelLine: { lineStyle: { color: 'rgba(147,169,201,.5)' } },
                    data: [
                        { value: 6.4, name: '第一产业', itemStyle: { color: '#3ddc97' } },
                        { value: 40.1, name: '第二产业', itemStyle: { color: '#1e90ff' } },
                        { value: 53.5, name: '第三产业', itemStyle: { color: '#64ffda' } }
                    ]
                }]
            });
        }

        // 3. 港口货物吞吐量（横向条形）
        const portDom = $('#chartPort');
        if (portDom) {
            charts.port = window.echarts.init(portDom);
            charts.port.setOption({
                backgroundColor: 'transparent',
                tooltip: Object.assign({ trigger: 'axis', formatter: '{b} 年<br/>货物吞吐量：{c} 亿吨' }, chartTooltip()),
                grid: { left: 6, right: 58, top: 18, bottom: 4, containLabel: true },
                xAxis: { type: 'value', max: 6, axisLabel: axisLabel, splitLine: splitLine },
                yAxis: {
                    type: 'category',
                    data: ['2019', '2020', '2021', '2022', '2023', '2024'],
                    axisLabel: axisLabel, axisTick: { show: false }, axisLine: axisLine
                },
                series: [{
                    name: '货物吞吐量', type: 'bar', barWidth: 14,
                    data: [4.0, 4.2, 4.35, 4.4, 4.55, 4.6],
                    label: { show: true, position: 'right', color: '#64ffda', fontSize: 11, formatter: '{c} 亿吨' },
                    itemStyle: {
                        borderRadius: [0, 8, 8, 0],
                        color: new window.echarts.graphic.LinearGradient(0, 0, 1, 0, [
                            { offset: 0, color: 'rgba(30,144,255,.35)' },
                            { offset: 1, color: '#00d2ff' }
                        ])
                    }
                }]
            });
        }

        // 4. 旅游热度指数（面积图 + 峰值标注）
        const tourismDom = $('#chartTourism');
        if (tourismDom) {
            charts.tourism = window.echarts.init(tourismDom);
            charts.tourism.setOption({
                backgroundColor: 'transparent',
                tooltip: Object.assign({ trigger: 'axis', formatter: '{b} 月<br/>热度指数：{c}' }, chartTooltip()),
                grid: { left: 6, right: 14, top: 26, bottom: 4, containLabel: true },
                xAxis: {
                    type: 'category', boundaryGap: false,
                    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                    axisLabel: { color: '#93a9c9', fontSize: 10 },
                    axisLine: axisLine, axisTick: { show: false }
                },
                yAxis: { type: 'value', max: 120, axisLabel: axisLabel, splitLine: splitLine },
                series: [{
                    name: '旅游热度', type: 'line', smooth: true, symbolSize: 6,
                    data: [42, 38, 52, 66, 78, 88, 100, 98, 84, 70, 55, 60],
                    lineStyle: { width: 3, color: '#00d2ff' },
                    itemStyle: { color: '#00d2ff' },
                    areaStyle: {
                        color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(0,210,255,.45)' },
                            { offset: 1, color: 'rgba(0,210,255,0)' }
                        ])
                    },
                    markPoint: {
                        symbolSize: 52,
                        data: [{ type: 'max', name: '夏季峰值', itemStyle: { color: '#f6c46a' }, label: { color: '#04101f', fontWeight: 'bold' } }]
                    }
                }]
            });
        }

        // 5. 城市发展多维评分（雷达图）
        const radarDom = $('#chartRadar');
        if (radarDom) {
            charts.radar = window.echarts.init(radarDom);
            charts.radar.setOption({
                backgroundColor: 'transparent',
                tooltip: Object.assign({ trigger: 'item' }, chartTooltip()),
                radar: {
                    center: ['50%', '54%'],
                    radius: '64%',
                    indicator: [
                        { name: '航运枢纽', max: 100 },
                        { name: '先进制造', max: 100 },
                        { name: '数字经济', max: 100 },
                        { name: '海洋经济', max: 100 },
                        { name: '文旅活力', max: 100 },
                        { name: '生态宜居', max: 100 }
                    ],
                    axisName: { color: '#a8b2d1', fontSize: 11 },
                    splitLine: { lineStyle: { color: 'rgba(100,168,255,.18)' } },
                    axisLine: { lineStyle: { color: 'rgba(100,168,255,.18)' } },
                    splitArea: { areaStyle: { color: ['rgba(30,144,255,.04)', 'rgba(30,144,255,.09)'] } }
                },
                series: [{
                    type: 'radar', symbolSize: 6,
                    data: [{
                        value: [92, 85, 78, 88, 84, 90],
                        name: '综合评分（演示）',
                        lineStyle: { color: '#64ffda', width: 2 },
                        itemStyle: { color: '#64ffda' },
                        areaStyle: { color: 'rgba(100,255,218,.22)' }
                    }]
                }]
            });
        }


    }

    // 数据区块进入视口后再初始化图表与数字动画
    const dataSection = $('#data');
    if (dataSection && 'IntersectionObserver' in window) {
        const dataObserver = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                initCharts();
                animateCounters();
                dataObserver.disconnect();
            }
        }, { threshold: 0.15 });
        dataObserver.observe(dataSection);
    } else {
        initCharts();
        animateCounters();
    }

    let chartResizeTimer = null;
    window.addEventListener('resize', function () {
        clearTimeout(chartResizeTimer);
        chartResizeTimer = setTimeout(function () {
            Object.keys(charts).forEach(function (key) {
                if (charts[key] && charts[key].resize) charts[key].resize();
            });
        }, 200);
    });

    /* ---------- 08 未来规划 ---------- */
    const PLAN_REGIONS = {
        jinzhouwan: {
            eyebrow: 'AVIATION HUB · 新机场',
            tone: 'hub',
            name: '金州湾国际机场',
            desc: '规划建于金州湾海上人工岛的机场，按 4F 级标准设计。建成后将与主城区、金普新区通过快速路和轨道交通衔接，承担面向东北亚的国际客货运输功能，并带动临空产业发展。',
            kv: [['规划定位', '东北亚航空门户'], ['建设方式', '海上人工岛填筑'], ['规划年吞吐', '约 4300 万人次'], ['交通衔接', '地铁 + 城际 + 快速路']],
            list: ['海上人工岛填筑与双跑道系统', '航站楼与综合交通换乘中心', '临空经济区与航空物流布局', '与现有机场的功能承接与转移']
        },
        changxingdao: {
            tone: 'industry',
            path: 'M64 148 L128 158 L138 210 L120 244 L76 242 L62 196 Z',
            label: { x: 104, y: 192, sub: '石化 · 临港装备' },
            eyebrow: 'PORT INDUSTRY · 临港产业基地',
            name: '长兴岛 · 太平湾',
            desc: '渤海侧的临港产业带：以石化、临港装备制造和港口物流为主，推进产业链延伸与循环化改造，强化安全环保标准，建设面向东北亚的临港产业基地。',
            kv: [['功能定位', '渤海侧临港产业带'], ['主导产业', '石化 + 临港装备'], ['关键工程', '长兴岛 / 太平湾港区'], ['发展愿景', '绿色循环临港经济']],
            list: ['石化产业链延伸与精细化', '大型临港装备制造能力', '港口物流与多式联运体系', '安全环保与循环化改造']
        },
        wafangdian: {
            tone: 'industry',
            path: 'M150 96 L300 66 L332 160 L280 212 L176 200 L136 150 Z',
            label: { x: 230, y: 148, sub: '轴承 · 装备制造 · 新能源' },
            eyebrow: 'ADVANCED MANUFACTURING · 县域制造',
            name: '瓦房店市',
            desc: '我国重要的轴承产业基地，向精密制造、新能源与现代农业延伸；推动传统产业智能化改造，与长兴岛临港产业带形成「港产联动」。',
            kv: [['区域属性', '市域北部县域'], ['主导产业', '轴承 + 装备制造'], ['关键方向', '智能化改造'], ['发展愿景', '港产联动基地']],
            list: ['轴承产业集群与精密制造', '新能源装备与风电配套', '农产品加工与现代农业', '县域交通与公共服务提升']
        },
        jinpu: {
            tone: 'industry',
            path: 'M376 176 L478 186 L578 142 L640 208 L676 268 L650 334 L556 358 L464 332 L406 274 L364 218 Z',
            label: { x: 500, y: 246, sub: '先进制造 · 保税港 · 金石滩' },
            eyebrow: 'NATIONAL NEW AREA · 国家级新区',
            name: '金普新区',
            desc: '以先进制造、开放合作为主线，推动集成电路、新能源汽车零部件、生物医药与氢能等产业集聚，是东北地区对外开放与产业升级的重要平台。',
            kv: [['区域属性', '国家级新区'], ['主导产业', '先进制造 + 新兴产业'], ['关键平台', '小窑湾 CBD / 大窑湾保税港'], ['发展愿景', '开放型经济高地']],
            list: ['集成电路与电子信息产业链', '汽车零部件与高端装备制造', '保税港区与口岸功能升级', '金石滩文旅与滨海度假提升']
        },
        pulandian: {
            tone: 'industry',
            path: 'M334 70 L528 58 L566 130 L470 176 L372 160 Z',
            label: { x: 446, y: 114, sub: '皮口 · 先进制造 · 都市农业' },
            eyebrow: 'CITY DISTRICT · 市域中北部',
            name: '普兰店区',
            desc: '大连主城与北部县域之间的过渡地带，依托皮口港与干线交通发展先进制造、都市农业与滨海旅游，承接主城功能疏解，建设产城融合组团。',
            kv: [['区域属性', '市域中北部城区'], ['主导产业', '装备制造 + 都市农业'], ['关键节点', '皮口港 · 城际走廊'], ['发展愿景', '产城融合组团']],
            list: ['皮口港与滨海产业空间', '装备制造配套产业链', '都市农业与食品加工', '城际交通与公共服务中心']
        },
        zhuanghe: {
            tone: 'eco',
            path: 'M584 70 L700 84 L790 118 L812 176 L740 220 L644 198 L592 134 Z',
            label: { x: 692, y: 138, sub: '花园口 · 清洁能源 · 生态文旅' },
            eyebrow: 'CLEAN ENERGY & ECOLOGY · 生态经济',
            name: '庄河市',
            desc: '以清洁能源、海洋食品与生态文旅为特色，推进海上风电与临港产业协同发展，同时保护碧流河水源等生态资源，建设生态经济示范区。',
            kv: [['区域属性', '市域东北部'], ['主导产业', '清洁能源 + 海洋食品'], ['生态重点', '碧流河水源保护'], ['发展愿景', '生态经济示范区']],
            list: ['海上风电与清洁能源基地', '花园口临港产业与物流', '海洋食品精深加工', '冰峪沟等生态文旅提升']
        },
        ganjingzi: {
            tone: 'hub',
            path: 'M246 366 L470 356 L580 392 L566 444 L470 456 L300 452 L238 424 Z',
            label: { x: 430, y: 412, sub: '枢纽 · 体育 · 临湾生活' },
            eyebrow: 'TRANSPORT HUB · 综合枢纽',
            name: '甘井子区',
            desc: '承担航空、铁路与城市交通的对外枢纽功能，推进机场功能转移与梭鱼湾片区更新，形成面向大连湾的活力城区。',
            kv: [['功能定位', '综合交通枢纽区'], ['关键节点', '大连北站 · 周水子机场'], ['重点片区', '梭鱼湾 · 大连湾'], ['发展愿景', '枢纽型活力城区']],
            list: ['大连北站综合交通枢纽提升', '机场功能转移与片区再开发', '梭鱼湾体育赛事与产业导入', '跨湾通道接线与滨海空间整治']
        },
        core: {
            tone: 'core',
            path: 'M300 470 L448 462 L520 486 L522 528 L462 552 L370 542 L296 512 Z',
            label: { x: 408, y: 486, sub: '东港 · 中山广场 · 星海' },
            eyebrow: 'CITY CORE · 金融商务与文旅',
            name: '主城核心区（中山 · 西岗 · 沙河口）',
            desc: '以中山广场、人民路商务带与东港商务区为核心，发展总部经济、金融服务与滨海文旅，通过城市更新提升公共空间与服务品质。',
            kv: [['功能定位', '金融商务与文旅核心'], ['重点片区', '东港 · 中山广场'], ['重点工程', '邮轮母港 · 滨海景观带'], ['发展愿景', '国际会客厅']],
            list: ['东港商务区总部经济与国际会议', '中山广场历史风貌与人民路商务带', '星海广场与滨海文旅品质提升', '老旧街区更新与社区公共服务']
        },
        gaoxin: {
            tone: 'eco',
            path: 'M212 470 L292 458 L296 542 L268 578 L214 566 L190 512 Z',
            label: { x: 245, y: 512, sub: '科学城 · 软件数字产业' },
            eyebrow: 'SCIENCE CITY · 科学与数字产业',
            name: '高新区 · 英歌石',
            desc: '以英歌石科学城为创新引擎，聚焦洁净能源、精细化工与软件信息服务，推动科研成果转化与「数字大连」建设，形成城市南部科创走廊。',
            kv: [['功能定位', '科技创新走廊'], ['核心载体', '英歌石科学城'], ['主导产业', '洁净能源 + 软件服务'], ['发展愿景', '数字产业集聚区']],
            list: ['国家级实验室与科研机构集群', '软件与信息服务外包升级', '科研成果中试与转化基地', '人才公寓与创新社区配套']
        },
        lvshun: {
            tone: 'eco',
            path: 'M222 582 L302 572 L332 604 L290 632 L240 624 L214 598 Z',
            label: { x: 274, y: 600, sub: '历史文旅 · 绿色低碳' },
            eyebrow: 'HERITAGE & GREEN · 历史与绿色',
            name: '旅顺口区',
            desc: '在保护历史风貌与山海资源的前提下，发展文化旅游、生命健康与绿色低碳产业，推进太阳沟等历史街区的保护性更新，建设滨海生态宜居城区。',
            kv: [['功能定位', '历史文化与生态区'], ['特色业态', '文旅 + 生命健康'], ['保护重点', '历史街区风貌'], ['发展愿景', '绿色低碳示范区']],
            list: ['太阳沟历史街区保护更新', '滨海生态廊道与岸线修复', '生命健康产业与康养服务', '军港文化旅游线路打造']
        },
        changhai: {
            tone: 'island',
            path: 'M826 300 C826 289 835 281 846 281 C858 281 866 290 866 301 C866 312 857 319 846 319 C835 319 826 311 826 300 Z M865 338 C865 329 872 323 880 323 C889 323 895 330 895 339 C895 348 888 354 880 354 C871 354 865 347 865 338 Z M807 368 C807 360 813 355 820 355 C828 355 833 361 833 369 C833 377 827 382 820 382 C812 382 807 376 807 368 Z M874 232 C874 225 879 220 884 220 C891 220 896 226 896 233 C896 240 891 245 884 245 C877 245 874 239 874 232 Z',
            label: { x: 812, y: 400, sub: '海洋牧场 · 海岛旅游' },
            eyebrow: 'MARINE ECONOMY · 海洋牧场',
            name: '长海县',
            desc: '依托优质海域资源，发展海洋牧场、海岛旅游与海洋碳汇等新业态，推动渔业向生态化、智能化转型，打造海上「蓝色粮仓」。',
            kv: [['功能定位', '海洋经济示范区'], ['主导产业', '海洋牧场 + 海岛旅游'], ['关键方向', '海洋碳汇'], ['发展愿景', '蓝色粮仓']],
            list: ['国家级海洋牧场示范区建设', '海岛旅游与休闲渔业融合', '海洋碳汇与生态修复探索', '海上交通与基础设施完善']
        }

    };








    const planMap = $('#planMap');
    const regionTip = $('#regionTip');

    // 依据数据渲染规划片区（多边形）与片区标注，保证 SVG 图形与数据一一对应
    function renderPlanRegions() {
        const shapes = $('#planRegions');
        const labels = $('#planLabels');
        if (!shapes) return;
        const keys = Object.keys(PLAN_REGIONS).filter(function (key) {
            return !!PLAN_REGIONS[key].path;
        });
        shapes.innerHTML = keys.map(function (key) {
            const region = PLAN_REGIONS[key];
            return '<g class="region-node" data-region="' + key + '" tabindex="0" role="button" aria-label="' + region.name + '">' +
                '<path class="region region--' + region.tone + '" d="' + region.path + '"></path>' +
                '<title>' + region.name + '</title>' +
                '</g>';
        }).join('');
        if (labels) {
            labels.innerHTML = keys.map(function (key) {
                const region = PLAN_REGIONS[key];
                const label = region.label;
                const shortName = region.short || String(region.name).split('（')[0];
                return '<text class="plan-region-label" x="' + label.x + '" y="' + label.y + '" text-anchor="middle">' + shortName + '</text>' +
                    '<text class="plan-region-sub" x="' + label.x + '" y="' + (label.y + 16) + '" text-anchor="middle">' + label.sub + '</text>';
            }).join('');
        }
    }

    function hideRegionTip() {
        if (regionTip) regionTip.classList.remove('is-show');
    }

    function showRegionTip(text) {
        if (!regionTip) return;
        regionTip.textContent = text;
        regionTip.classList.add('is-show');
    }

    function renderPlanDetail(key) {
        const region = PLAN_REGIONS[key];
        if (!region) return;
        const eyebrow = $('#planEyebrow');
        const title = $('#planTitle');
        const desc = $('#planDesc');
        if (eyebrow) eyebrow.textContent = region.eyebrow;
        if (title) title.textContent = region.name;
        if (desc) desc.textContent = region.desc;
        const kv = $('#planKv');
        if (kv) {
            kv.innerHTML = region.kv.map(function (item) {
                return '<div><span>' + item[0] + '</span><b>' + item[1] + '</b></div>';
            }).join('');
        }
        const list = $('#planList');
        if (list) {
            list.innerHTML = region.list.map(function (item) { return '<li>' + item + '</li>'; }).join('');
        }
        $$('.region-node').forEach(function (node) {
            node.classList.toggle('is-active', node.getAttribute('data-region') === key);
        });
        if (hasGsap && !reduceMotion) {
            window.gsap.fromTo('#planDetail > *', { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out' });
        }
    }

    if (planMap) {
        planMap.addEventListener('click', function (event) {
            if (!event.target.closest) return;
            const node = event.target.closest('.region-node');
            if (node) {
                renderPlanDetail(node.getAttribute('data-region'));
                hideRegionTip();
            }
        });
        planMap.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            const node = event.target.closest ? event.target.closest('.region-node') : null;
            if (!node) return;
            event.preventDefault();
            renderPlanDetail(node.getAttribute('data-region'));
            hideRegionTip();
        });
    }

    // 悬停片区 → 在示意图顶部固定位置显示名称（不使用跟随鼠标的浮动气泡，避免遮挡其他片区）
    if (planMap) {
        planMap.addEventListener('mouseover', function (event) {
            const node = event.target.closest ? event.target.closest('.region-node') : null;
            if (!node) return;
            const region = PLAN_REGIONS[node.getAttribute('data-region')];
            if (region) showRegionTip(region.name + ' · 点击查看规划');
        });
        planMap.addEventListener('mouseout', function (event) {
            const node = event.target.closest ? event.target.closest('.region-node') : null;
            if (node) hideRegionTip();
        });
    }

    renderPlanRegions();
    renderPlanDetail('jinzhouwan');

    // 轨道交通图例与线路高亮
    const metroLegend = $('#metroLegend');
    if (metroLegend) {
        const clearMetro = function () {
            $$('.metro-line').forEach(function (line) { line.classList.remove('is-active'); });
            $$('#metroLegend button').forEach(function (btn) { btn.classList.remove('is-active'); });
        };
        const activateMetro = function (id) {
            if (!id) return;
            clearMetro();
            $$('.metro-line').forEach(function (line) {
                line.classList.toggle('is-active', line.getAttribute('data-line') === id);
            });
            $$('#metroLegend button').forEach(function (btn) {
                btn.classList.toggle('is-active', btn.getAttribute('data-line') === id);
            });
        };
        metroLegend.addEventListener('click', function (event) {
            const btn = event.target.closest ? event.target.closest('button') : null;
            if (!btn) return;
            if (btn.classList.contains('is-active')) clearMetro();
            else activateMetro(btn.getAttribute('data-line'));
        });
        $$('.metro-line').forEach(function (line) {
            line.addEventListener('click', function () { activateMetro(line.getAttribute('data-line')); });
        });
    }

    /* ---------- 09 互动问答 ---------- */
    const QUIZ = [
        {
            q: '大连（当时被沙俄命名为「达里尼」）是哪一年开始建市的？',
            options: ['1895 年', '1899 年', '1905 年', '1911 年'],
            answer: 1,
            explain: '1899 年沙俄在大连湾南岸的青泥洼一带建市并命名「达里尼」，这是大连城市建设的起点。'
        },
        {
            q: '大连是哪一年被列为全国首批沿海开放城市？',
            options: ['1978 年', '1984 年', '1992 年', '2003 年'],
            answer: 1,
            explain: '1984 年大连成为全国首批 14 个沿海开放城市之一，同年大连经济技术开发区成立。'
        },
        {
            q: '正在推进建设的金州湾国际机场，其建设方式是？',
            options: ['扩建山地机场', '填筑海上人工岛', '改造海岛机场', '原有机场原址扩建'],
            answer: 1,
            explain: '金州湾国际机场规划建于金州湾的海上人工岛，按 4F 级标准设计，规划年旅客吞吐量约 4300 万人次。'
        },
        {
            q: '「英歌石科学城」位于大连的哪个区域？',
            options: ['长兴岛', '旅顺口区', '高新区', '长海县'],
            answer: 2,
            explain: '英歌石科学城位于大连高新区，是城市科技创新与科技成果转化的重要载体。'
        },
        {
            q: '下列哪一项属于大连的城市定位？',
            options: ['东北亚国际航运中心', '西南能源枢纽', '内陆型制造业基地', '区域性农业中心'],
            answer: 0,
            explain: '大连的城市定位之一是东北亚国际航运中心、国际物流中心，港口与航运是其传统优势。'
        }
    ];

    const quizQuestion = $('#quizQuestion');
    const quizOpts = $('#quizOpts');
    const quizFeedback = $('#quizFeedback');
    const quizCounter = $('#quizCounter');
    const quizScore = $('#quizScore');
    const quizBar = $('#quizBar');
    const quizNo = $('#quizNo');
    const quizRestart = $('#quizRestart');
    let quizIndex = 0;
    let quizCorrect = 0;
    let quizAnswered = 0;
    let quizLocked = false;

    function renderQuiz() {
        if (!quizOpts || !quizQuestion) return;
        const current = QUIZ[quizIndex];
        quizLocked = false;
        if (quizCounter) quizCounter.textContent = '第 ' + (quizIndex + 1) + ' / ' + QUIZ.length + ' 题';
        if (quizNo) quizNo.textContent = 'QUESTION ' + ('0' + (quizIndex + 1)).slice(-2);
        if (quizBar) quizBar.style.width = (quizIndex / QUIZ.length * 100) + '%';
        if (quizScore) quizScore.textContent = '得分：' + quizCorrect + ' / ' + quizAnswered;
        if (quizFeedback) quizFeedback.textContent = '';
        quizQuestion.textContent = current.q;
        quizOpts.innerHTML = current.options.map(function (option, i) {
            return '<button class="quiz-opt" type="button" data-index="' + i + '">' +
                '<span class="key">' + 'ABCD'.charAt(i) + '</span>' + option + '</button>';
        }).join('');
    }

    function answerQuiz(choice) {
        if (quizLocked) return;
        quizLocked = true;
        const current = QUIZ[quizIndex];
        $$('.quiz-opt').forEach(function (btn) {
            const index = Number(btn.getAttribute('data-index'));
            btn.disabled = true;
            if (index === current.answer) btn.classList.add('is-right');
            else if (index === choice) btn.classList.add('is-wrong');
        });
        quizAnswered += 1;
        const right = choice === current.answer;
        if (right) quizCorrect += 1;
        if (quizFeedback) {
            quizFeedback.textContent = (right ? '✅ 回答正确！' : '❌ 正确答案是 ' + 'ABCD'.charAt(current.answer) + '，') + current.explain;
        }
        if (quizScore) quizScore.textContent = '得分：' + quizCorrect + ' / ' + quizAnswered;
        if (quizBar) quizBar.style.width = ((quizIndex + 1) / QUIZ.length * 100) + '%';

        setTimeout(function () {
            if (quizIndex < QUIZ.length - 1) {
                quizIndex += 1;
                renderQuiz();
            } else {
                showQuizResult();
            }
        }, 1600);
    }

    function showQuizResult() {
        if (!quizOpts || !quizQuestion) return;
        quizQuestion.textContent = '测试完成 · 你的成绩';
        quizOpts.innerHTML = '<div class="quiz-result"><span class="score">' + quizCorrect + ' / ' + QUIZ.length + '</span>' +
            '<p>' + (quizCorrect === QUIZ.length
                ? '满分！你已经是「大连通」了，快到留言板写下你的期待吧。'
                : quizCorrect >= QUIZ.length * 0.6
                    ? '不错！你已经掌握了大连的主要历史脉络与规划要点，可以回到时间轴再复习一遍。'
                    : '再看看时间轴与规划地图吧，那里藏着不少答案。') + '</p></div>';
        if (quizFeedback) quizFeedback.textContent = '';
        if (quizCounter) quizCounter.textContent = '已完成';
        if (quizBar) quizBar.style.width = '100%';
    }

    if (quizOpts) {
        quizOpts.addEventListener('click', function (event) {
            const btn = event.target.closest ? event.target.closest('.quiz-opt') : null;
            if (!btn || btn.disabled) return;
            answerQuiz(Number(btn.getAttribute('data-index')));
        });
    }

    if (quizRestart) {
        quizRestart.addEventListener('click', function () {
            quizIndex = 0;
            quizCorrect = 0;
            quizAnswered = 0;
            renderQuiz();
        });
    }

    if (quizQuestion) renderQuiz();

    /* ---------- 10 未来留言板（localStorage 本地持久化） ---------- */
    const BOARD_KEY = 'dalian-future-board-v1';
    const boardForm = $('#boardForm');
    const boardName = $('#boardName');
    const boardText = $('#boardText');
    const boardList = $('#boardList');
    const boardCount = $('#boardCount');
    const boardTip = $('#boardTip');

    const BOARD_SEED = [
        { name: '滨城小海豹', text: '希望未来的大连，地铁能修到家门口，去海边只要十分钟！', time: Date.now() - 86400000 * 3 },
        { name: '星海夜跑者', text: '期待金州湾国际机场早日建成，从海边出发就能飞向世界。', time: Date.now() - 86400000 * 2 },
        { name: '东财小学妹', text: '留一个心愿：毕业留在大连，做一名数字经济的建设者。', time: Date.now() - 3600000 * 6 }
    ];
    let boardData = [];

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function loadBoard() {
        try {
            const raw = window.localStorage.getItem(BOARD_KEY);
            if (!raw) return BOARD_SEED.slice();
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) && parsed.length ? parsed : BOARD_SEED.slice();
        } catch (err) {
            return BOARD_SEED.slice();
        }
    }

    function saveBoard() {
        try {
            window.localStorage.setItem(BOARD_KEY, JSON.stringify(boardData));
        } catch (err) {
            if (boardTip) boardTip.textContent = '当前浏览器不支持本地存储，留言仅在本次会话可见';
        }
    }

    function formatTime(ts) {
        const date = new Date(ts);
        const pad = function (n) { return ('0' + n).slice(-2); };
        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
            ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
    }

    function avatarColor(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 360;
        return 'hsl(' + hash + ', 74%, 70%)';
    }

    function renderBoard() {
        if (!boardList) return;
        boardData.sort(function (a, b) { return b.time - a.time; });
        if (!boardData.length) {
            boardList.innerHTML = '<p class="board-empty">还没有留言，写下第一条属于大连未来的期待吧。</p>';
        } else {
            boardList.innerHTML = boardData.map(function (item, i) {
                const name = item.name || '匿名市民';
                return '<div class="board-item">' +
                    '<span class="avatar" style="background:' + avatarColor(name) + '">' + escapeHtml(name.charAt(0)) + '</span>' +
                    '<div style="flex:1;min-width:0">' +
                    '<div class="meta"><b>' + escapeHtml(name) + '</b><span>' + formatTime(item.time) + '</span></div>' +
                    '<p>' + escapeHtml(item.text) + '</p>' +
                    '</div>' +
                    '<button class="del" type="button" data-index="' + i + '" aria-label="删除这条留言">×</button>' +
                    '</div>';
            }).join('');
        }
        if (boardCount) boardCount.textContent = '共 ' + boardData.length + ' 条留言';
    }

    if (boardForm) {
        boardForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const name = (boardName && boardName.value ? boardName.value : '').trim() || '匿名市民';
            const text = (boardText && boardText.value ? boardText.value : '').trim();
            if (text.length < 2) {
                if (boardTip) boardTip.textContent = '请至少输入 2 个字的心愿内容';
                return;
            }
            boardData.push({ name: name.slice(0, 12), text: text.slice(0, 80), time: Date.now() });
            saveBoard();
            renderBoard();
            if (boardText) boardText.value = '';
            if (boardTip) boardTip.textContent = '已发表！留言保存在本地浏览器，不会上传服务器';
        });
    }

    if (boardList) {
        boardList.addEventListener('click', function (event) {
            const btn = event.target.closest ? event.target.closest('.del') : null;
            if (!btn) return;
            const index = Number(btn.getAttribute('data-index'));
            if (index >= 0 && index < boardData.length) {
                boardData.splice(index, 1);
                saveBoard();
                renderBoard();
            }
        });
    }

    boardData = loadBoard();
    renderBoard();

    // 全部模块初始化完成





})();
