import { useState, useCallback, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ContactsPage } from "./pages/ContactsPage";
import { ChatPage } from "./pages/ChatPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { login as loginApi, logout as logoutApi, register as registerApi } from "./api/authApi";
import { getContacts } from "./api/userApi";
import { getMessages, sendMessage } from "./api/messageApi";
import {
  computeSharedSecret,
  generateECDHKeyPair,
  exportPublicKey,
  exportPrivateKey,
  importPrivateKey,
  importPublicKey,
} from "./crypto/ecdh";
import { deriveAESKey, deriveHMACKey } from "./crypto/hkdf";
import { aesDecrypt, aesEncrypt } from "./crypto/aes";
import { computeMAC, verifyMAC } from "./crypto/mac";
import { decryptPrivateKey, encryptPrivateKey } from "./crypto/passwordKey";
import "./styles/main.css";

const SESSION_PRIVATE_KEY_KEY = "privateKeyBase64";

function macPayload({ ciphertext, iv, senderEmail, receiverEmail }) {
  return JSON.stringify({ ciphertext, iv, senderEmail, receiverEmail });
}

function AppContent() {
  const navigate = useNavigate();
  const keyCacheRef = useRef(new Map());

  useEffect(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  }, []);

  const [authToken, setAuthToken] = useState(() => {
    const stored = sessionStorage.getItem("authToken");
    return stored && stored !== "undefined" ? stored : null;
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = sessionStorage.getItem("user");
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
  const [privateKey, setPrivateKey] = useState(null);

  useEffect(() => {
    const privateKeyBase64 = sessionStorage.getItem(SESSION_PRIVATE_KEY_KEY);
    if (!privateKeyBase64) return;

    importPrivateKey(privateKeyBase64)
      .then(setPrivateKey)
      .catch((err) => {
        console.error("Failed to restore private key:", err);
        sessionStorage.removeItem(SESSION_PRIVATE_KEY_KEY);
      });
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      const result = await getContacts(authToken);
      const users = result.users || [];
      setContacts(users);
      setSelectedContact(prev =>
        prev ? users.find(user => user.email === prev.email) || prev : prev
      );
    } catch (err) {
      console.error("Failed to load contacts:", err);
    }
  }, [authToken]);

  const loadMessages = useCallback(async () => {
    try {
      if (!selectedContact) return;
      const result = await getMessages(selectedContact.email, authToken);
      setMessages(result.messages || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, [authToken, selectedContact]);

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
  }, [authToken, currentUser, loadContacts]);

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
  }, [selectedContact, authToken, loadMessages]);

  const handleLogin = async (email, password) => {
    const result = await loginApi(email, password);
    const privateKeyBase64 = await decryptPrivateKey(
      result.user.encryptedPrivateKey,
      result.user.iv,
      result.user.salt,
      password
    );
    const recoveredPrivateKey = await importPrivateKey(privateKeyBase64);

    sessionStorage.setItem("authToken", result.token);
    sessionStorage.setItem("user", JSON.stringify(result.user));
    sessionStorage.setItem(SESSION_PRIVATE_KEY_KEY, privateKeyBase64);
    keyCacheRef.current.clear();
    setAuthToken(result.token);
    setCurrentUser(result.user);
    setPrivateKey(recoveredPrivateKey);
    navigate("/contacts");
  };

  const handleRegister = async (username, email, password) => {
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
      username,
      email,
      password,
      publicKey,
      encryptedPrivateKey,
      iv,
      salt,
    });
    navigate("/login");
  };

  const handleLogout = async () => {
    const token = authToken;
    if (token) {
      try {
        await logoutApi(token);
      } catch (err) {
        console.error("Failed to notify server about logout:", err);
      }
    }

    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem(SESSION_PRIVATE_KEY_KEY);
    keyCacheRef.current.clear();
    setAuthToken(null);
    setCurrentUser(null);
    setPrivateKey(null);
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

  const getConversationKeys = useCallback(async (contact) => {
    if (!privateKey) {
      throw new Error("Private key is not available. Please log in again.");
    }
    if (!contact?.email || !contact?.publicKey) {
      throw new Error("Contact public key is not available.");
    }

    const cached = keyCacheRef.current.get(contact.email);
    if (cached) return cached;

    const publicKey = await importPublicKey(contact.publicKey);
    const sharedSecret = await computeSharedSecret(privateKey, publicKey);
    const keys = {
      aesKey: await deriveAESKey(sharedSecret),
      hmacKey: await deriveHMACKey(sharedSecret),
    };
    keyCacheRef.current.set(contact.email, keys);
    return keys;
  }, [privateKey]);

  const handleSendMessage = async (messageText) => {
    if (!selectedContact || !authToken) return;
    try {
      const { aesKey, hmacKey } = await getConversationKeys(selectedContact);
      const encrypted = await aesEncrypt(aesKey, messageText);
      const senderEmail = currentUser.email;
      const receiverEmail = selectedContact.email;
      const mac = await computeMAC(
        hmacKey,
        macPayload({
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          senderEmail,
          receiverEmail,
        })
      );

      await sendMessage(
        {
          receiverEmail,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          mac,
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

  const handleDecryptMessage = useCallback(async (message) => {
    const senderEmail = message.senderEmail || message.sender_email;
    const receiverEmail = message.receiverEmail || message.receiver_email;
    const otherEmail = senderEmail === currentUser.email ? receiverEmail : senderEmail;
    const contact = contacts.find((item) => item.email === otherEmail) || selectedContact;
    const { aesKey, hmacKey } = await getConversationKeys(contact);
    const validMac = await verifyMAC(
      hmacKey,
      macPayload({
        ciphertext: message.ciphertext,
        iv: message.iv,
        senderEmail,
        receiverEmail,
      }),
      message.mac
    );

    if (!validMac) {
      throw new Error("Invalid message MAC");
    }

    return aesDecrypt(aesKey, message.ciphertext, message.iv);
  }, [contacts, currentUser?.email, getConversationKeys, selectedContact]);

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
              username={currentUser?.username || currentUser?.email}
              email={currentUser?.email}
              contacts={contacts}
              onLogout={handleLogout}
              onSelectContact={handleSelectContact}
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
                currentUser={{ id: currentUser?.id, username: currentUser?.username || currentUser?.email, email: currentUser?.email }}
                contact={selectedContact}
                contacts={contacts}
                messages={messages}
                onSelectContact={handleSelectContact}
                onSendMessage={handleSendMessage}
                onLogout={handleLogout}
                onDecryptMessage={handleDecryptMessage}
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
