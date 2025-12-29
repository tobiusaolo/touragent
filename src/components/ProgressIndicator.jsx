import React, { useState, useEffect } from 'react';
import { Box, Paper, Stack, Chip, LinearProgress, Typography } from '@mui/material';
import './ProgressIndicator.css';

/**
 * Progress Indicator Component
 * Shows real-time progress updates during quotation generation
 * Similar to ChatGPT/Grok typing indicators with step-by-step progress
 */
const ProgressIndicator = ({ currentMessage, progress, isConnected }) => {
  const [steps, setSteps] = useState([]);
  
  // Step definitions with icons and descriptions
  const stepDefinitions = {
    rfq_parsing: { icon: '📋', label: 'Parsing Request', color: '#000000' },
    hotel_search: { icon: '🏨', label: 'Searching Hotels', color: '#000000' },
    activity_search: { icon: '🎯', label: 'Finding Activities', color: '#000000' },
    tour_guide_calc: { icon: '👤', label: 'Calculating Guide Costs', color: '#000000' },
    vehicle_search: { icon: '🚗', label: 'Finding Vehicles', color: '#000000' },
    fuel_calc: { icon: '⛽', label: 'Calculating Fuel', color: '#000000' },
    flight_search: { icon: '✈️', label: 'Searching Flights', color: '#000000' },
    visa_search: { icon: '📋', label: 'Checking Visa Requirements', color: '#000000' },
    tour_planning: { icon: '🗺️', label: 'Planning Itinerary', color: '#000000' },
    analyzing: { icon: '🔬', label: 'Analyzing Data', color: '#000000' },
    processing: { icon: '⚙️', label: 'Processing', color: '#000000' },
    thinking: { icon: '🤔', label: 'Thinking', color: '#000000' },
    searching: { icon: '🔍', label: 'Searching', color: '#000000' },
  };

  useEffect(() => {
    if (currentMessage) {
      const messageType = currentMessage.type || 'processing';
      const stepDef = stepDefinitions[messageType];
      
      if (stepDef) {
        setSteps(prev => {
          // Avoid duplicates
          const exists = prev.some(s => s.type === messageType);
          if (!exists) {
            return [...prev, { ...stepDef, type: messageType, completed: false }];
          }
          return prev.map(s => 
            s.type === messageType ? { ...s, completed: false } : s
          );
        });
      }
      
      // Mark previous steps as completed when a new step starts
      if (messageType !== 'thinking' && messageType !== 'processing') {
        setSteps(prev => prev.map(s => 
          s.type !== messageType ? { ...s, completed: true } : s
        ));
      }
    }
  }, [currentMessage]);

  if (!currentMessage || !isConnected) {
    return null;
  }

  const getIcon = (type) => {
    const icons = {
      thinking: '🤔',
      searching: '🔍',
      processing: '⚙️',
      analyzing: '🔬',
      rfq_parsing: '📋',
      hotel_search: '🏨',
      activity_search: '🎯',
      tour_guide_calc: '👤',
      vehicle_search: '🚗',
      fuel_calc: '⛽',
      flight_search: '✈️',
      visa_search: '📋',
      tour_planning: '🗺️',
      step_complete: '✅',
      partial_result: '📊',
      final_result: '✅',
      error: '❌',
      warning: '⚠️',
      connected: '🔌'
    };
    return icons[type] || '⏳';
  };

  const getColor = (type) => {
    if (type === 'error') return '#000000';
    if (type === 'warning') return '#000000';
    if (type === 'final_result' || type === 'step_complete') return '#000000';
    if (type === 'connected') return '#000000';
    return '#000000';
  };

  const message = currentMessage.message || '';
  const type = currentMessage.type || 'processing';
  const showProgress = progress !== undefined && progress !== null;
  const currentStep = stepDefinitions[type] || stepDefinitions.processing;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        bgcolor: '#fafafa',
        borderRadius: 3,
        border: '1px solid #e5e5e5',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        animation: 'slideIn 0.4s ease-out',
        '@keyframes slideIn': {
          from: {
            opacity: 0,
            transform: 'translateY(-10px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <Stack spacing={2}>
        {/* Current Step */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              fontSize: '2rem',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
              },
            }}
          >
            {currentStep.icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: '#000000',
                fontSize: '0.9375rem',
                mb: 0.5,
              }}
            >
              {currentStep.label}
            </Typography>
            {message && (
              <Typography
                variant="body2"
                sx={{
                  color: '#666',
                  fontSize: '0.8125rem',
                }}
              >
                {message}
              </Typography>
            )}
          </Box>
          {showProgress && (
            <Chip
              label={`${Math.round(progress)}%`}
              size="small"
              sx={{
                bgcolor: '#000000',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          )}
        </Box>

        {/* Progress Bar */}
        {showProgress && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#e5e5e5',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor: '#000000',
                },
              }}
            />
          </Box>
        )}

        {/* Step Indicators */}
        {steps.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: '#999',
                fontSize: '0.75rem',
                mb: 1,
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
              }}
            >
              Progress Steps
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {steps.map((step, index) => (
                <Chip
                  key={index}
                  icon={<span>{step.icon}</span>}
                  label={step.label}
                  size="small"
                  sx={{
                    bgcolor: step.completed ? '#000000' : '#f5f5f5',
                    color: step.completed ? '#ffffff' : '#000000',
                    border: step.completed ? 'none' : '1px solid #e5e5e5',
                    fontWeight: step.completed ? 600 : 500,
                    fontSize: '0.75rem',
                    transition: 'all 0.3s ease',
                    animation: !step.completed && step.type === type
                      ? 'pulse 2s ease-in-out infinite'
                      : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.7 },
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Loading Dots */}
        {(type === 'thinking' || type === 'processing' || type === 'searching') && (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', pt: 1 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#000000',
                  animation: 'bounce 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                  '@keyframes bounce': {
                    '0%, 80%, 100%': {
                      transform: 'scale(0)',
                      opacity: 0.5,
                    },
                    '40%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default ProgressIndicator;

