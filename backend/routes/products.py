from fastapi import APIRouter, HTTPException, status, Depends, Query, File, UploadFile
from typing import List, Optional
from datetime import datetime
import uuid
import base64
from models.product import ProductCreate, ProductUpdate, ProductResponse
from database import get_database
from server import get_current_user

router = APIRouter()

@router.post("/", response_model=dict)
async def create_product(
    product_data: ProductCreate,
    current_user_id: str = Depends(get_current_user)
):
    """Create a new product (sellers only)"""
    
    database = get_database()
    
    # Verify user is a seller
    user = await database.users.find_one({"id": current_user_id})
    if not user or user["userType"] != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can create products"
        )
    
    # Create product document
    product_doc = {
        "id": str(uuid.uuid4()),
        "name": product_data.name,
        "description": product_data.description,
        "price": product_data.price,
        "category": product_data.category,
        "images": product_data.images,
        "video": product_data.video,
        "stock": product_data.stock,
        "tags": product_data.tags,
        "weight": product_data.weight,
        "dimensions": product_data.dimensions,
        "seller_id": current_user_id,
        "seller_name": f"{user['firstName']} {user['lastName']}",
        "views": 0,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert product into database
    await database.products.insert_one(product_doc)
    
    # Return response
    product_response = ProductResponse(
        id=product_doc["id"],
        name=product_doc["name"],
        description=product_doc["description"],
        price=product_doc["price"],
        category=product_doc["category"],
        images=product_doc["images"],
        video=product_doc["video"],
        stock=product_doc["stock"],
        tags=product_doc["tags"],
        weight=product_doc["weight"],
        dimensions=product_doc["dimensions"],
        seller_id=product_doc["seller_id"],
        seller_name=product_doc["seller_name"],
        views=product_doc["views"],
        is_active=product_doc["is_active"],
        created_at=product_doc["created_at"],
        updated_at=product_doc["updated_at"]
    )
    
    return {
        "success": True,
        "message": "Product created successfully",
        "product": product_response.dict()
    }

@router.get("/", response_model=dict)
async def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    sort: Optional[str] = Query("created_at"),
    order: Optional[str] = Query("desc")
):
    """Get products with pagination and filtering"""
    
    database = get_database()
    
    # Build query
    query = {"is_active": True}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$in": [search]}}
        ]
    
    if category:
        query["category"] = category
    
    # Build sort
    sort_dict = {}
    if sort in ["created_at", "price", "views", "name"]:
        sort_dict[sort] = -1 if order == "desc" else 1
    else:
        sort_dict["created_at"] = -1
    
    # Calculate skip
    skip = (page - 1) * limit
    
    # Get products
    products_cursor = database.products.find(query).sort(list(sort_dict.items())).skip(skip).limit(limit)
    
    products = []
    async for product in products_cursor:
        product_response = ProductResponse(
            id=product["id"],
            name=product["name"],
            description=product["description"],
            price=product["price"],
            category=product["category"],
            images=product["images"],
            video=product.get("video"),
            stock=product["stock"],
            tags=product["tags"],
            weight=product.get("weight"),
            dimensions=product.get("dimensions"),
            seller_id=product["seller_id"],
            seller_name=product["seller_name"],
            views=product["views"],
            is_active=product["is_active"],
            created_at=product["created_at"],
            updated_at=product["updated_at"]
        )
        products.append(product_response.dict())
    
    # Get total count for pagination
    total_count = await database.products.count_documents(query)
    total_pages = (total_count + limit - 1) // limit
    
    return {
        "success": True,
        "data": products,
        "pagination": {
            "currentPage": page,
            "totalPages": total_pages,
            "totalCount": total_count,
            "hasNextPage": page < total_pages,
            "hasPrevPage": page > 1
        }
    }

@router.get("/{product_id}", response_model=dict)
async def get_product(product_id: str):
    """Get a single product by ID"""
    
    database = get_database()
    
    product = await database.products.find_one({"id": product_id, "is_active": True})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Increment view count
    await database.products.update_one(
        {"id": product_id},
        {"$inc": {"views": 1}}
    )
    
    product_response = ProductResponse(
        id=product["id"],
        name=product["name"],
        description=product["description"],
        price=product["price"],
        category=product["category"],
        images=product["images"],
        video=product.get("video"),
        stock=product["stock"],
        tags=product["tags"],
        weight=product.get("weight"),
        dimensions=product.get("dimensions"),
        seller_id=product["seller_id"],
        seller_name=product["seller_name"],
        views=product["views"] + 1,  # Include the incremented view
        is_active=product["is_active"],
        created_at=product["created_at"],
        updated_at=product["updated_at"]
    )
    
    return {
        "success": True,
        "product": product_response.dict()
    }

@router.get("/seller/my-products", response_model=dict)
async def get_seller_products(
    current_user_id: str = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50)
):
    """Get products for the current seller"""
    
    database = get_database()
    
    # Verify user is a seller
    user = await database.users.find_one({"id": current_user_id})
    if not user or user["userType"] != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can access this endpoint"
        )
    
    # Calculate skip
    skip = (page - 1) * limit
    
    # Get seller's products
    products_cursor = database.products.find(
        {"seller_id": current_user_id}
    ).sort([("created_at", -1)]).skip(skip).limit(limit)
    
    products = []
    async for product in products_cursor:
        product_response = ProductResponse(
            id=product["id"],
            name=product["name"],
            description=product["description"],
            price=product["price"],
            category=product["category"],
            images=product["images"],
            video=product.get("video"),
            stock=product["stock"],
            tags=product["tags"],
            weight=product.get("weight"),
            dimensions=product.get("dimensions"),
            seller_id=product["seller_id"],
            seller_name=product["seller_name"],
            views=product["views"],
            is_active=product["is_active"],
            created_at=product["created_at"],
            updated_at=product["updated_at"]
        )
        products.append(product_response.dict())
    
    # Get total count
    total_count = await database.products.count_documents({"seller_id": current_user_id})
    total_pages = (total_count + limit - 1) // limit
    
    return {
        "success": True,
        "data": products,
        "pagination": {
            "currentPage": page,
            "totalPages": total_pages,
            "totalCount": total_count,
            "hasNextPage": page < total_pages,
            "hasPrevPage": page > 1
        }
    }

@router.post("/upload-media", response_model=dict)
async def upload_media(
    files: List[UploadFile] = File(...),
    current_user_id: str = Depends(get_current_user)
):
    """Upload images and video for products"""
    
    database = get_database()
    
    # Verify user is a seller
    user = await database.users.find_one({"id": current_user_id})
    if not user or user["userType"] != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can upload media"
        )
    
    uploaded_files = []
    images = []
    video = None
    
    for file in files:
        # Validate file type
        if not file.content_type:
            continue
            
        if file.content_type.startswith('image/'):
            if len(images) >= 10:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum 10 images allowed"
                )
            
            # Read and encode image
            content = await file.read()
            if len(content) > 10 * 1024 * 1024:  # 10MB limit per image
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Image {file.filename} is too large (max 10MB)"
                )
            
            encoded_image = base64.b64encode(content).decode('utf-8')
            image_data = f"data:{file.content_type};base64,{encoded_image}"
            images.append(image_data)
            
            uploaded_files.append({
                "filename": file.filename,
                "type": "image",
                "size": len(content),
                "content_type": file.content_type
            })
            
        elif file.content_type.startswith('video/'):
            if video:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only one video allowed per product"
                )
            
            # Read and encode video
            content = await file.read()
            if len(content) > 100 * 1024 * 1024:  # 100MB limit for video
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Video file is too large (max 100MB)"
                )
            
            encoded_video = base64.b64encode(content).decode('utf-8')
            video = f"data:{file.content_type};base64,{encoded_video}"
            
            uploaded_files.append({
                "filename": file.filename,
                "type": "video",
                "size": len(content),
                "content_type": file.content_type
            })
    
    return {
        "success": True,
        "message": "Media uploaded successfully",
        "images": images,
        "video": video,
        "uploaded_files": uploaded_files
    }