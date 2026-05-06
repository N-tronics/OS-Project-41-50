import { useState } from 'react'
import Layout from '../components/Layout'

export default function VirtualMemory() {
  const [pageSize, setPageSize] = useState(4096)
  const [numPages, setNumPages] = useState(8)
  const [virtualAddr, setVirtualAddr] = useState('')
  const [pageTableIn, setPageTableIn] = useState('0:5\n1:9\n2:1\n3:7\n4:-1\n5:3\n6:-1\n7:12')
  const [result, setResult] = useState(null)

  const simulate = () => {
    const addr = parseInt(virtualAddr)
    if (isNaN(addr) || addr < 0) return
    const pageNum = Math.floor(addr / pageSize)
    const offset = addr % pageSize
    const pt = {}
    pageTableIn.trim().split('\n').forEach(l => {
      const [p, f] = l.split(':').map(v => parseInt(v.trim()))
      pt[p] = f
    })
    const frame = pt[pageNum]
    const pageFault = frame === undefined || frame === -1
    const physicalAddr = pageFault ? null : frame * pageSize + offset
    const entries = Object.entries(pt).map(([p, f]) => ({
      page: parseInt(p), frame: f, valid: f !== -1, isAccessed: parseInt(p) === pageNum
    }))
    setResult({ addr, pageNum, offset, frame, physicalAddr, pageFault, entries, pageSize })
  }

  return (
    <Layout title="Virtual Memory Simulator">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Page Size (bytes)</label>
              <input type="number" value={pageSize} onChange={e => setPageSize(parseInt(e.target.value)||1)} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Number of Pages</label>
              <input type="number" value={numPages} onChange={e => setNumPages(parseInt(e.target.value)||1)} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Page Table <span className="text-text-muted">(page:frame, -1 = invalid)</span></label>
              <textarea rows={8} value={pageTableIn} onChange={e => setPageTableIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Virtual Address</label>
              <input type="number" value={virtualAddr} onChange={e => setVirtualAddr(e.target.value)} className="w-full font-mono" placeholder="e.g. 13500" />
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Translate</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              <div className={`bg-bg-card border rounded-xl p-5 ${result.pageFault ? 'border-danger/30' : 'border-success/30'}`}>
                <h2 className="text-sm font-semibold text-text-primary mb-4">Translation Result</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-bg-input rounded-lg p-3">
                    <div className="text-[10px] text-text-muted uppercase mb-1">Virtual Addr</div>
                    <div className="font-mono text-sm text-text-primary">{result.addr}</div>
                  </div>
                  <div className="bg-bg-input rounded-lg p-3">
                    <div className="text-[10px] text-text-muted uppercase mb-1">Page Number</div>
                    <div className="font-mono text-sm text-accent">{result.pageNum}</div>
                  </div>
                  <div className="bg-bg-input rounded-lg p-3">
                    <div className="text-[10px] text-text-muted uppercase mb-1">Offset</div>
                    <div className="font-mono text-sm text-text-primary">{result.offset}</div>
                  </div>
                  <div className="bg-bg-input rounded-lg p-3">
                    <div className="text-[10px] text-text-muted uppercase mb-1">Physical Addr</div>
                    <div className={`font-mono text-sm ${result.pageFault ? 'text-danger' : 'text-success'}`}>
                      {result.pageFault ? 'PAGE FAULT' : result.physicalAddr}
                    </div>
                  </div>
                </div>
                {!result.pageFault && (
                  <div className="mt-4 text-xs text-text-secondary">
                    Physical = Frame({result.frame}) × PageSize({result.pageSize}) + Offset({result.offset}) = <strong className="text-accent">{result.physicalAddr}</strong>
                  </div>
                )}
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Page Table</h2>
                <div className="overflow-x-auto">
                  <table>
                    <thead><tr><th>Page</th><th>Frame</th><th>Valid</th><th>Status</th></tr></thead>
                    <tbody>{result.entries.map((e, i) => (
                      <tr key={i} className={e.isAccessed ? (result.pageFault ? 'bg-danger/10' : 'bg-accent/10') : ''}>
                        <td className="font-mono">{e.page}</td>
                        <td className="font-mono">{e.frame === -1 ? '-' : e.frame}</td>
                        <td>{e.valid ? <span className="text-success">✓</span> : <span className="text-danger">✗</span>}</td>
                        <td>{e.isAccessed ? <span className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent">← Accessed</span> : ''}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Enter a virtual address and click Translate.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
