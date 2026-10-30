import React from 'react';

export default function StaffProfile({ user }) {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3">
        <h5 className="mb-0 fw-bold text-dark">👤 Thông tin cá nhân (My Profile)</h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">ID Tài khoản</label>
            <input type="text" className="form-control form-control-sm" value={user?.accountId || ''} disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Vai trò</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={user?.accountRole === 1 ? 'Quản trị viên (Admin)' : 'Nhân viên (Staff)'}
              disabled
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Họ và Tên</label>
            <input type="text" className="form-control form-control-sm" value={user?.accountName || ''} disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Email</label>
            <input type="text" className="form-control form-control-sm" value={user?.accountEmail || ''} disabled />
          </div>
        </div>
      </div>
    </div>
  );
}
