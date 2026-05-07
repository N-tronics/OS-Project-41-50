import React, { useState } from "react";
import ReactFlow, { Handle, Position } from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Global CSS ──────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&family=Oxanium:wght@400;600;800&display=swap');

  :root {
    --bg:      #03060f;
    --bg2:     #060d1c;
    --bg3:     #0a1528;
    --panel:   #060c1a;
    --border:  #0d2044;
    --border2: #1a3a6e;
    --blue:    #1d6fff;
    --cyan:    #00c8ff;
    --text:    #a8c8f0;
    --text2:   #4a6a90;
    --red:     #ff3b5c;
    --green:   #00ffb2;
    --yellow:  #ffcc00;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pm-root {
    font-family: 'JetBrains Mono', monospace;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    background-image:
      radial-gradient(ellipse 90% 40% at 50% -5%, rgba(29,111,255,0.13) 0%, transparent 70%),
      linear-gradient(rgba(13,32,68,0.35) 1px, transparent 1px),
      linear-gradient(90deg, rgba(13,32,68,0.35) 1px, transparent 1px);
    background-size: 100% 100%, 44px 44px, 44px 44px;
    background-position: 0 0, -1px -1px, -1px -1px;
  }

  /* ── Header ── */
  .pm-badge {
    display: inline-block;
    border: 1px solid var(--border2);
    border-radius: 2px;
    padding: 2px 14px;
    font-size: 10px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--cyan);
    background: rgba(0,200,255,0.04);
    margin-bottom: 14px;
  }
  .pm-title {
    font-family: 'Oxanium', sans-serif;
    font-size: clamp(24px, 4vw, 42px);
    font-weight: 800;
    background: linear-gradient(100deg, #ffffff 0%, #00c8ff 55%, #1d6fff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .pm-subtitle {
    font-size: 12px;
    color: var(--text2);
    letter-spacing: 2px;
    margin-top: 6px;
  }

  /* ── Panel ── */
  .pm-panel {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }
  .pm-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(29,111,255,0.03) 0%, transparent 55%);
    pointer-events: none;
  }
  .pm-panel-hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 16px;
    border-bottom: 1px solid var(--border);
    background: rgba(3,6,15,0.7);
  }
  .pm-panel-label {
    font-family: 'Oxanium', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--cyan);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pm-panel-label::before {
    content: '';
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 8px var(--cyan);
    animation: blink 2s ease-in-out infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.25} }

  /* ── Buttons ── */
  .pm-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 7px 18px;
    border-radius: 2px;
    border: 1px solid var(--border2);
    background: transparent;
    color: var(--text2);
    cursor: pointer;
    transition: all .2s;
  }
  .pm-btn:hover {
    border-color: var(--blue);
    color: #fff;
    background: rgba(29,111,255,0.1);
    box-shadow: 0 0 18px rgba(29,111,255,0.2);
  }
  .pm-btn-run {
    border-color: var(--cyan);
    color: var(--cyan);
    background: rgba(0,200,255,0.04);
  }
  .pm-btn-run:hover {
    background: rgba(0,200,255,0.14);
    box-shadow: 0 0 22px rgba(0,200,255,0.28);
    color: #fff;
  }

  /* ── Editor ── */
  .pm-editor-body { display: flex; background: var(--bg); }
  .pm-line-nums {
    min-width: 38px;
    padding: 12px 8px;
    text-align: right;
    font-size: 12px;
    line-height: 1.75;
    color: var(--border2);
    background: var(--bg2);
    border-right: 1px solid var(--border);
    user-select: none;
  }
  .pm-ln-active {
    display: block;
    color: var(--yellow);
    background: rgba(255,204,0,0.07);
  }
  .pm-textarea {
    flex: 1;
    padding: 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    line-height: 1.75;
    background: transparent;
    color: #c8e0ff;
    border: none;
    outline: none;
    resize: none;
    caret-color: var(--cyan);
  }
  .pm-textarea::placeholder { color: var(--border2); }

  /* ── Status bar ── */
  .pm-status {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 16px;
    border-top: 1px solid var(--border);
    background: var(--bg2);
    font-size: 11px;
    min-height: 34px;
  }
  .pm-status-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 7px var(--cyan);
    flex-shrink: 0;
  }
  .pm-status-lbl { color: var(--text2); flex-shrink: 0; }
  .pm-status-txt { color: var(--cyan); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pm-status-txt.done { color: var(--green); }

  /* ── Ref panel ── */
  .pm-ref {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 14px 16px;
    font-size: 12px;
  }
  .pm-ref-hdr {
    font-family: 'Oxanium', sans-serif;
    font-size: 10px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--text2);
    margin-bottom: 10px;
  }
  .pm-ref-row { display: flex; align-items: flex-start; gap: 9px; margin-bottom: 7px; }
  .pm-ref-dot { width: 5px; height: 5px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
  .pm-ref-tag {
    font-size: 11px;
    padding: 1px 8px;
    border-radius: 2px;
    background: var(--bg3);
    border: 1px solid var(--border2);
    color: var(--cyan);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .pm-ref-desc { color: var(--text2); line-height: 1.5; }
  .pm-ref-hl { color: var(--green); }
  .pm-tip {
    margin-top: 10px;
    padding: 7px 11px;
    border-left: 2px solid var(--blue);
    background: rgba(29,111,255,0.05);
    color: var(--text2);
    font-size: 10px;
    line-height: 1.55;
  }
  .pm-tip strong { color: var(--cyan); }

  /* ── Samples ── */
  .pm-samples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
    gap: 9px;
    max-height: 370px;
    overflow-y: auto;
  }
  .pm-sample {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 10px 12px;
    cursor: pointer;
    transition: all .15s;
  }
  .pm-sample:hover {
    border-color: var(--cyan);
    background: rgba(0,200,255,0.05);
    box-shadow: 0 0 14px rgba(0,200,255,0.1);
  }
  .pm-sample-name {
    font-family: 'Oxanium', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: var(--cyan);
    margin-bottom: 3px;
  }
  .pm-sample-desc { font-size: 10px; color: var(--text2); margin-bottom: 6px; line-height: 1.4; }
  .pm-sample-code {
    font-size: 10px;
    color: #5a90c8;
    background: var(--bg);
    padding: 5px 8px;
    border-radius: 2px;
    border: 1px solid var(--border);
  }

  /* ── Theory ── */
  .pm-theory {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 24px 28px;
    margin-bottom: 20px;
  }
  .pm-theory-h2 {
    font-family: 'Oxanium', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 18px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }
  .pm-theory-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
  }
  .pm-theory-block {
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 16px 18px;
    background: var(--bg2);
  }
  .pm-theory-h3 {
    font-family: 'Oxanium', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
  }
  .pm-theory-h4 { font-size: 12px; font-weight: 700; color: #c8e0ff; margin: 8px 0 3px; }
  .pm-theory-p { font-size: 11px; color: var(--text2); line-height: 1.65; padding-left: 10px; }

  /* ── Viz area ── */
  .pm-viz {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    background-image:
      radial-gradient(circle at 25% 25%, rgba(29,111,255,0.07) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(0,200,255,0.05) 0%, transparent 50%),
      linear-gradient(rgba(10,21,40,0.45) 1px, transparent 1px),
      linear-gradient(90deg, rgba(10,21,40,0.45) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 30px 30px, 30px 30px;
    position: relative;
  }

  /* ── Process nodes ── */
  .pm-node {
    width: 96px;
    height: 96px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    border: 1px solid var(--border2);
    background: linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%);
    position: relative;
    transition: border-color .3s, box-shadow .3s, background .3s;
  }
  .pm-node.active {
    border-color: var(--cyan);
    background: linear-gradient(135deg, rgba(0,200,255,0.08) 0%, var(--bg2) 100%);
    box-shadow: 0 0 22px rgba(0,200,255,0.22), inset 0 0 20px rgba(0,200,255,0.04);
  }
  .pm-node.exited {
    border-color: rgba(255,59,92,0.25);
    background: rgba(255,59,92,0.03);
    opacity: 0.42;
  }
  .pm-node-name {
    font-family: 'Oxanium', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
  }
  .pm-node-pid { font-size: 10px; color: var(--cyan); margin-top: 3px; }
  .pm-node-ppid { font-size: 9px; color: var(--text2); margin-top: 1px; }
  .pm-node-badge {
    position: absolute;
    top: -7px; right: -7px;
    width: 16px; height: 16px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    font-weight: 700;
  }
  .pm-node-badge.run {
    background: var(--cyan);
    color: #000;
    box-shadow: 0 0 9px var(--cyan);
    animation: pulse 1.4s ease-in-out infinite;
  }
  .pm-node-badge.exit {
    background: var(--red);
    color: #fff;
    box-shadow: 0 0 7px var(--red);
  }
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }

  /* ReactFlow overrides */
  .react-flow__background { background: transparent !important; }
  .react-flow__pane { background: transparent !important; }
  .react-flow__controls {
    background: var(--bg2) !important;
    border: 1px solid var(--border) !important;
    border-radius: 3px !important;
    box-shadow: none !important;
  }
  .react-flow__controls-button {
    background: var(--bg2) !important;
    border-bottom: 1px solid var(--border) !important;
    fill: var(--text2) !important;
  }
  .react-flow__controls-button:hover { background: var(--bg3) !important; fill: var(--cyan) !important; }
  .react-flow__attribution { display: none !important; }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--blue); }

  /* Home page theme overrides */
  :root {
    --bg: #0a0a0f;
    --bg2: #13131a;
    --bg3: #1a1a24;
    --panel: #13131a;
    --border: #1e1e2e;
    --border2: #2e2e3e;
    --blue: #06b6d4;
    --cyan: #06b6d4;
    --text: #e4e4e7;
    --text2: #71717a;
    --red: #ef4444;
    --green: #22c55e;
    --yellow: #f59e0b;
  }
  .pm-root {
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    background: var(--bg);
    background-image: none;
  }
  .pm-badge {
    border-color: rgba(6,182,212,0.2);
    border-radius: 999px;
    padding: 4px 14px;
    letter-spacing: 1.5px;
    background: rgba(6,182,212,0.1);
  }
  .pm-title {
    font-family: inherit;
    color: #fff;
    background: none;
    -webkit-text-fill-color: currentColor;
    letter-spacing: -0.02em;
  }
  .pm-subtitle { letter-spacing: 0; }
  .pm-panel,
  .pm-theory,
  .pm-viz {
    border-radius: 12px;
  }
  .pm-panel::after {
    background: linear-gradient(135deg, rgba(6,182,212,0.035) 0%, transparent 55%);
  }
  .pm-panel-hdr {
    background: rgba(10,10,15,0.72);
  }
  .pm-panel-label {
    font-family: inherit;
    letter-spacing: 1.5px;
  }
  .pm-panel-label::before,
  .pm-status-dot {
    box-shadow: 0 0 8px rgba(6,182,212,0.55);
  }
  .pm-btn {
    font-family: inherit;
    border-color: var(--border);
    border-radius: 8px;
    background: var(--panel);
    color: var(--text);
    letter-spacing: 0.5px;
  }
  .pm-btn:hover {
    background: var(--bg3);
    border-color: var(--border2);
    box-shadow: 0 0 24px rgba(6,182,212,0.08);
  }
  .pm-btn-run {
    background: var(--cyan);
    border-color: var(--cyan);
    color: var(--bg);
  }
  .pm-btn-run:hover {
    background: rgba(6,182,212,0.9);
    color: var(--bg);
    box-shadow: 0 0 22px rgba(6,182,212,0.18);
  }
  .pm-textarea {
    color: var(--text);
    font-family: 'JetBrains Mono', Consolas, monospace;
  }
  .pm-ln-active {
    background: rgba(245,158,11,0.08);
  }
  .pm-ref {
    display: none;
  }
  .pm-sample,
  .pm-theory-block,
  .pm-sample-code,
  .react-flow__controls {
    border-radius: 8px !important;
  }
  .pm-sample:hover {
    background: rgba(6,182,212,0.06);
    box-shadow: 0 0 14px rgba(6,182,212,0.08);
  }
  .pm-viz {
    background-image:
      radial-gradient(circle at 25% 25%, rgba(6,182,212,0.06) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(20,184,166,0.05) 0%, transparent 50%),
      linear-gradient(rgba(30,30,46,0.55) 1px, transparent 1px),
      linear-gradient(90deg, rgba(30,30,46,0.55) 1px, transparent 1px);
  }
  .pm-node {
    border-radius: 8px;
  }
  .pm-node.active {
    background: linear-gradient(135deg, rgba(6,182,212,0.1) 0%, var(--bg2) 100%);
    box-shadow: 0 0 22px rgba(6,182,212,0.18), inset 0 0 20px rgba(6,182,212,0.035);
  }
  .pm-node-badge.run {
    box-shadow: 0 0 9px rgba(6,182,212,0.65);
  }
  .pm-node-badge.exit {
    box-shadow: 0 0 7px rgba(239,68,68,0.65);
  }
`;

/* ─── Process Node ────────────────────────────────────────────────────────── */
const ProcessNode = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.3 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, type: "spring", stiffness: 220 }}
    className={`pm-node ${data.isActive ? "active" : ""} ${data.isExited ? "exited" : ""}`}
  >
    <div className="pm-node-name">{data.name}</div>
    <div className="pm-node-pid">PID {data.pid}</div>
    {data.ppid && <div className="pm-node-ppid">↑ {data.ppid}</div>}
    {data.isActive && !data.isExited && <div className="pm-node-badge run">▶</div>}
    {data.isExited && <div className="pm-node-badge exit">✕</div>}
    <Handle type="target" position={Position.Top}   style={{ background: "#1a3a6e", border: "none", width: 5, height: 5 }} />
    <Handle type="source" position={Position.Bottom} style={{ background: "#1a3a6e", border: "none", width: 5, height: 5 }} />
  </motion.div>
);

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const calcLayout = (tree) => {
  const childMap = {};
  tree.forEach((p) => {
    if (p.ppid) { childMap[p.ppid] = childMap[p.ppid] || []; childMap[p.ppid].push(p.id); }
  });
  const pos = { "1": { x: 400, y: 50 } };
  const go = (pid) => {
    const kids = childMap[pid] || [];
    if (!kids.length) return;
    const W = (kids.length - 1) * 148;
    const x0 = pos[pid].x - W / 2;
    kids.forEach((kid, i) => { pos[kid] = { x: x0 + i * 148, y: pos[pid].y + 160 }; go(kid); });
  };
  go("1"); return pos;
};

/* ─── Simulation ──────────────────────────────────────────────────────────── */
const simulate = async (code, setNodes, setEdges, setActiveLine) => {
  if (!code.trim()) {
    setNodes([]); setEdges([]);
    setActiveLine({ text: "ready — enter code above", lineNumber: null });
    return;
  }
  const lines = code.split("\n");
  const tree = [{ id: "1", pid: "1", ppid: null, name: "Root" }];
  let pid = 1;
  let alive = new Set(["1"]);
  let dead = new Set();

  setNodes([{ id: "1", type: "pn", position: { x: 400, y: 50 }, data: { pid: "1", ppid: null, name: "Root", isActive: true, isExited: false } }]);
  setEdges([]);

  const syncNodes = () =>
    setNodes((prev) => prev.map((n) => ({ ...n, data: { ...n.data, isActive: alive.has(n.id), isExited: dead.has(n.id) } })));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    setActiveLine({ text: line, lineNumber: i + 1 });
    syncNodes();
    await delay(850);

    if (line.startsWith("fork()")) {
      const spawned = [];
      for (const p of [...alive]) {
        pid++;
        const id = String(pid);
        tree.push({ id, pid: id, ppid: p, name: `P${id}` });
        spawned.push({ parentPid: p, newPid: id });
      }
      const pos = calcLayout(tree);
      setActiveLine({ text: `fork() → ${spawned.length} child(ren). parents + children all continue.`, lineNumber: i + 1 });
      await delay(300);
      setNodes((prev) => [
        ...prev.map((n) => ({ ...n, position: pos[n.id] || n.position, data: { ...n.data, isActive: alive.has(n.id), isExited: dead.has(n.id) } })),
        ...spawned.map(({ parentPid, newPid }) => ({
          id: newPid, type: "pn", position: pos[newPid] || { x: 400, y: 300 },
          data: { pid: newPid, ppid: parentPid, name: `P${newPid}`, isActive: true, isExited: false },
        })),
      ]);
      setEdges((prev) => [
        ...prev,
        ...spawned.map(({ parentPid, newPid }) => ({
          id: `e${parentPid}-${newPid}`, source: parentPid, target: newPid,
          style: { stroke: "#1d6fff", strokeWidth: 1.5 }, animated: true,
        })),
      ]);
      spawned.forEach(({ newPid }) => alive.add(newPid));

    } else if (line.startsWith("exit()")) {
      const exiting = [...alive];
      setActiveLine({ text: `exit() → [${exiting.join(", ")}] terminated`, lineNumber: i + 1 });
      exiting.forEach((p) => { alive.delete(p); dead.add(p); });
      setNodes((prev) => prev.map((n) => ({
        ...n, data: { ...n.data, isActive: false, isExited: dead.has(n.id) },
        style: dead.has(n.id) ? { opacity: 0.38 } : {},
      })));
      await delay(550);

    } else if (line.startsWith("wait()")) {
      setActiveLine({ text: `wait() → [${[...alive].join(", ")}] awaiting children`, lineNumber: i + 1 });
      await delay(850);
    }
  }
  setActiveLine({ text: "✓ execution complete", lineNumber: null });
};

/* ─── Samples ─────────────────────────────────────────────────────────────── */
const SAMPLES = [
  { name: "Single fork()",     desc: "1 fork → 2 processes",        code: "fork()\nwait()\nexit()" },
  { name: "2 forks → 4",       desc: "Each fork doubles count",      code: "fork()\nfork()\nexit()" },
  { name: "3 forks → 8",       desc: "2³ = 8, classic interview Q",  code: "fork()\nfork()\nfork()\nexit()" },
  { name: "Fork + wait",       desc: "Parent waits before exiting",  code: "fork()\nwait()\nexit()" },
  { name: "Two-level tree",    desc: "Root → children → grandkids",  code: "fork()\nfork()\nwait()\nexit()" },
  { name: "4 forks → 16",      desc: "2⁴ = 16 active processes",     code: "fork()\nfork()\nfork()\nfork()\nexit()" },
  { name: "Fork→wait→fork",    desc: "2 procs wait, then fork again",code: "fork()\nwait()\nfork()\nexit()" },
  { name: "Sync chain",        desc: "Fork, wait, fork at each step",code: "fork()\nwait()\nfork()\nwait()\nfork()\nexit()" },
];

const THEORY = [
  { label: "fork()", color: "#00c8ff", items: [
    { name: "fork()", body: "Creates an exact copy of the calling process. After fork(), BOTH the parent and child continue from the next line. Parent receives child PID; child receives 0. N fork() calls with no conditionals produce 2ᴺ processes." },
    { name: "exec()", body: "Replaces current process image with a new program. Typically used after fork(). The exec() family (execl, execv, execve…) overlays the caller with the specified binary." },
  ]},
  { label: "exit()", color: "#00ffb2", items: [
    { name: "exit()", body: "Terminates the calling process. Releases resources, closes file descriptors, notifies parent. Process enters zombie state until parent calls wait()." },
    { name: "abort()", body: "Abnormal termination via SIGABRT. Unlike exit(), performs no cleanup and typically produces a core dump for post-mortem analysis." },
  ]},
  { label: "wait()", color: "#a78bfa", items: [
    { name: "wait()", body: "Suspends calling process until any child terminates. Returns child PID and exit status. Prevents zombie processes from consuming resources." },
    { name: "waitpid()", body: "Flexible variant: wait for a specific child, optionally non-blocking. Supports WNOHANG and process group options." },
  ]},
  { label: "getpid()", color: "#ffcc00", items: [
    { name: "getpid() / getppid()", body: "Return PID of calling process and its parent respectively. Useful for identification, logging, and conditional branching after fork()." },
    { name: "kill() / nice()", body: "kill() sends a signal (SIGTERM, SIGKILL, etc.) to a process. nice() adjusts scheduling priority to control relative CPU allocation." },
  ]},
];

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function SystemCalls() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [code, setCode] = useState("");
  const [activeLine, setActiveLine] = useState({ text: "ready", lineNumber: null });
  const [showTheory, setShowTheory] = useState(false);
  const [showSamples, setShowSamples] = useState(false);

  const nodeTypes = { pn: ProcessNode };

  return (
    <div className="pm-root">
      <style>{GLOBAL_CSS}</style>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 20px" }}>

        {/* ── Header ── */}
        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="pm-badge">OS Kernel Simulator</div>
          <h1 className="pm-title">Process Management</h1>
          <p className="pm-subtitle">fork() · exit() · wait() — visualized in real time</p>
        </header>

        {/* ── Action bar ── */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 18, flexWrap: "wrap" }}>
          <button className="pm-btn" onClick={() => setShowTheory((v) => !v)}>
            {showTheory ? "[ hide theory ]" : "[ theory ]"}
          </button>
          <button className="pm-btn" onClick={() => setShowSamples((v) => !v)}>
            {showSamples ? "[ hide samples ]" : "[ samples ]"}
          </button>
          <button className="pm-btn pm-btn-run" onClick={() => simulate(code, setNodes, setEdges, setActiveLine)}>
            ▶&nbsp;&nbsp;run simulation
          </button>
        </div>

        {/* ── Theory ── */}
        <AnimatePresence>
          {showTheory && (
            <motion.div key="th" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }} style={{ overflow: "hidden" }}>
              <div className="pm-theory">
                <div className="pm-theory-h2">Process Control System Calls</div>
                <div className="pm-theory-grid">
                  {THEORY.map(({ label, color, items }) => (
                    <div key={label} className="pm-theory-block">
                      <div className="pm-theory-h3" style={{ color }}>{label}</div>
                      {items.map(({ name, body }) => (
                        <div key={name}>
                          <div className="pm-theory-h4">{name}</div>
                          <p className="pm-theory-p">{body}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Samples ── */}
        <AnimatePresence>
          {showSamples && (
            <motion.div key="sm" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden", marginBottom: 16 }}>
              <div className="pm-panel" style={{ padding: "14px 16px" }}>
                <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--text2)", marginBottom: 12 }}>
                  Sample Programs
                </div>
                <div className="pm-samples-grid">
                  {SAMPLES.map((s, i) => (
                    <div key={i} className="pm-sample" onClick={() => { setCode(s.code); setShowSamples(false); }}>
                      <div className="pm-sample-name">{s.name}</div>
                      <div className="pm-sample-desc">{s.desc}</div>
                      <div className="pm-sample-code">{s.code.split("\n").map((l, j) => <div key={j}>{l}</div>)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Two-column layout ── */}
        <div style={{ display: "flex", gap: 16, height: "calc(100vh - 270px)", minHeight: 560 }}>

          {/* Left column */}
          <div style={{ width: 400, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Editor */}
            <div className="pm-panel" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div className="pm-panel-hdr">
                <span className="pm-panel-label">editor</span>
                <div style={{ display: "flex", gap: 5 }}>
                  {["#ff5f57","#ffbd2e","#27c840"].map((c) => (
                    <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                  ))}
                </div>
              </div>
              <div className="pm-editor-body" style={{ flex: 1, overflow: "hidden" }}>
                <div className="pm-line-nums">
                  {(code || " ").split("\n").map((_, i) => (
                    <span key={i} className={activeLine.lineNumber === i + 1 ? "pm-ln-active" : ""} style={{ display: "block" }}>
                      {i + 1}
                    </span>
                  ))}
                </div>
                <textarea
                  className="pm-textarea"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={"// commands:\n// fork()\n// wait()\n// exit()"}
                  spellCheck={false}
                  style={{ height: "100%" }}
                />
              </div>
              <div className="pm-status">
                <div className="pm-status-dot" />
                <span className="pm-status-lbl">
                  {activeLine.lineNumber != null ? `line ${activeLine.lineNumber} ›` : "status ›"}
                </span>
                <span className={`pm-status-txt ${activeLine.text.includes("complete") ? "done" : ""}`}>
                  {activeLine.text}
                </span>
              </div>
            </div>

            {/* Command reference */}
            <div className="pm-ref">
              <div className="pm-ref-hdr">Command Reference</div>
              {[
                { color: "var(--cyan)",   tag: "fork()", desc: <>Each active process spawns a child. <span className="pm-ref-hl">Both parent + child continue.</span> N → 2N.</> },
                { color: "var(--red)",    tag: "exit()", desc: "All active processes terminate." },
                { color: "var(--yellow)", tag: "wait()", desc: "Active processes pause for children." },
              ].map(({ color, tag, desc }) => (
                <div key={tag} className="pm-ref-row">
                  <div className="pm-ref-dot" style={{ background: color }} />
                  <span className="pm-ref-tag">{tag}</span>
                  <span className="pm-ref-desc">{desc}</span>
                </div>
              ))}
              <div className="pm-tip">
                💡 <strong>fork(); fork(); fork();</strong> &nbsp;=&nbsp; 2³ = 8 processes, because every process that calls fork() stays alive and continues.
              </div>
            </div>
          </div>

          {/* Right: Viz */}
          <div className="pm-viz" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div className="pm-panel-hdr" style={{ background: "rgba(10,10,15,0.72)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <span className="pm-panel-label">process tree</span>
              <span style={{ fontSize: 10, color: "var(--text2)", letterSpacing: 1 }}>
                {nodes.length} node{nodes.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.28 }}
                minZoom={0.1}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
