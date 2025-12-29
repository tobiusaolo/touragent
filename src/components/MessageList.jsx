import React, { useState, useEffect } from 'react'
import { Box, Paper, Typography, Avatar } from '@mui/material'
import { Person as PersonIcon } from '@mui/icons-material'
import AgentAvatar from './AgentAvatar'
import QuotationCard from './QuotationCard'
import TypewriterText from './TypewriterText'
import MessageActions from './MessageActions'

// Simple markdown-like formatting
const formatMarkdown = (text) => {
  if (!text) return null
  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Bold text
    let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Code blocks
    formattedLine = formattedLine.replace(/`(.*?)`/g, '<code>$1</code>')
    // Headers
    formattedLine = formattedLine.replace(/^### (.*)$/gm, '<h3>$1</h3>')
    formattedLine = formattedLine.replace(/^## (.*)$/gm, '<h2>$1</h2>')
    formattedLine = formattedLine.replace(/^# (.*)$/gm, '<h1>$1</h1>')
    return <div key={i} dangerouslySetInnerHTML={{ __html: formattedLine }} />
  })
}

function MessageList({ 
  messages, 
  isLoading,
  isStreaming = false,
  onRetryMessage,
  onEditMessage,
  onDeleteMessage,
  onRegenerateResponse,
  onFeedback,
  onShareMessage,
  onRefineQuotation,
  onDuplicateQuotation,
}) {
  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxWidth: '100%',
      }}
    >
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
          }}
        >
          {message.role === 'assistant' ? (
            <AgentAvatar />
          ) : (
            <Avatar sx={{ 
              bgcolor: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
              background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
              width: 40,
              height: 40,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              <PersonIcon sx={{ color: '#ffffff', fontSize: 20 }} />
            </Avatar>
          )}

          {message.isQuotation ? (
            <Box sx={{ maxWidth: { xs: '100%', sm: '90%' }, width: '100%' }}>
              <QuotationCard 
                quotation={message.data}
                onRefine={onRefineQuotation}
                onDuplicate={onDuplicateQuotation}
                onShare={onShareMessage}
              />
            </Box>
          ) : message.content && message.content.trim() ? (
            <Paper
              elevation={0}
              role="article"
              aria-label={message.role === 'user' ? 'Your message' : 'Assistant response'}
              sx={{
                p: { xs: 2, sm: 3 },
                maxWidth: { xs: '85%', sm: '70%' },
                bgcolor: message.error
                  ? '#fff5f5'
                  : message.role === 'user' 
                  ? 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'
                  : '#ffffff',
                color: message.role === 'user' ? '#ffffff' : '#000000',
                borderRadius: 3,
                border: message.error
                  ? '2px solid #d32f2f'
                  : message.role === 'user' 
                  ? 'none'
                  : '1px solid #e5e5e5',
                boxShadow: message.error
                  ? '0 2px 8px rgba(211, 47, 47, 0.15)'
                  : message.role === 'user'
                  ? '0 4px 16px rgba(0,0,0,0.2)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'fadeIn 0.4s ease-out',
                position: 'relative',
                '@keyframes fadeIn': {
                  from: {
                    opacity: 0,
                    transform: message.role === 'user' ? 'translateX(20px)' : 'translateX(-20px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateX(0)',
                  },
                },
                '&:hover': {
                  boxShadow: message.error
                    ? '0 4px 16px rgba(211, 47, 47, 0.25)'
                    : message.role === 'user'
                    ? '0 6px 24px rgba(0,0,0,0.25)'
                    : '0 4px 16px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                  borderColor: message.error ? '#d32f2f' : message.role === 'user' ? 'none' : '#000000',
                  '& .message-actions': {
                    opacity: 1,
                  },
                },
              }}
            >
              <Box
                className="message-actions"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  opacity: message.error ? 1 : 0, // Always show for errors
                  transition: 'opacity 0.2s',
                  zIndex: 10,
                }}
              >
                <MessageActions
                  message={message}
                  onCopy={() => handleCopy(message.content)}
                  onRetry={message.error && onRetryMessage ? () => onRetryMessage(message) : undefined}
                  onEdit={onEditMessage ? () => onEditMessage(message) : undefined}
                  onDelete={onDeleteMessage ? () => onDeleteMessage(message.id) : undefined}
                  onRegenerate={onRegenerateResponse && !message.error ? () => onRegenerateResponse(message) : undefined}
                  onFeedback={onFeedback}
                  onShare={onShareMessage ? () => onShareMessage(message) : undefined}
                  showShare={message.isQuotation}
                />
              </Box>
              {message.error && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#d32f2f',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Error
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.7,
                  fontSize: '0.9375rem',
                  fontWeight: message.role === 'user' ? 500 : 400,
                  color: message.role === 'user' ? '#ffffff' : '#000000',
                  '& strong': {
                    fontWeight: 700,
                    color: message.role === 'user' ? '#ffffff' : '#000000',
                  },
                  '& code': {
                    bgcolor: message.role === 'user' 
                      ? 'rgba(255,255,255,0.15)' 
                      : 'rgba(0,0,0,0.08)',
                    color: message.role === 'user' ? '#ffffff' : '#000000',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.875em',
                    border: message.role === 'user'
                      ? '1px solid rgba(255,255,255,0.2)'
                      : '1px solid #e5e5e5',
                  },
                  '& p': {
                    margin: '0.75em 0',
                    '&:first-of-type': {
                      marginTop: 0,
                    },
                    '&:last-of-type': {
                      marginBottom: 0,
                    },
                  },
                  '& ul, & ol': {
                    marginLeft: '1.5em',
                    marginTop: '0.5em',
                    marginBottom: '0.5em',
                  },
                }}
              >
                {message.role === 'assistant' && !message.isQuotation && message.content && !message.isTypingComplete ? (
                  <TypewriterText 
                    text={message.content} 
                    speed={15}
                    onComplete={() => {
                      // Typewriter complete
                    }}
                  />
                ) : message.content ? (
                  formatMarkdown(message.content)
                ) : null}
              </Box>
              {message.timestamp && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 2,
                    opacity: message.role === 'user' ? 0.7 : 0.5,
                    fontSize: '0.75rem',
                    color: message.role === 'user' ? 'rgba(255,255,255,0.8)' : '#999',
                    fontWeight: 500,
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              )}
            </Paper>
          ) : null}
        </Box>
      ))}

      {messages.length === 0 && !isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <Typography variant="body2" sx={{ color: '#999' }}>
            No messages yet. Start a conversation!
          </Typography>
        </Box>
      )}

      {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && !isStreaming && (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-start',
            animation: 'fadeIn 0.3s ease-out',
            alignItems: 'flex-start',
          }}
        >
          <AgentAvatar />
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: '#fafafa',
              borderRadius: 3,
              border: '1px solid #e5e5e5',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              minWidth: '120px',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#000000',
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                  '50%': {
                    opacity: 0.5,
                    transform: 'scale(0.8)',
                  },
                },
              }}
            />
            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, fontSize: '0.875rem' }}>
              Thinking...
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  )
}

export default MessageList

