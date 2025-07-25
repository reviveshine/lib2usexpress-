import os
import httpx
import asyncio
from typing import List, Dict, Any
from datetime import datetime, timedelta
import uuid
import json
from models.shipping import (
    ShippingCarrier, ShippingService, ShippingRateRequest, 
    ShippingRate, ShippingRateResponse, Address, Package
)

class ShippingServiceProvider:
    """Base class for shipping service providers"""
    
    def __init__(self):
        self.api_key = None
        self.base_url = None
        self.test_mode = True
    
    async def get_rates(self, request: ShippingRateRequest) -> List[ShippingRate]:
        """Get shipping rates from carrier"""
        raise NotImplementedError
    
    async def create_shipment(self, request) -> Dict[str, Any]:
        """Create a shipment with the carrier"""
        raise NotImplementedError
    
    async def track_shipment(self, tracking_number: str) -> Dict[str, Any]:
        """Track a shipment"""
        raise NotImplementedError

class DHLProvider(ShippingServiceProvider):
    """DHL Express API integration"""
    
    def __init__(self):
        super().__init__()
        self.api_key = os.getenv('DHL_API_KEY')
        self.base_url = "https://express.api.dhl.com/mydhlapi/test" if self.test_mode else "https://express.api.dhl.com/mydhlapi"
        self.services = {
            ShippingService.DHL_EXPRESS_WORLDWIDE: "U",
            ShippingService.DHL_EXPRESS_12: "T", 
            ShippingService.DHL_EXPRESS_10_30: "K"
        }
    
    async def get_rates(self, request: ShippingRateRequest) -> List[ShippingRate]:
        """Get DHL shipping rates"""
        # For development/testing, provide mock rates even without API key
        # if not self.api_key:
        #     return []
        
        rates = []
        
        try:
            # Mock rates for development - replace with actual DHL API calls
            base_rate = sum(pkg.weight for pkg in request.packages) * 25.0  # $25/kg base rate
            
            for service, code in self.services.items():
                multiplier = 1.0
                transit_days = 3
                
                if service == ShippingService.DHL_EXPRESS_WORLDWIDE:
                    multiplier = 1.2
                    transit_days = 2
                elif service == ShippingService.DHL_EXPRESS_12:
                    multiplier = 1.5
                    transit_days = 1
                elif service == ShippingService.DHL_EXPRESS_10_30:
                    multiplier = 1.8
                    transit_days = 1
                
                rate = ShippingRate(
                    carrier=ShippingCarrier.DHL,
                    service=service,
                    service_name=f"DHL {service.value.replace('_', ' ').title()}",
                    rate=round(base_rate * multiplier, 2),
                    currency="USD",
                    transit_days=transit_days,
                    delivery_date=datetime.now() + timedelta(days=transit_days),
                    includes_customs=True,
                    includes_insurance=True,
                    max_insurance_value=5000.0
                )
                rates.append(rate)
        
        except Exception as e:
            print(f"DHL API error: {e}")
        
        return rates

class FedExProvider(ShippingServiceProvider):
    """FedEx API integration"""
    
    def __init__(self):
        super().__init__()
        self.api_key = os.getenv('FEDEX_API_KEY')
        self.base_url = "https://apis-sandbox.fedex.com" if self.test_mode else "https://apis.fedex.com"
        self.services = {
            ShippingService.FEDEX_INTERNATIONAL_PRIORITY: "INTERNATIONAL_PRIORITY",
            ShippingService.FEDEX_INTERNATIONAL_ECONOMY: "INTERNATIONAL_ECONOMY",
            ShippingService.FEDEX_INTERNATIONAL_FIRST: "INTERNATIONAL_FIRST"
        }
    
    async def get_rates(self, request: ShippingRateRequest) -> List[ShippingRate]:
        """Get FedEx shipping rates"""
        # For development/testing, provide mock rates even without API key
        # if not self.api_key:
        #     return []
        
        rates = []
        
        try:
            # Mock rates for development - replace with actual FedEx API calls
            base_rate = sum(pkg.weight for pkg in request.packages) * 22.0  # $22/kg base rate
            
            for service, code in self.services.items():
                multiplier = 1.0
                transit_days = 4
                
                if service == ShippingService.FEDEX_INTERNATIONAL_PRIORITY:
                    multiplier = 1.3
                    transit_days = 2
                elif service == ShippingService.FEDEX_INTERNATIONAL_ECONOMY:
                    multiplier = 0.9
                    transit_days = 5
                elif service == ShippingService.FEDEX_INTERNATIONAL_FIRST:
                    multiplier = 1.6
                    transit_days = 1
                
                rate = ShippingRate(
                    carrier=ShippingCarrier.FEDEX,
                    service=service,
                    service_name=f"FedEx {service.value.replace('_', ' ').title()}",
                    rate=round(base_rate * multiplier, 2),
                    currency="USD",
                    transit_days=transit_days,
                    delivery_date=datetime.now() + timedelta(days=transit_days),
                    includes_customs=True,
                    includes_insurance=False,
                    max_insurance_value=2500.0
                )
                rates.append(rate)
        
        except Exception as e:
            print(f"FedEx API error: {e}")
        
        return rates

class UPSProvider(ShippingServiceProvider):
    """UPS API integration"""
    
    def __init__(self):
        super().__init__()
        self.api_key = os.getenv('UPS_API_KEY')
        self.base_url = "https://wwwcie.ups.com/api" if self.test_mode else "https://onlinetools.ups.com/api"
        self.services = {
            ShippingService.UPS_WORLDWIDE_EXPRESS: "07",
            ShippingService.UPS_WORLDWIDE_EXPEDITED: "08", 
            ShippingService.UPS_WORLDWIDE_SAVER: "65"
        }
    
    async def get_rates(self, request: ShippingRateRequest) -> List[ShippingRate]:
        """Get UPS shipping rates"""
        # For development/testing, provide mock rates even without API key
        # if not self.api_key:
        #     return []
        
        rates = []
        
        try:
            # Mock rates for development - replace with actual UPS API calls
            base_rate = sum(pkg.weight for pkg in request.packages) * 20.0  # $20/kg base rate
            
            for service, code in self.services.items():
                multiplier = 1.0
                transit_days = 4
                
                if service == ShippingService.UPS_WORLDWIDE_EXPRESS:
                    multiplier = 1.4
                    transit_days = 2
                elif service == ShippingService.UPS_WORLDWIDE_EXPEDITED:
                    multiplier = 1.1
                    transit_days = 3
                elif service == ShippingService.UPS_WORLDWIDE_SAVER:
                    multiplier = 0.8
                    transit_days = 5
                
                rate = ShippingRate(
                    carrier=ShippingCarrier.UPS,
                    service=service,
                    service_name=f"UPS {service.value.replace('_', ' ').title()}",
                    rate=round(base_rate * multiplier, 2),
                    currency="USD",
                    transit_days=transit_days,
                    delivery_date=datetime.now() + timedelta(days=transit_days),
                    includes_customs=True,
                    includes_insurance=True,
                    max_insurance_value=10000.0
                )
                rates.append(rate)
        
        except Exception as e:
            print(f"UPS API error: {e}")
        
        return rates

class AramexProvider(ShippingServiceProvider):
    """Aramex API integration"""
    
    def __init__(self):
        super().__init__()
        self.api_key = os.getenv('ARAMEX_API_KEY')
        self.base_url = "https://ws.dev.aramex.net" if self.test_mode else "https://ws.aramex.net"
        self.services = {
            ShippingService.ARAMEX_EXPRESS: "EXP",
            ShippingService.ARAMEX_PRIORITY: "PRI"
        }
    
    async def get_rates(self, request: ShippingRateRequest) -> List[ShippingRate]:
        """Get Aramex shipping rates"""
        if not self.api_key:
            return []
        
        rates = []
        
        try:
            # Mock rates for development - replace with actual Aramex API calls
            base_rate = sum(pkg.weight for pkg in request.packages) * 18.0  # $18/kg base rate
            
            for service, code in self.services.items():
                multiplier = 1.0
                transit_days = 5
                
                if service == ShippingService.ARAMEX_EXPRESS:
                    multiplier = 1.2
                    transit_days = 3
                elif service == ShippingService.ARAMEX_PRIORITY:
                    multiplier = 1.5
                    transit_days = 2
                
                rate = ShippingRate(
                    carrier=ShippingCarrier.ARAMEX,
                    service=service,
                    service_name=f"Aramex {service.value.replace('_', ' ').title()}",
                    rate=round(base_rate * multiplier, 2),
                    currency="USD",
                    transit_days=transit_days,
                    delivery_date=datetime.now() + timedelta(days=transit_days),
                    includes_customs=True,
                    includes_insurance=False,
                    max_insurance_value=1000.0
                )
                rates.append(rate)
        
        except Exception as e:
            print(f"Aramex API error: {e}")
        
        return rates

class ShippingManager:
    """Main shipping manager that coordinates all carriers"""
    
    def __init__(self):
        self.providers = {
            ShippingCarrier.DHL: DHLProvider(),
            ShippingCarrier.FEDEX: FedExProvider(),
            ShippingCarrier.UPS: UPSProvider(),
            ShippingCarrier.ARAMEX: AramexProvider()
        }
    
    async def get_shipping_rates(self, request: ShippingRateRequest) -> ShippingRateResponse:
        """Get shipping rates from all available carriers"""
        
        request_id = str(uuid.uuid4())
        all_rates = []
        errors = []
        
        # Get rates from all providers concurrently
        tasks = []
        for carrier, provider in self.providers.items():
            tasks.append(provider.get_rates(request))
        
        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    carrier_name = list(self.providers.keys())[i].value
                    errors.append(f"{carrier_name}: {str(result)}")
                else:
                    all_rates.extend(result)
        
        except Exception as e:
            errors.append(f"General error: {str(e)}")
        
        # Sort rates by price
        all_rates.sort(key=lambda x: x.rate)
        
        return ShippingRateResponse(
            success=len(all_rates) > 0,
            rates=all_rates,
            errors=errors,
            request_id=request_id,
            timestamp=datetime.now()
        )
    
    async def calculate_customs_duties(self, packages: List[Package], destination_country: str = "US") -> Dict[str, Any]:
        """Calculate estimated customs duties and taxes"""
        
        total_value = sum(pkg.value for pkg in packages)
        
        # US customs duty estimation (simplified)
        duty_rate = 0.05  # 5% average duty rate
        tax_rate = 0.08   # 8% average tax rate
        
        duties = total_value * duty_rate
        taxes = total_value * tax_rate
        total_charges = duties + taxes
        
        return {
            "declared_value": total_value,
            "duty_rate": duty_rate,
            "tax_rate": tax_rate,
            "estimated_duties": round(duties, 2),
            "estimated_taxes": round(taxes, 2),
            "total_charges": round(total_charges, 2),
            "currency": "USD"
        }