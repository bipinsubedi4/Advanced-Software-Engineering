import React, { useState } from 'react';
import { FaPaperPlane, FaSearch, FaCircle } from 'react-icons/fa';
import { format } from 'date-fns';

interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: number;
  customerId: number;
  customerName: string;
  customerImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

const Messages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState('');

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      customerId: 101,
      customerName: 'John Smith',
      customerImage: '/api/placeholder/50/50',
      lastMessage: 'Thanks! See you tomorrow.',
      lastMessageTime: '2024-01-20T14:30:00',
      unreadCount: 2,
      messages: [
        {
          id: 1,
          senderId: 101,
          content: 'Hi! I have a booking for tomorrow at 10 AM. Can you confirm?',
          timestamp: '2024-01-20T14:15:00',
          isRead: true,
        },
        {
          id: 2,
          senderId: 0, // Current user (provider)
          content: 'Yes, confirmed! I\'ll be there at 10 AM sharp.',
          timestamp: '2024-01-20T14:20:00',
          isRead: true,
        },
        {
          id: 3,
          senderId: 101,
          content: 'Great! Do you need any special cleaning products?',
          timestamp: '2024-01-20T14:25:00',
          isRead: true,
        },
        {
          id: 4,
          senderId: 0,
          content: 'I bring all my own eco-friendly products. No worries!',
          timestamp: '2024-01-20T14:28:00',
          isRead: true,
        },
        {
          id: 5,
          senderId: 101,
          content: 'Thanks! See you tomorrow.',
          timestamp: '2024-01-20T14:30:00',
          isRead: false,
        },
      ],
    },
    {
      id: 2,
      customerId: 102,
      customerName: 'Emily Davis',
      customerImage: '/api/placeholder/50/50',
      lastMessage: 'Perfect, thank you!',
      lastMessageTime: '2024-01-19T16:45:00',
      unreadCount: 0,
      messages: [
        {
          id: 6,
          senderId: 102,
          content: 'Can we reschedule to next week?',
          timestamp: '2024-01-19T16:30:00',
          isRead: true,
        },
        {
          id: 7,
          senderId: 0,
          content: 'Sure! How about Wednesday at 2 PM?',
          timestamp: '2024-01-19T16:40:00',
          isRead: true,
        },
        {
          id: 8,
          senderId: 102,
          content: 'Perfect, thank you!',
          timestamp: '2024-01-19T16:45:00',
          isRead: true,
        },
      ],
    },
    {
      id: 3,
      customerId: 103,
      customerName: 'Michael Brown',
      customerImage: '/api/placeholder/50/50',
      lastMessage: 'Looking forward to it!',
      lastMessageTime: '2024-01-18T10:20:00',
      unreadCount: 0,
      messages: [
        {
          id: 9,
          senderId: 103,
          content: 'Hi! I just booked your service for next Friday.',
          timestamp: '2024-01-18T10:15:00',
          isRead: true,
        },
        {
          id: 10,
          senderId: 0,
          content: 'Thank you! I\'ve received your booking.',
          timestamp: '2024-01-18T10:18:00',
          isRead: true,
        },
        {
          id: 11,
          senderId: 103,
          content: 'Looking forward to it!',
          timestamp: '2024-01-18T10:20:00',
          isRead: true,
        },
      ],
    },
  ]);

  const filteredConversations = conversations.filter(conv =>
    conv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now(),
      senderId: 0, // Current user (provider)
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true,
    };

    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation
          ? {
              ...conv,
              messages: [...conv.messages, message],
              lastMessage: newMessage,
              lastMessageTime: message.timestamp,
            }
          : conv
      )
    );

    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversation Items */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map(conversation => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={conversation.customerImage}
                        alt={conversation.customerName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conversation.customerName}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {format(new Date(conversation.lastMessageTime), 'MMM d')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full ml-2">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Thread */}
            <div className="md:col-span-2 flex flex-col">
              {currentConversation ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                      <img
                        src={currentConversation.customerImage}
                        alt={currentConversation.customerName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {currentConversation.customerName}
                        </h3>
                        <div className="flex items-center text-sm text-green-600">
                          <FaCircle size={8} className="mr-1" />
                          Active
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {currentConversation.messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === 0
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === 0 ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {format(new Date(message.timestamp), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <FaPaperPlane className="mr-2" />
                        Send
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <p>Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

