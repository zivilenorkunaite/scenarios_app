import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function LoadingOverlay() {
  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 1300,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'rgba(255,255,255,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CircularProgress size={80} thickness={5} color="primary" />
    </Box>
  );
}
