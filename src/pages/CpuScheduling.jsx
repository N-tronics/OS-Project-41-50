import { useState } from 'react'
import Layout from '../components/Layout'

const ALGORITHMS = ['FCFS', 'SJF (Non-Preemptive)', 'SRTF (Preemptive)', 'Priority (Non-Preemptive)', 'Priority (Preemptive)', 'Round Robin']

function runFCFS(procs) {
  const sorted = [...procs].sort((a, b) => a.arrival - b.arrival)
  const timeline = []
  let time = 0
  const results = []
  for (const p of sorted) {
    if (time < p.arrival) {
      timeline.push({ pid: 'Idle', start: time, end: p.arrival })
      time = p.arrival
    }
    const start = time
    const end = time + p.burst
    timeline.push({ pid: p.pid, start, end })
    results.push({ ...p, start, finish: end, waiting: start - p.arrival, turnaround: end - p.arrival })
    time = end
  }
  return { timeline, results }
}

function runSJF(procs) {
  const remaining = procs.map(p => ({ ...p }))
  const timeline = []
  const results = []
  let time = 0
  const done = new Set()
  while (done.size < procs.length) {
    const available = remaining.filter(p => p.arrival <= time && !done.has(p.pid))
    if (available.length === 0) {
      const next = remaining.filter(p => !done.has(p.pid)).sort((a, b) => a.arrival - b.arrival)[0]
      timeline.push({ pid: 'Idle', start: time, end: next.arrival })
      time = next.arrival
      continue
    }
    available.sort((a, b) => a.burst - b.burst)
    const p = available[0]
    const start = time
    const end = time + p.burst
    timeline.push({ pid: p.pid, start, end })
    results.push({ ...p, start, finish: end, waiting: start - p.arrival, turnaround: end - p.arrival })
    done.add(p.pid)
    time = end
  }
  return { timeline, results }
}

function runSRTF(procs) {
  const n = procs.length
  const rem = procs.map(p => p.burst)
  const done = new Array(n).fill(false)
  const finish = new Array(n).fill(0)
  const timeline = []
  let time = 0
  let completed = 0
  let prev = -1
  const maxTime = procs.reduce((s, p) => s + p.burst + p.arrival, 0) + 10
  while (completed < n && time < maxTime) {
    let idx = -1
    let minRem = Infinity
    for (let i = 0; i < n; i++) {
      if (!done[i] && procs[i].arrival <= time && rem[i] < minRem) {
        minRem = rem[i]
        idx = i
      }
    }
    if (idx === -1) {
      const tStart = time
      time++
      if (timeline.length > 0 && timeline[timeline.length - 1].pid === 'Idle') {
        timeline[timeline.length - 1].end = time
      } else {
        timeline.push({ pid: 'Idle', start: tStart, end: time })
      }
      prev = -1
      continue
    }
    if (prev !== idx) {
      timeline.push({ pid: procs[idx].pid, start: time, end: time + 1 })
    } else {
      timeline[timeline.length - 1].end = time + 1
    }
    rem[idx]--
    time++
    prev = idx
    if (rem[idx] === 0) {
      done[idx] = true
      finish[idx] = time
      completed++
    }
  }
  const results = procs.map((p, i) => ({
    ...p,
    finish: finish[i],
    turnaround: finish[i] - p.arrival,
    waiting: finish[i] - p.arrival - p.burst,
  }))
  return { timeline, results }
}

function runPriority(procs, preemptive) {
  if (!preemptive) {
    const remaining = procs.map(p => ({ ...p }))
    const timeline = []
    const results = []
    let time = 0
    const done = new Set()
    while (done.size < procs.length) {
      const available = remaining.filter(p => p.arrival <= time && !done.has(p.pid))
      if (available.length === 0) {
        const next = remaining.filter(p => !done.has(p.pid)).sort((a, b) => a.arrival - b.arrival)[0]
        timeline.push({ pid: 'Idle', start: time, end: next.arrival })
        time = next.arrival
        continue
      }
      available.sort((a, b) => a.priority - b.priority)
      const p = available[0]
      const start = time
      const end = time + p.burst
      timeline.push({ pid: p.pid, start, end })
      results.push({ ...p, start, finish: end, waiting: start - p.arrival, turnaround: end - p.arrival })
      done.add(p.pid)
      time = end
    }
    return { timeline, results }
  }
  // Preemptive priority
  const n = procs.length
  const rem = procs.map(p => p.burst)
  const done = new Array(n).fill(false)
  const finish = new Array(n).fill(0)
  const timeline = []
  let time = 0
  let completed = 0
  let prev = -1
  const maxTime = procs.reduce((s, p) => s + p.burst + p.arrival, 0) + 10
  while (completed < n && time < maxTime) {
    let idx = -1
    let minPri = Infinity
    for (let i = 0; i < n; i++) {
      if (!done[i] && procs[i].arrival <= time && procs[i].priority < minPri) {
        minPri = procs[i].priority
        idx = i
      }
    }
    if (idx === -1) { time++; prev = -1; continue }
    if (prev !== idx) {
      timeline.push({ pid: procs[idx].pid, start: time, end: time + 1 })
    } else {
      timeline[timeline.length - 1].end = time + 1
    }
    rem[idx]--
    time++
    prev = idx
    if (rem[idx] === 0) {
      done[idx] = true
      finish[idx] = time
      completed++
    }
  }
  const results = procs.map((p, i) => ({
    ...p,
    finish: finish[i],
    turnaround: finish[i] - p.arrival,
    waiting: finish[i] - p.arrival - p.burst,
  }))
  return { timeline, results }
}

function runRR(procs, quantum) {
  const queue = []
  const rem = procs.map(p => p.burst)
  const finish = new Array(procs.length).fill(0)
  const timeline = []
  let time = 0
  const arrived = new Array(procs.length).fill(false)
  const sorted = procs.map((p, i) => ({ ...p, idx: i })).sort((a, b) => a.arrival - b.arrival)
  let si = 0
  // add first arrivals
  while (si < sorted.length && sorted[si].arrival <= time) {
    queue.push(sorted[si].idx)
    arrived[sorted[si].idx] = true
    si++
  }
  const maxTime = procs.reduce((s, p) => s + p.burst + p.arrival, 0) + 10
  while (queue.length > 0 || si < sorted.length) {
    if (time > maxTime) break
    if (queue.length === 0) {
      const next = sorted[si]
      timeline.push({ pid: 'Idle', start: time, end: next.arrival })
      time = next.arrival
      while (si < sorted.length && sorted[si].arrival <= time) {
        queue.push(sorted[si].idx)
        arrived[sorted[si].idx] = true
        si++
      }
      continue
    }
    const idx = queue.shift()
    const execTime = Math.min(rem[idx], quantum)
    timeline.push({ pid: procs[idx].pid, start: time, end: time + execTime })
    time += execTime
    rem[idx] -= execTime
    // Add newly arrived processes
    while (si < sorted.length && sorted[si].arrival <= time) {
      queue.push(sorted[si].idx)
      arrived[sorted[si].idx] = true
      si++
    }
    if (rem[idx] > 0) {
      queue.push(idx)
    } else {
      finish[idx] = time
    }
  }
  const results = procs.map((p, i) => ({
    ...p,
    finish: finish[i],
    turnaround: finish[i] - p.arrival,
    waiting: finish[i] - p.arrival - p.burst,
  }))
  return { timeline, results }
}

const COLORS = [
  'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-violet-500', 'bg-blue-500', 'bg-pink-500', 'bg-lime-500', 'bg-orange-500',
]

export default function CpuScheduling() {
  const [algorithm, setAlgorithm] = useState('FCFS')
  const [quantum, setQuantum] = useState(2)
  const [processInput, setProcessInput] = useState('P1,0,5,2\nP2,1,3,1\nP3,2,8,3\nP4,3,6,4')
  const [result, setResult] = useState(null)

  const simulate = () => {
    const procs = processInput.trim().split('\n').map(line => {
      const [pid, arrival, burst, priority] = line.split(',').map((v, i) => i === 0 ? v.trim() : parseInt(v.trim()))
      return { pid, arrival, burst, priority: priority || 0 }
    })
    let res
    switch (algorithm) {
      case 'FCFS': res = runFCFS(procs); break
      case 'SJF (Non-Preemptive)': res = runSJF(procs); break
      case 'SRTF (Preemptive)': res = runSRTF(procs); break
      case 'Priority (Non-Preemptive)': res = runPriority(procs, false); break
      case 'Priority (Preemptive)': res = runPriority(procs, true); break
      case 'Round Robin': res = runRR(procs, quantum); break
      default: res = runFCFS(procs)
    }
    setResult(res)
  }

  const totalTime = result ? Math.max(...result.timeline.map(t => t.end)) : 0
  const pidSet = result ? [...new Set(result.timeline.filter(t => t.pid !== 'Idle').map(t => t.pid))] : []

  return (
    <Layout title="CPU Scheduling">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Algorithm</label>
              <select value={algorithm} onChange={e => setAlgorithm(e.target.value)} className="w-full">
                {ALGORITHMS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            {algorithm === 'Round Robin' && (
              <div>
                <label className="block text-xs text-text-secondary mb-1">Time Quantum</label>
                <input type="number" min={1} value={quantum} onChange={e => setQuantum(parseInt(e.target.value) || 1)} className="w-full" />
              </div>
            )}
            <div>
              <label className="block text-xs text-text-secondary mb-1">
                Processes <span className="text-text-muted">(PID, Arrival, Burst, Priority)</span>
              </label>
              <textarea
                rows={6}
                value={processInput}
                onChange={e => setProcessInput(e.target.value)}
                className="w-full font-mono text-xs"
                placeholder="P1,0,5,2"
              />
            </div>
            <button
              onClick={simulate}
              className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90 transition-colors"
            >
              Simulate
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2 space-y-4">
          {result && (
            <>
              {/* Gantt Chart */}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-4">Gantt Chart</h2>
                <div className="overflow-x-auto">
                  <div className="flex items-end min-w-max">
                    {result.timeline.map((t, i) => {
                      const width = Math.max((t.end - t.start) * 40, 30)
                      const pidIdx = pidSet.indexOf(t.pid)
                      const color = t.pid === 'Idle' ? 'bg-zinc-700' : COLORS[pidIdx % COLORS.length]
                      return (
                        <div key={i} className="flex flex-col items-center" style={{ width }}>
                          <span className="text-[10px] text-text-secondary mb-1">{t.pid}</span>
                          <div className={`w-full h-10 ${color} rounded-sm flex items-center justify-center`}>
                            <span className="text-[10px] text-white font-medium">{t.end - t.start}</span>
                          </div>
                          <div className="flex justify-between w-full mt-1">
                            {i === 0 && <span className="text-[9px] text-text-muted">{t.start}</span>}
                            <span className="text-[9px] text-text-muted ml-auto">{t.end}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Results Table */}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-4">Process Details</h2>
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>PID</th>
                        <th>Arrival</th>
                        <th>Burst</th>
                        <th>Priority</th>
                        <th>Finish</th>
                        <th>Waiting</th>
                        <th>Turnaround</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results.map((r, i) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="font-medium text-accent">{r.pid}</td>
                          <td>{r.arrival}</td>
                          <td>{r.burst}</td>
                          <td>{r.priority}</td>
                          <td>{r.finish}</td>
                          <td>{r.waiting}</td>
                          <td>{r.turnaround}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex gap-6 text-xs text-text-secondary">
                  <span>Avg Waiting: <strong className="text-text-primary">{(result.results.reduce((s, r) => s + r.waiting, 0) / result.results.length).toFixed(2)}</strong></span>
                  <span>Avg Turnaround: <strong className="text-text-primary">{(result.results.reduce((s, r) => s + r.turnaround, 0) / result.results.length).toFixed(2)}</strong></span>
                </div>
              </div>
            </>
          )}
          {!result && (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Configure processes and click Simulate to see results.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
