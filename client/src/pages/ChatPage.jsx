import { useEffect, useRef, useState } from 'react';
import { ChatBox } from '../components/ChatBox';
import { ContactList } from '../components/ContactList';
import { MessageBubble } from '../components/MessageBubble';
import { Sidebar } from '../components/Sidebar';

/**
 * @typedef {Object} Message
 * @property {number} id
 * @property {number} senderId
 * @property {number} receiverId
 * @property {string} encryptedContent
 * @property {string} timestamp
 * @property {string} [decryptedContent]
 * @property {boolean} [decryptionFailed]
 */

/**
 * @typedef {Object} Contact
 * @property {number} id
 * @property {string} username
 * @property {string} publicKey
 * @property {string} [lastMessage]
 * @property {string} [lastMessageTime]
 * @property {number} [unreadCount]
 */

/**
 * @typedef {Object} ChatPageProps
 * @property {{ id: number; username: string }} currentUser
 * @property {Contact} contact
 * @property {Contact[]} contacts
 * @property {Message[]} messages
 * @property {(contact: Contact) => void} onSelectContact
 * @property {(message: string) => Promise<void>} onSendMessage
 * @property {() => void} onLogout
 * @property {(message: Message) => Promise<string>} onDecryptMessage
 * @property {'messages'|'contacts'} [activeTab]
 * @property {(tab: 'messages'|'contacts') => void} [onTabChange]
 */

/**
 * @param {ChatPageProps} props
 */
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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const decryptMessages = async () => {
      for (const message of messages) {
        if (!decryptedMessages.has(message.id)) {
          try {
            const decrypted = await onDecryptMessage(message);
            setDecryptedMessages(prev => new Map(prev).set(message.id, { content: decrypted, failed: false }));
          } catch (error) {
            console.error('Decryption failed:', error);
            setDecryptedMessages(prev => new Map(prev).set(message.id, { content: '', failed: true }));
          }
        }
      }
    };

    decryptMessages();
  }, [messages, onDecryptMessage, decryptedMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * @param {string} message
   */
  const handleSendMessage = async (message) => {
    setSendingMessage(true);
    try {
      await onSendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar activeTab={activeTab} username={currentUser.username} onLogout={onLogout} onTabChange={onTabChange} />

      <div className="w-80 flex-shrink-0">
        <ContactList
          contacts={contacts}
          onSelectContact={onSelectContact}
          selectedContactId={contact.id}
        />
      </div>

      <div className="flex-1 flex flex-col bg-gray-100">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
              <span className="font-semibold">{contact.username.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{contact.username}</h2>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 text-sm">No messages yet</p>
              <p className="text-gray-400 text-xs mt-1">Send a message to start the conversation</p>
            </div>
          ) : (
            messages.map((message) => {
              const decryptedData = decryptedMessages.get(message.id);
              const isSent = message.senderId === currentUser.id;

              return (
                <MessageBubble
                  key={message.id}
                  message={decryptedData?.content || 'Decrypting...'}
                  timestamp={message.timestamp}
                  isSent={isSent}
                  isEncrypted={true}
                  decryptionFailed={decryptedData?.failed || false}
                />
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatBox onSendMessage={handleSendMessage} disabled={sendingMessage} />
      </div>
    </div>
  );
}
