/**
 * @typedef {Object} MessageBubbleProps
 * @property {string} message
 * @property {string} timestamp
 * @property {boolean} isSent
 * @property {boolean} [isEncrypted]
 * @property {boolean} [decryptionFailed]
 */

/**
 * @param {MessageBubbleProps} props
 */
export function MessageBubble({
  message,
  timestamp,
  isSent,
  isEncrypted = true,
  decryptionFailed = false
}) {
  /**
   * @param {string} dateString
   * @returns {string}
   */
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-xs lg:max-w-md ${isSent ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            decryptionFailed
              ? 'bg-red-100 border border-red-300'
              : isSent
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-900 border border-gray-200'
          }`}
        >
          {decryptionFailed ? (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-800">Failed to decrypt message</span>
            </div>
          ) : (
            <p className="break-words text-sm leading-relaxed">{message}</p>
          )}
        </div>
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isSent ? 'justify-end' : 'justify-start'}`}>
          <span>{formatTime(timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
