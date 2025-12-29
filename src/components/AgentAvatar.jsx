import React from 'react'
import { Avatar, Box } from '@mui/material'
import { TravelExplore as TravelIcon } from '@mui/icons-material'

function AgentAvatar() {
  return (
    <Avatar
      sx={{
        bgcolor: '#000000',
        width: 40,
        height: 40,
        border: '2px solid #000000',
      }}
    >
      <TravelIcon sx={{ color: '#ffffff' }} />
    </Avatar>
  )
}

export default AgentAvatar

