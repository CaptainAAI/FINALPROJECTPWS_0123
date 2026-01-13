import React, { useState } from 'react';
import '../styles/Dashboard.css';
import ApiKeyManager from './ApiKeyManager';
import AdminDashboard from './AdminDashboard';
import RecognitionLogs from './RecognitionLogs';
import ApiDocumentation from './ApiDocumentation';

function Dashboard({ user, token, apiBaseUrl, onLogout }) {
  const [activeTab, setActiveTab] = useState('apikeys');

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Face Recognition API</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span>{user?.fullName || user?.username}</span>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'apikeys' ? 'active' : ''}`}
          onClick={() => setActiveTab('apikeys')}
        >
          API Keys
        </button>
        <button 
          className={`nav-tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Recognition Logs
        </button>
        <button 
          className={`nav-tab ${activeTab === 'documentation' ? 'active' : ''}`}
          onClick={() => setActiveTab('documentation')}
        >
          API Documentation
        </button>
        {user?.role === 'admin' && (
          <button 
            className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin
          </button>
        )}
      </nav>

      <div className="dashboard-content">
        {activeTab === 'apikeys' && (
          <ApiKeyManager token={token} apiBaseUrl={apiBaseUrl} />
        )}
        {activeTab === 'logs' && (
          <RecognitionLogs token={token} apiBaseUrl={apiBaseUrl} />
        )}
        {activeTab === 'documentation' && (
          <ApiDocumentation apiBaseUrl={apiBaseUrl} />
        )}
        {activeTab === 'admin' && user?.role === 'admin' && (
          <AdminDashboard token={token} apiBaseUrl={apiBaseUrl} />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
