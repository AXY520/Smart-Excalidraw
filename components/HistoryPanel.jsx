'use client';

import { useState, useEffect } from 'react';
import { 
  getHistoryList, 
  getDiagramById, 
  deleteDiagram, 
  deleteDiagrams,
  clearAllHistory,
  updateDiagram,
  getHistoryStats,
  exportDiagramAsJSON,
  importDiagramFromJSON
} from '@/lib/history';

export default function HistoryPanel({ isOpen, onClose, onLoadDiagram }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Load history on mount and when filters change
  useEffect(() => {
    if (isOpen) {
      loadHistory();
      loadStats();
    }
  }, [isOpen, searchQuery, sortBy, sortOrder]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const items = await getHistoryList({
        search: searchQuery,
        sortBy,
        sortOrder,
        limit: 100,
      });
      setHistoryItems(items);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statistics = await getHistoryStats();
      setStats(statistics);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleLoadDiagram = async (id) => {
    try {
      const diagram = await getDiagramById(id);
      if (diagram && onLoadDiagram) {
        onLoadDiagram(diagram);
        onClose();
      }
    } catch (error) {
      console.error('Failed to load diagram:', error);
      alert('加载图表失败');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个图表吗？')) return;
    
    try {
      await deleteDiagram(id);
      loadHistory();
      loadStats();
    } catch (error) {
      console.error('Failed to delete diagram:', error);
      alert('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedItems.size} 个图表吗？`)) return;
    
    try {
      await deleteDiagrams(Array.from(selectedItems));
      setSelectedItems(new Set());
      loadHistory();
      loadStats();
    } catch (error) {
      console.error('Failed to delete diagrams:', error);
      alert('批量删除失败');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('确定要清空所有历史记录吗？此操作不可恢复！')) return;
    
    try {
      await clearAllHistory();
      setSelectedItems(new Set());
      loadHistory();
      loadStats();
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('清空失败');
    }
  };

  const handleExport = async (id) => {
    try {
      const jsonString = await exportDiagramAsJSON(id);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagram-${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export diagram:', error);
      alert('导出失败');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importDiagramFromJSON(text);
      loadHistory();
      loadStats();
      alert('导入成功');
    } catch (error) {
      console.error('Failed to import diagram:', error);
      alert('导入失败：' + error.message);
    }
  };

  const handleToggleSelect = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === historyItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(historyItems.map(item => item.id)));
    }
  };

  const handleStartEdit = (id, currentTitle) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateDiagram(id, { title: editTitle });
      setEditingId(null);
      loadHistory();
    } catch (error) {
      console.error('Failed to update title:', error);
      alert('更新失败');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  const getChartTypeDisplay = (type) => {
    const types = {
      auto: '自动',
      flowchart: '流程图',
      mindmap: '思维导图',
      orgchart: '组织架构图',
      sequence: '时序图',
      class: 'UML类图',
      er: 'ER图',
      architecture: '架构图',
    };
    return types[type] || type;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">历史记录</h2>
            {stats && (
              <p className="text-sm text-gray-500 mt-1">
                共 {stats.totalDiagrams} 个图表 · 容量使用 {stats.usagePercentage.toFixed(1)}%
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-200 space-y-3">
          {/* Search and Sort */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索图表标题、描述..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="timestamp">按时间</option>
              <option value="title">按标题</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                {selectedItems.size === historyItems.length ? '取消全选' : '全选'}
              </button>
              
              {selectedItems.size > 0 && (
                <button
                  onClick={handleBatchDelete}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  删除选中 ({selectedItems.size})
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <label className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                导入
              </label>
              
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                清空全部
              </button>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>{searchQuery ? '没有找到匹配的图表' : '暂无历史记录'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    selectedItems.has(item.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleToggleSelect(item.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      {editingId === item.id ? (
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 truncate flex-1">
                            {item.title}
                          </h3>
                          <button
                            onClick={() => handleStartEdit(item.id, item.title)}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      )}
                      
                      {/* Meta */}
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">
                          {getChartTypeDisplay(item.chartType)}
                        </span>
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleLoadDiagram(item.id)}
                          className="flex-1 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        >
                          加载
                        </button>
                        <button
                          onClick={() => handleExport(item.id)}
                          className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          title="导出"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="删除"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}