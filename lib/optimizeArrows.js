/**
 * Optimize Excalidraw arrow coordinates by aligning them to the center of bound element edges
 */

/**
 * Determine which edge of startEle should be used based on its position relative to endEle
 * Returns the center point of the appropriate edge
 */
function getStartEdgeCenter(startEle, endEle) {
  
  const startX = startEle.x || 0;
  const startY = startEle.y || 0;
  const startWidth = startEle.width || 100;
  const startHeight = startEle.height || 100;

  const endX = endEle.x || 0;
  const endY = endEle.y || 0;

  const dx = startX - endX;
  const dy = startY - endY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Handle edge case: elements aligned horizontally (dy === 0)
  if (dy === 0) {
    if (dx < 0) {
      // startEle is directly to the left of endEle → Right edge
      return { x: startX + startWidth, y: startY + startHeight / 2 };
    } else if (dx > 0) {
      // startEle is directly to the right of endEle → Left edge
      return { x: startX, y: startY + startHeight / 2 };
    }
  }

  // Handle edge case: elements aligned vertically (dx === 0)
  if (dx === 0) {
    if (dy < 0) {
      // startEle is directly above endEle → Bottom edge
      return { x: startX + startWidth / 2, y: startY + startHeight };
    } else if (dy > 0) {
      // startEle is directly below endEle → Top edge
      return { x: startX + startWidth / 2, y: startY };
    }
  }

  // startEle in upper-left of endEle
  if (dx < 0 && dy < 0) {
    if (absDx > absDy) {
      // Right edge
      return { x: startX + startWidth, y: startY + startHeight / 2 };
    } else {
      // Bottom edge
      return { x: startX + startWidth / 2, y: startY + startHeight };
    }
  }

  // startEle in upper-right of endEle
  if (dx > 0 && dy < 0) {
    if (absDx > absDy) {
      // Left edge
      return { x: startX, y: startY + startHeight / 2 };
    } else {
      // Bottom edge
      return { x: startX + startWidth / 2, y: startY + startHeight };
    }
  }

  // startEle in lower-left of endEle
  if (dx < 0 && dy > 0) {
    if (absDx > absDy) {
      // Right edge
      return { x: startX + startWidth, y: startY + startHeight / 2 };
    } else {
      // Top edge
      return { x: startX + startWidth / 2, y: startY };
    }
  }

  // startEle in lower-right of endEle
  if (dx > 0 && dy > 0) {
    if (absDx > absDy) {
      // Left edge
      return { x: startX, y: startY + startHeight / 2 };
    } else {
      // Top edge
      return { x: startX + startWidth / 2, y: startY };
    }
  }

  // Default: right edge
  return { x: startX + startWidth, y: startY + startHeight / 2 };
}

/**
 * Determine which edge of endEle should be used based on its position relative to startEle
 * Returns the center point of the appropriate edge
 */
function getEndEdgeCenter(endEle, startEle) {
  const endX = endEle.x || 0;
  const endY = endEle.y || 0;
  const endWidth = endEle.width || 100;
  const endHeight = endEle.height || 100;

  const startX = startEle.x || 0;
  const startY = startEle.y || 0;

  const dx = endX - startX;
  const dy = endY - startY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Handle edge case: elements aligned horizontally (dy === 0)
  if (dy === 0) {
    if (dx < 0) {
      // endEle is directly to the left of startEle → Right edge
      return { x: endX + endWidth, y: endY + endHeight / 2 };
    } else if (dx > 0) {
      // endEle is directly to the right of startEle → Left edge
      return { x: endX, y: endY + endHeight / 2 };
    }
  }

  // Handle edge case: elements aligned vertically (dx === 0)
  if (dx === 0) {
    if (dy < 0) {
      // endEle is directly above startEle → Bottom edge
      return { x: endX + endWidth / 2, y: endY + endHeight };
    } else if (dy > 0) {
      // endEle is directly below startEle → Top edge
      return { x: endX + endWidth / 2, y: endY };
    }
  }

  // endEle in upper-left of startEle
  if (dx < 0 && dy < 0) {
    if (absDx > absDy) {
      // Right edge
      return { x: endX + endWidth, y: endY + endHeight / 2 };
    } else {
      // Bottom edge
      return { x: endX + endWidth / 2, y: endY + endHeight };
    }
  }

  // endEle in upper-right of startEle
  if (dx > 0 && dy < 0) {
    if (absDx > absDy) {
      // Left edge
      return { x: endX, y: endY + endHeight / 2 };
    } else {
      // Bottom edge
      return { x: endX + endWidth / 2, y: endY + endHeight };
    }
  }

  // endEle in lower-left of startEle
  if (dx < 0 && dy > 0) {
    if (absDx > absDy) {
      // Right edge
      return { x: endX + endWidth, y: endY + endHeight / 2 };
    } else {
      // Top edge
      return { x: endX + endWidth / 2, y: endY };
    }
  }

  // endEle in lower-right of startEle
  if (dx > 0 && dy > 0) {
    if (absDx > absDy) {
      // Left edge
      return { x: endX, y: endY + endHeight / 2 };
    } else {
      // Top edge
      return { x: endX + endWidth / 2, y: endY };
    }
  }

  // Default: left edge
  return { x: endX, y: endY + endHeight / 2 };
}

/**
 * Optimize arrow/line coordinates to align with bound element edge centers
 */
export function optimizeExcalidrawCode(codeString) {
  if (!codeString || typeof codeString !== 'string') {
    return codeString;
  }

  try {
    // Step 1: Parse JSON string to array
    const cleanedCode = codeString.trim();
    const arrayMatch = cleanedCode.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      console.error('No array found in code');
      return codeString;
    }

    const elements = JSON.parse(arrayMatch[0]);
    if (!Array.isArray(elements)) {
      console.error('Parsed code is not an array');
      return codeString;
    }

    // Create a map of elements by ID for quick lookup
    const elementMap = new Map();
    elements.forEach(el => {
      if (el.id) {
        elementMap.set(el.id, el);
      }
    });

    // Step 2 & 3: Find and optimize arrows/lines with bound elements
    const optimizedElements = elements.map(element => {
      // Only process arrow and line elements
      if (element.type !== 'arrow' && element.type !== 'line') {
        return element;
      }

      // Log arrow elements with strokeColor=#fab005
      if (element.type === 'arrow' && element.strokeColor === '#fab005') {
        console.log('🔍 Found arrow with strokeColor=#fab005:', {
          id: element.id,
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          strokeColor: element.strokeColor,
          start: element.start,
          end: element.end,
          fullElement: element
        });
      }

      const optimized = { ...element };
      let needsOptimization = false;

      // Get bound elements
      const startEle = element.start && element.start.id ? elementMap.get(element.start.id) : null;
      const endEle = element.end && element.end.id ? elementMap.get(element.end.id) : null;

      // Log detailed information for #fab005 arrows
      if (element.type === 'arrow' && element.strokeColor === '#fab005') {
        console.log('📍 Processing arrow with strokeColor=#fab005:');
        console.log('  startEle:', startEle ? {
          id: startEle.id,
          type: startEle.type,
          x: startEle.x,
          y: startEle.y,
          width: startEle.width,
          height: startEle.height
        } : 'null');
        console.log('  endEle:', endEle ? {
          id: endEle.id,
          type: endEle.type,
          x: endEle.x,
          y: endEle.y,
          width: endEle.width,
          height: endEle.height
        } : 'null');
      }

      // Both start and end must be bound to calculate correctly
      if (startEle && endEle) {
        // Calculate start point (arrow.x, arrow.y)
        
        const startEdgeCenter = getStartEdgeCenter(startEle, endEle);
        optimized.x = startEdgeCenter.x;
        optimized.y = startEdgeCenter.y;

        // Calculate end point and derive width/height
        const endEdgeCenter = getEndEdgeCenter(endEle, startEle);
        optimized.width = endEdgeCenter.x - startEdgeCenter.x;
        optimized.height = endEdgeCenter.y - startEdgeCenter.y;

        // Log calculation results for #fab005 arrows
        if (element.type === 'arrow' && element.strokeColor === '#fab005') {
          console.log('  🎯 Calculated values:');
          console.log('    startEdgeCenter:', startEdgeCenter);
          console.log('    endEdgeCenter:', endEdgeCenter);
          console.log('    Original arrow: { x:', element.x, ', y:', element.y, ', width:', element.width, ', height:', element.height, '}');
          console.log('    Optimized arrow: { x:', optimized.x, ', y:', optimized.y, ', width:', optimized.width, ', height:', optimized.height, '}');
        }

        needsOptimization = true;
      }

      // Fix Excalidraw rendering bug: line-type elements with width 0 should be 1
      if ((element.type === 'arrow' || element.type === 'line') && optimized.width === 0) {
        optimized.width = 1;
        needsOptimization = true;
      }

      return needsOptimization ? optimized : element;

    });

    // Step 4: Convert back to JSON string
    return JSON.stringify(optimizedElements, null, 2);
  } catch (error) {
    console.error('Failed to optimize arrows:', error);
    return codeString; // Return original code if optimization fails
  }
}

