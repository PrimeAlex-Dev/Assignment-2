import React from 'react';
import api from '../services/api';

export default function Header({ user, onLogout }) {
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      onLogout();
    }
  };

  const roleName = user?.accountRole === 1 ? 'Quản trị viên (Admin)' : 'Nhân viên (Staff)';
  const badgeClass = user?.accountRole === 1 ? 'bg-danger' : 'bg-success';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 shadow-sm mb-4">
      <div className="container-fluid">
        <span className="navbar-brand fw-bold text-white">
          📰 FUNews Management System
        </span>

        <div className="d-flex align-items-center gap-3">
          <span className="text-light small">
            Xin chào: <strong>{user?.accountName}</strong>{' '}
            <span className={`badge ${badgeClass} ms-1`}>{roleName}</span>
          </span>

          <button
            onClick={handleLogout}
            className="btn btn-outline-light btn-sm"
            title="Đăng xuất khỏi hệ thống"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
}
