const textEncoder = new TextEncoder();

export function randomToken(byteLength = 24) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password) {
  const salt = randomToken(16);
  const hash = await pbkdf2(password, salt);
  return `${salt}:${hash}`;
}

export async function verifyPassword(password, passwordHash) {
  const [salt, stored] = passwordHash.split(':');
  if (!salt || !stored) {
    return false;
  }
  const hash = await pbkdf2(password, salt);
  return timingSafeEqual(hash, stored);
}

export async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(value));
  return `${value}.${base64Url(new Uint8Array(signature))}`;
}

async function pbkdf2(password, salt) {
  const key = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: textEncoder.encode(salt),
      iterations: 120000,
      hash: 'SHA-256',
    },
    key,
    256,
  );
  return base64Url(new Uint8Array(bits));
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

function base64Url(bytes) {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
