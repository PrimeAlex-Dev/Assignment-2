import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function StaffTags() {
  const [tags, setTags] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  // State Modal Popup Thêm mới / Cập nhật
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [formData, setFormData] = useState({
    tagName: '',
    note: '',
  });

  // State Confirm Dialog Xóa
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);

  // 1. Tải danh sách thẻ tag
  const fetchTags = async (searchKeyword = '') => {
    setLoading(true);
    try {
      const url = searchKeyword
        ? `/tags?keyword=${encodeURIComponent(searchKeyword)}`
        : '/tags';
      const response = await api.get(url);
      setTags(response.data);
    } catch (err) {
      console.error('Error fetching tags:', err);
      showAlert('danger', 'Không thể tải danh sách thẻ tag!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const showAlert = (type, message) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo({ type: '', message: '' });
    }, 4500);
  };

  // 2. Tìm kiếm thẻ tag
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTags(keyword);
  };

  const handleResetSearch = () => {
    setKeyword('');
    fetchTags('');
  };

  // 3. Mở Modal Thêm mới
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedTagId(null);
    setFormData({
      tagName: '',
      note: '',
    });
    setShowModal(true);
  };

  // 4. Mở Modal Sửa
  const handleOpenEditModal = (tag) => {
    setIsEditing(true);
    setSelectedTagId(tag.tagId);
    setFormData({
      tagName: tag.tagName || '',
      note: tag.note || '',
    });
    setShowModal(true);
  };

  // 5. Lưu thẻ tag (Thêm mới hoặc Cập nhật)
  const handleSaveTag = async (e) => {
    e.preventDefault();

    if (!formData.tagName.trim()) {
      showAlert('danger', 'Tên thẻ tag không được để trống!');
      return;
    }

    const payload = {
      tagName: formData.tagName.trim(),
      note: formData.note.trim(),
    };

    try {
      if (isEditing) {
        await api.put(`/tags/${selectedTagId}`, payload);
        showAlert('success', 'Cập nhật thẻ tag thành công!');
      } else {
        await api.post('/tags', payload);
        showAlert('success', 'Thêm thẻ tag mới thành công!');
      }
      setShowModal(false);
      fetchTags(keyword);
    } catch (err) {
      console.error('Save tag error:', err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu thẻ tag!';
      showAlert('danger', msg);
    }
  };

  // 6. Xử lý Xóa có Confirm Dialog
  const handleOpenDeleteConfirm = (tag) => {
    setTagToDelete(tag);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!tagToDelete) return;

    try {
      await api.delete(`/tags/${tagToDelete.tagId}`);
      showAlert('success', `Đã xóa thẻ tag "${tagToDelete.tagName}" thành công!`);
      setShowConfirmDelete(false);
      setTagToDelete(null);
      fetchTags(keyword);
    } catch (err) {
      console.error('Delete tag error:', err);
      const msg = err.response?.data?.message || 'Không thể xóa thẻ tag này!';
      showAlert('danger', msg);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold text-dark">🏷️ Quản lý Thẻ Tag (Tag Management)</h5>
        <button className="btn btn-primary btn-sm fw-semibold" onClick={handleOpenAddModal}>
          ➕ Thêm thẻ tag mới
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
              placeholder="Tìm kiếm theo Tên thẻ tag..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-outline-primary btn-sm me-1">
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

        {/* Bảng danh sách thẻ tag */}
        {loading ? (
          <div className="text-center py-4 text-muted">Đang tải danh sách thẻ tag...</div>
        ) : tags.length === 0 ? (
          <div className="text-center py-4 text-muted">Chưa có thẻ tag nào trong hệ thống!</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '80px' }} className="text-center">ID</th>
                  <th style={{ width: '220px' }}>Tên thẻ Tag</th>
                  <th>Ghi chú / Mô tả</th>
                  <th style={{ width: '160px' }} className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag) => (
                  <tr key={tag.tagId}>
                    <td className="text-center fw-semibold">{tag.tagId}</td>
                    <td>
                      <span className="badge bg-secondary-subtle text-dark border px-2 py-1 fs-6">
                        #{tag.tagName}
                      </span>
                    </td>
                    <td>{tag.note || <span className="text-muted fst-italic">Không có ghi chú</span>}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-primary btn-sm me-1"
                        onClick={() => handleOpenEditModal(tag)}
                        title="Sửa thẻ tag"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleOpenDeleteConfirm(tag)}
                        title="Xóa thẻ tag"
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

      {/* MODAL POPUP: THÊM MỚI / SỬA THẺ TAG (Popup Dialog) */}
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
                  {isEditing ? '✏️ Cập nhật Thẻ Tag' : '➕ Thêm mới Thẻ Tag'}
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveTag}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Tên thẻ Tag *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="ví dụ: Công nghệ, AI, Tuyển sinh..."
                      value={formData.tagName}
                      onChange={(e) => setFormData({ ...formData, tagName: e.target.value })}
                      required
                      maxLength={50}
                    />
                    <small className="text-muted">Tối đa 50 ký tự</small>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Ghi chú / Mô tả</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      placeholder="Ghi chú thêm về thẻ tag này..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      maxLength={400}
                    ></textarea>
                    <small className="text-muted">Tối đa 400 ký tự</small>
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
                  <button type="submit" className="btn btn-primary btn-sm fw-semibold">
                    {isEditing ? 'Lưu thay đổi' : 'Thêm thẻ tag'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG: XÁC NHẬN XÓA THẺ TAG */}
      {showConfirmDelete && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white py-2">
                <h6 className="modal-title fw-bold">⚠️ Xác nhận xóa thẻ tag</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowConfirmDelete(false)}
                ></button>
              </div>

              <div className="modal-body small">
                Bạn có chắc chắn muốn xóa thẻ tag{' '}
                <strong>"#{tagToDelete?.tagName}"</strong> không?
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
