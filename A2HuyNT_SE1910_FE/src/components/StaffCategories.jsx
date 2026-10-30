import React from 'react';

export default function StaffCategories() {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold text-dark">📂 Quản lý Danh mục Tin tức (Categories)</h5>
        <button className="btn btn-success btn-sm fw-semibold">
          ➕ Thêm danh mục mới
        </button>
      </div>
      <div className="card-body py-5 text-center text-muted">
        <p className="mb-2">Giao diện Quản lý Danh mục Tin tức dành cho Nhân viên (Staff).</p>
        <small className="text-secondary">
          (Sẽ kết nối với API Category ở bước triển khai module tiếp theo).
        </small>
      </div>
    </div>
  );
}
