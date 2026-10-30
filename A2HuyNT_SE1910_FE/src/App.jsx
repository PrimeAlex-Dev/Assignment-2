import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import PublicNews from './components/PublicNews';
import AccountManagement from './components/AccountManagement';
import StaffArticles from './components/StaffArticles';
import StaffCategories from './components/StaffCategories';
import StaffTags from './components/StaffTags';
import StaffProfile from './components/StaffProfile';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // State điều hướng chế độ xem: 'public' (mặc định cho khách vãng lai), 'login', 'dashboard'
  const [viewMode, setViewMode] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? 'dashboard' : 'public';
  });

  // State cho Tab chức năng khi ở giao diện quản trị (dashboard)
  const [activeTab, setActiveTab] = useState('articles');

  // Tự động chọn tab đầu tiên hợp lệ khi đăng nhập theo Role
  useEffect(() => {
    if (user) {
      if (user.accountRole === 1) {
        setActiveTab('accounts'); // Admin vào Quản lý tài khoản
      } else {
        setActiveTab('articles'); // Staff vào Quản lý bài viết
      }
    }
  }, [user]);

  // Xử lý khi đăng nhập thành công
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setViewMode('dashboard');
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    setUser(null);
    setViewMode('public'); // Đăng xuất xong đẩy về trang tin tức công khai
  };

  // 1. MÀN HÌNH CÔNG KHAI CHO KHÁCH VÃNG LAI XEM TIN TỨC (Mặc định khi chưa login)
  if (viewMode === 'public') {
    return (
      <PublicNews
        user={user}
        onNavigateToLogin={() => setViewMode('login')}
        onNavigateToDashboard={() => setViewMode('dashboard')}
      />
    );
  }

  // 2. MÀN HÌNH ĐĂNG NHẬP
  if (viewMode === 'login') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onNavigateToPublic={() => setViewMode('public')}
      />
    );
  }

  // 3. MÀN HÌNH KHU VỰC QUẢN TRỊ (DASHBOARD CHO ADMIN & STAFF)
  return (
    <div className="min-vh-100 bg-light">
      {/* Header Quản trị */}
      <Header
        user={user}
        onLogout={handleLogout}
        onNavigateToPublic={() => setViewMode('public')}
      />

      {/* Container nội dung */}
      <div className="container pb-5">
        {/* Navigation Tabs phân quyền theo Role */}
        <ul className="nav nav-tabs mb-4 bg-white p-2 rounded shadow-sm">
          {/* TAB DÀNH CHO ADMIN (Role = 1) */}
          {user?.accountRole === 1 && (
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
          {user?.accountRole === 2 && (
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
                  className={`nav-link fw-semibold ${activeTab === 'tags' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tags')}
                >
                  🏷️ Quản lý Thẻ Tag
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

        {/* Nội dung Component hiển thị theo Tab đã chọn */}
        {user?.accountRole === 1 && activeTab === 'accounts' && <AccountManagement />}

        {user?.accountRole === 2 && activeTab === 'articles' && <StaffArticles user={user} />}
        {user?.accountRole === 2 && activeTab === 'categories' && <StaffCategories />}
        {user?.accountRole === 2 && activeTab === 'tags' && <StaffTags />}
        {user?.accountRole === 2 && activeTab === 'profile' && <StaffProfile user={user} />}
      </div>
    </div>
  );
}

export default App;
