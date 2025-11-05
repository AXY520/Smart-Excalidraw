'use client';

import { useState, useEffect } from 'react';
import { getAllConfigs, saveProvider, deleteProvider, setCurrentProvider } from '@/lib/config';

export default function ConfigModal({ isOpen, onClose, onSave, initialConfig }) {
  const [config, setConfig] = useState({
    id: '',
    name: '',
    type: 'openai',
    baseUrl: '',
    apiKey: '',
    model: '',
  });
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'manage'
  const [allConfigs, setAllConfigs] = useState({ providers: [], currentProviderId: null });

  // Load all configs when modal opens
  useEffect(() => {
    if (isOpen) {
      setAllConfigs(getAllConfigs());
    }
  }, [isOpen]);

  // 仅在初始配置变更时同步到本地表单状态，避免在模型加载失败时还原用户输入
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    } else {
      // Reset form for new provider
      setConfig({
        id: '',
        name: '',
        type: 'openai',
        baseUrl: '',
        apiKey: '',
        model: '',
      });
    }
  }, [initialConfig]);

  // 根据当前表单中的模型与可用模型列表，决定是否使用自定义输入
  useEffect(() => {
    if (config.model) {
      if (models.length > 0) {
        const exists = models.some(m => m.id === config.model);
        setUseCustomModel(!exists);
      } else {
        setUseCustomModel(true);
      }
    }
  }, [models, config.model]);

  const handleLoadModels = async () => {
    if (!config.type || !config.baseUrl || !config.apiKey) {
      setError('请先填写提供商类型、基础 URL 和 API 密钥');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        type: config.type,
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
      });

      const response = await fetch(`/api/models?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '加载模型失败');
      }

      setModels(data.models);
      if (data.models.length > 0) {
        // 如果当前模型不在新加载的列表中，切换到列表选择模式
        if (config.model && !data.models.some(m => m.id === config.model)) {
          setUseCustomModel(false);
          setConfig(prev => ({ ...prev, model: data.models[0].id }));
        } else if (!config.model && !useCustomModel) {
          // 如果没有选择模型且不是手动输入模式，自动选择第一个
          setConfig(prev => ({ ...prev, model: data.models[0].id }));
        }
      }
    } catch (err) {
      setError(err.message);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!config.type || !config.baseUrl || !config.apiKey || !config.model) {
      setError('请填写所有必填字段');
      return;
    }

    saveProvider(config, true);
    onSave(config);
    onClose();
  };

  const handleDeleteProvider = (providerId) => {
    if (confirm('确定要删除此配置吗？')) {
      deleteProvider(providerId);
      setAllConfigs(getAllConfigs());
      
      // If we deleted the current provider, notify parent
      if (allConfigs.currentProviderId === providerId) {
        const newConfig = getConfig();
        onSave(newConfig);
      }
    }
  };

  const handleSetCurrentProvider = (providerId) => {
    setCurrentProvider(providerId);
    setAllConfigs(getAllConfigs());
    
    // Notify parent of the change
    const currentConfig = allConfigs.providers.find(p => p.id === providerId);
    onSave(currentConfig);
  };

  const handleEditProvider = (provider) => {
    setConfig(provider);
    setActiveTab('edit');
  };

  const handleAddNewProvider = () => {
    setConfig({
      id: '',
      name: '',
      type: 'openai',
      baseUrl: '',
      apiKey: '',
      model: '',
    });
    setActiveTab('edit');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded border border-gray-300 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">LLM 配置管理</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'edit'
                ? 'bg-white text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {config.id ? '编辑配置' : '添加配置'}
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'manage'
                ? 'bg-white text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            管理配置 ({allConfigs.providers.length})
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {activeTab === 'edit' ? (
            <div className="space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Provider Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              提供商名称
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              placeholder="例如：我的 OpenAI"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Provider Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              提供商类型 <span className="text-red-500">*</span>
            </label>
            <select
              value={config.type}
              onChange={(e) => setConfig({ ...config, type: e.target.value, model: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              基础 URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
              placeholder={config.type === 'openai' ? 'https://api.openai.com/v1' : 'https://api.anthropic.com/v1'}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API 密钥 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Load Models Button */}
          <div>
            <button
              onClick={handleLoadModels}
              disabled={loading}
              className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 transition-colors duration-200 font-medium"
            >
              {loading ? '加载模型中...' : '加载可用模型'}
            </button>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              模型 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">推荐 claude-sonnet-4.5</p>

            {/* Toggle between selection and custom input */}
            {models.length > 0 && (
              <div className="mb-2 flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={!useCustomModel}
                    onChange={() => {
                      setUseCustomModel(false);
                      if (models.length > 0) {
                        setConfig({ ...config, model: models[0].id });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">从列表选择</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={useCustomModel}
                    onChange={() => {
                      setUseCustomModel(true);
                      setConfig({ ...config, model: '' });
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">手动输入</span>
                </label>
              </div>
            )}

            {/* Model Selection Dropdown */}
            {models.length > 0 && !useCustomModel && (
              <select
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            )}

            {/* Custom Model Input */}
            {(useCustomModel || models.length === 0) && (
              <input
                type="text"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                placeholder="例如：gpt-4、claude-3-opus-20240229"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            )}
          </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">已保存的配置</h3>
                <button
                  onClick={handleAddNewProvider}
                  className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors duration-200"
                >
                  添加新配置
                </button>
              </div>

              {allConfigs.providers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无配置</p>
                  <button
                    onClick={handleAddNewProvider}
                    className="mt-2 text-sm text-gray-900 hover:underline"
                  >
                    添加第一个配置
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {allConfigs.providers.map((provider) => (
                    <div
                      key={provider.id}
                      className={`p-3 border rounded-lg ${
                        allConfigs.currentProviderId === provider.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{provider.name}</h4>
                            {allConfigs.currentProviderId === provider.id && (
                              <span className="px-2 py-0.5 text-xs bg-gray-900 text-white rounded">当前</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {provider.type === 'openai' ? 'OpenAI' : 'Anthropic'} - {provider.model}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 truncate">{provider.baseUrl}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {allConfigs.currentProviderId !== provider.id && (
                            <button
                              onClick={() => handleSetCurrentProvider(provider.id)}
                              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200"
                            >
                              设为当前
                            </button>
                          )}
                          <button
                            onClick={() => handleEditProvider(provider)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-200"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteProvider(provider.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-200"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Only show on edit tab */}
        {activeTab === 'edit' && (
          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-gray-900 rounded hover:bg-gray-800 transition-colors duration-200"
            >
              {config.id ? '更新配置' : '保存配置'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

