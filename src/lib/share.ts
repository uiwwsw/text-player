const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", textEncoder.encode(passphrase), "PBKDF2", false, [
    "deriveKey",
  ]);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 120_000,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptText(text: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, textEncoder.encode(text));

  const payload = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  payload.set(salt, 0);
  payload.set(iv, salt.length);
  payload.set(new Uint8Array(encrypted), salt.length + iv.length);

  return bufferToBase64(payload.buffer);
}

export async function decryptText(encoded: string, passphrase: string): Promise<string> {
  const buffer = base64ToBuffer(encoded);
  const bytes = new Uint8Array(buffer);
  const salt = bytes.slice(0, SALT_LENGTH);
  const iv = bytes.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const cipher = bytes.slice(SALT_LENGTH + IV_LENGTH);
  const key = await deriveKey(passphrase, salt);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return textDecoder.decode(decrypted);
}
