# Tugas 3 Kriptografi - Aplikasi Chat Web Aman

## Deskripsi
Proyek ini merupakan implementasi aplikasi chat berbasis web yang aman menggunakan konsep kriptografi modern. Aplikasi ini mendukung komunikasi terenkripsi end-to-end dengan memanfaatkan berbagai algoritma kriptografi.

## Fitur Keamanan
- JSON Web Token (JWT) Authentication (ES256/ES384/ES512)
- Elliptic Curve Diffie-Hellman (ECDH) Key Exchange
- HKDF untuk derivasi kunci
- AES-256 untuk enkripsi pesan
- Message Authentication Code (MAC / HMAC) untuk integritas pesan

## Arsitektur
Aplikasi menggunakan arsitektur client-server:

- Frontend: React (Vite)
- Backend: Node.js (Express)
- Database: PostgreSQL

## Struktur Proyek
client/ -> Frontend React
server/ -> Backend API + JWT + Database
docs/ -> Dokumentasi dan laporan
release/ -> File untuk submission


## Pembagian Tugas
- Frontend: UI, enkripsi pesan (AES)
- Backend: API, database, autentikasi
- Crypto/JWT: JWT library, ECDH, HKDF, MAC, testing

## Cara Menjalankan (sementara)

### Frontend
cd client
npm install
npm run dev


### Backend
cd server
npm install
node src/index.js


## Testing
- Unit test JWT (sign & verify)
- Testing enkripsi dan dekripsi pesan
- Validasi MAC

## Status
Project masih dalam tahap pengembangan

## 📎 Catatan
Dokumentasi lengkap dan laporan terdapat pada folder `docs/`.