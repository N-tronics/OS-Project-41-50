import { Link } from 'react-router-dom'

export default function ModuleCard({ to, icon, title, description, color = 'accent' }) {
  const colorMap = {
    accent: 'from-accent/10 to-transparent border-accent/20 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]',
    teal: 'from-accent-secondary/10 to-transparent border-accent-secondary/20 hover:border-accent-secondary/40 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)]',
    green: 'from-success/10 to-transparent border-success/20 hover:border-success/40 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]',
    amber: 'from-warning/10 to-transparent border-warning/20 hover:border-warning/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]',
    red: 'from-danger/10 to-transparent border-danger/20 hover:border-danger/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]',
  }

  const iconColorMap = {
    accent: 'text-accent',
    teal: 'text-accent-secondary',
    green: 'text-success',
    amber: 'text-warning',
    red: 'text-danger',
  }

  return (
    <Link
      to={to}
      id={`module-${to.replace('/', '')}`}
      className={`group block rounded-xl border bg-gradient-to-br ${colorMap[color]} bg-bg-card p-5 transition-all duration-300 hover:-translate-y-1`}
    >
      <div className={`text-2xl mb-3 ${iconColorMap[color]} transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1 group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-xs text-text-secondary leading-relaxed">
        {description}
      </p>
    </Link>
  )
}
