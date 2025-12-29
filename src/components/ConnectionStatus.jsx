import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import {
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

const ConnectionStatus = ({ isConnected, lastConnected, isWebSocket = false }) => {
  const getStatus = () => {
    if (isConnected) {
      return {
        label: isWebSocket ? 'Connected (Real-time)' : 'Connected',
        color: '#000000',
        bgcolor: '#f0f0f0',
        icon: <WifiIcon sx={{ fontSize: 16 }} />,
      };
    }
    return {
      label: isWebSocket ? 'Disconnected (HTTP mode)' : 'Disconnected',
      color: '#666',
      bgcolor: '#f5f5f5',
      icon: <WifiOffIcon sx={{ fontSize: 16 }} />,
    };
  };

  const status = getStatus();

  return (
    <Tooltip 
      title={
        isConnected
          ? `Connected${lastConnected ? ` since ${new Date(lastConnected).toLocaleTimeString()}` : ''}`
          : 'Using HTTP fallback mode'
      }
      arrow
    >
      <Chip
        icon={status.icon}
        label={status.label}
        size="small"
        sx={{
          height: 28,
          fontSize: '0.75rem',
          fontWeight: 500,
          color: status.color,
          bgcolor: status.bgcolor,
          border: `1px solid ${status.color}20`,
          '& .MuiChip-icon': {
            color: status.color,
          },
          transition: 'all 0.2s',
        }}
      />
    </Tooltip>
  );
};

export default ConnectionStatus;

