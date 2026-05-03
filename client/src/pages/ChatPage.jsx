import { useEffect, useRef, useState } from 'react';
import { ContactList } from '../components/ContactList';
import { Sidebar } from '../components/Sidebar';

export function ChatPage({
  currentUser,
  contact,
  contacts,
  messages,
  onSelectContact,
  onSendMessage,
  onLogout,
  onDecryptMessage,
  activeTab = 'messages',
  onTabChange
}) {
  const [decryptedMessages, setDecryptedMessages] = useState(new Map());
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const decryptMessages = async () => {
      for (const message of messages) {
        if (!decryptedMessages.has(message.id)) {
          try {
            const decrypted = await onDecryptMessage(message);
            setDecryptedMessages(prev => new Map(prev).set(message.id, { content: decrypted, failed: false }));
          } catch {
            setDecryptedMessages(prev => new Map(prev).set(message.id, { content: '', failed: true }));
          }
        }
      }
    };
    decryptMessages();
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!messageText.trim() || sendingMessage) return;
    setSendingMessage(true);
    try {
      await onSendMessage(messageText.trim());
      setMessageText('');
    } catch {}
    finally { setSendingMessage(false); }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      background: '#F8FAFC',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} username={currentUser.username} onLogout={onLogout} onTabChange={onTabChange} />

      {/* Contact list panel */}
      <div style={{ width: '300px', flexShrink: 0 }}>
        <ContactList
          contacts={contacts}
          onSelectContact={onSelectContact}
          selectedContactId={contact.email}
        />
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F1F5F9', minWidth: 0 }}>
        {/* Chat header */}
        <div style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0
        }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            background: '#E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', fontWeight: '600', color: '#475569', flexShrink: 0
          }}>
            {(contact.email || contact.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>
              {contact.email || contact.username}
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#22C55E', fontWeight: '500' }}>Online</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 16px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '60px', color: '#94A3B8' }}>
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
                style={{ margin: '0 auto 12px', display: 'block', color: '#CBD5E1' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p style={{ fontSize: '14px', margin: 0 }}>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map(message => {
              const decryptedData = decryptedMessages.get(message.id);
              const isSent = message.sender_email === currentUser.username;
              const content = decryptedData?.content || message.ciphertext;

              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: isSent ? 'flex-end' : 'flex-start',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ maxWidth: '60%' }}>
                    <div style={{
                      padding: '10px 16px',
                      borderRadius: isSent ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isSent ? '#2563EB' : '#FFFFFF',
                      color: isSent ? '#FFFFFF' : '#0F172A',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      border: isSent ? 'none' : '1px solid #E2E8F0',
                      wordBreak: 'break-word'
                    }}>
                      {decryptedData?.failed ? (
                        <span style={{ color: '#EF4444', fontSize: '13px' }}>Failed to decrypt message</span>
                      ) : content}
                    </div>
                    <p style={{
                      margin: '4px 8px 0',
                      fontSize: '11px',
                      color: '#94A3B8',
                      textAlign: isSent ? 'right' : 'left'
                    }}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div style={{
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0
        }}>
          <input
            type="text"
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message"
            disabled={sendingMessage}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: '#F1F5F9',
              border: '1.5px solid transparent',
              borderRadius: '12px',
              fontSize: '14px',
              color: '#0F172A',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#3B82F6'}
            onBlur={e => e.target.style.borderColor = 'transparent'}
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || sendingMessage}
            style={{
              width: '44px', height: '44px',
              borderRadius: '12px',
              background: messageText.trim() && !sendingMessage ? '#2563EB' : '#E2E8F0',
              border: 'none',
              cursor: messageText.trim() && !sendingMessage ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.2s, transform 0.1s'
            }}
            onMouseEnter={e => { if (messageText.trim()) e.currentTarget.style.background = '#1D4ED8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = messageText.trim() ? '#2563EB' : '#E2E8F0'; }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={messageText.trim() ? '#FFFFFF' : '#94A3B8'} strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}