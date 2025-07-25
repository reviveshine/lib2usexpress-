import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import useChat from '../hooks/useChat';

const ChatMessage = ({ message, currentUserId, onReply }) => {
  const isOwn = message.sender_id === currentUserId;
  const timestamp = new Date(message.timestamp);
  
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString();
  };
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: isOwn ? 'flex-end' : 'flex-start',
      marginBottom: '1rem'
    }}>
      <div style={{
        maxWidth: '70%',
        backgroundColor: isOwn ? '#dc2626' : '#f3f4f6',
        color: isOwn ? 'white' : '#1f2937',
        padding: '0.75rem 1rem',
        borderRadius: '18px',
        borderBottomRightRadius: isOwn ? '4px' : '18px',
        borderBottomLeftRadius: isOwn ? '18px' : '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        {/* Reply indicator */}
        {message.reply_to && (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '0.25rem 0.5rem',
            borderRadius: '8px',
            marginBottom: '0.5rem',
            fontSize: '0.8rem',
            opacity: 0.8
          }}>
            ↩️ Replying to message
          </div>
        )}
        
        {/* Sender name for group chats */}
        {!isOwn && (
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 'bold',
            marginBottom: '0.25rem',
            opacity: 0.8
          }}>
            {message.sender_name}
          </div>
        )}
        
        {/* Message content */}
        <div>
          {message.message_type === 'text' && (
            <div style={{ wordWrap: 'break-word' }}>
              {message.content.text}
            </div>
          )}
          
          {message.message_type === 'image' && (
            <div>
              <img
                src={message.content.media_url}
                alt="Shared image"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  marginBottom: '0.5rem'
                }}
              />
              {message.content.text && (
                <div style={{ marginTop: '0.5rem' }}>
                  {message.content.text}
                </div>
              )}
            </div>
          )}
          
          {message.message_type === 'video' && (
            <div>
              <video
                src={message.content.media_url}
                controls
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  marginBottom: '0.5rem'
                }}
              />
              {message.content.text && (
                <div style={{ marginTop: '0.5rem' }}>
                  {message.content.text}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Timestamp and actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
          fontSize: '0.7rem',
          opacity: 0.7
        }}>
          <span>{formatTime(timestamp)}</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onReply && onReply(message)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '0.7rem',
                opacity: 0.7
              }}
            >
              ↩️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatWindow = ({ chat, currentUserId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const chatHook = useChat(currentUserId);
  const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  useEffect(() => {
    if (chat) {
      loadMessages();
      chatHook.subscribeToChat(chat.id);
    }
    
    return () => {
      if (chat) {
        chatHook.unsubscribeFromChat(chat.id);
      }
    };
  }, [chat?.id]);
  
  useEffect(() => {
    // Update messages from WebSocket
    if (chat && chatHook.messages[chat.id]) {
      setMessages(prev => {
        const newMessages = chatHook.messages[chat.id];
        // Avoid duplicates by checking IDs
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));
        return [...prev, ...uniqueNewMessages];
      });
    }
  }, [chatHook.messages, chat?.id]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(
        `${API_BASE}/api/chat/${chat.id}/messages`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data.messages) {
        setMessages(response.data.messages);
        chatHook.initializeChatMessages(chat.id, response.data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const messageData = {
        chat_id: chat.id,
        message_type: 'text',
        content: {
          text: newMessage.trim()
        },
        reply_to: replyTo?.id || null
      };
      
      const response = await axios.post(
        `${API_BASE}/api/chat/send-message`,
        messageData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        // Add message to local state
        const sentMessage = response.data.message_data;
        setMessages(prev => [...prev, sentMessage]);
        chatHook.addMessageToChat(chat.id, sentMessage);
        
        // Clear input and reply
        setNewMessage('');
        setReplyTo(null);
        
        // Focus input
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    chatHook.sendTypingIndicator(chat.id, true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing indicator after 1 second
    typingTimeoutRef.current = setTimeout(() => {
      chatHook.sendTypingIndicator(chat.id, false);
    }, 1000);
  };
  
  const handleReply = (message) => {
    setReplyTo(message);
    inputRef.current?.focus();
  };
  
  const otherParticipant = chat.participants.find(p => p.user_id !== currentUserId);
  const isOnline = chatHook.onlineUsers.has(otherParticipant?.user_id);
  const typingUsers = chatHook.typingUsers[chat.id] || [];
  const isOtherUserTyping = typingUsers.some(userId => userId !== currentUserId);
  
  if (!chat) return null;
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '600px',
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#1f2937' }}>
            {otherParticipant?.user_name}
          </h3>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isOnline ? '#10b981' : '#6b7280'
            }}></span>
            {isOnline ? 'Online' : 'Offline'}
            {chat.product_name && (
              <>
                <span>•</span>
                <span>Re: {chat.product_name}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          ×
        </button>
      </div>
      
      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        backgroundColor: '#ffffff'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                currentUserId={currentUserId}
                onReply={handleReply}
              />
            ))}
            {isOtherUserTyping && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  padding: '0.5rem 1rem',
                  borderRadius: '18px',
                  fontSize: '0.9rem',
                  fontStyle: 'italic'
                }}>
                  {otherParticipant?.user_name} is typing...
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Reply Indicator */}
      {replyTo && (
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#f3f4f6',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            ↩️ Replying to: {replyTo.content.text?.substring(0, 50)}...
          </div>
          <button
            onClick={() => setReplyTo(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Message Input */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <button
            onClick={() => setShowMediaUpload(!showMediaUpload)}
            style={{
              padding: '0.5rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            📎
          </button>
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows="1"
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '20px',
              resize: 'none',
              outline: 'none',
              fontSize: '0.9rem',
              maxHeight: '100px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            style={{
              padding: '0.5rem',
              backgroundColor: !newMessage.trim() || sending ? '#9ca3af' : '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: !newMessage.trim() || sending ? 'not-allowed' : 'pointer',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {sending ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;