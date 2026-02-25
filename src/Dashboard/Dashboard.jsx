import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

const COLUMNS = [
  { key: 'id',    label: 'ID' },
  { key: 'email', label: 'Email' },
  { key: 'role',  label: 'Role' },
];
const PAGE_SIZE = 10;

export default function Dashboard() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [filterText, setFilterText] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortKey, setSortKey]     = useState('email');
  const [sortDir, setSortDir]     = useState('asc');
  const [page, setPage]           = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) setError(error.message);
      else setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const sortIcon = (key) => {
    if (sortKey !== key) return <span className="sort-icon inactive">↕</span>;
    return <span className="sort-icon">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const processed = useMemo(() => {
    let list = [...users];

    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      list = list.filter(
        (u) =>
          u.id?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q),
      );
    }

    if (filterRole !== 'all') {
      list = list.filter((u) => (u.role || 'user') === filterRole);
    }

    list.sort((a, b) => {
      const valA = (a[sortKey] ?? '').toString().toLowerCase();
      const valB = (b[sortKey] ?? '').toString().toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [users, filterText, filterRole, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages - 1);
  const paginated  = processed.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  if (loading) return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <p className="dashboard-loading">Loading users...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <p className="dashboard-error">Error: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="dashboard-page">
    <div className="dashboard-card">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <button className="back-btn" onClick={() => navigate('/app')}>← Back to App</button>
      </div>
      <p className="dashboard-subtitle">All registered application users.</p>

      {/* Filters */}
      <div className="dashboard-filters">
        <input
          className="filter-input"
          type="text"
          placeholder="Search by ID or email…"
          value={filterText}
          onChange={(e) => { setFilterText(e.target.value); setPage(0); }}
        />
        <div className="role-toggle-group">
          {['all', 'admin', 'user'].map((r) => (
            <button
              key={r}
              className={`role-toggle-btn${filterRole === r ? ' active' : ''}`}
              onClick={() => { setFilterRole(r); setPage(0); }}
            >
              {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        <span className="filter-count">{processed.length} / {users.length}</span>
      </div>
      
      <div className="table-responsive">
        <table className="users-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="sortable-th"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label} {sortIcon(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((user) => (
              <tr key={user.id}>
                <td className="td-id" data-label="ID">{user.id}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Role">
                  <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                    {user.role || 'user'}
                  </span>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan="3" className="no-users">No users match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setPage(0)}
            disabled={safePage === 0}
            title="First page"
          >«</button>
          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            title="Previous page"
          >‹</button>

          {Array.from({ length: totalPages }, (_, i) => i)
            .filter((i) => Math.abs(i - safePage) <= 2)
            .map((i) => (
              <button
                key={i}
                className={`page-btn${i === safePage ? ' active' : ''}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}

          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
            title="Next page"
          >›</button>
          <button
            className="page-btn"
            onClick={() => setPage(totalPages - 1)}
            disabled={safePage === totalPages - 1}
            title="Last page"
          >»</button>
        </div>
      )}
    </div>
    </div>
  );
}
