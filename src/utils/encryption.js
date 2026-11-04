// AES-CBC field encryption compatible with the backend (C#) implementation:
// key + IV derived with PBKDF2 (SHA-1, 1000 iterations) from VITE_BOP_KEY,
// text encoded as UTF-16LE (Encoding.Unicode), output as Base64.

// Same salt as C#
const SALT = new Uint8Array([
  0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76,
]);

/*
 * IMPORTANT:
 * The iteration count must match the .NET version.
 * Older .NET Framework implementations commonly default to 1000 iterations.
 */
const ITERATIONS = 1000;

// C# pdb.GetBytes(32) + pdb.GetBytes(16) => 48 bytes from PBKDF2
const deriveKeyAndIv = async () => {
  const encryptionKey = import.meta.env.VITE_BOP_KEY;

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(encryptionKey),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: SALT,
      iterations: ITERATIONS,
      hash: "SHA-1",
    },
    passwordKey,
    48 * 8,
  );

  const derivedBytes = new Uint8Array(derivedBits);

  return {
    keyBytes: derivedBytes.slice(0, 32), // first 32 bytes = AES key
    iv: derivedBytes.slice(32, 48), // next 16 bytes = IV
  };
};

// =========================
// ENCRYPT
// =========================

export const encryptField = async (clearText) => {
  // Same as C# Encoding.Unicode.GetBytes(clearText) (UTF-16LE).
  // TextEncoder only gives UTF-8, so build the bytes manually.
  const utf16Bytes = new Uint8Array(clearText.length * 2);

  for (let i = 0; i < clearText.length; i++) {
    const code = clearText.charCodeAt(i);

    utf16Bytes[i * 2] = code & 0xff;
    utf16Bytes[i * 2 + 1] = code >> 8;
  }

  const { keyBytes, iv } = await deriveKeyAndIv();

  const aesKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    ["encrypt"],
  );

  // AES-CBC automatically applies PKCS#7-style padding
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    aesKey,
    utf16Bytes,
  );

  // ArrayBuffer -> Base64
  const encryptedBytes = new Uint8Array(encrypted);

  let binary = "";

  encryptedBytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

// =========================
// DECRYPT
// =========================

export const decryptField = async (encryptedText) => {
  const binaryString = atob(encryptedText);

  const encryptedBytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    encryptedBytes[i] = binaryString.charCodeAt(i);
  }

  const { keyBytes, iv } = await deriveKeyAndIv();

  const aesKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    ["decrypt"],
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    aesKey,
    encryptedBytes,
  );

  const decryptedBytes = new Uint8Array(decrypted);

  let result = "";

  for (let i = 0; i < decryptedBytes.length; i += 2) {
    const charCode = decryptedBytes[i] | (decryptedBytes[i + 1] << 8);

    result += String.fromCharCode(charCode);
  }

  return result;
};
