# Smart Excalidraw - 新增功能说明

## 🎉 功能概览

本次更新为 Smart Excalidraw 添加了以下核心功能：

### 1. 📚 历史记录系统
### 2. 📤 高级导出功能
### 3. 🤖 AI 智能优化
### 4. 🖼️ 图片识别增强
### 5. 🎨 多模型配置

---

## 1. 📚 历史记录系统

### 功能特性

- **自动保存**：每次生成的图表自动保存到本地数据库（IndexedDB）
- **智能管理**：最多保存 100 个历史记录，自动清理旧记录
- **快速搜索**：支持按标题、描述、用户输入搜索
- **批量操作**：支持批量删除、导出
- **数据导入导出**：支持 JSON 格式导入导出历史记录

### 使用方法

#### 查看历史记录
点击主界面右上角的"历史记录"按钮，打开历史记录面板。

#### 加载历史图表
在历史记录列表中点击"加载"按钮，即可将该图表重新加载到画布。

#### 编辑标题
点击图表卡片右上角的编辑图标，可以修改图表标题。

#### 导出历史记录
单个导出：点击图表卡片的导出图标
批量导出：选择多个图表后点击"导出选中"

#### 导入历史记录
点击工具栏的"导入"按钮，选择之前导出的 JSON 文件。

### 技术实现

**文件位置**：
- [`lib/history.js`](lib/history.js) - 历史记录核心逻辑
- [`components/HistoryPanel.jsx`](components/HistoryPanel.jsx) - 历史记录界面

**API 函数**：
```javascript
import { 
  saveDiagramToHistory,
  getHistoryList,
  getDiagramById,
  deleteDiagram,
  clearAllHistory
} from '@/lib/history';

// 保存图表
await saveDiagramToHistory({
  title: '我的流程图',
  code: '[...]',
  elements: [...],
  chartType: 'flowchart',
  userInput: '...'
});

// 获取历史列表
const items = await getHistoryList({
  search: '关键词',
  sortBy: 'timestamp',
  sortOrder: 'desc'
});
```

---

## 2. 📤 高级导出功能

### 支持格式

- **PNG** - 高质量位图（支持 1x-4x 缩放）
- **SVG** - 矢量图（可选嵌入场景数据）
- **PDF** - PDF 文档
- **JSON** - Excalidraw 原生格式

### 导出配置

#### PNG/PDF 选项
- **缩放比例**：1x - 4x（控制输出分辨率）
- **图像质量**：10% - 100%（压缩质量）
- **边距**：0 - 100px
- **背景颜色**：自定义背景色
- **包含背景**：是否渲染背景
- **深色模式**：导出深色主题版本

#### SVG 选项
- **嵌入场景数据**：在 SVG 中嵌入完整的 Excalidraw 数据，可重新导入编辑

#### 特殊功能
- **复制到剪贴板**：PNG 格式支持直接复制到剪贴板

### 使用方法

1. 点击画布工具栏的"导出"按钮
2. 选择导出格式
3. 调整导出参数
4. 点击"导出"或"复制到剪贴板"

### 技术实现

**文件位置**：
- [`lib/export-utils.js`](lib/export-utils.js) - 导出工具库
- [`components/ExportModal.jsx`](components/ExportModal.jsx) - 导出配置界面

**API 函数**：
```javascript
import { 
  exportDiagram,
  exportAsPNG,
  exportAsSVG,
  copyToClipboard,
  generateThumbnail
} from '@/lib/export-utils';

// 导出为 PNG
await exportDiagram(excalidrawAPI, 'png', {
  scale: 2,
  quality: 0.95,
  backgroundColor: '#ffffff',
  withBackground: true
});

// 复制到剪贴板
await copyToClipboard(excalidrawAPI, { scale: 2 });

// 生成缩略图
const thumbnail = await generateThumbnail(excalidrawAPI, 200);
```

---

## 3. 🤖 AI 智能优化

### 功能特性

#### 布局优化
- **消除重叠**：自动检测并修复元素重叠问题
- **均衡间距**：优化元素间距，保持视觉平衡
- **智能对齐**：相关元素自动对齐
- **层次清晰**：按逻辑层次重新排列元素

#### 配色建议
- **AI 配色**：基于图表内容和用途，AI 推荐最佳配色方案
- **预设调色板**：6 种专业配色方案
  - 专业商务
  - 现代简约
  - 温暖活力
  - 冷静沉稳
  - 柔和淡雅
  - 深色主题

#### 自动修复
- 修复元素尺寸过小
- 修复箭头宽度为 0
- 修复文本为空
- 修复不透明度超出范围
- 检测并报告重叠元素

### 使用方法

#### AI 布局优化
```javascript
import { optimizeLayoutWithAI } from '@/lib/ai-optimizer';

const optimizedElements = await optimizeLayoutWithAI(elements, config);
```

#### 应用配色方案
```javascript
import { applyColorPalette, getAllColorPalettes } from '@/lib/ai-optimizer';

// 获取所有调色板
const palettes = getAllColorPalettes();

// 应用调色板
const coloredElements = applyColorPalette(elements, 'professional');
```

#### 自动修复
```javascript
import { autoFixDiagram } from '@/lib/ai-optimizer';

const { elements: fixedElements, fixes, hasIssues } = autoFixDiagram(elements);
```

### 技术实现

**文件位置**：
- [`lib/ai-optimizer.js`](lib/ai-optimizer.js) - AI 优化核心库

---

## 4. 🖼️ 图片识别增强

### 功能特性

- **多格式支持**：PNG, JPG, GIF, WebP
- **多种上传方式**：
  - 点击上传
  - 拖拽上传
  - 粘贴剪贴板
- **独立模型配置**：可为图片识别单独配置视觉模型
- **智能识别**：自动识别图片中的图表结构并转换

### 支持的图片类型

- 手绘草图
- 流程图截图
- 架构图照片
- 白板图片
- 其他任何包含图表信息的图片

### 使用方法

1. 在聊天界面点击图片上传按钮
2. 选择或拖拽图片
3. 输入对图片的描述或要求（可选）
4. 点击发送，AI 将分析图片并生成对应的 Excalidraw 图表

### 配置视觉模型

在配置模态框中：
1. 添加支持视觉功能的模型（如 GPT-4 Vision、Claude 3 Sonnet/Opus）
2. 勾选"支持视觉功能"选项
3. 在"视觉模型"下拉框中选择该模型

### 技术实现

**文件位置**：
- [`components/ImageUpload.jsx`](components/ImageUpload.jsx) - 图片上传组件
- [`lib/config.js`](lib/config.js) - 视觉模型配置（已更新）
- [`lib/llm-client.js`](lib/llm-client.js) - 多模态 API 调用（已支持图片）

**更新的 API**：
```javascript
import { getVisionConfig, setVisionProvider } from '@/lib/config';

// 获取视觉模型配置
const visionConfig = await getVisionConfig();

// 设置视觉模型
await setVisionProvider('provider-id');
```

---

## 5. 🎨 多模型配置

### 功能特性

- **多提供商管理**：同时配置多个 LLM 提供商
- **快速切换**：在不同模型间快速切换
- **独立视觉模型**：为图片识别任务配置专门的视觉模型
- **模型标签**：标记模型是否支持视觉功能

### 配置步骤

1. 点击"配置 LLM"按钮
2. 添加提供商：
   - 提供商名称（自定义）
   - 提供商类型（OpenAI/Anthropic）
   - Base URL
   - API Key
   - 选择模型
   - 勾选"支持视觉功能"（如果适用）
3. 保存配置

### 切换模型

在主界面右上角的当前模型显示区域，点击下拉箭头即可切换到其他已配置的模型。

### 技术实现

**更新的配置文件**：
- [`lib/config.js`](lib/config.js) - 新增视觉模型管理函数

**新增函数**：
```javascript
// 获取视觉模型配置
getVisionConfig()

// 设置视觉模型提供商
setVisionProvider(providerId)

// 获取支持视觉的提供商列表
getVisionCapableProviders()

// 检查提供商是否支持视觉
isVisionCapable(providerId)
```

---

## 🚀 快速开始

### 基础使用流程

1. **配置 LLM**
   - 添加至少一个 LLM 提供商
   - （可选）添加支持视觉的模型用于图片识别

2. **创建图表**
   - 输入文字描述，或
   - 上传图片让 AI 识别

3. **优化图表**
   - 使用 AI 布局优化
   - 应用配色方案
   - 手动调整细节

4. **导出保存**
   - 导出为 PNG/SVG/PDF
   - 自动保存到历史记录
   - 随时加载历史图表继续编辑

---

## 📝 代码示例

### 完整工作流程示例

```javascript
import { 
  saveDiagramToHistory,
  getHistoryList
} from '@/lib/history';

import { 
  exportDiagram,
  generateThumbnail
} from '@/lib/export-utils';

import {
  optimizeLayoutWithAI,
  applyColorPalette,
  autoFixDiagram
} from '@/lib/ai-optimizer';

// 1. 生成图表（通过 AI）
const elements = await generateDiagramWithAI(userInput);

// 2. 自动修复
const { elements: fixedElements } = autoFixDiagram(elements);

// 3. 应用配色
const coloredElements = applyColorPalette(fixedElements, 'professional');

// 4. AI 布局优化
const optimizedElements = await optimizeLayoutWithAI(coloredElements, config);

// 5. 生成缩略图
const thumbnail = await generateThumbnail(excalidrawAPI, 200);

// 6. 保存到历史
await saveDiagramToHistory({
  title: '优化后的流程图',
  code: JSON.stringify(optimizedElements),
  elements: optimizedElements,
  thumbnail: thumbnail,
  chartType: 'flowchart',
  userInput: userInput
});

// 7. 导出为 PNG
await exportDiagram(excalidrawAPI, 'png', {
  scale: 2,
  quality: 0.95
});
```

---

## 🔧 配置文件

### 多模型配置格式

配置存储在 [`data/llm-configs.json`](data/llm-configs.json)：

```json
{
  "providers": [
    {
      "id": "provider_1",
      "name": "GPT-4",
      "type": "openai",
      "baseUrl": "https://api.openai.com/v1",
      "apiKey": "sk-...",
      "model": "gpt-4",
      "supportsVision": false
    },
    {
      "id": "provider_2",
      "name": "GPT-4 Vision",
      "type": "openai",
      "baseUrl": "https://api.openai.com/v1",
      "apiKey": "sk-...",
      "model": "gpt-4-vision-preview",
      "supportsVision": true
    },
    {
      "id": "provider_3",
      "name": "Claude 3 Opus",
      "type": "anthropic",
      "baseUrl": "https://api.anthropic.com/v1",
      "apiKey": "sk-ant-...",
      "model": "claude-3-opus-20240229",
      "supportsVision": true
    }
  ],
  "currentProviderId": "provider_1",
  "visionProviderId": "provider_2"
}
```

---

## 📊 性能优化

### IndexedDB 性能

- 最大存储 100 个历史记录
- 自动清理超出限制的旧记录
- 支持索引查询（按时间戳、标题）

### 导出性能

- PNG/SVG 导出使用 Web Workers（未来优化方向）
- 缩略图自动压缩
- 支持大型图表导出

### AI 优化性能

- 布局优化使用精简的元素数据
- 配色方案预计算
- 批量元素处理

---

## 🐛 已知问题

1. **PDF 导出**：当前 PDF 导出实际上是高质量 PNG（未来将集成 jsPDF 库）
2. **大型图表**：超过 500 个元素的图表可能导致 AI 优化较慢
3. **浏览器兼容性**：IndexedDB 在某些旧版浏览器中可能不可用

---

## 🔜 未来计划

- [ ] 云端同步（需要后端支持）
- [ ] 实时协作编辑
- [ ] 图表模板库
- [ ] 更多导出格式（Markdown、Mermaid等）
- [ ] 语音输入生成图表
- [ ] AI 辅助绘制（智能补全）

---

## 📄 许可证

本项目遵循原项目许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Happy Diagramming! 🎨**