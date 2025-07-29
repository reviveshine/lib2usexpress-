from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class PasswordResetToken(BaseModel):
    id: str
    user_id: str
    email: str
    token: str
    expires_at: datetime
    used: bool = False
    created_at: datetime

class PasswordResetResponse(BaseModel):
    success: bool
    message: str
    reset_token_sent: Optional[bool] = None