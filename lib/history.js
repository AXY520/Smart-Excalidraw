/**
 * History management for diagram generation
 * Uses IndexedDB for diagram storage and localStorage for metadata
 */

const DB_NAME = 'smart-excalidraw-db';
const DB_VERSION = 1;
const STORE_NAME = 'diagrams';
const MAX_HISTORY_ITEMS = 100;

/**
 * Initialize IndexedDB
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('title', 'title', { unique: false });
      }
    };
  });
}

/**
 * Save a diagram to history
 * @param {Object} diagram - Diagram data
 * @returns {Promise<string>} Diagram ID
 */
export async function saveDiagramToHistory(diagram) {
  const db = await openDatabase();
  
  const historyItem = {
    id: diagram.id || `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: diagram.title || '未命名图表',
    description: diagram.description || '',
    code: diagram.code,
    elements: diagram.elements,
    thumbnail: diagram.thumbnail || null,
    chartType: diagram.chartType || 'auto',
    userInput: diagram.userInput || '',
    timestamp: Date.now(),
    tags: diagram.tags || [],
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.put(historyItem);

    request.onsuccess = () => {
      // Clean up old items if exceeding max
      cleanupOldHistory(db);
      resolve(historyItem.id);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all diagrams from history
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of diagrams
 */
export async function getHistoryList(options = {}) {
  const db = await openDatabase();
  const { limit = 50, offset = 0, search = '', sortBy = 'timestamp', sortOrder = 'desc' } = options;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index(sortBy === 'timestamp' ? 'timestamp' : 'title');
    
    const request = index.openCursor(null, sortOrder === 'desc' ? 'prev' : 'next');
    const results = [];
    let skipped = 0;

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      
      if (cursor && results.length < limit) {
        const item = cursor.value;
        
        // Apply search filter
        const matchesSearch = !search || 
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()) ||
          item.userInput.toLowerCase().includes(search.toLowerCase());

        if (matchesSearch) {
          if (skipped >= offset) {
            // Remove heavy data for list view
            results.push({
              id: item.id,
              title: item.title,
              description: item.description,
              thumbnail: item.thumbnail,
              chartType: item.chartType,
              timestamp: item.timestamp,
              tags: item.tags,
            });
          } else {
            skipped++;
          }
        }
        
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Get a specific diagram by ID
 * @param {string} id - Diagram ID
 * @returns {Promise<Object>} Diagram data
 */
export async function getDiagramById(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update a diagram
 * @param {string} id - Diagram ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateDiagram(id, updates) {
  const db = await openDatabase();
  const diagram = await getDiagramById(id);
  
  if (!diagram) {
    throw new Error('Diagram not found');
  }

  const updatedDiagram = { ...diagram, ...updates, id };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.put(updatedDiagram);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a diagram
 * @param {string} id - Diagram ID
 * @returns {Promise<void>}
 */
export async function deleteDiagram(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete multiple diagrams
 * @param {Array<string>} ids - Diagram IDs
 * @returns {Promise<void>}
 */
export async function deleteDiagrams(ids) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    let completed = 0;
    let failed = false;

    ids.forEach(id => {
      const request = objectStore.delete(id);
      
      request.onsuccess = () => {
        completed++;
        if (completed === ids.length && !failed) {
          resolve();
        }
      };
      
      request.onerror = () => {
        if (!failed) {
          failed = true;
          reject(request.error);
        }
      };
    });
  });
}

/**
 * Clear all history
 * @returns {Promise<void>}
 */
export async function clearAllHistory() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clean up old history items if exceeding max
 */
async function cleanupOldHistory(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index('timestamp');
    const request = index.openCursor(null, 'next'); // Oldest first
    
    const allItems = [];

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      
      if (cursor) {
        allItems.push(cursor.value);
        cursor.continue();
      } else {
        // Delete oldest items if exceeding max
        if (allItems.length > MAX_HISTORY_ITEMS) {
          const itemsToDelete = allItems.slice(0, allItems.length - MAX_HISTORY_ITEMS);
          const deleteTransaction = db.transaction([STORE_NAME], 'readwrite');
          const deleteStore = deleteTransaction.objectStore(STORE_NAME);
          
          itemsToDelete.forEach(item => {
            deleteStore.delete(item.id);
          });
          
          deleteTransaction.oncomplete = () => resolve();
          deleteTransaction.onerror = () => reject(deleteTransaction.error);
        } else {
          resolve();
        }
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Export diagram as JSON
 * @param {string} id - Diagram ID
 * @returns {Promise<string>} JSON string
 */
export async function exportDiagramAsJSON(id) {
  const diagram = await getDiagramById(id);
  if (!diagram) {
    throw new Error('Diagram not found');
  }
  
  return JSON.stringify(diagram, null, 2);
}

/**
 * Import diagram from JSON
 * @param {string} jsonString - JSON string
 * @returns {Promise<string>} Imported diagram ID
 */
export async function importDiagramFromJSON(jsonString) {
  try {
    const diagram = JSON.parse(jsonString);
    
    // Generate new ID to avoid conflicts
    const newDiagram = {
      ...diagram,
      id: `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    return await saveDiagramToHistory(newDiagram);
  } catch (error) {
    throw new Error('Invalid JSON format: ' + error.message);
  }
}

/**
 * Get history statistics
 * @returns {Promise<Object>} Statistics
 */
export async function getHistoryStats() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const countRequest = objectStore.count();

    countRequest.onsuccess = () => {
      resolve({
        totalDiagrams: countRequest.result,
        maxCapacity: MAX_HISTORY_ITEMS,
        usagePercentage: (countRequest.result / MAX_HISTORY_ITEMS) * 100,
      });
    };

    countRequest.onerror = () => reject(countRequest.error);
  });
}