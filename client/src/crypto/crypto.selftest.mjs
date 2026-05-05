import assert from "node:assert/strict";

import {
  computeSharedSecret,
  exportPrivateKey,
  exportPublicKey,
  generateECDHKeyPair,
  importPrivateKey,
  importPublicKey,
} from "./ecdh.js";
import { deriveAESKey, deriveHMACKey } from "./hkdf.js";
import { aesDecrypt, aesEncrypt } from "./aes.js";
import { computeMAC, verifyMAC } from "./mac.js";
import { decryptPrivateKey, encryptPrivateKey } from "./passwordKey.js";
import { bufferToBase64 } from "./encoding.js";

function macPayload({ ciphertext, iv, senderEmail, receiverEmail }) {
  return JSON.stringify({ ciphertext, iv, senderEmail, receiverEmail });
}

const alice = await generateECDHKeyPair();
const bob = await generateECDHKeyPair();

const alicePublic = await importPublicKey(await exportPublicKey(alice.publicKey));
const bobPublic = await importPublicKey(await exportPublicKey(bob.publicKey));
const alicePrivate = await importPrivateKey(await exportPrivateKey(alice.privateKey));
const bobPrivate = await importPrivateKey(await exportPrivateKey(bob.privateKey));

const aliceSecret = await computeSharedSecret(alicePrivate, bobPublic);
const bobSecret = await computeSharedSecret(bobPrivate, alicePublic);
assert.equal(bufferToBase64(aliceSecret), bufferToBase64(bobSecret));

const aliceAesKey = await deriveAESKey(aliceSecret);
const bobAesKey = await deriveAESKey(bobSecret);
const aliceHmacKey = await deriveHMACKey(aliceSecret);
const bobHmacKey = await deriveHMACKey(bobSecret);

const encrypted = await aesEncrypt(aliceAesKey, "pesan rahasia");
const payload = macPayload({
  ciphertext: encrypted.ciphertext,
  iv: encrypted.iv,
  senderEmail: "alice@example.com",
  receiverEmail: "bob@example.com",
});
const mac = await computeMAC(aliceHmacKey, payload);

assert.equal(await verifyMAC(bobHmacKey, payload, mac), true);
assert.equal(await verifyMAC(bobHmacKey, payload.replace("alice", "mallory"), mac), false);
assert.equal(await aesDecrypt(bobAesKey, encrypted.ciphertext, encrypted.iv), "pesan rahasia");

const mallory = await generateECDHKeyPair();
const mallorySecret = await computeSharedSecret(mallory.privateKey, alicePublic);
const malloryAesKey = await deriveAESKey(mallorySecret);
await assert.rejects(() => aesDecrypt(malloryAesKey, encrypted.ciphertext, encrypted.iv));

const privateKeyBase64 = await exportPrivateKey(alice.privateKey);
const wrappedPrivateKey = await encryptPrivateKey(privateKeyBase64, "correct horse battery staple");
const recoveredPrivateKeyBase64 = await decryptPrivateKey(
  wrappedPrivateKey.encryptedPrivateKey,
  wrappedPrivateKey.iv,
  wrappedPrivateKey.salt,
  "correct horse battery staple"
);
assert.equal(recoveredPrivateKeyBase64, privateKeyBase64);
await assert.rejects(() =>
  decryptPrivateKey(
    wrappedPrivateKey.encryptedPrivateKey,
    wrappedPrivateKey.iv,
    wrappedPrivateKey.salt,
    "wrong password"
  )
);

console.log("Crypto self-test passed");
