# SecureChat — Aplikasi Chat Web

Implementasi aplikasi chat berbasis web dengan enkripsi end-to-end menggunakan algoritma kriptografi modern sebagai tugas 3 mata kuliah Kriptografi.

---

## Deskripsi Program

SecureChat adalah aplikasi pesan berbasis web yang menjamin kerahasiaan dan integritas pesan melalui enkripsi end-to-end. Setiap pesan dienkripsi di sisi pengirim dan hanya bisa dibaca oleh penerima yang sah - server tidak pernah melihat isi pesan dalam bentuk plaintext.

### Fitur Keamanan

| Fitur | Implementasi |
|---|---|
| Autentikasi | JSON Web Token (JWT) dengan algoritma ES256/ES384/ES512 |
| Key Exchange | Elliptic Curve Diffie-Hellman (ECDH) dengan kurva P-256 |
| Derivasi Kunci | HKDF-SHA256 untuk menurunkan kunci AES dan HMAC dari shared secret |
| Enkripsi Pesan | AES-256-GCM |
| Integritas Pesan | HMAC-SHA256 (Message Authentication Code) |
| Penyimpanan Private Key | Dienkripsi dengan PBKDF2 + AES-256-GCM menggunakan password user |

---

## Tech Stack

**Frontend**
- React 18 (Vite)
- React Router DOM v6
- Web Crypto API (native browser API untuk kriptografi)

**Backend**
- Node.js dengan Express 5
- PostgreSQL (database)
- bcrypt (hashing password)

**Infrastructure**
- Docker & Docker Compose

---

## Struktur Proyek

```
.
├── client/                  # Frontend React (Vite)
│   └── src/
│       ├── api/             # HTTP client ke backend
│       ├── components/      # Komponen UI
│       ├── crypto/          # Implementasi kriptografi (ECDH, AES, HKDF, MAC)
│       ├── pages/           # Halaman Login, Register, Chat, Contacts
│       └── routes/          # Protected route
├── server/                  # Backend Node.js (Express)
│   └── src/
│       ├── config/          # Konfigurasi database dan environment
│       ├── controllers/     # Handler HTTP request
│       ├── database/        # Skema SQL dan seed
│       ├── jwt-lib/         # Implementasi JWT dari scratch (sign & verify)
│       ├── middleware/       # Auth middleware
│       ├── routes/          # Routing API
│       ├── services/        # Business logic
│       ├── tests/           # Unit test JWT (sign & verify)
│       └── utils/           # Utilitas (validator, response, password hash)
├── docs/
│   └── api-contract.md      # Kontrak API lengkap
├── docker-compose.yml
└── README.md
```

---

## Dependensi

### Frontend (`client/package.json`)

| Package | Versi | Kegunaan |
|---|---|---|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | DOM rendering |
| react-router-dom | ^6.23.1 | Client-side routing |
| vite | ^6.4.2 | Build tool & dev server |

Kriptografi menggunakan **Web Crypto API** bawaan browser - tidak ada library pihak ketiga untuk operasi kriptografi di frontend.

### Backend (`server/package.json`)

| Package | Versi | Kegunaan |
|---|---|---|
| express | ^5.2.1 | Web framework |
| pg | ^8.20.0 | PostgreSQL client |
| bcrypt | ^6.0.0 | Password hashing |
| helmet | ^8.1.0 | Security headers |
| cors | ^2.8.6 | Cross-Origin Resource Sharing |
| dotenv | ^17.4.2 | Environment variables |
| jest | ^30.3.0 | Unit testing (dev) |
| nodemon | ^3.1.14 | Auto-reload saat development (dev) |
| supertest | ^7.2.2 | HTTP testing (dev) |

JWT diimplementasikan dari scratch tanpa library eksternal (`server/src/jwt-lib/`).

---

## Environment / Configuration

### Backend - variabel environment yang digunakan:

| Variabel | Default | Keterangan |
|---|---|---|
| `PORT` | `3000` | Port server Express |
| `NODE_ENV` | `development` | Mode aplikasi |
| `DB_HOST` | `localhost` | Host PostgreSQL |
| `DB_PORT` | `5432` | Port PostgreSQL |
| `DB_NAME` | `webchat` | Nama database |
| `DB_USER` | `postgres` | User database |
| `DB_PASSWORD` | `password` | Password database |
| `JWT_ALGORITHM` | `ES256` | Algoritma JWT (ES256/ES384/ES512) |
| `JWT_EXPIRES_IN` | `3600` | Masa berlaku token (detik) |
| `JWT_PRIVATE_KEY_PATH` | `src/tests/jwt.keys/private-es256.pem` | Path private key JWT |
| `JWT_PUBLIC_KEY_PATH` | `src/tests/jwt.keys/public-es256.pem` | Path public key JWT |

### Frontend - variabel environment:

| Variabel | Default | Keterangan |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Base URL backend API |

---

## Cara Menjalankan Program

### Opsi 1: Docker Compose

Pastikan Docker dan Docker Compose sudah terpasang.

```bash
# Clone repositori
git clone <url-repositori>
cd <nama-folder>

# Jalankan semua service (database, backend, frontend)
docker compose up --build
```

Akses aplikasi di:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

Untuk menghentikan:
```bash
docker compose down

# Hapus data database juga:
docker compose down -v
```

---

### Opsi 2: Menjalankan Manual (Tanpa Docker)

**Prasyarat:**
- Node.js >= 18
- PostgreSQL >= 14 yang sudah berjalan

#### 1. Setup Database

Buat database PostgreSQL:
```sql
CREATE DATABASE webchat;
```

#### 2. Setup Backend

```bash
cd server

# Install dependensi
npm install

# Jalankan migrasi database
npm run migrate

# Jalankan server
npm run dev       # mode development (auto-reload)
# atau
npm run start     # mode production
```

#### 3. Setup Frontend

```bash
cd client

# Install dependensi
npm install

# Jalankan development server
npm run dev
```

Akses aplikasi di http://localhost:5173.

---

## Menjalankan Testing

### Unit Test JWT (Backend)

```bash
cd server
npm test
```

Test mencakup:
- `jwt.sign.test.js` - 12 happy path + 12 edge case untuk fungsi `sign()`
- `jwt.verify.test.js` - 11 happy path + 17 edge case untuk fungsi `verify()`

### Self-test Kriptografi (Frontend)

```bash
cd client
npm run test:crypto
```

Self-test mencakup: ECDH key exchange, derivasi kunci HKDF, enkripsi/dekripsi AES-256-GCM, dan verifikasi HMAC-MAC.

---

## API Endpoints

Dokumentasi lengkap tersedia di [`docs/api-contract.md`](docs/api-contract.md).

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| POST | `/api/auth/register` | — | Daftarkan user baru |
| POST | `/api/auth/login` | — | Login, dapatkan JWT |
| POST | `/api/auth/logout` | JWT | Logout |
| GET | `/api/users/contacts` | JWT | Daftar semua user lain |
| GET | `/api/users/:email/public-key` | JWT | Ambil public key user |
| POST | `/api/messages` | JWT | Kirim pesan terenkripsi |
| GET | `/api/messages/:contactEmail` | JWT | Ambil riwayat pesan |

---
