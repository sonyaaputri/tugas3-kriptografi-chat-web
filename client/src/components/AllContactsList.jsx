import { useState } from 'react';
import { ErrorMessage } from './ErrorMessage';

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
 * @typedef {Object} AllContactsListProps
 * @property {Contact[]} contacts
 * @property {(contact: Contact) => void} onSelectContact
 * @property {(email: string) => Promise<void>} onAddContact
 * @property {string} currentUsername
 */

/**
 * @param {AllContactsListProps} props
 */
export function AllContactsList({ contacts, onSelectContact, onAddContact, currentUsername }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * @param {React.FormEvent} e
   */
  const handleAddContact = async (e) => {
    e.preventDefault();
    setError('');

    if (!newContactEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!newContactEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (newContactEmail.trim() === currentUsername) {
      setError('You cannot add yourself as a contact');
      return;
    }

    setLoading(true);
    try {
      await onAddContact(newContactEmail.trim());
      setNewContactEmail('');
      setShowAddModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    (contact.email || contact.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="h-full bg-white flex flex-col border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 space-y-3">
          <h2 className="text-lg font-bold text-gray-900">All Contacts</h2>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search contacts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Contact
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm font-medium text-gray-700">No contacts found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.email}
                  onClick={() => onSelectContact(contact)}
                  className="w-full p-3 hover:bg-blue-50 transition-colors flex items-center gap-3 text-left border-l-4 border-transparent hover:border-blue-500"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {(contact.email || contact.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{contact.email || contact.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Contact</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError('');
                  setNewContactEmail('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label htmlFor="contactUsername" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && <ErrorMessage message={error} />}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                    setNewContactEmail('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg transition"
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
