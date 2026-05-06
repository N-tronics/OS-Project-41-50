import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const team = [
  {
    name: 'Rohith Kalluraya K',
    github: 'rohithkalluraya',
    modules: ['CPU scheduling','TLB simulator','Inode Structure Viewer'],
    color: '#06b6d4',
    initials: 'RK',
  },
  {
    name: 'Ashwin S',
    github: 'ashwin23761',
    modules: ['System Calls', 'Segmentation'],
    color: '#14b8a6',
    initials: 'AS',
  },
  {
    name: 'Rajsimha',
    github: 'raju-anna',
    modules: ['Disk Scheduling', 'I/O Buffering' ,'Inter-Process Communication'],
    color: '#f59e0b',
    initials: 'RS',
  },
  {
    name: 'Abinaya',
    github: 'abinaya-1106',
    modules: ['Page Replacement', 'TLB Simulator','Memory Fragmentation'],
    color: '#22c55e',
    initials: 'AB',
  },
  {
    name: 'Pranav Shaji',
    github: 'pranavshaji-17',
    modules: ['File Allocation'],
    color: '#a78bfa',
    initials: 'PS',
  },
  {
    name: 'Nischay Bharadwaj',
    github: 'N-tronics',
    modules: ['Process Synchronization', 'Bankers Algorithm','File System Journaling'],
    color: '#fb923c',
    initials: 'NB',
  },
  {
    name: 'Mokshagna',
    github: 'Mokshagna-123',
    modules: ['Contiguous Memory Allocation (MFT)'],
    color: '#f472b6',
    initials: 'MO',
  },
  {
    name: 'Raju Kumar',
    github: 'Raju-Kumar-9',
    modules: ['Deadlock Detection'],
    color: '#ef4444',
    initials: 'RJ',
  },
  {
    name: 'Shivkumar R',
    github: 'Shiv9936A',
    modules: ['MVT Memory Management', 'Semaphore Visualizer'],
    color: '#38bdf8',
    initials: 'SR',
  },
  {
    name: 'Pranav Bansal',
    github: 'pranavbansal1615-source',
    modules: ['File System'],
    color: '#4ade80',
    initials: 'PB',
  },
]

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function MemberCard({ member, index }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.5s ease ${index * 60}ms, transform 0.5s ease ${index * 60}ms`,
      }}
      className="group relative bg-bg-card border border-border rounded-2xl p-6 hover:border-border-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      {/* Glow accent */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${member.color}18 0%, transparent 60%)`,
        }}
      />

      {/* Top row: Avatar + Name */}
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
            <GitHubIcon />
            <span>@{member.github}</span>
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mb-4" />

      {/* Modules */}
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2.5">Built</p>
        <div className="flex flex-col gap-1.5">
          {member.modules.map((mod) => (
            <div key={mod} className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: member.color }}
              />
              <span className="text-xs text-text-secondary">{mod}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MeetTheTeam() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Home</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <h1 className="text-sm font-semibold text-text-primary tracking-wide">Meet the Team</h1>
          <div className="ml-auto">
            <span className="text-xs text-text-muted font-medium tracking-wider uppercase">OS Simulator</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {team.length} Contributors
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
            Meet the Team
          </h1>
          <p className="text-text-secondary text-base max-w-xl mx-auto leading-relaxed">
            The developers behind the OS Simulator — each owning distinct modules of the project.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {team.map((member, i) => (
            <MemberCard key={member.github} member={member} index={i} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-text-muted text-xs">
          <p>OS Simulator · Built collaboratively by 10 engineers</p>
        </div>
      </div>
    </div>
  )
}
