import { Link } from 'react-router-dom'

export default function Layout({ title, children }) {
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
          {title && (
            <>
              <div className="w-px h-5 bg-border" />
              <h1 className="text-sm font-semibold text-text-primary tracking-wide">{title}</h1>
            </>
          )}
          <div className="ml-auto">
            <span className="text-xs text-text-muted font-medium tracking-wider uppercase">OS Simulator</span>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
