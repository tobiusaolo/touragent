import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import {
  Keyboard as KeyboardIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const ShortcutsDialog = ({ open, onClose }) => {
  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: [['Cmd', 'K'], ['Ctrl', 'K']], description: 'Open command palette' },
        { keys: [['Cmd', 'L'], ['Ctrl', 'L']], description: 'Focus input field' },
        { keys: ['Esc'], description: 'Close dialogs/cancel' },
        { keys: [['Cmd', '/'], ['Ctrl', '/']], description: 'Show keyboard shortcuts' },
      ],
    },
    {
      category: 'Messaging',
      items: [
        { keys: [['Cmd', 'Enter'], ['Ctrl', 'Enter']], description: 'Send message' },
        { keys: ['Enter'], description: 'New line (Shift+Enter to send)' },
        { keys: ['↑', '↓'], description: 'Navigate message history' },
      ],
    },
    {
      category: 'Actions',
      items: [
        { keys: ['Tab'], description: 'Autocomplete suggestions' },
        { keys: [['Cmd', 'Backspace'], ['Ctrl', 'Backspace']], description: 'Clear input' },
      ],
    },
  ];

  const renderKeys = (keys) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    return keys.map((key, index) => {
      if (Array.isArray(key)) {
        const macKey = key[0];
        const winKey = key[1];
        const displayKey = isMac ? macKey : winKey;
        return (
          <React.Fragment key={index}>
            {index > 0 && <span style={{ margin: '0 4px' }}>+</span>}
            <Chip
              label={displayKey}
              size="small"
              sx={{
                fontSize: '0.7rem',
                height: '24px',
                fontWeight: 600,
                bgcolor: '#f5f5f5',
                border: '1px solid #e5e5e5',
              }}
            />
          </React.Fragment>
        );
      }
      return (
        <React.Fragment key={index}>
          {index > 0 && <span style={{ margin: '0 4px' }}>+</span>}
          <Chip
            label={key}
            size="small"
            sx={{
              fontSize: '0.7rem',
              height: '24px',
              fontWeight: 600,
              bgcolor: '#f5f5f5',
              border: '1px solid #e5e5e5',
            }}
          />
        </React.Fragment>
      );
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
      aria-labelledby="shortcuts-dialog-title"
    >
      <DialogTitle
        id="shortcuts-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1,
        }}
      >
        <KeyboardIcon />
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          Keyboard Shortcuts
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        {shortcuts.map((category, catIndex) => (
          <Box key={catIndex} sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                color: '#000000',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
              }}
            >
              {category.category}
            </Typography>
            <List sx={{ py: 0 }}>
              {category.items.map((item, itemIndex) => (
                <ListItem
                  key={itemIndex}
                  sx={{
                    py: 1.5,
                    px: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <ListItemText
                    primary={item.description}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: '0.9375rem',
                        color: '#000000',
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {renderKeys(item.keys)}
                  </Box>
                </ListItem>
              ))}
            </List>
            {catIndex < shortcuts.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          startIcon={<CloseIcon />}
          sx={{
            bgcolor: '#000000',
            color: '#ffffff',
            '&:hover': {
              bgcolor: '#1a1a1a',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShortcutsDialog;

