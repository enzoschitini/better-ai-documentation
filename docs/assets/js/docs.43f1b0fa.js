/*
 * BetterAI Docs — comportamento dos componentes.
 * Sem dependências. Inclua no fim do <body>: <script src="…/js/ds.js"></script>
 *
 * O que ele faz, pelo HTML (nenhum JS por página):
 *   [data-ico="nome"]        preenche o ícone (em <i>, troca o elemento por um <svg>)
 *   .callout[data-kind]      insere o ícone do tipo de aviso
 *   .code[data-tabs]         liga as abas .code-tab aos <pre> do .code-body
 *   .copy                    copia o código visível do bloco
 *   [data-theme-toggle]      alterna claro/escuro e guarda a escolha
 *   [data-menu-toggle]       abre e fecha o menu lateral no celular
 *   [data-open-search]       abre o <dialog id="search"> (também Ctrl K e /)
 *   .side-folder             abre e fecha subníveis do menu lateral
 *   .lang                    abre/fecha o menu de idioma e dispara o evento "ds:lang"
 *   #toc[data-toc]           monta "Nesta página" a partir dos h2/h3 do .prose
 *   #header                  mede a altura e publica em --top
 */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var slug = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); };
  var STORE = 'betterai-docs-theme';

  var ICON = {
    chevron: '<path d="m9 6 6 6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', close: '<path d="m6 6 12 12M18 6 6 18"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', list: '<path d="M4 6h16M4 12h10M4 18h13"/>',
    go: '<path d="M8 16 16 8M9 8h7v7"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
    up: '<path d="M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 2.6 2.3L13 10h5.2a2 2 0 0 1 2 2.4l-1.2 6a2 2 0 0 1-2 1.6H7"/>',
    dn: '<path d="M17 13V4h3v9zM17 13l-4 7a2 2 0 0 1-2.6-2.3L11 14H5.8a2 2 0 0 1-2-2.4l1.2-6A2 2 0 0 1 7 4h10"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.2"/>',
    tip: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1 2.2h5.2c0-.9.4-1.7 1-2.2A6 6 0 0 0 12 3z"/>',
    warn: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.2"/>',
    danger: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    note: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    blank: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    bolt: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',
    boxes: '<path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="m4 7 8 4 8-4M12 11v10"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
    layout: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M9 9v11"/>',
    folder: '<path d="M3.5 7a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>'
  };
  var svg = function (n, cls) { return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICON[n] || '') + '</svg>'; };
  window.DS = { icon: svg, icons: Object.keys(ICON) };

  /* ---------- ícones ---------- */
  function icons(root) {
    $$('[data-ico]', root).forEach(function (el) {
      if (el.tagName === 'I') el.outerHTML = svg(el.dataset.ico, el.className);
      else el.innerHTML = svg(el.dataset.ico);
    });
    $$('.callout[data-kind]', root).forEach(function (c) {
      if (c.firstElementChild && c.firstElementChild.tagName === 'svg') return;
      c.insertAdjacentHTML('afterbegin', svg(ICON[c.dataset.kind] ? c.dataset.kind : 'info'));
    });
  }

  /* ---------- código: abas e copiar ---------- */
  function code(root) {
    $$('.code[data-tabs]', root).forEach(function (box) {
      var tabs = $$('.code-tab', box), pres = $$('.code-body pre', box);
      tabs.forEach(function (b, i) {
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', i === 0);
        if (pres[i]) pres[i].hidden = i !== 0;
        b.addEventListener('click', function () {
          tabs.forEach(function (x) { x.setAttribute('aria-selected', x === b); });
          pres.forEach(function (p, j) { p.hidden = j !== i; });
        });
      });
    });
    $$('.copy', root).forEach(function (b) {
      b.setAttribute('aria-label', b.getAttribute('aria-label') || 'Copiar código');
      b.innerHTML = svg('copy');
      b.addEventListener('click', function () {
        var pre = $$('pre', b.closest('.code')).filter(function (p) { return !p.hidden; })[0];
        if (!pre) return;
        try { navigator.clipboard.writeText(pre.textContent.replace(/^\n/, '').replace(/\s+$/, '')); } catch (e) {}
        b.innerHTML = svg('check');
        setTimeout(function () { b.innerHTML = svg('copy'); }, 1600);
      });
    });
  }

  /* ---------- tema ---------- */
  function theme() {
    var root = document.documentElement;
    function paint() {
      $$('[data-theme-toggle]').forEach(function (b) {
        b.innerHTML = svg(root.dataset.theme === 'dark' ? 'sun' : 'moon');
        if (!b.getAttribute('aria-label')) b.setAttribute('aria-label', 'Alternar tema claro e escuro');
      });
    }
    $$('[data-theme-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = root.dataset.theme === 'dark' ? 'light' : 'dark';
        root.dataset.theme = t;
        try { localStorage.setItem(STORE, t); } catch (e) {}
        paint();
      });
    });
    paint();
  }

  /* ---------- cabeçalho, menu e busca ---------- */
  function shell() {
    var header = $('#header');
    if (header && window.ResizeObserver) {
      var sync = function () { document.documentElement.style.setProperty('--top', header.offsetHeight + 'px'); };
      new ResizeObserver(sync).observe(header); sync();
    }
    var close = function () { document.body.classList.remove('nav-open'); $$('[data-menu-toggle]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); }); };
    $$('[data-menu-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var open = document.body.classList.toggle('nav-open');
        b.setAttribute('aria-expanded', open);
      });
    });
    $$('.side-folder').forEach(function (f) {
      f.addEventListener('click', function () {
        var open = f.getAttribute('aria-expanded') !== 'true';
        f.setAttribute('aria-expanded', open);
        if (f.nextElementSibling) f.nextElementSibling.hidden = !open;
      });
    });
    var scrim = $('.scrim'); if (scrim) scrim.addEventListener('click', close);
    $$('.side-wrap a').forEach(function (a) { a.addEventListener('click', close); });

    var dlg = $('#search');
    var openSearch = function () { if (dlg && !dlg.open) { close(); dlg.showModal(); var i = $('input', dlg); if (i) i.focus(); } };
    $$('[data-open-search]').forEach(function (b) { b.addEventListener('click', openSearch); });
    if (dlg) dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    var banner = $('#banner button'); if (banner) banner.addEventListener('click', function () { $('#banner').hidden = true; });

    $$('.lang').forEach(function (box) {
      var btn = $('.lang-btn', box), menu = $('.lang-menu', box);
      if (!btn || !menu) return;
      btn.addEventListener('click', function () { menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', !menu.hidden); });
      menu.addEventListener('click', function (e) {
        var b = e.target.closest('[data-lang]'); if (!b) return;
        $$('[data-lang]', menu).forEach(function (x) { x.setAttribute('aria-checked', x === b); });
        $('b', btn).textContent = b.dataset.lang.toUpperCase();
        document.dispatchEvent(new CustomEvent('ds:lang', { detail: b.dataset.lang }));
        menu.hidden = true; btn.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.lang')) $$('.lang-menu').forEach(function (m) { m.hidden = true; });
    });
    addEventListener('keydown', function (e) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if ((e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) { if (dlg) { e.preventDefault(); openSearch(); } }
      if (e.key === 'Escape') { close(); $$('.lang-menu').forEach(function (m) { m.hidden = true; }); }
    });
  }

  /* ---------- índice da página ---------- */
  function toc() {
    var box = $('#toc[data-toc]'), prose = $('.prose');
    if (!prose) return;
    var hs = $$('h2, h3', prose).filter(function (h) { return h.closest('.prose') === prose; }), seen = {};
    hs.forEach(function (h) {
      if (!h.id) { var id = slug(h.textContent), n = 2, base = id; while (seen[id] || document.getElementById(id)) id = base + '-' + n++; h.id = id; }
      seen[h.id] = 1;
      // O build do site já ancora os títulos, para que o id exista no HTML
      // antes de o JS rodar (deep link e índice de busca dependem disso).
      // Sem esta guarda, cada título ganharia uma segunda âncora: "##".
      if (!h.querySelector('.anchor')) {
        h.insertAdjacentHTML('afterbegin', '<a class="anchor" href="#' + h.id + '" aria-label="Link para esta seção">#</a>');
      }
    });
    var has = hs.length > 1;
    document.body.classList.toggle('no-toc', !has);
    var inline = $('.toc-inline');
    if (!has) { if (inline) inline.remove(); if (box) box.innerHTML = ''; return; }
    var items = hs.map(function (h) {
      return '<li><a class="lvl-' + h.tagName[1] + '" href="#' + h.id + '" data-h="' + h.id + '">' + esc(h.textContent.replace(/^#/, '')) + '</a></li>';
    }).join('');
    if (inline) {
      $('ul', inline).innerHTML = items;
      inline.addEventListener('click', function (e) { if (e.target.closest('a')) inline.open = false; });
    }
    if (!box) return;
    box.innerHTML = '<p class="toc-title">' + svg('list') + 'Nesta página</p><ul>' + items + '</ul>';
    var links = $$('a', box), ticking = false;
    function spy() {
      var top = ($('#header') ? $('#header').offsetHeight : 0) + 40, active = hs[0];
      hs.forEach(function (h) { if (h.getBoundingClientRect().top <= top) active = h; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) active = hs[hs.length - 1];
      links.forEach(function (a) { if (a.dataset.h === active.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; spy(); }); } }, { passive: true });
    spy();
  }

  function init() { icons(); code(); theme(); shell(); toc(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

;
/* docs.js — o que o ds.js deliberadamente não faz.
 *
 * O ds.js cuida de ícones, abas de código, copiar, tema, gaveta, --top, TOC e
 * de ABRIR/FECHAR o diálogo de busca (Ctrl K, /, Esc). Ele não faz menu,
 * roteamento, i18n, nem índice/ranking/render da busca.
 *
 * O menu e o i18n são resolvidos no build. Sobram duas coisas para o cliente:
 *   1. navegação de idioma, respondendo ao evento "ds:lang" do ds.js
 *   2. índice, ranking e render dos resultados de busca
 *
 * Config vem do window.DOCS, injetado por página pelo build.
 */
(function () {
  'use strict';

  var C = window.DOCS || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---------- 1. idioma: navega, não troca conteúdo ---------- */
  document.addEventListener('ds:lang', function (e) {
    var to = e.detail;
    if (!to || to === C.lang) return;
    try { localStorage.setItem('betterai-docs-lang', to); } catch (_) {}
    // C.alt é gerado no build (caminho relativo à raiz), e C.root é o
    // prefixo desta página até a raiz — então trocar idioma nunca chuta URL
    var url = (C.root || '') + ((C.alt && C.alt[to]) || (to + '/'));
    location.href = url + location.hash;
  });

  /* ---------- 2. busca ---------- */
  var dlg = $('#search');
  if (!dlg) return;

  var input = $('input', dlg);
  var list = $('.results', dlg);
  var IDX = null, LOADING = null, ROWS = [], sel = -1;

  function load() {
    if (IDX) return Promise.resolve(IDX);
    if (!LOADING) {
      LOADING = fetch(C.index)
        .then(function (r) { return r.json(); })
        .then(function (j) { IDX = j; return j; })
        .catch(function () { LOADING = null; return null; });
    }
    return LOADING;
  }

  // prefetch: quando o diálogo pinta, o fetch normalmente já terminou
  var trigger = $('[data-open-search]');
  if (trigger) {
    ['pointerenter', 'focus'].forEach(function (ev) {
      trigger.addEventListener(ev, load, { once: true });
    });
  }

  // fold() precisa bater com o do build: NFD, sem diacríticos, minúsculas.
  // Preserva o comprimento, então os offsets de <mark> valem nos dois textos.
  function fold(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function mark(text, term) {
    var i = fold(text).indexOf(term);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + term.length)) +
           '</mark>' + esc(text.slice(i + term.length));
  }

  /* Faixas do protótipo, estendidas para o corpo.
     0 título startsWith · 1 título includes · 2 seção startsWith
     3 seção includes · 4 migalha · 5 corpo
     +0.5 de penalidade para seção, +ordem/1000 como desempate estável */
  function rank(term) {
    // os caminhos do índice são relativos à raiz do site
    var R = C.root || '', out = [], perPage = {}, i, j;
    for (i = 0; i < IDX.p.length; i++) {
      var p = IDX.p[i], t = fold(p[2]), c = fold(p[3]), sc = -1;
      if (t.indexOf(term) === 0) sc = 0;
      else if (t.indexOf(term) >= 0) sc = 1;
      else if (c.indexOf(term) >= 0) sc = 4;
      if (sc >= 0) out.push({ u: R + p[1], t: p[2], c: p[3], s: sc + p[4] / 1000 });
    }
    for (j = 0; j < IDX.s.length; j++) {
      var s = IDX.s[j], pg = IDX.p[s[0]], h = fold(s[2]), sc2 = -1, snip = '';
      if (h.indexOf(term) === 0) sc2 = 2;
      else if (h.indexOf(term) >= 0) sc2 = 3;
      else {
        var k = s[3].indexOf(term);
        if (k >= 0) { sc2 = 5; snip = s[4].slice(Math.max(0, k - 40), k + 80); }
      }
      if (sc2 < 0) continue;
      perPage[s[0]] = (perPage[s[0]] || 0) + 1;
      if (perPage[s[0]] > 3) continue;   // uma página longa não inunda a lista
      out.push({
        u: R + pg[1] + '#' + s[1], t: s[2], c: pg[2] + ' / ' + pg[3],
        snip: snip, s: sc2 + 0.5 + pg[4] / 1000
      });
    }
    return out.sort(function (a, b) { return a.s - b.s; }).slice(0, 12);
  }

  function paint(rows, term) {
    ROWS = rows; sel = rows.length ? 0 : -1;
    if (!rows.length) {
      var msg = (C.i && C.i.noResults ? C.i.noResults : 'Nada encontrado para “%s”.')
        .replace('%s', esc(term));
      list.innerHTML = '<li class="no-results">' + msg + '</li>';
      return;
    }
    list.innerHTML = rows.map(function (r, i) {
      return '<li class="result" role="option" aria-selected="' + (i === 0) + '">' +
        '<a href="' + r.u + '">' +
        '<span class="r-title">' + mark(r.t, term) + '</span>' +
        '<span class="r-path">' + esc(r.c) + '</span>' +
        (r.snip ? '<span class="r-snip">' + mark(r.snip, term) + '</span>' : '') +
        '</a></li>';
    }).join('');
  }

  function suggestions() {
    if (!IDX || !IDX.popular || !IDX.popular.length) { list.innerHTML = ''; return; }
    var R = C.root || '';
    var rows = IDX.popular.map(function (i) {
      var p = IDX.p[i];
      return { u: R + p[1], t: p[2], c: p[3], s: 0 };
    });
    ROWS = rows; sel = 0;
    var label = (C.i && C.i.suggestions) || 'Sugestões';
    list.innerHTML = '<li class="no-results">' + esc(label) + '</li>' +
      rows.map(function (r, i) {
        return '<li class="result" role="option" aria-selected="' + (i === 0) + '">' +
          '<a href="' + r.u + '"><span class="r-title">' + esc(r.t) + '</span>' +
          '<span class="r-path">' + esc(r.c) + '</span></a></li>';
      }).join('');
  }

  function run() {
    var q = (input.value || '').trim();
    load().then(function (ok) {
      if (!ok) return;
      if (!q) { suggestions(); return; }
      paint(rank(fold(q)), fold(q));
    });
  }

  input.addEventListener('input', run);

  // o ds.js abre o diálogo; aqui só reagimos à abertura para popular a lista
  new MutationObserver(function () {
    if (dlg.open) { input.value = ''; load().then(function (ok) { if (ok) suggestions(); }); }
  }).observe(dlg, { attributes: true, attributeFilter: ['open'] });

  function move(d) {
    if (!ROWS.length) return;
    sel = (sel + d + ROWS.length) % ROWS.length;
    var items = list.querySelectorAll('.result');
    for (var i = 0; i < items.length; i++) {
      items[i].setAttribute('aria-selected', i === sel);
    }
    if (items[sel]) items[sel].scrollIntoView({ block: 'nearest' });
  }

  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (ROWS[sel]) location.href = ROWS[sel].u;   // URL real, não location.hash
    }
  });

  /* ---------- 3. copiar página ---------- */
  var cp = $('[data-copy-page]');
  if (cp) {
    cp.addEventListener('click', function () {
      var prose = $('.prose');
      if (!prose || !navigator.clipboard) return;
      navigator.clipboard.writeText(prose.innerText).then(function () {
        var span = $('span', cp);
        if (!span) return;
        var old = span.textContent;
        span.textContent = '✓';
        setTimeout(function () { span.textContent = old; }, 1200);
      });
    });
  }
})();
