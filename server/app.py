import os
import uuid
import json  # Added for JSON serialization
import logging
from fastapi import FastAPI, HTTPException, Request
from databricks import sql
from databricks.sdk.core import Config
from databricks.sdk.service import jobs
from databricks.sdk import WorkspaceClient
from typing import Dict
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI()
api_app = FastAPI()
app.mount("/api", api_app)

# Static files mounting with existence check
current_dir = os.path.dirname(os.path.abspath(__file__))
build_dir = os.path.join(current_dir, "client", "build")
if os.path.exists(build_dir) and os.path.isdir(build_dir):
    app.mount("/", StaticFiles(directory=build_dir, html=True), name="ui")

# CORS middleware
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputDetail(BaseModel):
    table: str
    comment: str

class ScenarioRequest(BaseModel):
    input1: str
    input2: str
    input3: str
    param1: float
    param2: float
    keepInputs: bool
    description: str    
    inputComments: Dict[str, InputDetail]

def get_connection(request):
    #
    logging.debug('Establishing connection to Databricks SQL Warehouse')

    logging.debug(request.headers.get('X-Forwarded-Access-Token'))
    #token_value = os.getenv("TOKEN") if request.headers.get('X-Forwarded-Access-Token') is None else request.headers.get('X-Forwarded-Access-Token')
    token_value = os.getenv("TOKEN") if os.getenv("DATABRICKS_TOKEN") is None else os.getenv("DATABRICKS_TOKEN")
    host = os.getenv('DATABRICKS_HOST').replace("https://", "")  # Remove existing protocol
    return sql.connect(
        server_hostname=host,
        http_path=os.getenv("HTTP_PATH"),
        access_token= token_value
    )

@api_app.post("/trigger-job/{scenario_id}")
async def trigger_databricks_job(scenario_id: str):
    try:
        client = WorkspaceClient(
            host=f"https://{os.getenv('DATABRICKS_HOST').replace('https://', '')}",
            token=os.getenv("TOKEN"),
            auth_type='pat'
        )
        
        run = client.jobs.run_now(
            job_id=int(os.getenv("DATABRICKS_JOB_ID")),  # Convert to integer
            job_parameters={"scenario_id": scenario_id}
        )
        
        return {
            "status": "success",
            "job_run_id": run.run_id,
            "message": "Databricks job started"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_app.post("/submit")
async def submit_scenario(data: ScenarioRequest, request: Request):
    scenario_id = str(uuid.uuid4())
    try:
        # Serialize inputComments to JSON string
        input_comments_json = json.dumps(
            {k: v.dict() for k, v in data.inputComments.items()}
        )

        with get_connection(request) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO zivile_demo.app.scenario_runs 
                    (scenario_id, input1, input2, input3, param1, param2, 
                     created_at, inputs_kept, scenario_description, inputComments)
                    VALUES (?, ?, ?, ?, ?, ?, current_timestamp(), ?, ?, ?)
                """, (
                    scenario_id, data.input1, data.input2, data.input3,
                    data.param1, data.param2, data.keepInputs, 
                    data.description, input_comments_json  # Use serialized JSON
                ))
            connection.commit()
        return {
            "status": "success",
            "scenario_id": scenario_id,
            "message": "Scenario saved to Delta table"
        }
    except Exception as e:
        logging.error(f'Error during submission: {e}')
        raise HTTPException(status_code=500, detail=str(e))

@api_app.get("/available-tables")
async def get_available_tables(request: Request):
    try:
        with get_connection(request) as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT available_tables FROM zivile_demo.app.v_available_tables order by 1")
                results = cursor.fetchall()
                table_names = [row[0] for row in results]
        return {"tables": table_names}
    except Exception as e:
        logging.error(f"Error fetching available tables: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@api_app.get("/runs")
async def get_all_runs(request: Request):
    try:
        with get_connection(request) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT scenario_id, input1, input2, input3, param1, param2, created_at, inputs_kept, scenario_description, inputComments
                    FROM zivile_demo.app.scenario_runs
                    ORDER BY created_at DESC
                    LIMIT 20
                """)
                columns = [desc[0] for desc in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return {"runs": results}
    except Exception as e:
        logging.error(f"Error fetching runs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_app.get("/scenario/{scenario_id}")
async def get_scenario_details(scenario_id: str, request: Request):
    try:
        with get_connection(request) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM zivile_demo.app.scenario_runs WHERE scenario_id = ?",
                    (scenario_id,)
                )
                row = cursor.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="Scenario not found")
                columns = [desc[0] for desc in cursor.description]
                result = dict(zip(columns, row))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_app.get("/table-summary/{table_name}")
async def table_summary(table_name: str, request: Request):
    import re

    try:
        with get_connection(request) as connection:
            with connection.cursor() as cursor:
                # 1. Get schema (column names and types)
                cursor.execute(f"DESCRIBE TABLE {table_name}")
                schema_rows = cursor.fetchall()
                columns = []
                for row in schema_rows:
                    col_name, col_type = row[0], row[1]
                    # Skip empty or comment rows
                    if not col_name or col_name.startswith("#") or col_name.lower() == 'col_name':
                        continue
                    columns.append({"name": col_name, "type": col_type})

                # 2. Get preview (first 5 rows)
                cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
                preview_cols = [desc[0] for desc in cursor.description]
                preview = [dict(zip(preview_cols, row)) for row in cursor.fetchall()]

                # 3. Build aggregations for each column
                agg_exprs = []
                for col in columns:
                    col_name = col["name"]
                    col_type = col["type"].lower()
                    safe_col = f"`{col_name}`" if re.search(r'\W', col_name) else col_name

                    if any(x in col_type for x in ["int", "double", "float", "decimal"]):
                        agg_exprs.append(f"MIN({safe_col}) AS {col_name}_min")
                        agg_exprs.append(f"MAX({safe_col}) AS {col_name}_max")
                        agg_exprs.append(f"AVG({safe_col}) AS {col_name}_avg")
                    elif any(x in col_type for x in ["date", "timestamp"]):
                        agg_exprs.append(f"MIN({safe_col}) AS {col_name}_min")
                        agg_exprs.append(f"MAX({safe_col}) AS {col_name}_max")
                    else:
                        agg_exprs.append(f"COUNT(DISTINCT {safe_col}) AS {col_name}_distinct")

                agg_sql = ", ".join(["COUNT(*) AS row_count"] + agg_exprs)
                cursor.execute(f"SELECT {agg_sql} FROM {table_name}")
                agg_result = cursor.fetchone()
                agg_cols = [desc[0] for desc in cursor.description]
                agg_stats = dict(zip(agg_cols, agg_result))

        # 4. Structure stats per column
        stats = {}
        for col in columns:
            name = col["name"]
            col_type = col["type"].lower()
            if any(x in col_type for x in ["int", "double", "float", "decimal"]):
                stats[name] = {
                    "min": agg_stats.get(f"{name}_min"),
                    "max": agg_stats.get(f"{name}_max"),
                    "avg": agg_stats.get(f"{name}_avg"),
                }
            elif any(x in col_type for x in ["date", "timestamp"]):
                stats[name] = {
                    "min": agg_stats.get(f"{name}_min"),
                    "max": agg_stats.get(f"{name}_max"),
                }
            else:
                stats[name] = {
                    "distinct_count": agg_stats.get(f"{name}_distinct"),
                }

        return {
            "row_count": agg_stats.get("row_count"),
            "columns": columns,
            "stats": stats,
            "preview": preview
        }
    except Exception as e:
        return {"error": str(e)}

