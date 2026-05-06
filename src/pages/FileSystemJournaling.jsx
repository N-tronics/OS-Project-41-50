import { useState } from 'react'
import Layout from '../components/Layout'

export default function FileSystemJournaling() {
  const [opsIn, setOpsIn] = useState('create:file1.txt\nwrite:file1.txt:Hello World\ncreate:file2.txt\nwrite:file2.txt:Data here\ndelete:file1.txt\ncreate:file3.txt')
  const [crashAt, setCrashAt] = useState(-1)
  const [result, setResult] = useState(null)

  const simulate = () => {
    const ops = opsIn.trim().split('\n').map((l, i) => {
      const parts = l.trim().split(':')
      return { id: i, type: parts[0], file: parts[1], data: parts[2] || '' }
    })
    const journal = []
    const committed = []
    const files = {}
    let crashed = false

    for (let i = 0; i < ops.length; i++) {
      if (crashAt >= 0 && i === crashAt) { crashed = true; journal.push({ ...ops[i], status: 'UNCOMMITTED (CRASH)', step: i }); break }
      // Write to journal first
      journal.push({ ...ops[i], status: 'JOURNALED', step: i })
      // Then commit
      const op = ops[i]
      if (op.type === 'create') { files[op.file] = { content: '', exists: true }; committed.push({ ...op, status: 'COMMITTED', step: i }) }
      else if (op.type === 'write') {
        if (files[op.file]) { files[op.file].content = op.data; committed.push({ ...op, status: 'COMMITTED', step: i }) }
        else { committed.push({ ...op, status: 'FAILED - file not found', step: i }) }
      }
      else if (op.type === 'delete') {
        if (files[op.file]) { files[op.file].exists = false; committed.push({ ...op, status: 'COMMITTED', step: i }) }
      }
      journal[journal.length - 1].status = 'COMMITTED'
    }

    // Recovery
    const recovered = []
    if (crashed) {
      const uncommitted = journal.filter(j => j.status.includes('UNCOMMITTED'))
      recovered.push(...uncommitted.map(j => ({ ...j, recovery: 'Rolled back - operation discarded' })))
    }

    setResult({ journal, committed, files, crashed, recovered, crashAt })
  }

  return (
    <Layout title="File System Journaling">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Operations <span className="text-text-muted">(create:file / write:file:data / delete:file)</span></label>
              <textarea rows={8} value={opsIn} onChange={e => setOpsIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Crash at step <span className="text-text-muted">(-1 = no crash)</span></label>
              <input type="number" min={-1} value={crashAt} onChange={e => setCrashAt(parseInt(e.target.value))} className="w-full" />
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Simulate</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {result.crashed && (
                <div className="bg-bg-card border border-danger/30 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-danger/20 text-danger text-xs font-semibold">⚡ CRASH at step {result.crashAt}</span>
                    <span className="text-xs text-text-secondary">Recovery: uncommitted journal entries rolled back</span>
                  </div>
                </div>
              )}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Journal Log</h2>
                <table>
                  <thead><tr><th>Step</th><th>Op</th><th>File</th><th>Data</th><th>Status</th></tr></thead>
                  <tbody>{result.journal.map((j, i) => (
                    <tr key={i} className={j.status.includes('UNCOMMITTED') ? 'bg-danger/10' : j.status === 'COMMITTED' ? 'bg-success/5' : ''}>
                      <td className="text-text-muted">{j.step}</td>
                      <td className="font-mono text-accent text-xs">{j.type}</td>
                      <td className="font-mono text-xs">{j.file}</td>
                      <td className="font-mono text-xs text-text-muted">{j.data || '-'}</td>
                      <td><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${j.status === 'COMMITTED' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>{j.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Final File State</h2>
                <div className="space-y-2">
                  {Object.entries(result.files).map(([name, f]) => (
                    <div key={name} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${f.exists ? 'bg-success/5 border border-success/20' : 'bg-danger/5 border border-danger/20 line-through'}`}>
                      <span className="text-xs">{f.exists ? '📄' : '🗑️'}</span>
                      <span className="text-xs font-mono text-text-primary">{name}</span>
                      <span className="text-xs text-text-muted ml-auto">{f.content || '(empty)'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Define operations and click Simulate.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
