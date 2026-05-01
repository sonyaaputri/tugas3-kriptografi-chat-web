import { useState } from 'react';

/**
 * @typedef {Object} SidebarProps
 * @property {'messages'|'contacts'|'settings'} [activeTab]
 * @property {(tab: 'messages'|'contacts'|'settings') => void} [onTabChange]
 * @property {string} [username]
 * @property {() => void} [onLogout]
 */

/**
 * @param {SidebarProps} props
 */
export function Sidebar({ activeTab = 'messages', onTabChange, username, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="w-16 bg-slate-900 flex flex-col items-center py-6 relative">
      <div className="flex-1 flex flex-col gap-4 pt-4">
        <button
          onClick={() => onTabChange?.('messages')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeTab === 'messages' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
        </button>

        <button
          onClick={() => onTabChange?.('contacts')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeTab === 'contacts' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        </button>

        <button
          onClick={() => onTabChange?.('settings')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeTab === 'settings' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {username && (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600 hover:border-slate-500 transition-colors"
          >
            <span className="text-white text-sm font-semibold">{username.charAt(0).toUpperCase()}</span>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute bottom-full left-full ml-2 mb-2 bg-white rounded-lg shadow-lg py-2 w-48 z-20">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{username}</p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onLogout?.();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
