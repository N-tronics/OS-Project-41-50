import { useState } from 'react'
import Layout from '../components/Layout'

const ALGORITHMS = ['FIFO', 'LRU', 'Optimal', 'MRU', 'LFU']

function runFIFO(refs, fc) {
  const frames = [], steps = []; let faults = 0
  for (const p of refs) {
    if (frames.includes(p)) { steps.push({ page: p, frames: [...frames], fault: false, replaced: null }) }
    else { faults++; let r = null; if (frames.length >= fc) { r = frames.shift() } frames.push(p); steps.push({ page: p, frames: [...frames], fault: true, replaced: r }) }
  }
  return { steps, faults, hits: refs.length - faults }
}

function runLRU(refs, fc) {
  const frames = [], steps = [], recent = []; let faults = 0
  for (const p of refs) {
    if (frames.includes(p)) { recent.splice(recent.indexOf(p), 1); recent.push(p); steps.push({ page: p, frames: [...frames], fault: false, replaced: null }) }
    else { faults++; let r = null; if (frames.length >= fc) { const lru = recent.shift(); r = lru; frames.splice(frames.indexOf(lru), 1) } frames.push(p); recent.push(p); steps.push({ page: p, frames: [...frames], fault: true, replaced: r }) }
  }
  return { steps, faults, hits: refs.length - faults }
}

function runOptimal(refs, fc) {
  const frames = [], steps = []; let faults = 0
  for (let i = 0; i < refs.length; i++) {
    const p = refs[i]
    if (frames.includes(p)) { steps.push({ page: p, frames: [...frames], fault: false, replaced: null }) }
    else { faults++; let r = null
      if (frames.length >= fc) { let far = -1, vi = 0; for (let f = 0; f < frames.length; f++) { const nu = refs.slice(i+1).indexOf(frames[f]); if (nu === -1) { vi = f; break } if (nu > far) { far = nu; vi = f } } r = frames[vi]; frames[vi] = p }
      else { frames.push(p) } steps.push({ page: p, frames: [...frames], fault: true, replaced: r }) }
  }
  return { steps, faults, hits: refs.length - faults }
}

function runMRU(refs, fc) {
  const frames = [], steps = []; let faults = 0, mr = null
  for (const p of refs) {
    if (frames.includes(p)) { mr = p; steps.push({ page: p, frames: [...frames], fault: false, replaced: null }) }
    else { faults++; let r = null; if (frames.length >= fc) { const vi = mr !== null ? frames.indexOf(mr) : frames.length - 1; r = frames[vi]; frames[vi] = p } else { frames.push(p) } mr = p; steps.push({ page: p, frames: [...frames], fault: true, replaced: r }) }
  }
  return { steps, faults, hits: refs.length - faults }
}

function runLFU(refs, fc) {
  const frames = [], steps = [], freq = {}; let faults = 0
  for (const p of refs) { freq[p] = (freq[p] || 0) + 1
    if (frames.includes(p)) { steps.push({ page: p, frames: [...frames], fault: false, replaced: null }) }
    else { faults++; let r = null; if (frames.length >= fc) { let mf = Infinity, vi = 0; for (let f = 0; f < frames.length; f++) { if ((freq[frames[f]]||0) < mf) { mf = freq[frames[f]]||0; vi = f } } r = frames[vi]; frames[vi] = p } else { frames.push(p) } steps.push({ page: p, frames: [...frames], fault: true, replaced: r }) }
  }
  return { steps, faults, hits: refs.length - faults }
}

export default function PageReplacement() {
  const [algo, setAlgo] = useState('FIFO')
  const [refIn, setRefIn] = useState('7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1')
  const [fc, setFc] = useState(3)
  const [result, setResult] = useState(null)

  const simulate = () => {
    const refs = refIn.trim().split(/[\s,]+/).map(Number)
    const fns = { FIFO: runFIFO, LRU: runLRU, Optimal: runOptimal, MRU: runMRU, LFU: runLFU }
    setResult((fns[algo] || runFIFO)(refs, fc))
  }

  return (
    <Layout title="Page Replacement">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Algorithm</label>
              <select value={algo} onChange={e => setAlgo(e.target.value)} className="w-full">
                {ALGORITHMS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Frames</label>
              <input type="number" min={1} max={10} value={fc} onChange={e => setFc(parseInt(e.target.value)||1)} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Reference String</label>
              <textarea rows={3} value={refIn} onChange={e => setRefIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Simulate</button>
          </div>
        </div>
        <div className="lg:col-span-2">
          {result ? (
            <div className="bg-bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-text-primary">Results</h2>
                <div className="flex gap-4 text-xs">
                  <span className="text-danger">Faults: <strong>{result.faults}</strong></span>
                  <span className="text-success">Hits: <strong>{result.hits}</strong></span>
                  <span className="text-text-secondary">Hit Ratio: <strong className="text-text-primary">{((result.hits/(result.faults+result.hits))*100).toFixed(1)}%</strong></span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table>
                  <thead><tr><th>Step</th><th>Page</th>{Array.from({length:fc},(_,i)=><th key={i}>F{i}</th>)}<th>Status</th></tr></thead>
                  <tbody>{result.steps.map((s,i) => (
                    <tr key={i} className={s.fault ? 'bg-danger/5' : 'bg-success/5'}>
                      <td className="text-text-muted">{i+1}</td>
                      <td className="font-mono font-semibold text-accent">{s.page}</td>
                      {Array.from({length:fc},(_,f)=><td key={f} className="font-mono">{s.frames[f]!==undefined?s.frames[f]:'-'}</td>)}
                      <td><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${s.fault?'bg-danger/20 text-danger':'bg-success/20 text-success'}`}>{s.fault?'FAULT':'HIT'}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Configure and click Simulate to see results.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
