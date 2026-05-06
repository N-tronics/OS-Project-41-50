import { useState } from 'react'
import Layout from '../components/Layout'

export default function DeadlockDetection() {
  const [np, setNp] = useState(3)
  const [nrType, setNrType] = useState(3)
  const [allocIn, setAllocIn] = useState('0 1 0\n2 0 0\n3 0 3')
  const [reqIn, setReqIn] = useState('0 0 0\n2 0 2\n0 0 0')
  const [availIn, setAvailIn] = useState('0 0 0')
  const [result, setResult] = useState(null)

  const simulate = () => {
    const alloc = allocIn.trim().split('\n').map(l => l.trim().split(/[\s,]+/).map(Number))
    const req = reqIn.trim().split('\n').map(l => l.trim().split(/[\s,]+/).map(Number))
    const avail = availIn.trim().split(/[\s,]+/).map(Number)
    const work = [...avail]
    const finish = alloc.map(row => row.every(v => v === 0))
    const order = []
    const steps = []
    let changed = true
    while (changed) {
      changed = false
      for (let i = 0; i < np; i++) {
        if (!finish[i] && req[i].every((r, j) => r <= work[j])) {
          steps.push({ process: `P${i}`, work: [...work], request: [...req[i]], freed: [...alloc[i]] })
          for (let j = 0; j < nrType; j++) work[j] += alloc[i][j]
          finish[i] = true
          order.push(`P${i}`)
          changed = true
        }
      }
    }
    const deadlocked = finish.map((f, i) => !f ? `P${i}` : null).filter(Boolean)
    setResult({ deadlocked, order, steps, hasDeadlock: deadlocked.length > 0 })
  }

  return (
    <Layout title="Deadlock Detection">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Processes</label>
                <input type="number" min={1} value={np} onChange={e => setNp(parseInt(e.target.value)||1)} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Resource Types</label>
                <input type="number" min={1} value={nrType} onChange={e => setNrType(parseInt(e.target.value)||1)} className="w-full" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Allocation Matrix</label>
              <textarea rows={4} value={allocIn} onChange={e => setAllocIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Request Matrix</label>
              <textarea rows={4} value={reqIn} onChange={e => setReqIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Available</label>
              <input value={availIn} onChange={e => setAvailIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Detect</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              <div className={`bg-bg-card border rounded-xl p-5 ${result.hasDeadlock ? 'border-danger/30' : 'border-success/30'}`}>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${result.hasDeadlock ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                    {result.hasDeadlock ? '💀 DEADLOCK DETECTED' : '✓ NO DEADLOCK'}
                  </span>
                  {result.hasDeadlock && (
                    <span className="text-xs text-text-secondary">Deadlocked: <strong className="text-danger">{result.deadlocked.join(', ')}</strong></span>
                  )}
                </div>
              </div>
              {result.steps.length > 0 && (
                <div className="bg-bg-card border border-border rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-text-primary mb-3">Execution Steps</h2>
                  <div className="overflow-x-auto">
                    <table>
                      <thead><tr><th>Step</th><th>Process</th><th>Work</th><th>Request</th><th>Freed</th></tr></thead>
                      <tbody>{result.steps.map((s, i) => (
                        <tr key={i}>
                          <td className="text-text-muted">{i+1}</td>
                          <td className="font-medium text-accent">{s.process}</td>
                          <td className="font-mono text-xs">[{s.work.join(', ')}]</td>
                          <td className="font-mono text-xs">[{s.request.join(', ')}]</td>
                          <td className="font-mono text-xs">[{s.freed.join(', ')}]</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* Visual RAG */}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Process State</h2>
                <div className="flex flex-wrap gap-3">
                  {Array.from({length: np}, (_, i) => {
                    const dead = result.deadlocked.includes(`P${i}`)
                    return (
                      <div key={i} className={`px-4 py-3 rounded-lg border text-center ${dead ? 'border-danger/30 bg-danger/5' : 'border-success/30 bg-success/5'}`}>
                        <div className={`text-lg font-bold ${dead ? 'text-danger' : 'text-success'}`}>P{i}</div>
                        <div className={`text-[10px] mt-1 ${dead ? 'text-danger/70' : 'text-success/70'}`}>{dead ? 'Deadlocked' : 'Completed'}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Configure and click Detect to find deadlocks.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
