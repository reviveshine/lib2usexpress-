from fastapi import APIRouter, HTTPException, status, Depends, WebSocket, WebSocketDisconnect, Query
from typing import List, Optional
from datetime import datetime
import uuid
import json
from models.chat import (
    ChatCreate, MessageCreate, Chat, ChatMessage, ChatListResponse, 
    ChatMessagesResponse, ReportChat, MessageType, ChatStatus, WSMessage, WSMessageType
)
from services.chat_service import chat_service
from database import get_database
from server import get_current_user

router = APIRouter()

@router.post("/create", response_model=dict)
async def create_chat(
    chat_data: ChatCreate,
    current_user_id: str = Depends(get_current_user)
):
    """Create a new chat between current user and recipient"""
    
    try:
        database = get_database()
        
        # Verify recipient exists
        recipient = await database.users.find_one({"_id": chat_data.recipient_id})
        if not recipient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipient not found"
            )
        
        # Verify product exists if provided
        if chat_data.product_id:
            product = await database.products.find_one({"_id": chat_data.product_id})
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Product not found"
                )
        
        # Create chat
        chat = await chat_service.create_chat(
            database, 
            current_user_id, 
            chat_data.recipient_id, 
            chat_data.product_id
        )
        
        # Send initial message if provided
        if chat_data.initial_message:
            from models.chat import MessageContent
            content = MessageContent(text=chat_data.initial_message)
            await chat_service.send_message(
                database,
                current_user_id,
                chat.id,
                content,
                MessageType.TEXT
            )
        
        return {
            "success": True,
            "message": "Chat created successfully",
            "chat": chat.dict()
        }
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create chat: {str(e)}"
        )

@router.get("/list", response_model=ChatListResponse)
async def get_user_chats(
    current_user_id: str = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50)
):
    """Get list of chats for current user"""
    
    try:
        database = get_database()
        
        # Calculate pagination
        skip = (page - 1) * limit
        
        # Find chats where user is a participant
        chats_cursor = database.chats.find(
            {"participants.user_id": current_user_id, "status": {"$ne": "deleted"}},
            sort=[("updated_at", -1)]
        ).skip(skip).limit(limit)
        
        chats = []
        total_unread = 0
        
        async for chat_doc in chats_cursor:
            chat = Chat(**chat_doc)
            
            # Decrypt last message if it exists
            if chat.last_message and chat.last_message.content.text:
                chat.last_message.content.text = chat_service.encryption.decrypt_message(
                    chat.last_message.content.text
                )
            
            # Update participant online status
            for participant in chat.participants:
                participant.is_online = chat_service.connection_manager.is_user_online(participant.user_id)
            
            chats.append(chat)
            total_unread += chat.unread_count.get(current_user_id, 0)
        
        # Get total count
        total_count = await database.chats.count_documents({
            "participants.user_id": current_user_id,
            "status": {"$ne": "deleted"}
        })
        
        return ChatListResponse(
            chats=chats,
            total_count=total_count,
            unread_total=total_unread
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get chats: {str(e)}"
        )

@router.get("/{chat_id}/messages", response_model=ChatMessagesResponse)
async def get_chat_messages(
    chat_id: str,
    current_user_id: str = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """Get messages for a specific chat"""
    
    try:
        database = get_database()
        
        # Verify user is participant in chat
        chat_doc = await database.chats.find_one({
            "id": chat_id,
            "participants.user_id": current_user_id
        })
        
        if not chat_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found or access denied"
            )
        
        chat = Chat(**chat_doc)
        
        # Calculate pagination
        skip = (page - 1) * limit
        
        # Get messages
        messages_cursor = database.chat_messages.find(
            {"chat_id": chat_id},
            sort=[("timestamp", -1)]
        ).skip(skip).limit(limit)
        
        messages = []
        async for message_doc in messages_cursor:
            message = ChatMessage(**message_doc)
            messages.append(message)
        
        # Reverse to get chronological order (oldest first)
        messages.reverse()
        
        # Decrypt messages
        decrypted_messages = chat_service.decrypt_messages(messages)
        
        # Get total message count
        total_count = await database.chat_messages.count_documents({"chat_id": chat_id})
        
        # Mark messages as read
        await chat_service.mark_messages_read(database, current_user_id, chat_id)
        
        return ChatMessagesResponse(
            messages=decrypted_messages,
            chat_info=chat,
            has_more=skip + len(messages) < total_count,
            total_count=total_count
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get messages: {str(e)}"
        )

@router.post("/send-message", response_model=dict)
async def send_message(
    message_data: MessageCreate,
    current_user_id: str = Depends(get_current_user)
):
    """Send a message in a chat"""
    
    try:
        database = get_database()
        
        # Verify user is participant in chat
        chat_doc = await database.chats.find_one({
            "id": message_data.chat_id,
            "participants.user_id": current_user_id
        })
        
        if not chat_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found or access denied"
            )
        
        # Send message
        message = await chat_service.send_message(
            database,
            current_user_id,
            message_data.chat_id,
            message_data.content,
            message_data.message_type,
            message_data.reply_to
        )
        
        return {
            "success": True,
            "message": "Message sent successfully",
            "message_data": message.dict()
        }
    
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )

@router.post("/{chat_id}/mark-read", response_model=dict)
async def mark_chat_read(
    chat_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Mark all messages in chat as read"""
    
    try:
        database = get_database()
        
        # Verify user is participant in chat
        chat_doc = await database.chats.find_one({
            "id": chat_id,
            "participants.user_id": current_user_id
        })
        
        if not chat_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found or access denied"
            )
        
        await chat_service.mark_messages_read(database, current_user_id, chat_id)
        
        return {
            "success": True,
            "message": "Messages marked as read"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark messages as read: {str(e)}"
        )

@router.post("/report", response_model=dict)
async def report_chat(
    report_data: ReportChat,
    current_user_id: str = Depends(get_current_user)
):
    """Report a chat for abuse"""
    
    try:
        database = get_database()
        
        # Verify user is participant in chat
        chat_doc = await database.chats.find_one({
            "id": report_data.chat_id,
            "participants.user_id": current_user_id
        })
        
        if not chat_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found or access denied"
            )
        
        # Create report
        report = {
            "id": str(uuid.uuid4()),
            "chat_id": report_data.chat_id,
            "reporter_id": current_user_id,
            "reason": report_data.reason,
            "description": report_data.description,
            "status": "pending",
            "created_at": datetime.now()
        }
        
        await database.chat_reports.insert_one(report)
        
        # Mark chat as reported
        await database.chats.update_one(
            {"id": report_data.chat_id},
            {"$set": {"status": ChatStatus.REPORTED}}
        )
        
        return {
            "success": True,
            "message": "Chat reported successfully",
            "report_id": report["id"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to report chat: {str(e)}"
        )

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time chat"""
    
    await chat_service.connection_manager.connect(websocket, user_id)
    
    try:
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            message_type = message_data.get("type")
            
            if message_type == "typing":
                # Handle typing indicator
                chat_id = message_data.get("chat_id")
                is_typing = message_data.get("is_typing", False)
                await chat_service.connection_manager.handle_typing_indicator(
                    user_id, chat_id, is_typing
                )
            
            elif message_type == "subscribe_chat":
                # Subscribe to chat updates
                chat_id = message_data.get("chat_id")
                await chat_service.connection_manager.subscribe_to_chat(user_id, chat_id)
            
            elif message_type == "unsubscribe_chat":
                # Unsubscribe from chat updates
                chat_id = message_data.get("chat_id")
                await chat_service.connection_manager.unsubscribe_from_chat(user_id, chat_id)
    
    except WebSocketDisconnect:
        chat_service.connection_manager.disconnect(user_id)
    except Exception as e:
        print(f"WebSocket error for user {user_id}: {e}")
        chat_service.connection_manager.disconnect(user_id)

@router.get("/online-users", response_model=dict)
async def get_online_users(current_user_id: str = Depends(get_current_user)):
    """Get list of online users"""
    
    online_users = chat_service.connection_manager.get_online_users()
    
    return {
        "success": True,
        "online_users": online_users,
        "count": len(online_users)
    }