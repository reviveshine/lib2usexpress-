from fastapi import APIRouter, HTTPException, status, Depends, Request
from typing import List, Dict, Any
import json
from datetime import datetime

from models.payment import (
    CheckoutRequest, PaymentResponse, PaymentStatus, CartItem, 
    ShippingDetails, PAYMENT_PACKAGES, PaymentPackage
)
from services.payment_service import payment_service
from database import get_database
from server import get_current_user

router = APIRouter()

@router.post("/checkout/session", response_model=PaymentResponse)
async def create_checkout_session(
    checkout_request: CheckoutRequest,
    current_user_id: str = Depends(get_current_user)
):
    """Create Stripe checkout session for cart payment"""
    
    try:
        database = get_database()
        
        # Validate cart items (ensure user owns the items being purchased)
        for item in checkout_request.cart_items:
            # In a real scenario, validate that products exist and prices are correct
            if item.quantity <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid quantity for product {item.product_name}"
                )
        
        # Create checkout session
        payment_response = await payment_service.create_stripe_checkout_session(
            database=database,
            user_id=current_user_id,
            checkout_request=checkout_request
        )
        
        return payment_response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {str(e)}"
        )

@router.post("/package/checkout", response_model=PaymentResponse)
async def create_package_checkout(
    package_id: str,
    origin_url: str,
    current_user_id: str = Depends(get_current_user)
):
    """Create Stripe checkout session for predefined packages"""
    
    try:
        database = get_database()
        
        payment_response = await payment_service.create_package_checkout_session(
            database=database,
            user_id=current_user_id,
            package_id=package_id,
            origin_url=origin_url,
            metadata={"source": "package_checkout"}
        )
        
        return payment_response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create package checkout: {str(e)}"
        )

@router.get("/status/{session_id}", response_model=dict)
async def check_payment_status(
    session_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Check payment status for a Stripe session"""
    
    try:
        database = get_database()
        
        # Verify user owns this payment session
        transaction = await database.payment_transactions.find_one({
            "session_id": session_id,
            "user_id": current_user_id
        })
        
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment session not found or access denied"
            )
        
        status_result = await payment_service.check_payment_status(database, session_id)
        
        return {
            "success": True,
            "payment_status": status_result["payment_status"],
            "session_status": status_result["status"],
            "amount": status_result["amount_total"] / 100,  # Convert from cents
            "currency": status_result["currency"],
            "metadata": status_result["metadata"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check payment status: {str(e)}"
        )

@router.get("/transactions", response_model=dict)
async def get_user_transactions(
    current_user_id: str = Depends(get_current_user),
    limit: int = 20,
    skip: int = 0
):
    """Get payment transactions for current user"""
    
    try:
        database = get_database()
        
        # Get user's transactions
        transactions_cursor = database.payment_transactions.find(
            {"user_id": current_user_id},
            sort=[("created_at", -1)]
        ).skip(skip).limit(limit)
        
        transactions = []
        async for transaction in transactions_cursor:
            # Remove sensitive data
            safe_transaction = {
                "id": transaction["id"],
                "amount": transaction["amount"],
                "currency": transaction["currency"],
                "payment_status": transaction["payment_status"],
                "payment_method": transaction["payment_method"],
                "created_at": transaction["created_at"],
                "updated_at": transaction["updated_at"]
            }
            
            # Add order-specific data
            if "cart_items" in transaction:
                safe_transaction["order_type"] = "product_purchase"
                safe_transaction["items_count"] = len(transaction["cart_items"])
            elif "package_id" in transaction:
                safe_transaction["order_type"] = "package_purchase"
                safe_transaction["package_id"] = transaction["package_id"]
            
            transactions.append(safe_transaction)
        
        # Get total count
        total_count = await database.payment_transactions.count_documents({
            "user_id": current_user_id
        })
        
        return {
            "success": True,
            "transactions": transactions,
            "total_count": total_count,
            "has_more": skip + len(transactions) < total_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transactions: {str(e)}"
        )

@router.get("/packages", response_model=dict)
async def get_payment_packages():
    """Get available payment packages"""
    
    packages = []
    for package_id, package in PAYMENT_PACKAGES.items():
        packages.append({
            "package_id": package_id,
            "name": package.name,
            "description": package.description,
            "amount": package.amount,
            "currency": package.currency,
            "features": package.features
        })
    
    return {
        "success": True,
        "packages": packages
    }

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    
    try:
        database = get_database()
        
        # Get raw body and Stripe signature
        body = await request.body()
        stripe_signature = request.headers.get("Stripe-Signature")
        
        if not stripe_signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Stripe signature"
            )
        
        result = await payment_service.handle_stripe_webhook(
            database=database,
            webhook_body=body,
            stripe_signature=stripe_signature
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Webhook error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook processing failed: {str(e)}"
        )

@router.post("/calculate-total", response_model=dict)
async def calculate_order_total(
    cart_items: List[CartItem],
    shipping_cost: float,
    current_user_id: str = Depends(get_current_user)
):
    """Calculate order total including taxes and fees"""
    
    try:
        totals = await payment_service.calculate_order_total(cart_items, shipping_cost)
        
        return {
            "success": True,
            "breakdown": totals,
            "currency": "USD"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate total: {str(e)}"
        )

@router.get("/orders", response_model=dict)
async def get_user_orders(
    current_user_id: str = Depends(get_current_user),
    limit: int = 20,
    skip: int = 0
):
    """Get orders for current user"""
    
    try:
        database = get_database()
        
        # Get user's orders
        orders_cursor = database.orders.find(
            {"user_id": current_user_id},
            sort=[("created_at", -1)]
        ).skip(skip).limit(limit)
        
        orders = []
        async for order in orders_cursor:
            orders.append(order)
        
        # Get total count
        total_count = await database.orders.count_documents({
            "user_id": current_user_id
        })
        
        return {
            "success": True,
            "orders": orders,
            "total_count": total_count,
            "has_more": skip + len(orders) < total_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get orders: {str(e)}"
        )

@router.get("/order/{order_id}", response_model=dict)
async def get_order_details(
    order_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Get detailed order information"""
    
    try:
        database = get_database()
        
        order = await database.orders.find_one({
            "id": order_id,
            "user_id": current_user_id
        })
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found or access denied"
            )
        
        # Get related payment transaction
        payment = await database.payment_transactions.find_one({
            "id": order["payment_id"]
        })
        
        order_details = {
            "order": order,
            "payment": {
                "amount": payment.get("amount"),
                "currency": payment.get("currency"), 
                "payment_status": payment.get("payment_status"),
                "paid_at": payment.get("paid_at")
            } if payment else None
        }
        
        return {
            "success": True,
            "order_details": order_details
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get order details: {str(e)}"
        )