# Smart Excalidraw

> **Draw Professional Charts with Natural Language**

## 🌐 Online Website
Visit our online website to use directly: https://smart-excalidraw.aizhi.site/

## 📸 Preview
Operation Interface
<img width="2330" height="1255" alt="Smart Excalidraw Preview" src="https://github.com/user-attachments/assets/5319ad5c-c507-42e0-b67a-e9dfb2d7ecfa" />
Technical Architecture Diagram
<img width="1920" height="1134" alt="Untitled-2025-11-03-1105" src="https://github.com/user-attachments/assets/d2e01c4e-d300-4c20-bd98-d056e4f02102" />
Infographic
<img width="2183" height="828" alt="Untitled-2025-11-03-1054" src="https://github.com/user-attachments/assets/0e46e8da-fe64-40a9-911b-f6c0e5589bae" />

## ✨ Core Features

### 🎯 AI-Powered, Outstanding Results
Powered by advanced large language models to understand your requirements and generate professional-grade charts with clear structure and logical layout.

### 🔗 Innovative Connection Algorithm
Featuring a proprietary intelligent arrow optimization algorithm that automatically calculates optimal connection points, ensuring charts are well-organized and logically clear, eliminating messy line crossings.

### 📊 Rich Chart Types
Supports 20+ chart types, including flowcharts, architecture diagrams, sequence diagrams, ER diagrams, mind maps, and more. AI can also automatically select the most suitable chart type based on your description.

### 🎨 Perfect Excalidraw Integration
Generated charts are fully based on Excalidraw format, allowing free editing, style adjustments, and detail additions on the canvas—achieving the perfect combination of AI generation and manual refinement.

### ⚡ Ready to Use
Simply configure an AI API key to get started, no complex environment setup required. All configurations are stored locally in your browser for privacy and security.

### 🌍 Multi-Language Support
Now supports both Chinese and English interfaces, making it accessible to a global audience.

## 🚀 Quick Start

### Step 1: Configure AI

1. Click the **"Configure LLM"** button in the top right corner
2. Select provider type (OpenAI or Anthropic)
3. Enter your API Key
4. Select model (**Highly recommend claude-sonnet-4.5** for best results)
5. Save configuration

That's it! You're ready to start creating.

### Step 2: Create Charts

Describe your needs in natural language in the input box, for example:
- "Draw a user login flowchart"
- "Create a microservices architecture diagram including gateway, authentication service, and business services"
- "Design a database ER diagram for an e-commerce system"

AI will automatically generate the chart, which you can directly edit and adjust on the canvas.

## 💻 Local Deployment

If you want to run the project locally:

```bash
# Clone the project
git clone https://github.com/liujuntao123/smart-excalidraw-next.git
cd smart-excalidraw-next

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit http://localhost:3000 to start using.

## 🔧 Configuration

### Supported LLM Providers
- **OpenAI**: GPT-4, GPT-3.5 and other compatible models
- **Anthropic**: Claude-3.5-Sonnet, Claude-3-Opus and other compatible models

### API Configuration
1. Get API keys from your chosen provider
2. Configure base URL (use default or custom endpoint)
3. Select appropriate model
4. All configurations are stored locally and securely

## ❓ Frequently Asked Questions

**Q: Which AI model is recommended?**
A: **claude-sonnet-4.5** is highly recommended for best performance in understanding requirements and generating charts.

**Q: Is data secure?**
A: All configuration information is stored only in your local browser and never uploaded to any servers.

**Q: What chart types are supported?**
A: Supports 20+ types including flowcharts, architecture diagrams, sequence diagrams, ER diagrams, mind maps, network topology diagrams, etc. AI will automatically select the most suitable type.

**Q: Can generated charts be modified?**
A: Absolutely! After generation, you can freely edit on the Excalidraw canvas, including adjusting positions, modifying styles, adding elements, and more.

**Q: Does it support multiple languages?**
A: Yes! The interface now supports both Chinese and English, with automatic language detection based on browser settings.

## 🛠️ Tech Stack

Next.js 16 · React 19 · Excalidraw · Tailwind CSS 4 · Monaco Editor · next-intl

## 🌐 Internationalization

This project supports multiple languages:
- 🇨🇳 Chinese (Simplified) - Default
- 🇺🇸 English

Language is automatically detected based on your browser settings, or you can access different language versions:
- Chinese: `http://localhost:3000/zh`
- English: `http://localhost:3000/en`

## 📄 License

MIT License

---

**Draw Professional Charts with Natural Language** - Making visual creation simple again