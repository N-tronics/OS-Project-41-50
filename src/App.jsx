import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MeetTheTeam from './pages/MeetTheTeam'
import CpuScheduling from './pages/CpuScheduling'
import VirtualMemory from './pages/VirtualMemory'
import SystemCalls from './pages/SystemCalls'
import Ipc from './pages/Ipc'
import DiskScheduling from './pages/DiskScheduling'
import IoBuffering from './pages/IoBuffering'
import PageReplacement from './pages/PageReplacement'
import TlbSimulator from './pages/TlbSimulator'
import FileAllocation from './pages/FileAllocation'
import FileSystemJournaling from './pages/FileSystemJournaling'
import ProcessSync from './pages/ProcessSync'
import SemaphoreVisualizer from './pages/SemaphoreVisualizer'
import MftAllocation from './pages/MftAllocation'
import MemoryFragmentation from './pages/MemoryFragmentation'
import DeadlockDetection from './pages/DeadlockDetection'
import BankersAlgorithm from './pages/BankersAlgorithm'
import Mvt from './pages/Mvt'
import Segmentation from './pages/Segmentation'
import FileSystemPage from './pages/FileSystem'
import InodeViewer from './pages/InodeViewer'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cpu-scheduling" element={<CpuScheduling />} />
      <Route path="/virtual-memory" element={<VirtualMemory />} />
      <Route path="/system-calls" element={<SystemCalls />} />
      <Route path="/ipc" element={<Ipc />} />
      <Route path="/disk-scheduling" element={<DiskScheduling />} />
      <Route path="/io-buffering" element={<IoBuffering />} />
      <Route path="/page-replacement" element={<PageReplacement />} />
      <Route path="/tlb-simulator" element={<TlbSimulator />} />
      <Route path="/file-allocation" element={<FileAllocation />} />
      <Route path="/file-system-journaling" element={<FileSystemJournaling />} />
      <Route path="/process-sync" element={<ProcessSync />} />
      <Route path="/semaphore-visualizer" element={<SemaphoreVisualizer />} />
      <Route path="/mft-allocation" element={<MftAllocation />} />
      <Route path="/memory-fragmentation" element={<MemoryFragmentation />} />
      <Route path="/deadlock-detection" element={<DeadlockDetection />} />
      <Route path="/bankers-algorithm" element={<BankersAlgorithm />} />
      <Route path="/mvt" element={<Mvt />} />
      <Route path="/segmentation" element={<Segmentation />} />
      <Route path="/file-system" element={<FileSystemPage />} />
      <Route path="/inode-viewer" element={<InodeViewer />} />
      <Route path="/meet-the-team" element={<MeetTheTeam />} />
    </Routes>
  )
}
