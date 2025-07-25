from pydantic import BaseModel, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class MessageType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    FILE = "file"
    SYSTEM = "system"

class ChatStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    BLOCKED = "blocked"
    REPORTED = "reported"

class MessageStatus(str, Enum):
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    DELETED = "deleted"

class ChatParticipant(BaseModel):
    user_id: str
    user_name: str
    user_type: str  # "buyer" or "seller"
    last_read_at: Optional[datetime] = None
    is_online: bool = False

class MessageContent(BaseModel):
    text: Optional[str] = None
    media_url: Optional[str] = None  # base64 data for images/videos
    media_type: Optional[str] = None  # "image/jpeg", "video/mp4", etc.
    filename: Optional[str] = None
    file_size: Optional[int] = None

class ChatMessage(BaseModel):
    id: str
    chat_id: str
    sender_id: str
    sender_name: str
    message_type: MessageType
    content: MessageContent
    status: MessageStatus = MessageStatus.SENT
    timestamp: datetime
    edited_at: Optional[datetime] = None
    reply_to: Optional[str] = None  # Message ID being replied to
    is_encrypted: bool = True

class Chat(BaseModel):
    id: str
    participants: List[ChatParticipant]
    product_id: Optional[str] = None  # Product being discussed
    product_name: Optional[str] = None
    status: ChatStatus = ChatStatus.ACTIVE
    created_at: datetime
    updated_at: datetime
    last_message: Optional[ChatMessage] = None
    unread_count: Dict[str, int] = {}  # user_id -> unread count
    is_encrypted: bool = True

class ChatCreate(BaseModel):
    recipient_id: str
    product_id: Optional[str] = None
    initial_message: str

class MessageCreate(BaseModel):
    chat_id: str
    message_type: MessageType = MessageType.TEXT
    content: MessageContent
    reply_to: Optional[str] = None

class ChatListResponse(BaseModel):
    chats: List[Chat]
    total_count: int
    unread_total: int

class ChatMessagesResponse(BaseModel):
    messages: List[ChatMessage]
    chat_info: Chat
    has_more: bool
    total_count: int

class ReportChat(BaseModel):
    chat_id: str
    reason: str
    description: Optional[str] = None

# WebSocket message types
class WSMessageType(str, Enum):
    NEW_MESSAGE = "new_message"
    MESSAGE_READ = "message_read"
    USER_TYPING = "user_typing"
    USER_ONLINE = "user_online"
    USER_OFFLINE = "user_offline"
    CHAT_UPDATED = "chat_updated"

class WSMessage(BaseModel):
    type: WSMessageType
    data: Dict[str, Any]
    timestamp: datetime = datetime.now()
    sender_id: Optional[str] = None