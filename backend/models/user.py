from pydantic import BaseModel, EmailStr, validator
from typing import Optional, Literal
from datetime import datetime
import uuid

class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str
    userType: Literal["buyer", "seller"]
    location: str
    phone: Optional[str] = None

    @validator('location')
    def validate_location(cls, v, values):
        user_type = values.get('userType')
        if user_type == 'seller' and 'liberia' not in v.lower():
            raise ValueError('Sellers must be located in Liberia')
        elif user_type == 'buyer' and 'usa' not in v.lower() and 'united states' not in v.lower():
            raise ValueError('Buyers must be located in the USA')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: str
    userType: str
    location: str
    phone: Optional[str] = None
    isVerified: bool = False
    createdAt: datetime
    
class UserInDB(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: str
    password_hash: str
    userType: str
    location: str
    phone: Optional[str] = None
    isVerified: bool = False
    createdAt: datetime
    updatedAt: datetime