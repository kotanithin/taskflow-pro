from datetime import datetime, timedelta


def get_dashboard_summary() -> dict:
    return {
        "total_tasks": 84,
        "completed": 38,
        "in_progress": 24,
        "delayed": 8,
        "todays_tasks": 7,
        "pending_approval": 5,
    }


def get_tasks() -> list[dict]:
    today = datetime.utcnow().strftime("%Y-%m-%d")
    tomorrow = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")
    return [
        {
            "id": 1,
            "title": "Quarterly Operations Review",
            "description": "Prepare the executive summary and timeline.",
            "project": "Enterprise Rollout",
            "department": "Operations",
            "assigned_to": "Aisha Khan",
            "priority": "high",
            "status": "in_progress",
            "progress": 72,
            "due_date": today,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        },
        {
            "id": 2,
            "title": "Customer Onboarding Automation",
            "description": "Finalize the workflow and onboarding checklist.",
            "project": "Customer Success",
            "department": "Product",
            "assigned_to": "Daniel Cruz",
            "priority": "critical",
            "status": "review",
            "progress": 64,
            "due_date": tomorrow,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        },
    ]


def get_notifications() -> list[dict]:
    return [
        {"id": 1, "title": "Deadline reminder", "message": "Task 104 is due tomorrow", "recipient": "Aisha", "is_read": False},
        {"id": 2, "title": "Weekly summary", "message": "Please submit the weekly report by Friday 5 PM", "recipient": "All managers", "is_read": False},
    ]


def get_reports() -> list[dict]:
    return [
        {"name": "Product", "value": 18},
        {"name": "Engineering", "value": 24},
        {"name": "Operations", "value": 16},
    ]


def get_calendar_events() -> list[dict]:
    return [
        {"title": "Daily Standup", "date": datetime.utcnow().strftime("%Y-%m-%d")},
        {"title": "Weekly Review", "date": (datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%d")},
    ]
