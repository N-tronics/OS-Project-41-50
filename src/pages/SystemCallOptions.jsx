import ModuleCard from '../components/ModuleCard'
import Layout from '../components/Layout'

const systemCallOptions = [
  {
    to: '/system-calls/process-management',
    icon: 'PM',
    title: 'Process Management',
    description: 'Open process-related system calls such as fork, exec, wait, and exit.',
    color: 'accent',
  },
  {
    to: '/system-calls/memory-management',
    icon: 'MM',
    title: 'Memory Management',
    description: 'Open memory-related system calls such as brk, mmap, munmap, and mprotect.',
    color: 'green',
  },
  {
    to: '/system-calls/network-call',
    icon: 'NC',
    title: 'Network Call',
    description: 'Open network-related system calls such as socket, bind, listen, and connect.',
    color: 'teal',
  },
]

export default function SystemCallOptions() {
  return (
    <Layout title="System Calls">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">System Call Categories</h2>
        <p className="text-text-secondary max-w-2xl">
          Choose a category to open its simulator page.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemCallOptions.map((option) => (
          <ModuleCard key={option.to} {...option} />
        ))}
      </div>
    </Layout>
  )
}
