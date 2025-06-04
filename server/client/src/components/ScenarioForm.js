import React from 'react';
import { Card, CardContent, Typography, Stack, TextField, Button, Box, Switch, FormControlLabel } from '@mui/material';
import TableSelector from './TableSelector';

export default function ScenarioForm({
  availableTables, input1, setInput1, input2, setInput2, input3, setInput3,
  param1, setParam1, param2, setParam2, handleSubmit, handleViewRuns, keepInputs, setKeepInputs
}) {
  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
       <Card sx={{ minWidth: 400, boxShadow: 6, borderRadius: 4, mb: 3 }}>
                  <CardContent>
                   <Box sx={{ mt: 4, textAlign: 'center', color: '#666' }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Do you need to keep inputs for this run?</strong>
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={keepInputs}
                            onChange={e => setKeepInputs(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={keepInputs ? "Yes" : "No"}
                      />
                    </Box>
                    <Typography variant="h5" align="center" gutterBottom>
                      Select input tables for this run
                    </Typography>
                    <Stack spacing={3}>
                      <TableSelector
                        label="Historical Load"
                        value={input1}
                        onChange={setInput1}
                        options={availableTables}
                      />
                      <TableSelector
                        label="Weather Data"
                        value={input2}
                        onChange={setInput2}
                        options={availableTables}
                      />
                      <TableSelector
                        label="Sensor Data"
                        value={input3}
                        onChange={setInput3}
                        options={availableTables}
                      />
                    </Stack>
                  </CardContent>
                </Card>
                <Card sx={{ minWidth: 400, boxShadow: 6, borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" align="center" gutterBottom>
                      Provide model parameters
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <TextField
                        label="Time Window"
                        variant="outlined"
                        type="number"
                        value={param1}
                        onChange={e => setParam1(e.target.value)}
                        fullWidth
                        autoComplete="off"
                        InputProps={{ style: { fontWeight: 500, fontSize: 18 } }}
                      />
                      <TextField
                        label="Forecast Horizon"
                        variant="outlined"
                        type="number"
                        value={param2}
                        onChange={e => setParam2(e.target.value)}
                        fullWidth
                        autoComplete="off"
                        InputProps={{ style: { fontWeight: 500, fontSize: 18 } }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          sx={{ px: 6, py: 1.5, fontWeight: 600, fontSize: 18, borderRadius: 3, boxShadow: 3, textTransform: 'none' }}
          disabled={!input1 || !input2 || !input3}
        >
          Submit
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          size="large"
          sx={{ px: 4, py: 1.5, fontWeight: 600, fontSize: 18, borderRadius: 3, boxShadow: 3, textTransform: 'none' }}
          onClick={handleViewRuns}
        >
          See All Runs
        </Button>
      </Box>
    </form>
  );
}
