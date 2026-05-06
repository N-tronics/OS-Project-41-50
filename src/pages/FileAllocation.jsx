import { useState } from 'react'
import Layout from '../components/Layout'

const METHODS = ['Contiguous', 'Linked', 'Indexed']

export default function FileAllocation() {
  const [method, setMethod] = useState('Contiguous')
  const [diskBlocks, setDiskBlocks] = useState(20)
  const [filesIn, setFilesIn] = useState('A:3\nB:4\nC:2\nD:5')
  const [result, setResult] = useState(null)

  const simulate = () => {
    const files = filesIn.trim().split('\n').map(l => {
      const [name, size] = l.split(':')
      return { name: name.trim(), size: parseInt(size.trim()) }
    })
    const disk = new Array(diskBlocks).fill(null)
    const allocs = []

    if (method === 'Contiguous') {
      let pos = 0
      for (const f of files) {
        if (pos + f.size <= diskBlocks) {
          const blocks = []
          for (let i = pos; i < pos + f.size; i++) { disk[i] = f.name; blocks.push(i) }
          allocs.push({ ...f, blocks, start: pos, end: pos + f.size - 1 })
          pos += f.size
        } else {
          allocs.push({ ...f, blocks: [], start: -1, end: -1, error: 'No contiguous space' })
        }
      }
    } else if (method === 'Linked') {
      let nextFree = 0
      for (const f of files) {
        const blocks = []
        for (let i = 0; i < f.size && nextFree < diskBlocks; i++) {
          while (nextFree < diskBlocks && disk[nextFree] !== null) nextFree++
          if (nextFree < diskBlocks) { disk[nextFree] = f.name; blocks.push(nextFree); nextFree++ }
        }
        const links = blocks.map((b, i) => ({ block: b, next: i < blocks.length - 1 ? blocks[i + 1] : -1 }))
        allocs.push({ ...f, blocks, links })
      }
    } else {
      let nextFree = 0
      for (const f of files) {
        const blocks = []
        for (let i = 0; i < f.size; i++) {
          while (nextFree < diskBlocks && disk[nextFree] !== null) nextFree++
          if (nextFree < diskBlocks) { disk[nextFree] = f.name; blocks.push(nextFree); nextFree++ }
        }
        const indexBlock = nextFree < diskBlocks ? nextFree : -1
        if (indexBlock !== -1) { disk[indexBlock] = `${f.name}*`; nextFree++ }
        allocs.push({ ...f, blocks, indexBlock })
      }
    }
    setResult({ disk: [...disk], allocs, method })
  }

  return (
    <Layout title="File Allocation">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Method</label>
              <select value={method} onChange={e => setMethod(e.target.value)} className="w-full">
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Total Disk Blocks</label>
              <input type="number" min={1} value={diskBlocks} onChange={e => setDiskBlocks(parseInt(e.target.value) || 1)} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Files <span className="text-text-muted">(name:blocks_needed)</span></label>
              <textarea rows={5} value={filesIn} onChange={e => setFilesIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Allocate</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-4">Disk Block Map</h2>
                <div className="grid grid-cols-10 gap-1">
                  {result.disk.map((block, i) => {
                    const colors = { A: 'bg-cyan-500/30 text-cyan-400', B: 'bg-teal-500/30 text-teal-400', C: 'bg-amber-500/30 text-amber-400', D: 'bg-rose-500/30 text-rose-400', E: 'bg-violet-500/30 text-violet-400' }
                    const name = block ? block.replace('*', '') : null
                    const isIndex = block && block.includes('*')
                    const color = name ? (colors[name] || 'bg-accent/30 text-accent') : 'bg-bg-input text-text-muted'
                    return (
                      <div key={i} className={`h-10 rounded flex flex-col items-center justify-center ${color} ${isIndex ? 'ring-1 ring-white/30' : ''}`}>
                        <span className="text-[9px] font-mono">{i}</span>
                        <span className="text-[9px] font-semibold">{block || '-'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Allocation Details ({result.method})</h2>
                <table>
                  <thead>
                    <tr>
                      <th>File</th><th>Size</th><th>Blocks</th>
                      {result.method === 'Contiguous' && <th>Start-End</th>}
                      {result.method === 'Indexed' && <th>Index Block</th>}
                    </tr>
                  </thead>
                  <tbody>{result.allocs.map((a, i) => (
                    <tr key={i}>
                      <td className="font-medium text-accent">{a.name}</td>
                      <td className="font-mono">{a.size}</td>
                      <td className="font-mono text-xs">[{a.blocks.join(', ')}]</td>
                      {result.method === 'Contiguous' && <td className="font-mono">{a.start !== -1 ? `${a.start}-${a.end}` : <span className="text-danger">Failed</span>}</td>}
                      {result.method === 'Indexed' && <td className="font-mono">{a.indexBlock !== -1 ? a.indexBlock : '-'}</td>}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Configure files and click Allocate.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
