import { useState } from 'react'
import Layout from '../components/Layout'

export default function MemoryFragmentation() {
  const [totalMem, setTotalMem] = useState(1000)
  const [opsIn, setOpsIn] = useState('alloc:P1:200\nalloc:P2:150\nalloc:P3:300\nfree:P2\nalloc:P4:100\nalloc:P5:80\nfree:P1\nalloc:P6:250')
  const [result, setResult] = useState(null)

  const simulate = () => {
    const ops = opsIn.trim().split('\n').map(l => {
      const parts = l.trim().split(':')
      return { type: parts[0], name: parts[1], size: parts[2] ? parseInt(parts[2]) : 0 }
    })
    const snapshots = []
    let blocks = [{ start: 0, size: totalMem, free: true, process: null }]

    for (const op of ops) {
      if (op.type === 'alloc') {
        const idx = blocks.findIndex(b => b.free && b.size >= op.size)
        if (idx !== -1) {
          const block = blocks[idx]
          const rem = block.size - op.size
          blocks.splice(idx, 1, { start: block.start, size: op.size, free: false, process: op.name })
          if (rem > 0) blocks.splice(idx + 1, 0, { start: block.start + op.size, size: rem, free: true, process: null })
        }
      } else if (op.type === 'free') {
        const idx = blocks.findIndex(b => b.process === op.name)
        if (idx !== -1) {
          blocks[idx] = { ...blocks[idx], free: true, process: null }
          // Merge adjacent free blocks
          const merged = []
          for (const b of blocks) {
            if (merged.length > 0 && merged[merged.length - 1].free && b.free) {
              merged[merged.length - 1].size += b.size
            } else {
              merged.push({ ...b })
            }
          }
          blocks = merged
        }
      }
      const extFrag = blocks.filter(b => b.free).reduce((s, b) => s + b.size, 0)
      const freeBlocks = blocks.filter(b => b.free).length
      const usedMem = blocks.filter(b => !b.free).reduce((s, b) => s + b.size, 0)
      snapshots.push({ op: `${op.type}:${op.name}${op.size ? ':' + op.size : ''}`, blocks: blocks.map(b => ({ ...b })), extFrag, freeBlocks, usedMem })
    }
    setResult({ snapshots, totalMem })
  }

  return (
    <Layout title="Memory Fragmentation">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Total Memory (KB)</label>
              <input type="number" value={totalMem} onChange={e => setTotalMem(parseInt(e.target.value) || 1)} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Operations <span className="text-text-muted">(alloc:name:size / free:name)</span></label>
              <textarea rows={10} value={opsIn} onChange={e => setOpsIn(e.target.value)} className="w-full font-mono text-xs" />
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Simulate</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            result.snapshots.map((snap, si) => (
              <div key={si} className="bg-bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-accent">{snap.op}</span>
                  <div className="flex gap-3 text-[10px] text-text-muted">
                    <span>Used: {snap.usedMem}KB</span>
                    <span>Ext.Frag: <strong className="text-warning">{snap.extFrag}KB</strong></span>
                    <span>Free blocks: {snap.freeBlocks}</span>
                  </div>
                </div>
                <div className="flex h-8 rounded overflow-hidden border border-border">
                  {snap.blocks.map((b, bi) => (
                    <div key={bi} className={`h-full flex items-center justify-center border-r border-border last:border-r-0 ${b.free ? 'bg-bg-input' : 'bg-accent/25'}`}
                      style={{ width: `${(b.size / result.totalMem) * 100}%`, minWidth: '20px' }}>
                      <span className={`text-[9px] font-medium truncate px-1 ${b.free ? 'text-text-muted' : 'text-accent'}`}>
                        {b.free ? b.size : b.process}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
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
