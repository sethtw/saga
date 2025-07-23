import { Routes, Route } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import ProjectDashboard from './pages/ProjectDashboard';
import SettingsView from './pages/SettingsView';
import MapCanvas from './pages/MapCanvas';
import './index.css';
import { Toaster } from 'sonner';
import { useTheme } from './hooks/useTheme';

function App() {
  const [theme] = useTheme();
  return (
    <div
      style={{
        backgroundColor: theme.primary,
        color: theme.text,
      }}
    >
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
