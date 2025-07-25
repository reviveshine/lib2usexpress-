import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import useChat from '../hooks/useChat';

const ChatPage = () => {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  
  useEffect(() => {
    checkAuthStatus();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const checkAuthStatus = () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  };
  
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };
  
  const handleCloseChat = () => {
    setSelectedChat(null);
  };
  
  if (!user) {
    return (
      <div className="page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '1rem', color: '#1f2937' }}>
            💬 Messages
          </h1>
          <p style={{ textAlign: 'center', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
            Communicate securely with buyers and sellers. All messages are encrypted for your privacy.
          </p>
        </div>
        
        {/* Desktop Layout */}
        {!isMobile && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: selectedChat ? '1fr 2fr' : '1fr',
            gap: '1.5rem',
            height: '600px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <ChatList
              currentUserId={user.id}
              onChatSelect={handleChatSelect}
              selectedChatId={selectedChat?.id}
            />
            
            {selectedChat ? (
              <ChatWindow
                chat={selectedChat}
                currentUserId={user.id}
                onClose={handleCloseChat}
              />
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: '2rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
                <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Select a conversation</h3>
                <p>Choose a chat from the list to start messaging</p>
              </div>
            )}
          </div>
        )}
        
        {/* Mobile Layout */}
        {isMobile && (
          <div style={{
            maxWidth: '500px',
            margin: '0 auto',
            height: '600px'
          }}>
            {selectedChat ? (
              <ChatWindow
                chat={selectedChat}
                currentUserId={user.id}
                onClose={handleCloseChat}
              />
            ) : (
              <ChatList
                currentUserId={user.id}
                onChatSelect={handleChatSelect}
                selectedChatId={selectedChat?.id}
              />
            )}
          </div>
        )}
        
        {/* Chat Features Info */}
        <div style={{
          marginTop: '3rem',
          maxWidth: '800px',
          margin: '3rem auto 0'
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#1f2937', textAlign: 'center' }}>
              🔒 Secure Chat Features
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔐</div>
                <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>End-to-End Encryption</h4>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  All messages are encrypted to protect your privacy and sensitive information.
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Real-time Messaging</h4>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  Instant message delivery with typing indicators and read receipts.
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📱</div>
                <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Media Sharing</h4>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  Share photos, videos, and files securely with buyers and sellers.
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛡️</div>
                <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Abuse Reporting</h4>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  Report inappropriate behavior to keep the platform safe for everyone.
                </p>
              </div>
            </div>
            
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe'
            }}>
              <p style={{ color: '#1e40af', fontSize: '0.9rem', margin: 0 }}>
                💡 <strong>Tip:</strong> Keep conversations professional and focused on the products. 
                Avoid sharing personal information like bank details or passwords.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;