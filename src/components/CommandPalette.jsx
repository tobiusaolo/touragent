import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  Keyboard as KeyboardIcon,
  Clear as ClearIcon,
  TextFields as FocusIcon,
  Close as CloseIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

const CommandPalette = ({ open, onClose, onCommand, messageHistory = [] }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const commands = [
    {
      id: 'focus-input',
      label: 'Focus Input',
      description: 'Move focus to message input',
      icon: <FocusIcon />,
      shortcut: 'Cmd/Ctrl + L',
      action: () => {
        onCommand('focus-input');
        onClose();
      },
    },
    {
      id: 'clear-chat',
      label: 'Clear Chat',
      description: 'Clear all messages',
      icon: <ClearIcon />,
      action: () => {
        onCommand('clear-chat');
        onClose();
      },
    },
    {
      id: 'show-shortcuts',
      label: 'Show Keyboard Shortcuts',
      description: 'Display all available shortcuts',
      icon: <KeyboardIcon />,
      shortcut: 'Cmd/Ctrl + /',
      action: () => {
        onCommand('show-shortcuts');
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredHistory = messageHistory
    .filter(msg => msg.role === 'user' && msg.content.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5);

  const allItems = [...filteredCommands, ...filteredHistory.map(msg => ({
    id: `history-${msg.id}`,
    label: msg.content.substring(0, 60) + (msg.content.length > 60 ? '...' : ''),
    description: 'From message history',
    icon: <HistoryIcon />,
    action: () => {
      onCommand('use-history', msg.content);
      onClose();
    },
  }))];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (listRef.current && allItems[selectedIndex]) {
      const selectedElement = listRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, allItems.length]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          mt: 8,
          maxHeight: '70vh',
        },
      }}
      aria-labelledby="command-palette-title"
      aria-describedby="command-palette-description"
    >
      <DialogTitle
        id="command-palette-title"
        sx={{
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <SearchIcon />
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          Command Palette
        </Typography>
        <Chip
          label="Cmd/Ctrl + K"
          size="small"
          sx={{
            ml: 'auto',
            fontSize: '0.7rem',
            height: '20px',
          }}
        />
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0 }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          placeholder="Type to search commands..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          autoFocus
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              px: 2,
              py: 1.5,
              fontSize: '0.9375rem',
            },
          }}
          aria-label="Search commands"
        />
        <Divider />
        <List
          ref={listRef}
          sx={{
            maxHeight: '50vh',
            overflow: 'auto',
            py: 0,
          }}
          role="listbox"
          aria-label="Command list"
        >
          {allItems.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No commands found"
                secondary="Try a different search term"
                sx={{ textAlign: 'center', py: 2 }}
              />
            </ListItem>
          ) : (
            allItems.map((item, index) => (
              <ListItem
                key={item.id}
                disablePadding
                role="option"
                aria-selected={index === selectedIndex}
              >
                <ListItemButton
                  selected={index === selectedIndex}
                  onClick={item.action}
                  sx={{
                    py: 1.5,
                    px: 2,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(0, 0, 0, 0.08)',
                    },
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#000000' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={item.description}
                    primaryTypographyProps={{
                      sx: { fontWeight: index === selectedIndex ? 600 : 400 },
                    }}
                  />
                  {item.shortcut && (
                    <Chip
                      label={item.shortcut}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        height: '20px',
                        bgcolor: 'rgba(0, 0, 0, 0.06)',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;

