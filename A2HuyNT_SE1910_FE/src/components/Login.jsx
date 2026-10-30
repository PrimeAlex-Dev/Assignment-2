import React, { useState } from 'react';
import api from '../services/api';

export default function Login({ onLoginSuccess, onNavigateToPublic }) {
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        accountEmail: accountEmail.trim(),
        accountPassword: accountPassword,
      });

      const { accessToken, accountId, accountName, accountEmail: email, accountRole } = response.data;

      // Lưu Token và User Info vào localStorage
      localStorage.setItem('token', accessToken);
      const user = { accountId, accountName, accountEmail: email, accountRole };
      localStorage.setItem('user', JSON.stringify(user));

      // Thông báo cho component cha cập nhật state
      onLoginSuccess(user);
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Đăng nhập thất bại. Vui lòng kiểm tra lại kết nối!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none p-0"
                  onClick={onNavigateToPublic}
                >
                  ← Trang tin tức
                </button>
              </div>

              <h3 className="card-title text-center mb-1 text-primary fw-bold">
                FUNews System
              </h3>
              <p className="text-center text-muted small mb-4">
                Đăng nhập hệ thống quản lý tin tức
              </p>

              {errorMessage && (
                <div className="alert alert-danger py-2 small" role="alert">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email tài khoản</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="ví dụ: admin@fpt.edu.vn"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Mật khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập mật khẩu..."
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-semibold mt-2"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
              </form>

              <div className="text-center mt-3 text-muted small">
                Tài khoản mẫu: <b>admin@fpt.edu.vn</b> hoặc <b>staff@fpt.edu.vn</b> / <b>123456</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
