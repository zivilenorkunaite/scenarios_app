import React from 'react';
import { Card, CardContent, Typography, Stack, Button, Box } from '@mui/material';

export default function SuccessPage({ scenarioId, handleNewRun, handleViewRuns, jobRunId, keepInputs }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'linear-gradient(135deg, #e0ffe0 0%, #d0e9c6 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ minWidth: 400, boxShadow: 6, borderRadius: 4, p: 4 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom color="success.main">
            🎉 Scenario Submitted!
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            Your scenario has been submitted to be run.
          </Typography>
          {keepInputs ? (
            <Typography variant="body1" align="center" sx={{ mb: 2 }}>
              Input tables have been saved with suffix of {scenarioId}.
            </Typography>
          ) : (
            <Typography variant="body1" align="center" sx={{ mb: 2 }}>
              Input tables have not been saved.
            </Typography>
          )}
          <Typography variant="body2" align="center" sx={{ mb: 2 }}>
            <strong>Scenario ID:</strong> {scenarioId}
            <br />
            <strong>Job Run ID:</strong> {jobRunId}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleNewRun}
              sx={{
                px: 6, py: 1.5, fontWeight: 600, fontSize: 18,
                borderRadius: 3, boxShadow: 3, textTransform: 'none'
              }}>
              Submit New Run
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleViewRuns}
              sx={{
                px: 4, py: 1.5, fontWeight: 600, fontSize: 18,
                borderRadius: 3, boxShadow: 3, textTransform: 'none'
              }}>
              See All Runs
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
