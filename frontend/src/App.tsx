import { Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import ProjectDashboard from './pages/ProjectDashboard';
import SettingsView from './pages/SettingsView';
import MapCanvas from './pages/MapCanvas';
import './index.css';
import { Toaster } from 'sonner';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <Routes>
        <Route path="/" element={<ProjectDashboard />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="/campaign/:campaignId" element={
          <ReactFlowProvider>
            <MapCanvas />
          </ReactFlowProvider>
        } />
      </Routes>
    </div>
  );
}

export default App;
