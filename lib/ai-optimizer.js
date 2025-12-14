/**
 * AI-powered optimization utilities for diagrams
 * Includes layout optimization, color scheme suggestions, and auto-fix
 */

import { callLLM } from './llm-client';

/**
 * Color palettes for different diagram types
 */
const COLOR_PALETTES = {
  professional: {
    name: '专业商务',
    colors: ['#1e40af', '#059669', '#dc2626', '#7c3aed', '#ea580c'],
    background: '#ffffff',
    description: '适合商务演示和专业报告',
  },
  modern: {
    name: '现代简约',
    colors: ['#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
    background: '#ffffff',
    description: '清新现代，适合科技和创新主题',
  },
  warm: {
    name: '温暖活力',
    colors: ['#f97316', '#eab308', '#ef4444', '#f472b6', '#fb923c'],
    background: '#fffbeb',
    description: '充满活力，适合创意和营销',
  },
  cool: {
    name: '冷静沉稳',
    colors: ['#0284c7', '#0891b2', '#06b6d4', '#0d9488', '#14b8a6'],
    background: '#f0fdfa',
    description: '沉稳专业，适合技术和分析',
  },
  pastel: {
    name: '柔和淡雅',
    colors: ['#93c5fd', '#86efac', '#fcd34d', '#f9a8d4', '#c4b5fd'],
    background: '#fefce8',
    description: '温柔舒适，适合教育和展示',
  },
  dark: {
    name: '深色主题',
    colors: ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'],
    background: '#1f2937',
    description: '适合深色模式和夜间查看',
  },
};

/**
 * AI-powered layout optimization prompt
 */
const LAYOUT_OPTIMIZATION_PROMPT = `你是一个图表布局优化专家。请分析提供的 Excalidraw 元素，并优化其布局。

优化目标：
1. **消除重叠**：确保元素之间不重叠
2. **均衡间距**：保持元素之间合理且一致的间距（建议 800-1200px）
3. **对齐优化**：相关元素应该对齐（左对齐、右对齐、居中对齐）
4. **层次清晰**：按逻辑层次排列元素（如流程图从上到下，架构图分层）
5. **视觉平衡**：整体布局应该视觉平衡，避免过于偏向一侧

请返回优化后的元素数组（JSON 格式），只修改元素的 x、y、width、height 属性，不要修改其他属性。

输出格式：纯 JSON 数组，不要包含任何其他文字说明。`;

/**
 * AI-powered color scheme suggestion prompt
 */
const COLOR_SUGGESTION_PROMPT = `你是一个色彩设计专家。请分析提供的图表内容和用途，推荐最合适的配色方案。

请考虑：
1. 图表类型（流程图、架构图、思维导图等）
2. 使用场景（商务演示、技术文档、教育材料等）
3. 色彩心理学和可读性
4. 颜色对比度和可访问性

请返回 JSON 格式的配色建议：
{
  "primary": "#颜色代码",
  "secondary": "#颜色代码",
  "accent": "#颜色代码",
  "background": "#颜色代码",
  "reasoning": "选择这个配色的原因"
}`;

/**
 * Optimize diagram layout using AI
 * @param {Array} elements - Excalidraw elements
 * @param {Object} config - LLM configuration
 * @returns {Promise<Array>} Optimized elements
 */
export async function optimizeLayoutWithAI(elements, config) {
  if (!elements || elements.length === 0) {
    throw new Error('No elements to optimize');
  }

  // Prepare elements for AI (remove unnecessary data)
  const simplifiedElements = elements.map(el => ({
    id: el.id,
    type: el.type,
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    label: el.label,
    start: el.start,
    end: el.end,
  }));

  const messages = [
    {
      role: 'system',
      content: LAYOUT_OPTIMIZATION_PROMPT,
    },
    {
      role: 'user',
      content: `请优化以下图表布局：\n\n${JSON.stringify(simplifiedElements, null, 2)}`,
    },
  ];

  let fullResponse = '';
  await callLLM(config, messages, (chunk) => {
    fullResponse += chunk;
  });

  // Parse AI response
  try {
    // Extract JSON from response
    const jsonMatch = fullResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('AI response does not contain valid JSON array');
    }

    const optimizedElements = JSON.parse(jsonMatch[0]);

    // Merge optimized positions with original elements
    const elementMap = new Map(elements.map(el => [el.id, el]));
    
    return optimizedElements.map(optimized => {
      const original = elementMap.get(optimized.id);
      if (!original) return null;

      return {
        ...original,
        x: optimized.x,
        y: optimized.y,
        width: optimized.width || original.width,
        height: optimized.height || original.height,
      };
    }).filter(Boolean);
  } catch (error) {
    console.error('Failed to parse AI optimization result:', error);
    throw new Error('AI 优化失败：无法解析返回结果');
  }
}

/**
 * Suggest color scheme using AI
 * @param {Array} elements - Excalidraw elements
 * @param {string} context - Diagram context/purpose
 * @param {Object} config - LLM configuration
 * @returns {Promise<Object>} Color scheme suggestion
 */
export async function suggestColorSchemeWithAI(elements, context, config) {
  const messages = [
    {
      role: 'system',
      content: COLOR_SUGGESTION_PROMPT,
    },
    {
      role: 'user',
      content: `图表上下文：${context}\n\n元素数量：${elements.length}\n\n请推荐配色方案。`,
    },
  ];

  let fullResponse = '';
  await callLLM(config, messages, (chunk) => {
    fullResponse += chunk;
  });

  try {
    // Extract JSON from response
    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response does not contain valid JSON');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse color suggestion:', error);
    throw new Error('配色建议失败：无法解析返回结果');
  }
}

/**
 * Apply color scheme to elements
 * @param {Array} elements - Excalidraw elements
 * @param {Object} colorScheme - Color scheme to apply
 * @returns {Array} Elements with applied colors
 */
export function applyColorScheme(elements, colorScheme) {
  const { primary, secondary, accent, background } = colorScheme;
  const colors = [primary, secondary, accent];

  return elements.map((element, index) => {
    const updatedElement = { ...element };

    // Apply colors based on element type and index
    if (element.type === 'rectangle' || element.type === 'ellipse' || element.type === 'diamond') {
      updatedElement.strokeColor = colors[index % colors.length];
      updatedElement.backgroundColor = background;
    } else if (element.type === 'arrow' || element.type === 'line') {
      updatedElement.strokeColor = primary;
    } else if (element.type === 'text') {
      updatedElement.strokeColor = primary;
    }

    return updatedElement;
  });
}

/**
 * Get predefined color palette
 * @param {string} paletteKey - Palette key
 * @returns {Object} Color palette
 */
export function getColorPalette(paletteKey) {
  return COLOR_PALETTES[paletteKey] || COLOR_PALETTES.professional;
}

/**
 * Get all available color palettes
 * @returns {Object} All color palettes
 */
export function getAllColorPalettes() {
  return COLOR_PALETTES;
}

/**
 * Apply predefined color palette to elements
 * @param {Array} elements - Excalidraw elements
 * @param {string} paletteKey - Palette key
 * @returns {Array} Elements with applied palette
 */
export function applyColorPalette(elements, paletteKey) {
  const palette = getColorPalette(paletteKey);
  const { colors, background } = palette;

  return elements.map((element, index) => {
    const updatedElement = { ...element };
    const colorIndex = index % colors.length;

    if (element.type === 'rectangle' || element.type === 'ellipse' || element.type === 'diamond') {
      updatedElement.strokeColor = colors[colorIndex];
      updatedElement.backgroundColor = background;
    } else if (element.type === 'arrow' || element.type === 'line') {
      updatedElement.strokeColor = colors[colorIndex];
    } else if (element.type === 'text') {
      updatedElement.strokeColor = colors[0];
    }

    return updatedElement;
  });
}

/**
 * Auto-fix common diagram issues
 * @param {Array} elements - Excalidraw elements
 * @returns {Object} Fixed elements and issues found
 */
export function autoFixDiagram(elements) {
  const fixes = [];
  const fixedElements = elements.map(element => {
    const fixed = { ...element };
    let hasChanges = false;

    // Fix: Ensure minimum size
    if ((element.width !== undefined && element.width < 50) || 
        (element.height !== undefined && element.height < 30)) {
      fixed.width = Math.max(element.width || 100, 50);
      fixed.height = Math.max(element.height || 50, 30);
      fixes.push({ id: element.id, issue: '元素尺寸过小', fix: '调整为最小尺寸' });
      hasChanges = true;
    }

    // Fix: Ensure arrows have valid width (not 0)
    if ((element.type === 'arrow' || element.type === 'line') && element.width === 0) {
      fixed.width = 1;
      fixes.push({ id: element.id, issue: '箭头宽度为0', fix: '设置为1' });
      hasChanges = true;
    }

    // Fix: Ensure text has content
    if (element.type === 'text' && (!element.text || element.text.trim() === '')) {
      fixed.text = '文本';
      fixes.push({ id: element.id, issue: '文本为空', fix: '添加默认文本' });
      hasChanges = true;
    }

    // Fix: Ensure valid opacity
    if (element.opacity !== undefined && (element.opacity < 0 || element.opacity > 100)) {
      fixed.opacity = Math.max(0, Math.min(100, element.opacity));
      fixes.push({ id: element.id, issue: '不透明度超出范围', fix: '调整为有效范围' });
      hasChanges = true;
    }

    return hasChanges ? fixed : element;
  });

  return {
    elements: fixedElements,
    fixes,
    hasIssues: fixes.length > 0,
  };
}

/**
 * Detect overlapping elements
 * @param {Array} elements - Excalidraw elements
 * @returns {Array} List of overlapping element pairs
 */
export function detectOverlaps(elements) {
  const overlaps = [];
  const shapesWithBounds = elements
    .filter(el => el.type !== 'arrow' && el.type !== 'line')
    .map(el => ({
      id: el.id,
      x: el.x,
      y: el.y,
      width: el.width || 100,
      height: el.height || 50,
    }));

  for (let i = 0; i < shapesWithBounds.length; i++) {
    for (let j = i + 1; j < shapesWithBounds.length; j++) {
      const a = shapesWithBounds[i];
      const b = shapesWithBounds[j];

      // Check if rectangles overlap
      const xOverlap = a.x < b.x + b.width && a.x + a.width > b.x;
      const yOverlap = a.y < b.y + b.height && a.y + a.height > b.y;

      if (xOverlap && yOverlap) {
        overlaps.push({ elementA: a.id, elementB: b.id });
      }
    }
  }

  return overlaps;
}

/**
 * Calculate diagram statistics
 * @param {Array} elements - Excalidraw elements
 * @returns {Object} Diagram statistics
 */
export function calculateDiagramStats(elements) {
  const stats = {
    totalElements: elements.length,
    byType: {},
    hasOverlaps: false,
    overlapCount: 0,
    averageSpacing: 0,
    bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
  };

  // Count by type
  elements.forEach(el => {
    stats.byType[el.type] = (stats.byType[el.type] || 0) + 1;
  });

  // Calculate bounds
  const positions = elements
    .filter(el => el.x !== undefined && el.y !== undefined)
    .map(el => ({
      x: el.x,
      y: el.y,
      width: el.width || 0,
      height: el.height || 0,
    }));

  if (positions.length > 0) {
    stats.bounds.minX = Math.min(...positions.map(p => p.x));
    stats.bounds.maxX = Math.max(...positions.map(p => p.x + p.width));
    stats.bounds.minY = Math.min(...positions.map(p => p.y));
    stats.bounds.maxY = Math.max(...positions.map(p => p.y + p.height));
  }

  // Check for overlaps
  const overlaps = detectOverlaps(elements);
  stats.hasOverlaps = overlaps.length > 0;
  stats.overlapCount = overlaps.length;

  return stats;
}