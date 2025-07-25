from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
import uuid
from pydantic import BaseModel
from models.shipping import (
    ShippingRateRequest, ShippingRateResponse, Address, Package, 
    ShippingCarrier, CustomsInfo, TrackingInfo
)
from services.shipping_service import ShippingManager
from database import get_database
from server import get_current_user

class ShippingEstimateRequest(BaseModel):
    origin_city: str
    destination_state: str
    weight: float
    length: float = 10.0
    width: float = 10.0
    height: float = 10.0
    value: float = 100.0

router = APIRouter()

# Initialize shipping manager
shipping_manager = ShippingManager()

@router.post("/rates", response_model=ShippingRateResponse)
async def get_shipping_rates(
    rate_request: ShippingRateRequest,
    current_user_id: str = Depends(get_current_user)
):
    """Get shipping rates from all carriers"""
    
    # Validate that origin is in Liberia
    if rate_request.origin.country.upper() != "LR":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Origin must be in Liberia (LR)"
        )
    
    # Validate that destination is in USA
    if rate_request.destination.country.upper() != "US":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Destination must be in USA (US)"
        )
    
    try:
        # Get rates from shipping manager
        rates_response = await shipping_manager.get_shipping_rates(rate_request)
        
        # Store the rate request for future reference
        database = get_database()
        rate_record = {
            "id": rates_response.request_id,
            "user_id": current_user_id,
            "origin": rate_request.origin.dict(),
            "destination": rate_request.destination.dict(),
            "packages": [pkg.dict() for pkg in rate_request.packages],
            "rates": [rate.dict() for rate in rates_response.rates],
            "timestamp": rates_response.timestamp,
            "expires_at": datetime.now().replace(hour=23, minute=59, second=59)  # Expires end of day
        }
        
        await database.shipping_rates.insert_one(rate_record)
        
        return rates_response
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get shipping rates: {str(e)}"
        )

@router.post("/calculate-customs", response_model=dict)
async def calculate_customs_duties(
    packages: List[Package],
    destination_country: str = "US",
    current_user_id: str = Depends(get_current_user)
):
    """Calculate estimated customs duties and taxes"""
    
    try:
        customs_info = await shipping_manager.calculate_customs_duties(packages, destination_country)
        
        return {
            "success": True,
            "customs_info": customs_info,
            "disclaimer": "Customs duties and taxes are estimates only. Actual charges may vary and are determined by customs authorities."
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate customs duties: {str(e)}"
        )

@router.post("/estimate", response_model=dict)
async def get_shipping_estimate(request: ShippingEstimateRequest):
    """Get quick shipping estimate without authentication"""
    
    try:
        # Create simplified request for estimation
        origin = Address(
            name="Seller",
            address_line_1="Sample Address",
            city=request.origin_city,
            state="Montserrado",
            postal_code="1000", 
            country="LR"
        )
        
        destination = Address(
            name="Buyer",
            address_line_1="Sample Address",
            city="Sample City",
            state=request.destination_state,
            postal_code="12345",
            country="US"
        )
        
        package = Package(
            length=request.length,
            width=request.width,
            height=request.height,
            weight=request.weight,
            value=request.value,
            description="Sample product"
        )
        
        rate_request = ShippingRateRequest(
            origin=origin,
            destination=destination,
            packages=[package]
        )
        
        # Get rates
        rates_response = await shipping_manager.get_shipping_rates(rate_request)
        
        # Calculate customs
        customs_info = await shipping_manager.calculate_customs_duties([package])
        
        # Return simplified response
        estimate_rates = []
        for rate in rates_response.rates:
            total_cost = rate.rate + customs_info["total_charges"]
            estimate_rates.append({
                "carrier": rate.carrier,
                "service": rate.service_name,
                "shipping_cost": rate.rate,
                "customs_duties": customs_info["total_charges"],
                "total_cost": round(total_cost, 2),
                "transit_days": rate.transit_days,
                "currency": rate.currency
            })
        
        return {
            "success": True,
            "estimates": estimate_rates,
            "customs_breakdown": customs_info,
            "disclaimer": "These are estimates only. Final costs may vary based on actual package contents and customs assessment."
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get shipping estimate: {str(e)}"
        )

@router.get("/carriers", response_model=dict)
async def get_available_carriers():
    """Get list of available shipping carriers and their services"""
    
    carriers_info = {
        "dhl": {
            "name": "DHL Express",
            "description": "Fast international express delivery",
            "services": [
                {"code": "dhl_express_worldwide", "name": "DHL Express Worldwide", "transit_days": "2-3"},
                {"code": "dhl_express_12", "name": "DHL Express 12:00", "transit_days": "1-2"},
                {"code": "dhl_express_10_30", "name": "DHL Express 10:30", "transit_days": "1-2"}
            ],
            "coverage": "Worldwide",
            "tracking": True,
            "insurance": True
        },
        "fedex": {
            "name": "FedEx",
            "description": "Reliable international shipping",
            "services": [
                {"code": "fedex_international_priority", "name": "FedEx International Priority", "transit_days": "2-3"},
                {"code": "fedex_international_economy", "name": "FedEx International Economy", "transit_days": "4-6"},
                {"code": "fedex_international_first", "name": "FedEx International First", "transit_days": "1-2"}
            ],
            "coverage": "USA and Territories",
            "tracking": True,
            "insurance": "Optional"
        },
        "ups": {
            "name": "UPS",
            "description": "Worldwide express and standard delivery",
            "services": [
                {"code": "ups_worldwide_express", "name": "UPS Worldwide Express", "transit_days": "2-3"},
                {"code": "ups_worldwide_expedited", "name": "UPS Worldwide Expedited", "transit_days": "3-4"},
                {"code": "ups_worldwide_saver", "name": "UPS Worldwide Saver", "transit_days": "4-6"}
            ],
            "coverage": "Worldwide",
            "tracking": True,
            "insurance": True
        },
        "aramex": {
            "name": "Aramex",
            "description": "Middle East and international logistics",
            "services": [
                {"code": "aramex_express", "name": "Aramex Express", "transit_days": "3-4"},
                {"code": "aramex_priority", "name": "Aramex Priority", "transit_days": "2-3"}
            ],
            "coverage": "International",
            "tracking": True,
            "insurance": "Optional"
        }
    }
    
    return {
        "success": True,
        "carriers": carriers_info,
        "supported_routes": "Liberia (LR) to United States (US)"
    }

@router.get("/zones", response_model=dict)
async def get_shipping_zones():
    """Get shipping zones and states information"""
    
    us_states = [
        {"code": "AL", "name": "Alabama"}, {"code": "AK", "name": "Alaska"},
        {"code": "AZ", "name": "Arizona"}, {"code": "AR", "name": "Arkansas"},
        {"code": "CA", "name": "California"}, {"code": "CO", "name": "Colorado"},
        {"code": "CT", "name": "Connecticut"}, {"code": "DE", "name": "Delaware"},
        {"code": "FL", "name": "Florida"}, {"code": "GA", "name": "Georgia"},
        {"code": "HI", "name": "Hawaii"}, {"code": "ID", "name": "Idaho"},
        {"code": "IL", "name": "Illinois"}, {"code": "IN", "name": "Indiana"},
        {"code": "IA", "name": "Iowa"}, {"code": "KS", "name": "Kansas"},
        {"code": "KY", "name": "Kentucky"}, {"code": "LA", "name": "Louisiana"},
        {"code": "ME", "name": "Maine"}, {"code": "MD", "name": "Maryland"},
        {"code": "MA", "name": "Massachusetts"}, {"code": "MI", "name": "Michigan"},
        {"code": "MN", "name": "Minnesota"}, {"code": "MS", "name": "Mississippi"},
        {"code": "MO", "name": "Missouri"}, {"code": "MT", "name": "Montana"},
        {"code": "NE", "name": "Nebraska"}, {"code": "NV", "name": "Nevada"},
        {"code": "NH", "name": "New Hampshire"}, {"code": "NJ", "name": "New Jersey"},
        {"code": "NM", "name": "New Mexico"}, {"code": "NY", "name": "New York"},
        {"code": "NC", "name": "North Carolina"}, {"code": "ND", "name": "North Dakota"},
        {"code": "OH", "name": "Ohio"}, {"code": "OK", "name": "Oklahoma"},
        {"code": "OR", "name": "Oregon"}, {"code": "PA", "name": "Pennsylvania"},
        {"code": "RI", "name": "Rhode Island"}, {"code": "SC", "name": "South Carolina"},
        {"code": "SD", "name": "South Dakota"}, {"code": "TN", "name": "Tennessee"},
        {"code": "TX", "name": "Texas"}, {"code": "UT", "name": "Utah"},
        {"code": "VT", "name": "Vermont"}, {"code": "VA", "name": "Virginia"},
        {"code": "WA", "name": "Washington"}, {"code": "WV", "name": "West Virginia"},
        {"code": "WI", "name": "Wisconsin"}, {"code": "WY", "name": "Wyoming"},
        {"code": "DC", "name": "District of Columbia"}
    ]
    
    liberia_cities = [
        "Monrovia", "Gbarnga", "Kakata", "Bensonville", "Harper",
        "Buchanan", "Voinjama", "Zwedru", "New Kru Town", "Pleebo"
    ]
    
    return {
        "success": True,
        "origin_zones": {
            "country": "Liberia",
            "code": "LR",
            "major_cities": liberia_cities
        },
        "destination_zones": {
            "country": "United States",
            "code": "US", 
            "states": us_states
        }
    }