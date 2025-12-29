import React from 'react';
import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import {
  TravelExplore as TravelIcon,
  Hotel as HotelIcon,
  LocalActivity as ActivityIcon,
  Flight as FlightIcon,
} from '@mui/icons-material';

const EmptyState = ({ onExampleClick }) => {
  const examples = [
    {
      icon: <HotelIcon />,
      text: "I want to go gorilla trekking in Bwindi for 3 nights, 2 adults",
      color: '#000000',
    },
    {
      icon: <ActivityIcon />,
      text: "Budget safari trip for 5 days, 1 adult",
      color: '#000000',
    },
    {
      icon: <FlightIcon />,
      text: "Create a quotation for a luxury tour to Kenya",
      color: '#000000',
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        px: 3,
        py: 6,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}
      >
        <TravelIcon sx={{ fontSize: 48, color: '#ffffff' }} />
      </Box>
      
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          mb: 1,
          color: '#000000',
          letterSpacing: '-0.02em',
        }}
      >
        Welcome to Tour Agent Assistant
      </Typography>
      
      <Typography
        variant="body1"
        sx={{
          color: '#666',
          mb: 4,
          maxWidth: '500px',
          lineHeight: 1.7,
        }}
      >
        I can help you plan your trip to East Africa! Get instant quotations for tours, 
        hotels, activities, and more.
      </Typography>

      <Stack spacing={2} sx={{ width: '100%', maxWidth: '600px', mb: 4 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: '#999',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          Try these examples:
        </Typography>
        
        {examples.map((example, index) => (
          <Paper
            key={index}
            elevation={0}
            onClick={() => onExampleClick && onExampleClick(example.text)}
            sx={{
              p: 2.5,
              border: '1px solid #e5e5e5',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              textAlign: 'left',
              '&:hover': {
                borderColor: '#000000',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {React.cloneElement(example.icon, { sx: { color: example.color, fontSize: 24 } })}
            </Box>
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                color: '#000000',
                fontWeight: 500,
              }}
            >
              {example.text}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
        <Button
          variant="outlined"
          onClick={() => onExampleClick && onExampleClick("Create a quotation")}
          sx={{
            borderColor: '#000000',
            color: '#000000',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              bgcolor: '#000000',
              color: '#ffffff',
              borderColor: '#000000',
            },
          }}
        >
          Create Quotation
        </Button>
        <Button
          variant="outlined"
          onClick={() => onExampleClick && onExampleClick("What activities are available?")}
          sx={{
            borderColor: '#000000',
            color: '#000000',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              bgcolor: '#000000',
              color: '#ffffff',
              borderColor: '#000000',
            },
          }}
        >
          Browse Activities
        </Button>
      </Stack>
    </Box>
  );
};

export default EmptyState;

