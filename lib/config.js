/**
 * Configuration management for LLM providers
 * Stores and retrieves provider configuration from localStorage
 */

const CONFIG_KEY = 'smart-excalidraw-config';

/**
 * Get the current provider configuration
 * @returns {Object|null} Provider configuration or null if not set
 */
export function getConfig() {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load config:', error);
    return null;
  }
}

/**
 * Save provider configuration
 * @param {Object} config - Provider configuration
 * @param {string} config.name - Provider display name
 * @param {string} config.type - Provider type ('openai' or 'anthropic')
 * @param {string} config.baseUrl - API base URL
 * @param {string} config.apiKey - API key
 * @param {string} config.model - Selected model
 */
export function saveConfig(config) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save config:', error);
    throw error;
  }
}

/**
 * Check if configuration is valid and complete
 * @param {Object} config - Configuration to validate
 * @returns {boolean} True if configuration is valid
 */
export function isConfigValid(config) {
  if (!config) return false;
  
  return !!(
    config.type &&
    config.baseUrl &&
    config.apiKey &&
    config.model
  );
}

