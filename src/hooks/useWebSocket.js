import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for WebSocket connection to quotation service
 * Provides real-time progress updates during quotation generation
 */
export const useWebSocket = (sessionId) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    const wsUrl = import.meta.env.VITE_WS_URL || `wss://walrus-app-6lbad.ondigitalocean.app/ws/quotation/${sessionId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
      console.log('WebSocket connected:', sessionId);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, data]);
        setCurrentMessage(data);
        
        if (data.progress !== undefined) {
          setCurrentProgress(data.progress);
        }

        // Handle final result
        if (data.type === 'final_result') {
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      // Don't show error to user here, let HTTP fallback handle it
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      console.log('WebSocket disconnected:', event.code, event.reason);

      // Attempt to reconnect if not a normal closure
      if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId, connect]);

  const sendMessage = useCallback((action, data = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action, ...data }));
      return true;
    } else {
      console.warn('WebSocket is not connected');
      return false;
    }
  }, []);

  const startQuotation = useCallback((rfqData) => {
    return sendMessage('start_quotation', { rfq_data: rfqData });
  }, [sendMessage]);

  const cancelQuotation = useCallback(() => {
    return sendMessage('cancel');
  }, [sendMessage]);

  return {
    messages,
    isConnected,
    currentProgress,
    currentMessage,
    sendMessage,
    startQuotation,
    cancelQuotation,
    reconnect: connect
  };
};

