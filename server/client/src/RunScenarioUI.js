import React, { useState, useEffect } from 'react';
import LoadingOverlay from './components/LoadingOverlay';
import ScenarioForm from './components/ScenarioForm';
import SuccessPage from './components/SuccessPage';
import ErrorPage from './components/ErrorPage';
import RunsTable from './components/RunsTable';

export default function RunScenarioUI() {
  // State declarations
    const [availableTables, setAvailableTables] = useState([]);
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [input3, setInput3] = useState('');
    const [param1, setParam1] = useState('');
    const [param2, setParam2] = useState('');
    const [page, setPage] = useState('form'); // 'form', 'success', 'error', 'runs'
    const [scenarioId, setScenarioId] = useState('');
    const [jobRunId, setJobRunId] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keepInputs, setKeepInputs] = useState(true);

    useEffect(() => {
        fetch('/api/available-tables')
          .then(res => res.json())
          .then(data => setAvailableTables(data.tables || []))
          .catch(() => setAvailableTables([]));
      }, []);

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
          keepInputs
        })
      });

      const result = await response.json();
      if (response.ok) {
        // 2. Trigger Databricks job with scenario_id
        const jobResponse = await fetch(
          `/api/trigger-job/${result.scenario_id}`,
          { method: 'POST' }
        );
        
        const jobResult = await jobResponse.json();
        if (!jobResponse.ok) {
          throw new Error(jobResult.detail || 'Job trigger failed');
        }

        // 3. Update state with both IDs
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

  const handleViewRuns = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/runs');
      const data = await response.json();
      setRuns(data.runs || []);
      setPage('runs');
    } catch (error) {
      setErrorMsg('Failed to fetch runs');
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

    
    fetch('/api/available-tables')
      .then(res => res.json())
      .then(data => setAvailableTables(data.tables || []))
      .catch(() => setAvailableTables([]));
  
  };

  const handleBack = () => {
    setErrorMsg('');
    setPage('form');
  };

  if (loading) return <LoadingOverlay />;
  if (page === 'form') return (
    <ScenarioForm
      availableTables={availableTables}
      input1={input1} setInput1={setInput1}
      input2={input2} setInput2={setInput2}
      input3={input3} setInput3={setInput3}
      param1={param1} setParam1={setParam1}
      param2={param2} setParam2={setParam2}
      handleSubmit={handleSubmit}
      handleViewRuns={handleViewRuns}
      keepInputs={keepInputs} setKeepInputs={setKeepInputs}
    />
  );
  if (page === 'success') return (
    <SuccessPage scenarioId={scenarioId} handleNewRun={handleNewRun} handleViewRuns={handleViewRuns} jobRunId={jobRunId} keepInputs={keepInputs} />
  );
  if (page === 'error') return (
    <ErrorPage errorMsg={errorMsg} handleNewRun={handleNewRun} />
  );
  if (page === 'runs') return (
    <RunsTable runs={runs} handleNewRun={handleNewRun} handleBack={handleBack} />
  );
  return null;
}
