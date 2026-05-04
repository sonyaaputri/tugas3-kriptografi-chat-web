import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ContactsPage } from "./pages/ContactsPage";
import { ChatPage } from "./pages/ChatPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { login as loginApi, register as registerApi } from "./api/authApi";
import { getContacts } from "./api/userApi";
import { getMessages, sendMessage } from "./api/messageApi";
import { generateECDHKeyPair, exportPublicKey, exportPrivateKey } from "./crypto/ecdh";
import { encryptPrivateKey } from "./crypto/passwordKey";
import "./styles/main.css";

function AppContent() {
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState(() => {
    const stored = localStorage.getItem("authToken");
    return stored && stored !== "undefined" ? stored : null;
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("user");
    try {
      return stored && stored !== "undefined" ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("Failed to parse user from storage:", err);
      return null;
    }
  });
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("messages");
  const [loading, setLoading] = useState(false);

  // Load daftar kontak saat user berhasil login
  useEffect(() => {
    if (authToken && currentUser) {
      loadContacts();
      
      // Poll untuk kontak dan chat history baru setiap 3 detik
      const contactPollingInterval = setInterval(() => {
        loadContacts();
      }, 3000);

      return () => clearInterval(contactPollingInterval);
    }
  }, [authToken, currentUser]);

  // Load pesan saat kontak dipilih
  useEffect(() => {
    if (selectedContact && authToken) {
      loadMessages();
      
      // Poll untuk messages baru setiap 2 detik
      const messagePollingInterval = setInterval(() => {
        loadMessages();
      }, 2000);

      return () => clearInterval(messagePollingInterval);
    }
  }, [selectedContact, authToken]);

  const loadContacts = async () => {
    try {
      const result = await getContacts(authToken);
      setContacts(result.users || []);
    } catch (err) {
      console.error("Failed to load contacts:", err);
    }
  };

  const loadMessages = async () => {
    try {
      if (!selectedContact) return;
      const result = await getMessages(selectedContact.email, authToken);
      setMessages(result.messages || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const result = await loginApi(email, password);
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      setAuthToken(result.token);
      setCurrentUser(result.user);
      navigate("/contacts");
    } catch (err) {
      throw err;
    }
  };

  const handleRegister = async (email, password) => {
    try {
      // Generate pasangan kunci ECDH
      const keyPair = await generateECDHKeyPair();
      
      // Export public key ke format base64
      const publicKey = await exportPublicKey(keyPair.publicKey);
      
      // Export private key ke format base64
      const privateKeyBase64 = await exportPrivateKey(keyPair.privateKey);
      
      // Enkripsi private key menggunakan password user
      const { encryptedPrivateKey, iv, salt } = await encryptPrivateKey(privateKeyBase64, password);
      
      // Kirim data registrasi ke server
      await registerApi({
        email,
        password,
        publicKey,
        encryptedPrivateKey,
        kdfParams: { iv, salt },
      });
      navigate("/login");
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setAuthToken(null);
    setCurrentUser(null);
    setContacts([]);
    setSelectedContact(null);
    setMessages([]);
    navigate("/login");
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setActiveTab("messages");
    navigate("/chat");
  };

  const handleSendMessage = async (messageText) => {
    if (!selectedContact || !authToken) return;
    try {
      await sendMessage(
        {
          receiverEmail: selectedContact.email,
          ciphertext: messageText,
          iv: "", // Generate IV
          mac: "", // Generate MAC
        },
        authToken
      );
      await loadMessages();
      await loadContacts();  // Refresh contact list untuk update lastMessage
    } catch (err) {
      console.error("Failed to send message:", err);
      throw err;
    }
  };

  const handleDecryptMessage = async (message) => {
    // Dekripsi pesan
    return message.ciphertext || "...";
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <LoginPage
            onLogin={handleLogin}
            onNavigateToRegister={() => navigate("/register")}
          />
        }
      />
      <Route
        path="/register"
        element={
          <RegisterPage
            onRegister={handleRegister}
            onNavigateToLogin={() => navigate("/login")}
          />
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <ContactsPage
              username={currentUser?.email}
              contacts={contacts}
              onLogout={handleLogout}
              onSelectContact={handleSelectContact}
              onAddContact={() => loadContacts()}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            {selectedContact ? (
              <ChatPage
                currentUser={{ id: currentUser?.id, username: currentUser?.email }}
                contact={selectedContact}
                contacts={contacts}
                messages={messages}
                onSelectContact={handleSelectContact}
                onSendMessage={handleSendMessage}
                onLogout={handleLogout}
                onDecryptMessage={handleDecryptMessage}
                onAddContact={() => loadContacts()}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            ) : (
              <Navigate to="/contacts" replace />
            )}
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}