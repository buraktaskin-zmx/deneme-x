/**
 * Credential sifreleme araci
 * Kullanim: node tools/encrypt.js
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ENCRYPTION_KEY_FILE = path.join(__dirname, '..', '.secret-key');
const CREDENTIALS_FILE = path.join(__dirname, '..', 'credentials.enc');

/** 32 byte AES-256 anahtar olusturur veya mevcut olanı okur */
function getOrCreateKey() {
  if (fs.existsSync(ENCRYPTION_KEY_FILE)) {
    return fs.readFileSync(ENCRYPTION_KEY_FILE, 'utf8').trim();
  }
  const key = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(ENCRYPTION_KEY_FILE, key);
  console.log('Yeni sifreleme anahtari olusturuldu: .secret-key');
  return key;
}

/** Veriyi AES-256-GCM ile sifreler */
function encrypt(text, keyHex) {
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return iv.toString('hex') + ':' + tag + ':' + encrypted;
}

/** Kullanicidan input alir */
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(function(resolve) {
    rl.question(question, function(answer) {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('=== Virtual Tool Lab - Credential Sifreleme ===\n');

  const email = await ask('ChatGPT Email: ');
  const password = await ask('ChatGPT Sifre: ');

  const credentials = {
    chatgpt: { email: email, password: password }
  };

  const key = getOrCreateKey();
  const encrypted = encrypt(JSON.stringify(credentials), key);
  fs.writeFileSync(CREDENTIALS_FILE, encrypted);

  console.log('\nCredentials sifrelendi: credentials.enc');
  console.log('Anahtar dosyasi: .secret-key');
  console.log('\nONEMLI: .secret-key dosyasini GIZLI tutun!');
}

main();
