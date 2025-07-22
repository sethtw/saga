import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectDashboard from './pages/ProjectDashboard';
import SettingsView from './pages/SettingsView';
import MapCanvas from './pages/MapCanvas';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectDashboard />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="/campaign/:campaignId" element={<MapCanvas />} />
      </Routes>
    </Router>
  );
}

export default App;
