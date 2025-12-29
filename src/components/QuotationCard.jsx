import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  Grid,
  Paper,
  Stack,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  LocalActivity as ActivityIcon,
  DirectionsCar as VehicleIcon,
  LocalGasStation as FuelIcon,
  Person as PersonIcon,
  Flight as FlightIcon,
  Description as VisaIcon,
  PictureAsPdf as PdfIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';

const QuotationCard = ({ quotation }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const downloadAsText = () => {
    if (!quotation) return;
    
    const breakdown = quotation.total_cost?.breakdown || quotation.breakdown || {};
    const components = quotation.components || {};
    const totalCost = quotation.total_cost?.total_usd || 0;
    const rfqSummary = quotation.rfq_summary || quotation.rfq_data || {};
    
    let content = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    content += '📋 OFFICIAL TOUR QUOTATION\n';
    content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    if (rfqSummary.tourist_type) {
      content += `Tourist Type: ${rfqSummary.tourist_type.replace(/_/g, ' ').toUpperCase()}\n`;
    }
    if (rfqSummary.guests) {
      content += `Guests: ${rfqSummary.guests.adults || 0} Adult(s), ${rfqSummary.guests.children || 0} Child(ren) (Total: ${rfqSummary.guests.total || 0})\n`;
    }
    if (rfqSummary.locations && rfqSummary.locations.length > 0) {
      content += `Locations: ${rfqSummary.locations.join(', ')}\n`;
    }
    if (rfqSummary.activities && rfqSummary.activities.length > 0) {
      content += `Activities: ${rfqSummary.activities.join(', ')}\n`;
    }
    
    content += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    content += '💰 BUDGET BREAKDOWN\n';
    content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    // Hotels
    const hotels = components.hotel?.recommended_hotels || 
                   components.hotel?.cost?.breakdown || 
                   breakdown.hotel?.breakdown || [];
    const hotelTotal = components.hotel?.cost?.total_usd || breakdown.hotel?.total_usd || 0;
    
    if (hotels.length > 0 || hotelTotal > 0) {
      content += '🏨 ACCOMMODATION\n';
      content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      hotels.forEach((hotel, idx) => {
        content += `\nHotel ${idx + 1}: ${hotel.hotel_name || hotel.name || 'Hotel'}\n`;
        content += `   Location: ${hotel.location || 'N/A'}\n`;
        if (hotel.rating) content += `   Rating: ${hotel.rating} stars\n`;
        if (hotel.price_per_night_usd) {
          content += `   Price per Night: ${formatCurrency(hotel.price_per_night_usd)}\n`;
        }
        if (hotel.total_usd) {
          content += `   Total for Stay: ${formatCurrency(hotel.total_usd)}\n`;
        }
      });
      content += `\nSubtotal (Hotels): ${formatCurrency(hotelTotal)}\n\n`;
    }
    
    // Activities
    const activities = components.activities?.cost?.breakdown || breakdown.activities?.breakdown || [];
    const activitiesTotal = components.activities?.cost?.total_usd || breakdown.activities?.total_usd || 0;
    
    if (activities.length > 0 || activitiesTotal > 0) {
      content += '🎯 ACTIVITIES\n';
      content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      activities.forEach((activity, idx) => {
        content += `\nActivity ${idx + 1}: ${activity.activity || activity.name || 'Activity'}\n`;
        if (activity.location) content += `   Location: ${activity.location}\n`;
        if (activity.price_usd || activity.total_cost_usd) {
          content += `   Price: ${formatCurrency(activity.price_usd || activity.total_cost_usd || 0)}\n`;
        }
      });
      content += `\nSubtotal (Activities): ${formatCurrency(activitiesTotal)}\n\n`;
    }
    
    // Other services
    if (breakdown.vehicle?.total_usd > 0) {
      content += `🚗 Vehicle Rental: ${formatCurrency(breakdown.vehicle.total_usd)}\n\n`;
    }
    if (breakdown.fuel?.total_usd > 0) {
      content += `⛽ Fuel: ${formatCurrency(breakdown.fuel.total_usd)}\n\n`;
    }
    if (breakdown.tour_guide?.total_usd > 0) {
      content += `👤 Tour Guide: ${formatCurrency(breakdown.tour_guide.total_usd)}\n\n`;
    }
    if (breakdown.flight?.total_usd > 0) {
      content += `✈️ Flight: ${formatCurrency(breakdown.flight.total_usd)}\n\n`;
    }
    if (breakdown.visa?.total_usd > 0) {
      content += `📋 Visa: ${formatCurrency(breakdown.visa.total_usd)}\n\n`;
    }
    
    content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    content += `💰 TOTAL COST: ${formatCurrency(totalCost)}\n`;
    content += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    if (quotation.workflow_id) {
      content += `Workflow ID: ${quotation.workflow_id}\n`;
    }
    content += `Date: ${new Date().toLocaleDateString()}\n`;
    content += '\n*Note: Each agent applies its own commission rate. All costs in USD.*\n';
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tour-quotation-${quotation.workflow_id || Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = () => {
    // For PDF, we'll use a simple approach - open print dialog
    // In production, you'd use a library like jsPDF or html2pdf
    window.print();
  };

  const getSectionIcon = (section) => {
    const icons = {
      hotel: <HotelIcon />,
      activities: <ActivityIcon />,
      vehicle: <VehicleIcon />,
      fuel: <FuelIcon />,
      tour_guide: <PersonIcon />,
      flight: <FlightIcon />,
      visa: <VisaIcon />,
    };
    return icons[section] || null;
  };

  const renderHotelSection = (hotels, total) => {
    if (!hotels || hotels.length === 0) return null;

    return (
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              background: '#000000',
            }}
          >
            <HotelIcon sx={{ color: '#ffffff', fontSize: 24 }} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: '#000000',
              letterSpacing: '-0.02em',
            }}
          >
            Accommodation
          </Typography>
        </Stack>
        <Divider sx={{ mb: 3, borderColor: '#000000', borderWidth: 1 }} />
        <Grid container spacing={3}>
          {hotels.map((hotel, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: '100%',
                  border: '1px solid',
                  borderColor: '#e5e5e5',
                  borderRadius: 2.5,
                  background: '#ffffff',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    borderColor: '#000000',
                  },
                }}
              >
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1, 
                    color: '#000000',
                    fontSize: '1rem',
                    lineHeight: 1.4,
                  }}
                >
                  {hotel.hotel_name || hotel.name || 'Hotel'}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1.5 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#000000',
                      fontSize: '0.875rem',
                    }}
                  >
                    📍 {hotel.location || 'N/A'}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                  {hotel.rating && (
                    <Chip
                      label={`${hotel.rating} ⭐`}
                      size="small"
                      sx={{ 
                        background: '#000000',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: '24px',
                        border: 'none',
                      }}
                    />
                  )}
                  {hotel.class && (
                    <Chip
                      label={hotel.class}
                      size="small"
                      sx={{ 
                        background: '#ffffff',
                        color: '#000000',
                        fontWeight: 500,
                        fontSize: '0.7rem',
                        height: '24px',
                        textTransform: 'capitalize',
                        border: '1px solid #000000',
                      }}
                    />
                  )}
                </Stack>
                <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: '#e5e5e5' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#000000',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                      }}
                    >
                      {hotel.nights || 1} night{hotel.nights !== 1 ? 's' : ''}
                      {hotel.guests && ` • ${hotel.guests} guest${hotel.guests !== 1 ? 's' : ''}`}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#000000',
                        fontSize: '1.125rem',
                      }}
                    >
                      {formatCurrency(hotel.total_price_usd || hotel.total_usd || hotel.price_per_night_usd || 0)}
                    </Typography>
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box 
          sx={{ 
            mt: 3, 
            pt: 2.5,
            borderTop: '1px solid',
            borderColor: '#e5e5e5',
            textAlign: 'right' 
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: '#000000',
              fontSize: '1rem',
            }}
          >
            Subtotal: {formatCurrency(total)}
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderActivitySection = (activities, total) => {
    if (!activities || activities.length === 0) return null;

    return (
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              background: '#000000',
            }}
          >
            <ActivityIcon sx={{ color: '#ffffff', fontSize: 24 }} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: '#000000',
              letterSpacing: '-0.02em',
            }}
          >
            Activities
          </Typography>
        </Stack>
        <Divider sx={{ mb: 3, borderColor: '#000000', borderWidth: 1 }} />
        <Stack spacing={2.5}>
          {activities.map((activity, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                p: 2.5,
                border: '1px solid',
                borderColor: '#e5e5e5',
                borderRadius: 2.5,
                background: '#ffffff',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  borderColor: '#000000',
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#000000',
                      mb: 0.5,
                      fontSize: '1rem',
                    }}
                  >
                    {activity.activity || activity.name || 'Activity'}
                  </Typography>
                  {activity.location && (
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#000000',
                          fontSize: '0.875rem',
                        }}
                      >
                        📍 {activity.location}
                      </Typography>
                    </Stack>
                  )}
                  {activity.description && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#000000',
                        mt: 1,
                        display: 'block',
                        lineHeight: 1.5,
                        fontSize: '0.75rem',
                        opacity: 0.7,
                      }}
                    >
                      {activity.description.substring(0, 120)}...
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: 'right', minWidth: '100px' }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#000000',
                      fontSize: '1.125rem',
                    }}
                  >
                    {formatCurrency(activity.price_usd || activity.total_cost_usd || 0)}
                  </Typography>
                  {activity.pricing_details?.per_person && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#000000',
                        fontSize: '0.7rem',
                        display: 'block',
                        mt: 0.25,
                        opacity: 0.7,
                      }}
                    >
                      per person
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
        <Box 
          sx={{ 
            mt: 3, 
            pt: 2.5,
            borderTop: '1px solid',
            borderColor: '#e5e5e5',
            textAlign: 'right' 
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: '#000000',
              fontSize: '1rem',
            }}
          >
            Subtotal: {formatCurrency(total)}
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderOtherSection = (title, icon, data, total) => {
    if (!total || total === 0) return null;

    return (
      <Box 
        sx={{ 
          mb: 3,
          p: 2.5,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: '#e5e5e5',
          background: '#ffffff',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            borderColor: '#000000',
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Box
            sx={{
              p: 0.75,
              borderRadius: 1,
              background: '#000000',
            }}
          >
            {React.cloneElement(icon, { sx: { color: '#ffffff', fontSize: 20 } })}
          </Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              color: '#000000',
              fontSize: '1rem',
            }}
          >
            {title}
          </Typography>
        </Stack>
        {data && typeof data === 'object' && (
          <Box sx={{ pl: 4, mb: 1.5 }}>
            {Object.entries(data).map(([key, value]) => {
              if (typeof value === 'object' || !value) return null;
              return (
                <Typography 
                  key={key} 
                  variant="body2" 
                  sx={{ 
                    color: '#000000',
                    fontSize: '0.875rem',
                    mb: 0.5,
                    opacity: 0.8,
                  }}
                >
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: {value}
                </Typography>
              );
            })}
          </Box>
        )}
        <Box sx={{ textAlign: 'right', pt: 1.5, borderTop: '1px solid', borderColor: '#e5e5e5' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: '#000000',
              fontSize: '1.125rem',
            }}
          >
            {formatCurrency(total)}
          </Typography>
        </Box>
      </Box>
    );
  };

  if (!quotation) return null;

  const breakdown = quotation.total_cost?.breakdown || quotation.breakdown || {};
  const components = quotation.components || {};
  const totalCost = quotation.total_cost?.total_usd || 0;

  const hotels = components.hotel?.recommended_hotels || 
                 components.hotel?.cost?.breakdown || 
                 breakdown.hotel?.breakdown || [];
  const hotelTotal = components.hotel?.cost?.total_usd || breakdown.hotel?.total_usd || 0;

  const activities = components.activities?.cost?.breakdown || breakdown.activities?.breakdown || [];
  const activitiesTotal = components.activities?.cost?.total_usd || breakdown.activities?.total_usd || 0;

  return (
    <Card
      sx={{
        maxWidth: '100%',
        mx: 'auto',
        background: '#ffffff',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #e5e5e5',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: 'fadeIn 0.5s ease-out',
        '@keyframes fadeIn': {
          from: {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '&:hover': {
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          borderColor: '#000000',
        },
      }}
    >
      <Box
        sx={{
          background: '#ffffff',
          p: { xs: 3, sm: 4 },
          color: '#000000',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <Typography sx={{ fontSize: '1.5rem' }}>📋</Typography>
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  mb: 0.5,
                  color: '#000000',
                  letterSpacing: '-0.03em',
                  fontSize: { xs: '1.25rem', sm: '1.75rem' },
                  lineHeight: 1.2,
                }}
              >
                Official Tour Quotation
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.8125rem', fontWeight: 500 }}>
                Comprehensive pricing breakdown
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} className="no-print">
            <Tooltip title="Download as Text">
              <IconButton
                onClick={downloadAsText}
                sx={{
                  background: '#f5f5f5',
                  border: '1px solid #e5e5e5',
                  borderRadius: 2,
                  p: 1.25,
                  '&:hover': {
                    background: '#000000',
                    color: '#ffffff',
                    borderColor: '#000000',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <FileDownloadIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print/Save as PDF">
              <IconButton
                onClick={downloadAsPDF}
                sx={{
                  background: '#f5f5f5',
                  border: '1px solid #e5e5e5',
                  borderRadius: 2,
                  p: 1.25,
                  '&:hover': {
                    background: '#000000',
                    color: '#ffffff',
                    borderColor: '#000000',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <PdfIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Divider sx={{ my: 3, borderColor: '#e5e5e5' }} />

        {renderHotelSection(hotels, hotelTotal)}
        {renderActivitySection(activities, activitiesTotal)}
        {renderOtherSection(
          'Vehicle Rental',
          <VehicleIcon />,
          breakdown.vehicle,
          breakdown.vehicle?.total_usd || 0
        )}
        {renderOtherSection(
          'Fuel',
          <FuelIcon />,
          breakdown.fuel,
          breakdown.fuel?.total_usd || 0
        )}
        {renderOtherSection(
          'Tour Guide',
          <PersonIcon />,
          breakdown.tour_guide,
          breakdown.tour_guide?.total_usd || 0
        )}
        {renderOtherSection(
          'Flight',
          <FlightIcon />,
          breakdown.flight,
          breakdown.flight?.total_usd || 0
        )}
        {renderOtherSection(
          'Visa',
          <VisaIcon />,
          breakdown.visa,
          breakdown.visa?.total_usd || 0
        )}

        <Divider sx={{ my: 4, borderColor: '#e5e5e5' }} />
        <Box
          sx={{
            p: 4,
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
            borderRadius: 3,
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#ffffff', 
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontWeight: 700,
              mb: 1.5,
              display: 'block',
              opacity: 0.9,
            }}
          >
            Total Cost
          </Typography>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 900, 
              color: '#ffffff',
              fontSize: { xs: '2rem', sm: '3rem' },
              letterSpacing: '-0.03em',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {formatCurrency(totalCost)}
          </Typography>
        </Box>

        {quotation.workflow_id && (
          <Typography variant="caption" sx={{ mt: 2, display: 'block', color: '#000000', opacity: 0.6 }}>
            Workflow ID: {quotation.workflow_id}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

export default QuotationCard;


