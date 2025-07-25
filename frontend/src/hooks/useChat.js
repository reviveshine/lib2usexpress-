import { useState, useEffect, useRef, useCallback } from 'react';

const useChat = (userId) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  
  const WEBSOCKET_URL = process.env.REACT_APP_BACKEND_URL?.replace('http', 'ws') || 'ws://localhost:8001';
  
  const connect = useCallback(() => {
    if (!userId || socketRef.current) return;
    
    try {
      const ws = new WebSocket(`${WEBSOCKET_URL}/api/chat/ws/${userId}`);
      socketRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setSocket(ws);
        
        // Clear any reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSocket(null);
        socketRef.current = null;
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [userId, WEBSOCKET_URL]);
  
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'new_message':
        const { message, chat_id } = data.data;
        setMessages(prev => ({
          ...prev,
          [chat_id]: [...(prev[chat_id] || []), message]
        }));
        break;
        
      case 'user_online':
        setOnlineUsers(prev => new Set([...prev, data.data.user_id]));
        break;
        
      case 'user_offline':
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.data.user_id);
          return newSet;
        });
        break;
        
      case 'user_typing':
        const { user_id, chat_id: typingChatId, is_typing } = data.data;
        setTypingUsers(prev => ({
          ...prev,
          [typingChatId]: is_typing 
            ? [...(prev[typingChatId] || []), user_id]
            : (prev[typingChatId] || []).filter(id => id !== user_id)
        }));
        break;
        
      case 'message_read':
        // Handle read receipts
        console.log('Message read:', data.data);
        break;
        
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };
  
  const sendMessage = useCallback((type, data) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({ type, ...data }));
    }
  }, [socket, isConnected]);
  
  const subscribeToChat = useCallback((chatId) => {
    sendMessage('subscribe_chat', { chat_id: chatId });
  }, [sendMessage]);
  
  const unsubscribeFromChat = useCallback((chatId) => {
    sendMessage('unsubscribe_chat', { chat_id: chatId });
  }, [sendMessage]);
  
  const sendTypingIndicator = useCallback((chatId, isTyping) => {
    sendMessage('typing', { chat_id: chatId, is_typing: isTyping });
  }, [sendMessage]);
  
  const addMessageToChat = useCallback((chatId, message) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message]
    }));
  }, []);
  
  const initializeChatMessages = useCallback((chatId, messages) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: messages
    }));
  }, []);
  
  useEffect(() => {
    if (userId) {
      connect();
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userId, connect]);
  
  return {
    isConnected,
    messages,
    onlineUsers,
    typingUsers,
    subscribeToChat,
    unsubscribeFromChat,
    sendTypingIndicator,
    addMessageToChat,
    initializeChatMessages
  };
};

export default useChat;