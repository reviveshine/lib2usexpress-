#!/usr/bin/env python3
import asyncio
import sys
import os
sys.path.append('/app/backend')

from services.shipping_service import ShippingManager
from models.shipping import ShippingRateRequest, Address, Package

async def test_shipping():
    manager = ShippingManager()
    
    origin = Address(
        name='Test Seller',
        address_line_1='123 Main St',
        city='Monrovia',
        state='Montserrado',
        postal_code='1000',
        country='LR'
    )
    
    destination = Address(
        name='Test Buyer',
        address_line_1='456 Oak Ave',
        city='New York',
        state='New York',
        postal_code='10001',
        country='US'
    )
    
    package = Package(
        length=20.0,
        width=15.0,
        height=10.0,
        weight=1.0,
        value=100.0,
        description='Test package'
    )
    
    request = ShippingRateRequest(
        origin=origin,
        destination=destination,
        packages=[package]
    )
    
    try:
        response = await manager.get_shipping_rates(request)
        print(f'Success: {response.success}')
        print(f'Rates count: {len(response.rates)}')
        print(f'Errors: {response.errors}')
        for rate in response.rates:
            print(f'  {rate.carrier}: {rate.service_name} - ${rate.rate}')
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_shipping())