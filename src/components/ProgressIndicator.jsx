import React from 'react';
import './ProgressIndicator.css';

/**
 * Progress Indicator Component
 * Shows real-time progress updates during quotation generation
 * Similar to ChatGPT/Grok typing indicators
 */
const ProgressIndicator = ({ currentMessage, progress, isConnected }) => {
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

  return (
    <div className="progress-indicator">
      <div className="progress-content">
        <span 
          className="progress-icon" 
          style={{ color: getColor(type) }}
        >
          {getIcon(type)}
        </span>
        <span className="progress-message">{message}</span>
        {showProgress && (
          <span className="progress-percentage">{Math.round(progress)}%</span>
        )}
      </div>
      
      {showProgress && (
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${progress}%`,
              backgroundColor: getColor(type)
            }}
          />
        </div>
      )}
      
      {type === 'thinking' || type === 'processing' || type === 'searching' && (
        <div className="progress-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;

