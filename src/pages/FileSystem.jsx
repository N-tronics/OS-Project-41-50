import { useState } from 'react'
import Layout from '../components/Layout'

const initFS = () => ({ name: '/', type: 'dir', children: [], parent: null })

function findNode(root, pathParts) {
  let node = root
  for (const part of pathParts) {
    if (part === '' || part === '.') continue
    if (part === '..') { node = node.parent || root; continue }
    const child = node.children?.find(c => c.name === part)
    if (!child) return null
    node = child
  }
  return node
}

export default function FileSystemPage() {
  const [fs, setFs] = useState(initFS())
  const [cwd, setCwd] = useState('/')
  const [cmd, setCmd] = useState('')
  const [output, setOutput] = useState([{ text: 'Welcome to the File System Simulator. Type "help" for commands.', type: 'info' }])

  const getAbsPath = (path) => {
    if (path.startsWith('/')) return path
    const base = cwd === '/' ? '' : cwd
    return `${base}/${path}`.replace(/\/+/g, '/')
  }

  const execCmd = () => {
    const parts = cmd.trim().split(/\s+/)
    const command = parts[0]
    const arg = parts.slice(1).join(' ')
    const newOutput = [...output, { text: `${cwd}$ ${cmd}`, type: 'cmd' }]
    const newFs = JSON.parse(JSON.stringify(fs))

    // Rebuild parent refs
    const rebuildParents = (node, parent) => {
      node.parent = parent
      node.children?.forEach(c => rebuildParents(c, node))
    }
    rebuildParents(newFs, null)

    const cwdParts = cwd.split('/').filter(Boolean)
    const cwdNode = findNode(newFs, cwdParts)

    switch (command) {
      case 'help':
        newOutput.push({ text: 'Commands: mkdir <name>, touch <name>, ls, cd <path>, rm <name>, pwd, clear', type: 'info' })
        break
      case 'mkdir': {
        if (!arg) { newOutput.push({ text: 'Usage: mkdir <name>', type: 'error' }); break }
        if (cwdNode.children.find(c => c.name === arg)) { newOutput.push({ text: `Directory "${arg}" already exists`, type: 'error' }); break }
        cwdNode.children.push({ name: arg, type: 'dir', children: [], parent: cwdNode })
        newOutput.push({ text: `Created directory: ${arg}`, type: 'success' })
        break
      }
      case 'touch': {
        if (!arg) { newOutput.push({ text: 'Usage: touch <name>', type: 'error' }); break }
        if (cwdNode.children.find(c => c.name === arg)) { newOutput.push({ text: `File "${arg}" already exists`, type: 'error' }); break }
        cwdNode.children.push({ name: arg, type: 'file', size: Math.floor(Math.random() * 1000) + 1 })
        newOutput.push({ text: `Created file: ${arg}`, type: 'success' })
        break
      }
      case 'ls': {
        if (cwdNode.children.length === 0) { newOutput.push({ text: '(empty)', type: 'info' }); break }
        const listing = cwdNode.children.map(c => c.type === 'dir' ? `📁 ${c.name}/` : `📄 ${c.name} (${c.size}B)`).join('\n')
        newOutput.push({ text: listing, type: 'info' })
        break
      }
      case 'cd': {
        if (!arg || arg === '/') { setCwd('/'); newOutput.push({ text: '/', type: 'info' }); break }
        if (arg === '..') {
          const parts = cwd.split('/').filter(Boolean)
          parts.pop()
          setCwd(parts.length ? '/' + parts.join('/') : '/')
          break
        }
        const target = cwdNode.children.find(c => c.name === arg && c.type === 'dir')
        if (!target) { newOutput.push({ text: `cd: no such directory: ${arg}`, type: 'error' }); break }
        setCwd(getAbsPath(arg))
        break
      }
      case 'rm': {
        if (!arg) { newOutput.push({ text: 'Usage: rm <name>', type: 'error' }); break }
        const idx = cwdNode.children.findIndex(c => c.name === arg)
        if (idx === -1) { newOutput.push({ text: `rm: no such file or directory: ${arg}`, type: 'error' }); break }
        cwdNode.children.splice(idx, 1)
        newOutput.push({ text: `Removed: ${arg}`, type: 'success' })
        break
      }
      case 'pwd':
        newOutput.push({ text: cwd, type: 'info' })
        break
      case 'clear':
        setOutput([])
        setCmd('')
        return
      default:
        newOutput.push({ text: `Unknown command: ${command}. Type "help" for available commands.`, type: 'error' })
    }
    // Remove circular parent refs before setState
    const clean = (node) => { delete node.parent; node.children?.forEach(clean); return node }
    setFs(clean(newFs))
    setOutput(newOutput)
    setCmd('')
  }

  const renderTree = (node, depth = 0) => {
    const items = []
    items.push(
      <div key={node.name + depth} className="flex items-center gap-1" style={{ paddingLeft: depth * 16 }}>
        <span className="text-xs">{node.type === 'dir' ? '📁' : '📄'}</span>
        <span className={`text-xs ${node.type === 'dir' ? 'text-accent' : 'text-text-secondary'}`}>{node.name}{node.type === 'dir' ? '/' : ''}</span>
      </div>
    )
    node.children?.forEach(c => items.push(...renderTree(c, depth + 1)))
    return items
  }

  return (
    <Layout title="File System">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Directory Tree</h2>
            <div className="space-y-0.5 max-h-96 overflow-y-auto">
              {renderTree(fs)}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-bg-input px-4 py-2 border-b border-border flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-danger/50" />
                <div className="w-3 h-3 rounded-full bg-warning/50" />
                <div className="w-3 h-3 rounded-full bg-success/50" />
              </div>
              <span className="text-xs text-text-muted ml-2">Terminal</span>
            </div>
            <div className="p-4 h-96 overflow-y-auto font-mono text-xs space-y-1">
              {output.map((line, i) => (
                <div key={i} className={
                  line.type === 'cmd' ? 'text-accent' :
                  line.type === 'error' ? 'text-danger' :
                  line.type === 'success' ? 'text-success' : 'text-text-secondary'
                } style={{ whiteSpace: 'pre-wrap' }}>{line.text}</div>
              ))}
            </div>
            <div className="border-t border-border px-4 py-3 flex items-center gap-2">
              <span className="text-xs text-accent font-mono">{cwd}$</span>
              <input
                value={cmd}
                onChange={e => setCmd(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && cmd.trim() && execCmd()}
                className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-text-primary"
                placeholder="Type a command..."
                autoFocus
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
