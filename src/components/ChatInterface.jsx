import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
  Chip,
  Divider,
  AppBar,
  Toolbar,
} from '@mui/material'
import {
  Send as SendIcon,
  TravelExplore as TravelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { estimateTourCost, refineQuotation, chatMessage } from '../api/api'
import MessageList from './MessageList'
import AgentAvatar from './AgentAvatar'
import ProgressIndicator from './ProgressIndicator'
import QuotationCard from './QuotationCard'
import { useWebSocket } from '../hooks/useWebSocket'

function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "👋 Hello! I'm your Tour Agent assistant. I can help you plan your trip to East Africa!\n\nI can:\n• Estimate tour costs\n• Find hotels and activities\n• Plan itineraries\n• Calculate visa and flight costs\n• Refine quotations based on your feedback\n\nWhat would you like to explore today?",
      timestamp: new Date(),
    },
  ])
  // Generate session ID for WebSocket
  const [sessionId] = useState(() => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  })
  
  // WebSocket hook for streaming
  const {
    messages: wsMessages,
    isConnected: wsConnected,
    currentProgress,
    currentMessage,
    startQuotation,
    cancelQuotation
  } = useWebSocket(sessionId)
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [currentQuotation, setCurrentQuotation] = useState(null) // Store current quotation data
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  
  // Handle WebSocket messages
  useEffect(() => {
    if (wsMessages.length > 0) {
      const latestMessage = wsMessages[wsMessages.length - 1]
      
      // Handle progress updates (show streaming indicator)
      if (latestMessage.type && latestMessage.type !== 'final_result' && latestMessage.type !== 'error') {
        setIsStreaming(true)
        setIsLoading(true)
      }
      
      // Handle final result
      if (latestMessage.type === 'final_result') {
        setIsStreaming(false)
        setIsLoading(false)
        const quotation = latestMessage.data?.quotation || latestMessage.data
        if (quotation) {
          setCurrentQuotation({
            rfq_data: quotation.rfq_data || {},
            response: quotation,
            workflow_id: quotation.workflow_id
          })
          // Use QuotationCard for better formatting
          const formattedMessage = {
            id: Date.now(),
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            data: quotation,
            isQuotation: true
          }
          setMessages((prev) => [...prev, formattedMessage])
        }
      }
      
      // Handle errors
      if (latestMessage.type === 'error') {
        setIsStreaming(false)
        setIsLoading(false)
        const errorMsg = {
          id: Date.now(),
          role: 'assistant',
          content: `❌ Error: ${latestMessage.message || latestMessage.error || 'Unknown error'}`,
          timestamp: new Date(),
          error: true
        }
        setMessages((prev) => [...prev, errorMsg])
      }
    }
  }, [wsMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const userInput = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      // Check if this is a quotation request (new quotation or refinement)
      const isQuotationReq = isQuotationQuery(userInput)
      const isRefinement = isAdjustmentQuery(userInput) && currentQuotation
      
      // If it's a new quotation request, use WebSocket
      if (isQuotationReq && !isRefinement) {
        const rfqData = parseUserMessage(userInput)
        if (rfqData && Object.keys(rfqData).length > 0) {
          setIsStreaming(true)
          // Check WebSocket connection before attempting
          if (wsConnected) {
            const success = startQuotation(rfqData)
            if (!success) {
              // Fallback to HTTP if WebSocket send failed
              console.warn('WebSocket send failed, falling back to HTTP')
              await handleSendHTTP(userInput)
            }
          } else {
            // WebSocket not connected, fallback to HTTP immediately
            console.warn('WebSocket not connected, using HTTP endpoint')
            await handleSendHTTP(userInput)
          }
          return
        }
      }
      
      // For refinements or non-quotation queries, use HTTP endpoint
      await handleSendHTTP(userInput)
    } catch (error) {
      console.error('Error:', error)
      
      // Check if it's a timeout error
      const isTimeout = error.message?.includes('timeout') || error.code === 'ECONNABORTED' || error.message?.includes('Network Error')
      
      // Check if it's a connection error
      const isConnectionError = error.message?.includes('No response from server') || 
                                error.message?.includes('Network Error') ||
                                error.code === 'ERR_NETWORK' ||
                                error.status === 0
      
      let errorContent = ''
      if (isTimeout) {
        errorContent = `⏳ The request is taking longer than expected. This usually means the quotation is being generated (it can take 1-2 minutes). Please wait a moment and the quotation should appear.\n\nIf it doesn't appear, please try again.`
      } else if (isConnectionError) {
        errorContent = `❌ Unable to connect to the server.\n\n**Possible solutions:**\n1. Check if the API URL is correct (currently: ${import.meta.env.VITE_API_BASE_URL || 'https://walrus-app-6lbad.ondigitalocean.app/api/v1'})\n2. Verify your network connection\n3. Check browser console for more details\n4. Ensure the backend service is running on Digital Ocean`
      } else {
        errorContent = `❌ Sorry, I encountered an error: ${error.message || error.toString()}\n\nPlease try rephrasing your request or check if the API server is running.`
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        error: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }
  
  // Helper function to handle HTTP-based chat (for non-quotation queries)
  const handleSendHTTP = async (userInput) => {
    try {
      // Use interactive chat endpoint (LLM-driven)
      const chatHistoryForContext = chatHistory.map(h => ({
        role: h.user ? 'user' : 'assistant',
        message: h.user || h.response?.response || ''
      }))
      
      const chatResponse = await chatMessage(userInput, currentQuotation, chatHistoryForContext)
      
      // Create assistant message from LLM response
      const assistantMessage = {
        id: Date.now(),
        role: 'assistant',
        content: chatResponse.response || chatResponse.message || 'I\'m here to help with tour quotations.',
        timestamp: new Date(),
        thinking: chatResponse.thinking,
        action: chatResponse.action,
        data: chatResponse
      }
      
      setMessages((prev) => [...prev, assistantMessage])
      
      // If quotation was generated/refined, update current quotation
      if (chatResponse.quotation) {
        const quotation = chatResponse.quotation
        const quotationData = quotation.data || quotation
        
        // Extract RFQ summary from various possible locations
        const rfqSummary = (
          quotationData.rfq_summary ||
          quotation.rfq_summary ||
          quotationData.rfq_data ||
          quotation.rfq_data ||
          currentQuotation?.rfq_data ||
          {}
        )
        
        const newQuotation = {
          rfq_data: rfqSummary,
          response: quotation,
          workflow_id: chatResponse.workflow_id || quotationData.workflow_id || quotation.workflow_id
        }
        setCurrentQuotation(newQuotation)
        
        // Format and display the quotation
        const formattedMessage = formatResponse(quotationData || quotation)
        setMessages((prev) => [...prev, formattedMessage])
      } else if (chatResponse.action === 'generate_quotation' || chatResponse.action === 'refine_quotation') {
        // If action indicates quotation but no quotation in response, show message
        if (chatResponse.response && !chatResponse.quotation) {
          // Response indicates quotation is being generated
          console.log('Quotation action but no quotation data yet')
        }
      }
      
      // Update chat history
      setChatHistory((prev) => [
        ...prev,
        {
          user: userInput,
          response: chatResponse,
          timestamp: new Date(),
        }
      ])
    } catch (error) {
      throw error // Re-throw to be handled by caller
    }
  }
  
  const isAdjustmentQuery = (message) => {
    const lowerMessage = message.toLowerCase()
    const adjustmentKeywords = [
      'make it', 'change', 'adjust', 'modify', 'update', 'refine',
      'cheaper', 'expensive', 'add', 'remove', 'reduce', 'increase',
      'switch', 'different', 'instead', 'better', 'lower', 'higher',
      'needs', 'need', 'wants', 'want', 'requires', 'require',
      'include', 'including', 'also', 'plus', 'with'
    ]
    
    // Check if it's an adjustment AND we have a current quotation
    const hasAdjustmentKeyword = adjustmentKeywords.some(keyword => lowerMessage.includes(keyword))
    const hasCurrentQuotation = currentQuotation !== null
    
    return hasAdjustmentKeyword && hasCurrentQuotation
  }
  
  // Helper function to detect if query is a quotation request
  const isQuotationQuery = (message) => {
    const lowerMessage = message.toLowerCase()
    const quotationKeywords = [
      'quotation', 'quote', 'cost', 'price', 'budget', 'estimate',
      'create', 'generate', 'plan', 'tour', 'trip', 'safari',
      'hotel', 'activity', 'activities', 'nights', 'days',
      'adults', 'guests', 'travel', 'visit', 'go to', 'want to'
    ]
    
    // Check if message contains quotation-related keywords
    const hasQuotationKeyword = quotationKeywords.some(keyword => lowerMessage.includes(keyword))
    
    // Check if it's a structured query (has field labels)
    const isStructuredQuery = message.includes(':') && (
      message.includes('Client Name:') || 
      message.includes('Nationality:') || 
      message.includes('Tour Experience:') ||
      message.includes('Travel Start Date:') ||
      message.includes('Number of Nights:')
    )
    
    return hasQuotationKeyword || isStructuredQuery
  }
  
  const handleQuotationRefinement = async (adjustmentRequest) => {
    try {
      // Refine the quotation
      const response = await refineQuotation(
        currentQuotation.rfq_data,
        adjustmentRequest,
        currentQuotation.workflow_id
      )

      const assistantMessage = formatRefinedResponse(response, adjustmentRequest)
      setMessages((prev) => [...prev, assistantMessage])
      
      // Update current quotation with refined data
      setCurrentQuotation({
        rfq_data: response.refinement?.refined_rfq || currentQuotation.rfq_data,
        response: response,
        workflow_id: response.workflow_id || response.data?.workflow_id || currentQuotation.workflow_id,
      })
      
      // Update chat history
      setChatHistory((prev) => [
        ...prev,
        { 
          user: adjustmentRequest, 
          response: response,
          rfq_data: response.refinement?.refined_rfq || currentQuotation.rfq_data,
          timestamp: new Date(),
          is_refinement: true,
        },
      ])
    } catch (error) {
      console.error('Refinement error:', error)
      throw error
    }
  }

  const formatRefinedResponse = (data, adjustmentRequest) => {
    const responseData = data.data || data
    const refinement = data.refinement || {}
    const modifications = refinement.modifications_applied || []
    
    let content = ''
    
    if (responseData.status === 'success' || data.status === 'success') {
      content = `✅ **Quotation Refined Based on Your Feedback**\n\n`
      
      if (modifications.length > 0) {
        content += `**Changes Applied:**\n`
        modifications.forEach(mod => {
          content += `✓ ${mod}\n`
        })
        content += `\n`
      }
      
      // Include the full quotation
      const fullQuotation = formatResponse(data)
      content += fullQuotation.content
    } else {
      content = `❌ ${responseData.message || data.message || 'Failed to refine quotation'}`
    }

    return {
      id: Date.now(),
      role: 'assistant',
      content: content,
      timestamp: new Date(),
      data: responseData || data,
      is_refinement: true,
    }
  }

  const parseDate = (dateString) => {
    // Parse various date formats to YYYY-MM-DD
    if (!dateString) return null
    
    try {
      // Handle formats like "January 15, 2026" or "Jan 15, 2026"
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
    } catch (e) {
      // Try other formats
    }
    
    // Handle YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
      return dateString.trim()
    }
    
    return null
  }

  const parseUserMessage = (message) => {
    // Check if this is a structured query (has field labels with colons)
    const isStructuredQuery = message.includes(':') && (
      message.includes('Client Name:') || 
      message.includes('Nationality:') || 
      message.includes('Tour Experience:') ||
      message.includes('Travel Start Date:') ||
      message.includes('Number of Nights:')
    )
    
    if (isStructuredQuery) {
      return parseStructuredQuery(message)
    }
    
    // Use LLM-like parsing to extract RFQ data from natural language
    // Enhanced with context from chat history
    
    const lowerMessage = message.toLowerCase()
    
    // Use previous context if available
    const previousContext = getContextFromHistory()
    
    // Extract tourist type
    let touristType = 'non_resident_foreigner'
    if (lowerMessage.includes('resident') || lowerMessage.includes('ugandan')) {
      touristType = 'resident'
    } else if (lowerMessage.includes('african') || lowerMessage.includes('east african')) {
      touristType = 'african'
    } else if (lowerMessage.includes('nonresident') || lowerMessage.includes('non-resident') || lowerMessage.includes('foreigner')) {
      touristType = 'non_resident_foreigner'
    }

    // Extract budget level
    let classPreference = 'mid_range'
    if (lowerMessage.includes('luxury') || lowerMessage.includes('5 star') || lowerMessage.includes('premium')) {
      classPreference = 'luxury'
    } else if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
      classPreference = 'budget'
    } else if (lowerMessage.includes('midrange') || lowerMessage.includes('mid-range') || lowerMessage.includes('mid range')) {
      classPreference = 'mid_range'
    }

    // Extract guests
    const guestMatch = message.match(/(\d+)\s*(?:adult|person|people|guest)/i)
    const adults = guestMatch ? parseInt(guestMatch[1]) : (previousContext.guests?.adults || 1)
    const childrenMatch = message.match(/(\d+)\s*child/i)
    const children = childrenMatch ? parseInt(childrenMatch[1]) : (previousContext.guests?.children || 0)

    // Extract nights
    const nightsMatch = message.match(/(\d+)\s*(?:night|day)/i)
    const nights = nightsMatch ? parseInt(nightsMatch[1]) : (previousContext.nights || 5)

    // Extract locations
    const locations = []
    const locationKeywords = ['kampala', 'bwindi', 'jinja', 'entebbe', 'kibale', 'queen elizabeth', 'murchison', 'serengeti', 'masai mara']
    locationKeywords.forEach(loc => {
      if (lowerMessage.includes(loc)) {
        locations.push(loc.charAt(0).toUpperCase() + loc.slice(1))
      }
    })

    // Extract activities
    const activities = []
    const activityKeywords = ['gorilla', 'safari', 'chimpanzee', 'rafting', 'bungee', 'hiking', 'migration', 'bird', 'maasai', 'swahili', 'beach']
    activityKeywords.forEach(act => {
      if (lowerMessage.includes(act)) {
        if (act === 'gorilla') activities.push('gorilla trekking')
        else if (act === 'rafting') activities.push('white water rafting')
        else if (act === 'bungee') activities.push('bungee jumping')
        else if (act === 'migration') activities.push('wildebeest migration')
        else if (act === 'bird') activities.push('bird watching')
        else if (act === 'maasai') activities.push('maasai culture')
        else if (act === 'swahili') activities.push('swahili culture')
        else if (act === 'beach') activities.push('beach activities')
        else activities.push(act)
      }
    })

    // Extract dates
    const datePattern = /(?:travel\s+)?(?:start|begin)\s+date[:\s]+([^\n]+)/i
    const endDatePattern = /(?:travel\s+)?(?:end|finish)\s+date[:\s]+([^\n]+)/i
    const startDateMatch = message.match(datePattern)
    const endDateMatch = message.match(endDatePattern)
    
    let checkIn = null
    let checkOut = null
    if (startDateMatch) {
      checkIn = parseDate(startDateMatch[1].trim())
    }
    if (endDateMatch) {
      checkOut = parseDate(endDateMatch[1].trim())
    }

    // Extract special requirements
    const requirements = []
    if (lowerMessage.includes('vegetarian')) requirements.push('vegetarian meals')
    if (lowerMessage.includes('wheelchair') || lowerMessage.includes('accessibility')) requirements.push('accessibility')
    if (lowerMessage.includes('dietary')) requirements.push('dietary restrictions')

    // Merge with previous context if available
    const rfqData = {
      tourist_type: touristType || previousContext.tourist_type || 'non_resident_foreigner',
      class_preference: classPreference || previousContext.class_preference || 'mid_range',
      guests: {
        adults: adults || previousContext.guests?.adults || 1,
        children: children || previousContext.guests?.children || 0,
        total: (adults || previousContext.guests?.adults || 1) + (children || previousContext.guests?.children || 0),
      },
      nights: nights || previousContext.nights || 5,
      locations: locations.length > 0 ? locations : (previousContext.locations || ['Kampala']),
      activities_interest: activities.length > 0 ? activities : (previousContext.activities_interest || []),
      travel_dates: checkIn || checkOut ? {
        check_in: checkIn,
        check_out: checkOut
      } : undefined,
      requirements: requirements.length > 0 ? requirements : undefined,
    }
    
    return rfqData
  }

  const parseStructuredQuery = (message) => {
    // Parse structured query with field labels
    const lines = message.split('\n')
    const rfqData = {
      metadata: {},
      additional_fields: {},
    }
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.includes(':')) return
      
      const [key, ...valueParts] = trimmed.split(':')
      const keyLower = key.trim().toLowerCase()
      const value = valueParts.join(':').trim()
      
      if (!value) return
      
      // Map structured fields
      if (keyLower.includes('client name')) {
        rfqData.metadata.client_name = value
      } else if (keyLower.includes('nationality')) {
        // Map nationality to tourist_type
        const nationalityLower = value.toLowerCase()
        if (nationalityLower.includes('nonresident') || nationalityLower.includes('non-resident') || nationalityLower.includes('foreigner')) {
          rfqData.tourist_type = 'non_resident_foreigner'
        } else if (nationalityLower.includes('resident') || nationalityLower.includes('ugandan')) {
          rfqData.tourist_type = 'resident'
        } else if (nationalityLower.includes('african') || nationalityLower.includes('east african')) {
          rfqData.tourist_type = 'african'
        }
      } else if (keyLower.includes('country of origin')) {
        rfqData.metadata.country_of_origin = value
      } else if (keyLower.includes('tour experience')) {
        const expLower = value.toLowerCase()
        if (expLower.includes('luxury') || expLower.includes('premium')) {
          rfqData.class_preference = 'luxury'
        } else if (expLower.includes('budget') || expLower.includes('economy')) {
          rfqData.class_preference = 'budget'
        } else if (expLower.includes('midrange') || expLower.includes('mid-range') || expLower.includes('mid range')) {
          rfqData.class_preference = 'mid_range'
        }
      } else if (keyLower.includes('travel start date') || keyLower.includes('start date')) {
        const date = parseDate(value)
        if (!rfqData.travel_dates) rfqData.travel_dates = {}
        rfqData.travel_dates.check_in = date
      } else if (keyLower.includes('travel end date') || keyLower.includes('end date')) {
        const date = parseDate(value)
        if (!rfqData.travel_dates) rfqData.travel_dates = {}
        rfqData.travel_dates.check_out = date
      } else if (keyLower.includes('number of nights') || (keyLower.includes('nights') && keyLower.includes('number'))) {
        rfqData.nights = parseInt(value) || 1
      } else if (keyLower.includes('adults') && !keyLower.includes('children')) {
        if (!rfqData.guests) rfqData.guests = {}
        rfqData.guests.adults = parseInt(value) || 1
      } else if (keyLower.includes('children')) {
        if (!rfqData.guests) rfqData.guests = {}
        rfqData.guests.children = parseInt(value) || 0
      } else if (keyLower.includes('activities')) {
        // Parse activities - split by comma, "and", "&"
        const activitiesList = value
          .split(/[,&]| and /i)
          .map(a => a.trim())
          .filter(a => a.length > 0)
          .map(a => {
            // Normalize activity names
            const aLower = a.toLowerCase()
            if (aLower.includes('gorilla')) return 'gorilla trekking'
            if (aLower.includes('wildebeest') || aLower.includes('migration')) return 'wildebeest migration'
            if (aLower.includes('maasai')) return 'maasai culture'
            if (aLower.includes('swahili')) return 'swahili culture'
            if (aLower.includes('beach') || aLower.includes('white-sand')) return 'beach activities'
            if (aLower.includes('safari')) return 'safari'
            if (aLower.includes('chimpanzee')) return 'chimpanzee tracking'
            if (aLower.includes('rafting')) return 'white water rafting'
            if (aLower.includes('bungee')) return 'bungee jumping'
            return a
          })
        rfqData.activities_interest = activitiesList
      } else if (keyLower.includes('other notes') || keyLower.includes('notes') || keyLower.includes('requirements')) {
        rfqData.special_requests = value
        // Extract requirements
        const requirements = []
        if (value.toLowerCase().includes('vegetarian')) requirements.push('vegetarian meals')
        if (value.toLowerCase().includes('wheelchair') || value.toLowerCase().includes('accessibility')) requirements.push('accessibility')
        if (requirements.length > 0) rfqData.requirements = requirements
      } else if (keyLower.includes('submission date')) {
        rfqData.metadata.submission_date = value
      } else {
        // Store as additional field
        const fieldKey = key.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
        rfqData.additional_fields[fieldKey] = value
      }
    })
    
    // Calculate total guests
    if (rfqData.guests) {
      rfqData.guests.total = (rfqData.guests.adults || 0) + (rfqData.guests.children || 0)
    }
    
    // Set defaults
    if (!rfqData.tourist_type) rfqData.tourist_type = 'non_resident_foreigner'
    if (!rfqData.class_preference) rfqData.class_preference = 'mid_range'
    if (!rfqData.guests) rfqData.guests = { adults: 1, children: 0, total: 1 }
    if (!rfqData.nights) rfqData.nights = 1
    if (!rfqData.activities_interest) rfqData.activities_interest = []
    if (!rfqData.locations) rfqData.locations = []
    
    return rfqData
  }

  const getContextFromHistory = () => {
    // Extract context from previous messages in the conversation
    if (chatHistory.length === 0) return {}
    
    // Get the most recent successful response
    const lastResponse = chatHistory[chatHistory.length - 1]?.response
    if (!lastResponse || !lastResponse.rfq_summary) return {}
    
    // Extract RFQ data from last response
    const summary = lastResponse.rfq_summary
    return {
      tourist_type: summary.tourist_type,
      class_preference: summary.class_preference || 'mid_range',
      guests: summary.guests,
      nights: summary.nights,
      locations: summary.locations,
      activities_interest: summary.activities,
    }
  }

  const formatResponse = (data) => {
    let content = ''

    // Handle both direct response and nested data structure
    const responseData = data.data || data
    
    if (responseData.status === 'success' || data.status === 'success') {
      const totalCost = responseData.total_cost?.total_usd || data.total_cost?.total_usd || 0
      const breakdown = responseData.total_cost?.breakdown || data.total_cost?.breakdown || {}
      const components = responseData.components || data.components || {}
      const rfqSummary = responseData.rfq_summary || data.rfq_summary || {}
      
      // Generate official quotation
      content = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      content += `📋 **OFFICIAL TOUR QUOTATION**\n`
      content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
      
      // Tour Details
      if (rfqSummary.tourist_type) {
        content += `**Tourist Type:** ${rfqSummary.tourist_type.replace(/_/g, ' ').toUpperCase()}\n`
      }
      if (rfqSummary.guests) {
        content += `**Guests:** ${rfqSummary.guests.adults || 0} Adult(s), ${rfqSummary.guests.children || 0} Child(ren) (Total: ${rfqSummary.guests.total || 0})\n`
      }
      // Duration removed as requested
      if (rfqSummary.locations && rfqSummary.locations.length > 0) {
        content += `**Locations:** ${rfqSummary.locations.join(', ')}\n`
      }
      if (rfqSummary.activities && rfqSummary.activities.length > 0) {
        content += `**Activities:** ${rfqSummary.activities.join(', ')}\n`
      }
      
      content += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      content += `💰 **BUDGET BREAKDOWN**\n`
      content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
      
      // HOTELS SECTION - Always show if hotels exist, even if cost is 0
      const hotelComponent = components.hotel || {}
      const hotelCost = hotelComponent.cost || {}
      const hotelBreakdown = hotelCost.breakdown || breakdown.hotel?.breakdown || []
      // Also check for recommended_hotels in data
      const recommendedHotels = hotelComponent.recommended_hotels || hotelComponent.data?.recommended_hotels || []
      
      // Show hotels section if we have breakdown OR recommended hotels OR cost > 0
      if (hotelBreakdown.length > 0 || recommendedHotels.length > 0 || hotelCost.total_usd > 0) {
        content += `🏨 **ACCOMMODATION**\n`
        content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        
        // Use breakdown if available, otherwise use recommended_hotels
        const hotelsToDisplay = hotelBreakdown.length > 0 ? hotelBreakdown : recommendedHotels
        
        if (hotelsToDisplay.length > 0) {
          hotelsToDisplay.forEach((hotel, index) => {
            content += `\n**Hotel ${index + 1}:** ${hotel.hotel_name || hotel.name || 'Recommended Hotel'}\n`
            content += `   Location: ${hotel.location || 'N/A'}\n`
            if (hotel.rating) content += `   Rating: ${hotel.rating} stars\n`
            if (hotel.class) content += `   Class: ${hotel.class}\n`
            if (hotel.price_per_night_usd) {
              content += `   Price per Night: $${hotel.price_per_night_usd.toFixed(2)} USD\n`
            } else if (hotel.price_per_night) {
              // Handle if price is in UGX (divide by 3750)
              const priceUsd = typeof hotel.price_per_night === 'number' && hotel.price_per_night > 1000 
                ? hotel.price_per_night / 3750 
                : hotel.price_per_night
              content += `   Price per Night: $${priceUsd.toFixed(2)} USD\n`
            }
            if (hotel.total_usd) {
              content += `   Total for Stay: $${hotel.total_usd.toFixed(2)} USD\n`
            } else if (hotel.total_price) {
              // Handle if price is in UGX
              const totalUsd = typeof hotel.total_price === 'number' && hotel.total_price > 1000 
                ? hotel.total_price / 3750 
                : hotel.total_price
              content += `   Total for Stay: $${totalUsd.toFixed(2)} USD\n`
            }
            if (hotel.nights) {
              content += `   Nights: ${hotel.nights}\n`
            }
            if (hotel.guests) {
              content += `   Guests: ${hotel.guests}\n`
            }
          })
        } else {
          content += `Total Accommodation Cost: $${(hotelCost.total_usd || breakdown.hotel?.total_usd || 0).toFixed(2)} USD\n`
        }
        content += `\n**Subtotal (Hotels):** $${(hotelCost.total_usd || breakdown.hotel?.total_usd || 0).toFixed(2)} USD\n\n`
      }
      
      // ACTIVITIES SECTION
      const activitiesComponent = components.activities || {}
      const activitiesCost = activitiesComponent.cost || {}
      const activitiesBreakdown = activitiesCost.breakdown || breakdown.activities?.breakdown || []
      
      if (activitiesCost.total_usd > 0 || activitiesBreakdown.length > 0) {
        content += `🎯 **ACTIVITIES**\n`
        content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        
        if (activitiesBreakdown.length > 0) {
          activitiesBreakdown.forEach((activity, index) => {
            content += `\n**Activity ${index + 1}:** ${activity.activity || activity.name || 'Activity'}\n`
            if (activity.location) content += `   Location: ${activity.location}\n`
            if (activity.price_usd || activity.total_cost_usd) {
              const price = activity.price_usd || activity.total_cost_usd || 0
              content += `   Price: $${price.toFixed(2)} USD\n`
            } else if (activity.total_price) {
              // Handle if price might be in UGX
              const priceUsd = typeof activity.total_price === 'number' && activity.total_price > 1000 
                ? activity.total_price / 3750 
                : activity.total_price
              content += `   Price: $${priceUsd.toFixed(2)} USD\n`
            }
            if (activity.price_per_person) {
              // Handle if price might be in UGX
              const perPersonUsd = typeof activity.price_per_person === 'number' && activity.price_per_person > 1000 
                ? activity.price_per_person / 3750 
                : activity.price_per_person
              content += `   Per Person: $${perPersonUsd.toFixed(2)} USD\n`
            }
            if (activity.adults) content += `   Adults: ${activity.adults}\n`
            if (activity.children) content += `   Children: ${activity.children}\n`
          })
        } else {
          content += `Total Activities Cost: $${(activitiesCost.total_usd || breakdown.activities?.total_usd || 0).toFixed(2)} USD\n`
        }
        content += `\n**Subtotal (Activities):** $${(activitiesCost.total_usd || breakdown.activities?.total_usd || 0).toFixed(2)} USD\n\n`
      }
      
      // VEHICLE SECTION
      const vehicleComponent = components.vehicle || {}
      const vehicleCost = vehicleComponent.cost || {}
      const vehicleBreakdown = vehicleCost.breakdown || breakdown.vehicle?.breakdown || {}
      
      if (vehicleCost.total_usd > 0) {
        content += `🚗 **VEHICLE RENTAL**\n`
        content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        
        if (vehicleBreakdown.vehicle_type) {
          content += `Vehicle Type: ${vehicleBreakdown.vehicle_type}\n`
        }
        if (vehicleBreakdown.rate_per_day_usd) {
          content += `Rate per Day: $${vehicleBreakdown.rate_per_day_usd.toFixed(2)} USD\n`
        }
        if (vehicleBreakdown.days) {
          content += `Days: ${vehicleBreakdown.days}\n`
        }
        if (vehicleComponent.details?.capacity) {
          content += `Capacity: ${vehicleComponent.details.capacity}\n`
        }
        
        content += `\n**Subtotal (Vehicle):** $${vehicleCost.total_usd.toFixed(2)} USD\n\n`
      }
      
      // FUEL SECTION
      const fuelComponent = components.fuel || {}
      const fuelCost = fuelComponent.cost || {}
      const fuelBreakdown = fuelCost.breakdown || breakdown.fuel?.breakdown || {}
      
      if (fuelCost.total_usd > 0) {
        content += `⛽ **FUEL**\n`
        content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        
        if (fuelBreakdown.fuel_type) {
          content += `Fuel Type: ${fuelBreakdown.fuel_type}\n`
        }
        if (fuelBreakdown.price_per_liter_usd) {
          content += `Price per Liter: $${fuelBreakdown.price_per_liter_usd.toFixed(2)} USD\n`
        }
        if (fuelBreakdown.total_liters) {
          content += `Total Liters: ${fuelBreakdown.total_liters.toFixed(2)} L\n`
        }
        if (fuelBreakdown.distance_km) {
          content += `Distance: ${fuelBreakdown.distance_km.toFixed(2)} km\n`
        }
        if (fuelBreakdown.consumption_per_100km) {
          content += `Consumption: ${fuelBreakdown.consumption_per_100km} L/100km\n`
        }
        
        content += `\n**Subtotal (Fuel):** $${fuelCost.total_usd.toFixed(2)} USD\n\n`
      }
      
      // OTHER SERVICES
      if (breakdown.tour_guide?.total_usd > 0) {
        content += `👤 **Tour Guide:** $${breakdown.tour_guide.total_usd.toFixed(2)} USD\n`
        if (breakdown.tour_guide.days) {
          content += `   (${breakdown.tour_guide.days} days @ $${breakdown.tour_guide.fee_per_day_usd?.toFixed(2) || 0}/day)\n`
        }
        content += `\n`
      }
      
      if (breakdown.flight?.total_usd > 0) {
        content += `✈️ **Flight:** $${breakdown.flight.total_usd.toFixed(2)} USD\n\n`
      }
      
      if (breakdown.visa?.total_usd > 0) {
        content += `📋 **Visa:** $${breakdown.visa.total_usd.toFixed(2)} USD\n\n`
      }
      
      // TOTAL
      content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      content += `💰 **TOTAL COST: $${totalCost.toFixed(2)} USD**\n`
      content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
      
      // Add validation info
      const validation = responseData.rfq_validation || data.rfq_validation
      if (validation) {
        if (validation.warnings && validation.warnings.length > 0) {
          content += `⚠️ **Warnings:**\n`
          validation.warnings.forEach(warning => {
            content += `• ${warning}\n`
          })
          content += `\n`
        }
        // Suggestions section removed as requested
      }

      content += `📋 **Workflow ID:** ${responseData.workflow_id || data.workflow_id || 'N/A'}\n`
      content += `📅 **Date:** ${new Date().toLocaleDateString()}\n`
      
      const humanApproval = responseData.human_approval || data.human_approval
      if (humanApproval?.required) {
        content += `\n⏸️ **Approval Required** - Checkpoint ID: ${humanApproval.checkpoint_id}`
      }
      
      content += `\n\n*Note: Each agent applies its own commission rate. All costs in USD.*`
      
    } else if (responseData.status === 'pending_approval' || data.status === 'pending_approval') {
      content = `⏸️ **Approval Required**\n\n`
      content += `Total cost: $${(responseData.total_cost?.total_usd || data.total_cost?.total_usd || 0).toFixed(2)}\n`
      content += `Checkpoint ID: ${responseData.checkpoint_id || data.checkpoint_id}\n\n`
      content += `Please approve via the API endpoint.`
    } else {
      content = `❌ ${responseData.message || data.message || 'An error occurred'}`
    }

    return {
      id: Date.now(),
      role: 'assistant',
      content: content,
      timestamp: new Date(),
      data: responseData || data,
    }
  }


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: "👋 Hello! I'm your Tour Agent assistant. I can help you plan your trip to East Africa!\n\nI can:\n• Estimate tour costs\n• Find hotels and activities\n• Plan itineraries\n• Calculate visa and flight costs\n• Refine quotations based on your feedback\n\nWhat would you like to explore today?",
        timestamp: new Date(),
      },
    ])
    setChatHistory([])
    setCurrentQuotation(null)
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      background: '#ffffff',
    }}>
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          background: '#ffffff',
          borderBottom: '1px solid #e5e5e5',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 4 }, py: 2.5, maxWidth: '1400px', mx: 'auto', width: '100%' }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <TravelIcon sx={{ fontSize: 24, color: '#ffffff' }} />
          </Box>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 800,
              fontSize: { xs: '1.125rem', sm: '1.375rem' },
              color: '#000000',
              letterSpacing: '-0.03em',
            }}
          >
            Tour Agent Assistant
          </Typography>
          <IconButton 
            onClick={handleClearChat} 
            title="Clear Chat"
            sx={{ 
              color: '#000000',
              border: '1px solid #e5e5e5',
              borderRadius: 2,
              p: 1.25,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: '#000000',
                color: '#ffffff',
                borderColor: '#000000',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)',
        position: 'relative',
      }}>
        <Container 
          maxWidth="lg" 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            py: { xs: 3, sm: 4 },
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#000000',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#333333',
            },
          }}>
            <MessageList messages={messages} isLoading={isLoading} />
          </Box>
          {isStreaming && (
            <Box sx={{ pt: 2 }}>
              <ProgressIndicator 
                currentMessage={currentMessage} 
                progress={currentProgress} 
                isConnected={wsConnected} 
              />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Container>
      </Box>

      <Box sx={{ 
        p: { xs: 2.5, sm: 3 }, 
        background: '#ffffff',
        borderTop: '1px solid #e5e5e5',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
        backdropFilter: 'blur(10px)',
      }}>
        <Container maxWidth="lg">
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask me anything about your tour..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            inputRef={inputRef}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: '#fafafa',
                color: '#000000',
                fontSize: '0.9375rem',
                border: '1px solid #e5e5e5',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000',
                    borderWidth: '2px',
                  },
                },
                '&.Mui-focused': {
                  bgcolor: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000',
                    borderWidth: '2px',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: '#000000',
                  py: 1.75,
                  fontWeight: 500,
                  '&::placeholder': {
                    color: '#999',
                    opacity: 1,
                    fontWeight: 400,
                  },
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e5e5e5',
                borderWidth: '1px',
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            sx={{
              background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
              color: '#ffffff',
              width: 56,
              height: 56,
              borderRadius: 3,
              ml: 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:disabled': {
                bgcolor: '#e5e5e5',
                color: '#999999',
                boxShadow: 'none',
              },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {isLoading ? <CircularProgress size={22} sx={{ color: '#ffffff' }} /> : <SendIcon sx={{ fontSize: 22 }} />}
          </IconButton>
        </Box>
          <Box sx={{ mt: 2.5, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip
              label="Try: 'I want to go gorilla trekking in Bwindi for 3 nights, 2 adults'"
              size="small"
              variant="outlined"
              onClick={() => setInput("I want to go gorilla trekking in Bwindi for 3 nights, 2 adults")}
              sx={{
                borderColor: '#e5e5e5',
                color: '#000000',
                fontSize: '0.8125rem',
                height: '36px',
                fontWeight: 500,
                borderRadius: 2,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: '#000000',
                  color: '#ffffff',
                  borderColor: '#000000',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                },
              }}
            />
            <Chip
              label="Try: 'Budget safari trip for 5 days, 1 adult'"
              size="small"
              variant="outlined"
              onClick={() => setInput("Budget safari trip for 5 days, 1 adult")}
              sx={{
                borderColor: '#e5e5e5',
                color: '#000000',
                fontSize: '0.8125rem',
                height: '36px',
                fontWeight: 500,
                borderRadius: 2,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: '#000000',
                  color: '#ffffff',
                  borderColor: '#000000',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                },
              }}
            />
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default ChatInterface

