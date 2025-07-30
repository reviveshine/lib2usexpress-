from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserStatusUpdate(BaseModel):
    status: str  # "online", "offline", "away"

class UserStatus(BaseModel):
    user_id: str
    status: str = "offline"  # "online", "offline", "away"
    last_seen: datetime
    last_activity: datetime
    
class UserOnlineResponse(BaseModel):
    success: bool
    message: str
    status: Optional[str] = None
    last_seen: Optional[datetime] = None