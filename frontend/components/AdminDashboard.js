import React, { useEffect, useMemo, useState } from 'react';
import '../styles/Admin.css';

function AdminDashboard({ token, apiBaseUrl }) {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [keys, setKeys] = useState([]);
  const [logs, setLogs] = useState([]);
  const [faces, setFaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const fmt = (d) => (d ? new Date(d).toLocaleString() : '-');
  const maskKey = (k) => (k ? `${k.slice(0,4)}••••••${k.slice(-4)}` : '');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/users`, auth);
      const data = await res.json();
      setUsers(data.users || []);
    } finally { setLoading(false); }
  };
  const loadKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/apikeys`, auth);
      const data = await res.json();
      setKeys(data.keys || []);
    } finally { setLoading(false); }
  };
  const loadFaces = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/faces`, auth);
      const data = await res.json();
      setFaces(data.faces || []);
    } finally { setLoading(false); }
  };
  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/logs?limit=100`, auth);
      const data = await res.json();
      setLogs(data.logs || []);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'keys') loadKeys();
    if (tab === 'faces') loadFaces();
    if (tab === 'logs') loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filteredUsers = useMemo(() => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter(u => `${u.email} ${u.username} ${u.fullName}`.toLowerCase().includes(q));
  }, [users, query]);

  const filteredKeys = useMemo(() => {
    if (!query) return keys;
    const q = query.toLowerCase();
    return keys.filter(k => `${k.id} ${k.userId} ${k.name} ${k.key}`.toLowerCase().includes(q));
  }, [keys, query]);

  const filteredFaces = useMemo(() => {
    if (!query) return faces;
    const q = query.toLowerCase();
    return faces.filter(f => `${f.id} ${f.userId} ${f.name}`.toLowerCase().includes(q));
  }, [faces, query]);

  const filteredLogs = useMemo(() => {
    if (!query) return logs;
    const q = query.toLowerCase();
    return logs.filter(l => `${l.id} ${l.userId} ${l.username || ''} ${l.status}`.toLowerCase().includes(q));
  }, [logs, query]);

  // Role changes removed. Update roles via MySQL directly.

  const revokeKey = async (keyId) => {
    await fetch(`${apiBaseUrl}/admin/apikeys/${keyId}/revoke`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    loadKeys();
  };

  const deleteKey = async (keyId) => {
    await fetch(`${apiBaseUrl}/admin/apikeys/${keyId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    loadKeys();
  };

  const deleteFace = async (faceId) => {
    await fetch(`${apiBaseUrl}/admin/faces/${faceId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    loadFaces();
  };

  return (
    <div className="admin">
      <div className="admin-toolbar">
        <div className="dashboard-nav">
          <button className={`nav-tab ${tab==='users'?'active':''}`} onClick={() => setTab('users')}>Users</button>
          <button className={`nav-tab ${tab==='keys'?'active':''}`} onClick={() => setTab('keys')}>API Keys</button>
          <button className={`nav-tab ${tab==='faces'?'active':''}`} onClick={() => setTab('faces')}>Faces</button>
          <button className={`nav-tab ${tab==='logs'?'active':''}`} onClick={() => setTab('logs')}>Logs</button>
        </div>
        <input className="admin-search" placeholder="Search..." value={query} onChange={(e)=>setQuery(e.target.value)} />
      </div>

      {loading && <p>Loading...</p>}

      {tab==='users' && (
        <div className="card">
          <h2>Users</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Username</th><th>Full Name</th><th>Email</th><th>Role</th><th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{fmt(u.createdAt)}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='keys' && (
        <div className="card">
          <h2>API Keys</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>User</th><th>Name</th><th>Key</th><th>Active</th><th>Usage</th><th>Last Used</th><th>Expires</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.map(k => (
                <tr key={k.id}>
                  <td>{k.id}</td>
                  <td>{k.userId}</td>
                  <td>{k.name}</td>
                  <td className="monospace">{maskKey(k.key)}</td>
                  <td>{String(k.isActive)}</td>
                  <td>{k.usageCount}</td>
                  <td>{fmt(k.lastUsed)}</td>
                  <td>{fmt(k.expiresAt)}</td>
                  <td>{fmt(k.createdAt)}</td>
                  <td>
                    <button onClick={() => revokeKey(k.id)}>Revoke</button>
                    <button onClick={() => deleteKey(k.id)} className="danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='faces' && (
        <div className="card">
          <h2>Faces</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>User</th><th>Name</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaces.map(f => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.userId}</td>
                  <td>{f.name}</td>
                  <td>{fmt(f.createdAt)}</td>
                  <td>
                    <button onClick={() => deleteFace(f.id)} className="danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='logs' && (
        <div className="card">
          <h2>Logs</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>User ID</th><th>Username</th><th>Status</th><th>Matched</th><th>Face ID</th><th>Face Name</th><th>Duration (ms)</th><th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(l => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.userId}</td>
                  <td>{l.username || '-'}</td>
                  <td>{l.status}</td>
                  <td>{l.matchedFaces}</td>
                  <td>{l.matchedFaceId || '-'}</td>
                  <td>{l.matchedFaceName || '-'}</td>
                  <td>{l.duration}</td>
                  <td>{fmt(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;