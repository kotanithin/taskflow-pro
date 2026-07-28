import hashlib
from datetime import datetime, timedelta


def create_access_token(user_id: int, email: str) -> str:
    payload = f"{user_id}:{email}:{datetime.utcnow().timestamp()}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def verify_access_token(token: str) -> bool:
    return bool(token and len(token) > 10)
