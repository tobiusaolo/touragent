import axios from 'axios'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://walrus-app-6lbad.ondigitalocean.app/api/v1'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 600000, // 10 minutes timeout for quotation generation (can take time for complex requests)
})

// Generate a unique agent ID for the session
const generateAgentId = () => {
  if (typeof window !== 'undefined') {
    let agentId = sessionStorage.getItem('agent_id')
    if (!agentId) {
      agentId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
      sessionStorage.setItem('agent_id', agentId)
    }
    return agentId
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ============================================================================
// Chat Endpoint (LLM-driven interactive responses)
// ============================================================================

/**
 * Send chat message (LLM-driven interactive responses)
 * @param {string} message - User message
 * @param {Object} currentQuotation - Current quotation if available
 * @param {Array} chatHistory - Previous conversation history
 * @returns {Promise<Object>} LLM-generated response
 */
export const chatMessage = async (message, currentQuotation = null, chatHistory = []) => {
  try {
    const response = await apiClient.post('/chat/message', {
      message: message,
      current_quotation: currentQuotation,
      chat_history: chatHistory,
      agent_id: generateAgentId(),
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to send chat message')
  }
}

// ============================================================================
// RFQ Endpoints
// ============================================================================

/**
 * Parse RFQ (Request for Quotation)
 * @param {Object} rfqData - RFQ data in JSON format (preferred)
 * @param {string} rfqText - RFQ text (alternative to rfqData)
 * @param {string} targetLang - Target language code (default: 'en')
 * @returns {Promise<Object>} Parsed RFQ data
 */
export const parseRFQ = async (rfqData = null, rfqText = null, targetLang = 'en') => {
  try {
    const response = await apiClient.post('/rfq/parse', {
      rfq_data: rfqData,
      rfq_text: rfqText,
      agent_id: generateAgentId(),
      target_lang: targetLang,
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to parse RFQ')
  }
}

/**
 * Process complete RFQ through all modules
 * @param {Object} rfqData - RFQ data in JSON format
 * @param {string} rfqText - RFQ text (alternative)
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} Complete RFQ processing results
 */
export const processCompleteRFQ = async (rfqData = null, rfqText = null, targetLang = 'en') => {
  try {
    const response = await apiClient.post('/rfq/process-complete', {
      rfq_data: rfqData,
      rfq_text: rfqText,
      agent_id: generateAgentId(),
      target_lang: targetLang,
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to process complete RFQ')
  }
}

/**
 * Estimate complete tour cost
 * @param {Object} rfqData - RFQ data in JSON format
 * @param {string} rfqText - RFQ text (alternative)
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} Tour cost estimation
 */
export const estimateTourCost = async (rfqData = null, rfqText = null, targetLang = 'en') => {
  try {
    const response = await apiClient.post('/tour-cost/estimate', {
      rfq_data: rfqData,
      rfq_text: rfqText,
      agent_id: generateAgentId(),
      target_lang: targetLang,
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to estimate tour cost')
  }
}

// ============================================================================
// Module Endpoints (Individual Agents)
// ============================================================================

/**
 * Information Search Agent - Search for hotels and locations
 * @param {Object} rfqData - RFQ data
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} Hotel and location information
 */
export const searchInformation = async (rfqData, targetLang = 'en') => {
  try {
    const response = await apiClient.post('/modules/information/search', {
      rfq_data: rfqData,
      agent_id: generateAgentId(),
      target_lang: targetLang,
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to search information')
  }
}

/**
 * Activities Search Agent - Search for activities
 * @param {Object} rfqData - RFQ data
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} Activity information
 */
export const searchActivities = async (rfqData, targetLang = 'en') => {
  try {
    const response = await apiClient.post('/modules/activities/search', {
      rfq_data: rfqData,
      agent_id: generateAgentId(),
      target_lang: targetLang,
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to search activities')
  }
}

/**
 * Tour Guide Agent - Calculate tour guide cost
 * @param {Object} rfqData - RFQ data
 * @returns {Promise<Object>} Tour guide cost
 */
export const calculateTourGuide = async (rfqData) => {
  try {
    const response = await apiClient.post('/modules/tour-guide/calculate', {
      rfq_data: rfqData,
      agent_id: generateAgentId(),
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to calculate tour guide cost')
  }
}

/**
 * Flight Agent - Calculate flight cost
 * @param {Object} rfqData - RFQ data
 * @returns {Promise<Object>} Flight cost
 */
export const calculateFlight = async (rfqData) => {
  try {
    const response = await apiClient.post('/modules/flight/calculate', {
      rfq_data: rfqData,
      agent_id: generateAgentId(),
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to calculate flight cost')
  }
}

/**
 * Visa Agent - Calculate visa cost
 * @param {Object} rfqData - RFQ data
 * @returns {Promise<Object>} Visa cost
 */
export const calculateVisa = async (rfqData) => {
  try {
    const response = await apiClient.post('/modules/visa/calculate', {
      rfq_data: rfqData,
      agent_id: generateAgentId(),
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to calculate visa cost')
  }
}

/**
 * Vehicle Agent - Calculate vehicle rental cost
 * @param {Object} rfqData - RFQ data
 * @returns {Promise<Object>} Vehicle cost
 */
export const calculateVehicle = async (rfqData) => {
  try {
    const response = await apiClient.post('/modules/vehicle/calculate', {
      rfq_data: rfqData,
      agent_id: generateAgentId(),
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to calculate vehicle cost')
  }
}

/**
 * Fuel Agent - Calculate fuel cost
 * @param {Object} rfqData - RFQ data
 * @returns {Promise<Object>} Fuel cost
 */
export const calculateFuel = async (rfqData) => {
  try {
    const response = await apiClient.post('/modules/fuel/calculate', {
      rfq_data: rfqData,
      agent_id: generateAgentId(),
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to calculate fuel cost')
  }
}

/**
 * Tour Planning Agent - Plan tour itinerary
 * @param {Object} rfqData - RFQ data
 * @returns {Promise<Object>} Tour plan
 */
export const planTour = async (rfqData) => {
  try {
    const response = await apiClient.post('/modules/tour-planning/plan', {
      rfq_data: rfqData,
      agent_id: generateAgentId(),
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to plan tour')
  }
}

// ============================================================================
// Workflow Endpoints
// ============================================================================

/**
 * Get workflow status
 * @param {string} workflowId - Workflow ID
 * @returns {Promise<Object>} Workflow status and details
 */
export const getWorkflowStatus = async (workflowId) => {
  try {
    const response = await apiClient.get(`/workflow/${workflowId}`)
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to get workflow status')
  }
}

/**
 * Get checkpoint details
 * @param {string} checkpointId - Checkpoint ID
 * @returns {Promise<Object>} Checkpoint details
 */
export const getCheckpoint = async (checkpointId) => {
  try {
    const response = await apiClient.get(`/workflow/checkpoint/${checkpointId}`)
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to get checkpoint')
  }
}

/**
 * Approve checkpoint
 * @param {string} checkpointId - Checkpoint ID
 * @param {Object} modifications - Optional modifications
 * @returns {Promise<Object>} Approval result
 */
export const approveCheckpoint = async (checkpointId, modifications = null) => {
  try {
    const response = await apiClient.post(`/workflow/checkpoint/${checkpointId}/approve`, {
      modifications: modifications,
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to approve checkpoint')
  }
}

/**
 * Modify checkpoint
 * @param {string} checkpointId - Checkpoint ID
 * @param {Object} modifications - Modifications to apply
 * @returns {Promise<Object>} Modification result
 */
export const modifyCheckpoint = async (checkpointId, modifications) => {
  try {
    const response = await apiClient.post(`/workflow/checkpoint/${checkpointId}/modify`, {
      modifications: modifications,
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to modify checkpoint')
  }
}

/**
 * Reject checkpoint
 * @param {string} checkpointId - Checkpoint ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Rejection result
 */
export const rejectCheckpoint = async (checkpointId, reason = '') => {
  try {
    const response = await apiClient.post(`/workflow/checkpoint/${checkpointId}/reject`, {
      reason: reason,
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to reject checkpoint')
  }
}

// ============================================================================
// Cache Endpoints
// ============================================================================

/**
 * Get cache statistics
 * @returns {Promise<Object>} Cache statistics
 */
export const getCacheStats = async () => {
  try {
    const response = await apiClient.get('/cache/stats')
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to get cache stats')
  }
}

/**
 * Clear cache
 * @param {string} cacheType - Type of cache to clear (optional)
 * @returns {Promise<Object>} Clear result
 */
export const clearCache = async (cacheType = null) => {
  try {
    const response = await apiClient.post('/cache/clear', {
      cache_type: cacheType,
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to clear cache')
  }
}

/**
 * Pre-cache data
 * @param {Array} activities - Activities to pre-cache
 * @param {Array} locations - Locations to pre-cache
 * @returns {Promise<Object>} Pre-cache result
 */
export const preCacheData = async (activities = [], locations = []) => {
  try {
    const response = await apiClient.post('/cache/pre-cache', {
      activities: activities,
      locations: locations,
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to pre-cache data')
  }
}

// ============================================================================
// System Endpoints
// ============================================================================

/**
 * Health check
 * @returns {Promise<Object>} Health status
 */
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`)
    return response.data
  } catch (error) {
    throw handleError(error, 'Health check failed')
  }
}

/**
 * Get available modules
 * @returns {Promise<Object>} List of available modules
 */
export const getModules = async () => {
  try {
    const response = await apiClient.get('/modules')
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to get modules')
  }
}

/**
 * Refine an existing quotation based on user feedback
 * @param {Object} currentRFQ - Current RFQ data
 * @param {string} adjustmentRequest - User's adjustment request
 * @param {string} workflowId - Optional workflow ID
 * @returns {Promise<Object>} Refined quotation
 */
export const refineQuotation = async (currentRFQ, adjustmentRequest, workflowId = null) => {
  try {
    const response = await apiClient.post('/quotation/refine', {
      current_rfq: currentRFQ,
      adjustment_request: adjustmentRequest,
      workflow_id: workflowId,
      agent_id: generateAgentId(),
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to refine quotation')
  }
}

/**
 * Process voice RFQ
 * @param {File} audioFile - Audio file
 * @param {string} agentId - Agent ID
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} Processed voice RFQ
 */
export const processVoiceRFQ = async (audioFile, agentId = null, targetLang = 'en') => {
  try {
    const formData = new FormData()
    formData.append('audio', audioFile)
    formData.append('agent_id', agentId || generateAgentId())
    formData.append('target_lang', targetLang)

    const response = await apiClient.post('/voice/process-rfq', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    throw handleError(error, 'Failed to process voice RFQ')
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Handle API errors
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 * @returns {Error} Formatted error
 */
const handleError = (error, defaultMessage) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.detail || error.response.data?.message || defaultMessage
    const errorObj = new Error(message)
    errorObj.status = error.response.status
    errorObj.data = error.response.data
    return errorObj
  } else if (error.request) {
    // Request made but no response
    const apiUrl = error.config?.baseURL || API_BASE_URL
    const errorObj = new Error(`No response from server at ${apiUrl}. Please check if the API is running.`)
    errorObj.status = 0
    errorObj.isConnectionError = true
    return errorObj
  } else {
    // Error setting up request
    const errorObj = new Error(error.message || defaultMessage)
    return errorObj
  }
}

/**
 * Set API base URL
 * @param {string} url - Base URL
 */
export const setApiBaseUrl = (url) => {
  apiClient.defaults.baseURL = url
}

/**
 * Get API base URL
 * @returns {string} Base URL
 */
export const getApiBaseUrl = () => {
  return apiClient.defaults.baseURL
}

// Export default API client for custom requests
export default apiClient

