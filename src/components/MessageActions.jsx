import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip, ListItemIcon, ListItemText } from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ContentCopy as CopyIcon,
  Refresh as RetryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

const MessageActions = ({ 
  message, 
  onCopy, 
  onRetry, 
  onEdit, 
  onDelete, 
  onRegenerate,
  onFeedback,
  onShare,
  showFeedback = true,
  showShare = false
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [copied, setCopied] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopy = async () => {
    if (onCopy) {
      await onCopy();
    } else if (message.content) {
      await navigator.clipboard.writeText(message.content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    handleClose();
  };

  const handleAction = (action) => {
    action();
    handleClose();
  };

  return (
    <>
      <Tooltip title="Message actions" arrow>
        <IconButton
          size="small"
          onClick={handleClick}
          aria-label="Message actions"
          sx={{
            opacity: 0,
            transition: 'opacity 0.2s',
            '&:hover, &:focus': {
              opacity: 1,
            },
          }}
        >
          <MoreVertIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 180,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            border: '1px solid #e5e5e5',
          },
        }}
      >
        {message.content && (
          <MenuItem onClick={handleCopy}>
            <ListItemIcon>
              <CopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{copied ? 'Copied!' : 'Copy'}</ListItemText>
          </MenuItem>
        )}
        
        {message.role === 'user' && onEdit && (
          <MenuItem onClick={() => handleAction(onEdit)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        
        {message.role === 'assistant' && onRegenerate && (
          <MenuItem onClick={() => handleAction(onRegenerate)}>
            <ListItemIcon>
              <RetryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Regenerate</ListItemText>
          </MenuItem>
        )}
        
        {message.error && onRetry && (
          <MenuItem onClick={() => handleAction(onRetry)}>
            <ListItemIcon>
              <RetryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Retry</ListItemText>
          </MenuItem>
        )}
        
        {showShare && onShare && (
          <MenuItem onClick={() => handleAction(onShare)}>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
        )}
        
        {showFeedback && message.role === 'assistant' && onFeedback && (
          <>
            <MenuItem onClick={() => handleAction(() => onFeedback('positive'))}>
              <ListItemIcon>
                <ThumbUpIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Helpful</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleAction(() => onFeedback('negative'))}>
              <ListItemIcon>
                <ThumbDownIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Not helpful</ListItemText>
            </MenuItem>
          </>
        )}
        
        {onDelete && (
          <MenuItem 
            onClick={() => handleAction(onDelete)}
            sx={{
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.dark',
              },
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default MessageActions;

