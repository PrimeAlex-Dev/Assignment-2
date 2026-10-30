import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function StaffCategories() {
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  // State Modal Popup Thêm mới / Cập nhật
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    categoryDescription: '',
    parentCategoryId: '',
    isActive: true,
  });

  // State Confirm Dialog Xóa
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // 1. Tải danh sách danh mục
  const fetchCategories = async (searchKeyword = '') => {
    setLoading(true);
    try {
      const url = searchKeyword
        ? `/categories?keyword=${encodeURIComponent(searchKeyword)}`
        : '/categories';
      const response = await api.get(url);
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      showAlert('danger', 'Không thể tải danh sách danh mục!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showAlert = (type, message) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo({ type: '', message: '' });
    }, 4500);
  };

  // 2. Tìm kiếm danh mục theo tên
  const handleSearch = (e) => {
    e.preventDefault();
    fetchCategories(keyword);
  };

  const handleResetSearch = () => {
    setKeyword('');
    fetchCategories('');
  };

  // 3. Mở Modal Thêm mới
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedCategoryId(null);
    setFormData({
      categoryName: '',
      categoryDescription: '',
      parentCategoryId: '',
      isActive: true,
    });
    setShowModal(true);
  };

  // 4. Mở Modal Sửa
  const handleOpenEditModal = (cat) => {
    setIsEditing(true);
    setSelectedCategoryId(cat.categoryId);
    setFormData({
      categoryName: cat.categoryName || '',
      categoryDescription: cat.categoryDescription || '',
      parentCategoryId: cat.parentCategoryId ? String(cat.parentCategoryId) : '',
      isActive: cat.isActive !== false,
    });
    setShowModal(true);
  };

  // 5. Lưu danh mục (Thêm mới hoặc Cập nhật qua Modal Popup)
  const handleSaveCategory = async (e) => {
    e.preventDefault();

    if (!formData.categoryName.trim()) {
      showAlert('danger', 'Tên danh mục không được để trống!');
      return;
    }

    const payload = {
      categoryName: formData.categoryName.trim(),
      categoryDescription: formData.categoryDescription.trim(),
      parentCategoryId: formData.parentCategoryId ? parseInt(formData.parentCategoryId) : null,
      isActive: Boolean(formData.isActive),
    };

    try {
      if (isEditing) {
        await api.put(`/categories/${selectedCategoryId}`, payload);
        showAlert('success', 'Cập nhật danh mục thành công!');
      } else {
        await api.post('/categories', payload);
        showAlert('success', 'Thêm danh mục mới thành công!');
      }
      setShowModal(false);
      fetchCategories(keyword);
    } catch (err) {
      console.error('Save category error:', err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục!';
      showAlert('danger', msg);
    }
  };

  // 6. Xử lý Xóa có Confirm Dialog
  const handleOpenDeleteConfirm = (cat) => {
    setCategoryToDelete(cat);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await api.delete(`/categories/${categoryToDelete.categoryId}`);
      showAlert('success', `Đã xóa danh mục "${categoryToDelete.categoryName}" thành công!`);
      setShowConfirmDelete(false);
      setCategoryToDelete(null);
      fetchCategories(keyword);
    } catch (err) {
      console.error('Delete category error:', err);
      // Bắt lỗi ràng buộc (409 Conflict): không được xóa nếu đã có bài viết
      const msg =
        err.response?.data?.message ||
        'Không thể xóa danh mục này vì đã có bài viết tin tức thuộc danh mục!';
      showAlert('danger', msg);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold text-dark">📂 Quản lý Danh mục Tin tức (Category Management)</h5>
        <button className="btn btn-success btn-sm fw-semibold" onClick={handleOpenAddModal}>
          ➕ Thêm danh mục mới
        </button>
      </div>

      <div className="card-body">
        {/* Thông báo Alert */}
        {alertInfo.message && (
          <div className={`alert alert-${alertInfo.type} alert-dismissible fade show`} role="alert">
            {alertInfo.message}
          </div>
        )}

        {/* Thanh tìm kiếm */}
        <form onSubmit={handleSearch} className="row g-2 mb-3">
          <div className="col-auto flex-grow-1">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Tìm kiếm theo Tên danh mục tin tức..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-outline-success btn-sm me-1">
              🔍 Tìm kiếm
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleResetSearch}
            >
              ↺ Làm mới
            </button>
          </div>
        </form>

        {/* Bảng danh sách danh mục */}
        {loading ? (
          <div className="text-center py-4 text-muted">Đang tải danh sách danh mục...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-4 text-muted">Chưa có danh mục tin tức nào!</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '70px' }} className="text-center">ID</th>
                  <th style={{ width: '220px' }}>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th style={{ width: '180px' }}>Danh mục cha</th>
                  <th style={{ width: '120px' }} className="text-center">Trạng thái</th>
                  <th style={{ width: '150px' }} className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.categoryId}>
                    <td className="text-center fw-semibold">{cat.categoryId}</td>
                    <td className="fw-semibold text-primary">{cat.categoryName}</td>
                    <td>{cat.categoryDescription || <span className="text-muted fst-italic">Không có mô tả</span>}</td>
                    <td>
                      {cat.parentCategoryName ? (
                        <span className="badge bg-light text-dark border">
                          📁 {cat.parentCategoryName}
                        </span>
                      ) : (
                        <span className="text-muted small">-- Gốc --</span>
                      )}
                    </td>
                    <td className="text-center">
                      {cat.isActive ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Inactive</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-primary btn-sm me-1"
                        onClick={() => handleOpenEditModal(cat)}
                        title="Sửa danh mục"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleOpenDeleteConfirm(cat)}
                        title="Xóa danh mục"
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

      {/* MODAL POPUP: THÊM MỚI / SỬA DANH MỤC */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h6 className="modal-title fw-bold">
                  {isEditing ? '✏️ Cập nhật Danh mục' : '➕ Thêm mới Danh mục'}
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveCategory}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Tên danh mục *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="ví dụ: Tin tức Công nghệ, Hoạt động CLB..."
                      value={formData.categoryName}
                      onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Mô tả danh mục</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      placeholder="Mô tả ngắn về danh mục tin tức này..."
                      value={formData.categoryDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryDescription: e.target.value })
                      }
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Danh mục cha (nếu có)</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.parentCategoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, parentCategoryId: e.target.value })
                      }
                    >
                      <option value="">-- Không có (Đây là danh mục gốc) --</option>
                      {categories
                        // Loại trừ chính danh mục đang sửa để không tự làm cha của chính nó
                        .filter((c) => !isEditing || c.categoryId !== selectedCategoryId)
                        .map((c) => (
                          <option key={c.categoryId} value={c.categoryId}>
                            {c.categoryName} (ID: {c.categoryId})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold d-block">Trạng thái</label>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="statusActive"
                        name="categoryStatus"
                        checked={formData.isActive === true}
                        onChange={() => setFormData({ ...formData, isActive: true })}
                      />
                      <label className="form-check-label small" htmlFor="statusActive">
                        Hoạt động (Active - 1)
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="statusInactive"
                        name="categoryStatus"
                        checked={formData.isActive === false}
                        onChange={() => setFormData({ ...formData, isActive: false })}
                      />
                      <label className="form-check-label small" htmlFor="statusInactive">
                        Tạm ẩn (Inactive - 0)
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
                    {isEditing ? 'Lưu thay đổi' : 'Thêm danh mục'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG: XÁC NHẬN XÓA DANH MỤC (Bắt buộc theo đề bài) */}
      {showConfirmDelete && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white py-2">
                <h6 className="modal-title fw-bold">⚠️ Xác nhận xóa danh mục</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowConfirmDelete(false)}
                ></button>
              </div>

              <div className="modal-body small">
                Bạn có chắc chắn muốn xóa danh mục{' '}
                <strong>"{categoryToDelete?.categoryName}"</strong> không?
                <br />
                <span className="text-muted mt-2 d-block">
                  (Ràng buộc: Nếu danh mục này đã có bài viết tin tức thì hệ thống sẽ chặn không cho phép xóa).
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
