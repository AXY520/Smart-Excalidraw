/**
 * Configuration management for LLM providers
 * Stores and retrieves provider configurations from localStorage
 */

const CONFIG_KEY = 'smart-excalidraw-config';

/**
 * Get all provider configurations
 * @returns {Object} Object with providers array and currentProviderId
 */
export function getAllConfigs() {
  if (typeof window === 'undefined') return { providers: [], currentProviderId: null };
  
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) return { providers: [], currentProviderId: null };
    
    const config = JSON.parse(stored);
    // Handle migration from old single config format
    if (config.type && config.baseUrl && config.apiKey && config.model) {
      // Old format - convert to new format
      const provider = {
        id: 'default',
        name: config.name || 'Default',
        type: config.type,
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: config.model
      };
      return { providers: [provider], currentProviderId: 'default' };
    }
    
    return {
      providers: config.providers || [],
      currentProviderId: config.currentProviderId || null
    };
  } catch (error) {
    console.error('Failed to load configs:', error);
    return { providers: [], currentProviderId: null };
  }
}

/**
 * Get the current provider configuration
 * @returns {Object|null} Current provider configuration or null if not set
 */
export function getConfig() {
  const { providers, currentProviderId } = getAllConfigs();
  if (!currentProviderId || !providers.length) return null;
  
  return providers.find(p => p.id === currentProviderId) || null;
}

/**
 * Save all provider configurations
 * @param {Object} configData - Configuration data
 * @param {Array} configData.providers - Array of provider configurations
 * @param {string} configData.currentProviderId - ID of current active provider
 */
export function saveAllConfigs(configData) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(configData));
  } catch (error) {
    console.error('Failed to save configs:', error);
    throw error;
  }
}

/**
 * Save or update a provider configuration
 * @param {Object} provider - Provider configuration
 * @param {string} provider.id - Unique provider ID
 * @param {string} provider.name - Provider display name
 * @param {string} provider.type - Provider type ('openai' or 'anthropic')
 * @param {string} provider.baseUrl - API base URL
 * @param {string} provider.apiKey - API key
 * @param {string} provider.model - Selected model
 * @param {boolean} isCurrent - Whether this provider should be set as current
 */
export function saveProvider(provider, isCurrent = true) {
  const { providers, currentProviderId } = getAllConfigs();
  
  // Find existing provider or create new one
  const existingIndex = providers.findIndex(p => p.id === provider.id);
  if (existingIndex >= 0) {
    providers[existingIndex] = provider;
  } else {
    // Generate ID if not provided
    if (!provider.id) {
      provider.id = 'provider_' + Date.now();
    }
    providers.push(provider);
  }
  
  const newCurrentProviderId = isCurrent ? provider.id : currentProviderId;
  
  saveAllConfigs({ providers, currentProviderId: newCurrentProviderId });
}

/**
 * Delete a provider configuration
 * @param {string} providerId - ID of provider to delete
 */
export function deleteProvider(providerId) {
  const { providers, currentProviderId } = getAllConfigs();
  
  const newProviders = providers.filter(p => p.id !== providerId);
  let newCurrentProviderId = currentProviderId;
  
  // If deleted provider was current, select another one
  if (currentProviderId === providerId && newProviders.length > 0) {
    newCurrentProviderId = newProviders[0].id;
  } else if (newProviders.length === 0) {
    newCurrentProviderId = null;
  }
  
  saveAllConfigs({ providers: newProviders, currentProviderId: newCurrentProviderId });
}

/**
 * Set the current active provider
 * @param {string} providerId - ID of provider to set as current
 */
export function setCurrentProvider(providerId) {
  const { providers } = getAllConfigs();
  
  if (!providers.find(p => p.id === providerId)) {
    throw new Error('Provider not found');
  }
  
  const { currentProviderId } = getAllConfigs();
  saveAllConfigs({ providers, currentProviderId: providerId });
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

