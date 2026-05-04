import { useState } from 'react';
import { ErrorMessage } from './ErrorMessage';

export function AllContactsList({ contacts, onSelectContact, onAddContact, currentUsername, onTabChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddContact = async (e) => {
    e.preventDefault();
    setError('');

    if (!newContactEmail.trim()) {
      setError('Please enter a username');
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

  const filteredContacts = contacts.filter(c =>
    (c.email || c.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
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

          {/* Add Contact button */}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              width: '100%',
              padding: '10px',
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Contact
          </button>
        </div>

        {/* Contact list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredContacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8' }}>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>No contacts found</p>
            </div>
          ) : (
            filteredContacts.map(contact => {
              const label = contact.email || contact.username || 'U';
              const initial = label.charAt(0).toUpperCase();
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
                      background: '#22C55E',
                      border: '2px solid white'
                    }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94A3B8' }}>Click to start chat</p>
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

      {/* Add Contact Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 50
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            padding: '36px',
            width: '100%',
            maxWidth: '420px',
            fontFamily: "'Segoe UI', system-ui, sans-serif"
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#0F172A' }}>Add Contact</h2>
              <button
                onClick={() => { setShowAddModal(false); setError(''); setNewContactEmail(''); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#94A3B8', display: 'flex', padding: '4px'
                }}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={newContactEmail}
                  onChange={e => setNewContactEmail(e.target.value)}
                  placeholder="Enter username"
                  disabled={loading}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#FAFAFA'
                  }}
                  onFocus={e => e.target.style.borderColor = '#3B82F6'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              {error && <ErrorMessage message={error} />}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setError(''); setNewContactEmail(''); }}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#FFFFFF',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    color: '#374151'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: loading ? '#93C5FD' : '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.background = '#1D4ED8')}
                  onMouseLeave={e => !loading && (e.currentTarget.style.background = '#2563EB')}
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