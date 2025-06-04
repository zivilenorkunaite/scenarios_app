import os
import uuid
import logging
from fastapi import FastAPI, HTTPException, Request
from databricks import sql
from databricks.sdk.core import Config
from databricks.sdk.service import jobs
from databricks.sdk import WorkspaceClient

from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import pandas as pd


load_dotenv()

# Ensure environment variable is set correctly
assert os.getenv('DATABRICKS_WAREHOUSE_ID'), "DATABRICKS_WAREHOUSE_ID must be set in app.yaml."

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI()
api_app = FastAPI()

# Mount API routes 
app.mount("/api", api_app)

# Mount static files LAST
current_dir = os.path.dirname(os.path.abspath(__file__))
build_dir = os.path.join(current_dir, "client", "build")
app.mount("/", StaticFiles(directory=build_dir, html=True), name="ui")
#app.mount("/", StaticFiles(directory="/client/build", html=True), name="ui")


# CORS middleware (applied to main app only)
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScenarioRequest(BaseModel):
    input1: str
    input2: str
    input3: str
    param1: float
    param2: float
    keepInputs: bool

def get_connection(request):
    logging.debug('Establishing connection to Databricks SQL Warehouse')
    return sql.connect(
        server_hostname=f"https://{os.getenv('DATABRICKS_HOST')}",
        http_path=os.getenv("HTTP_PATH"),
        access_token= os.getenv("DATABRICKS_TOKEN") #request.headers.get('x_forwarded_access_token') #
    )


# Run workflow for ml job
@api_app.post("/trigger-job/{scenario_id}")
async def trigger_databricks_job(scenario_id: str):
    try:
        client = WorkspaceClient(
            host=f"https://{os.getenv('DATABRICKS_HOST')}",
            auth_type="pat",  # Force PAT
            token=os.getenv("DATABRICKS_TOKEN")
        )
        
        # Run the job and pass the scenario_id as a parameter
        run = client.jobs.run_now(
            job_id=os.getenv("DATABRICKS_JOB_ID"),  # Set this in your .env
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
    logging.debug(f'Received submission with data: {data}')

    try:
        with get_connection(request) as connection:
            with connection.cursor() as cursor:
                logging.debug(f'Inserting scenario run with ID: {scenario_id}')
                cursor.execute("""
                    INSERT INTO zivile_demo.app.scenario_runs 
                    (scenario_id, input1, input2, input3, param1, param2, created_at, inputs_kept)
                    VALUES (?, ?, ?, ?, ?, ?, current_timestamp(), ?)
                """, (scenario_id, data.input1, data.input2, data.input3, 
                      data.param1, data.param2, data.keepInputs))
                logging.debug('Insert executed successfully')
            connection.commit()
            logging.debug('Transaction committed')
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
                    SELECT scenario_id, input1, input2, input3, param1, param2, created_at, inputs_kept
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
