from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ShippingCarrier(str, Enum):
    DHL = "dhl"
    FEDEX = "fedex"
    UPS = "ups"
    ARAMEX = "aramex"

class ShippingService(str, Enum):
    # DHL Services
    DHL_EXPRESS_WORLDWIDE = "dhl_express_worldwide"
    DHL_EXPRESS_12 = "dhl_express_12"
    DHL_EXPRESS_10_30 = "dhl_express_10_30"
    
    # FedEx Services
    FEDEX_INTERNATIONAL_PRIORITY = "fedex_international_priority"
    FEDEX_INTERNATIONAL_ECONOMY = "fedex_international_economy"
    FEDEX_INTERNATIONAL_FIRST = "fedex_international_first"
    
    # UPS Services
    UPS_WORLDWIDE_EXPRESS = "ups_worldwide_express"
    UPS_WORLDWIDE_EXPEDITED = "ups_worldwide_expedited"
    UPS_WORLDWIDE_SAVER = "ups_worldwide_saver"
    
    # Aramex Services
    ARAMEX_EXPRESS = "aramex_express"
    ARAMEX_PRIORITY = "aramex_priority"

class Address(BaseModel):
    name: str
    company: Optional[str] = None
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    phone: Optional[str] = None
    email: Optional[str] = None

class Package(BaseModel):
    length: float  # cm
    width: float   # cm
    height: float  # cm
    weight: float  # kg
    value: float   # USD
    description: str

class ShippingRateRequest(BaseModel):
    origin: Address
    destination: Address
    packages: List[Package]
    currency: str = "USD"
    services: Optional[List[ShippingService]] = None

class ShippingRate(BaseModel):
    carrier: ShippingCarrier
    service: ShippingService
    service_name: str
    rate: float
    currency: str
    transit_days: int
    delivery_date: Optional[datetime] = None
    includes_customs: bool = False
    includes_insurance: bool = False
    max_insurance_value: Optional[float] = None

class ShippingRateResponse(BaseModel):
    success: bool
    rates: List[ShippingRate]
    errors: List[str] = []
    request_id: str
    timestamp: datetime

class ShipmentRequest(BaseModel):
    rate_id: str
    origin: Address
    destination: Address
    packages: List[Package]
    customs_info: Dict[str, Any]
    insurance_value: Optional[float] = None

class TrackingInfo(BaseModel):
    tracking_number: str
    carrier: ShippingCarrier
    status: str
    status_description: str
    location: Optional[str] = None
    timestamp: datetime
    delivered: bool = False
    delivery_date: Optional[datetime] = None
    estimated_delivery: Optional[datetime] = None

class CustomsInfo(BaseModel):
    contents_type: str  # "merchandise", "documents", "gift", etc.
    contents_explanation: str
    customs_certify: bool = True
    customs_signer: str
    non_delivery_option: str = "return"  # "return" or "abandon"
    restriction_type: str = "none"
    restriction_comments: Optional[str] = None
    
class CustomsItem(BaseModel):
    description: str
    quantity: int
    value: float
    weight: float
    origin_country: str = "LR"  # Liberia
    hs_tariff_number: Optional[str] = None