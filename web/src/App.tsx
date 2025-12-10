// web/src/App.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Navbar from './components/Common/Navbar';
import CoordinatorPage from './pages/CoordinatorPage';
import InformerPage from './pages/InformerPage';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register'; // ← добавлен импорт

// Используем глобальный api из services/api.ts
import api from './services/api';

// Тип пользователя
interface User {
  id: string;
  role: 'coordinator' | 'informer' | 'applicant' | 'rescuer' | 'senior_on_site' | 'group_leader';
  name: string;
}

// Защита маршрутов: только для авторизованных с нужной ролью
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  isAuthenticated: boolean; 
  userRole: string | null;
  allowedRoles: string[];
}> = ({ children, isAuthenticated, userRole, allowedRoles }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Защита маршрута логина: только для неавторизованных
const GuestRoute: React.FC<{ 
  children: React.ReactNode; 
  isAuthenticated: boolean;
}> = ({ children, isAuthenticated }) => {
  if (isAuthenticated) {
    // Используем userRoleMap внутри компонента (вне JSX!)
    const role = localStorage.getItem('role');
    if (role === 'coordinator') {
      return <Navigate to="/coordinator" replace />;
    }
    if (role === 'informer') {
      return <Navigate to="/informer" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Проверка токена при старте
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<User>('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setIsAuthenticated(true);
        setUserRole(response.data.role);
      } catch (error) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  const handleLogin = async (token: string) => {
    localStorage.setItem('token', token);
    try {
      const response = await api.get<User>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAuthenticated(true);
      setUserRole(response.data.role);
    } catch (error) {
      localStorage.removeItem('token');
      alert('Authentication failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isAuthenticated && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute isAuthenticated={isAuthenticated}>
              <Login onLogin={handleLogin} />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute isAuthenticated={isAuthenticated}>
              <Register onRegister={handleLogin} />
            </GuestRoute>
          }
        />
        <Route
          path="/coordinator"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              userRole={userRole} 
              allowedRoles={['coordinator']}
            >
              <CoordinatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/informer"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              userRole={userRole} 
              allowedRoles={['informer']}
            >
              <InformerPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;