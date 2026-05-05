import { useState } from 'react';

export function AllContactsList({ contacts, onSelectContact, onTabChange }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(c =>
    `${c.username || ''} ${c.email || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      height: '100%',
      background: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #E2E8F0',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #F1F5F9' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>
          All Contacts
        </h2>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
            width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search contacts"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Contact list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredContacts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8' }}>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>No contacts found</p>
          </div>
        ) : (
          filteredContacts.map(contact => {
            const label = contact.username || contact.email || 'U';
            const initial = label.charAt(0).toUpperCase();
            const isOnline = contact.isOnline === true;
            return (
              <button
                key={contact.email || contact.username}
                onClick={() => {
                  onSelectContact(contact);
                  onTabChange?.('messages');
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #F8FAFC',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#475569'
                  }}>
                    {initial}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 1, right: 1,
                    width: '11px', height: '11px',
                    borderRadius: '50%',
                    background: isOnline ? '#22C55E' : '#EF4444',
                    border: '2px solid white'
                  }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {contact.email}
                  </p>
                </div>

                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#CBD5E1" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
