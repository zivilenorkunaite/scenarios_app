import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Stack
} from '@mui/material';
import LoadingOverlay from './components/LoadingOverlay';
import ScenarioForm from './components/ScenarioForm';
import SuccessPage from './components/SuccessPage';
import ErrorPage from './components/ErrorPage';
import ScenarioDetails from './components/ScenarioDetails';

export default function RunScenarioUI() {
  // State declarations
  const [description, setDescription] = useState('');
  const [availableTables, setAvailableTables] = useState([]);
  const [input1Comment, setInput1Comment] = useState('');
  const [input2Comment, setInput2Comment] = useState('');
  const [input3Comment, setInput3Comment] = useState('');
  const [page, setPage] = useState('form');
  const [scenarioId, setScenarioId] = useState('');
  const [jobRunId, setJobRunId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [historicalRuns, setHistoricalRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keepInputs, setKeepInputs] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState(null);

  // Set const with default values
  const [param1, setParam1] = useState('24');
  const [param2, setParam2] = useState('1');
  const [defaultInput1, setDefaultInput1] = useState('zivile_demo.app.historical_load');
  const [defaultInput2, setDefaultInput2] = useState('zivile_demo.app.weather_data');
  const [defaultInput3, setDefaultInput3] = useState('zivile_demo.app.sensor_data');
  const [input1, setInput1] = useState(defaultInput1);
  const [input2, setInput2] = useState(defaultInput2);
  const [input3, setInput3] = useState(defaultInput3);

  const inputComments = {
    input1: { table: input1, comment: input1Comment },
    input2: { table: input2, comment: input2Comment },
    input3: { table: input3, comment: input3Comment }
  };

  useEffect(() => {
    fetch('/api/available-tables')
      .then(res => res.json())
      .then(data => {
        const tables = data.tables || [];
        setAvailableTables(tables);
      })
      .catch(() => setAvailableTables([]));
  }, []);

  useEffect(() => {
    if (defaultInput1) setInput1(defaultInput1);
    if (defaultInput2) setInput2(defaultInput2);
    if (defaultInput3) setInput3(defaultInput3);
  }, [defaultInput1, defaultInput2, defaultInput3]);

  // Handler functions
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input1,
          input2,
          input3,
          param1: parseFloat(param1),
          param2: parseFloat(param2),
          keepInputs,
          description,
          inputComments
        })
      });

      const result = await response.json();
      if (response.ok) {
        const jobResponse = await fetch(
          `/api/trigger-job/${result.scenario_id}`,
          { method: 'POST' }
        );
        const jobResult = await jobResponse.json();
        if (!jobResponse.ok) {
          throw new Error(jobResult.detail || 'Job trigger failed');
        }

        setScenarioId(result.scenario_id);
        setJobRunId(jobResult.job_run_id);
        setPage('success');
      } else {
        setErrorMsg(result.detail || result.message || 'Submission failed');
        setPage('error');
      }
    } catch (error) {
      setErrorMsg(error.message || 'Submission failed');
      setPage('error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistoricalRuns = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/runs');
      const data = await response.json();
      setHistoricalRuns(Array.isArray(data.runs) ? data.runs : []);
      setPage('historicalRuns');
    } catch (error) {
      setErrorMsg('Failed to fetch runs');
      setPage('error');
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioDetails = async (scenarioId) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(`/api/scenario/${scenarioId}`);
      if (!response.ok) throw new Error('Scenario not found');
      const data = await response.json();
      setSelectedScenario(data);
      setPage('scenarioDetails');
    } catch (e) {
      setErrorMsg(e.message || 'Scenario not found');
      setPage('error');
    } finally {
      setLoading(false);
    }
  };

  const handleNewRun = () => {
    setInput1('');
    setInput2('');
    setInput3('');
    setParam1('');
    setParam2('');
    setScenarioId('');
    setJobRunId('');
    setErrorMsg('');
    setPage('form');
    setKeepInputs(true);
    setDescription('');
    setInput1Comment('');
    setInput2Comment('');
    setInput3Comment('');
    fetch('/api/available-tables')
      .then(res => res.json())
      .then(data => setAvailableTables(data.tables || []))
      .catch(() => setAvailableTables([]));
  };

  const handleBack = () => {
    setErrorMsg('');
    setPage('form');
  };

  // Inner component: HistoricalRunsTable
  function HistoricalRunsTable({ historicalRuns = [], handleNewRun, handleBack, handleScenarioDetails }) {
    const parseInputComments = (inputComments) => {
      try {
        return typeof inputComments === 'string' ? JSON.parse(inputComments) : inputComments || {};
      } catch {
        return {};
      }
    };

    const displayTables = (inputComments) => {
      if (!inputComments) return '';
      return ['input1', 'input2', 'input3']
        .map(key => inputComments[key]?.table)
        .filter(Boolean)
        .join(', ');
    };

    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          p: 2,
        }}
      >
        <Card sx={{ minWidth: 900, maxWidth: '98vw', boxShadow: 6, borderRadius: 4, p: 4 }}>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom sx={{ color: '#1565c0', fontWeight: 'bold', letterSpacing: 1 }}>
              📋 All Scenario Submissions
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2, mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(90deg, #e3eafc 0%, #b9d6f2 100%)' }}>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1565c0' }}>Scenario ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1565c0' }}>Tables</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1565c0' }}>Param 1</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1565c0' }}>Param 2</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1565c0' }}>Created At</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1565c0' }}>Scenario Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historicalRuns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">No historical runs found.</TableCell>
                    </TableRow>
                  ) : (
                    historicalRuns.map((run, idx) => {
                      const inputComments = parseInputComments(run.inputComments);
                      return (
                        <TableRow
                          key={run.scenario_id}
                          sx={{
                            backgroundColor: idx % 2 === 0 ? '#f7fafc' : '#e9f0fb',
                            '&:hover': { backgroundColor: '#b3e5fc' }
                          }}
                        >
                          <TableCell sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Button
                              variant="text"
                              color="primary"
                              onClick={() => handleScenarioDetails(run.scenario_id)}
                              sx={{ textTransform: 'none', p: 0, m: 0, minWidth: 0, fontWeight: 'bold' }}
                            >
                              {run.scenario_id}
                            </Button>
                          </TableCell>
                          <TableCell>{displayTables(inputComments)}</TableCell>
                          <TableCell>{run.param1}</TableCell>
                          <TableCell>{run.param2}</TableCell>
                          <TableCell>{run.created_at ? new Date(run.created_at).toLocaleString() : ''}</TableCell>
                          <TableCell>{run.scenario_description}</TableCell>
                        </TableRow>
                      );
                    })
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

  // Main render
  if (loading) return <LoadingOverlay />;
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 0,
      }}
    >
      {/* Colorful Header */}
      <Box
  sx={{
    width: '100%',
    bgcolor: 'linear-gradient(90deg, #1976d2 0%, #43a047 100%)',
    py: 4,
    mb: 4,
    boxShadow: 3,
  }}
>
  <Typography
    variant="h3"
    align="center"
    sx={{
      color: '#0d1a36',  // Dark blue
      fontWeight: 'bold',
      letterSpacing: 2,
      textShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}
  >
    ⚡ Load Forecasting Modeling Tool
  </Typography>
  <Typography
    variant="h6"
    align="center"
    sx={{
      color: '#333333',  // Dark gray
      mt: 2,
      fontWeight: 400
    }}
  >
    Build, run, and analyze load forecasting scenarios with your own data tables.
  </Typography>
</Box>

      {/* Main Content - Render by page */}
      {page === 'form' && (
        <ScenarioForm
          description={description}
          setDescription={setDescription}
          availableTables={availableTables}
          input1={input1} setInput1={setInput1}
          input1Comment={input1Comment} setInput1Comment={setInput1Comment}
          input2={input2} setInput2={setInput2}
          input2Comment={input2Comment} setInput2Comment={setInput2Comment}
          input3={input3} setInput3={setInput3}
          input3Comment={input3Comment} setInput3Comment={setInput3Comment}
          param1={param1} setParam1={setParam1}
          param2={param2} setParam2={setParam2}
          handleSubmit={handleSubmit}
          handleViewHistoricalRuns={handleViewHistoricalRuns}
          keepInputs={keepInputs}
          setKeepInputs={setKeepInputs}
        />
      )}
      {page === 'success' && (
        <SuccessPage
          scenarioId={scenarioId}
          handleNewRun={handleNewRun}
          handleViewHistoricalRuns={handleViewHistoricalRuns}
          jobRunId={jobRunId}
          keepInputs={keepInputs}
        />
      )}
      {page === 'error' && (
        <ErrorPage errorMsg={errorMsg} handleNewRun={handleNewRun} />
      )}
      {page === 'historicalRuns' && (
        <HistoricalRunsTable
          historicalRuns={historicalRuns}
          handleNewRun={handleNewRun}
          handleBack={handleBack}
          handleScenarioDetails={handleScenarioDetails}
        />
      )}
      {page === 'scenarioDetails' && (
        <ScenarioDetails
          scenario={selectedScenario}
          handleNewRun={handleNewRun}
          handleViewHistoricalRuns={handleViewHistoricalRuns}
        />
      )}
    </Box>
  );
}
