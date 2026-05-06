import { useState } from 'react'
import Layout from '../components/Layout'

export default function TlbSimulator() {
  const [tlbSize, setTlbSize] = useState(4)
  const [addrIn, setAddrIn] = useState('1 3 5 1 2 3 7 1 5 2')
  const [ptIn, setPtIn] = useState('0:10\n1:15\n2:20\n3:25\n4:30\n5:35\n6:40\n7:45')
  const [result, setResult] = useState(null)

  const simulate = () => {
    const addrs = addrIn.trim().split(/[\s,]+/).map(Number)
    const pt = {}
    ptIn.trim().split('\n').forEach(l => { const [p, f] = l.split(':').map(v => parseInt(v.trim())); pt[p] = f })
    const tlb = []
    const steps = []
    let hits = 0, misses = 0
    for (const page of addrs) {
      const tlbIdx = tlb.findIndex(e => e.page === page)
      if (tlbIdx !== -1) {
        hits++
        // Move to front (LRU)
        const entry = tlb.splice(tlbIdx, 1)[0]
        tlb.push(entry)
        steps.push({ page, frame: entry.frame, hit: true, tlb: tlb.map(e => ({...e})), action: 'TLB Hit' })
      } else {
        misses++
        const frame = pt[page] !== undefined ? pt[page] : -1
        if (tlb.length >= tlbSize) tlb.shift()
        tlb.push({ page, frame })
        steps.push({ page, frame, hit: false, tlb: tlb.map(e => ({...e})), action: frame === -1 ? 'Page Fault' : 'TLB Miss → Page Table' })
      }
    }
    setResult({ steps, hits, misses, total: addrs.length })
  }

  return (
    <Layout title="TLB Simulator">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div>
              <label className="block text-xs text-text-secondary mb-1">TLB Size</label>
              <input type="number" min={1} value={tlbSize} onChange={e => setTlbSize(parseInt(e.target.value)||1)} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Address Sequence (page numbers)</label>
              <textarea rows={2} value={addrIn} onChange={e => setAddrIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Page Table <span className="text-text-muted">(page:frame)</span></label>
              <textarea rows={6} value={ptIn} onChange={e => setPtIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Simulate</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-text-primary">TLB Access Log</h2>
                  <div className="flex gap-4 text-xs">
                    <span className="text-success">Hits: <strong>{result.hits}</strong></span>
                    <span className="text-danger">Misses: <strong>{result.misses}</strong></span>
                    <span className="text-text-secondary">Hit Ratio: <strong className="text-text-primary">{((result.hits/result.total)*100).toFixed(1)}%</strong></span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table>
                    <thead><tr><th>Step</th><th>Page</th><th>Frame</th><th>Result</th><th>TLB State</th></tr></thead>
                    <tbody>{result.steps.map((s, i) => (
                      <tr key={i} className={s.hit ? 'bg-success/5' : 'bg-danger/5'}>
                        <td className="text-text-muted">{i+1}</td>
                        <td className="font-mono font-semibold text-accent">{s.page}</td>
                        <td className="font-mono">{s.frame === -1 ? '-' : s.frame}</td>
                        <td><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${s.hit ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>{s.action}</span></td>
                        <td className="font-mono text-xs text-text-secondary">[{s.tlb.map(e => `${e.page}→${e.frame}`).join(', ')}]</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Configure and click Simulate to trace TLB behavior.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
