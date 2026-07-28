from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.database.connection import init_db
from app.scheduler.reminders import start_scheduler

app = FastAPI(title="TaskFlow Pro API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def startup_event() -> None:
    init_db()
    start_scheduler()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
