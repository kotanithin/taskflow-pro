from fastapi import APIRouter, HTTPException

from app.auth.jwt import create_access_token
from app.schemas.schemas import DashboardSummary, ReportItem, TaskCreate, TaskOut, TokenResponse, UserLogin
from app.services.mock_data import get_calendar_events, get_dashboard_summary, get_notifications, get_reports, get_tasks

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin) -> TokenResponse:
    if payload.email == "admin@taskflow.pro" and payload.password == "admin123":
        token = create_access_token(1, payload.email)
        return TokenResponse(
            access_token=token,
            user={
                "id": 1,
                "full_name": "Admin User",
                "email": payload.email,
                "role": "super_admin",
                "department": "Executive",
            },
        )
    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/dashboard", response_model=DashboardSummary)
def dashboard() -> DashboardSummary:
    return DashboardSummary(**get_dashboard_summary())


@router.get("/tasks", response_model=list[TaskOut])
def tasks() -> list[TaskOut]:
    return [TaskOut(**item) for item in get_tasks()]


@router.post("/tasks", response_model=TaskOut)
def create_task(payload: TaskCreate) -> TaskOut:
    task = {
        "id": 99,
        "title": payload.title,
        "description": payload.description,
        "project": payload.project,
        "department": payload.department,
        "assigned_to": payload.assigned_to,
        "priority": payload.priority,
        "status": payload.status,
        "progress": payload.progress,
        "due_date": payload.due_date,
        "created_at": "2026-07-28T00:00:00",
        "updated_at": "2026-07-28T00:00:00",
    }
    return TaskOut(**task)


@router.get("/reports", response_model=list[ReportItem])
def reports() -> list[ReportItem]:
    return [ReportItem(**item) for item in get_reports()]


@router.get("/calendar")
def calendar() -> list[dict]:
    return get_calendar_events()


@router.get("/notifications")
def notifications() -> list[dict]:
    return get_notifications()
