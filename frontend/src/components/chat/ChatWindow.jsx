import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ArrowLeft, MessageCircle, PenSquare, Search, Send, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../socket';
import './ChatWindow.css';

export default function ChatWindow() {
  const { user: currentUser, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const messagesEndRef = useRef(null);
  const searchTimeout = useRef(null);
  const selectedUserRef = useRef(null);
  const currentUserRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    if (!token || !currentUser) return undefined;

    const socket = getSocket(token);
    socket.emit('join', currentUser.id);

    const handleNewMessage = (message) => {
      const activeUser = selectedUserRef.current;
      const loggedInUser = currentUserRef.current;
      const belongsToActiveConversation = activeUser && loggedInUser && (
        (message.senderId === activeUser.id && message.receiverId === loggedInUser.id) ||
        (message.senderId === loggedInUser.id && message.receiverId === activeUser.id)
      );

      if (belongsToActiveConversation) {
        setMessages((prev) => {
          const exists = prev.find((item) => item.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
      }

      fetchConversations();

      if (activeUser?.id === message.senderId) {
        axios.put(`/api/chat/read/${message.senderId}`).catch(() => {});
      }
    };

    socket.on("connect", () => socket.emit("join", currentUser.id));
    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("connect");
      socket.off("message:new", handleNewMessage);
    };
  }, [token, currentUser]);

  useEffect(() => {
    const toggleChat = () => setIsOpen((prev) => !prev);
    window.addEventListener('medicare:toggle-chat', toggleChat);
    return () => window.removeEventListener('medicare:toggle-chat', toggleChat);
  }, []);

  useEffect(() => {
    if (isOpen) fetchConversations();
  }, [isOpen]);

  useEffect(() => {
    if (selectedUser) fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get('/api/chat/conversations');
      setConversations(data.success && data.conversations ? data.conversations : []);
    } catch (err) {
      console.error('Error fetching conversations:', err.response?.data || err.message);
      setConversations([]);
    }
  };

  const fetchMessages = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/chat/messages/${selectedUser.id}`);
      setMessages(data.success && data.messages ? data.messages : []);
    } catch (err) {
      console.error('Error fetching messages:', err.response?.data || err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const { data } = await axios.get(`/api/users/search?q=${query}`);
      if (data.success) setSearchResults(data.users);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchUsers(value), 350);
  };

  const startNewChat = (user) => {
    setSelectedUser(user);
    setShowNewChat(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const { data } = await axios.post('/api/chat/send', {
        receiverId: selectedUser.id,
        content: newMessage
      });

      setMessages((prev) => {
        const exists = prev.find((message) => message.id === data.message.id);
        if (exists) return prev;
        return [...prev, data.message];
      });
      setNewMessage('');
      fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err.response?.data || err.message);
      alert('Failed to send message. Please try again.');
    }
  };

  const formatTime = (date) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const unreadCount = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);

  return (
    <>
      <button className="chat-toggle-btn" type="button" onClick={() => setIsOpen((prev) => !prev)} aria-label="Open messages">
        <MessageCircle size={28} strokeWidth={2.1} />
        {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3><MessageCircle size={18} /> Messages</h3>
            <div className="chat-header-actions">
              <button
                className="new-chat-btn"
                type="button"
                onClick={() => setShowNewChat((prev) => !prev)}
                title="New conversation"
              >
                <PenSquare size={17} />
              </button>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close messages">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="chat-body">
            <div className={`conversations-list ${selectedUser ? 'conversations-list-mobile-hidden' : ''}`}>
              {showNewChat && (
                <div className="new-chat-panel">
                  <div className="new-chat-search">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search doctors or patients..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      autoFocus
                    />
                  </div>
                  <div className="search-results">
                    {searching && <div className="searching-text">Searching...</div>}
                    {!searching && searchQuery && searchResults.length === 0 && (
                      <div className="no-results">No users found</div>
                    )}
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="search-result-item"
                        onClick={() => startNewChat(user)}
                      >
                        <div className="search-avatar">{user.name[0].toUpperCase()}</div>
                        <div className="search-user-info">
                          <div className="search-user-name">{user.name}</div>
                          <div className="search-user-role">{user.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!showNewChat && (
                conversations.length === 0 ? (
                  <div className="no-conversations">
                    <div className="no-conversations-icon"><MessageCircle size={42} /></div>
                    <div className="no-conversations-text">No conversations yet</div>
                    <div className="no-conversations-hint">Use the compose button to start a conversation.</div>
                  </div>
                ) : (
                  conversations
                    .filter((conversation) => conversation.participant != null)
                    .map((conversation) => (
                      <div
                        key={conversation.participant.id}
                        className={`conversation-item ${selectedUser?.id === conversation.participant.id ? 'active' : ''}`}
                        onClick={() => setSelectedUser(conversation.participant)}
                      >
                        <div className="conversation-avatar">
                          {conversation.participant.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="conversation-info">
                          <div className="conversation-name">{conversation.participant.name ?? 'Unknown'}</div>
                          <div className="conversation-last-message">{conversation.lastMessage?.content}</div>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="unread-badge">{conversation.unreadCount}</span>
                        )}
                      </div>
                    ))
                )
              )}
            </div>

            {selectedUser ? (
              <div className="messages-area">
                <div className="messages-header">
                  <button className="back-btn" type="button" onClick={() => setSelectedUser(null)} aria-label="Back to conversations">
                    <ArrowLeft size={18} />
                  </button>
                  <div className="message-user-info">
                    <div className="message-user-avatar">{selectedUser.name?.[0]?.toUpperCase() ?? '?'}</div>
                    <div>
                      <span className="message-user-name">{selectedUser.name}</span>
                      <span className="message-user-role">{selectedUser.role}</span>
                    </div>
                  </div>
                </div>

                <div className="messages-container">
                  {loading ? (
                    <div className="loading-messages">Loading...</div>
                  ) : messages.length === 0 ? (
                    <div className="no-messages-yet">Start the conversation with {selectedUser.name}.</div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${message.senderId === currentUser?.id ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">{message.content}</div>
                        <div className="message-meta">
                          <span className="message-time">{formatTime(message.createdAt || message.created_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="message-input-form" onSubmit={sendMessage}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    placeholder="Type a message..."
                  />
                  <button type="submit" aria-label="Send message">
                    <Send size={18} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="no-conversation">
                <MessageCircle size={32} />
                <div>Select a conversation to start messaging.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
