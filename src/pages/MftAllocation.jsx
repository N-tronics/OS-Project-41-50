import { useState } from 'react'
import Layout from '../components/Layout'

export default function MftAllocation() {
  const [totalMem, setTotalMem] = useState(1000)
  const [partIn, setPartIn] = useState('200\n300\n250\n250')
  const [procIn, setProcIn] = useState('P1:180\nP2:290\nP3:200\nP4:260\nP5:100')
  const [result, setResult] = useState(null)

  const simulate = () => {
    const partitions = partIn.trim().split('\n').map((l, i) => ({ id: i, size: parseInt(l.trim()), process: null, procSize: 0 }))
    const procs = procIn.trim().split('\n').map(l => { const [name, size] = l.split(':'); return { name: name.trim(), size: parseInt(size.trim()) } })
    const allocations = []
    const unallocated = []
    let totalIntFrag = 0
    for (const proc of procs) {
      let allocated = false
      for (const part of partitions) {
        if (!part.process && part.size >= proc.size) {
          part.process = proc.name
          part.procSize = proc.size
          const intFrag = part.size - proc.size
          totalIntFrag += intFrag
          allocations.push({ process: proc.name, partition: part.id, partSize: part.size, procSize: proc.size, intFrag })
          allocated = true
          break
        }
      }
      if (!allocated) unallocated.push(proc)
    }
    setResult({ partitions: [...partitions], allocations, unallocated, totalIntFrag, totalMem })
  }

  return (
    <Layout title="MFT Allocation">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Total Memory (KB)</label>
              <input type="number" value={totalMem} onChange={e => setTotalMem(parseInt(e.target.value)||1)} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Partition Sizes <span className="text-text-muted">(one per line)</span></label>
              <textarea rows={4} value={partIn} onChange={e => setPartIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Processes <span className="text-text-muted">(name:size)</span></label>
              <textarea rows={5} value={procIn} onChange={e => setProcIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Allocate</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Memory Map */}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-4">Memory Map</h2>
                <div className="space-y-1">
                  {result.partitions.map((p, i) => {
                    const widthPct = (p.size / result.totalMem) * 100
                    const usedPct = p.process ? (p.procSize / p.size) * 100 : 0
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-12 text-right text-[10px] text-text-muted">P{p.id}</span>
                        <div className="flex-1 h-8 bg-bg-input rounded overflow-hidden relative" style={{ width: `${widthPct}%` }}>
                          {p.process && (
                            <div className="h-full bg-accent/30 rounded-l flex items-center px-2" style={{ width: `${usedPct}%` }}>
                              <span className="text-[10px] text-accent font-medium truncate">{p.process}</span>
                            </div>
                          )}
                          {!p.process && (
                            <div className="h-full flex items-center justify-center">
                              <span className="text-[10px] text-text-muted">Free</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-text-muted w-16">{p.size} KB</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Allocation Table */}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Allocation Table</h2>
                <table>
                  <thead><tr><th>Process</th><th>Partition</th><th>Part Size</th><th>Proc Size</th><th>Int. Frag</th></tr></thead>
                  <tbody>
                    {result.allocations.map((a, i) => (
                      <tr key={i}>
                        <td className="font-medium text-accent">{a.process}</td>
                        <td>P{a.partition}</td>
                        <td className="font-mono">{a.partSize} KB</td>
                        <td className="font-mono">{a.procSize} KB</td>
                        <td className="font-mono text-warning">{a.intFrag} KB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 flex gap-4 text-xs text-text-secondary">
                  <span>Total Int. Fragmentation: <strong className="text-warning">{result.totalIntFrag} KB</strong></span>
                </div>
                {result.unallocated.length > 0 && (
                  <div className="mt-3 text-xs text-danger bg-danger/10 rounded-lg px-3 py-2">
                    Unallocated: {result.unallocated.map(p => `${p.name}(${p.size}KB)`).join(', ')}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Configure partitions and processes, then click Allocate.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
