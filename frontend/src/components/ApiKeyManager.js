import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ApiKeyManager.css';

function ApiKeyManager({ token, apiBaseUrl }) {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');

  useEffect(() => {
    fetchApiKeys();
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  
  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/apikeys`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApiKeys(response.data.apiKeys);
      setError('');
    } catch (err) {
      setError('Failed to fetch API keys');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiBaseUrl}/apikeys/generate`,
        { name: keyName || 'New API Key' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newKey = response.data.apiKey.key;
      setGeneratedKey(newKey);
      setShowKeyModal(true);
      setKeyName('');
      setShowGenerateForm(false);
      fetchApiKeys();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate API key');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      try {
        await axios.delete(`${apiBaseUrl}/apikeys/${keyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchApiKeys();
      } catch (err) {
        setError('Failed to delete API key');
      }
    }
  };

  const handleRevokeKey = async (keyId) => {
    try {
      await axios.patch(`${apiBaseUrl}/apikeys/${keyId}/revoke`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchApiKeys();
    } catch (err) {
      setError('Failed to revoke API key');
    }
  };

  const handleActivateKey = async (keyId) => {
    try {
      await axios.patch(`${apiBaseUrl}/apikeys/${keyId}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchApiKeys();
    } catch (err) {
      setError('Failed to activate API key');
    }
  };

  const handleCopyGenerated = async () => {
    if (!generatedKey) return;
    try {
      await navigator.clipboard.writeText(generatedKey);
      alert('API key copied to clipboard. Store it securely.');
    } catch (err) {
      console.error(err);
      alert(`Copy failed. Copy manually:\n${generatedKey}`);
    }
  };

  return (
    <div className="apikey-manager">
      <div className="manager-header">
        <h2>API Keys</h2>
        <button 
          className="generate-btn"
          onClick={() => setShowGenerateForm(!showGenerateForm)}
        >
          Generate New Key
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showGenerateForm && (
        <form className="generate-form" onSubmit={handleGenerateKey}>
          <input
            type="text"
            placeholder="Key name (optional)"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
          />
          <div className="form-buttons">
            <button type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowGenerateForm(false)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && apiKeys.length === 0 ? (
        <p>Loading API keys...</p>
      ) : apiKeys.length === 0 ? (
        <p>No API keys yet. Generate one to get started!</p>
      ) : (
        <div className="keys-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last Used</th>
                <th>Usage Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key) => (
                <tr key={key.id}>
                  <td>{key.name}</td>
                  <td>
                    <span className={`status ${key.isActive ? 'active' : 'inactive'}`}>
                      {key.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(key.createdAt).toLocaleDateString()}</td>
                  <td>{key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}</td>
                  <td>{key.usageCount}</td>
                  <td className="actions">
                    {key.isActive ? (
                      <button 
                        className="revoke-btn"
                        onClick={() => handleRevokeKey(key.id)}
                      >
                        Revoke
                      </button>
                    ) : (
                      <button 
                        className="revoke-btn"
                        onClick={() => handleActivateKey(key.id)}
                      >
                        Activate
                      </button>
                    )}
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showKeyModal && (
        <div className="modal-overlay">
          <div className="modal card">
            <h2 className="modal-title">My API key</h2>
            <p className="modal-sub">
              Use this key in your application by passing it with the <span className="code-chip">key=API_KEY</span> parameter.
            </p>
            <div className="modal-label">Your API key</div>
            <div className="key-field">
              <input type="text" value={generatedKey} readOnly />
              <button className="icon-btn" onClick={handleCopyGenerated} aria-label="Copy API key">
                <span className="icon-clipboard" aria-hidden="true">📋</span>
              </button>
            </div>
            <div className="modal-actions">
              <button onClick={() => { setShowKeyModal(false); setGeneratedKey(''); }} className="close-btn">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApiKeyManager;
