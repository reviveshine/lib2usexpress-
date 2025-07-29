from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
import uuid

class AddressModel(BaseModel):
    id: str = None
    type: str  # "home", "work", "other"
    street: str
    city: str
    state: str
    country: str
    postal_code: str
    is_default: bool = False

class ShippingAddressModel(BaseModel):
    id: str = None
    recipient_name: str
    street: str
    city: str
    state: str
    country: str
    postal_code: str
    phone: str
    is_default: bool = False

class MobileMoneyWallet(BaseModel):
    id: str = None
    provider: str  # "MTN", "Orange", "Lonestar", "Vodafone", etc.
    phone_number: str
    account_name: str
    is_verified: bool = False
    is_default: bool = False

class BankAccount(BaseModel):
    id: str = None
    bank_name: str
    account_number: str
    account_name: str
    routing_number: Optional[str] = None
    is_verified: bool = False
    is_default: bool = False

class IdentityDocument(BaseModel):
    id: str = None
    document_type: str  # "national_id", "passport", "drivers_license"
    document_number: str
    issuing_authority: str
    expiry_date: Optional[datetime] = None
    document_image: Optional[str] = None  # base64 encoded image
    verification_status: str = "pending"  # "pending", "verified", "rejected"

class UserProfile(BaseModel):
    user_id: str
    system_user_id: str  # Auto-generated unique ID
    profile_picture: Optional[str] = None  # base64 encoded image
    addresses: List[AddressModel] = []
    shipping_addresses: List[ShippingAddressModel] = []
    mobile_money_wallets: List[MobileMoneyWallet] = []
    bank_accounts: List[BankAccount] = []
    identity_documents: List[IdentityDocument] = []
    verification_level: str = "basic"  # "basic", "verified", "premium"
    created_at: datetime
    updated_at: datetime

class UpdateProfileRequest(BaseModel):
    addresses: Optional[List[AddressModel]] = None
    shipping_addresses: Optional[List[ShippingAddressModel]] = None
    mobile_money_wallets: Optional[List[MobileMoneyWallet]] = None
    bank_accounts: Optional[List[BankAccount]] = None

class AddIdentityDocumentRequest(BaseModel):
    document_type: str
    document_number: str
    issuing_authority: str
    expiry_date: Optional[datetime] = None
    document_image: Optional[str] = None

class ProfileResponse(BaseModel):
    success: bool
    profile: UserProfile