import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import { API_BASE_URL } from './config';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        logout();
      }
    };

    if (token) {
      setIsLoggedIn(true);
      setCurrentView('dashboard');
      // Verify token is still valid
      fetchUserProfile();
    }
  }, [token]);

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleRegister = () => {
    setCurrentView('login');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView('login');
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <div className="auth-container">
          {currentView === 'login' && (
            <Login 
              apiBaseUrl={API_BASE_URL}
              onLogin={handleLogin}
              onSwitchToRegister={() => setCurrentView('register')}
            />
          )}
          {currentView === 'register' && (
            <Register
              apiBaseUrl={API_BASE_URL}
              onRegister={handleRegister}
              onSwitchToLogin={() => setCurrentView('login')}
            />
          )}
        </div>
      ) : (
        <Dashboard 
          user={user}
          token={token}
          apiBaseUrl={API_BASE_URL}
          onLogout={logout}
        />
      )}
    </div>
  );
}

export default App;
