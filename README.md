# Smart Excalidraw

> **用自然语言，绘制专业图表**

## 在线网站
进入在线网站直接使用：https://smart-excalidraw.aizhi.site/

🚀🚀🚀 限时福利
添加底部作者微信进群可领取免费claude-4.5-sonnet key

## English Version
Read the English version: [README_EN.md](README_EN.md)

## 效果预览
操作界面
<img width="2330" height="1255" alt="PixPin_2025-10-31_17-14-27" src="https://github.com/user-attachments/assets/5319ad5c-c507-42e0-b67a-e9dfb2d7ecfa" />
技术架构图
<img width="1920" height="1134" alt="Untitled-2025-11-03-1105" src="https://github.com/user-attachments/assets/d2e01c4e-d300-4c20-bd98-d056e4f02102" />
信息图
<img width="2183" height="828" alt="Untitled-2025-11-03-1054" src="https://github.com/user-attachments/assets/0e46e8da-fe64-40a9-911b-f6c0e5589bae" />



## ✨ 核心特性

### 🎯 AI 驱动，效果出众
通过先进的大语言模型理解你的需求，生成结构清晰、布局合理的专业级图表。

### 🔗 独创连接算法
采用独创的智能箭头优化算法，自动计算最佳连接点，确保图表井然有序、逻辑清晰，告别混乱的线条交叉。

### 📊 丰富图表类型
支持 20+ 种图表类型，包括流程图、架构图、时序图、ER 图、思维导图等。也可以让AI根据你的描述自动选择最合适的图表类型。

### 🎨 完美 Excalidraw 集成
生成的图表完全基于 Excalidraw 格式，可以在画布上自由编辑、调整样式、添加细节，实现 AI 生成与手动精修的完美结合。

### ⚡ 开箱即用
只需配置一个 AI API 密钥即可开始使用，无需复杂的环境搭建。所有配置保存在本地浏览器，隐私安全有保障。



## 🚀 快速开始

### 第一步：配置 AI

1. 点击右上角的 **"配置 LLM"** 按钮
2. 选择提供商类型（OpenAI 或 Anthropic）
3. 填入你的 API Key
4. 选择模型（**推荐使用 claude-sonnet-4.5**，效果最佳）
5. 保存配置

就这么简单！现在你可以开始创作了。

### 第二步：创建图表

在输入框中用自然语言描述你的需求，例如：
- "画一个用户登录的流程图"
- "创建一个微服务架构图，包含网关、认证服务和业务服务"
- "设计一个电商系统的数据库 ER 图"

AI 会自动生成图表，你可以在画布上直接编辑和调整。

## 💻 本地部署

如果你想在本地运行项目：

```bash
# 克隆项目
git clone https://github.com/AXY520/Smart-Excalidraw.git
cd smart-excalidraw-next

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000 即可使用。

## ❓ 常见问题

**Q: 推荐使用哪个 AI 模型？**
A: 强烈推荐使用 **claude-sonnet-4.5**，它在理解需求和生成图表方面表现最佳。

**Q: 数据安全吗？**
A: 所有配置信息仅保存在你的浏览器本地，不会上传到任何服务器。

**Q: 支持哪些图表类型？**
A: 支持流程图、架构图、时序图、ER 图、思维导图、网络拓扑图等 20+ 种类型，AI 会自动选择最合适的类型。

**Q: 生成的图表可以修改吗？**
A: 当然可以！生成后可以在 Excalidraw 画布上自由编辑，包括调整位置、修改样式、添加元素等。

## 🛠️ 技术栈

Next.js 16 · React 19 · Excalidraw · Tailwind CSS 4 · Monaco Editor