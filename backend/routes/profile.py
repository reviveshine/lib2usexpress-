from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
import uuid
from models.profile import (
    UserProfile, UpdateProfileRequest, AddIdentityDocumentRequest,
    ProfileResponse, AddressModel, ShippingAddressModel, 
    MobileMoneyWallet, BankAccount, IdentityDocument, UpdateProfilePictureRequest
)
from database import get_database
from server import get_current_user

router = APIRouter()

@router.get("/profile", response_model=dict)
async def get_user_profile(current_user_id: str = Depends(get_current_user)):
    """Get user's complete profile"""
    
    database = get_database()
    
    # Get user basic info
    user = await database.users.find_one({"id": current_user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get or create profile
    profile = await database.user_profiles.find_one({"user_id": current_user_id})
    
    if not profile:
        # Generate system user ID
        system_user_id = f"LIB2USA-{str(uuid.uuid4())[:8].upper()}"
        
        # Create default profile
        new_profile = UserProfile(
            user_id=current_user_id,
            system_user_id=system_user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        await database.user_profiles.insert_one(new_profile.dict())
        profile = new_profile.dict()
    
    return {
        "success": True,
        "profile": profile,
        "user": {
            "firstName": user["firstName"],
            "lastName": user["lastName"],
            "email": user["email"],
            "userType": user["userType"],
            "location": user["location"],
            "phone": user.get("phone"),
            "isVerified": user["isVerified"],
            "createdAt": user["createdAt"]
        }
    }

@router.post("/profile/address", response_model=dict)
async def add_address(
    address: AddressModel,
    current_user_id: str = Depends(get_current_user)
):
    """Add new address to user profile"""
    
    database = get_database()
    
    # Get profile
    profile = await database.user_profiles.find_one({"user_id": current_user_id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Generate ID for address
    address.id = str(uuid.uuid4())
    
    # If this is the first address, make it default
    if not profile.get("addresses"):
        address.is_default = True
    
    # Update profile
    await database.user_profiles.update_one(
        {"user_id": current_user_id},
        {
            "$push": {"addresses": address.dict()},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return {
        "success": True,
        "message": "Address added successfully",
        "address": address.dict()
    }

@router.post("/profile/shipping-address", response_model=dict)
async def add_shipping_address(
    address: ShippingAddressModel,
    current_user_id: str = Depends(get_current_user)
):
    """Add shipping address to user profile"""
    
    database = get_database()
    
    # Get profile
    profile = await database.user_profiles.find_one({"user_id": current_user_id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Generate ID for address
    address.id = str(uuid.uuid4())
    
    # If this is the first shipping address, make it default
    if not profile.get("shipping_addresses"):
        address.is_default = True
    
    # Update profile
    await database.user_profiles.update_one(
        {"user_id": current_user_id},
        {
            "$push": {"shipping_addresses": address.dict()},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return {
        "success": True,
        "message": "Shipping address added successfully",
        "address": address.dict()
    }

@router.post("/profile/mobile-wallet", response_model=dict)
async def add_mobile_wallet(
    wallet: MobileMoneyWallet,
    current_user_id: str = Depends(get_current_user)
):
    """Add mobile money wallet to user profile"""
    
    database = get_database()
    
    # Get profile
    profile = await database.user_profiles.find_one({"user_id": current_user_id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Generate ID for wallet
    wallet.id = str(uuid.uuid4())
    
    # If this is the first wallet, make it default
    if not profile.get("mobile_money_wallets"):
        wallet.is_default = True
    
    # Update profile
    await database.user_profiles.update_one(
        {"user_id": current_user_id},
        {
            "$push": {"mobile_money_wallets": wallet.dict()},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return {
        "success": True,
        "message": "Mobile wallet added successfully",
        "wallet": wallet.dict()
    }

@router.post("/profile/bank-account", response_model=dict)
async def add_bank_account(
    bank_account: BankAccount,
    current_user_id: str = Depends(get_current_user)
):
    """Add bank account to user profile"""
    
    database = get_database()
    
    # Get profile
    profile = await database.user_profiles.find_one({"user_id": current_user_id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Generate ID for bank account
    bank_account.id = str(uuid.uuid4())
    
    # If this is the first bank account, make it default
    if not profile.get("bank_accounts"):
        bank_account.is_default = True
    
    # Update profile
    await database.user_profiles.update_one(
        {"user_id": current_user_id},
        {
            "$push": {"bank_accounts": bank_account.dict()},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return {
        "success": True,
        "message": "Bank account added successfully",
        "bank_account": bank_account.dict()
    }

@router.post("/profile/identity-document", response_model=dict)
async def add_identity_document(
    document: AddIdentityDocumentRequest,
    current_user_id: str = Depends(get_current_user)
):
    """Add identity document for verification"""
    
    database = get_database()
    
    # Get profile
    profile = await database.user_profiles.find_one({"user_id": current_user_id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Create identity document
    identity_doc = IdentityDocument(
        id=str(uuid.uuid4()),
        document_type=document.document_type,
        document_number=document.document_number,
        issuing_authority=document.issuing_authority,
        expiry_date=document.expiry_date,
        document_image=document.document_image,
        verification_status="pending"
    )
    
    # Update profile
    await database.user_profiles.update_one(
        {"user_id": current_user_id},
        {
            "$push": {"identity_documents": identity_doc.dict()},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return {
        "success": True,
        "message": "Identity document uploaded successfully. Verification is pending.",
        "document": identity_doc.dict()
    }

@router.delete("/profile/address/{address_id}", response_model=dict)
async def delete_address(
    address_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Delete an address"""
    
    database = get_database()
    
    # Remove address from profile
    result = await database.user_profiles.update_one(
        {"user_id": current_user_id},
        {
            "$pull": {"addresses": {"id": address_id}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    
    return {
        "success": True,
        "message": "Address deleted successfully"
    }

@router.delete("/profile/shipping-address/{address_id}", response_model=dict)
async def delete_shipping_address(
    address_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Delete a shipping address"""
    
    database = get_database()
    
    # Remove shipping address from profile
    result = await database.user_profiles.update_one(
        {"user_id": current_user_id},
        {
            "$pull": {"shipping_addresses": {"id": address_id}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping address not found"
        )
    
    return {
        "success": True,
        "message": "Shipping address deleted successfully"
    }

@router.delete("/profile/mobile-wallet/{wallet_id}", response_model=dict)
async def delete_mobile_wallet(
    wallet_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Delete a mobile wallet"""
    
    database = get_database()
    
    # Remove mobile wallet from profile
    result = await database.user_profiles.update_one(
        {"user_id": current_user_id},
        {
            "$pull": {"mobile_money_wallets": {"id": wallet_id}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mobile wallet not found"
        )
    
    return {
        "success": True,
        "message": "Mobile wallet deleted successfully"
    }

@router.put("/profile/address/{address_id}/default", response_model=dict)
async def set_default_address(
    address_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Set an address as default"""
    
    database = get_database()
    
    # First, set all addresses to non-default
    await database.user_profiles.update_one(
        {"user_id": current_user_id},
        {"$set": {"addresses.$[].is_default": False}}
    )
    
    # Then set the specified address as default
    result = await database.user_profiles.update_one(
        {"user_id": current_user_id, "addresses.id": address_id},
        {"$set": {"addresses.$.is_default": True, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    
    return {
        "success": True,
        "message": "Default address updated successfully"
    }

@router.put("/profile/mobile-wallet/{wallet_id}/default", response_model=dict)
async def set_default_wallet(
    wallet_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Set a mobile wallet as default"""
    
    database = get_database()
    
    # First, set all wallets to non-default
    await database.user_profiles.update_one(
        {"user_id": current_user_id},
        {"$set": {"mobile_money_wallets.$[].is_default": False}}
    )
    
    # Then set the specified wallet as default
    result = await database.user_profiles.update_one(
        {"user_id": current_user_id, "mobile_money_wallets.id": wallet_id},
        {"$set": {"mobile_money_wallets.$.is_default": True, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mobile wallet not found"
        )
    
    return {
        "success": True,
        "message": "Default mobile wallet updated successfully"
    }