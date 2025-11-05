# Smart Excalidraw 需求文档

## 一、项目概述

本项目旨在利用大语言模型能力，通过调用 Excalidraw API 自动生成绘图代码,实现智能化的 Excalidraw 图形绘制功能。

---

## 二、功能需求

### 2.1 主页面

主页面负责 Excalidraw 的渲染展示和用户交互,包含以下两个核心区域:

#### 2.1.1 页面布局
- **对话交互区域**: 包含对话输入框和历史对话记录
- **代码编辑区域**: 显示和编辑生成的 Excalidraw 代码
- **画布渲染区域**: 实时渲染 Excalidraw 图形

#### 2.1.2 绘制逻辑
参考 `./doc/excalidraw-doc.md` 官方文档,调用 Excalidraw 相关 API 完成图形绘制。

### 2.2 大模型配置

支持通过 API 方式调用大语言模型,提供灵活的配置选项:

#### 2.2.1 支持的提供商
- OpenAI
- Anthropic

#### 2.2.2 配置项
- **提供商名称**: 自定义显示名称
- **提供商类型**: OpenAI / Anthropic
- **Base URL**: API 接口地址
- **API Key**: 访问密钥
- **模型列表**: 通过 OpenAI 接口方式动态拉取可用模型

---

## 三、技术实现

### 3.1 前端实现

#### 3.1.1 页面组成
- 主页面
- 大模型配置弹窗

#### 3.1.2 Excalidraw 集成

使用 `@excalidraw/excalidraw` 包完成渲染,相关文档请通过 context7 工具获取最新版本。

**重要提示**: Excalidraw 组件及其父组件必须使用动态引入方式。

**代码示例**:
```javascript
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  },
);

export default function App() {
  return <Excalidraw />;
}
```

### 3.2 后端实现

#### 3.2.1 API 接口

**1. 获取模型列表**
- 功能: 返回当前配置提供商的可用模型列表

**2. 生成 Excalidraw 代码**
- 功能: 根据用户输入生成对应的 Excalidraw 绘图代码

#### 3.2.2 代码生成逻辑

1. **提示词构建**: 参考 `./doc/excalidraw-doc.md` 官方文档,创建结构化提示词
2. **模型调用**: 使用构建的提示词调用大模型 API
3. **代码返回**: 将生成的 Excalidraw 代码返回给前端

---

## 四、提示词设计规范

### 4.1 设计目标
理解用户输入(文章、需求描述等),生成相应的 Excalidraw 代码,通过可视化方式帮助用户清晰、直观地获取信息。

### 4.2 应用场景
- 教育领域: 知识点可视化、概念图绘制
- 科学研究: 流程图、架构图、数据关系图

### 4.3 输出要求
- 代码结构清晰
- 视觉呈现直观
- 信息传达准确

---

## 五、参考文档

- Excalidraw 官方文档: `./doc/excalidraw-doc.md`
- @excalidraw/excalidraw 最新文档: 通过 context7 工具获