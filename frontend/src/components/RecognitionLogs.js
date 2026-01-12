import React, { useEffect, useMemo, useState } from 'react';

function RecognitionLogs({ token, apiBaseUrl }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const fmt = (d) => (d ? new Date(d).toLocaleString() : '-');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/recognition/logs?limit=${pageSize}&skip=${page * pageSize}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error('Failed to load logs', e);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadLogs(); /* eslint-disable-next-line */ }, [page]);

  const filtered = useMemo(() => {
    if (!query) return logs;
    const q = query.toLowerCase();
    return logs.filter(l => `${l.id} ${l.status} ${l.errorMessage || ''}`.toLowerCase().includes(q));
  }, [logs, query]);

  const totalPages = Math.ceil((total || 0) / pageSize);

  return (
    <div className="logs-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Recognition Logs</h2>
        <input
          placeholder="Search status/error..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
        />
      </div>
      {loading ? <p>Loading...</p> : (
        <div>
          <table className="admin-table" style={{ width: '100%', background: 'white' }}>
            <thead>
              <tr>
                <th>ID</th><th>Status</th><th>Matched</th><th>Face ID</th><th>Face Name</th><th>Duration (ms)</th><th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td>{l.id}</td>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            <span>Total: {total}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button disabled={page===0} onClick={() => setPage(p => Math.max(0, p-1))}>Prev</button>
              <span>Page {page+1} / {Math.max(1,totalPages)}</span>
              <button disabled={page+1>=totalPages} onClick={() => setPage(p => p+1)}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecognitionLogs;