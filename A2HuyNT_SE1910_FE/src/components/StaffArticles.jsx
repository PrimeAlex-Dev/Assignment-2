import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function StaffArticles({ user }) {
  const [articles, setArticles] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all' hoặc 'my-history'
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  // Dữ liệu hỗ trợ cho Form: Danh mục Active và Danh sách Tags
  const [activeCategories, setActiveCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // State Modal Popup Thêm / Sửa bài viết
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [formData, setFormData] = useState({
    newsTitle: '',
    headline: '',
    newsContent: '',
    newsSource: '',
    categoryId: '',
    newsStatus: 1,
    tagIds: [],
  });

  // State Confirm Dialog Xóa
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  // 1. Tải danh mục active và tags
  const loadFormDataOptions = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        api.get('/categories/active'),
        api.get('/tags'),
      ]);
      setActiveCategories(catRes.data);
      setAvailableTags(tagRes.data);
    } catch (err) {
      console.error('Error loading options:', err);
    }
  };

  // 2. Tải danh sách bài viết
  const fetchArticles = async (mode = filterMode, searchKeyword = keyword) => {
    setLoading(true);
    try {
      let url = '/news-articles';
      if (mode === 'my-history') {
        url = '/news-articles/my-history';
      } else if (searchKeyword) {
        url = `/news-articles?keyword=${encodeURIComponent(searchKeyword)}`;
      }
      const response = await api.get(url);
      setArticles(response.data);
    } catch (err) {
      console.error('Error fetching articles:', err);
      showAlert('danger', 'Không thể tải danh sách bài viết!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormDataOptions();
    fetchArticles('all', '');
  }, []);

  const showAlert = (type, message) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo({ type: '', message: '' });
    }, 4500);
  };

  // 3. Xử lý chuyển tab bộ lọc (Tất cả vs Bài viết của tôi)
  const handleSwitchFilter = (mode) => {
    setFilterMode(mode);
    setKeyword('');
    fetchArticles(mode, '');
  };

  // 4. Tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles(filterMode, keyword);
  };

  const handleResetSearch = () => {
    setKeyword('');
    fetchArticles(filterMode, '');
  };

  // 5. Mở Modal Thêm mới
  const handleOpenAddModal = () => {
    loadFormDataOptions();
    setIsEditing(false);
    setSelectedArticleId(null);
    setFormData({
      newsTitle: '',
      headline: '',
      newsContent: '',
      newsSource: 'FPT News',
      categoryId: activeCategories.length > 0 ? activeCategories[0].categoryId : '',
      newsStatus: 1,
      tagIds: [],
    });
    setShowModal(true);
  };

  // 6. Mở Modal Sửa
  const handleOpenEditModal = (art) => {
    loadFormDataOptions();
    setIsEditing(true);
    setSelectedArticleId(art.newsArticleId);
    setFormData({
      newsTitle: art.newsTitle || '',
      headline: art.headline || '',
      newsContent: art.newsContent || '',
      newsSource: art.newsSource || '',
      categoryId: art.categoryId ? String(art.categoryId) : '',
      newsStatus: art.newsStatus !== null ? art.newsStatus : 1,
      tagIds: art.tags ? art.tags.map((t) => t.tagId) : [],
    });
    setShowModal(true);
  };

  // Xử lý toggle chọn / bỏ chọn Tag
  const handleToggleTag = (tagId) => {
    setFormData((prev) => {
      const exists = prev.tagIds.includes(tagId);
      if (exists) {
        return { ...prev, tagIds: prev.tagIds.filter((id) => id !== tagId) };
      } else {
        return { ...prev, tagIds: [...prev.tagIds, tagId] };
      }
    });
  };

  // 7. Lưu bài viết (Thêm mới hoặc Cập nhật)
  const handleSaveArticle = async (e) => {
    e.preventDefault();

    if (!formData.newsTitle.trim()) {
      showAlert('danger', 'Tiêu đề bài viết không được để trống!');
      return;
    }
    if (!formData.categoryId) {
      showAlert('danger', 'Vui lòng chọn danh mục cho bài viết!');
      return;
    }
    if (!formData.newsContent.trim()) {
      showAlert('danger', 'Nội dung bài viết không được để trống!');
      return;
    }

    const payload = {
      newsTitle: formData.newsTitle.trim(),
      headline: formData.headline.trim(),
      newsContent: formData.newsContent,
      newsSource: formData.newsSource.trim(),
      categoryId: parseInt(formData.categoryId),
      newsStatus: parseInt(formData.newsStatus),
      tagIds: formData.tagIds,
      createdById: user?.accountId,
      updatedById: user?.accountId,
    };

    try {
      if (isEditing) {
        await api.put(`/news-articles/${selectedArticleId}`, payload);
        showAlert('success', 'Cập nhật bài viết thành công!');
      } else {
        await api.post('/news-articles', payload);
        showAlert('success', 'Đăng bài viết mới thành công!');
      }
      setShowModal(false);
      fetchArticles(filterMode, keyword);
    } catch (err) {
      console.error('Save article error:', err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết!';
      showAlert('danger', msg);
    }
  };

  // 8. Xử lý Xóa có Confirm Dialog
  const handleOpenDeleteConfirm = (art) => {
    setArticleToDelete(art);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      await api.delete(`/news-articles/${articleToDelete.newsArticleId}`);
      showAlert('success', `Đã xóa bài viết "${articleToDelete.newsTitle}" thành công!`);
      setShowConfirmDelete(false);
      setArticleToDelete(null);
      fetchArticles(filterMode, keyword);
    } catch (err) {
      console.error('Delete article error:', err);
      const msg = err.response?.data?.message || 'Không thể xóa bài viết này!';
      showAlert('danger', msg);
      setShowConfirmDelete(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold text-dark">📰 Quản lý Bài viết Tin tức (News Articles)</h5>
        <button className="btn btn-success btn-sm fw-semibold" onClick={handleOpenAddModal}>
          ➕ Viết bài mới
        </button>
      </div>

      <div className="card-body">
        {/* Thông báo Alert */}
        {alertInfo.message && (
          <div className={`alert alert-${alertInfo.type} alert-dismissible fade show`} role="alert">
            {alertInfo.message}
          </div>
        )}

        {/* Thanh chuyển đổi bộ lọc & Tìm kiếm */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${filterMode === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleSwitchFilter('all')}
            >
              📑 Tất cả bài viết
            </button>
            <button
              type="button"
              className={`btn ${filterMode === 'my-history' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleSwitchFilter('my-history')}
            >
              ✍️ Bài viết của tôi (Lịch sử)
            </button>
          </div>

          <form onSubmit={handleSearch} className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Tìm kiếm theo tiêu đề..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="btn btn-outline-success btn-sm text-nowrap">
              🔍 Tìm
            </button>
            {keyword && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleResetSearch}
              >
                ↺
              </button>
            )}
          </form>
        </div>

        {/* Bảng danh sách bài viết */}
        {loading ? (
          <div className="text-center py-4 text-muted">Đang tải danh sách bài viết...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-4 text-muted">
            {filterMode === 'my-history'
              ? 'Bạn chưa tạo bài viết nào!'
              : 'Không tìm thấy bài viết tin tức nào!'}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '60px' }} className="text-center">ID</th>
                  <th style={{ minWidth: '220px' }}>Tiêu đề bài viết</th>
                  <th style={{ width: '160px' }}>Danh mục</th>
                  <th style={{ minWidth: '160px' }}>Thẻ Tags</th>
                  <th style={{ width: '110px' }} className="text-center">Trạng thái</th>
                  <th style={{ width: '140px' }}>Người tạo</th>
                  <th style={{ width: '110px' }} className="text-center">Ngày tạo</th>
                  <th style={{ width: '140px' }} className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((art) => (
                  <tr key={art.newsArticleId}>
                    <td className="text-center fw-semibold">{art.newsArticleId}</td>
                    <td>
                      <div className="fw-semibold text-dark">{art.newsTitle}</div>
                      {art.headline && (
                        <div className="text-muted small fst-italic text-truncate" style={{ maxWidth: '300px' }}>
                          {art.headline}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-light text-primary border">
                        📁 {art.categoryName || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {art.tags && art.tags.length > 0 ? (
                          art.tags.map((t) => (
                            <span key={t.tagId} className="badge bg-light text-secondary border">
                              #{t.tagName}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted small">--</span>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      {art.newsStatus === 1 ? (
                        <span className="badge bg-success">Active (1)</span>
                      ) : (
                        <span className="badge bg-secondary">Inactive (0)</span>
                      )}
                    </td>
                    <td>{art.createdByName || 'N/A'}</td>
                    <td className="text-center small">{formatDate(art.createdDate)}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-primary btn-sm me-1"
                        onClick={() => handleOpenEditModal(art)}
                        title="Sửa bài viết"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleOpenDeleteConfirm(art)}
                        title="Xóa bài viết"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL POPUP: VIẾT BÀI MỚI / CHỈNH SỬA (Popup Dialog bắt buộc) */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h6 className="modal-title fw-bold">
                  {isEditing ? '✏️ Cập nhật Bài viết Tin tức' : '➕ Viết bài báo mới'}
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveArticle}>
                <div className="modal-body p-4">
                  {/* Tiêu đề bài viết */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Tiêu đề bài viết *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Nhập tiêu đề tin tức nổi bật..."
                      value={formData.newsTitle}
                      onChange={(e) => setFormData({ ...formData, newsTitle: e.target.value })}
                      required
                    />
                  </div>

                  {/* Headline tóm tắt */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Tóm tắt ngắn (Headline)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Tóm tắt 1-2 câu về nội dung chính..."
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    {/* Chọn Danh mục */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Danh mục (Category) *</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        required
                      >
                        <option value="">-- Chọn danh mục đang hoạt động --</option>
                        {activeCategories.map((c) => (
                          <option key={c.categoryId} value={c.categoryId}>
                            📁 {c.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Nguồn tin */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Nguồn tin (Source)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="ví dụ: FPT News, VnExpress..."
                        value={formData.newsSource}
                        onChange={(e) => setFormData({ ...formData, newsSource: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Chọn các thẻ Tag */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold d-block">
                      Gắn thẻ (Tags) cho bài viết:
                    </label>
                    <div className="d-flex flex-wrap gap-2 border rounded p-2 bg-light">
                      {availableTags.length === 0 ? (
                        <span className="text-muted small">Chưa có thẻ tag nào trong hệ thống.</span>
                      ) : (
                        availableTags.map((tag) => {
                          const isSelected = formData.tagIds.includes(tag.tagId);
                          return (
                            <button
                              key={tag.tagId}
                              type="button"
                              className={`btn btn-sm ${
                                isSelected ? 'btn-primary' : 'btn-outline-secondary'
                              }`}
                              onClick={() => handleToggleTag(tag.tagId)}
                            >
                              {isSelected ? '✓ ' : '+ '}#{tag.tagName}
                            </button>
                          );
                        })
                      )}
                    </div>
                    <small className="text-muted">
                      Click vào các thẻ tag trên để chọn hoặc bỏ chọn.
                    </small>
                  </div>

                  {/* Nội dung bài viết */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nội dung chi tiết bài viết *</label>
                    <textarea
                      className="form-control"
                      rows="6"
                      placeholder="Soạn thảo toàn bộ nội dung bài báo tại đây..."
                      value={formData.newsContent}
                      onChange={(e) => setFormData({ ...formData, newsContent: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  {/* Trạng thái bài viết */}
                  <div className="mb-2">
                    <label className="form-label small fw-semibold d-block">Trạng thái phát hành</label>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="artActive"
                        name="artStatus"
                        checked={formData.newsStatus === 1}
                        onChange={() => setFormData({ ...formData, newsStatus: 1 })}
                      />
                      <label className="form-check-label small" htmlFor="artActive">
                        Công khai (Active - 1)
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="artInactive"
                        name="artStatus"
                        checked={formData.newsStatus === 0}
                        onChange={() => setFormData({ ...formData, newsStatus: 0 })}
                      />
                      <label className="form-check-label small" htmlFor="artInactive">
                        Lưu nháp / Tạm ẩn (Inactive - 0)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-success btn-sm fw-semibold">
                    {isEditing ? 'Lưu bài viết' : 'Đăng bài viết'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG: XÁC NHẬN XÓA BÀI VIẾT */}
      {showConfirmDelete && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white py-2">
                <h6 className="modal-title fw-bold">⚠️ Xác nhận xóa bài viết</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowConfirmDelete(false)}
                ></button>
              </div>

              <div className="modal-body small">
                Bạn có chắc chắn muốn xóa bài viết{' '}
                <strong>"{articleToDelete?.newsTitle}"</strong> không?
                <br />
                <span className="text-muted mt-2 d-block">
                  Hành động này sẽ xóa vĩnh viễn bài báo và gỡ bỏ các liên kết thẻ tag.
                </span>
              </div>

              <div className="modal-footer py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowConfirmDelete(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm fw-semibold"
                  onClick={handleConfirmDelete}
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
