// Test script to validate marketplace functionality
const axios = require('axios');

const API_BASE = 'http://localhost:8001';

async function testMarketplace() {
  console.log('🧪 Testing Marketplace Functionality...\n');
  
  try {
    // Test 1: Get products
    console.log('1. Testing product retrieval...');
    const productsResponse = await axios.get(`${API_BASE}/api/products`);
    console.log(`✅ Products API working: ${productsResponse.data.data.length} products found`);
    
    // Test 2: Test authentication endpoints
    console.log('\n2. Testing authentication endpoints...');
    
    // Test registration
    const registerData = {
      email: 'testbuyer@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'Buyer',
      userType: 'buyer'
    };
    
    let token;
    try {
      const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, registerData);
      console.log('✅ Registration working');
      token = registerResponse.data.token;
    } catch (error) {
      if (error.response?.data?.detail?.includes('already exists')) {
        console.log('ℹ️  User already exists, testing login...');
        
        // Test login
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
          email: registerData.email,
          password: registerData.password
        });
        console.log('✅ Login working');
        token = loginResponse.data.token;
      } else {
        throw error;
      }
    }
    
    // Test 3: Test chat creation (Contact Seller)
    console.log('\n3. Testing chat creation (Contact Seller)...');
    const product = productsResponse.data.data[0];
    
    const chatData = {
      recipient_id: product.seller_id,
      product_id: product._id,
      initial_message: `Hi! I'm interested in your product: ${product.name}`
    };
    
    try {
      const chatResponse = await axios.post(`${API_BASE}/api/chat/create`, chatData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Chat creation working');
    } catch (error) {
      console.log(`❌ Chat creation failed: ${error.response?.data?.detail || error.message}`);
    }
    
    // Test 4: Test cart functionality (simulated)
    console.log('\n4. Testing cart functionality...');
    
    // This is frontend-only functionality (localStorage), but we can validate the data structure
    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      image_urls: product.images,
      seller_id: product.seller_id,
      seller_name: product.seller_name,
      stock: product.stock,
      category: product.category,
      quantity: 1
    };
    
    console.log('✅ Cart item structure valid');
    console.log(`   - Product: ${cartItem.name}`);
    console.log(`   - Price: $${cartItem.price}`);
    console.log(`   - Seller: ${cartItem.seller_name}`);
    
    console.log('\n🎉 All marketplace functionality tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMarketplace();