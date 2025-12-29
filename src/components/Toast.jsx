import React, { useEffect } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';

const Toast = ({ open, onClose, message, type = 'info', title, duration = 4000 }) => {
  useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      case 'warning':
        return <Warning />;
      default:
        return <Info />;
    }
  };

  const getSeverity = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          bgcolor: '#000000',
          color: '#ffffff',
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity={getSeverity()}
        icon={getIcon()}
        sx={{
          bgcolor: type === 'success' ? '#000000' : type === 'error' ? '#d32f2f' : '#000000',
          color: '#ffffff',
          '& .MuiAlert-icon': {
            color: '#ffffff',
          },
          '& .MuiAlert-action': {
            color: '#ffffff',
          },
          minWidth: '300px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}
      >
        {title && <AlertTitle sx={{ fontWeight: 700, mb: 0.5 }}>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;

