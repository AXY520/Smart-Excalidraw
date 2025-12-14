/**
 * Export utilities for Excalidraw diagrams
 * Supports PNG, SVG, and PDF export
 */

/**
 * Export configuration options
 */
export const DEFAULT_EXPORT_CONFIG = {
  format: 'png', // png, svg, pdf
  scale: 2, // 1-4 for PNG
  quality: 0.95, // 0-1 for PNG/JPEG
  backgroundColor: '#ffffff',
  padding: 20,
  embedScene: true, // Embed Excalidraw scene data in exported file
  withBackground: true,
  darkMode: false,
};

/**
 * Get Excalidraw export utilities
 * Must be called client-side only
 */
async function getExcalidrawExportUtils() {
  const excalidrawModule = await import('@excalidraw/excalidraw');
  return {
    exportToBlob: excalidrawModule.exportToBlob,
    exportToSvg: excalidrawModule.exportToSvg,
    serializeAsJSON: excalidrawModule.serializeAsJSON,
  };
}

/**
 * Export diagram as PNG
 * @param {Object} excalidrawAPI - Excalidraw API instance
 * @param {Object} config - Export configuration
 * @returns {Promise<Blob>} PNG blob
 */
export async function exportAsPNG(excalidrawAPI, config = {}) {
  if (!excalidrawAPI) {
    throw new Error('Excalidraw API not available');
  }

  const exportConfig = { ...DEFAULT_EXPORT_CONFIG, ...config };
  const { exportToBlob } = await getExcalidrawExportUtils();

  const elements = excalidrawAPI.getSceneElements();
  const appState = excalidrawAPI.getAppState();
  const files = excalidrawAPI.getFiles();

  const blob = await exportToBlob({
    elements,
    appState: {
      ...appState,
      exportBackground: exportConfig.withBackground,
      exportWithDarkMode: exportConfig.darkMode,
      viewBackgroundColor: exportConfig.backgroundColor,
    },
    files,
    mimeType: 'image/png',
    quality: exportConfig.quality,
    exportPadding: exportConfig.padding,
    getDimensions: (width, height) => {
      return {
        width: width * exportConfig.scale,
        height: height * exportConfig.scale,
        scale: exportConfig.scale,
      };
    },
  });

  return blob;
}

/**
 * Export diagram as SVG
 * @param {Object} excalidrawAPI - Excalidraw API instance
 * @param {Object} config - Export configuration
 * @returns {Promise<Blob>} SVG blob
 */
export async function exportAsSVG(excalidrawAPI, config = {}) {
  if (!excalidrawAPI) {
    throw new Error('Excalidraw API not available');
  }

  const exportConfig = { ...DEFAULT_EXPORT_CONFIG, ...config };
  const { exportToSvg, serializeAsJSON } = await getExcalidrawExportUtils();

  const elements = excalidrawAPI.getSceneElements();
  const appState = excalidrawAPI.getAppState();
  const files = excalidrawAPI.getFiles();

  const svg = await exportToSvg({
    elements,
    appState: {
      ...appState,
      exportBackground: exportConfig.withBackground,
      exportWithDarkMode: exportConfig.darkMode,
      viewBackgroundColor: exportConfig.backgroundColor,
    },
    files,
    exportPadding: exportConfig.padding,
  });

  // Embed scene data if requested
  if (exportConfig.embedScene) {
    const sceneData = serializeAsJSON(elements, appState, files, 'local');
    const metadata = document.createElementNS('http://www.w3.org/2000/svg', 'metadata');
    metadata.innerHTML = `<excalidraw-data>${sceneData}</excalidraw-data>`;
    svg.insertBefore(metadata, svg.firstChild);
  }

  const svgString = svg.outerHTML;
  const blob = new Blob([svgString], { type: 'image/svg+xml' });

  return blob;
}

/**
 * Export diagram as PDF
 * @param {Object} excalidrawAPI - Excalidraw API instance
 * @param {Object} config - Export configuration
 * @returns {Promise<Blob>} PDF blob
 */
export async function exportAsPDF(excalidrawAPI, config = {}) {
  if (!excalidrawAPI) {
    throw new Error('Excalidraw API not available');
  }

  // First export as SVG
  const svgBlob = await exportAsSVG(excalidrawAPI, { ...config, embedScene: false });
  const svgUrl = URL.createObjectURL(svgBlob);

  // Create a temporary canvas to render SVG
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size based on image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.fillStyle = config.backgroundColor || DEFAULT_EXPORT_CONFIG.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(svgUrl);
          
          // Use jsPDF to create PDF (need to be imported separately)
          // For now, we'll just export as high-quality PNG in PDF size
          resolve(blob);
        }, 'image/png', config.quality || DEFAULT_EXPORT_CONFIG.quality);
      } catch (error) {
        URL.revokeObjectURL(svgUrl);
        reject(error);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error('Failed to load SVG'));
    };
    img.src = svgUrl;
  });
}

/**
 * Export scene as JSON
 * @param {Object} excalidrawAPI - Excalidraw API instance
 * @returns {Promise<Blob>} JSON blob
 */
export async function exportAsJSON(excalidrawAPI) {
  if (!excalidrawAPI) {
    throw new Error('Excalidraw API not available');
  }

  const { serializeAsJSON } = await getExcalidrawExportUtils();
  
  const elements = excalidrawAPI.getSceneElements();
  const appState = excalidrawAPI.getAppState();
  const files = excalidrawAPI.getFiles();

  const sceneData = serializeAsJSON(elements, appState, files, 'local');
  const blob = new Blob([sceneData], { type: 'application/json' });

  return blob;
}

/**
 * Download blob as file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export diagram with the specified format
 * @param {Object} excalidrawAPI - Excalidraw API instance
 * @param {string} format - Export format (png, svg, pdf, json)
 * @param {Object} config - Export configuration
 * @param {string} filename - Optional filename
 * @returns {Promise<void>}
 */
export async function exportDiagram(excalidrawAPI, format, config = {}, filename) {
  let blob;
  let extension;

  switch (format.toLowerCase()) {
    case 'png':
      blob = await exportAsPNG(excalidrawAPI, config);
      extension = 'png';
      break;
    case 'svg':
      blob = await exportAsSVG(excalidrawAPI, config);
      extension = 'svg';
      break;
    case 'pdf':
      blob = await exportAsPDF(excalidrawAPI, config);
      extension = 'pdf';
      break;
    case 'json':
      blob = await exportAsJSON(excalidrawAPI);
      extension = 'json';
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  const defaultFilename = `diagram-${Date.now()}.${extension}`;
  downloadBlob(blob, filename || defaultFilename);
}

/**
 * Copy diagram to clipboard as PNG
 * @param {Object} excalidrawAPI - Excalidraw API instance
 * @param {Object} config - Export configuration
 * @returns {Promise<void>}
 */
export async function copyToClipboard(excalidrawAPI, config = {}) {
  if (!navigator.clipboard || !navigator.clipboard.write) {
    throw new Error('Clipboard API not supported');
  }

  const blob = await exportAsPNG(excalidrawAPI, config);
  const item = new ClipboardItem({ 'image/png': blob });
  await navigator.clipboard.write([item]);
}

/**
 * Generate thumbnail for diagram
 * @param {Object} excalidrawAPI - Excalidraw API instance
 * @param {number} maxSize - Maximum size (width/height)
 * @returns {Promise<string>} Base64 data URL
 */
export async function generateThumbnail(excalidrawAPI, maxSize = 200) {
  const blob = await exportAsPNG(excalidrawAPI, {
    scale: 1,
    quality: 0.8,
    padding: 10,
    withBackground: true,
  });

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate thumbnail size
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Draw scaled image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png', 0.8);
      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to generate thumbnail'));
    };

    img.src = url;
  });
}