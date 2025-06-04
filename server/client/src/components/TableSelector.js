import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

export default function TableSelector({ label, value, onChange, options }) {
  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      renderInput={(params) => (
        <TextField {...params} label={label} variant="outlined" fullWidth />
      )}
      disableClearable
      isOptionEqualToValue={(option, value) => option === value}
    />
  );
}
