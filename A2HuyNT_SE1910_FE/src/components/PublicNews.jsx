import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function PublicNews({ user, onNavigateToLogin, onNavigateToDashboard }) {
  const [articles, setArticles] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // 1. Lấy danh sách tin tức Active
  const fetchPublicArticles = async (searchKeyword = '') => {
    setLoading(true);
    try {
      const url = searchKeyword
        ? `/news-articles/public?keyword=${encodeURIComponent(searchKeyword)}`
        : '/news-articles/public';
      const response = await api.get(url);
      setArticles(response.data);
    } catch (err) {
      console.error('Error fetching public news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicArticles();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPublicArticles(keyword);
  };

  const handleResetSearch = () => {
    setKeyword('');
    fetchPublicArticles('');
  };

  // Format ngày tháng hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* 1. Header Trang Báo Công Khai */}
      <header className="navbar navbar-expand-lg navbar-dark bg-primary px-4 py-3 shadow-sm sticky-top">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2">
            📰 FUNews Management System
          </span>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <button
                className="btn btn-warning btn-sm fw-bold px-3 shadow-sm"
                onClick={onNavigateToDashboard}
              >
                ⚙️ Vào trang Quản trị ({user.accountRole === 1 ? 'Admin' : 'Staff'})
              </button>
            ) : (
              <button
                className="btn btn-outline-light btn-sm fw-semibold px-3"
                onClick={onNavigateToLogin}
              >
                🔐 Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Banner & Search Section */}
      <div className="bg-white border-bottom py-4 mb-4 shadow-sm">
        <div className="container text-center">
          <h2 className="fw-bold text-dark mb-2">Trang Tin tức & Sự kiện</h2>
          <p className="text-muted small mb-3">
            Cập nhật thông báo học thuật, sự kiện và đời sống sinh viên mới nhất
          </p>

          <form onSubmit={handleSearch} className="row justify-content-center g-2">
            <div className="col-md-6 col-lg-5">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm tin tức theo tiêu đề..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div className="col-auto">
              <button type="submit" className="btn btn-primary px-3">
                🔍 Tìm kiếm
              </button>
              {keyword && (
                <button
                  type="button"
                  className="btn btn-outline-secondary ms-2"
                  onClick={handleResetSearch}
                >
                  ↺ Làm mới
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* 3. Danh sách bài viết dạng Card báo chí */}
      <div className="container pb-5">
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
            Đang tải danh sách tin tức...
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-5 bg-white rounded shadow-sm border p-4">
            <h5 className="text-muted">Không tìm thấy bài viết tin tức nào!</h5>
            <p className="small text-secondary mb-0">
              Hãy thử tìm kiếm với từ khóa khác hoặc quay lại sau.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {articles.map((art) => (
              <div key={art.newsArticleId} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0 d-flex flex-column">
                  <div className="card-body d-flex flex-column">
                    {/* Badge Danh mục */}
                    <div className="mb-2">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                        📁 {art.categoryName || 'Tin tức chung'}
                      </span>
                    </div>

                    {/* Tiêu đề bài viết */}
                    <h5
                      className="card-title fw-bold text-dark mb-2"
                      style={{ cursor: 'pointer', lineHeight: '1.4' }}
                      onClick={() => setSelectedArticle(art)}
                    >
                      {art.newsTitle}
                    </h5>

                    {/* Headline tóm tắt */}
                    <p className="card-text text-muted small flex-grow-1 mb-3">
                      {art.headline || (art.newsContent && art.newsContent.slice(0, 100) + '...')}
                    </p>

                    {/* Tags */}
                    {art.tags && art.tags.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {art.tags.map((t) => (
                          <span key={t.tagId} className="badge bg-light text-secondary border">
                            #{t.tagName}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Tác giả & Ngày đăng */}
                    <div className="border-top pt-2 mt-auto d-flex justify-content-between align-items-center text-muted small">
                      <span>✍️ {art.createdByName || 'Ban Biên tập'}</span>
                      <span>📅 {formatDate(art.createdDate)}</span>
                    </div>
                  </div>

                  <div className="card-footer bg-white border-0 pt-0 pb-3">
                    <button
                      className="btn btn-outline-primary btn-sm w-100 fw-semibold"
                      onClick={() => setSelectedArticle(art)}
                    >
                      📖 Đọc toàn bộ bài viết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. MODAL POPUP: ĐỌC CHI TIẾT BÀI BÁO (Reader Modal) */}
      {selectedArticle && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <div>
                  <span className="badge bg-primary me-2">
                    📁 {selectedArticle.categoryName || 'Tin tức'}
                  </span>
                  <span className="text-muted small">
                    Đăng ngày: {formatDate(selectedArticle.createdDate)}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedArticle(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <h3 className="fw-bold text-dark mb-3">{selectedArticle.newsTitle}</h3>

                {selectedArticle.headline && (
                  <p className="lead fs-6 text-secondary fst-italic border-start border-4 border-primary ps-3 py-1 mb-4 bg-light">
                    {selectedArticle.headline}
                  </p>
                )}

                {/* Nội dung bài viết */}
                <div
                  className="article-content text-dark mb-4"
                  style={{ whiteSpace: 'pre-line', fontSize: '1.05rem', lineHeight: '1.7' }}
                >
                  {selectedArticle.newsContent}
                </div>

                {/* Danh sách Tags */}
                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="mb-3">
                    <strong className="small text-muted me-2">Từ khóa (Tags):</strong>
                    {selectedArticle.tags.map((t) => (
                      <span key={t.tagId} className="badge bg-secondary-subtle text-secondary border me-1">
                        #{t.tagName}
                      </span>
                    ))}
                  </div>
                )}

                <div className="border-top pt-3 text-muted small d-flex justify-content-between">
                  <span>
                    Nguồn tin: <strong>{selectedArticle.newsSource || 'FUNews'}</strong>
                  </span>
                  <span>
                    Người đăng: <strong>{selectedArticle.createdByName || 'Ban Biên tập'}</strong>
                  </span>
                </div>
              </div>

              <div className="modal-footer bg-light py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedArticle(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
