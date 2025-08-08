#!/usr/bin/env python3
import requests
import uuid

base_url = 'https://9e2f71ee-c51a-4355-9095-21aac0960698.preview.emergentagent.com'

# Register a new buyer
buyer_data = {
    'firstName': 'Test',
    'lastName': 'Buyer',
    'email': f'testbuyer{uuid.uuid4().hex[:8]}@usa.com',
    'password': 'TestPass123!',
    'userType': 'buyer',
    'location': 'New York, USA',
    'phone': '+1-555-0123'
}

print('🔐 Registering new buyer...')
response = requests.post(f'{base_url}/api/auth/register', json=buyer_data, timeout=10)
print(f'Buyer registration: {response.status_code}')
if response.status_code == 200:
    data = response.json()
    if data.get('success'):
        buyer_token = data.get('access_token')
        print('✅ Buyer registered successfully')
        
        # Test buyer analytics
        headers = {'Authorization': f'Bearer {buyer_token}'}
        print('\n📊 Testing Buyer Analytics...')
        
        for period in ['week', 'month', 'year']:
            response = requests.get(f'{base_url}/api/dashboard/buyer/analytics?period={period}', headers=headers, timeout=10)
            print(f'Buyer Analytics ({period}): {response.status_code}')
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    overview = data['analytics']['overview']
                    print(f'  ✅ {period.title()} - Spent: ${overview["total_spent"]}, Orders: {overview["total_orders"]}')
                else:
                    print(f'  ❌ Invalid response: {data}')
            else:
                print(f'  ❌ Failed: {response.text}')
        
        # Test access control
        print('\n🔒 Testing Access Control...')
        response = requests.get(f'{base_url}/api/dashboard/seller/analytics', headers=headers, timeout=10)
        print(f'Buyer accessing seller analytics: {response.status_code}')
        if response.status_code == 403:
            print('  ✅ Access control working - buyer denied seller analytics')
        else:
            print(f'  ❌ Access control failed: {response.text}')
            
        # Test chunked upload
        print('\n📤 Testing Chunked Upload...')
        files = {'file': ('test_chunk', b'test_data', 'application/octet-stream')}
        data = {
            'chunk_index': 0,
            'total_chunks': 1,
            'file_hash': 'test_hash_123',
            'filename': 'test.png'
        }
        response = requests.post(f'{base_url}/api/upload/profile-picture-chunk', files=files, data=data, headers=headers, timeout=10)
        print(f'Chunked upload with auth: {response.status_code}')
        if response.status_code == 200:
            resp_data = response.json()
            if resp_data.get('success'):
                print('  ✅ Chunked upload working with authentication')
            else:
                print(f'  ❌ Upload failed: {resp_data}')
        else:
            print(f'  ❌ Upload failed: {response.text}')
    else:
        print(f'❌ Registration failed: {data}')
else:
    print(f'❌ Registration failed: {response.text}')

# Try to register a seller
print('\n🔐 Registering new seller...')
seller_data = {
    'firstName': 'Test',
    'lastName': 'Seller',
    'email': f'testseller{uuid.uuid4().hex[:8]}@liberia.com',
    'password': 'TestPass123!',
    'userType': 'seller',
    'location': 'Monrovia, Liberia',
    'phone': '+231-555-0123'
}

response = requests.post(f'{base_url}/api/auth/register', json=seller_data, timeout=10)
print(f'Seller registration: {response.status_code}')
if response.status_code == 200:
    data = response.json()
    if data.get('success'):
        seller_token = data.get('access_token')
        print('✅ Seller registered successfully')
        
        # Test seller analytics
        headers = {'Authorization': f'Bearer {seller_token}'}
        print('\n📊 Testing Seller Analytics...')
        
        response = requests.get(f'{base_url}/api/dashboard/seller/analytics?period=month', headers=headers, timeout=10)
        print(f'Seller Analytics: {response.status_code}')
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                overview = data['analytics']['overview']
                print(f'  ✅ Seller analytics - Products: {overview["total_products"]}, Revenue: ${overview["total_revenue"]}')
            else:
                print(f'  ❌ Invalid response: {data}')
        else:
            print(f'  ❌ Failed: {response.text}')
        
        # Test product management
        print('\n📦 Testing Product Management...')
        response = requests.get(f'{base_url}/api/dashboard/products/management', headers=headers, timeout=10)
        print(f'Product Management: {response.status_code}')
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                products = data['products']
                pagination = data['pagination']
                print(f'  ✅ Product management - {len(products)} products, Total: {pagination["total"]}')
            else:
                print(f'  ❌ Invalid response: {data}')
        else:
            print(f'  ❌ Failed: {response.text}')
    else:
        print(f'❌ Seller registration failed: {data}')
else:
    print(f'❌ Seller registration failed: {response.text}')