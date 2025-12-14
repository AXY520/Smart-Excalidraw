'use client';

import { useState } from 'react';
import { exportDiagram, copyToClipboard, DEFAULT_EXPORT_CONFIG } from '@/lib/export-utils';

export default function ExportModal({ isOpen, onClose, excalidrawAPI }) {
  const [format, setFormat] = useState('png');
  const [config, setConfig] = useState(DEFAULT_EXPORT_CONFIG);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleExport = async () => {
    if (!excalidrawAPI) {
      alert('画布未就绪');
      return;
    }

    setIsExporting(true);
    try {
      await exportDiagram(excalidrawAPI, format, config);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败：' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!excalidrawAPI) {
      alert('画布未就绪');
      return;
    }

    setIsCopying(true);
    try {
      await copyToClipboard(excalidrawAPI, config);
      alert('已复制到剪贴板');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('复制失败：' + error.message);
    } finally {
      setIsCopying(false);
    }
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">导出图表</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              导出格式
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['png', 'svg', 'pdf', 'json'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${
                    format === fmt
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* PNG/PDF Options */}
          {(format === 'png' || format === 'pdf') && (
            <>
              {/* Scale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  缩放比例: {config.scale}x
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={config.scale}
                  onChange={(e) => updateConfig('scale', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1x</span>
                  <span>2x</span>
                  <span>3x</span>
                  <span>4x</span>
                </div>
              </div>

              {/* Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  图像质量: {Math.round(config.quality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={config.quality}
                  onChange={(e) => updateConfig('quality', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>低</span>
                  <span>中</span>
                  <span>高</span>
                </div>
              </div>
            </>
          )}

          {/* Common Options */}
          {format !== 'json' && (
            <>
              {/* Padding */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  边距: {config.padding}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={config.padding}
                  onChange={(e) => updateConfig('padding', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  背景颜色
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.backgroundColor}
                    onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.withBackground}
                    onChange={(e) => updateConfig('withBackground', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">包含背景</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.darkMode}
                    onChange={(e) => updateConfig('darkMode', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">深色模式</span>
                </label>

                {format === 'svg' && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.embedScene}
                      onChange={(e) => updateConfig('embedScene', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">嵌入场景数据</span>
                  </label>
                )}
              </div>
            </>
          )}

          {/* JSON Info */}
          {format === 'json' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                导出为 JSON 格式将保存完整的 Excalidraw 场景数据，包括所有元素、配置和文件。可以在 Excalidraw 中重新导入。
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          {format === 'png' && (
            <button
              onClick={handleCopyToClipboard}
              disabled={isCopying || isExporting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCopying ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span>复制中...</span>
                </span>
              ) : (
                '复制到剪贴板'
              )}
            </button>
          )}
          
          <div className="flex items-center space-x-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || isCopying}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>导出中...</span>
                </span>
              ) : (
                `导出 ${format.toUpperCase()}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}