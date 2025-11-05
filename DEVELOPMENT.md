# Development Guide

## Project Overview

Smart Excalidraw is an AI-powered diagram generation tool that combines:
- Large Language Models (OpenAI/Anthropic) for code generation
- Excalidraw for diagram rendering
- Monaco Editor for code editing
- Next.js for the web framework

## Architecture

### Frontend (Client-Side)
- **Main Page** (`app/page.js`): Orchestrates all components and manages state
- **Chat Component**: Handles user conversations
- **Code Editor**: Displays and allows editing of generated Excalidraw code
- **Canvas Component**: Renders Excalidraw diagrams
- **Config Modal**: Manages LLM provider settings

### Backend (Server-Side)
- **Generate API** (`/api/generate`): Streams LLM responses for diagram generation
- **Models API** (`/api/models`): Fetches available models from providers

### Libraries
- **config.js**: localStorage management for configuration
- **llm-client.js**: Unified interface for OpenAI and Anthropic APIs
- **prompts.js**: System prompts for guiding LLM behavior

## Key Implementation Details

### Excalidraw Integration

Excalidraw must be dynamically imported to avoid SSR issues:

```javascript
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
);
```

### Element Conversion

Generated code uses the `ExcalidrawElementSkeleton` format, which must be converted:

```javascript
import { convertToExcalidrawElements } from '@excalidraw/excalidraw';
const elements = convertToExcalidrawElements(skeletonArray);
```

### Streaming Implementation

The generate API uses Server-Sent Events (SSE) for real-time streaming:

```javascript
// Server (API route)
const stream = new ReadableStream({
  async start(controller) {
    await callLLM(config, messages, (chunk) => {
      const data = `data: ${JSON.stringify({ content: chunk })}\n\n`;
      controller.enqueue(encoder.encode(data));
    });
    controller.close();
  }
});

// Client
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // Process chunk
}
```

### State Management

The main page manages several interconnected states:
- `config`: LLM provider configuration
- `messages`: Chat history
- `generatedCode`: Raw code string from LLM
- `elements`: Parsed element array for Excalidraw
- `isGenerating`: Loading state

### localStorage Usage

Configuration and messages persist in localStorage:
- **Config**: Saved/loaded via `lib/config.js`
- **Messages**: Managed in component state (could be extended to persist)

## Code Flow

### Diagram Generation Flow

1. User types message → `handleSendMessage()`
2. Message added to chat → API call to `/api/generate`
3. API constructs prompt → Calls LLM with streaming
4. Chunks streamed back → Accumulated in `generatedCode`
5. Code parsed → Converted to elements
6. Elements passed to canvas → Diagram renders

### Configuration Flow

1. User clicks "Configure LLM" → Modal opens
2. User fills form → Clicks "Load Models"
3. API call to `/api/models` → Models fetched
4. User selects model → Clicks "Save"
5. Config saved to localStorage → Modal closes

## Testing Locally

### 1. Start Development Server
```bash
pnpm dev
```

### 2. Configure LLM Provider
- Open http://localhost:3000
- Click "Configure LLM"
- Enter your API credentials
- Load and select a model
- Save configuration

### 3. Test Diagram Generation
Try these prompts:
- "Create a simple flowchart with 3 steps"
- "Draw a mind map about web development"
- "Generate an architecture diagram with database, API, and frontend"

### 4. Test Code Editing
- Generate a diagram
- Edit the code in the Monaco editor
- Click "Apply to Canvas"
- Verify the diagram updates

## Common Development Tasks

### Adding a New LLM Provider

1. Update `lib/llm-client.js`:
   - Add new provider case in `callLLM()`
   - Implement provider-specific API call
   - Handle streaming response

2. Update `components/ConfigModal.jsx`:
   - Add provider to dropdown
   - Update placeholder text

### Modifying the System Prompt

Edit `lib/prompts.js` to change how the LLM generates diagrams.

### Styling Changes

The project uses Tailwind CSS. Modify className attributes directly in components.

### Adding New Features to Canvas

See Excalidraw documentation in `docs/excalidraw-doc.md` for available APIs.

## Debugging Tips

### Diagram Not Rendering
1. Check browser console for errors
2. Verify generated code is valid JSON array
3. Use Monaco editor to manually fix code
4. Check element structure matches Excalidraw format

### API Errors
1. Verify API key is correct
2. Check base URL format
3. Look at Network tab for response details
4. Check API rate limits/credits

### Streaming Issues
1. Check SSE format (must be `data: {...}\n\n`)
2. Verify Content-Type is `text/event-stream`
3. Look for CORS errors
4. Check for network interruptions

## Performance Considerations

### Large Diagrams
- Excalidraw handles up to ~1000 elements well
- Consider limiting LLM output for very complex diagrams

### Streaming Latency
- SSE provides real-time feedback
- Consider debouncing element updates if needed

### localStorage Limits
- Browser localStorage is typically ~5-10MB
- Current usage is minimal (config + messages)

## Future Enhancements

Potential areas for improvement:
- [ ] Save/load diagram history
- [ ] Export diagrams as images
- [ ] Template library for common diagrams
- [ ] Collaborative editing
- [ ] Version control for diagrams
- [ ] More LLM providers (Google, Azure, etc.)
- [ ] Fine-tuned prompts for specific diagram types
- [ ] Diagram validation and suggestions

