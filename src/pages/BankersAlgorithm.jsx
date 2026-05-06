import { useState } from 'react'
import Layout from '../components/Layout'

export default function BankersAlgorithm() {
  const [np, setNp] = useState(5)
  const [nr, setNr] = useState(3)
  const [allocIn, setAllocIn] = useState('0 1 0\n2 0 0\n3 0 2\n2 1 1\n0 0 2')
  const [maxIn, setMaxIn] = useState('7 5 3\n3 2 2\n9 0 2\n2 2 2\n4 3 3')
  const [availIn, setAvailIn] = useState('3 3 2')
  const [result, setResult] = useState(null)

  const parseMatrix = (s, rows, cols) => {
    const lines = s.trim().split('\n')
    return lines.map(l => l.trim().split(/[\s,]+/).map(Number))
  }

  const simulate = () => {
    const alloc = parseMatrix(allocIn, np, nr)
    const max = parseMatrix(maxIn, np, nr)
    const avail = availIn.trim().split(/[\s,]+/).map(Number)
    // Calculate Need
    const need = alloc.map((row, i) => row.map((v, j) => max[i][j] - v))
    // Safety algorithm
    const work = [...avail]
    const finish = new Array(np).fill(false)
    const safeSeq = []
    const steps = []
    let found = true
    while (found && safeSeq.length < np) {
      found = false
      for (let i = 0; i < np; i++) {
        if (!finish[i] && need[i].every((n, j) => n <= work[j])) {
          steps.push({ process: `P${i}`, work: [...work], need: [...need[i]], alloc: [...alloc[i]], canRun: true })
          for (let j = 0; j < nr; j++) work[j] += alloc[i][j]
          finish[i] = true
          safeSeq.push(`P${i}`)
          found = true
        }
      }
    }
    const safe = finish.every(f => f)
    setResult({ need, safe, safeSeq, steps, alloc, max, avail })
  }

  return (
    <Layout title="Banker's Algorithm">
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
                <label className="block text-xs text-text-secondary mb-1">Resources</label>
                <input type="number" min={1} value={nr} onChange={e => setNr(parseInt(e.target.value)||1)} className="w-full" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Allocation Matrix</label>
              <textarea rows={5} value={allocIn} onChange={e => setAllocIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Max Matrix</label>
              <textarea rows={5} value={maxIn} onChange={e => setMaxIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Available</label>
              <input value={availIn} onChange={e => setAvailIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Simulate</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              <div className={`bg-bg-card border rounded-xl p-5 ${result.safe ? 'border-success/30' : 'border-danger/30'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${result.safe ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                    {result.safe ? '✓ SAFE STATE' : '✗ UNSAFE STATE'}
                  </span>
                  {result.safe && <span className="text-xs text-text-secondary">Safe Sequence: <strong className="text-accent">{result.safeSeq.join(' → ')}</strong></span>}
                </div>
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Need Matrix</h2>
                <div className="overflow-x-auto">
                  <table>
                    <thead><tr><th>Process</th>{Array.from({length:nr},(_,i)=><th key={i}>R{i}</th>)}</tr></thead>
                    <tbody>{result.need.map((row, i) => (
                      <tr key={i}><td className="font-medium text-accent">P{i}</td>{row.map((v, j) => <td key={j} className="font-mono">{v}</td>)}</tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Execution Steps</h2>
                <div className="overflow-x-auto">
                  <table>
                    <thead><tr><th>Step</th><th>Process</th><th>Work</th><th>Need</th><th>Alloc</th><th>Work+Alloc</th></tr></thead>
                    <tbody>{result.steps.map((s, i) => (
                      <tr key={i}><td className="text-text-muted">{i+1}</td><td className="font-medium text-accent">{s.process}</td>
                        <td className="font-mono text-xs">[{s.work.join(', ')}]</td>
                        <td className="font-mono text-xs">[{s.need.join(', ')}]</td>
                        <td className="font-mono text-xs">[{s.alloc.join(', ')}]</td>
                        <td className="font-mono text-xs">[{s.work.map((w,j)=>w+s.alloc[j]).join(', ')}]</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Configure and click Simulate to check safe/unsafe state.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
