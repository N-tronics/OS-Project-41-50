import { useState } from 'react'
import Layout from '../components/Layout'

export default function SystemCalls() {
  const [syscall, setSyscall] = useState('fork')
  const [result, setResult] = useState(null)

  const simulate = () => {
    let log = [], tree = []
    const pid = () => Math.floor(Math.random() * 9000) + 1000

    switch (syscall) {
      case 'fork': {
        const parentPid = pid(), childPid = pid()
        log = [
          { step: 1, action: 'Process calls fork()', detail: `Parent PID: ${parentPid}` },
          { step: 2, action: 'Kernel creates child process', detail: `Child PID: ${childPid}` },
          { step: 3, action: 'Copy address space', detail: 'Copy-on-Write (COW) enabled' },
          { step: 4, action: 'fork() returns to parent', detail: `Returns ${childPid} (child PID)` },
          { step: 5, action: 'fork() returns to child', detail: 'Returns 0' },
          { step: 6, action: 'Both processes continue', detail: 'Parent and child execute independently' },
        ]
        tree = [{ pid: parentPid, name: 'Parent', children: [{ pid: childPid, name: 'Child', children: [] }] }]
        break
      }
      case 'exec': {
        const p = pid()
        log = [
          { step: 1, action: 'Process calls exec("/bin/ls")', detail: `PID: ${p}` },
          { step: 2, action: 'Kernel validates executable', detail: 'Check permissions, ELF header' },
          { step: 3, action: 'Deallocate old address space', detail: 'Free text, data, heap, stack' },
          { step: 4, action: 'Load new program', detail: 'Map text & data segments from /bin/ls' },
          { step: 5, action: 'Initialize stack', detail: 'Set up argc, argv, envp' },
          { step: 6, action: 'Set program counter', detail: 'Jump to entry point of /bin/ls' },
        ]
        tree = [{ pid: p, name: 'Process → /bin/ls', children: [] }]
        break
      }
      case 'wait': {
        const pp = pid(), cp = pid()
        log = [
          { step: 1, action: 'Parent calls wait()', detail: `Parent PID: ${pp}` },
          { step: 2, action: 'Kernel checks children', detail: `Child PID: ${cp} found` },
          { step: 3, action: 'Parent blocked', detail: 'State: RUNNING → WAITING' },
          { step: 4, action: 'Child executes', detail: `Child ${cp} runs to completion` },
          { step: 5, action: 'Child exits', detail: 'exit(0) called, becomes zombie' },
          { step: 6, action: 'Parent wakes up', detail: `wait() returns ${cp}, status: 0` },
          { step: 7, action: 'Child reaped', detail: 'Zombie entry removed from process table' },
        ]
        tree = [{ pid: pp, name: 'Parent (waiting)', children: [{ pid: cp, name: 'Child (exited)', children: [] }] }]
        break
      }
      case 'exit': {
        const p = pid(), pp = pid()
        log = [
          { step: 1, action: 'Process calls exit(0)', detail: `PID: ${p}` },
          { step: 2, action: 'Close all open files', detail: 'Release file descriptors' },
          { step: 3, action: 'Deallocate memory', detail: 'Free text, data, heap, stack segments' },
          { step: 4, action: 'Send SIGCHLD to parent', detail: `Notify parent PID: ${pp}` },
          { step: 5, action: 'Save exit status', detail: 'Status 0 stored in PCB' },
          { step: 6, action: 'Process becomes zombie', detail: 'Awaiting parent wait() call' },
          { step: 7, action: 'Parent reaps child', detail: 'PCB entry removed, resources freed' },
        ]
        tree = [{ pid: pp, name: 'Parent', children: [{ pid: p, name: 'Child (zombie → reaped)', children: [] }] }]
        break
      }
      case 'open': {
        const p = pid()
        log = [
          { step: 1, action: 'Process calls open("/etc/config", O_RDONLY)', detail: `PID: ${p}` },
          { step: 2, action: 'Kernel resolves path', detail: 'Traverse directory tree: / → etc → config' },
          { step: 3, action: 'Check permissions', detail: 'Verify read access for user' },
          { step: 4, action: 'Allocate file descriptor', detail: 'fd = 3 (next available)' },
          { step: 5, action: 'Create file table entry', detail: 'Offset: 0, Flags: O_RDONLY, Inode ref' },
          { step: 6, action: 'Return fd to process', detail: 'open() returns 3' },
        ]
        tree = [{ pid: p, name: `Process (fd=3 → /etc/config)`, children: [] }]
        break
      }
    }
    setResult({ log, tree, syscall })
  }

  const renderTree = (nodes, depth = 0) => nodes.map((n, i) => (
    <div key={i}>
      <div className="flex items-center gap-2 py-1" style={{ paddingLeft: depth * 24 }}>
        {depth > 0 && <span className="text-text-muted">└─</span>}
        <div className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
          <span className="text-xs font-mono text-accent">{n.pid}</span>
          <span className="text-xs text-text-secondary ml-2">{n.name}</span>
        </div>
      </div>
      {n.children && renderTree(n.children, depth + 1)}
    </div>
  ))

  return (
    <Layout title="System Calls">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Select System Call</h2>
            <div className="space-y-2">
              {[
                { value: 'fork', label: 'fork()', desc: 'Create child process' },
                { value: 'exec', label: 'exec()', desc: 'Replace process image' },
                { value: 'wait', label: 'wait()', desc: 'Wait for child termination' },
                { value: 'exit', label: 'exit()', desc: 'Terminate process' },
                { value: 'open', label: 'open()', desc: 'Open a file descriptor' },
              ].map(s => (
                <button key={s.value} onClick={() => setSyscall(s.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${syscall === s.value ? 'border-accent/40 bg-accent/10' : 'border-border bg-bg-input hover:border-border-hover'}`}>
                  <div className="text-xs font-mono font-semibold text-text-primary">{s.label}</div>
                  <div className="text-[10px] text-text-muted">{s.desc}</div>
                </button>
              ))}
            </div>
            <button onClick={simulate} className="w-full py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90">Simulate</button>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-4">Execution Steps</h2>
                <div className="space-y-2">
                  {result.log.map((l, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] text-accent font-semibold">{l.step}</span>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-text-primary">{l.action}</div>
                        <div className="text-[10px] text-text-muted">{l.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-3">Process Tree</h2>
                {renderTree(result.tree)}
              </div>
            </>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Select a system call and click Simulate.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
