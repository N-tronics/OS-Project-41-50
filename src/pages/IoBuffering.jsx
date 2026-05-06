import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'

export default function IoBuffering() {
  const [bufType, setBufType] = useState('single')
  const [bufSize, setBufSize] = useState(5)
  const [prodRate, setProdRate] = useState(2)
  const [consRate, setConsRate] = useState(3)
  const [steps, setSteps] = useState(15)
  const [result, setResult] = useState(null)

  const simulate = () => {
    const log = []
    let produced = 0, consumed = 0

    if (bufType === 'single') {
      let buffer = [], bufFull = false
      for (let t = 0; t < steps; t++) {
        const action = { time: t, buffer: [...buffer], produced, consumed, event: '' }
        if (!bufFull && produced < steps * prodRate) {
          const items = Math.min(prodRate, bufSize - buffer.length)
          for (let i = 0; i < items; i++) { buffer.push(`D${produced}`); produced++ }
          action.event = `Produced ${items} items`
          if (buffer.length >= bufSize) bufFull = true
        }
        if (bufFull || buffer.length > 0) {
          const items = Math.min(consRate, buffer.length)
          buffer.splice(0, items)
          consumed += items
          action.event += (action.event ? ' | ' : '') + `Consumed ${items} items`
          bufFull = false
        }
        action.buffer = [...buffer]
        action.produced = produced
        action.consumed = consumed
        log.push(action)
      }
    } else if (bufType === 'double') {
      let buf1 = [], buf2 = [], activeWrite = 1
      for (let t = 0; t < steps; t++) {
        const writeBuf = activeWrite === 1 ? buf1 : buf2
        const readBuf = activeWrite === 1 ? buf2 : buf1
        const action = { time: t, buf1: [...buf1], buf2: [...buf2], produced, consumed, event: '', activeWrite }
        // Producer writes to active buffer
        const pItems = Math.min(prodRate, bufSize - writeBuf.length)
        for (let i = 0; i < pItems; i++) { writeBuf.push(`D${produced}`); produced++ }
        // Consumer reads from other buffer
        const cItems = Math.min(consRate, readBuf.length)
        readBuf.splice(0, cItems)
        consumed += cItems
        action.event = `Wrote ${pItems} to Buf${activeWrite} | Read ${cItems} from Buf${activeWrite === 1 ? 2 : 1}`
        // Swap if write buffer full
        if (writeBuf.length >= bufSize) activeWrite = activeWrite === 1 ? 2 : 1
        action.buf1 = [...buf1]; action.buf2 = [...buf2]
        action.produced = produced; action.consumed = consumed
        log.push(action)
      }
    } else {
      // Circular buffer
      const buffer = new Array(bufSize).fill(null)
      let head = 0, tail = 0, count = 0
      for (let t = 0; t < steps; t++) {
        const action = { time: t, buffer: [...buffer], head, tail, count, produced, consumed, event: '' }
        // Produce
        const pItems = Math.min(prodRate, bufSize - count)
        for (let i = 0; i < pItems; i++) { buffer[tail] = `D${produced}`; tail = (tail + 1) % bufSize; count++; produced++ }
        // Consume
        const cItems = Math.min(consRate, count)
        for (let i = 0; i < cItems; i++) { buffer[head] = null; head = (head + 1) % bufSize; count--; consumed++ }
        action.event = `Produced ${pItems} | Consumed ${cItems}`
        action.buffer = [...buffer]; action.head = head; action.tail = tail; action.count = count
        action.produced = produced; action.consumed = consumed
        log.push(action)
      }
    }
    const throughput = consumed / steps
    setResult({ log, throughput, totalProduced: produced, totalConsumed: consumed, bufType })
  }

  return (
    <Layout title="I/O Buffering">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Buffer Type</label>
              <select value={bufType} onChange={e => setBufType(e.target.value)} className="w-full">
                <option value="single">Single Buffer</option>
                <option value="double">Double Buffer</option>
                <option value="circular">Circular Buffer</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Buffer Size</label>
                <input type="number" min={1} value={bufSize} onChange={e => setBufSize(parseInt(e.target.value) || 1)} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Steps</label>
                <input type="number" min={1} value={steps} onChange={e => setSteps(parseInt(e.target.value) || 1)} className="w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Prod Rate</label>
                <input type="number" min={1} value={prodRate} onChange={e => setProdRate(parseInt(e.target.value) || 1)} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Cons Rate</label>
                <input type="number" min={1} value={consRate} onChange={e => setConsRate(parseInt(e.target.value) || 1)} className="w-full" />
              </div>
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Simulate</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-bg-card border border-border rounded-xl p-4">
                  <div className="text-[10px] text-text-muted uppercase mb-1">Produced</div>
                  <div className="text-lg font-semibold text-accent">{result.totalProduced}</div>
                </div>
                <div className="bg-bg-card border border-border rounded-xl p-4">
                  <div className="text-[10px] text-text-muted uppercase mb-1">Consumed</div>
                  <div className="text-lg font-semibold text-success">{result.totalConsumed}</div>
                </div>
                <div className="bg-bg-card border border-border rounded-xl p-4">
                  <div className="text-[10px] text-text-muted uppercase mb-1">Throughput</div>
                  <div className="text-lg font-semibold text-text-primary">{result.throughput.toFixed(2)}/step</div>
                </div>
              </div>
              {/* Buffer states */}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Buffer States</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {result.log.map((l, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                      <span className="w-8 text-right text-[10px] text-text-muted font-mono">t={l.time}</span>
                      <div className="flex gap-0.5">
                        {(l.buffer || []).map((slot, si) => (
                          <div key={si} className={`w-8 h-8 rounded text-[8px] flex items-center justify-center font-mono ${slot ? 'bg-accent/20 text-accent' : 'bg-bg-input text-text-muted'}`}>
                            {slot || '·'}
                          </div>
                        ))}
                        {result.bufType === 'double' && l.buf1 && (
                          <>
                            <div className="flex gap-0.5 ml-1">
                              {l.buf1.map((s, si) => <div key={si} className={`w-7 h-8 rounded text-[7px] flex items-center justify-center font-mono ${s ? 'bg-cyan-500/20 text-cyan-400' : 'bg-bg-input text-text-muted'}`}>{s || '·'}</div>)}
                            </div>
                            <span className="text-text-muted text-[9px] mx-1">|</span>
                            <div className="flex gap-0.5">
                              {l.buf2.map((s, si) => <div key={si} className={`w-7 h-8 rounded text-[7px] flex items-center justify-center font-mono ${s ? 'bg-teal-500/20 text-teal-400' : 'bg-bg-input text-text-muted'}`}>{s || '·'}</div>)}
                            </div>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-text-secondary flex-1">{l.event}</span>
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
