from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional
from datetime import datetime, timedelta
from database import get_database
from server import get_current_user
from bson import ObjectId
import calendar

router = APIRouter()

@router.get("/seller/analytics", response_model=dict)
async def get_seller_analytics(
    current_user_id: str = Depends(get_current_user),
    period: str = Query("month", description="Analytics period: week, month, year")
):
    """Get comprehensive seller analytics"""
    
    database = get_database()
    
    # Verify user is a seller
    user = await database.users.find_one({"id": current_user_id})
    if not user or user.get("userType") != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can access seller analytics"
        )
    
    # Calculate date range
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=30)  # Default to month
    
    try:
        # Get products data
        products_cursor = database.products.find({"sellerId": current_user_id})
        products = await products_cursor.to_list(length=None)
        
        total_products = len(products)
        active_products = len([p for p in products if p.get("status") == "active"])
        
        # Product views from recent period
        recent_views = 0
        for product in products:
            if product.get("views", 0) > 0:
                recent_views += product.get("views", 0)
        
        # Get orders/transactions data
        transactions_cursor = database.payment_transactions.find({
            "seller_id": current_user_id,
            "created_at": {"$gte": start_date}
        })
        transactions = await transactions_cursor.to_list(length=None)
        
        # Calculate revenue metrics
        total_revenue = sum(t.get("amount", 0) for t in transactions if t.get("status") == "completed")
        total_orders = len([t for t in transactions if t.get("status") == "completed"])
        pending_orders = len([t for t in transactions if t.get("status") == "pending"])
        
        # Get chat statistics
        chats_cursor = database.chats.find({
            "participants": current_user_id,
            "created_at": {"$gte": start_date}
        })
        chats = await chats_cursor.to_list(length=None)
        new_inquiries = len(chats)
        
        # Calculate trends (compare with previous period)
        prev_start = start_date - (now - start_date)
        prev_transactions_cursor = database.payment_transactions.find({
            "seller_id": current_user_id,
            "created_at": {"$gte": prev_start, "$lt": start_date}
        })
        prev_transactions = await prev_transactions_cursor.to_list(length=None)
        prev_revenue = sum(t.get("amount", 0) for t in prev_transactions if t.get("status") == "completed")
        prev_orders = len([t for t in prev_transactions if t.get("status") == "completed"])
        
        revenue_trend = calculate_trend(total_revenue, prev_revenue)
        orders_trend = calculate_trend(total_orders, prev_orders)
        
        # Get top selling products
        product_sales = {}
        for transaction in transactions:
            if transaction.get("status") == "completed":
                for item in transaction.get("items", []):
                    product_id = item.get("product_id")
                    if product_id:
                        if product_id not in product_sales:
                            product_sales[product_id] = {
                                "quantity": 0,
                                "revenue": 0
                            }
                        product_sales[product_id]["quantity"] += item.get("quantity", 0)
                        product_sales[product_id]["revenue"] += item.get("price", 0) * item.get("quantity", 0)
        
        # Get product details for top sellers
        top_products = []
        for product_id, sales_data in sorted(product_sales.items(), key=lambda x: x[1]["revenue"], reverse=True)[:5]:
            product = await database.products.find_one({"id": product_id})
            if product:
                top_products.append({
                    "id": product["id"],
                    "name": product["name"],
                    "quantity_sold": sales_data["quantity"],
                    "revenue": sales_data["revenue"],
                    "image": product.get("images", [{}])[0].get("url") if product.get("images") else None
                })
        
        return {
            "success": True,
            "period": period,
            "analytics": {
                "overview": {
                    "total_products": total_products,
                    "active_products": active_products,
                    "total_revenue": round(total_revenue, 2),
                    "total_orders": total_orders,
                    "pending_orders": pending_orders,
                    "product_views": recent_views,
                    "new_inquiries": new_inquiries
                },
                "trends": {
                    "revenue_trend": revenue_trend,
                    "orders_trend": orders_trend
                },
                "top_products": top_products,
                "revenue_by_day": await get_revenue_by_day(database, current_user_id, start_date, now)
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get seller analytics: {str(e)}"
        )

@router.get("/buyer/analytics", response_model=dict)
async def get_buyer_analytics(
    current_user_id: str = Depends(get_current_user),
    period: str = Query("month", description="Analytics period: week, month, year")
):
    """Get comprehensive buyer analytics"""
    
    database = get_database()
    
    # Verify user is a buyer
    user = await database.users.find_one({"id": current_user_id})
    if not user or user.get("userType") != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can access buyer analytics"
        )
    
    # Calculate date range
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=30)
    
    try:
        # Get purchase history
        transactions_cursor = database.payment_transactions.find({
            "buyer_id": current_user_id,
            "created_at": {"$gte": start_date}
        })
        transactions = await transactions_cursor.to_list(length=None)
        
        total_spent = sum(t.get("amount", 0) for t in transactions if t.get("status") == "completed")
        total_orders = len([t for t in transactions if t.get("status") == "completed"])
        pending_orders = len([t for t in transactions if t.get("status") == "pending"])
        cancelled_orders = len([t for t in transactions if t.get("status") == "cancelled"])
        
        # Calculate average order value
        avg_order_value = total_spent / total_orders if total_orders > 0 else 0
        
        # Get favorite categories
        category_purchases = {}
        total_items = 0
        for transaction in transactions:
            if transaction.get("status") == "completed":
                for item in transaction.get("items", []):
                    total_items += item.get("quantity", 0)
                    category = item.get("category", "Other")
                    category_purchases[category] = category_purchases.get(category, 0) + item.get("quantity", 0)
        
        favorite_categories = sorted(category_purchases.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Get shipping analytics
        shipping_costs = sum(t.get("shipping_cost", 0) for t in transactions if t.get("status") == "completed")
        
        # Get savings (if any discount data exists)
        total_savings = sum(t.get("discount_amount", 0) for t in transactions if t.get("status") == "completed")
        
        # Calculate trends
        prev_start = start_date - (now - start_date)
        prev_transactions_cursor = database.payment_transactions.find({
            "buyer_id": current_user_id,
            "created_at": {"$gte": prev_start, "$lt": start_date}
        })
        prev_transactions = await prev_transactions_cursor.to_list(length=None)
        prev_spent = sum(t.get("amount", 0) for t in prev_transactions if t.get("status") == "completed")
        prev_orders = len([t for t in prev_transactions if t.get("status") == "completed"])
        
        spending_trend = calculate_trend(total_spent, prev_spent)
        orders_trend = calculate_trend(total_orders, prev_orders)
        
        # Get recent purchases
        recent_purchases = []
        for transaction in sorted(transactions, key=lambda x: x.get("created_at", datetime.utcnow()), reverse=True)[:5]:
            if transaction.get("status") == "completed":
                recent_purchases.append({
                    "id": transaction["id"],
                    "amount": transaction.get("amount", 0),
                    "items_count": len(transaction.get("items", [])),
                    "date": transaction.get("created_at").isoformat() if transaction.get("created_at") else None,
                    "status": transaction.get("status")
                })
        
        return {
            "success": True,
            "period": period,
            "analytics": {
                "overview": {
                    "total_spent": round(total_spent, 2),
                    "total_orders": total_orders,
                    "pending_orders": pending_orders,
                    "cancelled_orders": cancelled_orders,
                    "avg_order_value": round(avg_order_value, 2),
                    "total_items": total_items,
                    "shipping_costs": round(shipping_costs, 2),
                    "total_savings": round(total_savings, 2)
                },
                "trends": {
                    "spending_trend": spending_trend,
                    "orders_trend": orders_trend
                },
                "favorite_categories": favorite_categories,
                "recent_purchases": recent_purchases,
                "spending_by_day": await get_spending_by_day(database, current_user_id, start_date, now)
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get buyer analytics: {str(e)}"
        )

async def get_revenue_by_day(database, seller_id: str, start_date: datetime, end_date: datetime):
    """Get daily revenue breakdown for seller"""
    try:
        pipeline = [
            {
                "$match": {
                    "seller_id": seller_id,
                    "status": "completed",
                    "created_at": {"$gte": start_date, "$lte": end_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$created_at"},
                        "month": {"$month": "$created_at"},
                        "day": {"$dayOfMonth": "$created_at"}
                    },
                    "revenue": {"$sum": "$amount"}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        result = []
        async for doc in database.payment_transactions.aggregate(pipeline):
            date_str = f"{doc['_id']['year']}-{doc['_id']['month']:02d}-{doc['_id']['day']:02d}"
            result.append({
                "date": date_str,
                "revenue": round(doc["revenue"], 2)
            })
        
        return result
    except Exception:
        return []

async def get_spending_by_day(database, buyer_id: str, start_date: datetime, end_date: datetime):
    """Get daily spending breakdown for buyer"""
    try:
        pipeline = [
            {
                "$match": {
                    "buyer_id": buyer_id,
                    "status": "completed",
                    "created_at": {"$gte": start_date, "$lte": end_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$created_at"},
                        "month": {"$month": "$created_at"},
                        "day": {"$dayOfMonth": "$created_at"}
                    },
                    "amount": {"$sum": "$amount"}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        result = []
        async for doc in database.payment_transactions.aggregate(pipeline):
            date_str = f"{doc['_id']['year']}-{doc['_id']['month']:02d}-{doc['_id']['day']:02d}"
            result.append({
                "date": date_str,
                "amount": round(doc["amount"], 2)
            })
        
        return result
    except Exception:
        return []

def calculate_trend(current: float, previous: float) -> dict:
    """Calculate trend percentage and direction"""
    if previous == 0:
        if current > 0:
            return {"percentage": 100, "direction": "up"}
        else:
            return {"percentage": 0, "direction": "neutral"}
    
    change = ((current - previous) / previous) * 100
    return {
        "percentage": round(abs(change), 1),
        "direction": "up" if change > 0 else "down" if change < 0 else "neutral"
    }

@router.get("/products/management", response_model=dict)
async def get_product_management(
    current_user_id: str = Depends(get_current_user),
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0)
):
    """Get products for management (seller only)"""
    
    database = get_database()
    
    # Verify user is a seller
    user = await database.users.find_one({"id": current_user_id})
    if not user or user.get("userType") != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can access product management"
        )
    
    try:
        # Build query
        query = {"sellerId": current_user_id}
        if status:
            query["status"] = status
        if category:
            query["category"] = category
        
        # Get products with pagination
        products_cursor = database.products.find(query).skip(skip).limit(limit)
        products = await products_cursor.to_list(length=limit)
        
        # Get total count
        total_count = await database.products.count_documents(query)
        
        # Enhance products with sales data
        enhanced_products = []
        for product in products:
            # Get sales data for this product
            sales_cursor = database.payment_transactions.find({
                "items.product_id": product["id"],
                "status": "completed"
            })
            sales_transactions = await sales_cursor.to_list(length=None)
            
            total_sold = 0
            total_revenue = 0
            for transaction in sales_transactions:
                for item in transaction.get("items", []):
                    if item.get("product_id") == product["id"]:
                        total_sold += item.get("quantity", 0)
                        total_revenue += item.get("price", 0) * item.get("quantity", 0)
            
            enhanced_products.append({
                **product,
                "total_sold": total_sold,
                "total_revenue": round(total_revenue, 2),
                "stock_status": "low" if product.get("stock", 0) < 5 else "good"
            })
        
        return {
            "success": True,
            "products": enhanced_products,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "skip": skip,
                "has_more": skip + limit < total_count
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get product management data: {str(e)}"
        )

@router.put("/products/{product_id}/status", response_model=dict)
async def update_product_status(
    product_id: str,
    status: dict,
    current_user_id: str = Depends(get_current_user)
):
    """Update product status (seller only)"""
    
    database = get_database()
    
    # Verify ownership
    product = await database.products.find_one({"id": product_id, "sellerId": current_user_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or access denied"
        )
    
    try:
        new_status = status.get("status")
        if new_status not in ["active", "inactive", "out_of_stock"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status. Must be: active, inactive, or out_of_stock"
            )
        
        await database.products.update_one(
            {"id": product_id},
            {
                "$set": {
                    "status": new_status,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        return {
            "success": True,
            "message": f"Product status updated to {new_status}"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update product status: {str(e)}"
        )