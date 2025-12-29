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
  Edit as EditIcon,
  ContentCopy as DuplicateIcon,
  Share as ShareIcon,
  Description as WordIcon,
} from '@mui/icons-material';

const QuotationCard = ({ quotation, onRefine, onDuplicate, onShare }) => {
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

  const downloadAsWord = () => {
    if (!quotation) return;
    
    const breakdown = quotation.total_cost?.breakdown || quotation.breakdown || {};
    const components = quotation.components || {};
    const totalCost = quotation.total_cost?.total_usd || 0;
    const rfqSummary = quotation.rfq_summary || quotation.rfq_data || {};
    const workflowId = quotation.workflow_id || `QUO-${Date.now()}`;
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Get hotel and activity data
    const hotels = components.hotel?.recommended_hotels || components.hotel?.cost?.breakdown || breakdown.hotel?.breakdown || [];
    const hotelTotal = components.hotel?.cost?.total_usd || breakdown.hotel?.total_usd || 0;
    const activities = components.activities?.cost?.breakdown || breakdown.activities?.breakdown || [];
    const activitiesTotal = components.activities?.cost?.total_usd || breakdown.activities?.total_usd || 0;
    
    // Build table rows
    let tableRows = '';
    
    if (hotels.length > 0) {
      hotels.forEach((hotel) => {
        const hotelName = (hotel.hotel_name || hotel.name || 'Hotel').replace(/"/g, '&quot;');
        const location = (hotel.location || 'N/A').replace(/"/g, '&quot;');
        tableRows += `<tr>
          <td>Accommodation</td>
          <td>${hotelName} - ${location}${hotel.rating ? ` (${hotel.rating}⭐)` : ''}${hotel.nights ? ` - ${hotel.nights} night(s)` : ''}</td>
          <td style="text-align: right;">${formatCurrency(hotel.total_usd || hotel.price_per_night_usd || 0)}</td>
        </tr>`;
      });
    } else if (hotelTotal > 0) {
      tableRows += `<tr>
        <td>Accommodation</td>
        <td>Hotel accommodation</td>
        <td style="text-align: right;">${formatCurrency(hotelTotal)}</td>
      </tr>`;
    }
    
    if (activities.length > 0) {
      activities.forEach((activity) => {
        const activityName = (activity.activity || activity.name || 'Activity').replace(/"/g, '&quot;');
        const location = activity.location ? ` - ${activity.location.replace(/"/g, '&quot;')}` : '';
        tableRows += `<tr>
          <td>Activity</td>
          <td>${activityName}${location}</td>
          <td style="text-align: right;">${formatCurrency(activity.price_usd || activity.total_cost_usd || 0)}</td>
        </tr>`;
      });
    } else if (activitiesTotal > 0) {
      tableRows += `<tr>
        <td>Activities</td>
        <td>Tour activities</td>
        <td style="text-align: right;">${formatCurrency(activitiesTotal)}</td>
      </tr>`;
    }
    
    if (breakdown.vehicle?.total_usd > 0) {
      const vehicleType = (breakdown.vehicle.vehicle_type || 'Vehicle rental').replace(/"/g, '&quot;');
      tableRows += `<tr>
        <td>Vehicle Rental</td>
        <td>${vehicleType}</td>
        <td style="text-align: right;">${formatCurrency(breakdown.vehicle.total_usd)}</td>
      </tr>`;
    }
    
    if (breakdown.fuel?.total_usd > 0) {
      const fuelType = (breakdown.fuel.fuel_type || 'Fuel').replace(/"/g, '&quot;');
      tableRows += `<tr>
        <td>Fuel</td>
        <td>${fuelType} - ${breakdown.fuel.total_liters || 0}L</td>
        <td style="text-align: right;">${formatCurrency(breakdown.fuel.total_usd)}</td>
      </tr>`;
    }
    
    if (breakdown.tour_guide?.total_usd > 0) {
      tableRows += `<tr>
        <td>Tour Guide</td>
        <td>${breakdown.tour_guide.days || 0} day(s) @ ${formatCurrency(breakdown.tour_guide.fee_per_day_usd || 0)}/day</td>
        <td style="text-align: right;">${formatCurrency(breakdown.tour_guide.total_usd)}</td>
      </tr>`;
    }
    
    if (breakdown.flight?.total_usd > 0) {
      tableRows += `<tr>
        <td>Flight</td>
        <td>Flight tickets</td>
        <td style="text-align: right;">${formatCurrency(breakdown.flight.total_usd)}</td>
      </tr>`;
    }
    
    if (breakdown.visa?.total_usd > 0) {
      tableRows += `<tr>
        <td>Visa</td>
        <td>Visa processing</td>
        <td style="text-align: right;">${formatCurrency(breakdown.visa.total_usd)}</td>
      </tr>`;
    }
    
    // Create professional Word-compatible HTML document
    const htmlContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Tour Quotation - ${workflowId}</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page {
    size: 8.5in 11in;
    margin: 0.5in;
  }
  body {
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #000000;
    margin: 0;
    padding: 20px;
  }
  .header {
    border-bottom: 3px solid #000000;
    padding-bottom: 15px;
    margin-bottom: 30px;
  }
  .header h1 {
    margin: 0;
    font-size: 24pt;
    font-weight: bold;
    color: #000000;
    letter-spacing: 1px;
  }
  .header-info {
    margin-top: 10px;
    font-size: 10pt;
    color: #666666;
  }
  .section {
    margin: 25px 0;
  }
  .section-title {
    font-size: 14pt;
    font-weight: bold;
    color: #000000;
    border-bottom: 2px solid #000000;
    padding-bottom: 5px;
    margin-bottom: 15px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  table th {
    background-color: #000000;
    color: #ffffff;
    padding: 10px;
    text-align: left;
    font-weight: bold;
    font-size: 10pt;
  }
  table td {
    padding: 8px 10px;
    border-bottom: 1px solid #e5e5e5;
    font-size: 10pt;
  }
  table tr:last-child td {
    border-bottom: 2px solid #000000;
  }
  .total-section {
    margin-top: 30px;
    padding: 20px;
    background-color: #f5f5f5;
    border: 2px solid #000000;
  }
  .total-amount {
    font-size: 20pt;
    font-weight: bold;
    color: #000000;
    text-align: right;
  }
  .footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e5e5e5;
    font-size: 9pt;
    color: #666666;
  }
  .info-row {
    margin: 8px 0;
  }
  .info-label {
    font-weight: bold;
    display: inline-block;
    width: 150px;
  }
</style>
</head>
<body>
  <div class="header">
    <h1>OFFICIAL TOUR QUOTATION</h1>
    <div class="header-info">
      <div class="info-row">
        <span class="info-label">Quotation Number:</span>
        <span>${workflowId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span>${date}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">TOUR DETAILS</div>
    ${rfqSummary.tourist_type ? `<div class="info-row"><span class="info-label">Tourist Type:</span><span>${rfqSummary.tourist_type.replace(/_/g, ' ').toUpperCase()}</span></div>` : ''}
    ${rfqSummary.guests ? `<div class="info-row"><span class="info-label">Guests:</span><span>${rfqSummary.guests.adults || 0} Adult(s), ${rfqSummary.guests.children || 0} Child(ren) (Total: ${rfqSummary.guests.total || 0})</span></div>` : ''}
    ${rfqSummary.locations && rfqSummary.locations.length > 0 ? `<div class="info-row"><span class="info-label">Locations:</span><span>${rfqSummary.locations.join(', ')}</span></div>` : ''}
    ${rfqSummary.activities && rfqSummary.activities.length > 0 ? `<div class="info-row"><span class="info-label">Activities:</span><span>${rfqSummary.activities.join(', ')}</span></div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">COST BREAKDOWN</div>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Description</th>
          <th style="text-align: right;">Amount (USD)</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </div>

  <div class="total-section">
    <div style="text-align: right;">
      <div style="font-size: 12pt; margin-bottom: 10px;">TOTAL COST</div>
      <div class="total-amount">${formatCurrency(totalCost)}</div>
    </div>
  </div>

  <div class="footer">
    <p><strong>Terms & Conditions:</strong></p>
    <ul style="margin: 10px 0; padding-left: 20px;">
      <li>This quotation is valid for 30 days from the date of issue.</li>
      <li>Prices are subject to change based on availability and exchange rates.</li>
      <li>Each agent applies its own commission rate.</li>
      <li>All costs are in USD unless otherwise stated.</li>
      <li>Booking confirmation required to secure services.</li>
    </ul>
    <p style="margin-top: 20px;">
      <strong>Workflow ID:</strong> ${workflowId}<br>
      <strong>Generated:</strong> ${date}
    </p>
  </div>
</body>
</html>`;
    
    // Create blob and download
    const blob = new Blob(['\ufeff', htmlContent], { 
      type: 'application/msword' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tour-Quotation-${workflowId}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
  const rfqSummary = quotation.rfq_summary || quotation.rfq_data || {};

  const hotels = components.hotel?.recommended_hotels || 
                 components.hotel?.cost?.breakdown || 
                 breakdown.hotel?.breakdown || [];
  const hotelTotal = components.hotel?.cost?.total_usd || breakdown.hotel?.total_usd || 0;

  const activities = components.activities?.cost?.breakdown || breakdown.activities?.breakdown || [];
  const activitiesTotal = components.activities?.cost?.total_usd || breakdown.activities?.total_usd || 0;

  return (
    <Card
      role="article"
      aria-label="Tour quotation"
      aria-describedby="quotation-details"
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
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                {quotation.workflow_id && (
                  <Typography variant="caption" sx={{ color: '#666', fontSize: '0.8125rem', fontWeight: 600 }}>
                    Quotation #{quotation.workflow_id.split('_').pop()?.substring(0, 8) || 'N/A'}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: '#999', fontSize: '0.75rem' }}>
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </Typography>
              </Stack>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} className="no-print" alignItems="center">
            {/* Prominent Word Download Button */}
            <Tooltip title="Download as Word Document" arrow>
              <Button
                variant="contained"
                startIcon={<WordIcon />}
                onClick={downloadAsWord}
                aria-label="Download quotation as Word document"
                tabIndex={0}
                sx={{
                  background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                  color: '#ffffff',
                  fontWeight: 600,
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 0.75, sm: 1 },
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  minHeight: { xs: '44px', sm: 'auto' },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  },
                  '&:focus-visible': {
                    outline: '2px solid #ffffff',
                    outlineOffset: '2px',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Download
              </Button>
            </Tooltip>
            
            {onRefine && (
              <Tooltip title="Refine Quotation">
                <IconButton
                  onClick={() => onRefine(quotation)}
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
                  <EditIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
            {onDuplicate && (
              <Tooltip title="Duplicate Quotation">
                <IconButton
                  onClick={() => onDuplicate(quotation)}
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
                  <DuplicateIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
            {onShare && (
              <Tooltip title="Share Quotation">
                <IconButton
                  onClick={() => onShare(quotation)}
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
                  <ShareIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
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

        {/* Professional Quotation Details Section */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            bgcolor: '#fafafa',
            borderRadius: 2,
            border: '1px solid #e5e5e5',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: '#000000',
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Tour Details
          </Typography>
          <Grid container spacing={2}>
            {rfqSummary.tourist_type && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5, fontSize: '0.75rem' }}>
                  Tourist Type
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#000000' }}>
                  {rfqSummary.tourist_type.replace(/_/g, ' ').toUpperCase()}
                </Typography>
              </Grid>
            )}
            {rfqSummary.guests && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5, fontSize: '0.75rem' }}>
                  Guests
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#000000' }}>
                  {rfqSummary.guests.adults || 0} Adult(s), {rfqSummary.guests.children || 0} Child(ren)
                </Typography>
              </Grid>
            )}
            {rfqSummary.locations && rfqSummary.locations.length > 0 && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5, fontSize: '0.75rem' }}>
                  Locations
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#000000' }}>
                  {rfqSummary.locations.join(', ')}
                </Typography>
              </Grid>
            )}
            {rfqSummary.activities && rfqSummary.activities.length > 0 && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5, fontSize: '0.75rem' }}>
                  Activities
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#000000' }}>
                  {rfqSummary.activities.join(', ')}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

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


