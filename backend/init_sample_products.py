#!/usr/bin/env python3
"""
Initialize sample products for Liberia2USA Express marketplace
"""

import asyncio
import os
import sys
from datetime import datetime
import uuid

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_database

async def create_sample_products():
    """Create diverse sample products for the marketplace"""
    
    database = get_database()
    
    # Wait a bit for database connection
    if database is None:
        print("❌ Database connection failed")
        return
    
    print(f"✅ Connected to database: {database.name}")
    
    # First, create sample sellers
    sample_sellers = [
        {
            "id": str(uuid.uuid4()),
            "firstName": "Josephine",
            "lastName": "Roberts",
            "email": "josephine.roberts@liberia.com",
            "password_hash": "$2b$12$dummy_hash_for_demo",
            "userType": "seller",
            "location": "Monrovia, Liberia",
            "phone": "+231-777-123-001",
            "isVerified": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "firstName": "Marcus",
            "lastName": "Johnson",
            "email": "marcus.johnson@liberia.com",
            "password_hash": "$2b$12$dummy_hash_for_demo",
            "userType": "seller",
            "location": "Gbarnga, Liberia",
            "phone": "+231-777-123-002",
            "isVerified": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "firstName": "Grace",
            "lastName": "Williams",
            "email": "grace.williams@liberia.com",
            "password_hash": "$2b$12$dummy_hash_for_demo",
            "userType": "seller",
            "location": "Buchanan, Liberia",
            "phone": "+231-777-123-003",
            "isVerified": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    # Insert sample sellers
    print("🏪 Creating sample sellers...")
    for seller in sample_sellers:
        existing_seller = await database.users.find_one({"email": seller["email"]})
        if not existing_seller:
            await database.users.insert_one(seller)
            print(f"✅ Created seller: {seller['firstName']} {seller['lastName']}")
        else:
            print(f"ℹ️ Seller already exists: {seller['firstName']} {seller['lastName']}")
    
    # Get seller IDs
    seller_josephine = await database.users.find_one({"email": "josephine.roberts@liberia.com"})
    seller_marcus = await database.users.find_one({"email": "marcus.johnson@liberia.com"})
    seller_grace = await database.users.find_one({"email": "grace.williams@liberia.com"})
    
    # Sample products with diverse categories
    sample_products = [
        # Food & Beverages
        {
            "id": str(uuid.uuid4()),
            "title": "Premium Liberian Coffee Beans",
            "description": "Authentic Liberian coffee beans grown in the highlands of Nimba County. Rich, bold flavor with notes of chocolate and caramel. Perfect for espresso or drip coffee. Sustainably sourced from local farmers.",
            "price": 24.99,
            "category": "Food & Beverages",
            "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"],
            "sellerId": seller_josephine["id"],
            "sellerName": f"{seller_josephine['firstName']} {seller_josephine['lastName']}",
            "location": seller_josephine["location"],
            "shipping": {
                "weight": 1.0,
                "dimensions": {"length": 8, "width": 6, "height": 3}
            },
            "inStock": True,
            "stockQuantity": 25,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        
        # Textiles & Crafts
        {
            "id": str(uuid.uuid4()),
            "title": "Traditional Liberian Kente Cloth",
            "description": "Handwoven traditional Liberian kente cloth featuring authentic patterns passed down through generations. Made by skilled artisans in Lofa County. Perfect for ceremonial wear or decorative purposes. 6 yards length.",
            "price": 89.99,
            "category": "Textiles & Crafts",
            "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"],
            "sellerId": seller_josephine["id"],
            "sellerName": f"{seller_josephine['firstName']} {seller_josephine['lastName']}",
            "location": seller_josephine["location"],
            "shipping": {
                "weight": 0.8,
                "dimensions": {"length": 12, "width": 10, "height": 2}
            },
            "inStock": True,
            "stockQuantity": 15,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        
        # Art & Decoratives
        {
            "id": str(uuid.uuid4()),
            "title": "Wooden African Mask - Poro Society Design",
            "description": "Authentic handcarved wooden mask inspired by traditional Poro society designs. Crafted from sustainable iroko wood by master woodcarver in Bong County. Each mask is unique and tells a story of Liberian culture.",
            "price": 125.00,
            "category": "Art & Decoratives",
            "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"],
            "sellerId": seller_marcus["id"],
            "sellerName": f"{seller_marcus['firstName']} {seller_marcus['lastName']}",
            "location": seller_marcus["location"],
            "shipping": {
                "weight": 2.5,
                "dimensions": {"length": 14, "width": 10, "height": 8}
            },
            "inStock": True,
            "stockQuantity": 8,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        
        # Personal Care
        {
            "id": str(uuid.uuid4()),
            "title": "Organic Shea Butter - Raw & Unrefined",
            "description": "100% pure, organic shea butter sourced directly from women's cooperatives in rural Liberia. Unrefined and chemical-free. Perfect for moisturizing skin and hair. Supports sustainable livelihoods. 8oz jar.",
            "price": 18.50,
            "category": "Personal Care",
            "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"],
            "sellerId": seller_grace["id"],
            "sellerName": f"{seller_grace['firstName']} {seller_grace['lastName']}",
            "location": seller_grace["location"],
            "shipping": {
                "weight": 0.5,
                "dimensions": {"length": 4, "width": 4, "height": 3}
            },
            "inStock": True,
            "stockQuantity": 50,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        
        # Jewelry & Accessories
        {
            "id": str(uuid.uuid4()),
            "title": "Handcrafted Beaded Necklace Set",
            "description": "Beautiful handcrafted necklace and earring set made with traditional Liberian beading techniques. Features vibrant colors representing the Liberian flag. Perfect for special occasions or everyday elegance.",
            "price": 45.00,
            "category": "Jewelry & Accessories",
            "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"],
            "sellerId": seller_grace["id"],
            "sellerName": f"{seller_grace['firstName']} {seller_grace['lastName']}",
            "location": seller_grace["location"],
            "shipping": {
                "weight": 0.3,
                "dimensions": {"length": 6, "width": 4, "height": 2}
            },
            "inStock": True,
            "stockQuantity": 20,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        
        # Spices & Seasonings
        {
            "id": str(uuid.uuid4()),
            "title": "Liberian Palm Nut Soup Spice Mix",
            "description": "Authentic blend of spices used in traditional Liberian palm nut soup. Includes dried fish powder, pepper, and secret family recipe ingredients. Brings the taste of Liberia to your kitchen. 12oz package.",
            "price": 15.99,
            "category": "Food & Beverages",
            "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"],
            "sellerId": seller_josephine["id"],
            "sellerName": f"{seller_josephine['firstName']} {seller_josephine['lastName']}",
            "location": seller_josephine["location"],
            "shipping": {
                "weight": 0.8,
                "dimensions": {"length": 5, "width": 5, "height": 4}
            },
            "inStock": True,
            "stockQuantity": 35,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        
        # Musical Instruments
        {
            "id": str(uuid.uuid4()),
            "title": "Traditional Liberian Talking Drum",
            "description": "Authentic handcrafted talking drum made by traditional drum makers in Grand Gedeh County. Features goatskin head and beautiful carved wooden body. Comes with traditional drumsticks and playing instructions.",
            "price": 85.00,
            "category": "Musical Instruments",
            "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"],
            "sellerId": seller_marcus["id"],
            "sellerName": f"{seller_marcus['firstName']} {seller_marcus['lastName']}",
            "location": seller_marcus["location"],
            "shipping": {
                "weight": 3.2,
                "dimensions": {"length": 16, "width": 12, "height": 12}
            },
            "inStock": True,
            "stockQuantity": 5,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        
        # Home Decor
        {
            "id": str(uuid.uuid4()),
            "title": "Liberian Flag Wooden Wall Art",
            "description": "Handcrafted wooden wall art featuring the Liberian flag design. Made from reclaimed wood and painted with eco-friendly colors. Perfect for showing pride in Liberian heritage. 18x12 inches.",
            "price": 65.00,
            "category": "Home Decor",
            "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"],
            "sellerId": seller_marcus["id"],
            "sellerName": f"{seller_marcus['firstName']} {seller_marcus['lastName']}",
            "location": seller_marcus["location"],
            "shipping": {
                "weight": 1.8,
                "dimensions": {"length": 18, "width": 12, "height": 2}
            },
            "inStock": True,
            "stockQuantity": 12,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        
        # Natural Products
        {
            "id": str(uuid.uuid4()),
            "title": "Dried Bitter Kola (Garcinia Kola)",
            "description": "Premium quality dried bitter kola sourced from the forests of Liberia. Known for its numerous health benefits and traditional medicinal uses. Natural and organic. 1lb package.",
            "price": 32.50,
            "category": "Natural Products",
            "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"],
            "sellerId": seller_grace["id"],
            "sellerName": f"{seller_grace['firstName']} {seller_grace['lastName']}",
            "location": seller_grace["location"],
            "shipping": {
                "weight": 1.0,
                "dimensions": {"length": 8, "width": 6, "height": 4}
            },
            "inStock": True,
            "stockQuantity": 18,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        
        # Fashion
        {
            "id": str(uuid.uuid4()),
            "title": "Liberian Lappu (Tie-dye) Shirt",
            "description": "Traditional Liberian lappu (tie-dye) shirt in vibrant colors. Handmade using traditional dyeing techniques passed down through generations. 100% cotton, comfortable fit, available in multiple sizes.",
            "price": 38.99,
            "category": "Fashion & Clothing",
            "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"],
            "sellerId": seller_josephine["id"],
            "sellerName": f"{seller_josephine['firstName']} {seller_josephine['lastName']}",
            "location": seller_josephine["location"],
            "shipping": {
                "weight": 0.4,
                "dimensions": {"length": 10, "width": 8, "height": 2}
            },
            "inStock": True,
            "stockQuantity": 30,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    # Insert products
    print("\n📦 Creating sample products...")
    products_created = 0
    for product in sample_products:
        existing_product = await database.products.find_one({"title": product["title"]})
        if not existing_product:
            await database.products.insert_one(product)
            products_created += 1
            print(f"✅ Created product: {product['title']} - ${product['price']}")
        else:
            print(f"ℹ️ Product already exists: {product['title']}")
    
    print(f"\n🎉 Sample data creation completed!")
    print(f"📊 Products created: {products_created}")
    print(f"🏪 Sellers available: {len(sample_sellers)}")

async def main():
    """Main function to run the initialization"""
    print("🚀 Initializing Liberia2USA Express Sample Data...")
    print("=" * 50)
    
    try:
        await create_sample_products()
        print("=" * 50)
        print("✅ Sample data initialization completed successfully!")
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)