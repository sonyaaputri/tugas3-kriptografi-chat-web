import { AllContactsList } from '../components/AllContactsList';
import { ContactList } from '../components/ContactList';
import { Sidebar } from '../components/Sidebar';

export function ContactsPage({
  username,
  contacts,
  onLogout,
  onSelectContact,
  onAddContact,
  activeTab = 'messages',
  onTabChange
}) {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      background: '#F8FAFC',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} username={username} onLogout={onLogout} onTabChange={onTabChange} />

      {/* Panel */}
      <div style={{ width: '300px', flexShrink: 0 }}>
        {activeTab === 'contacts' ? (
          <AllContactsList
            contacts={contacts}
            onSelectContact={onSelectContact}
            onAddContact={onAddContact}
            currentUsername={username}
          />
        ) : (
          <ContactList
            contacts={contacts}
            onSelectContact={onSelectContact}
          />
        )}
      </div>

      {/* Empty state */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F1F5F9',
        color: '#94A3B8'
      }}>
        <div style={{
          width: '80px', height: '80px',
          borderRadius: '50%',
          background: '#E2E8F0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#CBD5E1" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#475569', margin: '0 0 8px 0' }}>
          {activeTab === 'contacts' ? 'Select a contact' : 'Select a chat'}
        </h2>
        <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0, textAlign: 'center', maxWidth: '260px' }}>
          {activeTab === 'contacts'
            ? 'Click a contact to start a new conversation'
            : 'Choose a conversation from the list to start messaging'}
        </p>
      </div>
    </div>
  );
}