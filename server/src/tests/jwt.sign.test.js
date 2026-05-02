/**
 * jwt.sign.test.js
 * Unit test untuk fungsi sign pada JWT library
 *
 * Mencakup:
 * - Happy path: semua algoritma (ES256, ES384, ES512)
 * - Edge case: input tidak valid, header salah, payload bermasalah, dll.
 */

const path = require("path");
const fs = require("fs");
const { sign } = require("../jwt-lib");
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

// Helper: buat header valid
const makeHeader = (alg = "ES256") => ({ alg, typ: "JWT" });

// Helper: decode segmen base64url tanpa library eksternal
function decodeSegment(b64url) {
  const padded = b64url + "=".repeat((4 - (b64url.length % 4)) % 4);
  return JSON.parse(Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
}

// =============================================================================
// HAPPY PATH
// =============================================================================

describe("sign() – Happy Path", () => {
  test("ES256: menghasilkan JWT dengan 3 segmen dipisahkan titik", () => {
    const token = sign(makeHeader("ES256"), {}, { foo: "bar" }, keys.ES256.private);
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
  });

  test("ES384: menghasilkan JWT yang valid", () => {
    const token = sign(makeHeader("ES384"), {}, { hello: "world" }, keys.ES384.private);
    expect(token.split(".")).toHaveLength(3);
  });

  test("ES512: menghasilkan JWT yang valid", () => {
    const token = sign(makeHeader("ES512"), {}, { test: true }, keys.ES512.private);
    expect(token.split(".")).toHaveLength(3);
  });

  test("Header ter-encode dengan benar di segmen pertama", () => {
    const header = makeHeader("ES256");
    const token = sign(header, {}, {}, keys.ES256.private);
    const decoded = decodeSegment(token.split(".")[0]);
    expect(decoded.alg).toBe("ES256");
    expect(decoded.typ).toBe("JWT");
  });

  test("Claims registered (iss, sub, aud, exp, nbf, iat, jti) masuk ke payload", () => {
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      iss: "https://example.com",
      sub: "user-123",
      aud: "https://api.example.com",
      exp: now + 3600,
      nbf: now,
      iat: now,
      jti: "unique-id-abc",
    };
    const token = sign(makeHeader("ES256"), claims, {}, keys.ES256.private);
    const payload = decodeSegment(token.split(".")[1]);
    expect(payload.iss).toBe(claims.iss);
    expect(payload.sub).toBe(claims.sub);
    expect(payload.aud).toBe(claims.aud);
    expect(payload.jti).toBe(claims.jti);
  });

  test("Claims menimpa payload jika key sama", () => {
    const token = sign(
      makeHeader("ES256"),
      { sub: "dari-claims" },
      { sub: "dari-payload", extra: "data" },
      keys.ES256.private
    );
    const payload = decodeSegment(token.split(".")[1]);
    expect(payload.sub).toBe("dari-claims");
    expect(payload.extra).toBe("data");
  });

  test("Payload dengan berbagai tipe data (string, number, boolean, null, object, array)", () => {
    const token = sign(
      makeHeader("ES256"),
      {},
      {
        str: "hello",
        num: 42,
        bool: true,
        nul: null,
        obj: { nested: true },
        arr: [1, 2, 3],
      },
      keys.ES256.private
    );
    const payload = decodeSegment(token.split(".")[1]);
    expect(payload.str).toBe("hello");
    expect(payload.num).toBe(42);
    expect(payload.bool).toBe(true);
    expect(payload.nul).toBeNull();
    expect(payload.obj).toEqual({ nested: true });
    expect(payload.arr).toEqual([1, 2, 3]);
  });

  test("iat ditambahkan otomatis jika tidak dispesifikasikan", () => {
    const before = Math.floor(Date.now() / 1000);
    const token = sign(makeHeader("ES256"), {}, {}, keys.ES256.private);
    const after  = Math.floor(Date.now() / 1000);
    const payload = decodeSegment(token.split(".")[1]);
    expect(payload.iat).toBeGreaterThanOrEqual(before);
    expect(payload.iat).toBeLessThanOrEqual(after);
  });

  test("Signature tidak kosong dan berupa string Base64URL valid", () => {
    const token = sign(makeHeader("ES256"), {}, { x: 1 }, keys.ES256.private);
    const sig = token.split(".")[2];
    expect(sig.length).toBeGreaterThan(0);
    // Base64URL tidak boleh mengandung +, /, atau =
    expect(sig).toMatch(/^[A-Za-z0-9\-_]+$/);
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe("sign() – Edge Cases", () => {
  test("[EC-1] Header null → melempar JWTError", () => {
    expect(() => sign(null, {}, {}, keys.ES256.private)).toThrow(JWTError);
  });

  test("[EC-2] Header tanpa 'alg' → melempar JWTError", () => {
    expect(() => sign({ typ: "JWT" }, {}, {}, keys.ES256.private)).toThrow(JWTError);
  });

  test("[EC-3] Algoritma tidak didukung (HS256) → melempar JWTError", () => {
    expect(() =>
      sign({ alg: "HS256", typ: "JWT" }, {}, {}, keys.ES256.private)
    ).toThrow(JWTError);
  });

  test("[EC-4] typ bukan 'JWT' → melempar JWTError", () => {
    expect(() =>
      sign({ alg: "ES256", typ: "JWS" }, {}, {}, keys.ES256.private)
    ).toThrow(JWTError);
  });

  test("[EC-5] typ tidak ada → melempar JWTError", () => {
    expect(() =>
      sign({ alg: "ES256" }, {}, {}, keys.ES256.private)
    ).toThrow(JWTError);
  });

  test("[EC-6] Private key kosong (string kosong) → melempar JWTError", () => {
    expect(() =>
      sign(makeHeader("ES256"), {}, {}, "")
    ).toThrow(JWTError);
  });

  test("[EC-7] Private key null → melempar JWTError", () => {
    expect(() =>
      sign(makeHeader("ES256"), {}, {}, null)
    ).toThrow(JWTError);
  });

  test("[EC-8] Private key bukan PEM valid → melempar JWTError", () => {
    expect(() =>
      sign(makeHeader("ES256"), {}, {}, "bukan-pem-sama-sekali")
    ).toThrow(JWTError);
  });

  test("[EC-9] Payload berisi circular reference (tidak bisa JSON.stringify) → melempar JWTError", () => {
    const circular = {};
    circular.self = circular;
    expect(() =>
      sign(makeHeader("ES256"), {}, circular, keys.ES256.private)
    ).toThrow(JWTError);
  });

  test("[EC-10] Private key ES384 dipakai untuk sign ES256 → melempar JWTError (kurva tidak cocok)", () => {
    expect(() =>
      sign(makeHeader("ES256"), {}, { x: 1 }, keys.ES384.private)
    ).toThrow(JWTError);
  });

  test("[EC-11] Header bukan object (string) → melempar JWTError", () => {
    expect(() =>
      sign("ES256", {}, {}, keys.ES256.private)
    ).toThrow(JWTError);
  });

  test("[EC-12] Sign dengan claims kosong dan payload kosong tetap menghasilkan token", () => {
    const token = sign(makeHeader("ES256"), {}, {}, keys.ES256.private);
    expect(token.split(".")).toHaveLength(3);
  });
});