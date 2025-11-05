/**
 * Configuration management for LLM providers
 * Stores and retrieves provider configurations from server-side file
 */

/**
 * Get all provider configurations from server
 * @returns {Promise<Object>} Object with providers array and currentProviderId
 */
export async function getAllConfigs() {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error('Failed to fetch configurations');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to load configs:', error);
    return { providers: [], currentProviderId: null };
  }
}

/**
 * Get current provider configuration
 * @returns {Promise<Object|null>} Current provider configuration or null if not set
 */
export async function getConfig() {
  const { providers, currentProviderId } = await getAllConfigs();
  if (!currentProviderId || !providers.length) return null;
  
  return providers.find(p => p.id === currentProviderId) || null;
}

/**
 * Save all provider configurations to server
 * @param {Object} configData - Configuration data
 * @param {Array} configData.providers - Array of provider configurations
 * @param {string} configData.currentProviderId - ID of current active provider
 */
export async function saveAllConfigs(configData) {
  try {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save configurations');
    }
    
    return await response.json();
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
export async function saveProvider(provider, isCurrent = true) {
  const { providers, currentProviderId } = await getAllConfigs();
  
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
  
  return await saveAllConfigs({ providers, currentProviderId: newCurrentProviderId });
}

/**
 * Delete a provider configuration
 * @param {string} providerId - ID of provider to delete
 */
export async function deleteProvider(providerId) {
  const { providers, currentProviderId } = await getAllConfigs();
  
  const newProviders = providers.filter(p => p.id !== providerId);
  let newCurrentProviderId = currentProviderId;
  
  // If deleted provider was current, select another one
  if (currentProviderId === providerId && newProviders.length > 0) {
    newCurrentProviderId = newProviders[0].id;
  } else if (newProviders.length === 0) {
    newCurrentProviderId = null;
  }
  
  return await saveAllConfigs({ providers: newProviders, currentProviderId: newCurrentProviderId });
}

/**
 * Set current active provider
 * @param {string} providerId - ID of provider to set as current
 */
export async function setCurrentProvider(providerId) {
  const { providers } = await getAllConfigs();
  
  if (!providers.find(p => p.id === providerId)) {
    throw new Error('Provider not found');
  }
  
  return await saveAllConfigs({ providers, currentProviderId: providerId });
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
