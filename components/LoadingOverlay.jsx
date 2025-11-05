'use client';

export default function LoadingOverlay({
  isVisible,
  message = "处理中...",
  transparent = false,
  className = ""
}) {
  if (!isVisible) return null;

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center ${
        transparent
          ? 'bg-black bg-opacity-10'
          : 'bg-white bg-opacity-90'
      } ${className}`}
    >
      <div className="flex flex-col items-center space-y-3">
        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>

        {/* Loading Message with Dots */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 font-medium">{message}</span>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}