import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import AccountManagement from './components/AccountManagement';
import StaffArticles from './components/StaffArticles';
import StaffCategories from './components/StaffCategories';
import StaffProfile from './components/StaffProfile';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // State cho Tab đang kích hoạt
  const [activeTab, setActiveTab] = useState('accounts');

  // Khi user thay đổi role, tự động chọn tab đầu tiên hợp lệ của role đó
  useEffect(() => {
    if (user) {
      if (user.accountRole === 1) {
        setActiveTab('accounts'); // Admin chỉ có tab Quản lý tài khoản
      } else {
        setActiveTab('articles'); // Staff vào thẳng tab Quản lý bài viết
      }
    }
  }, [user]);

  // Nếu chưa đăng nhập -> hiển thị màn hình Login
  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* 1. Header trên cùng */}
      <Header user={user} onLogout={() => setUser(null)} />

      {/* 2. Container chính */}
      <div className="container pb-5">
        {/* Navigation Tabs phân quyền theo Role */}
        <ul className="nav nav-tabs mb-4 bg-white p-2 rounded shadow-sm">
          {/* TAB DÀNH CHO ADMIN (Role = 1) */}
          {user.accountRole === 1 && (
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === 'accounts' ? 'active' : ''}`}
                onClick={() => setActiveTab('accounts')}
              >
                👥 Quản lý Tài khoản (Admin)
              </button>
            </li>
          )}

          {/* CÁC TAB DÀNH CHO STAFF (Role = 2) */}
          {user.accountRole === 2 && (
            <>
              <li className="nav-item">
                <button
                  className={`nav-link fw-semibold ${activeTab === 'articles' ? 'active' : ''}`}
                  onClick={() => setActiveTab('articles')}
                >
                  📰 Quản lý Bài viết
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link fw-semibold ${activeTab === 'categories' ? 'active' : ''}`}
                  onClick={() => setActiveTab('categories')}
                >
                  📂 Quản lý Danh mục
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link fw-semibold ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  👤 Thông tin cá nhân
                </button>
              </li>
            </>
          )}
        </ul>

        {/* 3. Nội dung Component hiển thị theo Tab đã chọn */}
        {user.accountRole === 1 && activeTab === 'accounts' && <AccountManagement />}

        {user.accountRole === 2 && activeTab === 'articles' && <StaffArticles />}
        {user.accountRole === 2 && activeTab === 'categories' && <StaffCategories />}
        {user.accountRole === 2 && activeTab === 'profile' && <StaffProfile user={user} />}
      </div>
    </div>
  );
}

export default App;
