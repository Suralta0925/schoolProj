from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .router import assignment_router, UserRouter



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",  # Vite sometimes uses different ports
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Explicit list
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight for 1 hour
)
app.include_router(assignment_router, prefix="/api/v1/class")
app.include_router(UserRouter, prefix="/api/v1/user")
