import { useState } from 'react'
import Layout from '../components/Layout'

export default function Ipc() {
  const [method, setMethod] = useState('pipe')
  const [result, setResult] = useState(null)

  const simulate = () => {
    let log = [], diagram = []
    const pid = () => Math.floor(Math.random() * 9000) + 1000

    switch (method) {
      case 'pipe': {
        const pp = pid(), cp = pid()
        log = [
          { step: 1, action: 'Process calls pipe(fd[2])', detail: 'Creates fd[0]=read end, fd[1]=write end' },
          { step: 2, action: 'fork() creates child', detail: `Parent: ${pp}, Child: ${cp}` },
          { step: 3, action: 'Parent closes fd[0]', detail: 'Parent will only write to pipe' },
          { step: 4, action: 'Child closes fd[1]', detail: 'Child will only read from pipe' },
          { step: 5, action: 'Parent writes to pipe', detail: 'write(fd[1], "Hello from parent", 17)' },
          { step: 6, action: 'Data enters kernel buffer', detail: 'Pipe buffer (64KB max) stores data' },
          { step: 7, action: 'Child reads from pipe', detail: 'read(fd[0], buf, 17) → "Hello from parent"' },
          { step: 8, action: 'Communication complete', detail: 'Unidirectional data transfer successful' },
        ]
        diagram = [
          { from: `Parent (${pp})`, to: 'Pipe Buffer', label: 'write(fd[1])' },
          { from: 'Pipe Buffer', to: `Child (${cp})`, label: 'read(fd[0])' },
        ]
        break
      }
      case 'named_pipe': {
        const p1 = pid(), p2 = pid()
        log = [
          { step: 1, action: 'mkfifo("/tmp/myfifo", 0666)', detail: 'Create named pipe in filesystem' },
          { step: 2, action: 'P1 opens FIFO for writing', detail: `PID ${p1}: open("/tmp/myfifo", O_WRONLY)` },
          { step: 3, action: 'P2 opens FIFO for reading', detail: `PID ${p2}: open("/tmp/myfifo", O_RDONLY)` },
          { step: 4, action: 'P1 writes message', detail: 'write(fd, "IPC via named pipe", 18)' },
          { step: 5, action: 'P2 reads message', detail: 'read(fd, buf, 18) → "IPC via named pipe"' },
          { step: 6, action: 'Bidirectional possible', detail: 'Unrelated processes can communicate' },
        ]
        diagram = [
          { from: `P1 Writer (${p1})`, to: '/tmp/myfifo', label: 'write()' },
          { from: '/tmp/myfifo', to: `P2 Reader (${p2})`, label: 'read()' },
        ]
        break
      }
      case 'shm': {
        const p1 = pid(), p2 = pid()
        log = [
          { step: 1, action: 'P1 calls shmget(key=1234, 4096, IPC_CREAT)', detail: 'Create shared memory segment' },
          { step: 2, action: 'Kernel allocates 4096 bytes', detail: 'Segment ID assigned by kernel' },
          { step: 3, action: 'P1 calls shmat(shmid, NULL, 0)', detail: `Map segment into P1's virtual address space` },
          { step: 4, action: 'P2 calls shmget(key=1234, 4096, 0)', detail: 'Attach to existing segment using same key' },
          { step: 5, action: 'P2 calls shmat(shmid, NULL, 0)', detail: `Map segment into P2's virtual address space` },
          { step: 6, action: 'P1 writes: strcpy(ptr, "Shared Data")', detail: 'Data written directly to shared region' },
          { step: 7, action: 'P2 reads: printf("%s", ptr)', detail: 'Reads "Shared Data" — zero-copy, fastest IPC' },
          { step: 8, action: 'Cleanup: shmdt() + shmctl(IPC_RMID)', detail: 'Detach and remove segment' },
        ]
        diagram = [
          { from: `P1 (${p1})`, to: 'Shared Memory (4KB)', label: 'shmat + write' },
          { from: 'Shared Memory (4KB)', to: `P2 (${p2})`, label: 'shmat + read' },
        ]
        break
      }
      case 'msgq': {
        const p1 = pid(), p2 = pid()
        log = [
          { step: 1, action: 'msgget(key, IPC_CREAT | 0666)', detail: 'Create message queue' },
          { step: 2, action: 'P1 prepares message', detail: 'struct { long mtype=1; char mtext[]="Hello" }' },
          { step: 3, action: 'P1 calls msgsnd()', detail: `PID ${p1} sends message type 1` },
          { step: 4, action: 'Message stored in kernel', detail: 'Kernel maintains linked list of messages' },
          { step: 5, action: 'P2 calls msgrcv(msqid, &msg, size, 1, 0)', detail: `PID ${p2} receives message type 1` },
          { step: 6, action: 'Message delivered', detail: 'P2 reads: "Hello" — typed message passing' },
        ]
        diagram = [
          { from: `Sender P1 (${p1})`, to: 'Message Queue', label: 'msgsnd()' },
          { from: 'Message Queue', to: `Receiver P2 (${p2})`, label: 'msgrcv()' },
        ]
        break
      }
      case 'socket': {
        const server = pid(), client = pid()
        log = [
          { step: 1, action: 'Server: socket(AF_INET, SOCK_STREAM, 0)', detail: `PID ${server} creates TCP socket` },
          { step: 2, action: 'Server: bind(sockfd, addr, port=8080)', detail: 'Bind to localhost:8080' },
          { step: 3, action: 'Server: listen(sockfd, 5)', detail: 'Mark socket as passive, backlog=5' },
          { step: 4, action: 'Client: socket() + connect()', detail: `PID ${client} connects to localhost:8080` },
          { step: 5, action: 'Server: accept()', detail: 'Accept connection, create new fd for client' },
          { step: 6, action: 'Client: send("Request data")', detail: 'Send data over established connection' },
          { step: 7, action: 'Server: recv() → "Request data"', detail: 'Receive and process client request' },
          { step: 8, action: 'Server: send("Response")', detail: 'Send response back to client' },
        ]
        diagram = [
          { from: `Client (${client})`, to: 'TCP Socket :8080', label: 'connect + send' },
          { from: 'TCP Socket :8080', to: `Server (${server})`, label: 'accept + recv' },
        ]
        break
      }
    }
    setResult({ log, diagram, method })
  }

  return (
    <Layout title="Inter-Process Communication">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Select IPC Method</h2>
            <div className="space-y-2">
              {[
                { value: 'pipe', label: 'Pipe', desc: 'Unidirectional, related processes' },
                { value: 'named_pipe', label: 'Named Pipe (FIFO)', desc: 'Filesystem-based, unrelated processes' },
                { value: 'shm', label: 'Shared Memory', desc: 'Fastest IPC, zero-copy' },
                { value: 'msgq', label: 'Message Queue', desc: 'Typed message passing' },
                { value: 'socket', label: 'Socket', desc: 'Network-capable, bidirectional' },
              ].map(s => (
                <button key={s.value} onClick={() => setMethod(s.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${method === s.value ? 'border-accent/40 bg-accent/10' : 'border-border bg-bg-input hover:border-border-hover'}`}>
                  <div className="text-xs font-semibold text-text-primary">{s.label}</div>
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
              {/* Communication Diagram */}
              <div className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-4">Communication Flow</h2>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {result.diagram.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="px-3 py-2 rounded-lg bg-accent/10 border border-accent/20">
                        <span className="text-xs font-mono text-accent">{d.from}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-text-muted">{d.label}</span>
                        <svg className="w-8 h-3 text-accent" viewBox="0 0 32 12"><path d="M0 6h24M24 6l-4-4M24 6l-4 4" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
                      </div>
                      <div className="px-3 py-2 rounded-lg bg-accent-secondary/10 border border-accent-secondary/20">
                        <span className="text-xs font-mono text-accent-secondary">{d.to}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Steps */}
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
            </>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
              <p className="text-text-muted text-sm">Select an IPC method and click Simulate.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
