/* "How we build our agents": the interactive post.
   React 18 + htm (no build step). All texts come from content.js; this file only draws them. */
(function () {
  'use strict';
  var R = window.React, RD = window.ReactDOM;
  var h = window.htm.bind(R.createElement);
  var useState = R.useState, useEffect = R.useEffect;
  var DATA = window.AX_AGENTS_CONTENT, S = DATA.shared;
  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- small helpers ---------- */
  function num(n, lang) {
    var sep = lang === 'es' ? ' ' : ',';
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  }
  function fmtTime(sec, approx) {
    var s = sec >= 60 ? Math.floor(sec / 60) + ' min' + (sec % 60 ? ' ' + (sec % 60) + ' s' : '') : sec + ' s';
    return (approx ? '≈ ' : '') + s;
  }
  function Raw(props) {
    return h`<${props.tag || 'p'} className=${props.className} dangerouslySetInnerHTML=${{ __html: props.html }} />`;
  }
  function Paras(props) {
    return props.items.map(function (p, i) { return h`<${Raw} key=${i} html=${p} />`; });
  }
  function Section(props) {
    return h`<section className=${'agx-section ' + (props.tone || '')} id=${props.id}><div className="agx-wrap">${props.children}</div></section>`;
  }
  function Head(props) {
    return h`<div className="agx-prose"><span className="agx-kicker">${props.kicker}</span><h2 className="agx-h2">${props.title}</h2></div>`;
  }
  function useLang() {
    var init = 'en';
    try {
      var q = (location.search.match(/[?&]lang=(es|en)/) || [])[1] || (location.hash === '#es' ? 'es' : location.hash === '#en' ? 'en' : '');
      var saved = localStorage.getItem('agx-lang');
      init = q || (saved === 'es' || saved === 'en' ? saved : 'en');
    } catch (e) { /* storage may be unavailable: English */ }
    var st = useState(init), lang = st[0], setLang = st[1];
    useEffect(function () {
      document.documentElement.lang = lang;
      try { localStorage.setItem('agx-lang', lang); } catch (e) { /* ignore */ }
    }, [lang]);
    return [lang, setLang];
  }

  /* ---------- hero ---------- */
  function LangToggle(props) {
    return h`<div className="agx-lang" role="group" aria-label="Language">
      ${['en', 'es'].map(function (l) {
        return h`<button key=${l} type="button" className=${props.lang === l ? 'on' : ''} aria-pressed=${props.lang === l} onClick=${function () { props.setLang(l); }}>${l.toUpperCase()}</button>`;
      })}
    </div>`;
  }
  function Hero(props) {
    var t = props.t;
    return h`<section className="ax-page-hero agx-hero"><div className="in">
      <div className="agx-hero-top"><a className="ax-back" href="index.html">${t.back}</a><${LangToggle} lang=${props.lang} setLang=${props.setLang} /></div>
      <span className="ax-label">${t.kicker}</span>
      <h1>${t.title} <em>${t.titleEm}</em></h1>
      <p>${t.standfirst}</p>
      <p className="agx-meta">${t.meta}</p>
      <div className="agx-badges">${t.badges.map(function (b, i) { return h`<span key=${i}>${b}</span>`; })}</div>
    </div></section>`;
  }

  /* ---------- 0 · origin ---------- */
  function Origin(props) {
    var t = props.t;
    return h`<${Section} tone="white" id="origin">
      <${Head} kicker=${t.kicker} title=${t.title} />
      <div className="agx-prose"><${Paras} items=${t.paras} /></div>
      <ol className="agx-timeline">${t.timeline.map(function (s, i) {
        return h`<li key=${i}><span className="when">${s.when}</span><strong>${s.what}</strong><span className="how">${s.how}</span></li>`;
      })}</ol>
    </${Section}>`;
  }

  /* ---------- 1 · the loop ---------- */
  var NODE_ORDER = ['ctx', 'llm', 'tool', 'llm', 'done'];
  function LoopRing(props) {
    var names = props.names, active = props.active;
    var cx = 120, cy = 120, r = 78;
    var nodes = [
      { id: 'ctx', a: -90, cls: 'ctx' }, { id: 'llm', a: 0, cls: 'llm' },
      { id: 'tool', a: 90, cls: 'tool' }, { id: 'result', a: 180, cls: 'result' }
    ];
    var pos = function (a, rr) { var rad = a * Math.PI / 180; return [cx + (rr || r) * Math.cos(rad), cy + (rr || r) * Math.sin(rad)]; };
    var arc = function (a0, a1) {
      var p0 = pos(a0, r), p1 = pos(a1, r);
      return 'M' + p0[0] + ',' + p0[1] + ' A' + r + ',' + r + ' 0 0 1 ' + p1[0] + ',' + p1[1];
    };
    var activeId = active === 'done' ? 'result' : active;
    return h`<svg className="agx-ring" viewBox="0 0 240 240" role="img" aria-label=${props.hint}>
      <defs><marker id="agx-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#9AA6C2"/></marker></defs>
      ${[[-72, -18], [18, 72], [108, 162], [198, 252]].map(function (s, i) {
        return h`<path key=${i} d=${arc(s[0], s[1])} fill="none" stroke="#C9D2E6" strokeWidth="2" markerEnd="url(#agx-arr)"/>`;
      })}
      ${nodes.map(function (n, i) {
        var p = pos(n.a), on = n.id === activeId;
        var tx = p[0], ty = n.a === -90 ? p[1] - 30 : p[1] + 36;
        return h`<g key=${n.id} className=${'agx-node agx-node-' + n.cls + (on ? ' on' : '')}>
          <circle cx=${p[0]} cy=${p[1]} r=${on ? 22 : 18} />
          <text x=${tx} y=${ty} textAnchor="middle">${names[i]}</text>
        </g>`;
      })}
      ${props.turn ? h`<text x=${cx} y=${cy + 5} textAnchor="middle" className="agx-ring-turn">${props.turnLabel} ${props.turn}</text>` : null}
    </svg>`;
  }
  function LoopPlayer(props) {
    var t = props.t, tr = S.trace, n = t.steps.length;
    var st = useState(0), step = st[0], setStep = st[1];
    var pl = useState(false), playing = pl[0], setPlaying = pl[1];
    var md = useState('local'), mode = md[0], setMode = md[1];
    useEffect(function () {
      if (!playing) return undefined;
      if (step >= n - 1) { setPlaying(false); return undefined; }
      var id = setTimeout(function () { setStep(step + 1); }, 2000);
      return function () { clearTimeout(id); };
    }, [playing, step, n]);
    var secs = mode === 'local' ? tr.localSec : tr.cloudSec;
    var elapsed = 0; for (var i = 0; i <= step; i++) elapsed += secs[i];
    var turns = t.steps.slice(0, step + 1).filter(function (s) { return s.who === 'llm'; }).length;
    var finished = step >= n - 1;
    var onPlay = function () {
      if (finished) { setStep(0); setPlaying(true); return; }
      setPlaying(!playing);
    };
    return h`<div className="agx-panel agx-loop">
      <div className="agx-loop-bar">
        <button type="button" className="agx-btn" onClick=${onPlay}>${finished ? t.replay : playing ? t.pause : t.play}</button>
        <div className="agx-seg-ctl" role="group" aria-label="Model">
          <button type="button" className=${mode === 'local' ? 'on' : ''} aria-pressed=${mode === 'local'} onClick=${function () { setMode('local'); }}>${t.modeLocal}</button>
          <button type="button" className=${mode === 'cloud' ? 'on' : ''} aria-pressed=${mode === 'cloud'} onClick=${function () { setMode('cloud'); }}>${t.modeCloud}</button>
        </div>
        <div className="agx-clock"><span>${t.clock}</span><strong>${fmtTime(elapsed, mode === 'cloud')}</strong></div>
      </div>
      <div className="agx-loop-body">
        <ol className="agx-msgs" aria-live="polite">${t.steps.slice(0, step + 1).map(function (s, i) {
          var time = mode === 'local' ? s.timeLocal : s.timeCloud;
          return h`<li key=${i} className=${'agx-msg agx-msg-' + s.who}>
            <div className="agx-msg-head"><strong>${s.title}</strong>${time ? h`<span className="agx-time">${time}</span>` : null}</div>
            <${Raw} tag="div" className="agx-msg-body" html=${s.body} />
          </li>`;
        })}</ol>
        <div className="agx-loop-side">
          <${LoopRing} names=${t.nodes} active=${NODE_ORDER[step]} turn=${turns} turnLabel=${t.turn} hint=${t.nodeHint} />
          <p className="agx-ring-hint">${t.nodeHint}</p>
          <p className="agx-ring-total"><span>${t.modeLocal}: ${t.totals.local}</span><span>${t.modeCloud}: ${t.totals.cloud}</span></p>
        </div>
      </div>
    </div>`;
  }
  function AgentSection(props) {
    var t = props.t;
    return h`<${Section} tone="light" id="agent">
      <${Head} kicker=${t.kicker} title=${t.title} />
      <div className="agx-prose"><${Paras} items=${t.paras} /></div>
      <${LoopPlayer} t=${t} lang=${props.lang} />
    </${Section}>`;
  }

  /* ---------- 2 · the harness ---------- */
  function arcPath(cx, cy, r0, r1, a0, a1) {
    var p = function (r, a) { var rad = (a - 90) * Math.PI / 180; return (cx + r * Math.cos(rad)).toFixed(1) + ',' + (cy + r * Math.sin(rad)).toFixed(1); };
    var large = (a1 - a0) > 180 ? 1 : 0;
    return 'M' + p(r1, a0) + ' A' + r1 + ',' + r1 + ' 0 ' + large + ' 1 ' + p(r1, a1) + ' L' + p(r0, a1) + ' A' + r0 + ',' + r0 + ' 0 ' + large + ' 0 ' + p(r0, a0) + ' Z';
  }
  function Anatomy(props) {
    var t = props.t;
    var st = useState('context'), part = st[0], setPart = st[1];
    var cx = 190, cy = 190, r0 = 96, r1 = 186;
    var arcs = [
      { id: 'context', a0: 2, a1: 118 }, { id: 'tools', a0: 122, a1: 238 }, { id: 'protocols', a0: 242, a1: 358 }
    ];
    var mid = function (a) { var rad = (a - 90) * Math.PI / 180, rr = (r0 + r1) / 2; return [cx + rr * Math.cos(rad), cy + rr * Math.sin(rad)]; };
    var sel = t.parts[part];
    var pick = function (id) { return function () { setPart(id); }; };
    var key = function (id) { return function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPart(id); } }; };
    return h`<div className="agx-anatomy">
      <div className="agx-anatomy-fig">
        <svg viewBox="0 0 380 380" role="group" aria-label=${t.title}>
          ${arcs.map(function (a) {
            var m = mid((a.a0 + a.a1) / 2), on = part === a.id;
            return h`<g key=${a.id} className=${'agx-arc agx-arc-' + a.id + (on ? ' on' : '')} role="button" tabIndex="0" aria-pressed=${on} aria-label=${t.parts[a.id].name} onClick=${pick(a.id)} onKeyDown=${key(a.id)}>
              <path d=${arcPath(cx, cy, r0, r1, a.a0, a.a1)} />
              <text x=${m[0]} y=${m[1] + 5} textAnchor="middle">${t.parts[a.id].name}</text>
            </g>`;
          })}
          <g className=${'agx-arc agx-arc-llm' + (part === 'llm' ? ' on' : '')} role="button" tabIndex="0" aria-pressed=${part === 'llm'} aria-label="LLM" onClick=${pick('llm')} onKeyDown=${key('llm')}>
            <circle cx=${cx} cy=${cy} r="74" />
            <text x=${cx} y=${cy + 7} textAnchor="middle">LLM</text>
          </g>
        </svg>
        <div className="agx-anatomy-tabs" role="tablist">
          ${['llm', 'context', 'tools', 'protocols'].map(function (id) {
            return h`<button key=${id} type="button" role="tab" aria-selected=${part === id} className=${'agx-tab agx-tab-' + id + (part === id ? ' on' : '')} onClick=${pick(id)}>${t.parts[id].name}</button>`;
          })}
        </div>
      </div>
      <div className=${'agx-anatomy-card agx-card-' + part} role="tabpanel" aria-live="polite">
        <h3>${sel.title}</h3>
        <p>${sel.body}</p>
        ${sel.example ? h`<div className="agx-example"><span className="agx-example-title">${sel.exampleTitle}</span><ul>${sel.example.map(function (e, i) { return h`<li key=${i}>${e}</li>`; })}</ul></div>` : null}
      </div>
    </div>`;
  }
  function HarnessSection(props) {
    var t = props.t;
    return h`<${Section} tone="white" id="harness">
      <${Head} kicker=${t.kicker} title=${t.title} />
      <div className="agx-prose"><${Paras} items=${t.paras} />
        <ol className="agx-three">${t.three.map(function (x, i) { return h`<${Raw} tag="li" key=${i} html=${x} />`; })}</ol>
        <p>${t.after}</p>
      </div>
      <${Anatomy} t=${t} />
    </${Section}>`;
  }

  /* ---------- 3 · MCP ---------- */
  function Switch(props) {
    return h`<button type="button" role="switch" aria-checked=${props.on} className="agx-switch" onClick=${props.onToggle} aria-label=${props.label}><span className="agx-knob" /></button>`;
  }
  function PlugBoard(props) {
    var t = props.t, lang = props.lang;
    var st = useState({ bio: true, gget: false, biomcp: false }), on = st[0], setOn = st[1];
    var toggle = function (id) { return function () { var next = {}; Object.keys(on).forEach(function (k) { next[k] = on[k]; }); next[id] = !on[id]; setOn(next); }; };
    var limit = S.contextLimit;
    var segs = [{ id: 'instr', label: t.budget.instructions, tokens: S.instructionsTokens, cls: 'ctx' }];
    S.plugs.forEach(function (p) { if (on[p.id]) segs.push({ id: p.id, label: p.name, tokens: p.tokens, cls: 'tools' }); });
    var used = segs.reduce(function (a, s) { return a + s.tokens; }, 0), left = limit - used;
    return h`<div className="agx-panel agx-mcp">
      <div className="agx-plugs">${S.plugs.map(function (p) {
        var pins = []; for (var i = 0; i < p.tools; i++) pins.push(i);
        return h`<div key=${p.id} className=${'agx-plug' + (on[p.id] ? ' on' : '')}>
          <div className="agx-plug-head">
            <div><strong>${p.name}</strong><span className="agx-tag">${p.ours ? t.plugLabels.ours : t.plugLabels.theirs}</span></div>
            <${Switch} on=${on[p.id]} onToggle=${toggle(p.id)} label=${p.name} />
          </div>
          <div className="agx-pins" aria-hidden="true">${pins.map(function (i) { return h`<i key=${i} />`; })}</div>
          <p className="agx-plug-desc">${t.plugDesc[p.id]}</p>
          <p className="agx-plug-nums"><span>${p.tools} ${t.plugLabels.tools}</span><span>≈ ${num(p.tokens, lang)} ${t.plugLabels.tokens}</span></p>
          <p className="agx-plug-state">${on[p.id] ? t.plugLabels.on : t.plugLabels.off}</p>
        </div>`;
      })}</div>
      <div className="agx-budget">
        <h3>${t.budget.title}</h3>
        <div className="agx-bar" role="img" aria-label=${num(used, lang) + ' ' + t.budget.of + ' ' + num(limit, lang) + ' ' + t.budget.used}>
          ${segs.map(function (s) {
            var pct = s.tokens / limit * 100;
            return h`<div key=${s.id} className=${'agx-seg agx-seg-' + s.cls} style=${{ width: pct + '%' }} title=${s.label + ' · ' + num(s.tokens, lang)}>${pct > 11 ? h`<span>${s.label}</span>` : null}</div>`;
          })}
          <div className="agx-seg-free" title=${t.budget.free + ' · ' + num(left, lang)} />
        </div>
        <p className="agx-budget-sum"><strong>${num(used, lang)}</strong> ${t.budget.of} ${num(limit, lang)} ${t.budget.used} · <strong>${num(left, lang)}</strong> ${t.budget.left}</p>
        <ul className="agx-legend">
          ${segs.map(function (s) { return h`<li key=${s.id}><i className=${'agx-sw agx-sw-' + s.cls} />${s.label} · ${num(s.tokens, lang)}</li>`; })}
          <li><i className="agx-sw agx-sw-free" />${t.budget.free} · ${num(left, lang)}</li>
        </ul>
      </div>
    </div>`;
  }
  function McpSection(props) {
    var t = props.t;
    return h`<${Section} tone="light" id="mcp">
      <${Head} kicker=${t.kicker} title=${t.title} />
      <div className="agx-prose"><${Paras} items=${t.paras} /></div>
      <${PlugBoard} t=${t} lang=${props.lang} />
      <p className="agx-caption agx-prose">${t.caption}</p>
    </${Section}>`;
  }

  /* ---------- 4 · the assembly (isometric scene) ---------- */
  function Iso(ox, oy) { this.ox = ox; this.oy = oy; }
  Iso.prototype.p = function (x, y, z) { return [this.ox + (x - y) * 0.866, this.oy + (x + y) * 0.5 - (z || 0)]; };
  Iso.prototype.s = function (x, y, z) { var p = this.p(x, y, z); return p[0].toFixed(1) + ',' + p[1].toFixed(1); };
  function Box(props) {
    var I = props.I, x = +props.x, y = +props.y, z = +(props.z || 0), w = +props.w, d = +props.d, hh = +props.h, c = props.color;
    var top = 'M' + I.s(x, y, z + hh) + ' L' + I.s(x + w, y, z + hh) + ' L' + I.s(x + w, y + d, z + hh) + ' L' + I.s(x, y + d, z + hh) + ' Z';
    var left = 'M' + I.s(x, y + d, z) + ' L' + I.s(x + w, y + d, z) + ' L' + I.s(x + w, y + d, z + hh) + ' L' + I.s(x, y + d, z + hh) + ' Z';
    var right = 'M' + I.s(x + w, y, z) + ' L' + I.s(x + w, y + d, z) + ' L' + I.s(x + w, y + d, z + hh) + ' L' + I.s(x + w, y, z + hh) + ' Z';
    return h`<g className=${props.className} opacity=${props.opacity}>
      <path d=${left} fill=${c} fillOpacity=".62" />
      <path d=${right} fill=${c} fillOpacity=".42" />
      <path d=${top} fill=${c} fillOpacity=".95" stroke=${props.stroke || 'none'} strokeWidth="1" />
    </g>`;
  }
  function Label(props) {
    return h`<text x=${props.x} y=${props.y} className=${'agx-iso-label ' + (props.className || '')} textAnchor=${props.anchor || 'start'}>${props.text}</text>`;
  }
  function Note(props) {
    return h`<foreignObject x=${props.x} y=${props.y} width=${props.w} height=${props.h || 64}>
      <div xmlns="http://www.w3.org/1999/xhtml" className=${'agx-iso-note ' + (props.className || '')}>${props.text}</div>
    </foreignObject>`;
  }
  function Flow(props) {
    var dots = REDUCE ? [] : [0, 0.8, 1.6];
    return h`<g className=${'agx-flow ' + (props.className || '')}>
      <path d=${props.d} fill="none" markerEnd="url(#agx-iso-arr)" />
      ${dots.map(function (b, i) {
        return h`<circle key=${i} r="3.2"><animateMotion dur=${props.dur || '2.4s'} begin=${b + 's'} repeatCount="indefinite" path=${props.d} /></circle>`;
      })}
    </g>`;
  }
  function IsoScene(props) {
    var t = props.t;
    // three isometric origins: the old PC, the workplace machine, the browser
    var I1 = new Iso(250, 215), I2 = new Iso(625, 255), I3 = new Iso(470, 440);
    var scale = 150 / S.model.disk; // px of height per GB, shared by the model block and the RAM
    var hModel = S.model.disk * scale, hRam = S.model.ram * scale;
    // anchors of the flows
    var cpuTop = I1.p(128, 132, 16), modelSide = I1.p(100, 70, 16 + hModel * 0.45), ramTop = I1.p(180, 60, 6 + hRam);
    var apiFrom = I1.p(230, 60, 40), apiTo = I2.p(0, 50, 48);
    var lfLeft = I2.p(0, 62, 46), mcpLeft = I2.p(0, 60, 19);
    var browser = I3.p(45, 4, 36), lfFrontLeft = I2.p(25, 92, 44);
    var experts = 'M' + modelSide.join(',') + ' Q' + (modelSide[0] + 14) + ',' + (modelSide[1] + 85) + ' ' + cpuTop.join(',');
    var dense = 'M' + ramTop.join(',') + ' L' + (cpuTop[0] + 14) + ',' + (cpuTop[1] - 4);
    var api = 'M' + apiFrom.join(',') + ' C' + (apiFrom[0] + 90) + ',' + (apiFrom[1] - 60) + ' ' + (apiTo[0] - 90) + ',' + (apiTo[1] - 60) + ' ' + apiTo.join(',');
    var tools = 'M' + (lfLeft[0] - 2) + ',' + lfLeft[1] + ' C' + (lfLeft[0] - 30) + ',' + (lfLeft[1] + 8) + ' ' + (mcpLeft[0] - 30) + ',' + (mcpLeft[1] - 6) + ' ' + (mcpLeft[0] - 2) + ',' + mcpLeft[1];
    var ask = 'M' + browser.join(',') + ' C' + (browser[0] + 10) + ',' + (browser[1] - 70) + ' ' + (lfFrontLeft[0] - 30) + ',' + (lfFrontLeft[1] + 20) + ' ' + (lfFrontLeft[0] - 3) + ',' + lfFrontLeft[1];
    var step = function (x, y, n) { return h`<g className="agx-iso-step"><circle cx=${x} cy=${y} r="13" /><text x=${x} y=${y + 5} textAnchor="middle">${n}</text></g>`; };
    var modelTop = I1.p(60, 40, 16 + hModel), modelRight = I1.p(100, 40, 16 + hModel * 0.42), ramRight = I1.p(220, 30, 6 + hRam);
    var cpuFront = I1.p(148, 152, 16), diskLeft = I1.p(20, 100, 16), gpuLeft = I1.p(25, 140, 48);
    var right = function (z) { return I2.p(125, 32, z); };
    return h`<svg className="agx-iso" viewBox="0 0 960 540" role="img" aria-label=${t.brainTitle + '. ' + t.workTitle}>
      <defs>
        <marker id="agx-iso-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#DCE6FF" /></marker>
      </defs>
      <!-- the old PC: chassis, disk with the model block, RAM at the same scale, CPU, unused GPU -->
      <${Box} I=${I1} x="0" y="0" z="0" w="235" d="175" h="6" color="#223158" stroke="#4CC3F7" />
      <${Box} I=${I1} x="20" y="40" z="6" w="80" d="60" h="10" color="#3A4B78" />
      <${Box} I=${I1} x="20" y="40" z="16" w="80" d="60" h=${hModel} color="#4CC3F7" className="agx-iso-model" />
      <${Box} I=${I1} x="140" y="30" z="6" w="80" d="60" h=${hRam} color="#C7D2FE" />
      <${Box} I=${I1} x="108" y="112" z="6" w="40" d="40" h="10" color="#7C8DB5" />
      <${Box} I=${I1} x="25" y="120" z="6" w="85" d="20" h="42" color="#3A4668" opacity=".55" />
      ${step(140, 322, 1)}
      ${step(modelTop[0], modelTop[1] - 16, 2)}
      <${Label} x="60" y="462" text=${t.brainTitle} className="title" />
      <${Label} x=${diskLeft[0] - 4} y=${diskLeft[1] + 26} text=${t.disk} anchor="end" />
      <${Label} x=${modelRight[0] + 8} y=${modelRight[1]} text=${t.model} className="strong" />
      <${Label} x=${ramRight[0] + 8} y=${ramRight[1] - 2} text=${t.ram} className="strong" />
      <${Note} x=${ramRight[0] + 8} y=${ramRight[1] + 4} w="150" h="54" text=${t.ramNote} className="muted" />
      <${Label} x=${cpuFront[0] + 6} y=${cpuFront[1] + 17} text=${t.cpu} />
      <${Label} x=${cpuFront[0] + 6} y=${cpuFront[1] + 33} text=${t.colibri} className="colibri" />
      <${Label} x=${gpuLeft[0] - 2} y=${gpuLeft[1] + 14} text=${t.gpu} className="muted" anchor="end" />
      <!-- flows inside the PC: experts from the disk, the dense part from RAM -->
      <${Flow} d=${experts} className="experts" dur="2.2s" />
      <${Note} x=${modelRight[0] + 6} y=${modelRight[1] + 10} w="170" h="64" text=${t.flowExperts} className="experts" />
      <${Flow} d=${dense} className="dense" dur="3s" />
      <${Note} x="335" y="392" w="120" h="36" text=${t.flowDense} className="dense" />
      <!-- the API between the machines -->
      <${Flow} d=${api} className="api" dur="3.6s" />
      <${Note} x="400" y="112" w="220" h="52" text=${t.api} className="api" />
      <!-- the workplace: three stacked services -->
      <${Box} I=${I2} x="0" y="0" z="0" w="150" d="125" h="6" color="#223158" stroke="#A78BFA" />
      <${Box} I=${I2} x="25" y="32" z="6" w="100" d="60" h="26" color="#3FD6A0" />
      <${Box} I=${I2} x="25" y="32" z="33" w="100" d="60" h="26" color="#A78BFA" />
      <${Box} I=${I2} x="25" y="32" z="60" w="100" d="60" h="26" color="#F27FC0" />
      ${step(right(46)[0] + 4, right(46)[1] - 1, 3)}
      <${Label} x="600" y="478" text=${t.workTitle} className="title" />
      <${Label} x=${right(19)[0] + 10} y=${right(19)[1] + 4} text=${t.mcps} />
      <${Label} x=${right(46)[0] + 24} y=${right(46)[1] + 4} text=${t.langflow} className="strong" />
      <${Label} x=${right(73)[0] + 10} y=${right(73)[1] + 4} text=${t.monitor} />
      <${Flow} d=${tools} className="tools" dur="2s" />
      <${Note} x=${right(19)[0] + 10} y=${right(19)[1] + 12} w="170" h="36" text=${t.flowTools} className="tools" />
      <!-- the browser, between the two machines -->
      <${Box} I=${I3} x="0" y="0" z="0" w="90" d="58" h="4" color="#55658F" />
      <${Box} I=${I3} x="0" y="0" z="4" w="90" d="4" h="52" color="#8FA3CF" />
      <${Label} x=${I3.p(90, 58, 4)[0] - 70} y=${I3.p(90, 58, 4)[1] + 18} text=${t.browser} className="strong" />
      <${Flow} d=${ask} className="ask" dur="3s" />
      <${Note} x="575" y="398" w="120" h="54" text=${t.flowBrowser} className="ask" />
    </svg>`;
  }
  function AssemblySection(props) {
    var t = props.t;
    return h`<${Section} tone="white" id="assembly">
      <${Head} kicker=${t.kicker} title=${t.title} />
      <div className="agx-prose"><${Paras} items=${t.paras} /></div>
      <div className="agx-fig agx-fig-scroll"><${IsoScene} t=${t.scene} /></div>
      <ol className="agx-steps">${t.scene.steps.map(function (s, i) { return h`<li key=${i}><span>${i + 1}</span>${s}</li>`; })}</ol>
    </${Section}>`;
  }

  /* ---------- 5 · measured cost ---------- */
  function CostSection(props) {
    var t = props.t;
    return h`<${Section} tone="light" id="cost">
      <${Head} kicker=${t.kicker} title=${t.title} />
      <div className="agx-prose"><p>${t.intro}</p></div>
      <div className="agx-tiles">${t.tiles.map(function (k, i) { return h`<div key=${i} className="agx-tile"><strong>${k.value}</strong><span>${k.label}</span></div>`; })}</div>
      <div className="agx-prose"><h3 className="agx-h3">${t.weakTitle}</h3>
        <ol className="agx-weak">${t.weak.map(function (w, i) { return h`<${Raw} tag="li" key=${i} html=${w} />`; })}</ol>
      </div>
    </${Section}>`;
  }

  /* ---------- 6 · recipe, glossary, outro ---------- */
  function RecipeSection(props) {
    var t = props.t;
    return h`<${Section} tone="white" id="recipe">
      <${Head} kicker=${t.kicker} title=${t.title} />
      <ol className="agx-recipe">${t.steps.map(function (s, i) { return h`<li key=${i}><span className="n">${i + 1}</span><strong>${s.t}</strong><p>${s.d}</p></li>`; })}</ol>
    </${Section}>`;
  }
  function GlossarySection(props) {
    var t = props.t;
    return h`<${Section} tone="light" id="glossary">
      <div className="agx-prose"><h2 className="agx-h2">${t.title}</h2><p>${t.intro}</p></div>
      <dl className="agx-gloss">${t.terms.map(function (x, i) { return h`<div key=${i}><dt>${x[0]}</dt><dd>${x[1]}</dd></div>`; })}</dl>
    </${Section}>`;
  }
  function Outro(props) {
    var t = props.t;
    return h`<${Section} tone="white" id="outro">
      <div className="ax-callout agx-outro">
        <h3>${t.title}</h3>
        <p>${t.body}</p>
        <div className="agx-outro-links">
          <a className="ax-btn" href="../index.html#contact">${t.cta}</a>
          <a className="agx-link" href="https://www.linkedin.com/in/alejandro-atienza-vicedo-963242190/" target="_blank" rel="noopener">${t.linkedin}</a>
        </div>
      </div>
    </${Section}>`;
  }

  /* ---------- the page ---------- */
  function App() {
    var ls = useLang(), lang = ls[0], setLang = ls[1];
    var T = DATA[lang];
    return h`<div className="agx">
      <${Hero} t=${T.hero} lang=${lang} setLang=${setLang} />
      <div className="agx-body">
        <${Origin} t=${T.origin} />
        <${AgentSection} t=${T.agent} lang=${lang} />
        <${HarnessSection} t=${T.harness} />
        <${McpSection} t=${T.mcp} lang=${lang} />
        <${AssemblySection} t=${T.assembly} />
        <${CostSection} t=${T.cost} />
        <${RecipeSection} t=${T.recipe} />
        <${GlossarySection} t=${T.glossary} />
        <${Outro} t=${T.outro} />
      </div>
    </div>`;
  }
  RD.createRoot(document.getElementById('agx-root')).render(h`<${App} />`);
})();
