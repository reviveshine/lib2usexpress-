import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useChat from '../hooks/useChat';

const ChatList = ({ currentUserId, onChatSelect, selectedChatId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  
  const chatHook = useChat(currentUserId);
  const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  useEffect(() => {
    loadChats();
  }, []);
  
  useEffect(() => {
    // Update unread counts when new messages arrive
    const interval = setInterval(() => {
      loadChats();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const loadChats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(
        `${API_BASE}/api/chat/list`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data.chats) {
        setChats(response.data.chats);
        setTotalUnread(response.data.unread_total);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p.user_id !== currentUserId);
  };
  
  const getUnreadCount = (chat) => {
    return chat.unread_count[currentUserId] || 0;
  };
  
  const truncateMessage = (text, maxLength = 40) => {
    if (!text) return 'No messages yet';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        Loading chats...
      </div>
    );
  }
  
  if (chats.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <div style={{ marginBottom: '1rem', fontSize: '3rem' }}>💬</div>
        <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>No conversations yet</h3>
        <p>Start chatting by contacting a seller on a product page!</p>
      </div>
    );
  }
  
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#1f2937' }}>Messages</h3>
          {totalUnread > 0 && (
            <span style={{
              backgroundColor: '#dc2626',
              color: 'white',
              borderRadius: '50%',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              minWidth: '20px',
              textAlign: 'center'
            }}>
              {totalUnread}
            </span>
          )}
        </div>
        <div style={{ 
          fontSize: '0.8rem', 
          color: '#6b7280', 
          marginTop: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: chatHook.isConnected ? '#10b981' : '#ef4444'
          }}></span>
          {chatHook.isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </div>
      
      {/* Chat List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {chats.map((chat) => {
          const otherParticipant = getOtherParticipant(chat);
          const unreadCount = getUnreadCount(chat);
          const isSelected = selectedChatId === chat.id;
          const isOnline = chatHook.onlineUsers.has(otherParticipant?.user_id);
          
          return (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat)}
              style={{
                padding: '1rem',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#fef2f2' : 'white',
                transition: 'background-color 0.2s',
                ':hover': {
                  backgroundColor: '#f9fafb'
                }
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.target.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.target.style.backgroundColor = 'white';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                {/* Avatar */}
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  flexShrink: 0,
                  position: 'relative'
                }}>
                  {otherParticipant?.user_name?.charAt(0)?.toUpperCase()}
                  {/* Online indicator */}
                  {isOnline && (
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#10b981',
                      borderRadius: '50%',
                      border: '2px solid white'
                    }}></div>
                  )}
                </div>
                
                {/* Chat Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <div style={{
                      fontWeight: unreadCount > 0 ? 'bold' : 'normal',
                      color: '#1f2937',
                      fontSize: '0.95rem'
                    }}>
                      {otherParticipant?.user_name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {chat.updated_at && (
                        <span style={{
                          fontSize: '0.7rem',
                          color: '#9ca3af'
                        }}>
                          {formatTimestamp(chat.updated_at)}
                        </span>
                      )}
                      {unreadCount > 0 && (
                        <span style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          borderRadius: '50%',
                          padding: '0.15rem 0.4rem',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          minWidth: '16px',
                          textAlign: 'center'
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Product context */}
                  {chat.product_name && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#dc2626',
                      marginBottom: '0.25rem',
                      fontWeight: '500'
                    }}>
                      📦 {chat.product_name}
                    </div>
                  )}
                  
                  {/* Last message */}
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    fontWeight: unreadCount > 0 ? '500' : 'normal'
                  }}>
                    {chat.last_message ? (
                      <>
                        {chat.last_message.sender_id === currentUserId && (
                          <span style={{ color: '#9ca3af' }}>You: </span>
                        )}
                        {chat.last_message.message_type === 'text' ? (
                          truncateMessage(chat.last_message.content.text)
                        ) : chat.last_message.message_type === 'image' ? (
                          '📷 Photo'
                        ) : chat.last_message.message_type === 'video' ? (
                          '🎥 Video'
                        ) : (
                          '📎 File'
                        )}
                      </>
                    ) : (
                      <span style={{ fontStyle: 'italic' }}>No messages yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;