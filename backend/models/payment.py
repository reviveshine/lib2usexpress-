from pydantic import BaseModel, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import uuid

class PaymentStatus(str, Enum):
    INITIATED = "initiated"
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    EXPIRED = "expired"

class PaymentMethod(str, Enum):
    STRIPE = "stripe"
    PAYPAL = "paypal"
    MOBILE_MONEY = "mobile_money"

class CartItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total_price: float
    seller_id: str
    seller_name: str

class ShippingDetails(BaseModel):
    carrier: str
    service: str
    cost: float
    estimated_days: int
    tracking_number: Optional[str] = None

class CheckoutRequest(BaseModel):
    cart_items: List[CartItem]
    shipping_details: ShippingDetails
    buyer_info: Dict[str, Any]
    payment_method: PaymentMethod
    origin_url: str

class PaymentTransaction(BaseModel):
    id: str
    session_id: Optional[str] = None  # Stripe session ID
    user_id: str
    payment_method: PaymentMethod
    amount: float
    currency: str = "USD"
    subtotal: float  # Product total
    shipping_cost: float
    tax_amount: float = 0.0
    total_amount: float
    cart_items: List[CartItem]
    shipping_details: ShippingDetails
    payment_status: PaymentStatus
    metadata: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime
    paid_at: Optional[datetime] = None
    failure_reason: Optional[str] = None

class PaymentResponse(BaseModel):
    success: bool
    payment_id: str
    checkout_url: Optional[str] = None  # For Stripe redirect
    session_id: Optional[str] = None
    message: str

class OrderSummary(BaseModel):
    order_id: str
    total_amount: float
    currency: str
    payment_status: PaymentStatus
    cart_items: List[CartItem]
    shipping_details: ShippingDetails
    created_at: datetime
    estimated_delivery: Optional[datetime] = None

# Package-based pricing (secure server-side definition)
class PaymentPackage(BaseModel):
    package_id: str
    name: str
    description: str
    amount: float
    currency: str = "USD"
    features: List[str] = []

# Predefined secure packages (prevent price manipulation)
PAYMENT_PACKAGES = {
    "express_shipping": PaymentPackage(
        package_id="express_shipping",
        name="Express Shipping",
        description="1-2 business days delivery",
        amount=25.0,
        features=["Express delivery", "Priority handling", "Real-time tracking"]
    ),
    "standard_shipping": PaymentPackage(
        package_id="standard_shipping", 
        name="Standard Shipping",
        description="3-5 business days delivery",
        amount=15.0,
        features=["Standard delivery", "Basic tracking", "Insurance included"]
    ),
    "economy_shipping": PaymentPackage(
        package_id="economy_shipping",
        name="Economy Shipping", 
        description="5-10 business days delivery",
        amount=8.0,
        features=["Economy delivery", "Basic handling", "Limited tracking"]
    )
}