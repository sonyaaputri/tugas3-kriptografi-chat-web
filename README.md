
```
tugas3-kriptografi-chat-web
├─ .env.example
├─ client
│  ├─ Dockerfile
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ src
│  │  ├─ api
│  │  │  ├─ authApi.js
│  │  │  ├─ messageApi.js
│  │  │  └─ userApi.js
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ components
│  │  │  ├─ ChatBox.jsx
│  │  │  ├─ ContactList.jsx
│  │  │  ├─ ErrorMessage.jsx
│  │  │  ├─ MessageBubble.jsx
│  │  │  └─ Navbar.jsx
│  │  ├─ crypto
│  │  │  ├─ aes.js
│  │  │  ├─ ecdh.js
│  │  │  ├─ encoding.js
│  │  │  ├─ hkdf.js
│  │  │  ├─ mac.js
│  │  │  └─ passwordKey.js
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ ChatPage.jsx
│  │  │  ├─ ContactsPage.jsx
│  │  │  ├─ LoginPage.jsx
│  │  │  └─ RegisterPage.jsx
│  │  ├─ routes
│  │  │  └─ ProtectedRoute.jsx
│  │  ├─ storage
│  │  │  └─ authStorage.js
│  │  └─ styles
│  │     └─ main.css
│  └─ vite.config.js
├─ docker-compose.yml
├─ docs
│  ├─ laporan
│  │  └─ assets
│  │     ├─ diagrams
│  │     └─ screenshots
│  └─ testing
│     ├─ test-plan.md
│     └─ test-results.md
├─ release
│  └─ placeholder.txt
└─ server
   ├─ Dockerfile
   ├─ package-lock.json
   ├─ package.json
   ├─ scripts
   │  ├─ migrate.js
   │  └─ reset-db.js
   └─ src
      ├─ app.js
      ├─ config
      │  ├─ db.js
      │  └─ env.js
      ├─ controllers
      │  ├─ auth.controller.js
      │  ├─ message.controller.js
      │  └─ user.controller.js
      ├─ database
      │  ├─ schema.sql
      │  └─ seed.js
      ├─ index.js
      ├─ jwt-lib
      │  ├─ base64url.js
      │  ├─ errors.js
      │  ├─ index.js
      │  ├─ keyLoader.js
      │  ├─ sign.js
      │  └─ verify.js
      ├─ middleware
      │  └─ auth.middleware.js
      ├─ routes
      │  ├─ auth.routes.js
      │  ├─ message.routes.js
      │  └─ user.routes.js
      ├─ services
      │  ├─ auth.service.js
      │  ├─ message.service.js
      │  └─ user.service.js
      ├─ tests
      │  ├─ jwt.keys
      │  │  ├─ private-es256.pem
      │  │  ├─ private-es384.pem
      │  │  ├─ private-es512.pem
      │  │  ├─ public-es256.pem
      │  │  ├─ public-es384.pem
      │  │  └─ public-es512.pem
      │  ├─ jwt.sign.test.js
      │  └─ jwt.verify.test.js
      └─ utils
         ├─ passwordHash.js
         ├─ response.js
         └─ validator.js

```