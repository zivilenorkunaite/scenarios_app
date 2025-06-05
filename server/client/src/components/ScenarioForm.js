import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  Box,
  Switch,
  FormControlLabel
} from '@mui/material';
import TableSelector from './TableSelector';

export default function ScenarioForm({
  description, setDescription,
  availableTables,
  input1, setInput1, input1Comment, setInput1Comment,
  input2, setInput2, input2Comment, setInput2Comment,
  input3, setInput3, input3Comment, setInput3Comment,
  param1, setParam1, param2, setParam2,
  handleSubmit, handleViewHistoricalRuns,
  keepInputs, setKeepInputs
}) {
  const canSubmit = description && input1 && input2 && input3;

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <Card sx={{ minWidth: 400, boxShadow: 6, borderRadius: 4, mb: 3 }}>
        <CardContent>
          <TextField
            label="Scenario Description"
            variant="outlined"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            required
            autoFocus
            multiline
            minRows={3}           // You can adjust this for your preferred initial height
            sx={{ mb: 3 }}
            inputProps={{ maxLength: 800 }}
            helperText="Please describe this scenario run (required)"
          />

          <Box sx={{ mt: 2, mb: 2, textAlign: 'left', color: '#666', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mb: 0, display: 'inline', mr: 2 }}>
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
              sx={{ verticalAlign: 'middle', mb: 0 }}
            />
          </Box>
          <Typography variant="h5" align="center" gutterBottom>
            Select input tables for this run
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TableSelector
                  label="Historical Load"
                  value={input1}
                  onChange={setInput1}
                  options={availableTables}
                />
              </Box>
              <TextField
                label="Comment (optional)"
                variant="outlined"
                value={input1Comment}
                onChange={e => setInput1Comment(e.target.value)}
                fullWidth
                sx={{ flex: 1 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TableSelector
                  label="Weather Data"
                  value={input2}
                  onChange={setInput2}
                  options={availableTables}
                />
              </Box>
              <TextField
                label="Comment (optional)"
                variant="outlined"
                value={input2Comment}
                onChange={e => setInput2Comment(e.target.value)}
                fullWidth
                sx={{ flex: 1 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TableSelector
                  label="Sensor Data"
                  value={input3}
                  onChange={setInput3}
                  options={availableTables}
                />
              </Box>
              <TextField
                label="Comment (optional)"
                variant="outlined"
                value={input3Comment}
                onChange={e => setInput3Comment(e.target.value)}
                fullWidth
                sx={{ flex: 1 }}
              />
            </Box>
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
      required
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
      required
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
          disabled={!canSubmit}
        >
          Submit
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          size="large"
          sx={{ px: 4, py: 1.5, fontWeight: 600, fontSize: 18, borderRadius: 3, boxShadow: 3, textTransform: 'none' }}
          onClick={handleViewHistoricalRuns}
        >
          Show Historical Runs
        </Button>
      </Box>
    </form>
  );
}
