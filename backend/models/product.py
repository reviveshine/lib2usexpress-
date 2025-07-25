from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
import uuid

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    images: List[str] = []
    video_url: Optional[str] = None
    stock: int = 1
    tags: List[str] = []
    weight: Optional[float] = None  # in kg for shipping calculations
    dimensions: Optional[dict] = None  # {"length": 0, "width": 0, "height": 0} in cm

    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        return v

    @validator('stock')
    def validate_stock(cls, v):
        if v < 0:
            raise ValueError('Stock cannot be negative')
        return v

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    images: Optional[List[str]] = None
    video_url: Optional[str] = None
    stock: Optional[int] = None
    tags: Optional[List[str]] = None
    weight: Optional[float] = None
    dimensions: Optional[dict] = None

class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    category: str
    images: List[str]
    video_url: Optional[str] = None
    stock: int
    tags: List[str]
    weight: Optional[float] = None
    dimensions: Optional[dict] = None
    seller_id: str
    seller_name: str
    views: int = 0
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

class ProductInDB(BaseModel):
    id: str
    name: str
    description: str
    price: float
    category: str
    images: List[str]
    video_url: Optional[str] = None
    stock: int
    tags: List[str]
    weight: Optional[float] = None
    dimensions: Optional[dict] = None
    seller_id: str
    seller_name: str
    views: int = 0
    is_active: bool = True
    created_at: datetime
    updated_at: datetime