import LoginForm from './pages/Login/login'
import Join from './pages/JoinClass/join'
import Dashboard from './pages/HomePage/dashboard'
import AdminDashboard from './pages/HomePage/Admindashboard'
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { userRoute } from './config/config'
import type { User } from './types/types'

function App() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

 const checkAuth = async () => {
    try {
      const res = await fetch(`${userRoute}/authorize`, {
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
          element={!user ? <LoginForm onLoginSuccess={checkAuth} /> : 
          (!user.section) ? <Navigate to="/Scheduler/join" /> : <Navigate to={"/Scheduler/class"}/>}
        />

        <Route
          path="/Scheduler/join"
          element={user && !user.section ? <Join user={user} authUser={checkAuth} /> :user && user.section ? <Navigate to={"/Scheduler/class"}/>:<Navigate to="/Scheduler" />}
        />
        <Route
        path='/Scheduler/class'
        element={user && user.section ? <Dashboard user={user} onLogoutSuccess={checkAuth}/> : <Navigate to={"/Scheduler/join"}/>}
        />
      </Routes>
    </BrowserRouter>

  );
}

export default App;