from pydantic import BaseModel, validator
from typing import Optional, Literal, List, Dict
from datetime import datetime
import uuid

class VerificationDocument(BaseModel):
    id: str
    user_id: str
    document_type: Literal["national_id", "passport", "drivers_license", "business_registration", "utility_bill", "bank_statement"]
    document_name: str
    file_content: str  # Base64 encoded file content
    file_type: str  # MIME type (image/jpeg, image/png, application/pdf)
    file_size: int  # File size in bytes
    uploaded_at: datetime
    status: Literal["pending", "approved", "rejected"] = "pending"
    rejection_reason: Optional[str] = None
    reviewed_by: Optional[str] = None  # Admin ID who reviewed
    reviewed_at: Optional[datetime] = None

class VerificationDocumentUpload(BaseModel):
    document_type: Literal["national_id", "passport", "drivers_license", "business_registration", "utility_bill", "bank_statement"]
    document_name: str
    file_content: str  # Base64 encoded file content
    file_type: str
    file_size: int

    @validator('file_size')
    def validate_file_size(cls, v):
        max_size = 10 * 1024 * 1024  # 10MB
        if v > max_size:
            raise ValueError('File size cannot exceed 10MB')
        return v

    @validator('file_type')
    def validate_file_type(cls, v):
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
        if v not in allowed_types:
            raise ValueError('File type must be JPEG, PNG, or PDF')
        return v

class SellerVerificationProfile(BaseModel):
    id: str
    user_id: str
    # Personal Information
    full_name: str
    date_of_birth: Optional[str] = None
    nationality: str = "Liberian"
    national_id_number: Optional[str] = None
    
    # Business Information (for business sellers)
    business_name: Optional[str] = None
    business_type: Optional[Literal["sole_proprietorship", "partnership", "corporation", "llc"]] = None
    business_registration_number: Optional[str] = None
    tax_identification_number: Optional[str] = None
    
    # Address Information
    physical_address: str
    city: str
    county: str  # Liberian counties
    postal_code: Optional[str] = None
    
    # Banking Information
    bank_name: Optional[str] = None
    account_holder_name: Optional[str] = None
    account_number: Optional[str] = None  # This will be encrypted
    mobile_money_number: Optional[str] = None
    
    # Verification Status
    verification_status: Literal["pending", "documents_required", "under_review", "approved", "rejected"] = "pending"
    verification_level: Literal["basic", "enhanced", "business"] = "basic"
    verification_notes: Optional[str] = None
    
    # Documents
    uploaded_documents: List[str] = []  # Document IDs
    required_documents: List[str] = ["national_id", "utility_bill"]  # Required document types
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None  # Admin ID

class SellerVerificationCreate(BaseModel):
    # Personal Information
    full_name: str
    date_of_birth: Optional[str] = None
    nationality: str = "Liberian"
    national_id_number: Optional[str] = None
    
    # Business Information (optional)
    business_name: Optional[str] = None
    business_type: Optional[Literal["sole_proprietorship", "partnership", "corporation", "llc"]] = None
    business_registration_number: Optional[str] = None
    tax_identification_number: Optional[str] = None
    
    # Address Information
    physical_address: str
    city: str
    county: str
    postal_code: Optional[str] = None
    
    # Banking Information
    bank_name: Optional[str] = None
    account_holder_name: Optional[str] = None
    account_number: Optional[str] = None
    mobile_money_number: Optional[str] = None

class VerificationStatusUpdate(BaseModel):
    status: Literal["pending", "documents_required", "under_review", "approved", "rejected"]
    verification_level: Optional[Literal["basic", "enhanced", "business"]] = None
    notes: Optional[str] = None
    required_documents: Optional[List[str]] = None

class DocumentReview(BaseModel):
    document_id: str
    status: Literal["approved", "rejected"]
    rejection_reason: Optional[str] = None

class VerificationStats(BaseModel):
    total_applications: int
    pending_review: int
    documents_required: int
    under_review: int
    approved: int
    rejected: int
    approval_rate: float

# Enhanced User model with verification
class VerifiedUserResponse(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: str
    userType: str
    location: str
    phone: Optional[str] = None
    isVerified: bool = False
    verification_status: Optional[str] = None
    verification_level: Optional[str] = None
    verified_at: Optional[datetime] = None
    createdAt: datetime
    trust_score: int = 0  # Score from 0-100 based on verification level and documents

# Liberian Counties for validation
LIBERIAN_COUNTIES = [
    "Bomi", "Bong", "Gbarpolu", "Grand Bassa", "Grand Cape Mount", 
    "Grand Gedeh", "Grand Kru", "Lofa", "Margibi", "Maryland", 
    "Montserrado", "Nimba", "River Cess", "River Gee", "Sinoe"
]

# Document requirements by verification level
VERIFICATION_REQUIREMENTS = {
    "basic": ["national_id", "utility_bill"],
    "enhanced": ["national_id", "utility_bill", "bank_statement"],
    "business": ["national_id", "utility_bill", "business_registration", "bank_statement"]
}