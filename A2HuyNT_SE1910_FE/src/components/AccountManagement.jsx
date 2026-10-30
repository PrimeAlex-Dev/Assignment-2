import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  // State quản lý Modal Thêm/Sửa (Popup Dialog)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [formData, setFormData] = useState({
    accountName: '',
    accountEmail: '',
    accountRole: 2, // Mặc định Staff = 2
    accountPassword: '',
  });

  // State quản lý Confirm Dialog Xóa
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // 1. Tải danh sách tài khoản
  const fetchAccounts = async (searchKeyword = '') => {
    setLoading(true);
    try {
      const url = searchKeyword ? `/accounts?keyword=${encodeURIComponent(searchKeyword)}` : '/accounts';
      const response = await api.get(url);
      setAccounts(response.data);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      showAlert('danger', 'Không thể tải danh sách tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const showAlert = (type, message) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo({ type: '', message: '' });
    }, 4000);
  };

  // 2. Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchAccounts(keyword);
  };

  const handleResetSearch = () => {
    setKeyword('');
    fetchAccounts('');
  };

  // 3. Mở Modal Thêm mới
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedAccountId(null);
    setFormData({
      accountName: '',
      accountEmail: '',
      accountRole: 2,
      accountPassword: '',
    });
    setShowModal(true);
  };

  // 4. Mở Modal Sửa
  const handleOpenEditModal = (account) => {
    setIsEditing(true);
    setSelectedAccountId(account.accountId);
    setFormData({
      accountName: account.accountName,
      accountEmail: account.accountEmail,
      accountRole: account.accountRole,
      accountPassword: '', // Để trống nếu không đổi pass
    });
    setShowModal(true);
  };

  // 5. Lưu dữ liệu (Thêm mới hoặc Cập nhật qua Modal)
  const handleSaveAccount = async (e) => {
    e.preventDefault();

    if (!isEditing && !formData.accountPassword.trim()) {
      showAlert('danger', 'Mật khẩu là bắt buộc khi tạo tài khoản mới!');
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/accounts/${selectedAccountId}`, formData);
        showAlert('success', 'Cập nhật tài khoản thành công!');
      } else {
        await api.post('/accounts', formData);
        showAlert('success', 'Thêm mới tài khoản thành công!');
      }
      setShowModal(false);
      fetchAccounts(keyword);
    } catch (err) {
      console.error('Save account error:', err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu!';
      showAlert('danger', msg);
    }
  };

  // 6. Xử lý Xóa có hộp thoại xác nhận (Confirm Dialog)
  const handleOpenDeleteConfirm = (account) => {
    setAccountToDelete(account);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      await api.delete(`/accounts/${accountToDelete.accountId}`);
      showAlert('success', `Đã xóa tài khoản "${accountToDelete.accountName}" thành công!`);
      setShowConfirmDelete(false);
      setAccountToDelete(null);
      fetchAccounts(keyword);
    } catch (err) {
      console.error('Delete account error:', err);
      // Bắt lỗi ràng buộc (409 Conflict) khi tài khoản đã tạo bài viết
      const msg = err.response?.data?.message || 'Không thể xóa tài khoản này!';
      showAlert('danger', msg);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold text-dark">👥 Quản lý Tài khoản (Account Management)</h5>
        <button className="btn btn-primary btn-sm fw-semibold" onClick={handleOpenAddModal}>
          ➕ Thêm tài khoản mới
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
              placeholder="Tìm kiếm theo Tên hoặc Email tài khoản..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-outline-primary btn-sm me-1">
              🔍 Tìm kiếm
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleResetSearch}>
              ↺ Làm mới
            </button>
          </div>
        </form>

        {/* Bảng dữ liệu danh sách */}
        {loading ? (
          <div className="text-center py-4 text-muted">Đang tải danh sách tài khoản...</div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-4 text-muted">Không tìm thấy tài khoản nào!</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '80px' }} className="text-center">ID</th>
                  <th>Họ và Tên</th>
                  <th>Email</th>
                  <th style={{ width: '140px' }} className="text-center">Vai trò</th>
                  <th style={{ width: '160px' }} className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.accountId}>
                    <td className="text-center fw-semibold">{acc.accountId}</td>
                    <td>{acc.accountName}</td>
                    <td>{acc.accountEmail}</td>
                    <td className="text-center">
                      {acc.accountRole === 1 ? (
                        <span className="badge bg-danger">Admin</span>
                      ) : (
                        <span className="badge bg-success">Staff</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-primary btn-sm me-1"
                        onClick={() => handleOpenEditModal(acc)}
                        title="Sửa tài khoản"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleOpenDeleteConfirm(acc)}
                        title="Xóa tài khoản"
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

      {/* MODAL POPUP: THÊM MỚI / CHỈNH SỬA TÀI KHOẢN (Pure React Bootstrap Modal) */}
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
                  {isEditing ? '✏️ Cập nhật Tài khoản' : '➕ Thêm mới Tài khoản'}
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveAccount}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Họ và Tên *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Nhập họ và tên..."
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}

                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email *</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      placeholder="example@fpt.edu.vn"
                      value={formData.accountEmail}
                      onChange={(e) => setFormData({ ...formData, accountEmail: e.target.value })}

                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Vai trò (Role) *</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.accountRole}
                      onChange={(e) => setFormData({ ...formData, accountRole: parseInt(e.target.value) })}
                    >
                      <option value={1}>Quản trị viên (Admin - 1)</option>
                      <option value={2}>Nhân viên (Staff - 2)</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">
                      Mật khẩu {isEditing ? '(để trống nếu không muốn đổi)' : '*'}
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      placeholder={isEditing ? 'Nhập mật khẩu mới (nếu muốn đổi)...' : 'Nhập mật khẩu...'}
                      value={formData.accountPassword}
                      onChange={(e) => setFormData({ ...formData, accountPassword: e.target.value })}
                      required={!isEditing}
                    />
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
                    {isEditing ? 'Lưu thay đổi' : 'Thêm tài khoản'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG: XÁC NHẬN XÓA (Yêu cầu bắt buộc) */}
      {showConfirmDelete && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white py-2">
                <h6 className="modal-title fw-bold">⚠️ Xác nhận xóa</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowConfirmDelete(false)}
                ></button>
              </div>

              <div className="modal-body small">
                Bạn có chắc chắn muốn xóa tài khoản{' '}
                <strong>"{accountToDelete?.accountName}"</strong> không?
                <br />
                <span className="text-muted mt-2 d-block">
                  (Lưu ý: Nếu tài khoản này đã từng tạo bài viết tin tức thì hệ thống sẽ từ chối xóa).
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
