/**
 * jwt.verify.test.js
 * Unit test untuk fungsi verify pada JWT library
 *
 * Mencakup:
 * - Happy path: verify berhasil untuk semua algoritma dan berbagai skenario
 * - Edge case: token invalid, signature salah, klaim expired, key mismatch, dll.
 */

const path = require("path");
const fs = require("fs");
const { sign, verify } = require("../jwt-lib");
const { JWTError } = require("../jwt-lib/../jwt-lib/errors");

// Load key pairs untuk testing
const KEYS_DIR = path.join(__dirname, "jwt.keys");
const keys = {
  ES256: {
    private: fs.readFileSync(path.join(KEYS_DIR, "private-es256.pem"), "utf8"),
    public:  fs.readFileSync(path.join(KEYS_DIR, "public-es256.pem"),  "utf8"),
  },
  ES384: {
    private: fs.readFileSync(path.join(KEYS_DIR, "private-es384.pem"), "utf8"),
    public:  fs.readFileSync(path.join(KEYS_DIR, "public-es384.pem"),  "utf8"),
  },
  ES512: {
    private: fs.readFileSync(path.join(KEYS_DIR, "private-es512.pem"), "utf8"),
    public:  fs.readFileSync(path.join(KEYS_DIR, "public-es512.pem"),  "utf8"),
  },
};

const makeHeader = (alg = "ES256") => ({ alg, typ: "JWT" });

// Helper: sign dan langsung verify (happy path shortcut)
function signAndVerify(alg, claims = {}, payload = {}, opts = {}) {
  const token = sign(makeHeader(alg), claims, payload, keys[alg].private);
  return verify(token, keys[alg].public, opts);
}

// =============================================================================
// HAPPY PATH
// =============================================================================

describe("verify() – Happy Path", () => {
  test("ES256: sign lalu verify berhasil, payload dapat dibaca", () => {
    const result = signAndVerify("ES256", {}, { message: "hello" });
    expect(result.payload.message).toBe("hello");
  });

  test("ES384: sign lalu verify berhasil", () => {
    const result = signAndVerify("ES384", {}, { user: "alice" });
    expect(result.payload.user).toBe("alice");
  });

  test("ES512: sign lalu verify berhasil", () => {
    const result = signAndVerify("ES512", {}, { role: "admin" });
    expect(result.payload.role).toBe("admin");
  });

  test("Hasil verify mengembalikan { header, payload, signature }", () => {
    const result = signAndVerify("ES256", {}, { x: 1 });
    expect(result).toHaveProperty("header");
    expect(result).toHaveProperty("payload");
    expect(result).toHaveProperty("signature");
  });

  test("header.alg dan header.typ ter-decode dengan benar", () => {
    const result = signAndVerify("ES256", {}, {});
    expect(result.header.alg).toBe("ES256");
    expect(result.header.typ).toBe("JWT");
  });

  test("Klaim exp yang belum expired diterima", () => {
    const now = Math.floor(Date.now() / 1000);
    const result = signAndVerify("ES256", { exp: now + 3600 }, {});
    expect(result.payload.exp).toBe(now + 3600);
  });

  test("ignoreExp: token expired tetap lolos jika ignoreExp=true", () => {
    const now = Math.floor(Date.now() / 1000);
    const token = sign(makeHeader("ES256"), { exp: now - 100 }, {}, keys.ES256.private);
    const result = verify(token, keys.ES256.public, { ignoreExp: true });
    expect(result.payload.exp).toBe(now - 100);
  });

  test("ignoreNbf: token dengan nbf masa depan tetap lolos jika ignoreNbf=true", () => {
    const now = Math.floor(Date.now() / 1000);
    const token = sign(makeHeader("ES256"), { nbf: now + 999 }, {}, keys.ES256.private);
    const result = verify(token, keys.ES256.public, { ignoreNbf: true });
    expect(result.payload.nbf).toBe(now + 999);
  });

  test("options.iss cocok dengan payload → verify berhasil", () => {
    const result = signAndVerify(
      "ES256",
      { iss: "https://auth.example.com" },
      {},
      { iss: "https://auth.example.com" }
    );
    expect(result.payload.iss).toBe("https://auth.example.com");
  });

  test("options.algs mengizinkan algoritma yang digunakan → verify berhasil", () => {
    const result = signAndVerify("ES256", {}, {}, { algs: ["ES256", "ES384"] });
    expect(result.header.alg).toBe("ES256");
  });

  test("Token tanpa klaim exp/nbf (keduanya tidak ada) tetap valid", () => {
    const result = signAndVerify("ES256", {}, { just: "payload" });
    expect(result.payload.just).toBe("payload");
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe("verify() – Edge Cases", () => {
  test("[EC-1] Token null → melempar JWTError", () => {
    expect(() => verify(null, keys.ES256.public)).toThrow(JWTError);
  });

  test("[EC-2] Token string kosong → melempar JWTError", () => {
    expect(() => verify("", keys.ES256.public)).toThrow(JWTError);
  });

  test("[EC-3] Token hanya 2 segmen (format tidak valid) → melempar JWTError", () => {
    expect(() => verify("abc.def", keys.ES256.public)).toThrow(JWTError);
  });

  test("[EC-4] Token hanya 1 segmen → melempar JWTError", () => {
    expect(() => verify("onlyone", keys.ES256.public)).toThrow(JWTError);
  });

  test("[EC-5] Token 4 segmen (terlalu banyak titik) → melempar JWTError", () => {
    expect(() => verify("a.b.c.d", keys.ES256.public)).toThrow(JWTError);
  });

  test("[EC-6] Public key salah (key pair berbeda) → melempar JWTError (signature invalid)", () => {
    const token = sign(makeHeader("ES256"), {}, { x: 1 }, keys.ES256.private);
    // Verifikasi dengan public key ES384 yang berbeda key pair
    expect(() => verify(token, keys.ES384.public)).toThrow(JWTError);
  });

  test("[EC-7] Signature dimodifikasi → melempar JWTError", () => {
    const token = sign(makeHeader("ES256"), {}, { x: 1 }, keys.ES256.private);
    const parts = token.split(".");
    // Ganti satu karakter di signature
    parts[2] = parts[2].slice(0, -4) + "ZZZZ";
    expect(() => verify(parts.join("."), keys.ES256.public)).toThrow(JWTError);
  });

  test("[EC-8] Payload dimodifikasi setelah signing → melempar JWTError", () => {
    const token = sign(makeHeader("ES256"), {}, { role: "user" }, keys.ES256.private);
    const parts = token.split(".");
    // Encode payload baru dengan role: admin
    const fakePayload = Buffer.from(JSON.stringify({ role: "admin" }))
      .toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    parts[1] = fakePayload;
    expect(() => verify(parts.join("."), keys.ES256.public)).toThrow(JWTError);
  });

  test("[EC-9] Token expired (exp sudah lewat) → melempar JWTError", () => {
    const now = Math.floor(Date.now() / 1000);
    const token = sign(makeHeader("ES256"), { exp: now - 100 }, {}, keys.ES256.private);
    expect(() => verify(token, keys.ES256.public)).toThrow(JWTError);
  });

  test("[EC-10] Token belum berlaku (nbf di masa depan) → melempar JWTError", () => {
    const now = Math.floor(Date.now() / 1000);
    const token = sign(makeHeader("ES256"), { nbf: now + 9999 }, {}, keys.ES256.private);
    expect(() => verify(token, keys.ES256.public)).toThrow(JWTError);
  });

  test("[EC-11] options.iss tidak cocok dengan payload.iss → melempar JWTError", () => {
    const token = sign(makeHeader("ES256"), { iss: "issuer-A" }, {}, keys.ES256.private);
    expect(() => verify(token, keys.ES256.public, { iss: "issuer-B" })).toThrow(JWTError);
  });

  test("[EC-12] options.sub tidak cocok → melempar JWTError", () => {
    const token = sign(makeHeader("ES256"), { sub: "user-1" }, {}, keys.ES256.private);
    expect(() => verify(token, keys.ES256.public, { sub: "user-99" })).toThrow(JWTError);
  });

  test("[EC-13] options.aud tidak cocok → melempar JWTError", () => {
    const token = sign(makeHeader("ES256"), { aud: "api-A" }, {}, keys.ES256.private);
    expect(() => verify(token, keys.ES256.public, { aud: "api-B" })).toThrow(JWTError);
  });

  test("[EC-14] options.jti tidak cocok → melempar JWTError", () => {
    const token = sign(makeHeader("ES256"), { jti: "uuid-1" }, {}, keys.ES256.private);
    expect(() => verify(token, keys.ES256.public, { jti: "uuid-2" })).toThrow(JWTError);
  });

  test("[EC-15] options.algs tidak mengizinkan algoritma token → melempar JWTError", () => {
    const token = sign(makeHeader("ES256"), {}, {}, keys.ES256.private);
    expect(() => verify(token, keys.ES256.public, { algs: ["ES384", "ES512"] })).toThrow(JWTError);
  });

  test("[EC-16] Public key null → melempar JWTError", () => {
    const token = sign(makeHeader("ES256"), {}, {}, keys.ES256.private);
    expect(() => verify(token, null)).toThrow(JWTError);
  });

  test("[EC-17] Header base64url tidak bisa di-decode sebagai JSON → melempar JWTError", () => {
    // Encode string yang bukan JSON
    const fakeHeader = Buffer.from("bukan json!").toString("base64url");
    const fakePayload = Buffer.from("{}").toString("base64url");
    expect(() => verify(`${fakeHeader}.${fakePayload}.AAAA`, keys.ES256.public)).toThrow(JWTError);
  });
});