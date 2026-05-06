import ModuleCard from '../components/ModuleCard'

const team = [
  { name: 'Rohith Kalluraya K', github: 'rohithkalluraya', modules: ['CPU Scheduling', 'Virtual Memory Simulator'], color: '#06b6d4', initials: 'RK' },
  { name: 'Ashwin S', github: 'ashwin23761', modules: ['System Calls', 'Inter-Process Communication'], color: '#14b8a6', initials: 'AS' },
  { name: 'Rajsimha', github: 'raju-anna', modules: ['Disk Scheduling', 'I/O Buffering'], color: '#f59e0b', initials: 'RS' },
  { name: 'Abinaya', github: 'abinaya-nitk', modules: ['Page Replacement', 'TLB Simulator'], color: '#22c55e', initials: 'AB' },
  { name: 'Pranav Shaji', github: 'pranavshaji-17', modules: ['File Allocation', 'File System Journaling'], color: '#a78bfa', initials: 'PS' },
  { name: 'Nischay Bharadwaj', github: 'N-tronics', modules: ['Process Synchronization', 'Semaphore Visualizer'], color: '#fb923c', initials: 'NB' },
  { name: 'Mokshagna', github: 'Mokshagna-123', modules: ['Contiguous Memory Allocation (MFT)', 'Memory Fragmentation'], color: '#f472b6', initials: 'MO' },
  { name: 'Raju Kumar', github: 'Raju-Kumar-9', modules: ['Deadlock Detection', "Banker's Algorithm"], color: '#ef4444', initials: 'RJ' },
  { name: 'Shivkumar R', github: 'Shiv9936A', modules: ['MVT Memory Management', 'Segmentation Visualizer'], color: '#38bdf8', initials: 'SR' },
  { name: 'Pranav Bansal', github: 'pranavbansal1615-source', modules: ['File System', 'Inode Structure Viewer'], color: '#4ade80', initials: 'PB' },
]

const modules = [
  {
    to: '/cpu-scheduling',
    icon: '⚙️',
    title: 'CPU Scheduling',
    description: 'Simulate FCFS, SJF, SRTF, Priority & Round Robin scheduling algorithms with Gantt charts.',
    color: 'accent',
  },
  {
    to: '/virtual-memory',
    icon: '🧠',
    title: 'Virtual Memory',
    description: 'Translate virtual addresses to physical using page tables. Visualize page faults.',
    color: 'teal',
  },
  {
    to: '/system-calls',
    icon: '📞',
    title: 'System Calls',
    description: 'Simulate fork, exec, wait, exit & open system calls with step-by-step execution.',
    color: 'green',
  },
  {
    to: '/ipc',
    icon: '🔗',
    title: 'Inter-Process Communication',
    description: 'Explore pipes, named pipes, shared memory, message queues & sockets for IPC.',
    color: 'red',
  },
  {
    to: '/disk-scheduling',
    icon: '💿',
    title: 'Disk Scheduling',
    description: 'Visualize FCFS, SSTF, SCAN, C-SCAN, LOOK & C-LOOK disk arm movements.',
    color: 'amber',
  },
  {
    to: '/io-buffering',
    icon: '🔄',
    title: 'I/O Buffering',
    description: 'Simulate single, double & circular buffering with producer-consumer dynamics.',
    color: 'accent',
  },
  {
    to: '/page-replacement',
    icon: '📄',
    title: 'Page Replacement',
    description: 'Step through FIFO, LRU, Optimal, MRU & LFU page replacement algorithms.',
    color: 'teal',
  },
  {
    to: '/tlb-simulator',
    icon: '⚡',
    title: 'TLB Simulator',
    description: 'Simulate Translation Lookaside Buffer hits and misses with step-by-step visualization.',
    color: 'green',
  },
  {
    to: '/file-allocation',
    icon: '📁',
    title: 'File Allocation',
    description: 'Compare contiguous, linked & indexed file allocation methods on disk blocks.',
    color: 'amber',
  },
  {
    to: '/file-system-journaling',
    icon: '📝',
    title: 'File System Journaling',
    description: 'Simulate journal log entries, commits & crash recovery for file operations.',
    color: 'red',
  },
  {
    to: '/process-sync',
    icon: '🔒',
    title: 'Process Synchronization',
    description: 'Visualize mutex & spinlock synchronization with race condition detection.',
    color: 'accent',
  },
  {
    to: '/semaphore-visualizer',
    icon: '🚦',
    title: 'Semaphore Visualizer',
    description: 'Track semaphore values and process states through wait/signal operations.',
    color: 'teal',
  },
  {
    to: '/mft-allocation',
    icon: '📦',
    title: 'MFT Allocation',
    description: 'Simulate fixed-partition memory allocation with internal fragmentation analysis.',
    color: 'green',
  },
  {
    to: '/memory-fragmentation',
    icon: '🧩',
    title: 'Memory Fragmentation',
    description: 'Visualize external & internal fragmentation from allocation/deallocation sequences.',
    color: 'amber',
  },
  {
    to: '/deadlock-detection',
    icon: '💀',
    title: 'Deadlock Detection',
    description: 'Build resource allocation graphs and detect cycles indicating deadlocks.',
    color: 'red',
  },
  {
    to: '/bankers-algorithm',
    icon: '🏦',
    title: "Banker's Algorithm",
    description: 'Check safe/unsafe states and find safe sequences using the Banker\'s algorithm.',
    color: 'accent',
  },
  {
    to: '/mvt',
    icon: '📐',
    title: 'MVT',
    description: 'Multiprogramming with Variable Tasks — dynamic partition allocation & fragmentation.',
    color: 'teal',
  },
  {
    to: '/segmentation',
    icon: '🔀',
    title: 'Segmentation',
    description: 'Translate logical addresses using segment tables with violation detection.',
    color: 'green',
  },
  {
    to: '/file-system',
    icon: '🗂️',
    title: 'File System',
    description: 'Interactive file system with mkdir, touch, rm, ls & cd commands.',
    color: 'amber',
  },
  {
    to: '/inode-viewer',
    icon: '🧱',
    title: 'Inode Structure Viewer',
    description: 'Visualize inode metadata, direct & indirect block pointers.',
    color: 'red',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Interactive Simulator
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
            OS Simulator
          </h1>
          <p className="text-text-secondary text-base max-w-2xl mx-auto leading-relaxed">
            Explore operating system concepts through interactive simulations.
            Select a module below to get started.
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <ModuleCard key={mod.to} {...mod} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-text-muted text-xs">
          <p>Built for learning OS internals · {modules.length} modules available</p>
        </div>

        {/* Meet the Team */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              {team.length} Contributors
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">Meet the Team</h2>
            <p className="text-text-secondary text-sm max-w-xl mx-auto leading-relaxed">
              The developers behind the OS Simulator — each owning distinct modules of the project.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {team.map((member) => (
              <div
                key={member.github}
                className="group relative bg-bg-card border border-border rounded-2xl p-6 hover:border-border-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at top left, ${member.color}18 0%, transparent 60%)` }}
                />
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-black shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}99)` }}
                  >
                    {member.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-text-primary text-sm leading-tight truncate">{member.name}</h3>
                    <a
                      href={`https://github.com/${member.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-1 text-xs text-text-muted hover:text-accent transition-colors duration-200"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                      </svg>
                      <span className="truncate">@{member.github}</span>
                    </a>
                  </div>
                </div>
                <div className="h-px bg-border mb-4" />
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2.5">Built</p>
                <div className="flex flex-col gap-1.5">
                  {member.modules.map((mod) => (
                    <div key={mod} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: member.color }} />
                      <span className="text-xs text-text-secondary">{mod}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-text-muted text-xs">
            <p>OS Simulator · Built collaboratively by {team.length} engineers</p>
          </div>
        </div>
      </div>
    </div>
  )
}
