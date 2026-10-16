import { Routes, Route, Navigate } from 'react-router-dom';
import HeaderBar from './components/HeaderBar';
import GroupSelectPage from './pages/GroupSelectPage';
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <HeaderBar />
      <Routes>
        <Route path="/" element={<GroupSelectPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
