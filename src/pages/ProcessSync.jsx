import { useState } from 'react'
import Layout from '../components/Layout'

export default function ProcessSync() {
  const [numProcs, setNumProcs] = useState(3)
  const [syncMethod, setSyncMethod] = useState('mutex')
  const [csTime, setCsTime] = useState(3)
  const [result, setResult] = useState(null)

  const simulate = () => {
    const procs = Array.from({ length: numProcs }, (_, i) => ({ id: `P${i}`, arrivalOffset: i }))
    // Without sync (race condition)
    const unsyncTimeline = []
    const syncTimeline = []
    let time = 0

    // Unsynchronized: processes overlap in critical section
    for (const p of procs) {
      unsyncTimeline.push({ pid: p.id, start: p.arrivalOffset, end: p.arrivalOffset + csTime, type: 'critical' })
    }
    // Find overlaps
    const races = []
    for (let i = 0; i < unsyncTimeline.length; i++) {
      for (let j = i + 1; j < unsyncTimeline.length; j++) {
        const a = unsyncTimeline[i], b = unsyncTimeline[j]
        if (a.start < b.end && b.start < a.end) {
          races.push({ p1: a.pid, p2: b.pid, overlapStart: Math.max(a.start, b.start), overlapEnd: Math.min(a.end, b.end) })
        }
      }
    }

    // Synchronized
    time = 0
    const lockLog = []
    for (const p of procs) {
      const waitStart = Math.max(time, p.arrivalOffset)
      const waiting = waitStart > p.arrivalOffset ? p.arrivalOffset : waitStart
      if (waitStart > p.arrivalOffset) {
        syncTimeline.push({ pid: p.id, start: p.arrivalOffset, end: waitStart, type: 'waiting' })
      }
      lockLog.push({ pid: p.id, action: syncMethod === 'mutex' ? 'lock()' : 'spin_lock()', time: waitStart })
      syncTimeline.push({ pid: p.id, start: waitStart, end: waitStart + csTime, type: 'critical' })
      lockLog.push({ pid: p.id, action: syncMethod === 'mutex' ? 'unlock()' : 'spin_unlock()', time: waitStart + csTime })
      time = waitStart + csTime
    }

    setResult({ unsyncTimeline, syncTimeline, races, lockLog, syncMethod, totalTime: time })
  }

  const COLORS = { P0: 'bg-cyan-500', P1: 'bg-teal-500', P2: 'bg-amber-500', P3: 'bg-rose-500', P4: 'bg-violet-500' }

  return (
    <Layout title="Process Synchronization">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Number of Processes</label>
              <input type="number" min={2} max={5} value={numProcs} onChange={e => setNumProcs(parseInt(e.target.value) || 2)} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Sync Method</label>
              <select value={syncMethod} onChange={e => setSyncMethod(e.target.value)} className="w-full">
                <option value="mutex">Mutex Lock</option>
                <option value="spinlock">Spinlock</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Critical Section Time</label>
              <input type="number" min={1} value={csTime} onChange={e => setCsTime(parseInt(e.target.value) || 1)} className="w-full" />
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Simulate</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Race conditions */}
              {result.races.length > 0 && (
                <div className="bg-bg-card border border-danger/30 rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-danger mb-3">⚠ Without Sync — Race Conditions</h2>
                  <div className="relative h-20">
                    {result.unsyncTimeline.map((t, i) => (
                      <div key={i} className={`absolute h-6 ${COLORS[t.pid] || 'bg-accent'} opacity-60 rounded flex items-center px-2`}
                        style={{ left: `${(t.start / (result.totalTime || 10)) * 100}%`, width: `${((t.end - t.start) / (result.totalTime || 10)) * 100}%`, top: `${i * 24}px` }}>
                        <span className="text-[9px] text-white font-medium">{t.pid}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 space-y-1">
                    {result.races.map((r, i) => (
                      <div key={i} className="text-xs text-danger">⚡ {r.p1} ↔ {r.p2} overlap at t=[{r.overlapStart}, {r.overlapEnd})</div>
                    ))}
                  </div>
                </div>
              )}
              {/* Synchronized */}
              <div className="bg-bg-card border border-success/30 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-success mb-3">✓ With {result.syncMethod === 'mutex' ? 'Mutex' : 'Spinlock'} — Synchronized</h2>
                <div className="relative" style={{ height: `${numProcs * 28 + 8}px` }}>
                  {result.syncTimeline.map((t, i) => (
                    <div key={i} className={`absolute h-6 rounded flex items-center px-2 ${t.type === 'critical' ? (COLORS[t.pid] || 'bg-accent') : 'bg-zinc-700'}`}
                      style={{ left: `${(t.start / result.totalTime) * 100}%`, width: `${Math.max(((t.end - t.start) / result.totalTime) * 100, 2)}%`, top: `${parseInt(t.pid.replace('P', '')) * 28}px` }}>
                      <span className="text-[9px] text-white font-medium">{t.pid} {t.type === 'waiting' ? '(wait)' : '(CS)'}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Lock log */}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Lock Operations</h2>
                <table>
                  <thead><tr><th>Time</th><th>Process</th><th>Action</th></tr></thead>
                  <tbody>{result.lockLog.map((l, i) => (
                    <tr key={i}>
                      <td className="font-mono text-text-muted">{l.time}</td>
                      <td className="font-medium text-accent">{l.pid}</td>
                      <td className="font-mono text-xs text-text-secondary">{l.action}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Configure and click Simulate.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
