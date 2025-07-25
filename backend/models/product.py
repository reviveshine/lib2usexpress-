from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
import uuid
import base64

class MediaFile(BaseModel):
    filename: str
    content_type: str
    data: str  # base64 encoded data
    size: int  # file size in bytes

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    images: List[str] = []  # base64 encoded images
    video: Optional[str] = None  # base64 encoded video
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

    @validator('images')
    def validate_images(cls, v):
        if len(v) > 10:
            raise ValueError('Maximum 10 images allowed per product')
        return v

    @validator('video')
    def validate_video(cls, v):
        if v and len(v) > 100 * 1024 * 1024:  # 100MB limit for base64 video
            raise ValueError('Video file too large (max 100MB)')
        return v

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    images: Optional[List[str]] = None
    video: Optional[str] = None
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
    video: Optional[str] = None
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
    video: Optional[str] = None
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