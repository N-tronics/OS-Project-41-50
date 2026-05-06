import { useState } from 'react'
import Layout from '../components/Layout'

export default function SemaphoreVisualizer() {
  const [initVal, setInitVal] = useState(2)
  const [opsIn, setOpsIn] = useState('P0:wait\nP1:wait\nP2:wait\nP0:signal\nP3:wait\nP1:signal\nP2:signal')
  const [result, setResult] = useState(null)

  const simulate = () => {
    const ops = opsIn.trim().split('\n').map(l => {
      const [proc, action] = l.trim().split(':')
      return { proc: proc.trim(), action: action.trim() }
    })
    let semVal = initVal
    const steps = []
    const queue = []
    const states = {}

    for (const op of ops) {
      if (!states[op.proc]) states[op.proc] = 'ready'
      const prevVal = semVal
      let event = ''

      if (op.action === 'wait') {
        semVal--
        if (semVal < 0) {
          queue.push(op.proc)
          states[op.proc] = 'blocked'
          event = `${op.proc} blocked (queued)`
        } else {
          states[op.proc] = 'running'
          event = `${op.proc} entered CS`
        }
      } else if (op.action === 'signal') {
        semVal++
        states[op.proc] = 'ready'
        if (semVal <= 0 && queue.length > 0) {
          const woken = queue.shift()
          states[woken] = 'running'
          event = `${op.proc} signaled → ${woken} woken`
        } else {
          event = `${op.proc} signaled`
        }
      }
      steps.push({ proc: op.proc, action: op.action, prevVal, newVal: semVal, event, states: { ...states }, queue: [...queue] })
    }
    setResult({ steps, initVal })
  }

  const stateColors = { running: 'bg-success/20 text-success', blocked: 'bg-danger/20 text-danger', ready: 'bg-bg-input text-text-muted' }

  return (
    <Layout title="Semaphore Visualizer">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Initial Semaphore Value</label>
              <input type="number" min={0} value={initVal} onChange={e => setInitVal(parseInt(e.target.value) || 0)} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Operations <span className="text-text-muted">(process:wait/signal)</span></label>
              <textarea rows={8} value={opsIn} onChange={e => setOpsIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Simulate</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Semaphore value chart */}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Semaphore Value Over Time</h2>
                <div className="flex items-end gap-1 h-32">
                  <div className="flex flex-col justify-between h-full text-[9px] text-text-muted pr-2">
                    {(() => { const vals = result.steps.map(s=>s.newVal); const mx=Math.max(...vals,result.initVal); const mn=Math.min(...vals); return [mx,Math.round((mx+mn)/2),mn].map((v,i)=><span key={i}>{v}</span>) })()}
                  </div>
                  {result.steps.map((s, i) => {
                    const vals = result.steps.map(st => st.newVal)
                    const maxV = Math.max(...vals, result.initVal, 1)
                    const minV = Math.min(...vals, 0)
                    const range = maxV - minV || 1
                    const height = ((s.newVal - minV) / range) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                        <span className="text-[9px] text-text-primary font-mono">{s.newVal}</span>
                        <div className={`w-full rounded-t ${s.newVal < 0 ? 'bg-danger/50' : 'bg-accent/50'}`} style={{ height: `${Math.max(height, 5)}%` }} />
                        <span className="text-[8px] text-text-muted">{s.action[0].toUpperCase()}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Step table */}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Execution Steps</h2>
                <div className="overflow-x-auto">
                  <table>
                    <thead><tr><th>Step</th><th>Process</th><th>Action</th><th>S Value</th><th>Event</th><th>Queue</th></tr></thead>
                    <tbody>{result.steps.map((s, i) => (
                      <tr key={i}>
                        <td className="text-text-muted">{i + 1}</td>
                        <td className="font-medium text-accent">{s.proc}</td>
                        <td><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${s.action === 'wait' ? 'bg-amber-500/20 text-amber-400' : 'bg-success/20 text-success'}`}>{s.action}</span></td>
                        <td className="font-mono"><span className="text-text-muted">{s.prevVal}</span> → <span className={s.newVal < 0 ? 'text-danger' : 'text-accent'}>{s.newVal}</span></td>
                        <td className="text-xs text-text-secondary">{s.event}</td>
                        <td className="font-mono text-xs text-text-muted">{s.queue.length ? `[${s.queue.join(',')}]` : '[]'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
              {/* Process states at end */}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Final Process States</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.steps[result.steps.length - 1].states).map(([proc, state]) => (
                    <div key={proc} className={`px-3 py-2 rounded-lg text-xs font-semibold ${stateColors[state]}`}>
                      {proc}: {state}
                    </div>
                  ))}
                </div>
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
