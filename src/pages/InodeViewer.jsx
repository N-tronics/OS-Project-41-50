import { useState } from 'react'
import Layout from '../components/Layout'

export default function InodeViewer() {
  const [fileSize, setFileSize] = useState(50000)
  const [blockSize, setBlockSize] = useState(4096)
  const [perms, setPerms] = useState('rwxr-xr--')
  const [owner, setOwner] = useState('root')
  const [result, setResult] = useState(null)

  const simulate = () => {
    const totalBlocks = Math.ceil(fileSize / blockSize)
    const directPtrs = 12
    const ptrsPerBlock = Math.floor(blockSize / 4)
    const singleIndirect = ptrsPerBlock
    const doubleIndirect = ptrsPerBlock * ptrsPerBlock
    const tripleIndirect = ptrsPerBlock * ptrsPerBlock * ptrsPerBlock

    let remaining = totalBlocks
    const direct = Math.min(remaining, directPtrs)
    remaining -= direct
    const single = Math.min(remaining, singleIndirect)
    remaining -= single
    const double = Math.min(remaining, doubleIndirect)
    remaining -= double
    const triple = Math.min(remaining, tripleIndirect)

    const now = new Date().toISOString()
    setResult({
      totalBlocks, direct, single, double, triple,
      ptrsPerBlock, directPtrs,
      meta: {
        size: fileSize, blockSize, permissions: perms, owner,
        inode: Math.floor(Math.random() * 10000),
        links: 1,
        created: now, modified: now, accessed: now,
      }
    })
  }

  return (
    <Layout title="Inode Structure Viewer">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">File Metadata</h2>
            <div>
              <label className="block text-xs text-text-secondary mb-1">File Size (bytes)</label>
              <input type="number" value={fileSize} onChange={e => setFileSize(parseInt(e.target.value) || 0)} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Block Size (bytes)</label>
              <input type="number" value={blockSize} onChange={e => setBlockSize(parseInt(e.target.value) || 1)} className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Permissions</label>
              <input value={perms} onChange={e => setPerms(e.target.value)} className="w-full font-mono" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Owner</label>
              <input value={owner} onChange={e => setOwner(e.target.value)} className="w-full" />
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">View Inode</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Inode Metadata */}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Inode #{result.meta.inode}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Size', value: `${result.meta.size} B` },
                    { label: 'Blocks', value: result.totalBlocks },
                    { label: 'Block Size', value: `${result.meta.blockSize} B` },
                    { label: 'Permissions', value: result.meta.permissions },
                    { label: 'Owner', value: result.meta.owner },
                    { label: 'Links', value: result.meta.links },
                  ].map((item, i) => (
                    <div key={i} className="bg-bg-input rounded-lg p-3">
                      <div className="text-[10px] text-text-muted uppercase mb-1">{item.label}</div>
                      <div className="font-mono text-sm text-text-primary">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Block Pointer Structure */}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-4">Block Pointer Structure</h2>
                <div className="space-y-3">
                  {/* Direct pointers */}
                  <div>
                    <div className="text-xs text-text-secondary mb-2">Direct Pointers ({result.direct} / {result.directPtrs})</div>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: result.directPtrs }, (_, i) => (
                        <div key={i} className={`w-10 h-10 rounded flex items-center justify-center text-[9px] font-mono ${i < result.direct ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-bg-input text-text-muted border border-border'}`}>
                          {i < result.direct ? `D${i}` : '-'}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Indirect pointers */}
                  {[
                    { label: 'Single Indirect', count: result.single, max: result.ptrsPerBlock, color: 'teal' },
                    { label: 'Double Indirect', count: result.double, max: result.ptrsPerBlock ** 2, color: 'amber' },
                    { label: 'Triple Indirect', count: result.triple, max: result.ptrsPerBlock ** 3, color: 'rose' },
                  ].map((level, li) => (
                    <div key={li} className={`p-3 rounded-lg border ${level.count > 0 ? 'border-accent/20 bg-accent/5' : 'border-border bg-bg-input'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-text-secondary">{level.label}</span>
                        <span className={`text-xs font-mono ${level.count > 0 ? 'text-accent' : 'text-text-muted'}`}>
                          {level.count > 0 ? `${level.count} blocks used` : 'Not used'}
                        </span>
                      </div>
                      {level.count > 0 && (
                        <div className="mt-2 w-full bg-bg-input rounded-full h-2">
                          <div className="bg-accent/50 h-2 rounded-full" style={{ width: `${Math.min((level.count / level.max) * 100, 100)}%` }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Enter file metadata and click View Inode.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
