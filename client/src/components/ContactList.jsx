import { useState } from 'react';

export function ContactList({ contacts, onSelectContact, selectedContactId }) {
  const [searchQuery, setSearchQuery] = useState('');

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

  const conversationContacts = contacts.filter(c => c.lastMessage);

  const filtered = conversationContacts.filter(c =>
    (c.email || c.username || '').toLowerCase().includes(searchQuery.toLowerCase())
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
          Messages
        </h2>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
            width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations"
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

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8' }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
              style={{ margin: '0 auto 12px', display: 'block', color: '#CBD5E1' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>No conversations yet</p>
          </div>
        ) : (
          filtered.map(contact => {
            const isSelected = selectedContactId === contact.email;
            const initial = (contact.email || contact.username || 'U').charAt(0).toUpperCase();

            return (
              <button
                key={contact.email}
                onClick={() => onSelectContact(contact)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isSelected ? '#2563EB' : 'transparent',
                  border: 'none',
                  borderLeft: isSelected ? '3px solid #1D4ED8' : '3px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: isSelected ? '#FFFFFF' : '#475569'
                  }}>
                    {initial}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 1, right: 1,
                    width: '11px', height: '11px',
                    borderRadius: '50%',
                    background: '#22C55E',
                    border: '2px solid white'
                  }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{
                      fontSize: '14px', fontWeight: '600',
                      color: isSelected ? '#FFFFFF' : '#0F172A',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {contact.email || contact.username}
                    </span>
                    {contact.lastMessageTime && (
                      <span style={{ fontSize: '12px', color: isSelected ? 'rgba(255,255,255,0.75)' : '#94A3B8', flexShrink: 0, marginLeft: '8px' }}>
                        {formatTime(contact.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  {contact.lastMessage && (
                    <p style={{
                      margin: 0, fontSize: '13px',
                      color: isSelected ? 'rgba(255,255,255,0.75)' : '#64748B',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {contact.lastMessage}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}