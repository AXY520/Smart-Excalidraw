'use client';

export default function ContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">联系作者</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-600 text-center">扫码添加作者微信</p>

          {/* 二维码图片 */}
          <img
            src="/qrcode.png"
            alt="微信二维码"
            className="w-48  rounded-lg"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='192' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='sans-serif' font-size='14' fill='%236b7280'%3E二维码暂未上传%3C/text%3E%3C/svg%3E";
            }}
          />

          <p className="text-gray-500 text-sm text-center">
            扫描二维码，添加作者微信<br/>
            获取更多功能支持和技术交流
          </p>
        </div>
      </div>
    </div>
  );
}