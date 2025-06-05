import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableRow,
  TableHead, Paper, TableContainer, Button, Divider, CircularProgress
} from '@mui/material';

export default function ScenarioDetails({ scenario, handleViewHistoricalRuns, handleNewRun }) {
  const [summaries, setSummaries] = useState({});
  const [loadingSummaries, setLoadingSummaries] = useState(true);

  let inputComments = scenario?.inputComments;
  if (typeof inputComments === 'string') {
    try {
      inputComments = JSON.parse(inputComments);
    } catch {
      inputComments = {};
    }
  }

  useEffect(() => {
    if (!scenario) return;
    let isMounted = true;
    setLoadingSummaries(true);
    const inputKeys = ['input1', 'input2', 'input3'];
    const fetchSummaries = async () => {
      const newSummaries = {};
      for (const key of inputKeys) {
        const tableName = inputComments?.[key]?.table || scenario[key];
        if (!tableName) continue;
        try {
          const res = await fetch(`/api/table-summary/${encodeURIComponent(tableName)}`);
          const data = await res.json();
          newSummaries[key] = data;
        } catch (e) {
          newSummaries[key] = { error: String(e) };
        }
      }
      if (isMounted) {
        setSummaries(newSummaries);
        setLoadingSummaries(false);
      }
    };
    fetchSummaries();
    return () => { isMounted = false; };
  }, [scenario]);

  const renderStats = (columns, stats) => {
    if (!columns || !stats) return null;
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 1, mb: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1976d2' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Column</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Min</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Max</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Avg</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Distinct</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {columns.map(col => {
              const stat = stats[col.name] || {};
              return (
                <TableRow key={col.name} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{col.name}</TableCell>
                  <TableCell>{col.type}</TableCell>
                  <TableCell>{stat.min !== undefined ? String(stat.min) : '-'}</TableCell>
                  <TableCell>{stat.max !== undefined ? String(stat.max) : '-'}</TableCell>
                  <TableCell>{stat.avg !== undefined ? String(stat.avg) : '-'}</TableCell>
                  <TableCell>{stat.distinct_count !== undefined ? String(stat.distinct_count) : '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderSummary = (summary) => {
    if (!summary) return <Typography color="text.secondary">No summary available.</Typography>;
    if (summary.error) return <Typography color="error">{summary.error}</Typography>;
    return (
      <Box>
        <Typography sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          <strong>Row count:</strong> {summary.row_count}
        </Typography>
        <Typography sx={{ mt: 2, mb: 1, color: '#1976d2', fontWeight: 'bold' }}>
          <strong>Column Statistics:</strong>
        </Typography>
        {renderStats(summary.columns, summary.stats)}
        {summary.preview && (
          <>
            <Typography sx={{ mt: 2, color: '#1976d2', fontWeight: 'bold' }}>
              <strong>Preview:</strong>
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 1, mb: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1976d2' }}>
                    {summary.preview[0] && Object.keys(summary.preview[0]).map(col => (
                      <TableCell key={col} sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.05rem' }}>{col}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.preview.map((row, idx) => (
                    <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                      {Object.values(row).map((val, i) => (
                        <TableCell key={i}>{String(val)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    );
  };

  if (!scenario) {
    return (
      <Typography variant="h6" color="error" align="center" sx={{ mt: 6 }}>
        Scenario not found.
      </Typography>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <Card sx={{ minWidth: 900, maxWidth: '98vw', boxShadow: 6, borderRadius: 4, p: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom align="center" sx={{ color: '#1565c0', letterSpacing: 1 }}>
              Scenario Details
            </Typography>
            <Typography><strong>ID:</strong> {scenario.scenario_id}</Typography>
            <Typography><strong>Description:</strong> {scenario.scenario_description}</Typography>
            <Typography><strong>Created At:</strong> {new Date(scenario.created_at).toLocaleString()}</Typography>
            <Typography><strong>Keep Inputs:</strong> {String(scenario.inputs_kept)}</Typography>
            <Typography sx={{ mt: 2, mb: 1, color: '#1565c0', fontWeight: 'bold' }}>
              <strong>Model Parameters:</strong>
            </Typography>
            <Typography>Time Window: {scenario.param1}</Typography>
            <Typography>Forecast Horizon: {scenario.param2}</Typography>
            <Typography sx={{ mt: 2, mb: 1, color: '#1565c0', fontWeight: 'bold' }}>
              <strong>Input Tables & Comments:</strong>
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1976d2' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Input</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Table</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Comment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {['input1', 'input2', 'input3'].map((key) => (
                    <TableRow key={key} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{key}</TableCell>
                      <TableCell>{inputComments?.[key]?.table || scenario[key]}</TableCell>
                      <TableCell>{inputComments?.[key]?.comment || ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
              
            {handleNewRun && (
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
            )}
              {handleViewHistoricalRuns && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleViewHistoricalRuns}
                  sx={{
                  px: 6,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: 18,
                  borderRadius: 3,
                  boxShadow: 3,
                  textTransform: 'none'
                }}
                >
                  Back to Historical Runs
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
      {/* --- Summaries Section --- */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Card sx={{ minWidth: 900, maxWidth: '98vw', boxShadow: 6, borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom align="center" sx={{ color: '#2e7d32', letterSpacing: 1 }}>
              Input Table Summaries
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {loadingSummaries ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress color="success" />
              </Box>
            ) : (
              ['input1', 'input2', 'input3'].map((key) => {
                const tableName = inputComments?.[key]?.table || scenario[key] || key;
                return (
                  <Box key={key} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#388e3c', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {tableName}
                    </Typography>
                    {renderSummary(summaries[key])}
                    {key !== 'input3' && <Divider sx={{ mt: 2, mb: 2 }} />}
                  </Box>
                );
              })
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
