// encoding.js
// Berisi fungsi utilitas untuk konversi data antar format:ArrayBuffer, Base64, Hex, dan String (UTF-8)

/**
 * Mengubah ArrayBuffer menjadi string Base64
 */
export function bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  /**
   * Mengubah string Base64 menjadi ArrayBuffer
   */
  export function base64ToBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  /**
   * Mengubah ArrayBuffer menjadi string heksadesimal (hex)
   */
  export function bufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  
  /**
   * Mengubah string heksadesimal (hex) menjadi ArrayBuffer
   */
  export function hexToBuffer(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes.buffer;
  }
  
  /**
   * Mengubah string menjadi ArrayBuffer menggunakan encoding UTF-8
   */
  export function stringToBuffer(str) {
    return new TextEncoder().encode(str).buffer;
  }
  
  /**
   *  Mengubah ArrayBuffer menjadi string menggunakan decoding UTF-8
   */
  export function bufferToString(buffer) {
    return new TextDecoder().decode(buffer);
  }