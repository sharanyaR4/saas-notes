from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, create_tables
from app.api.endpoints import health, auth, notes, tenants, users
from app.utils.seed_data import seed_initial_data
import os

app = FastAPI(title="SaaS Notes API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for the assignment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(auth.router, prefix="/auth")
app.include_router(notes.router)
app.include_router(tenants.router)
app.include_router(users.router)

@app.on_event("startup")
async def startup_event():
    # Create tables
    create_tables()
    # Seed initial data
    seed_initial_data()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)