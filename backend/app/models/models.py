from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from app.database.connection import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), default="")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="employee")
    department = Column(String(80), default="Operations")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, nullable=False)
    head = Column(String(120), default="")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(160), nullable=False)
    owner = Column(String(120), default="")
    status = Column(String(40), default="active")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    project = Column(String(160), default="")
    department = Column(String(120), default="")
    assigned_to = Column(String(120), default="")
    priority = Column(String(40), default="medium")
    status = Column(String(40), default="in_progress")
    progress = Column(Integer, default=0)
    due_date = Column(String(30), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TaskUpdate(Base):
    __tablename__ = "task_updates"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, nullable=False)
    note = Column(Text, default="")
    progress = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class WeeklyReport(Base):
    __tablename__ = "weekly_reports"

    id = Column(Integer, primary_key=True, index=True)
    employee = Column(String(120), nullable=False)
    completed_tasks = Column(Integer, default=0)
    pending_tasks = Column(Integer, default=0)
    hours_worked = Column(Integer, default=0)
    manager_note = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, nullable=False)
    author = Column(String(120), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, default="")
    recipient = Column(String(120), default="")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, nullable=False)
    filename = Column(String(200), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class Holiday(Base):
    __tablename__ = "holidays"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(160), nullable=False)
    date = Column(String(20), nullable=False)


class ActivityLog(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    actor = Column(String(120), nullable=False)
    action = Column(String(160), nullable=False)
    details = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
