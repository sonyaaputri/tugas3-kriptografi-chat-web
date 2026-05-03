import { useState } from 'react';

export function Sidebar({ activeTab = 'messages', onTabChange, username, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  const btnStyle = (active) => ({
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
    background: active ? '#2563EB' : 'transparent',
    color: active ? '#FFFFFF' : '#94A3B8',
  });

  return (
    <div style={{
      width: '64px',
      background: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '20px',
      paddingBottom: '20px',
      flexShrink: 0,
      position: 'relative'
    }}>
      {/* Nav buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {/* Messages */}
        <button
          onClick={() => onTabChange?.('messages')}
          style={btnStyle(activeTab === 'messages')}
          title="Messages"
          onMouseEnter={e => {
            if (activeTab !== 'messages') e.currentTarget.style.background = '#1E293B';
          }}
          onMouseLeave={e => {
            if (activeTab !== 'messages') e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
        </button>

        {/* Contacts */}
        <button
          onClick={() => onTabChange?.('contacts')}
          style={btnStyle(activeTab === 'contacts')}
          title="Contacts"
          onMouseEnter={e => {
            if (activeTab !== 'contacts') e.currentTarget.style.background = '#1E293B';
          }}
          onMouseLeave={e => {
            if (activeTab !== 'contacts') e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Avatar / Profile */}
      {username && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#334155',
              border: '2px solid #475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: '600'
            }}
          >
            {username.charAt(0).toUpperCase()}
          </button>

          {showMenu && (
            <>
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 10
                }}
                onClick={() => setShowMenu(false)}
              />
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '52px',
                background: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                padding: '8px 0',
                minWidth: '180px',
                zIndex: 20
              }}>
                <div style={{
                  padding: '10px 16px 10px',
                  borderBottom: '1px solid #F1F5F9'
                }}>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#0F172A' }}>
                    {username}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>Online</p>
                </div>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onLogout?.();
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#EF4444',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}