import os
import uuid
from datetime import datetime
from typing import Dict, Any, List
from fastapi import HTTPException, status

from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from models.payment import (
    PaymentTransaction, PaymentStatus, PaymentMethod, CartItem, 
    ShippingDetails, CheckoutRequest, PaymentResponse, PAYMENT_PACKAGES
)

class PaymentService:
    """Service for handling payments with Stripe integration"""
    
    def __init__(self):
        self.stripe_api_key = os.getenv('STRIPE_API_KEY')
        if not self.stripe_api_key:
            raise ValueError("STRIPE_API_KEY not found in environment variables")
    
    def _get_stripe_checkout(self, webhook_url: str) -> StripeCheckout:
        """Initialize Stripe checkout with webhook URL"""
        return StripeCheckout(api_key=self.stripe_api_key, webhook_url=webhook_url)
    
    async def calculate_order_total(self, cart_items: List[CartItem], shipping_cost: float) -> Dict[str, float]:
        """Calculate order totals including taxes and fees"""
        
        subtotal = sum(item.total_price for item in cart_items)
        
        # Calculate taxes (simplified - 8% for international orders)
        tax_rate = 0.08
        tax_amount = subtotal * tax_rate
        
        total_amount = subtotal + shipping_cost + tax_amount
        
        return {
            "subtotal": round(subtotal, 2),
            "shipping_cost": round(shipping_cost, 2),
            "tax_amount": round(tax_amount, 2),
            "total_amount": round(total_amount, 2)
        }
    
    async def create_payment_transaction(
        self, 
        database, 
        user_id: str, 
        cart_items: List[CartItem],
        shipping_details: ShippingDetails,
        payment_method: PaymentMethod,
        metadata: Dict[str, Any] = None
    ) -> PaymentTransaction:
        """Create a payment transaction record"""
        
        # Calculate totals
        totals = await self.calculate_order_total(cart_items, shipping_details.cost)
        
        transaction_id = str(uuid.uuid4())
        
        transaction = PaymentTransaction(
            id=transaction_id,
            user_id=user_id,
            payment_method=payment_method,
            amount=totals["total_amount"],
            currency="USD",
            subtotal=totals["subtotal"],
            shipping_cost=totals["shipping_cost"],
            tax_amount=totals["tax_amount"],
            total_amount=totals["total_amount"],
            cart_items=cart_items,
            shipping_details=shipping_details,
            payment_status=PaymentStatus.INITIATED,
            metadata=metadata or {},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Save to database
        await database.payment_transactions.insert_one(transaction.dict())
        
        return transaction
    
    async def create_stripe_checkout_session(
        self,
        database,
        user_id: str,
        checkout_request: CheckoutRequest
    ) -> PaymentResponse:
        """Create Stripe checkout session for cart payment"""
        
        try:
            # Calculate totals
            totals = await self.calculate_order_total(
                checkout_request.cart_items, 
                checkout_request.shipping_details.cost
            )
            
            # Create payment transaction record
            transaction = await self.create_payment_transaction(
                database=database,
                user_id=user_id,
                cart_items=checkout_request.cart_items,
                shipping_details=checkout_request.shipping_details,
                payment_method=checkout_request.payment_method,
                metadata={
                    "buyer_info": checkout_request.buyer_info,
                    "origin_url": checkout_request.origin_url,
                    "order_type": "product_purchase"
                }
            )
            
            # Create Stripe checkout session
            host_url = checkout_request.origin_url
            webhook_url = f"{host_url}/api/payments/webhook/stripe"
            stripe_checkout = self._get_stripe_checkout(webhook_url)
            
            success_url = f"{host_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
            cancel_url = f"{host_url}/checkout"
            
            # Create line items description
            items_description = ", ".join([f"{item.product_name} (x{item.quantity})" for item in checkout_request.cart_items])
            description = f"Liberia2USA Express: {items_description} + Shipping"
            
            session_request = CheckoutSessionRequest(
                amount=totals["total_amount"],
                currency="usd",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    "payment_id": transaction.id,
                    "user_id": user_id,
                    "order_type": "product_purchase",
                    "description": description
                }
            )
            
            session_response: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(session_request)
            
            # Update transaction with session ID
            await database.payment_transactions.update_one(
                {"id": transaction.id},
                {
                    "$set": {
                        "session_id": session_response.session_id,
                        "payment_status": PaymentStatus.PENDING,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return PaymentResponse(
                success=True,
                payment_id=transaction.id,
                checkout_url=session_response.url,
                session_id=session_response.session_id,
                message="Checkout session created successfully"
            )
            
        except Exception as e:
            print(f"Error creating Stripe checkout session: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create checkout session: {str(e)}"
            )
    
    async def create_package_checkout_session(
        self,
        database,
        user_id: str,
        package_id: str,
        origin_url: str,
        metadata: Dict[str, Any] = None
    ) -> PaymentResponse:
        """Create Stripe checkout session for predefined packages"""
        
        try:
            # Validate package exists
            if package_id not in PAYMENT_PACKAGES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid package ID"
                )
            
            package = PAYMENT_PACKAGES[package_id]
            
            # Create simple transaction record for package
            transaction_id = str(uuid.uuid4())
            
            transaction = {
                "id": transaction_id,
                "user_id": user_id,
                "payment_method": PaymentMethod.STRIPE,
                "amount": package.amount,
                "currency": package.currency,
                "package_id": package_id,
                "payment_status": PaymentStatus.INITIATED,
                "metadata": metadata or {},
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await database.payment_transactions.insert_one(transaction)
            
            # Create Stripe checkout session
            webhook_url = f"{origin_url}/api/payments/webhook/stripe"
            stripe_checkout = self._get_stripe_checkout(webhook_url)
            
            success_url = f"{origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
            cancel_url = f"{origin_url}/packages"
            
            session_request = CheckoutSessionRequest(
                amount=package.amount,
                currency=package.currency.lower(),
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    "payment_id": transaction_id,
                    "user_id": user_id,
                    "package_id": package_id,
                    "order_type": "package_purchase"
                }
            )
            
            session_response: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(session_request)
            
            # Update transaction with session ID
            await database.payment_transactions.update_one(
                {"id": transaction_id},
                {
                    "$set": {
                        "session_id": session_response.session_id,
                        "payment_status": PaymentStatus.PENDING,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return PaymentResponse(
                success=True,
                payment_id=transaction_id,
                checkout_url=session_response.url,
                session_id=session_response.session_id,
                message=f"Checkout session created for {package.name}"
            )
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"Error creating package checkout session: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create checkout session: {str(e)}"
            )
    
    async def check_payment_status(
        self,
        database,
        session_id: str
    ) -> Dict[str, Any]:
        """Check payment status via Stripe and update database"""
        
        try:
            # Get transaction from database
            transaction_doc = await database.payment_transactions.find_one({"session_id": session_id})
            if not transaction_doc:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Transaction not found"
                )
            
            # Check status with Stripe
            webhook_url = "temp_webhook_url"  # Not used for status check
            stripe_checkout = self._get_stripe_checkout(webhook_url)
            
            status_response: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
            
            # Update transaction status based on Stripe response
            new_status = None
            if status_response.payment_status == "paid":
                new_status = PaymentStatus.PAID
            elif status_response.status == "expired":
                new_status = PaymentStatus.EXPIRED
            elif status_response.payment_status == "failed":
                new_status = PaymentStatus.FAILED
            
            # Only update if status changed and not already processed
            if new_status and transaction_doc["payment_status"] != new_status.value:
                update_data = {
                    "payment_status": new_status.value,
                    "updated_at": datetime.utcnow()
                }
                
                if new_status == PaymentStatus.PAID:
                    update_data["paid_at"] = datetime.utcnow()
                
                await database.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": update_data}
                )
                
                # Trigger post-payment actions if paid
                if new_status == PaymentStatus.PAID:
                    await self._handle_successful_payment(database, transaction_doc)
            
            return {
                "session_id": session_id,
                "payment_status": status_response.payment_status,
                "status": status_response.status,
                "amount_total": status_response.amount_total,
                "currency": status_response.currency,
                "metadata": status_response.metadata
            }
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"Error checking payment status: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to check payment status: {str(e)}"
            )
    
    async def _handle_successful_payment(self, database, transaction_doc: Dict[str, Any]):
        """Handle post-payment actions (orders, notifications, etc.)"""
        
        try:
            # Create order record
            order_id = str(uuid.uuid4())
            
            order = {
                "id": order_id,
                "payment_id": transaction_doc["id"],
                "user_id": transaction_doc["user_id"],
                "status": "confirmed",
                "total_amount": transaction_doc["total_amount"],
                "currency": transaction_doc["currency"],
                "created_at": datetime.utcnow()
            }
            
            # Add order-specific data based on transaction type
            if "cart_items" in transaction_doc:
                order.update({
                    "cart_items": transaction_doc["cart_items"],
                    "shipping_details": transaction_doc["shipping_details"],
                    "order_type": "product_purchase"
                })
            elif "package_id" in transaction_doc:
                order.update({
                    "package_id": transaction_doc["package_id"],
                    "order_type": "package_purchase"
                })
            
            await database.orders.insert_one(order)
            
            # TODO: Send confirmation emails, update inventory, notify sellers, etc.
            print(f"Order {order_id} created successfully for payment {transaction_doc['id']}")
            
        except Exception as e:
            print(f"Error handling successful payment: {e}")
            # Don't raise exception here to avoid affecting payment confirmation
    
    async def handle_stripe_webhook(self, database, webhook_body: bytes, stripe_signature: str):
        """Handle Stripe webhook events"""
        
        try:
            webhook_url = "temp_webhook_url"  # Not used for webhook handling
            stripe_checkout = self._get_stripe_checkout(webhook_url)
            
            webhook_response = await stripe_checkout.handle_webhook(webhook_body, stripe_signature)
            
            if webhook_response.event_type == "checkout.session.completed":
                session_id = webhook_response.session_id
                
                # Update payment status
                await database.payment_transactions.update_one(
                    {"session_id": session_id},
                    {
                        "$set": {
                            "payment_status": PaymentStatus.PAID.value,
                            "paid_at": datetime.utcnow(),
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                
                # Handle successful payment
                transaction_doc = await database.payment_transactions.find_one({"session_id": session_id})
                if transaction_doc:
                    await self._handle_successful_payment(database, transaction_doc)
            
            return {"processed": True, "event_type": webhook_response.event_type}
            
        except Exception as e:
            print(f"Error handling Stripe webhook: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Webhook processing failed: {str(e)}"
            )

# Global payment service instance
payment_service = PaymentService()