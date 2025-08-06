#!/usr/bin/env python3
"""
Debug Profile Issues
"""

import requests
import json

BACKEND_URL = "https://a1b690fb-1be1-4d78-9f30-ea8b3cb33a31.preview.emergentagent.com"

def debug_seller_profile():
    # Login as seller
    login_data = {
        "email": "mary.profileseller@email.com",
        "password": "SecurePass456!"
    }
    
    response = requests.post(f"{BACKEND_URL}/api/auth/login", json=login_data, timeout=10)
    if response.status_code != 200:
        print(f"❌ Seller login failed: {response.text}")
        return
    
    seller_token = response.json()["token"]
    headers = {"Authorization": f"Bearer {seller_token}"}
    
    # Try to get seller profile
    print("🔍 Checking seller profile...")
    response = requests.get(f"{BACKEND_URL}/api/profile/profile", headers=headers, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Seller profile exists: {data['profile']['system_user_id']}")
        
        # Now try to add mobile wallet
        wallet_data = {
            "provider": "MTN",
            "phone_number": "+231-777-123456",
            "account_name": "Mary ProfileSeller"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/profile/profile/mobile-wallet", json=wallet_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            print(f"✅ Mobile wallet added successfully: {response.json()}")
        else:
            print(f"❌ Mobile wallet failed: {response.status_code} - {response.text}")
    else:
        print(f"❌ Seller profile failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    debug_seller_profile()