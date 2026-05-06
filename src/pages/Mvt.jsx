import { useState } from 'react'
import Layout from '../components/Layout'

export default function Mvt() {
  const [totalMem, setTotalMem] = useState(1000)
  const [osMem, setOsMem] = useState(200)
  const [procIn, setProcIn] = useState('P1:300\nP2:200\nP3:150\nP4:250\nP5:100')
  const [result, setResult] = useState(null)

  const simulate = () => {
    const procs = procIn.trim().split('\n').map(l => { const [name, size] = l.split(':'); return { name: name.trim(), size: parseInt(size.trim()) } })
    const userMem = totalMem - osMem
    let used = 0
    const allocated = []
    const unallocated = []
    const blocks = [{ start: osMem, size: userMem, free: true, process: null }]

    for (const proc of procs) {
      const freeIdx = blocks.findIndex(b => b.free && b.size >= proc.size)
      if (freeIdx !== -1) {
        const block = blocks[freeIdx]
        const remaining = block.size - proc.size
        blocks.splice(freeIdx, 1, { start: block.start, size: proc.size, free: false, process: proc.name })
        if (remaining > 0) blocks.splice(freeIdx + 1, 0, { start: block.start + proc.size, size: remaining, free: true, process: null })
        used += proc.size
        allocated.push({ ...proc, start: block.start })
      } else {
        unallocated.push(proc)
      }
    }
    const extFrag = blocks.filter(b => b.free).reduce((s, b) => s + b.size, 0)
    setResult({ blocks: [...blocks], allocated, unallocated, used, extFrag, totalMem, osMem, userMem })
  }

  return (
    <Layout title="MVT (Variable Tasks)">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Total Memory</label>
                <input type="number" value={totalMem} onChange={e => setTotalMem(parseInt(e.target.value)||1)} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">OS Reserved</label>
                <input type="number" value={osMem} onChange={e => setOsMem(parseInt(e.target.value)||0)} className="w-full" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Processes <span className="text-text-muted">(name:size)</span></label>
              <textarea rows={6} value={procIn} onChange={e => setProcIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Allocate</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-4">Memory Map</h2>
                <div className="rounded-lg overflow-hidden border border-border">
                  {/* OS Block */}
                  <div className="h-10 bg-zinc-700 flex items-center px-3 border-b border-border" style={{ width: `${(result.osMem / result.totalMem) * 100}%`, minWidth: '80px' }}>
                    <span className="text-[10px] text-white font-medium">OS ({result.osMem} KB)</span>
                  </div>
                  {/* Memory Blocks */}
                  {result.blocks.map((b, i) => (
                    <div key={i} className={`h-10 flex items-center px-3 border-b border-border ${b.free ? 'bg-bg-input' : 'bg-accent/20'}`}
                      style={{ width: `${(b.size / result.totalMem) * 100}%`, minWidth: '80px' }}>
                      <span className={`text-[10px] font-medium ${b.free ? 'text-text-muted' : 'text-accent'}`}>
                        {b.free ? `Free (${b.size} KB)` : `${b.process} (${b.size} KB)`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-bg-card border border-border rounded-xl p-4">
                  <div className="text-[10px] text-text-muted uppercase mb-1">Used</div>
                  <div className="text-lg font-semibold text-accent">{result.used} KB</div>
                  <div className="text-[10px] text-text-muted">{((result.used / result.userMem) * 100).toFixed(1)}% utilization</div>
                </div>
                <div className="bg-bg-card border border-border rounded-xl p-4">
                  <div className="text-[10px] text-text-muted uppercase mb-1">Ext. Fragmentation</div>
                  <div className="text-lg font-semibold text-warning">{result.extFrag} KB</div>
                </div>
                <div className="bg-bg-card border border-border rounded-xl p-4">
                  <div className="text-[10px] text-text-muted uppercase mb-1">Unallocated</div>
                  <div className="text-lg font-semibold text-danger">{result.unallocated.length}</div>
                </div>
              </div>
              {result.unallocated.length > 0 && (
                <div className="bg-bg-card border border-danger/30 rounded-xl p-4 text-xs text-danger">
                  Could not allocate: {result.unallocated.map(p => `${p.name}(${p.size}KB)`).join(', ')}
                </div>
              )}
            </>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Configure and click Allocate to see MVT results.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
