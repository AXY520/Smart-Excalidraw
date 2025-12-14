'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Chat from '@/components/Chat';
import CodeEditor from '@/components/CodeEditor';
import ConfigModal from '@/components/ConfigModal';
import HistoryPanel from '@/components/HistoryPanel';
import ExportModal from '@/components/ExportModal';
import CloudFilePicker from '@/components/CloudFilePicker';
import { getConfig, getAllConfigs, setCurrentProvider, isConfigValid } from '@/lib/config';
import { optimizeExcalidrawCode } from '@/lib/optimizeArrows';
import { saveDiagramToHistory } from '@/lib/history';
import { generateThumbnail } from '@/lib/export-utils';

// Dynamically import ExcalidrawCanvas to avoid SSR issues
const ExcalidrawCanvas = dynamic(() => import('@/components/ExcalidrawCanvas'), {
  ssr: false,
});

export default function Home() {
  const [config, setConfig] = useState(null);
  const [allConfigs, setAllConfigs] = useState({ providers: [], currentProviderId: null });
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCloudPickerOpen, setIsCloudPickerOpen] = useState(false);
  const [cloudPickerMode, setCloudPickerMode] = useState('open'); // 'open' | 'save'
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [elements, setElements] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [isOptimizingCode, setIsOptimizingCode] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(30); // Percentage of viewport width
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true); // Control left panel visibility
  const [apiError, setApiError] = useState(null);
  const [jsonError, setJsonError] = useState(null);

  // Load config on mount
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const savedConfig = await getConfig();
        const allProviderConfigs = await getAllConfigs();
        if (savedConfig) {
          setConfig(savedConfig);
        }
        setAllConfigs(allProviderConfigs);
      } catch (error) {
        console.error('Failed to load configs:', error);
      }
    };
    
    loadConfigs();
  }, []);

  // Post-process Excalidraw code: remove markdown wrappers and fix unescaped quotes
  const postProcessExcalidrawCode = (code) => {
    if (!code || typeof code !== 'string') return code;
    
    let processed = code.trim();
    
    // Step 1: Remove markdown code fence wrappers (```json, ```javascript, ```js, or just ```)
    processed = processed.replace(/^```(?:json|javascript|js)?\s*\n?/i, '');
    processed = processed.replace(/\n?```\s*$/, '');
    processed = processed.trim();
    
    // Step 2: Fix unescaped double quotes within JSON string values
    // This is a complex task - we need to be careful not to break valid JSON structure
    // Strategy: Parse the JSON structure and fix quotes only in string values
    try {
      // First, try to parse as-is to see if it's already valid
      JSON.parse(processed);
      return processed; // Already valid JSON, no need to fix
    } catch (e) {
      // JSON is invalid, try to fix unescaped quotes
      // This regex finds string values and fixes unescaped quotes within them
      // It looks for: "key": "value with "unescaped" quotes"
      processed = fixUnescapedQuotes(processed);
      return processed;
    }
  };

  // Helper function to fix unescaped quotes in JSON strings
  const fixUnescapedQuotes = (jsonString) => {
    let result = '';
    let inString = false;
    let escapeNext = false;
    let currentQuotePos = -1;
    
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString[i];
      const prevChar = i > 0 ? jsonString[i - 1] : '';
      
      if (escapeNext) {
        result += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        result += char;
        escapeNext = true;
        continue;
      }
      
      if (char === '"') {
        if (!inString) {
          // Starting a string
          inString = true;
          currentQuotePos = i;
          result += char;
        } else {
          // Potentially ending a string
          // Check if this is a structural quote (followed by : or , or } or ])
          const nextNonWhitespace = jsonString.slice(i + 1).match(/^\s*(.)/);
          const nextChar = nextNonWhitespace ? nextNonWhitespace[1] : '';
          
          if (nextChar === ':' || nextChar === ',' || nextChar === '}' || nextChar === ']' || nextChar === '') {
            // This is a closing quote for the string
            inString = false;
            result += char;
          } else {
            // This is an unescaped quote within the string - escape it
            result += '\\"';
          }
        }
      } else {
        result += char;
      }
    }
    
    return result;
  };

  // Handle sending a message (single-turn)
  const handleSendMessage = async (userMessage, chartType = 'auto') => {
    if (!isConfigValid(config)) {
      alert('请先配置您的 LLM 提供商');
      setIsConfigModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setApiError(null); // Clear previous errors
    setJsonError(null); // Clear previous JSON errors

    try {
      // Call generate API with streaming
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          userInput: userMessage,
          chartType,
        }),
      });

      if (!response.ok) {
        // Parse error response body if available
        let errorMessage = '生成代码失败';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If response body is not JSON, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = '请求参数错误，请检查输入内容';
              break;
            case 401:
            case 403:
              errorMessage = 'API 密钥无效或权限不足，请检查配置';
              break;
            case 429:
              errorMessage = '请求过于频繁，请稍后再试';
              break;
            case 500:
            case 502:
            case 503:
              errorMessage = '服务器错误，请稍后重试';
              break;
            default:
              errorMessage = `请求失败 (${response.status})`;
          }
        }
        throw new Error(errorMessage);
      }

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedCode = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                accumulatedCode += data.content;
                // Post-process and set the cleaned code to editor
                const processedCode = postProcessExcalidrawCode(accumulatedCode);
                setGeneratedCode(processedCode);
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // SSE parsing errors - show to user
              if (e.message && !e.message.includes('Unexpected')) {
                setApiError('数据流解析错误：' + e.message);
              }
              console.error('Failed to parse SSE:', e);
            }
          }
        }
      }

      // Try to parse and apply the generated code (already post-processed)
      const processedCode = postProcessExcalidrawCode(accumulatedCode);
      tryParseAndApply(processedCode);

      // Automatically optimize the generated code
      const optimizedCode = optimizeExcalidrawCode(processedCode);
      setGeneratedCode(optimizedCode);
      tryParseAndApply(optimizedCode);

      // Save to history after successful generation
      try {
        const parsedElements = JSON.parse(optimizedCode.match(/\[[\s\S]*\]/)?.[0] || '[]');
        const thumbnail = excalidrawAPI ? await generateThumbnail(excalidrawAPI, 200) : null;
        
        await saveDiagramToHistory({
          title: `图表 - ${new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
          description: userMessage.substring(0, 100),
          code: optimizedCode,
          elements: parsedElements,
          thumbnail: thumbnail,
          chartType: chartType,
          userInput: userMessage,
        });
      } catch (error) {
        console.error('Failed to save to history:', error);
      }
    } catch (error) {
      console.error('Error generating code:', error);
      // Check if it's a network error
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        setApiError('网络连接失败，请检查网络连接');
      } else {
        setApiError(error.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Try to parse and apply code to canvas
  const tryParseAndApply = (code) => {
    try {
      // Clear previous JSON errors
      setJsonError(null);

      // Code is already post-processed, just extract the array and parse
      const cleanedCode = code.trim();

      // Extract array from code if wrapped in other text
      const arrayMatch = cleanedCode.match(/\[[\s\S]*\]/);
      if (!arrayMatch) {
        setJsonError('代码中未找到有效的 JSON 数组');
        console.error('No array found in generated code');
        return;
      }

      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) {
        setElements(parsed);
        setJsonError(null); // Clear error on success
      }
    } catch (error) {
      console.error('Failed to parse generated code:', error);
      // Extract native JSON error message
      if (error instanceof SyntaxError) {
        setJsonError('JSON 语法错误：' + error.message);
      } else {
        setJsonError('解析失败：' + error.message);
      }
    }
  };

  // Handle applying code from editor
  const handleApplyCode = async () => {
    setIsApplyingCode(true);
    try {
      // Simulate async operation for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      tryParseAndApply(generatedCode);
    } catch (error) {
      console.error('Error applying code:', error);
    } finally {
      setIsApplyingCode(false);
    }
  };

  // Handle optimizing code
  const handleOptimizeCode = async () => {
    setIsOptimizingCode(true);
    try {
      // Simulate async operation for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      const optimizedCode = optimizeExcalidrawCode(generatedCode);
      setGeneratedCode(optimizedCode);
      tryParseAndApply(optimizedCode);
    } catch (error) {
      console.error('Error optimizing code:', error);
    } finally {
      setIsOptimizingCode(false);
    }
  };

  // Handle clearing code
  const handleClearCode = () => {
    setGeneratedCode('');
  };

  // Handle saving config
  const handleSaveConfig = async (newConfig) => {
    setConfig(newConfig);
    try {
      const allProviderConfigs = await getAllConfigs();
      setAllConfigs(allProviderConfigs);
    } catch (error) {
      console.error('Failed to refresh configs:', error);
    }
  };

  // Handle toggling left panel visibility
  const toggleLeftPanel = () => {
    setIsLeftPanelVisible(!isLeftPanelVisible);
  };

  // Handle horizontal resizing (left panel vs right panel)
  const handleHorizontalMouseDown = (e) => {
    setIsResizingHorizontal(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingHorizontal) return;
      
      const percentage = (e.clientX / window.innerWidth) * 100;
      
      // Clamp between 30% and 70%
      setLeftPanelWidth(Math.min(Math.max(percentage, 30), 70));
    };

    const handleMouseUp = () => {
      setIsResizingHorizontal(false);
    };

    if (isResizingHorizontal) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingHorizontal]);

  // Handle cloud file picker
  const handleCloudFileOpen = async (files) => {
    try {
      if (files && files.length > 0) {
        const file = files[0];
        const text = await file.text();
        
        // Try to parse as Excalidraw format
        try {
          const data = JSON.parse(text);
          // Check if it's valid Excalidraw data
          if (data.elements || Array.isArray(data)) {
            const elements = data.elements || data;
            const code = JSON.stringify(elements, null, 2);
            setGeneratedCode(code);
            tryParseAndApply(code);
          } else {
            alert('无效的 Excalidraw 文件格式');
          }
        } catch (error) {
          console.error('Failed to parse file:', error);
          alert('文件解析失败，请确保是有效的 Excalidraw 文件');
        }
      }
    } catch (error) {
      console.error('Failed to read file:', error);
      alert('文件读取失败');
    }
  };

  const handleCloudFileSave = async (files) => {
    try {
      if (!excalidrawAPI) {
        alert('画布未就绪，请稍后再试');
        return;
      }

      // Get current elements from canvas
      const sceneData = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      
      // Create Excalidraw file data
      const fileData = {
        type: 'excalidraw',
        version: 2,
        source: 'https://excalidraw.com',
        elements: sceneData,
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          gridSize: appState.gridSize,
        }
      };

      // TODO: 实际保存到云盘的逻辑需要根据懒猫平台的 API 来实现
      // 目前使用文件选择器的保存功能
      console.log('Saving to cloud:', fileData);
      alert('云盘保存功能需要根据懒猫平台 API 实现');
    } catch (error) {
      console.error('Failed to save file:', error);
      alert('保存失败');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Smart Excalidraw</h1>
          <p className="text-xs text-gray-500">AI 驱动的图表生成</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* File Operations Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="文件操作"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="text-sm font-medium">文件</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <div className="py-1">
                {/* Open from Local */}
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.excalidraw,.json';
                    input.onchange = async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        try {
                          const text = await file.text();
                          const data = JSON.parse(text);
                          if (data.elements || Array.isArray(data)) {
                            const elements = data.elements || data;
                            const code = JSON.stringify(elements, null, 2);
                            setGeneratedCode(code);
                            tryParseAndApply(code);
                          } else {
                            alert('无效的 Excalidraw 文件格式');
                          }
                        } catch (error) {
                          console.error('Failed to parse file:', error);
                          alert('文件解析失败，请确保是有效的 Excalidraw 文件');
                        }
                      }
                    };
                    input.click();
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  从本地打开
                </button>

                {/* Open from Cloud */}
                <button
                  onClick={() => {
                    setCloudPickerMode('open');
                    setIsCloudPickerOpen(true);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  从云盘打开
                </button>

                <div className="border-t border-gray-200 my-1"></div>

                {/* Save to Local */}
                <button
                  onClick={() => {
                    if (!excalidrawAPI) {
                      alert('画布未就绪，请稍后再试');
                      return;
                    }
                    const sceneData = excalidrawAPI.getSceneElements();
                    const appState = excalidrawAPI.getAppState();
                    const fileData = {
                      type: 'excalidraw',
                      version: 2,
                      source: 'https://excalidraw.com',
                      elements: sceneData,
                      appState: {
                        viewBackgroundColor: appState.viewBackgroundColor,
                        gridSize: appState.gridSize,
                      }
                    };
                    const blob = new Blob([JSON.stringify(fileData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `drawing-${Date.now()}.excalidraw`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  disabled={!elements || elements.length === 0}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  保存到本地
                </button>

                {/* Save to Cloud */}
                <button
                  onClick={() => {
                    setCloudPickerMode('save');
                    setIsCloudPickerOpen(true);
                  }}
                  disabled={!elements || elements.length === 0}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  保存到云盘
                </button>
              </div>
            </div>
          </div>

          {/* History Button */}
          <button
            onClick={() => setIsHistoryPanelOpen(true)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="历史记录"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Export Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            disabled={!elements || elements.length === 0}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="导出图表"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          {config && isConfigValid(config) && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-300">
              <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
              <span className="text-xs text-gray-900 font-medium">
                {config.name || config.type} - {config.model}
              </span>
              {allConfigs.providers.length > 1 && (
                <div className="relative group">
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="py-1">
                      {allConfigs.providers.map((provider) => (
                        <button
                          key={provider.id}
                          onClick={async () => {
                            try {
                              await setCurrentProvider(provider.id);
                              setConfig(provider);
                              const allProviderConfigs = await getAllConfigs();
                              setAllConfigs(allProviderConfigs);
                            } catch (error) {
                              console.error('Failed to switch provider:', error);
                            }
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            allConfigs.currentProviderId === provider.id ? 'bg-gray-100 font-medium' : ''
                          }`}
                        >
                          {provider.name}
                          {allConfigs.currentProviderId === provider.id && (
                            <span className="ml-2 text-xs text-gray-500">(当前)</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-gray-900 rounded hover:bg-gray-800 transition-colors duration-200"
          >
            配置 LLM
          </button>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="flex flex-1 overflow-hidden pb-1 relative">
        {/* Left Panel - Chat and Code Editor */}
        {isLeftPanelVisible && (
          <div id="left-panel" style={{ width: `${leftPanelWidth}%` }} className="flex flex-col border-r border-gray-200 bg-white">
          {/* API Error Banner */}
          {apiError && (
            <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">请求失败</p>
                  <p className="text-sm text-red-700 mt-1">{apiError}</p>
                </div>
              </div>
              <button
                onClick={() => setApiError(null)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* Input Section */}
          <div style={{ height: '60%' }} className="overflow-hidden">
            <Chat
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
            />
          </div>

          {/* Code Editor Section */}
          <div style={{ height: '40%' }} className="overflow-hidden">
            <CodeEditor
              code={generatedCode}
              onChange={setGeneratedCode}
              onApply={handleApplyCode}
              onOptimize={handleOptimizeCode}
              onClear={handleClearCode}
              jsonError={jsonError}
              onClearJsonError={() => setJsonError(null)}
              isGenerating={isGenerating}
              isApplyingCode={isApplyingCode}
              isOptimizingCode={isOptimizingCode}
            />
          </div>
          </div>
        )}

        {/* Toggle Button for Left Panel */}
        <button
          onClick={toggleLeftPanel}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-r-md shadow-md p-2 hover:bg-gray-50 transition-colors duration-200"
          style={{ left: isLeftPanelVisible ? `${leftPanelWidth}%` : '0' }}
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ transform: isLeftPanelVisible ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Horizontal Resizer - Only show when left panel is visible */}
        {isLeftPanelVisible && (
          <div
            onMouseDown={handleHorizontalMouseDown}
            className="w-1 bg-gray-200 hover:bg-gray-400 cursor-col-resize transition-colors duration-200 flex-shrink-0"
          />
        )}

        {/* Right Panel - Excalidraw Canvas */}
        <div style={{ width: isLeftPanelVisible ? `${100 - leftPanelWidth}%` : '100%' }} className="bg-gray-50">
          <ExcalidrawCanvas
            elements={elements}
            onAPIReady={setExcalidrawAPI}
          />
        </div>
      </div>

      {/* Config Modal */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveConfig}
        initialConfig={config}
      />
      
      {/* History Panel */}
      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        onLoadDiagram={(diagram) => {
          setGeneratedCode(diagram.code);
          tryParseAndApply(diagram.code);
        }}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        excalidrawAPI={excalidrawAPI}
      />

      {/* Cloud File Picker */}
      <CloudFilePicker
        isOpen={isCloudPickerOpen}
        onClose={() => setIsCloudPickerOpen(false)}
        onFileSelect={cloudPickerMode === 'open' ? handleCloudFileOpen : handleCloudFileSave}
        mode={cloudPickerMode}
        accept=".excalidraw,.json"
      />
    </div>
  );
}
