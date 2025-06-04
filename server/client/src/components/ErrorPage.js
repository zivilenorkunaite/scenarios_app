import React from 'react';
import { Card, CardContent, Typography, Stack, Button, Box, Alert } from '@mui/material';

export default function ErrorPage({ errorMsg, handleNewRun }) {
  // Show string or JSON stringified error if it's an object
  const errorText = typeof errorMsg === 'string'
    ? errorMsg
    : JSON.stringify(errorMsg);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'linear-gradient(135deg, #ffe0e0 0%, #f9d6d5 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ minWidth: 400, boxShadow: 6, borderRadius: 4, p: 4 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom color="error.main">
            ❌ Submission Failed
          </Typography>
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorText}
          </Alert>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleNewRun}
              sx={{
                px: 6, py: 1.5, fontWeight: 600, fontSize: 18,
                borderRadius: 3, boxShadow: 3, textTransform: 'none'
              }}>
              Go Back
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
