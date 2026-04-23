import LoginForm from './pages/Login/login'
import Join from './pages/JoinClass/join'
import Dashboard from './pages/HomePage/dashboard'
import AdminDashboard from './pages/HomePage/Admindashboard'
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from './config/config'
import type { User } from './types/types'

function App() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

 const checkAuth = async () => {
    try {
      const res = await fetch(`${api}/authtest`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    checkAuth();
  }, [])

  if (loading) return <div>Checking session...</div>;
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/Scheduler"
          element={!user ? <LoginForm onLoginSuccess={checkAuth} /> : <Navigate to="/Scheduler/join" />}
        />

        <Route
          path="/Scheduler/join"
          element={user ? <Join user={user} onLogoutSuccess={checkAuth}/> : <Navigate to="/Scheduler" />}
        />
      </Routes>
    </BrowserRouter>

  );
}

export default App;