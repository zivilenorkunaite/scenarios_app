import React from 'react';
import {
  Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Stack
} from '@mui/material';

export default function RunsTable({ runs, handleNewRun, handleBack }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        p: 2,
      }}
    >
      <Card sx={{ minWidth: 800, maxWidth: '95vw', boxShadow: 6, borderRadius: 4, p: 4 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            📋 All Scenario Submissions
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2, mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(90deg, #e3eafc 0%, #b9d6f2 100%)' }}>
                  <TableCell><strong>Scenario ID</strong></TableCell>
                  <TableCell><strong>Table 1</strong></TableCell>
                  <TableCell><strong>Table 2</strong></TableCell>
                  <TableCell><strong>Table 3</strong></TableCell>
                  <TableCell><strong>Param 1</strong></TableCell>
                  <TableCell><strong>Param 2</strong></TableCell>
                  <TableCell><strong>Created At</strong></TableCell>
                  <TableCell><strong>Inputs Kept</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {runs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No runs found.</TableCell>
                  </TableRow>
                ) : (
                  runs.map((run, idx) => (
                    <TableRow
                      key={run.scenario_id}
                      sx={{
                        backgroundColor: idx % 2 === 0 ? '#f7fafc' : '#e9f0fb',
                        '&:hover': { backgroundColor: '#dbeafe' }
                      }}
                    >
                      <TableCell sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.scenario_id}</TableCell>
                      <TableCell>{run.input1}</TableCell>
                      <TableCell>{run.input2}</TableCell>
                      <TableCell>{run.input3}</TableCell>
                      <TableCell>{run.param1}</TableCell>
                      <TableCell>{run.param2}</TableCell>
                      <TableCell>{new Date(run.created_at).toLocaleString()}</TableCell>
                      <TableCell>{run.inputs_kept.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{
                px: 6,
                py: 1.5,
                fontWeight: 600,
                fontSize: 18,
                borderRadius: 3,
                boxShadow: 3,
                textTransform: 'none'
              }}
              onClick={handleNewRun}
            >
              Submit New Run
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: 18,
                borderRadius: 3,
                boxShadow: 3,
                textTransform: 'none'
              }}
              onClick={handleBack}
            >
              Back to Main Page
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
