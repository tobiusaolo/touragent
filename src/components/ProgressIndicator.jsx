import React from 'react';
import { 
  Box, 
  Typography,
  LinearProgress
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Hotel as HotelIcon,
  Explore as ExploreIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  LocalGasStation as FuelIcon,
  Flight as FlightIcon,
  Assignment as VisaIcon,
  Map as MapIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Psychology as ThinkingIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

/**
 * Simple and Precise Progress Indicator
 * Shows clear progress updates during quotation generation
 */
const ProgressIndicator = ({ currentMessage, progress, isConnected }) => {
  // Step definitions with Material-UI icons
  const stepDefinitions = {
    rfq_parsing: { 
      icon: DescriptionIcon, 
      label: 'Analyzing Request'
    },
    hotel_search: { 
      icon: HotelIcon, 
      label: 'Searching Hotels'
    },
    activity_search: { 
      icon: ExploreIcon, 
      label: 'Finding Activities'
    },
    tour_guide_calc: { 
      icon: PersonIcon, 
      label: 'Calculating Guide Costs'
    },
    vehicle_search: { 
      icon: CarIcon, 
      label: 'Finding Vehicles'
    },
    fuel_calc: { 
      icon: FuelIcon, 
      label: 'Calculating Fuel'
    },
    flight_search: { 
      icon: FlightIcon, 
      label: 'Searching Flights'
    },
    visa_search: { 
      icon: VisaIcon, 
      label: 'Checking Visa Requirements'
    },
    tour_planning: { 
      icon: MapIcon, 
      label: 'Planning Itinerary'
    },
    analyzing: { 
      icon: AnalyticsIcon, 
      label: 'Analyzing Data'
    },
    processing: { 
      icon: SettingsIcon, 
      label: 'Processing'
    },
    thinking: { 
      icon: ThinkingIcon, 
      label: 'Processing Request'
    },
    searching: { 
      icon: SearchIcon, 
      label: 'Searching'
    },
  };

  if (!currentMessage || !isConnected) {
    return null;
  }

  const message = currentMessage.message || '';
  const type = currentMessage.type || 'processing';
  const currentStep = stepDefinitions[type] || stepDefinitions.processing;
  const IconComponent = currentStep.icon;
  const showProgress = progress !== undefined && progress !== null && progress > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 2,
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000000',
          minWidth: 32,
        }}
      >
        <IconComponent sx={{ fontSize: 20 }} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: showProgress ? 1.5 : 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: '#000000',
              fontSize: '0.875rem',
              lineHeight: 1.4,
              mb: message ? 0.25 : 0,
            }}
          >
            {currentStep.label}
          </Typography>
          {message && (
            <Typography
              variant="caption"
              sx={{
                color: '#666666',
                fontSize: '0.75rem',
                lineHeight: 1.4,
              }}
            >
              {message}
            </Typography>
          )}
        </Box>

        {/* Progress Bar */}
        {showProgress && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  bgcolor: '#f0f0f0',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    bgcolor: '#000000',
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: '#666666',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  minWidth: 40,
                  textAlign: 'right',
                }}
              >
                {Math.round(progress)}%
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProgressIndicator;
