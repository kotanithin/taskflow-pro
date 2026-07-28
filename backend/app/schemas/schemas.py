from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    department: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    project: str
    department: str
    assigned_to: str
    priority: str
    status: str
    progress: int
    due_date: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    project: str = ""
    department: str = ""
    assigned_to: str = ""
    priority: str = "medium"
    status: str = "in_progress"
    progress: int = 0
    due_date: str = ""


class DashboardSummary(BaseModel):
    total_tasks: int
    completed: int
    in_progress: int
    delayed: int
    todays_tasks: int
    pending_approval: int


class ReportItem(BaseModel):
    name: str
    value: int
