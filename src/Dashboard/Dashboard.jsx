import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')

      if (error) {
        setError(error.message);
      } else {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

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
      
      <div className="table-responsive">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User email</th>
              <th>Role</th>
              
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                    {user.role || 'user'}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="3" className="no-users">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
