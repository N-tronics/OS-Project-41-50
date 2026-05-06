import { useState } from 'react'
import Layout from '../components/Layout'

const ALGOS = ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK']

function runDisk(queue, head, algo, diskSize = 200) {
  const seq = [head]; let total = 0
  const q = [...queue].filter(v => v !== head)
  if (algo === 'FCFS') {
    for (const r of q) { total += Math.abs(r - seq[seq.length-1]); seq.push(r) }
  } else if (algo === 'SSTF') {
    const rem = [...q]
    while (rem.length > 0) {
      const cur = seq[seq.length-1]
      rem.sort((a, b) => Math.abs(a - cur) - Math.abs(b - cur))
      const next = rem.shift()
      total += Math.abs(next - cur); seq.push(next)
    }
  } else if (algo === 'SCAN') {
    const left = q.filter(r => r < head).sort((a,b) => b - a)
    const right = q.filter(r => r >= head).sort((a,b) => a - b)
    for (const r of right) { total += Math.abs(r - seq[seq.length-1]); seq.push(r) }
    if (left.length > 0) { total += Math.abs(diskSize - 1 - seq[seq.length-1]); seq.push(diskSize - 1) }
    for (const r of left) { total += Math.abs(r - seq[seq.length-1]); seq.push(r) }
  } else if (algo === 'C-SCAN') {
    const left = q.filter(r => r < head).sort((a,b) => a - b)
    const right = q.filter(r => r >= head).sort((a,b) => a - b)
    for (const r of right) { total += Math.abs(r - seq[seq.length-1]); seq.push(r) }
    if (left.length > 0) { total += Math.abs(diskSize - 1 - seq[seq.length-1]); seq.push(diskSize - 1); total += diskSize - 1; seq.push(0) }
    for (const r of left) { total += Math.abs(r - seq[seq.length-1]); seq.push(r) }
  } else if (algo === 'LOOK') {
    const left = q.filter(r => r < head).sort((a,b) => b - a)
    const right = q.filter(r => r >= head).sort((a,b) => a - b)
    for (const r of right) { total += Math.abs(r - seq[seq.length-1]); seq.push(r) }
    for (const r of left) { total += Math.abs(r - seq[seq.length-1]); seq.push(r) }
  } else if (algo === 'C-LOOK') {
    const left = q.filter(r => r < head).sort((a,b) => a - b)
    const right = q.filter(r => r >= head).sort((a,b) => a - b)
    for (const r of right) { total += Math.abs(r - seq[seq.length-1]); seq.push(r) }
    for (const r of left) { total += Math.abs(r - seq[seq.length-1]); seq.push(r) }
  }
  return { sequence: seq, totalSeek: total }
}

export default function DiskScheduling() {
  const [algo, setAlgo] = useState('FCFS')
  const [queueIn, setQueueIn] = useState('98 183 37 122 14 124 65 67')
  const [head, setHead] = useState(53)
  const [diskSize, setDiskSize] = useState(200)
  const [result, setResult] = useState(null)

  const simulate = () => {
    const queue = queueIn.trim().split(/[\s,]+/).map(Number)
    setResult(runDisk(queue, head, algo, diskSize))
  }

  const maxVal = result ? Math.max(diskSize, ...result.sequence) : diskSize

  return (
    <Layout title="Disk Scheduling">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Algorithm</label>
              <select value={algo} onChange={e => setAlgo(e.target.value)} className="w-full">
                {ALGOS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Head Position</label>
              <input type="number" value={head} onChange={e => setHead(parseInt(e.target.value)||0)} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Disk Size</label>
              <input type="number" value={diskSize} onChange={e => setDiskSize(parseInt(e.target.value)||200)} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Request Queue</label>
              <textarea rows={3} value={queueIn} onChange={e => setQueueIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Simulate</button>
          </div>
        </div>
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-4">
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-semibold text-text-primary">Seek Visualization</h2>
                  <span className="text-xs text-accent">Total Seek: <strong>{result.totalSeek}</strong></span>
                </div>
                <div className="space-y-1">
                  {result.sequence.map((pos, i) => (
                    <div key={i} className="flex items-center gap-2 h-7">
                      <span className="w-8 text-right text-[10px] text-text-muted font-mono">{pos}</span>
                      <div className="flex-1 relative h-5 bg-bg-input rounded">
                        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                          style={{ left: `${(pos / maxVal) * 100}%`, transform: 'translate(-50%, -50%)' }} />
                        {i > 0 && (
                          <div className="absolute top-1/2 h-0.5 bg-accent/30"
                            style={{
                              left: `${(Math.min(pos, result.sequence[i-1]) / maxVal) * 100}%`,
                              width: `${(Math.abs(pos - result.sequence[i-1]) / maxVal) * 100}%`,
                              transform: 'translateY(-50%)'
                            }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Seek Sequence</h2>
                <div className="flex flex-wrap gap-1 text-xs font-mono">
                  {result.sequence.map((s, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="px-2 py-1 bg-accent/10 text-accent rounded">{s}</span>
                      {i < result.sequence.length - 1 && <span className="text-text-muted">→</span>}
                    </span>
                  ))}
                </div>
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
