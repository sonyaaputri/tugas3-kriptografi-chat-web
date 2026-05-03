import { useState } from 'react';

/**
 * @typedef {Object} Contact
 * @property {string} email
 * @property {string} publicKey
 * @property {string} [username]
 * @property {string} [lastMessage]
 * @property {string} [lastMessageTime]
 * @property {number} [unreadCount]
 */

/**
 * @typedef {Object} ContactListProps
 * @property {Contact[]} contacts
 * @property {(contact: Contact) => void} onSelectContact
 * @property {string} [selectedContactId]
 */

/**
 * @param {ContactListProps} props
 */
export function ContactList({ contacts, onSelectContact, selectedContactId }) {
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * @param {string} [dateString]
   * @returns {string}
   */
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredContacts = contacts.filter(contact =>
    (contact.email || contact.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const conversationContacts = contacts.filter(contact => contact.lastMessage);

  return (
    <div className="h-full bg-white flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Messages</h2>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversationContacts.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">No conversations yet</p>
            <p className="text-xs text-gray-500 mt-1">Start chatting with your contacts</p>
          </div>
        ) : (
          conversationContacts
            .filter(contact => (contact.email || contact.username || '').toLowerCase().includes(searchQuery.toLowerCase()))
            .map((contact) => (
            <button
              key={contact.email}
              onClick={() => onSelectContact(contact)}
              className={`w-full px-4 py-3 hover:bg-gray-50 transition-all text-left ${
                selectedContactId === contact.email ? 'bg-blue-500 hover:bg-blue-500' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                    selectedContactId === contact.email ? 'bg-white text-blue-500' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {(contact.email || contact.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className={`font-semibold truncate text-sm ${
                      selectedContactId === contact.id ? 'text-white' : 'text-gray-900'
                    }`}>{contact.email || contact.username}</h3>
                    {contact.lastMessageTime && (
                      <span className={`text-xs ml-2 flex-shrink-0 ${
                        selectedContactId === contact.id ? 'text-white/80' : 'text-gray-500'
                      }`}>{formatTime(contact.lastMessageTime)}</span>
                    )}
                  </div>
                  {contact.lastMessage && (
                    <p className={`text-xs truncate ${
                      selectedContactId === contact.id ? 'text-white/80' : 'text-gray-500'
                    }`}>{contact.lastMessage}</p>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
