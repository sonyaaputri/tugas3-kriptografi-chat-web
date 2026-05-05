# API Contract

Catatan: implementasi backend saat ini membungkus response sukses dengan format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

## Auth

### POST /api/auth/register

Request:

```json
{
  "username": "Aulia",
  "email": "user@gmail.com",
  "password": "plaintext",
  "publicKey": "base64",
  "encryptedPrivateKey": "base64",
  "iv": "base64",
  "salt": "base64"
}
```

Validasi:

- `username` minimal 3 karakter.
- `email` wajib format email valid.
- `password` minimal 8 karakter.

Response `data`:

```json
{
  "user": {
    "id": 1,
    "username": "Aulia",
    "email": "user@gmail.com",
    "created_at": "2026-05-05T03:00:00.000Z"
  }
}
```

### POST /api/auth/login

Request:

```json
{
  "email": "user@gmail.com",
  "password": "plaintext"
}
```

Response `data`:

```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "username": "Aulia",
    "email": "user@gmail.com",
    "publicKey": "base64",
    "encryptedPrivateKey": "base64",
    "iv": "base64",
    "salt": "base64"
  }
}
```

## Users

### GET /api/users/contacts

Headers:

```http
Authorization: Bearer <JWT>
```

Response `data`:

```json
{
  "users": [
    {
      "username": "Customer",
      "email": "user2@gmail.com",
      "publicKey": "base64",
      "isOnline": true,
      "lastSeen": "2026-05-05T03:00:00.000Z",
      "lastMessage": "base64",
      "lastMessageTime": "2026-05-05T03:00:00.000Z"
    }
  ]
}
```

### GET /api/users/:email/public-key

Headers:

```http
Authorization: Bearer <JWT>
```

Response `data`:

```json
{
  "username": "Customer",
  "email": "user2@gmail.com",
  "publicKey": "base64",
  "isOnline": true,
  "lastSeen": "2026-05-05T03:00:00.000Z"
}
```

## Messages

### POST /api/messages

Headers:

```http
Authorization: Bearer <JWT>
```

Request:

```json
{
  "receiverEmail": "user@gmail.com",
  "ciphertext": "base64",
  "iv": "base64",
  "mac": "base64"
}
```

Response `data`:

```json
{
  "message": {
    "id": 1,
    "senderEmail": "sender@gmail.com",
    "receiverEmail": "user@gmail.com",
    "ciphertext": "base64",
    "iv": "base64",
    "mac": "base64",
    "timestamp": "2026-05-05T03:00:00.000Z"
  }
}
```

### GET /api/messages/:contactEmail

Headers:

```http
Authorization: Bearer <JWT>
```

Response `data`:

```json
{
  "messages": [
    {
      "id": 1,
      "senderEmail": "user@gmail.com",
      "receiverEmail": "user2@gmail.com",
      "ciphertext": "base64",
      "iv": "base64",
      "mac": "base64",
      "timestamp": "2026-05-05T03:00:00.000Z"
    }
  ]
}
```

## Encrypted Message Payload

Format data pesan terenkripsi yang disimpan dan dikirim oleh API:

```json
{
  "senderEmail": "user@gmail.com",
  "receiverEmail": "user2@gmail.com",
  "ciphertext": "base64",
  "iv": "base64",
  "mac": "base64",
  "timestamp": "ISO"
}
```

Encoding untuk `ciphertext`, `iv`, dan `mac` disepakati memakai base64.
