from pydantic import BaseModel, EmailStr
from typing import Optional, Literal, List
from datetime import datetime
import uuid

class AdminUser(BaseModel):
    id: str
    email: str
    firstName: str
    lastName: str
    role: Literal["super_admin", "admin", "moderator"]
    permissions: List[str]
    isActive: bool = True
    createdAt: datetime
    updatedAt: datetime

class AdminUserCreate(BaseModel):
    email: EmailStr
    firstName: str
    lastName: str
    password: str
    role: Literal["admin", "moderator"] = "moderator"
    permissions: List[str] = []

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class UserReport(BaseModel):
    id: str
    reported_user_id: str
    reporter_id: str
    reason: str
    description: str
    status: Literal["pending", "investigating", "resolved", "dismissed"]
    created_at: datetime
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolution_notes: Optional[str] = None

class UserReportCreate(BaseModel):
    reported_user_id: str
    reason: str
    description: str

class ProductReport(BaseModel):
    id: str
    product_id: str
    reporter_id: str
    reason: str
    description: str
    status: Literal["pending", "investigating", "resolved", "dismissed"]
    created_at: datetime
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolution_notes: Optional[str] = None

class ProductReportCreate(BaseModel):
    product_id: str
    reason: str
    description: str

class ProductModerationAction(BaseModel):
    product_id: str
    action: Literal["approve", "reject", "suspend", "delete"]
    reason: Optional[str] = None
    notes: Optional[str] = None

class UserModerationAction(BaseModel):
    user_id: str
    action: Literal["verify", "suspend", "ban", "reactivate"]
    reason: Optional[str] = None
    duration_days: Optional[int] = None
    notes: Optional[str] = None

class PlatformStats(BaseModel):
    total_users: int
    total_buyers: int
    total_sellers: int
    verified_sellers: int
    total_products: int
    active_products: int
    pending_products: int
    total_transactions: int
    pending_reports: int
    resolved_reports: int
    revenue_this_month: float
    revenue_last_month: float

class AdminActivity(BaseModel):
    id: str
    admin_id: str
    admin_name: str
    action: str
    target_type: Literal["user", "product", "report", "system"]
    target_id: Optional[str] = None
    details: str
    timestamp: datetime