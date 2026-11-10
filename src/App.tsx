import { Routes, Route, Navigate } from 'react-router-dom';
import HeaderBar from './components/HeaderBar';
import GroupSelectPage from './pages/GroupSelectPage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import useAuthStore from './stores/authStore';

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-slate-950">
      <HeaderBar />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/" element={user ? <GroupSelectPage /> : <Navigate to="/login" replace />} />
        <Route path="/calendar" element={user ? <CalendarPage /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
    </div>
  );
}

export default App;
