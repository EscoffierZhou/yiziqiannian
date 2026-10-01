/* ============================================================
   《一字千年》· 从竹简到芯片的中国信息之路
   交互脚本：滚动叙事 + 文明进度环 + 首页字形演化
             + 竹简拖拽/缩放 + 纸张物理 + 信息重量
             + 印刷复制 + 电与通信 + 字符编码粒子
             + 芯片电路 + AI 信息网络 + 最终汇聚
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ============================================================
     工具：编码计算
  ============================================================ */
  function toUTF8(cp) {
    if (cp < 0x80) return [cp];
    if (cp < 0x800) return [0xc0 | (cp >> 6), 0x80 | (cp & 0x3f)];
    if (cp < 0x10000) return [0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f)];
    return [0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f)];
  }
  const hexByte = (b) => b.toString(16).toUpperCase().padStart(2, "0");
  const group4 = (s) => s.replace(/(\d{4})(?=\d)/g, "$1 ");
  const firstChar = (s) => Array.from((s || "").trim())[0] || "国";

  /* ============================================================
     1. 滚动进度 + 文明进度环 + 揭示动画
  ============================================================ */
  const scrollProgress = $("#scrollProgress");
  const ringNav = $("#ringNav");
  const ringFill = $("#ringFill");
  const ringNodes = $$(".ring-node");
  const scenes = $$(".scene");

  function onScroll() {
    const doc = document.documentElement;
    const y = doc.scrollTop;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? y / max : 0;
    scrollProgress.style.width = (p * 100) + "%";
    ringFill.style.height = (p * 100) + "%";

    const mid = y + window.innerHeight / 2;
    let currentId = scenes[0] ? scenes[0].id : "";
    for (const s of scenes) if (s.offsetTop <= mid) currentId = s.id;
    ringNodes.forEach((n) => n.classList.toggle("is-active", n.dataset.target === currentId));
  }

  let scrollTick = false;
  window.addEventListener("scroll", () => {
    if (!scrollTick) {
      requestAnimationFrame(() => { onScroll(); scrollTick = false; });
      scrollTick = true;
    }
  }, { passive: true });

  ringNodes.forEach((n) => {
    n.addEventListener("click", () => {
      const el = document.getElementById(n.dataset.target);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
  });

  // 进度环：鼠标靠近右缘才浮现
  document.addEventListener("mousemove", (e) => {
    ringNav.classList.toggle("is-visible", e.clientX > window.innerWidth - 90);
  }, { passive: true });

  // 揭示动画
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); revealObserver.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el) => revealObserver.observe(el));

  /* ============================================================
     2. 序 · 首页：墨迹场 + 字形演化 + 依次浮现
  ============================================================ */
  const opening = $("#scene-opening");
  const inkField = $("#inkField");
  const glyphStage = $("#glyphStage");
  const glyphOracle = $(".glyph--oracle", glyphStage);
  const glyphBronze = $(".glyph--bronze", glyphStage);
  const glyphRegular = $(".glyph--regular", glyphStage);

  function playOpening() {
    opening.classList.remove("shown");
    void opening.getBoundingClientRect();
    opening.classList.add("shown");
  }

  // 墨迹场跟随鼠标 + 「中」字随靠近演化出甲骨/金文轮廓
  let rafId = 0;
  opening.addEventListener("pointermove", (e) => {
    const r = glyphStage.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = e.clientX - cx, dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const intensity = Math.max(0, 1 - dist / (Math.max(r.width, 200) * 1.4));

    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        inkField.style.background =
          "radial-gradient(240px 240px at " + e.clientX + "px " + e.clientY +
          "px, rgba(233,228,216,.07), transparent 70%)";
        glyphOracle.style.opacity = (intensity * 0.9).toFixed(3);
        glyphBronze.style.opacity = (intensity * 0.7).toFixed(3);
        glyphRegular.style.opacity = (1 - intensity * 0.55).toFixed(3);
        glyphRegular.style.filter = "blur(" + (intensity * 1.2).toFixed(2) + "px)";
        rafId = 0;
      });
    }
  }, { passive: true });

  $("#startBtn").addEventListener("click", () => {
    $("#scene-bamboo").scrollIntoView({ behavior: "smooth" });
  });

  /* ============================================================
     3. 第一幕 · 竹简：生成 + 惯性拖拽 + 滚轮缩放 + HUD
  ============================================================ */
  const bambooViewport = $("#bambooViewport");
  const bambooTrack = $("#bambooTrack");
  const scanLight = $("#scanLight");
  const bambooIndChar = $("#bambooIndChar");
  const bambooIndStage = $("#bambooIndStage");

  // 九根竹简：九个真实历史字形（从初文「或」到汉隶「國」真实矢量重构）
  const bambooSlipsData = [
    {
      char: "或",
      stage: "西周初文",
      detail: "西周金文初文 · 无外框（一戈一囗守疆）",
      isKey: true,
      svg: '<svg viewBox="0 0 100 120" class="slip-svg"><g fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"><path d="M68 14 Q64 60 72 106"/><path d="M46 30 L80 24 M70 26 L78 40"/><path d="M64 48 L54 60"/><rect x="22" y="44" width="22" height="24" rx="2"/><line x1="16" y1="88" x2="48" y2="88"/></g></svg>'
    },
    {
      char: "或",
      stage: "金文变体",
      detail: "金文饰笔变体 · 加粗肥笔饰点",
      isKey: false,
      svg: '<svg viewBox="0 0 100 120" class="slip-svg"><g fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"><path d="M66 12 Q61 58 70 108"/><path d="M42 26 L82 22"/><circle cx="66" cy="24" r="4.5" fill="currentColor"/><path d="M72 23 L80 38"/><path d="M62 46 L48 58"/><circle cx="55" cy="52" r="3.5" fill="currentColor"/><path d="M22 46 L42 42 L40 68 L20 70 Z"/><line x1="14" y1="90" x2="48" y2="88" stroke-width="5"/></g></svg>'
    },
    {
      char: "國",
      stage: "早期金文",
      detail: "刚加上囗外框 · 早期圆角金文",
      isKey: false,
      svg: '<svg viewBox="0 0 100 120" class="slip-svg"><g fill="none" stroke="currentColor" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="16" width="76" height="88" rx="14"/><path d="M62 30 Q60 62 65 88"/><path d="M46 38 L72 34 M64 35 L70 46"/><rect x="28" y="50" width="18" height="20" rx="3"/><line x1="25" y1="84" x2="48" y2="84"/></g></svg>'
    },
    {
      char: "國",
      stage: "楚系简文",
      detail: "清华简 · 楚系战国舒展异形",
      isKey: false,
      svg: '<svg viewBox="0 0 100 120" class="slip-svg"><g fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16 22 Q12 60 18 100 Q50 104 82 100 Q88 60 84 22 Q50 16 16 22"/><path d="M64 28 Q58 64 68 88 Q72 92 78 88"/><path d="M44 38 Q58 36 74 32 M64 34 L72 44"/><path d="M28 52 Q38 48 46 52 Q44 68 42 74 Q32 76 26 72 Q26 60 28 52"/><path d="M24 86 Q36 82 48 86"/></g></svg>'
    },
    {
      char: "國",
      stage: "秦系战国",
      detail: "秦系战国石刻 · 偏方正平直",
      isKey: false,
      svg: '<svg viewBox="0 0 100 120" class="slip-svg"><g fill="none" stroke="currentColor" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="18" width="72" height="84" rx="4"/><line x1="64" y1="28" x2="64" y2="88"/><path d="M44 38 L74 35 M64 36 L72 48"/><rect x="28" y="52" width="20" height="20" rx="1"/><line x1="26" y1="84" x2="48" y2="84"/></g></svg>'
    },
    {
      char: "國",
      stage: "小篆前夜",
      detail: "小篆前夜 · 趋于对称匀称",
      isKey: false,
      svg: '<svg viewBox="0 0 100 120" class="slip-svg"><g fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><rect x="15" y="16" width="70" height="88" rx="8"/><path d="M63 26 C62 50 62 70 63 90"/><path d="M42 36 L73 34 M63 35 L71 46"/><path d="M60 52 L48 64"/><rect x="27" y="52" width="20" height="20" rx="4"/><line x1="25" y1="84" x2="48" y2="84"/></g></svg>'
    },
    {
      char: "國",
      stage: "秦小篆",
      detail: "秦小篆标准形 · 李斯玉箸篆",
      isKey: false,
      svg: '<svg viewBox="0 0 100 120" class="slip-svg"><g fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M16 30 C16 18 28 16 50 16 C72 16 84 18 84 30 L84 88 C84 100 72 102 50 102 C28 102 16 100 16 88 Z"/><path d="M62 26 C60 54 60 76 62 92"/><path d="M42 36 C56 34 68 33 74 33 M62 34 C67 40 71 46 72 49"/><path d="M60 52 C54 58 48 64 45 66"/><path d="M28 54 C28 48 34 46 41 46 C48 46 54 48 54 54 L54 66 C54 72 48 74 41 74 C34 74 28 72 28 66 Z"/><path d="M24 84 C34 83 44 83 50 84"/></g></svg>'
    },
    {
      char: "國",
      stage: "秦隶雏形",
      detail: "秦隶雏形 · 破圆为方曲线拉直",
      isKey: false,
      svg: '<svg viewBox="0 0 100 120" class="slip-svg"><g fill="none" stroke="currentColor" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 24 L86 24 L86 96 L14 96 Z"/><path d="M60 32 L60 88"/><path d="M40 40 L76 37 M60 39 L70 50"/><line x1="58" y1="58" x2="48" y2="68"/><rect x="26" y="52" width="22" height="18"/><line x1="22" y1="84" x2="50" y2="84"/></g></svg>'
    },
    {
      char: "國",
      stage: "成熟汉隶",
      detail: "成熟汉隶版 · 蚕头燕尾承接楷书",
      isKey: true,
      svg: '<svg viewBox="0 0 100 120" class="slip-svg"><g fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 28 Q48 25 88 26 L86 94 L14 94 Z"/><line x1="58" y1="36" x2="58" y2="84" stroke-width="4.5"/><path d="M36 44 Q56 42 78 40 Q82 40 84 38" stroke-width="4.8"/><path d="M58 42 L68 54"/><line x1="56" y1="62" x2="44" y2="72" stroke-width="3.8"/><rect x="24" y="54" width="22" height="16"/><path d="M20 84 Q38 82 50 83" stroke-width="4.2"/></g></svg>'
    }
  ];

  const slipElements = [];
  bambooSlipsData.forEach((item, idx) => {
    const slip = document.createElement("div");
    slip.className = "slip" + (item.isKey ? " slip--key" : "");
    slip.innerHTML =
      '<div class="slip-glyph-box" aria-label="' + item.char + '">' + item.svg + '</div>' +
      '<span class="slip-tag">' + item.stage + '</span>';
    slip.dataset.index = idx;
    slip.dataset.char = item.char;
    slip.dataset.stage = item.detail;
    slip.addEventListener("click", () => {
      if (!dragMoved && glyphHud) glyphHud.hidden = false;
    });
    bambooTrack.appendChild(slip);
    slipElements.push(slip);
  });

  let tx = 0, scale = 1;
  let minX = 0, maxX = 0;
  let dragging = false, dragMoved = false;
  let startX = 0, startTX = 0;
  let vel = 0, lastX = 0, lastT = 0, momentumId = 0;
  let centered = false;

  function updateBambooIndicator() {
    if (!bambooIndChar || !bambooIndStage || !bambooViewport || slipElements.length === 0) return;
    const viewRect = bambooViewport.getBoundingClientRect();
    const viewCenter = viewRect.left + viewRect.width / 2;
    let closestItem = bambooSlipsData[0];
    let minDistance = Infinity;

    slipElements.forEach((slip, idx) => {
      const rect = slip.getBoundingClientRect();
      const slipCenter = rect.left + rect.width / 2;
      const dist = Math.abs(slipCenter - viewCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestItem = bambooSlipsData[idx];
      }
    });

    bambooIndChar.textContent = closestItem.char;
    bambooIndStage.textContent = closestItem.detail;
  }

  function applyBamboo() {
    bambooTrack.style.transform = "translateX(" + tx + "px) scale(" + scale + ")";
    updateBambooIndicator();
  }
  function measureBamboo() {
    const trackW = bambooTrack.scrollWidth * scale;
    const viewW = bambooViewport.clientWidth;
    minX = Math.min(0, viewW - trackW - 16);
    maxX = 16;
    if (!centered) {
      const first = slipElements[0];
      if (first) {
        const kc = (first.offsetLeft + first.offsetWidth / 2) * scale;
        tx = viewW / 2 - kc;
        centered = true;
      }
    }
    tx = Math.max(minX, Math.min(maxX, tx));
    applyBamboo();
  }
  measureBamboo();
  window.addEventListener("resize", measureBamboo);

  // 扫描光跟随鼠标
  bambooViewport.addEventListener("pointermove", (e) => {
    if (scanLight) {
      const r = bambooViewport.getBoundingClientRect();
      scanLight.style.left = (e.clientX - r.left - 60) + "px";
    }
  });

  bambooViewport.addEventListener("pointerdown", (e) => {
    cancelAnimationFrame(momentumId);
    dragging = true; dragMoved = false;
    startX = e.clientX; startTX = tx;
    lastX = e.clientX; lastT = performance.now(); vel = 0;
    bambooViewport.classList.add("dragging");
    bambooViewport.setPointerCapture(e.pointerId);
  });
  bambooViewport.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    vel = (e.clientX - lastX) / dt;
    lastX = e.clientX; lastT = now;
    if (Math.abs(e.clientX - startX) > 6) dragMoved = true;
    tx = Math.max(minX, Math.min(maxX, startTX + (e.clientX - startX)));
    applyBamboo();
  });
  function endBambooDrag() {
    if (!dragging) return;
    dragging = false;
    bambooViewport.classList.remove("dragging");
    // 惯性滑行
    let v = vel * 180;
    const step = () => {
      v *= 0.92;
      tx += v;
      if (tx < minX || tx > maxX) { v *= -0.35; tx = Math.max(minX, Math.min(maxX, tx)); }
      applyBamboo();
      if (Math.abs(v) > 0.05) momentumId = requestAnimationFrame(step);
    };
    momentumId = requestAnimationFrame(step);
  }
  bambooViewport.addEventListener("pointerup", endBambooDrag);
  bambooViewport.addEventListener("pointercancel", endBambooDrag);

  // 滚轮缩放
  bambooViewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    scale = Math.max(0.7, Math.min(2.2, scale + (e.deltaY < 0 ? 0.1 : -0.1)));
    measureBamboo();
  }, { passive: false });

  /* 字形演变 HUD */
  const glyphHud = $("#glyphHud");
  const hudGlyphs = $("#hudGlyphs");
  const glyphData = [
    {
      name: "西周初文",
      era: "西周",
      svg: '<svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M68 12 Q65 50 72 90"/><path d="M48 24 L78 20 M67 22 L75 34"/><rect x="24" y="44" width="24" height="24" rx="2"/><line x1="20" y1="80" x2="48" y2="80"/></g></svg>'
    },
    {
      name: "早期金文",
      era: "春秋",
      svg: '<svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="14" width="72" height="72" rx="10"/><path d="M62 26 Q60 52 64 74"/><path d="M46 34 L70 30"/><rect x="28" y="44" width="18" height="18" rx="2"/><line x1="26" y1="70" x2="46" y2="70"/></g></svg>'
    },
    {
      name: "秦小篆",
      era: "秦代",
      svg: '<svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 28 C18 18 28 16 50 16 C72 16 82 18 82 28 L82 86 C82 96 72 98 50 98 C28 98 18 96 18 86 Z"/><path d="M60 26 C58 52 58 74 60 90"/><path d="M42 34 C54 32 66 31 72 31 M60 32 C65 38 69 44 70 47"/><path d="M58 50 C52 56 46 62 43 64"/><path d="M28 52 C28 46 34 44 41 44 C48 44 54 46 54 52 L54 64 C54 70 48 72 41 72 C34 72 28 70 28 64 Z"/><path d="M24 82 C34 81 44 81 50 82"/></g></svg>'
    },
    {
      name: "成熟汉隶",
      era: "汉代",
      svg: '<svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 26 Q48 23 88 24 L86 92 L14 92 Z"/><line x1="58" y1="34" x2="58" y2="82" stroke-width="4.8"/><path d="M36 42 Q56 40 78 38 Q82 38 84 36" stroke-width="5"/><path d="M58 40 L68 52"/><line x1="56" y1="60" x2="44" y2="70" stroke-width="4"/><rect x="24" y="52" width="22" height="16"/><path d="M20 82 Q38 80 50 81" stroke-width="4.5"/></g></svg>'
    },
  ];
  glyphData.forEach((g) => {
    const cell = document.createElement("div");
    cell.className = "hud__glyph";
    cell.innerHTML =
      '<div class="hud__glyph__box">' + (g.svg || '<span>' + g.glyph + "</span>") + "</div>" +
      '<div class="hud__glyph__name">' + g.name + "</div>" +
      '<div class="hud__glyph__era">' + g.era + "</div>";
    hudGlyphs.appendChild(cell);
  });

  $("#glyphHudClose").addEventListener("click", () => { glyphHud.hidden = true; });
  glyphHud.addEventListener("click", (e) => { if (e.target === glyphHud) glyphHud.hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") glyphHud.hidden = true; });

  /* ============================================================
     4. 第二幕 · 纸：拖拽物理
  ============================================================ */
  const paperSheet = $("#paperSheet");
  const paperStage = $(".paper-stage");
  let pdrag = false, pstartX = 0, pstartY = 0, porigX = 0, porigY = 0, pvelX = 0, plastX = 0, plastT = 0;
  let paperMomentum = 0;

  function paperHome() {
    paperSheet.style.transition = "transform .7s cubic-bezier(.22,.61,.36,1), box-shadow .4s";
    paperSheet.style.transform = "rotate(-2deg)";
  }
  paperSheet.addEventListener("pointerdown", (e) => {
    cancelAnimationFrame(paperMomentum);
    pdrag = true;
    const r = paperSheet.getBoundingClientRect();
    porigX = r.left + r.width / 2 - paperStage.getBoundingClientRect().left;
    porigY = r.top + r.height / 2;
    pstartX = e.clientX; pstartY = e.clientY;
    plastX = e.clientX; plastT = performance.now(); pvelX = 0;
    paperSheet.classList.add("dragging");
    paperSheet.setPointerCapture(e.pointerId);
  });
  paperSheet.addEventListener("pointermove", (e) => {
    if (!pdrag) return;
    const now = performance.now();
    const dt = Math.max(1, now - plastT);
    pvelX = (e.clientX - plastX) / dt;
    plastX = e.clientX; plastT = now;
    const dx = e.clientX - pstartX, dy = e.clientY - pstartY;
    const rot = Math.max(-16, Math.min(16, dx * 0.08));
    paperSheet.style.transform = "translate(" + dx + "px," + dy + "px) rotate(" + rot + "deg)";
    paperSheet.style.boxShadow = (18 + Math.abs(dx) * 0.3) + "px " + (40 + Math.abs(dy) * 0.2) + "px 60px rgba(0,0,0,.55)";
  });
  function endPaperDrag() {
    if (!pdrag) return;
    pdrag = false;
    paperSheet.classList.remove("dragging");
    let v = pvelX * 90;
    const step = () => {
      v *= 0.9;
      if (Math.abs(v) < 0.05) { paperHome(); return; }
      const cur = paperSheet.style.transform.match(/translate\(([-\d.]+)px,([-\d.]+)px\)/);
      const cx = cur ? parseFloat(cur[1]) : 0, cy = cur ? parseFloat(cur[2]) : 0;
      paperSheet.style.transform = "translate(" + (cx + v) + "px," + cy + "px) rotate(" + Math.max(-16, Math.min(16, v * 0.2)) + "deg)";
      paperMomentum = requestAnimationFrame(step);
    };
    paperMomentum = requestAnimationFrame(step);
  }
  paperSheet.addEventListener("pointerup", endPaperDrag);
  paperSheet.addEventListener("pointercancel", endPaperDrag);

  /* ============================================================
     5. 第二幕 · 信息重量滑杆
  ============================================================ */
  const weightRange = $("#weightRange");
  const weightField = $("#weightField");
  const weightConclusion = $("#weightConclusion");

  const sampleText = "天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏闰余成岁律吕调阳云腾致雨露结为霜金生丽水玉出昆冈";
  function seedWeightField() {
    const chars = Array.from(sampleText);
    for (let i = 0; i < 120; i++) {
      const s = document.createElement("span");
      s.textContent = chars[Math.floor(Math.random() * chars.length)];
      s.style.left = (Math.random() * 94) + "%";
      s.style.top = (Math.random() * 88) + "%";
      s.style.fontSize = (13 + Math.random() * 15) + "px";
      s.style.color = "rgba(233,228,216,.6)";
      s.style.transitionDelay = (Math.random() * 0.4) + "s";
      weightField.appendChild(s);
    }
  }
  seedWeightField();
  const weightSpans = $$("span", weightField);

  function updateWeight() {
    const v = parseInt(weightRange.value, 10); // 0 = 竹简(重)，100 = 纸(轻)
    const shown = Math.round(8 + (v / 100) * (weightSpans.length - 8));
    weightSpans.forEach((s, i) => { s.style.opacity = i < shown ? "0.85" : "0"; });
    weightConclusion.textContent =
      v < 30 ? "载体越重，信息越少。" :
      v < 70 ? "信息与载体，在轻与重之间权衡。" :
      "载体变轻，信息开始变多。";
  }
  weightRange.addEventListener("input", updateWeight);
  updateWeight();

  /* ============================================================
     6. 第三幕 · 印刷：雕版/活字 + 复制爆发
  ============================================================ */
  const printGrid = $("#printGrid");
  const printCaption = $("#printCaption");
  const copyBtn = $("#copyBtn");
  const printTools = $$(".print-tool");

  const ROWS = 6, COLS = 8;
  const cells = [];
  // 以中心为起点的填充顺序
  const order = [];
  {
    const cxs = (COLS - 1) / 2, cys = (ROWS - 1) / 2;
    const idxs = [];
    for (let i = 0; i < ROWS * COLS; i++) idxs.push(i);
    idxs.sort((a, b) => {
      const da = (a % COLS - cxs) ** 2 + (Math.floor(a / COLS) - cys) ** 2;
      const db = (b % COLS - cxs) ** 2 + (Math.floor(b / COLS) - cys) ** 2;
      return da - db;
    });
    order.push(...idxs);
  }
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement("div");
    cell.className = "print-cell";
    cell.textContent = "國";
    printGrid.appendChild(cell);
    cells.push(cell);
  }

  let filled = 1; // 初始 1 个「國」
  function fillN(n) {
    cells.forEach((c) => c.classList.remove("filled"));
    for (let i = 0; i < n; i++) {
      const cell = cells[order[i]];
      cell.style.transform = "scale(.6)";
      cell.style.opacity = "0";
      cell.style.rotate = (Math.random() * 8 - 4) + "deg";
      cell.style.fontSize = (20 + Math.random() * 22) + "px";
      setTimeout(() => {
        cell.classList.add("filled");
        cell.style.transform = "scale(1)";
        cell.style.opacity = (0.75 + Math.random() * 0.25).toFixed(2);
      }, i * 24);
    }
    if (n >= cells.length) printCaption.textContent = "文字第一次获得了规模。";
    else if (n === 1) printCaption.textContent = "一个「國」字。";
    else printCaption.textContent = n + " 个「國」。";
  }
  fillN(1);

  copyBtn.addEventListener("click", () => {
    filled = Math.min(cells.length, filled * 2);
    fillN(filled);
  });

  printTools.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn === copyBtn) return;
      printTools.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      printGrid.classList.toggle("mode-block", btn.dataset.mode === "block");
      printGrid.classList.toggle("mode-type", btn.dataset.mode === "type");
      fillN(filled);
    });
  });
  printGrid.classList.add("mode-block");

  /* ============================================================
     7. 第四幕 · 电与通信：时间轴切换
  ============================================================ */
  const telecomSteps = $$(".telecom-step");
  const telecomViews = $$(".telecom-view");
  telecomSteps.forEach((btn) => {
    btn.addEventListener("click", () => {
      telecomSteps.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      telecomViews.forEach((v) => v.classList.toggle("is-active", v.dataset.view === btn.dataset.stage));
    });
  });

  /* ============================================================
     8. 第五幕 · 计算机：编码链 + 粒子溶解
  ============================================================ */
  const encodeInput = $("#encodeInput");
  const encodeRun = $("#encodeRun");
  const encChar = $("#encChar"), encUnicode = $("#encUnicode"), encBinary = $("#encBinary"), encData = $("#encData");
  const encodeLayers = $$(".encode-layer");
  const encodeCanvas = $("#encodeCanvas");
  const ecx = encodeCanvas.getContext("2d");

  function lightLayers(seq) {
    encodeLayers.forEach((l, i) => l.classList.toggle("lit", i === seq));
  }
  function showEncode(ch) {
    const cp = ch.codePointAt(0);
    const bytes = toUTF8(cp);
    encChar.textContent = ch;
    encUnicode.textContent = "U+" + cp.toString(16).toUpperCase().padStart(4, "0") + " · " + cp;
    encBinary.textContent = group4(cp.toString(2).padStart(16, "0"));
    encData.textContent = bytes.map(hexByte).join(" ");
  }

  /* 粒子：字形 → 数据流 */
  let encParticles = [];
  let encAnim = 0, encStart = 0;
  function dissolveChar(ch) {
    cancelAnimationFrame(encAnim);
    const off = document.createElement("canvas");
    off.width = off.height = 120;
    const o = off.getContext("2d");
    o.fillStyle = "#fff";
    o.font = "600 104px serif";
    o.textAlign = "center"; o.textBaseline = "middle";
    o.fillText(ch, 60, 60);
    const data = o.getImageData(0, 0, 120, 120).data;
    encParticles = [];
    const step = 3;
    for (let y = 0; y < 120; y += step) {
      for (let x = 0; x < 120; x += step) {
        if (data[(y * 120 + x) * 4 + 3] > 90) {
          encParticles.push({
            x: 70 + x * 1.5, y: 20 + y * 1.5,
            ox: 70 + x * 1.5, oy: 20 + y * 1.5,
            bit: Math.random() < 0.5 ? "0" : "1",
            delay: Math.random() * 0.4,
          });
        }
      }
    }
    encStart = performance.now();
    drawEncode(ch);
  }

  function drawEncode(ch) {
    const W = encodeCanvas.width, H = encodeCanvas.height;
    const t = (performance.now() - encStart) / 2400; // 0..1
    ecx.clearRect(0, 0, W, H);

    // 数据流列（右侧二进制）
    const binStr = Array.from("0101 0110 1111 1101 0101 0110");
    ecx.font = "13px monospace";
    ecx.fillStyle = "rgba(114,214,208,.9)";
    for (let i = 0; i < binStr.length; i++) {
      const row = Math.floor(i / 4);
      const pos = Math.max(0, (t * 1.2) - row * 0.14);
      ecx.globalAlpha = Math.max(0, Math.min(1, pos));
      ecx.fillText(binStr[i], W - 150 + (i % 4) * 11, 60 + row * 18);
    }

    // 粒子：从左（字形）向右（数据）漂移
    for (const p of encParticles) {
      const pt = Math.max(0, Math.min(1, (t * 1.4) - p.delay * 0.3));
      const ex = 70 + (W - 240 - 70) * easeOut(pt);
      const x = p.ox + (ex - p.ox) * easeOut(pt);
      const y = p.oy + Math.sin(pt * 5 + p.oy) * 6;
      const alpha = pt < 0.6 ? 0.9 : (1 - pt) * 2.2;
      ecx.globalAlpha = Math.max(0, alpha);
      ecx.fillStyle = pt > 0.55 ? "#72D6D0" : "#E9E4D8";
      ecx.fillRect(x, y, 2, 2);
    }
    ecx.globalAlpha = 1;

    if (t < 1) encAnim = requestAnimationFrame(() => drawEncode(ch));
    else {
      // 定格为数据流
      encAnim = requestAnimationFrame(() => { /* 保持末帧 */ });
    }
  }
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function runEncode() {
    const ch = firstChar(encodeInput.value || "国");
    encodeInput.value = ch;
    showEncode(ch);
    [0, 1, 2, 3].forEach((i) => setTimeout(() => lightLayers(i), i * 260));
    setTimeout(() => lightLayers(-1), 1200);
    dissolveChar(ch);
  }
  encodeRun.addEventListener("click", runEncode);
  encodeInput.addEventListener("keydown", (e) => { if (e.key === "Enter") runEncode(); });
  encodeInput.addEventListener("input", () => { encodeInput.value = firstChar(encodeInput.value); });
  runEncode();

  /* ============================================================
     9. 第六幕 · 芯片：电路 + 鼠标激活 + 区域 HUD
  ============================================================ */
  const NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  const chipBoard = $("#chipBoard");
  const chipPins = $("#chipPins");
  const chipTraces = $("#chipTraces");
  const chipZones = $("#chipZones");
  const chipLegend = $$(".chip-legend span");
  const chipStageEl = $(".chip-stage");

  // 芯片 HUD
  const chipHud = document.createElement("div");
  chipHud.className = "chip-hud";
  chipStageEl.appendChild(chipHud);

  const traces = [];
  (function buildChip() {
    // 引脚：四边各 7 根
    const step = 160 / 8;
    for (let i = 1; i < 8; i++) {
      const off = 120 + i * step;
      chipPins.appendChild(svgEl("line", { x1: off, y1: 120, x2: off, y2: 98 }));
      chipPins.appendChild(svgEl("line", { x1: off, y1: 280, x2: off, y2: 302 }));
      chipPins.appendChild(svgEl("line", { x1: 120, y1: off, x2: 98, y2: off }));
      chipPins.appendChild(svgEl("line", { x1: 280, y1: off, x2: 302, y2: off }));
    }
    // 芯片表面走线网格
    const gridStep = 20;
    for (let x = 120; x <= 280; x += gridStep) {
      const p = svgEl("path", { d: "M" + x + " 120 L" + x + " 280" });
      chipTraces.appendChild(p);
      traces.push({ el: p, x1: x, y1: 120, x2: x, y2: 280, horiz: false });
    }
    for (let y = 120; y <= 280; y += gridStep) {
      const p = svgEl("path", { d: "M120 " + y + " L280 " + y });
      chipTraces.appendChild(p);
      traces.push({ el: p, x1: 120, y1: y, x2: 280, y2: y, horiz: true });
    }
    // 外层走线
    const outer = [
      "M160 98 L160 120", "M200 98 L200 120", "M240 98 L240 120",
      "M98 160 L120 160", "M98 240 L120 240",
      "M302 200 L280 200", "M200 302 L200 280",
    ];
    outer.forEach((d) => { const p = svgEl("path", { d: d }); chipTraces.appendChild(p); traces.push({ el: p, outer: true }); });

    // 五个可点击区域
    const zones = [
      { k: "字符", explain: "字符：汉字被纳入字符集，获得唯一编号（U+56FD）。", x: 120, w: 32 },
      { k: "编码", explain: "编码：字符被转换成机器可处理的字节序列（E5 9B BD）。", x: 152, w: 32 },
      { k: "存储", explain: "存储：编码后的 0 与 1 被写入硅片。", x: 184, w: 32 },
      { k: "计算", explain: "计算：逻辑门对数据执行运算。", x: 216, w: 32 },
      { k: "传输", explain: "传输：信号沿着线路流向世界。", x: 248, w: 32 },
    ];
    zones.forEach((z, i) => {
      const r = svgEl("rect", { x: z.x, y: 120, width: z.w, height: 160, rx: 2 });
      r.dataset.i = i;
      chipZones.appendChild(r);
      r.addEventListener("click", (e) => {
        chipHud.textContent = z.explain;
        const pt = svgPoint(e);
        chipHud.style.left = (pt.x - 60) + "px";
        chipHud.style.top = (pt.y - 40) + "px";
        chipHud.classList.add("show");
        setTimeout(() => chipHud.classList.remove("show"), 2200);
        chipLegend.forEach((s, j) => s.classList.toggle("lit", j === i));
      });
    });
  })();

  function svgPoint(e) {
    const r = chipBoard.getBoundingClientRect();
    const s = 400 / r.width;
    return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s };
  }
  function distToSeg(px, py, a, b) {
    const dx = b.x2 - b.x1, dy = b.y2 - b.y1;
    const len2 = dx * dx + dy * dy || 1;
    let t = ((px - b.x1) * dx + (py - b.y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const cx = b.x1 + t * dx, cy = b.y1 + t * dy;
    return Math.hypot(px - cx, py - cy);
  }

  chipBoard.addEventListener("pointermove", (e) => {
    const pt = svgPoint(e);
    traces.forEach((b) => {
      if (b.outer) return;
      b.el.classList.toggle("lit", distToSeg(pt.x, pt.y, b) < 14);
    });
  });
  chipBoard.addEventListener("pointerleave", () => {
    traces.forEach((b) => b.el.classList.remove("lit"));
  });

  // 芯片三段文案随进入视口依次浮现
  const chipLines = $(".chip-lines");
  const chipLinesObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { chipLines.classList.add("in"); chipLinesObs.disconnect(); } });
  }, { threshold: 0.4 });
  chipLinesObs.observe(chipLines);

  /* ============================================================
     10. 第七幕 · AI：信息网络（可拖拽节点 + 连线 + 点击解释）
  ============================================================ */
  const aiInput = $("#aiInput");
  const aiRun = $("#aiRun");
  const aiNetwork = $("#aiNetwork");
  const aiLinks = $("#aiLinks");
  const aiExplainer = $("#aiExplainer");

  const aiNodes = [
    { key: "glyph", k: "字形", explain: "汉字首先是一种视觉符号。" },
    { key: "char", k: "字符", explain: "每一个字形都被纳入字符集，获得唯一编号。" },
    { key: "encode", k: "编码", explain: "计算机需要把文字转换成机器能处理的编码。" },
    { key: "data", k: "数据", explain: "编码最终变成 0 与 1 的数据流。" },
    { key: "model", k: "模型", explain: "今天，机器不仅存储文字，也开始理解、生成和传播内容。" },
    { key: "semantic", k: "语义", explain: "文字背后，是人类几千年来约定的意义。" },
    { key: "content", k: "内容", explain: "从理解出发，机器开始生成新的内容。" },
    { key: "spread", k: "传播", explain: "新的内容，以光速抵达世界的每一个角落。" },
  ];

  const nodeEls = [];
  const linkEls = [];
  const positions = [];

  function layoutNetwork() {
    const r = aiNetwork.getBoundingClientRect();
    const w = r.width, h = r.height;
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * 0.36;
    const n = aiNodes.length;
    aiNodes.forEach((_, i) => {
      const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
      positions[i] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) };
    });
  }

  aiNodes.forEach((def, i) => {
    const node = document.createElement("div");
    node.className = "ai-node";
    node.dataset.key = def.key;
    node.innerHTML = '<span class="ai-node__k">' + def.k + '</span><span class="ai-node__v">…</span>';
    aiNetwork.appendChild(node);
    nodeEls.push(node);
    // 顺序连线（0-1, 1-2, ...）
    if (i > 0) {
      const line = document.createElementNS(NS, "line");
      aiLinks.appendChild(line);
      linkEls.push({ line, a: i - 1, b: i });
    }
  });

  function placeNodes() {
    nodeEls.forEach((node, i) => {
      node.style.left = positions[i].x + "px";
      node.style.top = positions[i].y + "px";
    });
    updateLinks();
  }
  function updateLinks() {
    linkEls.forEach((l) => {
      const a = positions[l.a], b = positions[l.b];
      l.line.setAttribute("x1", a.x); l.line.setAttribute("y1", a.y);
      l.line.setAttribute("x2", b.x); l.line.setAttribute("y2", b.y);
    });
  }
  layoutNetwork();
  placeNodes();
  window.addEventListener("resize", () => { layoutNetwork(); placeNodes(); });

  // 拖拽节点
  let activeNode = null, activeIdx = -1;
  nodeEls.forEach((node, i) => {
    node.addEventListener("pointerdown", (e) => {
      activeNode = node; activeIdx = i;
      node.classList.add("dragging");
      node.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    node.addEventListener("pointermove", (e) => {
      if (activeNode !== node) return;
      const r = aiNetwork.getBoundingClientRect();
      positions[i] = { x: e.clientX - r.left, y: e.clientY - r.top };
      node.style.left = positions[i].x + "px";
      node.style.top = positions[i].y + "px";
      updateLinks();
    });
    const end = () => {
      if (activeNode !== node) return;
      node.classList.remove("dragging");
      activeNode = null; activeIdx = -1;
    };
    node.addEventListener("pointerup", end);
    node.addEventListener("pointercancel", end);
  });

  // 点击解释 + 点亮连线
  nodeEls.forEach((node, i) => {
    node.addEventListener("click", () => {
      nodeEls.forEach((n) => n.classList.remove("active"));
      node.classList.add("active");
      aiExplainer.textContent = aiNodes[i].k + " · " + aiNodes[i].explain;
      linkEls.forEach((l) => l.line.classList.toggle("lit", l.a === i || l.b === i));
    });
  });

  const charWords = {
    "国": ["家国、疆土、文明传承", "国家", "国土", "国风"],
    "中": ["中华", "中心", "中国"],
    "家": ["家庭", "家园", "大家"], "人": ["人民", "人生", "人才"],
    "心": ["心灵", "初心", "心愿"], "文": ["文字", "文明", "文化"],
    "学": ["学习", "学问", "学堂"], "爱": ["热爱", "关爱", "大爱"],
    "梦": ["梦想", "追梦", "中国梦"], "和": ["和谐", "和平", "和合"],
    "福": ["幸福", "祝福", "福祉"], "春": ["春天", "青春", "春风"],
    "华": ["中华", "华夏", "华章"], "智": ["智慧", "智能", "人工智能"],
    "信": ["信息", "诚信", "信念"], "数": ["数字", "数据", "数千年"],
    "光": ["光明", "光芒", "时光"], "山": ["山河", "高山", "江山"],
  };

  function runAI() {
    const raw = aiInput.value.trim();
    const word = raw || "国";
    const ch = Array.from(word)[0] || "国";
    const cp = ch.codePointAt(0);
    const bytes = toUTF8(cp);
    const wordHex = Array.from(word).map((c) => {
      const b = toUTF8(c.codePointAt(0));
      return b.map(hexByte).join(" ");
    }).join(" / ");

    const semanticVal = ch === "国" ? "家国、疆土、文明传承" : (charWords[ch] || [""])[0];

    const values = {
      glyph: word,
      char: "U+" + cp.toString(16).toUpperCase().padStart(4, "0"),
      encode: wordHex,
      data: group4(cp.toString(2).padStart(16, "0")),
      model: "模型理解中…",
      semantic: "语义关联 → " + semanticVal,
      content: "内容生成中…",
      spread: "光速传播",
    };

    nodeEls.forEach((node, i) => {
      const v = values[aiNodes[i].key] || "…";
      const vEl = $(".ai-node__v", node);
      vEl.textContent = v;
      vEl.classList.toggle("ai-node__v--mono", ["char", "encode", "data"].includes(aiNodes[i].key));
      node.classList.add("lit");
    });

    // 依次点亮
    const litOrder = [0, 1, 2, 3, 4, 5, 6, 7];
    litOrder.forEach((i, idx) => {
      setTimeout(() => {
        nodeEls.forEach((n, j) => n.classList.toggle("lit", j === i));
      }, idx * 220);
    });
    setTimeout(() => {
      $(".ai-node__v", nodeEls[4]).textContent = "理解「" + word + "」";
      $(".ai-node__v", nodeEls[6]).textContent = "写下新内容";
    }, 1800);
  }
  aiRun.addEventListener("click", runAI);
  aiInput.addEventListener("keydown", (e) => { if (e.key === "Enter") runAI(); });
  runAI();

  /* ============================================================
     11. 尾声 · 用户自己的字：信息宇宙汇聚
  ============================================================ */
  const finalInput = $("#finalInput");
  const finalRun = $("#finalRun");
  const convergeStage = $("#convergeStage");
  const convergeChar = $("#convergeChar");
  const convergeCanvas = $("#convergeCanvas");
  const ccx = convergeCanvas.getContext("2d");
  const endingLines = $("#endingLines");

  const convergeParticles = [];
  const convergeTypes = [
    { color: "#c9a769", label: "竹简" },   // 竹简
    { color: "#e3d6b5", label: "纸" },     // 纸
    { color: "#9E302C", label: "印刷" },   // 印刷
    { color: "#72D6D0", label: "电报" },   // 电
    { color: "#7bed9f", label: "01" },     // 二进制
    { color: "#2f6f52", label: "芯片" },   // 芯片
    { color: "#B89A62", label: "AI" },     // AI
  ];

  function spawnConverge() {
    const W = convergeCanvas.width, H = convergeCanvas.height;
    const n = 180;
    for (let i = 0; i < n; i++) {
      const t = convergeTypes[i % convergeTypes.length];
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.random() * Math.max(W, H) * 0.62;
      convergeParticles.push({
        x: W / 2 + Math.cos(ang) * rad,
        y: H / 2 + Math.sin(ang) * rad,
        vx: 0, vy: 0,
        size: 1 + Math.random() * 2.2,
        color: t.color,
        label: Math.random() < 0.12 ? t.label : null,
      });
    }
  }
  spawnConverge();

  let convergeRunning = false;
  function drawConverge() {
    const W = convergeCanvas.width, H = convergeCanvas.height;
    const cx = W / 2, cy = H / 2;
    ccx.clearRect(0, 0, W, H);
    for (const p of convergeParticles) {
      const dx = cx - p.x, dy = cy - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      const f = 0.4 / (dist * 0.02 + 1) + 0.02;
      p.vx += (dx / dist) * f; p.vy += (dy / dist) * f;
      p.vx *= 0.94; p.vy *= 0.94;
      p.x += p.vx; p.y += p.vy;
      const a = Math.max(0, Math.min(0.9, 1 - dist / (Math.max(W, H) * 0.7)));
      ccx.globalAlpha = a;
      ccx.fillStyle = p.color;
      ccx.beginPath();
      ccx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ccx.fill();
      if (p.label && a > 0.2) {
        ccx.globalAlpha = a * 0.8;
        ccx.fillStyle = p.color;
        ccx.font = "10px monospace";
        ccx.fillText(p.label, p.x + 6, p.y - 4);
      }
    }
    ccx.globalAlpha = 1;
  }
  function convergeLoop() {
    if (!convergeRunning) return;
    drawConverge();
    requestAnimationFrame(convergeLoop);
  }

  const convergeObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      convergeRunning = en.isIntersecting;
      if (convergeRunning) {
        convergeLoop();
        endingLines.classList.add("show");
      }
    });
  }, { threshold: 0.25 });
  convergeObs.observe(convergeStage);

  function runFinal() {
    const ch = firstChar(finalInput.value);
    finalInput.value = ch;
    convergeChar.textContent = ch;
    convergeChar.style.opacity = "0";
    // 汇聚粒子重新爆发一次
    convergeParticles.length = 0;
    spawnConverge();
    requestAnimationFrame(() => { convergeChar.style.opacity = "1"; });
    endingLines.classList.remove("show");
    setTimeout(() => endingLines.classList.add("show"), 400);
  }
  finalRun.addEventListener("click", runFinal);
  finalInput.addEventListener("keydown", (e) => { if (e.key === "Enter") runFinal(); });
  finalInput.addEventListener("input", () => { finalInput.value = firstChar(finalInput.value); });

  /* ============================================================
     12. 尾声 · 重新开始 + 键盘翻页
  ============================================================ */
  $("#restartBtn").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(playOpening, 600);
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    if (e.key === "ArrowDown" || e.key === "PageDown") window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
    if (e.key === "ArrowUp" || e.key === "PageUp") window.scrollBy({ top: -window.innerHeight, behavior: "smooth" });
  });

  /* ============================================================
     启动
  ============================================================ */
  playOpening();
  onScroll();
})();
