import json
import asyncio
from typing import Dict, Set, List, Optional
from datetime import datetime
import uuid
from cryptography.fernet import Fernet
import base64
import os
from fastapi import WebSocket
from models.chat import (
    Chat, ChatMessage, ChatParticipant, MessageContent, MessageType, 
    ChatStatus, MessageStatus, WSMessage, WSMessageType
)

class ChatEncryption:
    """Handle message encryption/decryption"""
    
    def __init__(self):
        # In production, use a secure key management system
        self.key = os.getenv('CHAT_ENCRYPTION_KEY', self._generate_key())
        self.cipher = Fernet(self.key.encode() if isinstance(self.key, str) else self.key)
    
    def _generate_key(self) -> str:
        """Generate a new encryption key"""
        return base64.urlsafe_b64encode(Fernet.generate_key()).decode()
    
    def encrypt_message(self, message: str) -> str:
        """Encrypt a message"""
        try:
            encrypted = self.cipher.encrypt(message.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
        except Exception as e:
            print(f"Encryption error: {e}")
            return message  # Return original if encryption fails
    
    def decrypt_message(self, encrypted_message: str) -> str:
        """Decrypt a message"""
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_message.encode())
            decrypted = self.cipher.decrypt(encrypted_bytes)
            return decrypted.decode()
        except Exception as e:
            print(f"Decryption error: {e}")
            return encrypted_message  # Return original if decryption fails

class ConnectionManager:
    """Manage WebSocket connections for real-time chat"""
    
    def __init__(self):
        # Store active connections: user_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        # Store user presence: user_id -> last_seen
        self.user_presence: Dict[str, datetime] = {}
        # Store chat subscriptions: user_id -> set of chat_ids
        self.chat_subscriptions: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept WebSocket connection and register user"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_presence[user_id] = datetime.now()
        self.chat_subscriptions[user_id] = set()
        
        # Notify others that user is online
        await self.broadcast_user_status(user_id, True)
    
    def disconnect(self, user_id: str):
        """Remove user connection"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        
        if user_id in self.user_presence:
            self.user_presence[user_id] = datetime.now()
        
        if user_id in self.chat_subscriptions:
            del self.chat_subscriptions[user_id]
        
        # Notify others that user is offline
        asyncio.create_task(self.broadcast_user_status(user_id, False))
    
    async def subscribe_to_chat(self, user_id: str, chat_id: str):
        """Subscribe user to chat updates"""
        if user_id not in self.chat_subscriptions:
            self.chat_subscriptions[user_id] = set()
        self.chat_subscriptions[user_id].add(chat_id)
    
    async def unsubscribe_from_chat(self, user_id: str, chat_id: str):
        """Unsubscribe user from chat updates"""
        if user_id in self.chat_subscriptions:
            self.chat_subscriptions[user_id].discard(chat_id)
    
    async def send_to_user(self, user_id: str, message: WSMessage):
        """Send message to specific user"""
        if user_id in self.active_connections:
            try:
                websocket = self.active_connections[user_id]
                await websocket.send_text(message.json())
                return True
            except Exception as e:
                print(f"Error sending message to {user_id}: {e}")
                # Remove broken connection
                self.disconnect(user_id)
                return False
        return False
    
    async def send_to_chat(self, chat_id: str, message: WSMessage, exclude_user: Optional[str] = None):
        """Send message to all users subscribed to a chat"""
        sent_count = 0
        for user_id, subscriptions in self.chat_subscriptions.items():
            if chat_id in subscriptions and user_id != exclude_user:
                if await self.send_to_user(user_id, message):
                    sent_count += 1
        return sent_count
    
    async def broadcast_user_status(self, user_id: str, is_online: bool):
        """Broadcast user online/offline status"""
        message = WSMessage(
            type=WSMessageType.USER_ONLINE if is_online else WSMessageType.USER_OFFLINE,
            data={"user_id": user_id, "is_online": is_online},
            sender_id=user_id
        )
        
        # Send to all connected users
        for connected_user_id in self.active_connections:
            if connected_user_id != user_id:
                await self.send_to_user(connected_user_id, message)
    
    async def handle_typing_indicator(self, user_id: str, chat_id: str, is_typing: bool):
        """Handle typing indicators"""
        message = WSMessage(
            type=WSMessageType.USER_TYPING,
            data={
                "user_id": user_id,
                "chat_id": chat_id,
                "is_typing": is_typing
            },
            sender_id=user_id
        )
        
        await self.send_to_chat(chat_id, message, exclude_user=user_id)
    
    def is_user_online(self, user_id: str) -> bool:
        """Check if user is currently online"""
        return user_id in self.active_connections
    
    def get_online_users(self) -> List[str]:
        """Get list of online user IDs"""
        return list(self.active_connections.keys())

class ChatService:
    """Main chat service for handling chat operations"""
    
    def __init__(self):
        self.encryption = ChatEncryption()
        self.connection_manager = ConnectionManager()
    
    async def create_chat(self, database, initiator_id: str, recipient_id: str, product_id: Optional[str] = None) -> Chat:
        """Create a new chat between two users"""
        
        # Check if chat already exists between these users for this product
        existing_chat = await database.chats.find_one({
            "$and": [
                {"participants.user_id": {"$all": [initiator_id, recipient_id]}},
                {"product_id": product_id} if product_id else {"product_id": None}
            ]
        })
        
        if existing_chat:
            return Chat(**existing_chat)
        
        # Get user information
        initiator = await database.users.find_one({"id": initiator_id})
        recipient = await database.users.find_one({"id": recipient_id})
        
        if not initiator or not recipient:
            raise ValueError("Invalid user IDs")
        
        # Get product information if provided
        product_name = None
        if product_id:
            product = await database.products.find_one({"id": product_id})
            if product:
                product_name = product["name"]
        
        # Create chat
        chat_id = str(uuid.uuid4())
        participants = [
            ChatParticipant(
                user_id=initiator_id,
                user_name=f"{initiator['firstName']} {initiator['lastName']}",
                user_type=initiator["userType"]
            ),
            ChatParticipant(
                user_id=recipient_id,
                user_name=f"{recipient['firstName']} {recipient['lastName']}",
                user_type=recipient["userType"]
            )
        ]
        
        chat = Chat(
            id=chat_id,
            participants=participants,
            product_id=product_id,
            product_name=product_name,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            unread_count={initiator_id: 0, recipient_id: 0}
        )
        
        # Save to database
        await database.chats.insert_one(chat.dict())
        
        return chat
    
    async def send_message(self, database, sender_id: str, chat_id: str, content: MessageContent, 
                          message_type: MessageType = MessageType.TEXT, reply_to: Optional[str] = None) -> ChatMessage:
        """Send a message in a chat"""
        
        # Get chat and verify sender is participant
        chat_doc = await database.chats.find_one({"id": chat_id})
        if not chat_doc:
            raise ValueError("Chat not found")
        
        chat = Chat(**chat_doc)
        sender_participant = None
        for participant in chat.participants:
            if participant.user_id == sender_id:
                sender_participant = participant
                break
        
        if not sender_participant:
            raise ValueError("User is not a participant in this chat")
        
        # Encrypt message content if it's text
        encrypted_content = content.copy()
        if message_type == MessageType.TEXT and content.text:
            encrypted_content.text = self.encryption.encrypt_message(content.text)
        
        # Create message
        message_id = str(uuid.uuid4())
        message = ChatMessage(
            id=message_id,
            chat_id=chat_id,
            sender_id=sender_id,
            sender_name=sender_participant.user_name,
            message_type=message_type,
            content=encrypted_content,
            timestamp=datetime.now(),
            reply_to=reply_to
        )
        
        # Save message to database
        await database.chat_messages.insert_one(message.dict())
        
        # Update chat with last message and unread counts
        unread_count = chat.unread_count.copy()
        for participant in chat.participants:
            if participant.user_id != sender_id:
                unread_count[participant.user_id] = unread_count.get(participant.user_id, 0) + 1
        
        await database.chats.update_one(
            {"id": chat_id},
            {
                "$set": {
                    "updated_at": datetime.now(),
                    "last_message": message.dict(),
                    "unread_count": unread_count
                }
            }
        )
        
        # Send real-time notification
        decrypted_message = message.copy()
        if message_type == MessageType.TEXT and encrypted_content.text:
            decrypted_message.content.text = self.encryption.decrypt_message(encrypted_content.text)
        
        ws_message = WSMessage(
            type=WSMessageType.NEW_MESSAGE,
            data={"message": decrypted_message.dict(), "chat_id": chat_id},
            sender_id=sender_id
        )
        
        await self.connection_manager.send_to_chat(chat_id, ws_message, exclude_user=sender_id)
        
        return decrypted_message
    
    async def mark_messages_read(self, database, user_id: str, chat_id: str):
        """Mark all messages in a chat as read for a user"""
        
        # Reset unread count for user
        await database.chats.update_one(
            {"id": chat_id},
            {"$set": {f"unread_count.{user_id}": 0}}
        )
        
        # Update participant's last_read_at
        await database.chats.update_one(
            {"id": chat_id, "participants.user_id": user_id},
            {"$set": {"participants.$.last_read_at": datetime.now()}}
        )
        
        # Send read receipt
        ws_message = WSMessage(
            type=WSMessageType.MESSAGE_READ,
            data={"chat_id": chat_id, "user_id": user_id},
            sender_id=user_id
        )
        
        await self.connection_manager.send_to_chat(chat_id, ws_message, exclude_user=user_id)
    
    def decrypt_messages(self, messages: List[ChatMessage]) -> List[ChatMessage]:
        """Decrypt text messages for display"""
        decrypted_messages = []
        for message in messages:
            decrypted_message = message.copy()
            if message.message_type == MessageType.TEXT and message.content.text:
                decrypted_message.content.text = self.encryption.decrypt_message(message.content.text)
            decrypted_messages.append(decrypted_message)
        return decrypted_messages

# Global chat service instance
chat_service = ChatService()