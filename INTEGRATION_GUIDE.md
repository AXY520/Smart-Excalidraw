# 新功能集成指南

本文档说明如何将新增的功能集成到 Smart Excalidraw 主应用中。

## 📋 文件清单

### 新增文件

```
lib/
├── history.js              # 历史记录管理
├── export-utils.js         # 导出工具
└── ai-optimizer.js         # AI 优化工具

components/
├── HistoryPanel.jsx        # 历史记录面板
├── ExportModal.jsx         # 导出配置模态框
└── ImageUpload.jsx         # 图片上传组件（已更新）

FEATURES.md                 # 功能说明文档
INTEGRATION_GUIDE.md        # 本文件
```

### 修改文件

```
lib/config.js              # 添加视觉模型配置支持
components/ImageUpload.jsx # 已存在，已增强功能
```

---

## 🔧 集成步骤

### 步骤 1: 更新主页面 (app/page.js)

在 [`app/page.js`](app/page.js) 中添加以下导入和状态：

```javascript
// 添加新的导入
import HistoryPanel from '@/components/HistoryPanel';
import ExportModal from '@/components/ExportModal';
import ImageUpload from '@/components/ImageUpload';
import { saveDiagramToHistory } from '@/lib/history';
import { generateThumbnail } from '@/lib/export-utils';
import { getVisionConfig } from '@/lib/config';

// 添加新的状态
const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
const [isExportModalOpen, setIsExportModalOpen] = useState(false);
const [excalidrawAPI, setExcalidrawAPI] = useState(null);
const [uploadedImage, setUploadedImage] = useState(null);
const [currentDiagramId, setCurrentDiagramId] = useState(null);
```

### 步骤 2: 在 Header 添加新按钮

在 header 部分的按钮组中添加：

```javascript
<div className="flex items-center space-x-3">
  {/* 历史记录按钮 */}
  <button
    onClick={() => setIsHistoryPanelOpen(true)}
    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
    title="历史记录"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </button>

  {/* 导出按钮 */}
  <button
    onClick={() => setIsExportModalOpen(true)}
    disabled={!elements || elements.length === 0}
    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    title="导出图表"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  </button>

  {/* 现有的配置按钮 */}
  <button onClick={() => setIsConfigModalOpen(true)}>
    配置 LLM
  </button>
</div>
```

### 步骤 3: 更新 ExcalidrawCanvas 组件

修改 ExcalidrawCanvas 的使用，传递 API 引用：

```javascript
<ExcalidrawCanvas 
  elements={elements}
  onAPIReady={setExcalidrawAPI}
/>
```

同时需要更新 [`components/ExcalidrawCanvas.jsx`](components/ExcalidrawCanvas.jsx)：

```javascript
export default function ExcalidrawCanvas({ elements, onAPIReady }) {
  // ... 现有代码 ...

  // 在 Excalidraw 组件中
  <Excalidraw
    excalidrawAPI={(api) => {
      setExcalidrawAPI(api);
      if (onAPIReady) onAPIReady(api);
    }}
    // ... 其他 props ...
  />
}
```

### 步骤 4: 添加自动保存功能

在成功生成图表后自动保存到历史：

```javascript
const handleSendMessage = async (userMessage, chartType = 'auto', imageData = null) => {
  // ... 现有生成逻辑 ...

  // 生成成功后
  try {
    // 生成缩略图
    const thumbnail = excalidrawAPI ? await generateThumbnail(excalidrawAPI) : null;
    
    // 保存到历史
    const diagramId = await saveDiagramToHistory({
      title: `图表 - ${new Date().toLocaleString('zh-CN')}`,
      description: userMessage.substring(0, 100),
      code: optimizedCode,
      elements: elements,
      thumbnail: thumbnail,
      chartType: chartType,
      userInput: userMessage,
    });
    
    setCurrentDiagramId(diagramId);
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
};
```

### 步骤 5: 集成图片上传

在 Chat 组件中添加图片上传支持：

```javascript
// 在 Chat 组件内部
const [uploadedImage, setUploadedImage] = useState(null);

// 在发送按钮上方添加
<ImageUpload
  onImageSelect={setUploadedImage}
  onRemove={() => setUploadedImage(null)}
  disabled={isGenerating}
/>

// 修改发送消息逻辑
const handleSend = () => {
  if (uploadedImage) {
    onSendMessage(userInput, chartType, uploadedImage);
    setUploadedImage(null);
  } else {
    onSendMessage(userInput, chartType);
  }
};
```

### 步骤 6: 更新 API 路由支持图片

修改 [`app/api/generate/route.js`](app/api/generate/route.js) 以支持图片输入：

```javascript
export async function POST(request) {
  const { config, userInput, chartType, imageData } = await request.json();
  
  // 如果有图片，使用视觉模型
  const effectiveConfig = imageData 
    ? await getVisionConfig() || config
    : config;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: USER_PROMPT_TEMPLATE(userInput, chartType),
      image: imageData, // 添加图片数据
    },
  ];

  // ... 其余逻辑 ...
}
```

### 步骤 7: 添加模态框到页面底部

在 return 语句的最后，添加新的模态框组件：

```javascript
return (
  <div className="flex flex-col h-screen bg-gray-50">
    {/* ... 现有内容 ... */}

    {/* 历史记录面板 */}
    <HistoryPanel
      isOpen={isHistoryPanelOpen}
      onClose={() => setIsHistoryPanelOpen(false)}
      onLoadDiagram={async (diagram) => {
        setGeneratedCode(diagram.code);
        tryParseAndApply(diagram.code);
        setCurrentDiagramId(diagram.id);
      }}
    />

    {/* 导出模态框 */}
    <ExportModal
      isOpen={isExportModalOpen}
      onClose={() => setIsExportModalOpen(false)}
      excalidrawAPI={excalidrawAPI}
    />

    {/* 现有的 ConfigModal 和 ContactModal */}
  </div>
);
```

---

## 🎨 可选：添加 AI 优化按钮

### 在代码编辑器添加优化按钮

修改 [`components/CodeEditor.jsx`](components/CodeEditor.jsx)，添加 AI 优化和配色按钮：

```javascript
import { optimizeLayoutWithAI, applyColorPalette, getAllColorPalettes } from '@/lib/ai-optimizer';

// 添加状态
const [isAIOptimizing, setIsAIOptimizing] = useState(false);
const [showColorPalettes, setShowColorPalettes] = useState(false);

// 添加按钮
<button
  onClick={async () => {
    setIsAIOptimizing(true);
    try {
      const elements = JSON.parse(code);
      const optimized = await optimizeLayoutWithAI(elements, config);
      onChange(JSON.stringify(optimized, null, 2));
    } catch (error) {
      console.error('AI optimization failed:', error);
      alert('AI 优化失败');
    } finally {
      setIsAIOptimizing(false);
    }
  }}
  disabled={isAIOptimizing || !code}
  className="px-3 py-1.5 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded"
>
  {isAIOptimizing ? 'AI 优化中...' : 'AI 布局优化'}
</button>

<button
  onClick={() => setShowColorPalettes(!showColorPalettes)}
  className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
>
  配色方案
</button>

{/* 配色方案下拉菜单 */}
{showColorPalettes && (
  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
    {Object.entries(getAllColorPalettes()).map(([key, palette]) => (
      <button
        key={key}
        onClick={() => {
          const elements = JSON.parse(code);
          const colored = applyColorPalette(elements, key);
          onChange(JSON.stringify(colored, null, 2));
          setShowColorPalettes(false);
        }}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        {palette.name}
      </button>
    ))}
  </div>
)}
```

---

## 🧪 测试清单

完成集成后，请测试以下功能：

### 历史记录
- [ ] 生成图表后自动保存到历史
- [ ] 打开历史记录面板查看列表
- [ ] 搜索历史记录
- [ ] 加载历史图表
- [ ] 编辑图表标题
- [ ] 删除单个历史记录
- [ ] 批量删除历史记录
- [ ] 导出历史记录为 JSON
- [ ] 导入历史记录

### 导出功能
- [ ] 导出为 PNG（不同缩放比例）
- [ ] 导出为 SVG
- [ ] 导出为 PDF
- [ ] 导出为 JSON
- [ ] 复制 PNG 到剪贴板
- [ ] 调整导出参数（质量、边距、背景色等）

### 图片识别
- [ ] 点击上传图片
- [ ] 拖拽上传图片
- [ ] 粘贴剪贴板图片
- [ ] 图片预览显示正确
- [ ] AI 识别图片并生成图表
- [ ] 使用独立的视觉模型

### AI 优化
- [ ] AI 布局优化
- [ ] 应用预设配色方案
- [ ] 自动修复图表问题
- [ ] 检测元素重叠

### 多模型配置
- [ ] 添加多个提供商
- [ ] 在提供商间切换
- [ ] 设置视觉模型
- [ ] 删除提供商

---

## 📊 数据结构

### 历史记录数据结构

```javascript
{
  id: 'diagram-1234567890-abc',
  title: '我的流程图',
  description: '用户登录流程',
  code: '[...]',  // JSON 字符串
  elements: [...], // 解析后的数组
  thumbnail: 'data:image/png;base64,...',
  chartType: 'flowchart',
  userInput: '画一个用户登录的流程图',
  timestamp: 1234567890000,
  tags: ['流程图', '登录']
}
```

### 配置数据结构（更新）

```javascript
{
  providers: [
    {
      id: 'provider_1',
      name: 'GPT-4',
      type: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: 'sk-...',
      model: 'gpt-4',
      supportsVision: false  // 新增字段
    }
  ],
  currentProviderId: 'provider_1',
  visionProviderId: 'provider_2'  // 新增字段
}
```

---

## 🐛 常见问题

### Q: IndexedDB 在 Safari 隐私模式下不工作
**A**: 添加错误处理，在 IndexedDB 不可用时降级到 localStorage：

```javascript
try {
  await saveDiagramToHistory(diagram);
} catch (error) {
  console.warn('IndexedDB not available, using localStorage');
  localStorage.setItem('lastDiagram', JSON.stringify(diagram));
}
```

### Q: 导出大型图表时浏览器卡顿
**A**: 添加加载提示，并考虑使用 Web Workers：

```javascript
setIsExporting(true);
await new Promise(resolve => setTimeout(resolve, 100)); // 让 UI 更新
await exportDiagram(...);
setIsExporting(false);
```

### Q: AI 优化响应慢
**A**: 添加超时处理和进度提示：

```javascript
const timeout = setTimeout(() => {
  alert('AI 优化超时，请重试');
}, 30000);

try {
  await optimizeLayoutWithAI(elements, config);
} finally {
  clearTimeout(timeout);
}
```

---

## 🚀 性能优化建议

1. **懒加载模态框**：使用 `dynamic` 导入大型组件
2. **缓存缩略图**：避免重复生成相同的缩略图
3. **虚拟滚动**：历史记录列表超过 50 项时使用虚拟滚动
4. **防抖搜索**：历史记录搜索添加防抖
5. **压缩存储**：大型图表数据可考虑压缩后存储

---

## 📚 相关文档

- [FEATURES.md](FEATURES.md) - 详细功能说明
- [README.md](README.md) - 项目总览
- [DEVELOPMENT.md](DEVELOPMENT.md) - 开发指南

---

**集成愉快！如有问题，请查看 FEATURES.md 或提交 Issue。** 🎉