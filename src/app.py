from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from router import assignment_router



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"])
app.include_router(assignment_router, prefix="/api/v1/class")

