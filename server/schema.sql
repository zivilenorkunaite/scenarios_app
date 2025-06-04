CREATE TABLE IF NOT EXISTS zivile_demo.app.scenario_runs (
  scenario_id STRING PRIMARY KEY,
  input1 STRING,
  input2 STRING,
  input3 STRING,
  param1 DOUBLE,
  param2 DOUBLE,
  created_at TIMESTAMP,
  inputs_kept BOOL
)
USING DELTA;


create or replace view zivile_demo.app.v_available_tables as 
select table_catalog || "." || table_schema || "." || table_name as available_tables
from system.information_schema.tables
where table_catalog = 'zivile_demo'
and table_schema = 'app'