/**
 * Credential Manager - ES Module
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let APP_DIR = path.dirname(window.location.pathname.replace(/^\/([A-Z]:)/, '$1'));

if (process.platform === 'win32' && APP_DIR.startsWith('/')) {
  APP_DIR = APP_DIR.substring(1);
}

const KEY_FILE = path.join(APP_DIR, '.secret-key');
const CRED_FILE = path.join(APP_DIR, 'credentials.enc');

function decrypt(encryptedText, keyHex) {
  const key = Buffer.from(keyHex, 'hex');
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ✅ Export edilecek fonksiyonlar
export function getCredential(toolKey) {
  try {
    if (!fs.existsSync(KEY_FILE) || !fs.existsSync(CRED_FILE)) {
      return null;
    }

    const keyHex = fs.readFileSync(KEY_FILE, 'utf8').trim();
    const encData = fs.readFileSync(CRED_FILE, 'utf8').trim();
    const all = JSON.parse(decrypt(encData, keyHex));
    return all[toolKey] || null;
  } catch (err) {
    console.error('Credential read error:', err);
    return null;
  }
}

export function getAppDir() {
  return APP_DIR;
}