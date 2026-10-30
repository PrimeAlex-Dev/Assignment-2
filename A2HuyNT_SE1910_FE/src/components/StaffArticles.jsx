import React from 'react';

export default function StaffArticles() {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold text-dark">📰 Quản lý Bài viết Tin tức (News Articles)</h5>
        <button className="btn btn-success btn-sm fw-semibold">
          ➕ Viết bài mới
        </button>
      </div>
      <div className="card-body py-5 text-center text-muted">
        <p className="mb-2">Giao diện Quản lý Bài viết Tin tức dành cho Nhân viên (Staff).</p>
        <small className="text-secondary">
          (Sẽ kết nối với API News Articles ở bước triển khai module tiếp theo).
        </small>
      </div>
    </div>
  );
}
