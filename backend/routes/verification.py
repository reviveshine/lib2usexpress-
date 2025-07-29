from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
import uuid
import base64
import mimetypes
from models.verification import (
    VerificationDocument, VerificationDocumentUpload, SellerVerificationProfile,
    SellerVerificationCreate, VerificationStatusUpdate, DocumentReview, 
    VerificationStats, VerifiedUserResponse, LIBERIAN_COUNTIES, VERIFICATION_REQUIREMENTS
)
from database import get_database
from server import get_current_user

router = APIRouter()

async def get_current_seller(current_user_id: str = Depends(get_current_user)):
    """Ensure current user is a seller"""
    database = get_database()
    user = await database.users.find_one({"id": current_user_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user["userType"] != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can access verification features"
        )
    
    return user

# Seller Verification Profile Management
@router.post("/profile", response_model=dict)
async def create_verification_profile(
    profile_data: SellerVerificationCreate,
    seller = Depends(get_current_seller)
):
    """Create or update seller verification profile"""
    database = get_database()
    
    # Check if profile already exists
    existing_profile = await database.seller_verifications.find_one({"user_id": seller["id"]})
    
    if existing_profile:
        # Update existing profile
        update_data = profile_data.dict()
        update_data["updated_at"] = datetime.utcnow()
        
        await database.seller_verifications.update_one(
            {"user_id": seller["id"]},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "message": "Verification profile updated successfully"
        }
    else:
        # Create new profile
        profile = {
            "id": str(uuid.uuid4()),
            "user_id": seller["id"],
            **profile_data.dict(),
            "verification_status": "pending",
            "verification_level": "basic",
            "uploaded_documents": [],
            "required_documents": VERIFICATION_REQUIREMENTS["basic"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await database.seller_verifications.insert_one(profile)
        
        return {
            "success": True,
            "message": "Verification profile created successfully"
        }

@router.get("/profile", response_model=dict)
async def get_verification_profile(seller = Depends(get_current_seller)):
    """Get seller verification profile"""
    database = get_database()
    
    profile = await database.seller_verifications.find_one({"user_id": seller["id"]})
    
    if not profile:
        return {
            "success": True,
            "profile": None,
            "message": "No verification profile found"
        }
    
    # Get uploaded documents
    documents = []
    documents_cursor = database.verification_documents.find({"user_id": seller["id"]})
    
    async for doc in documents_cursor:
        documents.append({
            "id": doc["id"],
            "document_type": doc["document_type"],
            "document_name": doc["document_name"],
            "status": doc["status"],
            "uploaded_at": doc["uploaded_at"],
            "rejection_reason": doc.get("rejection_reason")
        })
    
    profile_response = SellerVerificationProfile(
        id=profile["id"],
        user_id=profile["user_id"],
        full_name=profile["full_name"],
        date_of_birth=profile.get("date_of_birth"),
        nationality=profile["nationality"],
        national_id_number=profile.get("national_id_number"),
        business_name=profile.get("business_name"),
        business_type=profile.get("business_type"),
        business_registration_number=profile.get("business_registration_number"),
        tax_identification_number=profile.get("tax_identification_number"),
        physical_address=profile["physical_address"],
        city=profile["city"],
        county=profile["county"],
        postal_code=profile.get("postal_code"),
        bank_name=profile.get("bank_name"),
        account_holder_name=profile.get("account_holder_name"),
        account_number=profile.get("account_number"),
        mobile_money_number=profile.get("mobile_money_number"),
        verification_status=profile["verification_status"],
        verification_level=profile["verification_level"],
        verification_notes=profile.get("verification_notes"),
        uploaded_documents=profile["uploaded_documents"],
        required_documents=profile["required_documents"],
        created_at=profile["created_at"],
        updated_at=profile["updated_at"],
        verified_at=profile.get("verified_at"),
        verified_by=profile.get("verified_by")
    )
    
    return {
        "success": True,
        "profile": profile_response.dict(),
        "documents": documents,
        "counties": LIBERIAN_COUNTIES
    }

# Document Upload Management
@router.post("/documents/upload", response_model=dict)
async def upload_verification_document(
    document_data: VerificationDocumentUpload,
    seller = Depends(get_current_seller)
):
    """Upload verification document"""
    database = get_database()
    
    # Validate base64 content
    try:
        file_content = base64.b64decode(document_data.file_content)
        if len(file_content) != document_data.file_size:
            raise ValueError("File size mismatch")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file content"
        )
    
    # Check if document type already exists
    existing_doc = await database.verification_documents.find_one({
        "user_id": seller["id"],
        "document_type": document_data.document_type
    })
    
    if existing_doc:
        # Update existing document
        await database.verification_documents.update_one(
            {"id": existing_doc["id"]},
            {"$set": {
                "document_name": document_data.document_name,
                "file_content": document_data.file_content,
                "file_type": document_data.file_type,
                "file_size": document_data.file_size,
                "uploaded_at": datetime.utcnow(),
                "status": "pending",
                "rejection_reason": None,
                "reviewed_by": None,
                "reviewed_at": None
            }}
        )
        document_id = existing_doc["id"]
    else:
        # Create new document
        document_id = str(uuid.uuid4())
        document = {
            "id": document_id,
            "user_id": seller["id"],
            "document_type": document_data.document_type,
            "document_name": document_data.document_name,
            "file_content": document_data.file_content,
            "file_type": document_data.file_type,
            "file_size": document_data.file_size,
            "uploaded_at": datetime.utcnow(),
            "status": "pending"
        }
        
        await database.verification_documents.insert_one(document)
    
    # Update seller verification profile
    await database.seller_verifications.update_one(
        {"user_id": seller["id"]},
        {
            "$addToSet": {"uploaded_documents": document_id},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    # Check if all required documents are uploaded
    profile = await database.seller_verifications.find_one({"user_id": seller["id"]})
    if profile:
        uploaded_types = []
        async for doc in database.verification_documents.find({"user_id": seller["id"]}):
            uploaded_types.append(doc["document_type"])
        
        required_docs = set(profile["required_documents"])
        uploaded_docs = set(uploaded_types)
        
        if required_docs.issubset(uploaded_docs):
            # All required documents uploaded, change status to under review
            await database.seller_verifications.update_one(
                {"user_id": seller["id"]},
                {"$set": {
                    "verification_status": "under_review",
                    "updated_at": datetime.utcnow()
                }}
            )
    
    return {
        "success": True,
        "message": f"{document_data.document_type.replace('_', ' ').title()} uploaded successfully",
        "document_id": document_id
    }

@router.get("/documents", response_model=dict)
async def get_verification_documents(seller = Depends(get_current_seller)):
    """Get all verification documents for seller"""
    database = get_database()
    
    documents = []
    documents_cursor = database.verification_documents.find({"user_id": seller["id"]})
    
    async for doc in documents_cursor:
        # Don't return file content in list view for security
        document_info = {
            "id": doc["id"],
            "document_type": doc["document_type"],
            "document_name": doc["document_name"],
            "file_type": doc["file_type"],
            "file_size": doc["file_size"],
            "status": doc["status"],
            "uploaded_at": doc["uploaded_at"],
            "rejection_reason": doc.get("rejection_reason"),
            "reviewed_at": doc.get("reviewed_at")
        }
        documents.append(document_info)
    
    return {
        "success": True,
        "documents": documents
    }

@router.get("/documents/{document_id}", response_model=dict)
async def get_verification_document(
    document_id: str,
    seller = Depends(get_current_seller)
):
    """Get specific verification document"""
    database = get_database()
    
    document = await database.verification_documents.find_one({
        "id": document_id,
        "user_id": seller["id"]
    })
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return {
        "success": True,
        "document": {
            "id": document["id"],
            "document_type": document["document_type"],
            "document_name": document["document_name"],
            "file_content": document["file_content"],
            "file_type": document["file_type"],
            "file_size": document["file_size"],
            "status": document["status"],
            "uploaded_at": document["uploaded_at"],
            "rejection_reason": document.get("rejection_reason"),
            "reviewed_at": document.get("reviewed_at")
        }
    }

@router.delete("/documents/{document_id}", response_model=dict)
async def delete_verification_document(
    document_id: str,
    seller = Depends(get_current_seller)
):
    """Delete verification document"""
    database = get_database()
    
    # Check if document exists and belongs to seller
    document = await database.verification_documents.find_one({
        "id": document_id,
        "user_id": seller["id"]
    })
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete document
    await database.verification_documents.delete_one({"id": document_id})
    
    # Remove from seller profile
    await database.seller_verifications.update_one(
        {"user_id": seller["id"]},
        {
            "$pull": {"uploaded_documents": document_id},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return {
        "success": True,
        "message": "Document deleted successfully"
    }

# Verification Status
@router.get("/status", response_model=dict)
async def get_verification_status(seller = Depends(get_current_seller)):
    """Get current verification status"""
    database = get_database()
    
    profile = await database.seller_verifications.find_one({"user_id": seller["id"]})
    
    if not profile:
        return {
            "success": True,
            "status": "not_started",
            "message": "Verification not started"
        }
    
    # Count documents by status
    doc_stats = {"pending": 0, "approved": 0, "rejected": 0}
    documents_cursor = database.verification_documents.find({"user_id": seller["id"]})
    
    async for doc in documents_cursor:
        doc_stats[doc["status"]] += 1
    
    # Calculate progress
    total_required = len(profile["required_documents"])
    uploaded_count = len(profile["uploaded_documents"])
    approved_count = doc_stats["approved"]
    
    progress_percentage = (approved_count / total_required * 100) if total_required > 0 else 0
    
    return {
        "success": True,
        "verification_status": profile["verification_status"],
        "verification_level": profile["verification_level"],
        "progress_percentage": round(progress_percentage, 1),
        "required_documents": profile["required_documents"],
        "uploaded_count": uploaded_count,
        "approved_count": approved_count,
        "rejected_count": doc_stats["rejected"],
        "pending_count": doc_stats["pending"],
        "verification_notes": profile.get("verification_notes"),
        "verified_at": profile.get("verified_at")
    }

# Helper Routes
@router.get("/requirements", response_model=dict)
async def get_verification_requirements():
    """Get verification requirements for different levels"""
    return {
        "success": True,
        "requirements": VERIFICATION_REQUIREMENTS,
        "counties": LIBERIAN_COUNTIES,
        "document_types": {
            "national_id": "National ID Card",
            "passport": "Passport",
            "drivers_license": "Driver's License",
            "business_registration": "Business Registration Certificate",
            "utility_bill": "Utility Bill (Recent)",
            "bank_statement": "Bank Statement (Recent)"
        }
    }