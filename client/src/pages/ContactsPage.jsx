import { AllContactsList } from '../components/AllContactsList';
import { ContactList } from '../components/ContactList';
import { Sidebar } from '../components/Sidebar';

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
 * @typedef {Object} ContactsPageProps
 * @property {string} email
 * @property {Contact[]} contacts
 * @property {() => void} onLogout
 * @property {(contact: Contact) => void} onSelectContact
 * @property {(email: string) => Promise<void>} onAddContact
 * @property {'messages'|'contacts'} [activeTab]
 * @property {(tab: 'messages'|'contacts') => void} [onTabChange]
 */

/**
 * @param {ContactsPageProps} props
 */
export function ContactsPage({
  email,
  contacts,
  onLogout,
  onSelectContact,
  onAddContact,
  activeTab = 'messages',
  onTabChange
}) {
  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar activeTab={activeTab} username={email} onLogout={onLogout} onTabChange={onTabChange} />

      <div className="w-80 flex-shrink-0">
        {activeTab === 'contacts' ? (
          <AllContactsList
            contacts={contacts}
            onSelectContact={onSelectContact}
            onAddContact={onAddContact}
            currentUsername={email}
          />
        ) : (
          <ContactList
            contacts={contacts}
            onSelectContact={onSelectContact}
          />
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {activeTab === 'contacts' ? 'Select a contact' : 'Select a chat'}
          </h2>
          <p className="text-sm text-gray-500">
            {activeTab === 'contacts'
              ? 'Click a contact to start a new conversation'
              : 'Choose a conversation from the list to start messaging'}
          </p>
        </div>
      </div>
    </div>
  );
}
