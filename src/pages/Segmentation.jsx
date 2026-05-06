import { useState } from 'react'
import Layout from '../components/Layout'

export default function Segmentation() {
  const [segTable, setSegTable] = useState('0:219:600\n1:2300:14\n2:90:100\n3:1327:580\n4:1952:96')
  const [addrIn, setAddrIn] = useState('')
  const [segNum, setSegNum] = useState(0)
  const [result, setResult] = useState(null)

  const simulate = () => {
    const offset = parseInt(addrIn)
    if (isNaN(offset) || offset < 0) return
    const entries = segTable.trim().split('\n').map(l => {
      const [seg, base, limit] = l.split(':').map(v => parseInt(v.trim()))
      return { seg, base, limit }
    })
    const entry = entries.find(e => e.seg === segNum)
    if (!entry) { setResult({ error: `Segment ${segNum} not found`, entries }); return }
    const violation = offset >= entry.limit
    const physAddr = violation ? null : entry.base + offset
    setResult({ segNum, offset, base: entry.base, limit: entry.limit, violation, physAddr, entries })
  }

  return (
    <Layout title="Segmentation">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Segment Table <span className="text-text-muted">(seg:base:limit)</span></label>
              <textarea rows={6} value={segTable} onChange={e => setSegTable(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Segment #</label>
                <input type="number" min={0} value={segNum} onChange={e => setSegNum(parseInt(e.target.value)||0)} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Offset</label>
                <input type="number" min={0} value={addrIn} onChange={e => setAddrIn(e.target.value)} className="w-full font-mono" placeholder="e.g. 100" />
              </div>
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Translate</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {result.error ? (
                <div className="bg-bg-card border border-danger/30 rounded-xl p-5">
                  <span className="text-danger text-sm">{result.error}</span>
                </div>
              ) : (
                <div className={`bg-bg-card border rounded-xl p-5 ${result.violation ? 'border-danger/30' : 'border-success/30'}`}>
                  <h2 className="text-sm font-semibold text-text-primary mb-4">Translation Result</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: 'Segment', value: result.segNum, color: 'text-accent' },
                      { label: 'Base', value: result.base, color: 'text-text-primary' },
                      { label: 'Limit', value: result.limit, color: 'text-text-primary' },
                      { label: 'Offset', value: result.offset, color: 'text-text-primary' },
                      { label: 'Physical', value: result.violation ? 'VIOLATION' : result.physAddr, color: result.violation ? 'text-danger' : 'text-success' },
                    ].map((item, i) => (
                      <div key={i} className="bg-bg-input rounded-lg p-3">
                        <div className="text-[10px] text-text-muted uppercase mb-1">{item.label}</div>
                        <div className={`font-mono text-sm font-semibold ${item.color}`}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {result.violation && (
                    <div className="mt-3 text-xs text-danger bg-danger/10 rounded-lg px-3 py-2">
                      ⚠ Segmentation Fault: Offset ({result.offset}) ≥ Limit ({result.limit})
                    </div>
                  )}
                  {!result.violation && (
                    <div className="mt-3 text-xs text-text-secondary">
                      Physical = Base({result.base}) + Offset({result.offset}) = <strong className="text-accent">{result.physAddr}</strong>
                    </div>
                  )}
                </div>
              )}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Segment Table</h2>
                <table>
                  <thead><tr><th>Segment</th><th>Base</th><th>Limit</th></tr></thead>
                  <tbody>{result.entries.map((e, i) => (
                    <tr key={i} className={e.seg === result.segNum ? 'bg-accent/10' : ''}>
                      <td className="font-mono text-accent">{e.seg}</td>
                      <td className="font-mono">{e.base}</td>
                      <td className="font-mono">{e.limit}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Enter segment and offset, then click Translate.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
