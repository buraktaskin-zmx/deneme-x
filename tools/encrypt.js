/**
 * Credentials Şifreleme Aracı
 * Kullanım: node tools/encrypt.js
 */

var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var readline = require('readline');

var APP_DIR = path.join(__dirname, '..');
var KEY_FILE = path.join(APP_DIR, '.secret-key');
var CRED_FILE = path.join(APP_DIR, 'credentials.enc');

// Yeni anahtar oluştur veya mevcut olanı kullan
function getOrCreateKey() {
  if (fs.existsSync(KEY_FILE)) {
    return fs.readFileSync(KEY_FILE, 'utf8').trim();
  }
  var key = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(KEY_FILE, key);
  console.log('Yeni şifreleme anahtarı oluşturuldu.');
  return key;
}

// Şifreleme fonksiyonu
function encrypt(text, keyHex) {
  var key = Buffer.from(keyHex, 'hex');
  var iv = crypto.randomBytes(12);
  var cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  var encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  var tag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
}

// Mevcut credentials'ları oku
function loadExistingCredentials(keyHex) {
  if (!fs.existsSync(CRED_FILE)) {
    return {};
  }
  try {
    var encData = fs.readFileSync(CRED_FILE, 'utf8').trim();
    var parts = encData.split(':');
    var iv = Buffer.from(parts[0], 'hex');
    var tag = Buffer.from(parts[1], 'hex');
    var encrypted = parts[2];
    
    var key = Buffer.from(keyHex, 'hex');
    var decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (err) {
    console.log('Mevcut credentials okunamadı, yeni oluşturulacak.');
    return {};
  }
}

// Interaktif credential ekleme
function promptCredentials() {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  var keyHex = getOrCreateKey();
  var credentials = loadExistingCredentials(keyHex);

  console.log('\n=== Credential Kaydetme Aracı ===\n');
  console.log('Mevcut tool\'lar:', Object.keys(credentials).join(', ') || 'Yok');
  console.log('\nDesteklenen tool\'lar: chatgpt, claude, gemini\n');

  rl.question('Tool adı (örn: chatgpt): ', function(toolKey) {
    toolKey = toolKey.trim().toLowerCase();
    
    if (!toolKey) {
      console.log('Tool adı boş olamaz!');
      rl.close();
      return;
    }

    rl.question('Email/Kullanıcı adı: ', function(username) {
      rl.question('Şifre: ', function(password) {
        
        credentials[toolKey] = {
          username: username.trim(),
          password: password.trim()
        };

        // Şifrele ve kaydet
        var encryptedData = encrypt(JSON.stringify(credentials), keyHex);
        fs.writeFileSync(CRED_FILE, encryptedData);

        console.log('\n✓ Credentials başarıyla kaydedildi!');
        console.log('  Tool:', toolKey);
        console.log('  Email:', username.trim());
        console.log('  Dosya:', CRED_FILE);
        
        rl.question('\nBaşka bir tool eklemek ister misiniz? (e/h): ', function(answer) {
          if (answer.toLowerCase() === 'e') {
            rl.close();
            promptCredentials();
          } else {
            console.log('\nTamamlandı!');
            rl.close();
          }
        });
      });
    });
  });
}

// Tüm credentials'ları listele (şifresiz)
function listCredentials() {
  var keyHex = getOrCreateKey();
  var credentials = loadExistingCredentials(keyHex);
  
  console.log('\n=== Kayıtlı Credentials ===\n');
  
  Object.keys(credentials).forEach(function(tool) {
    console.log('Tool:', tool);
    console.log('  Email:', credentials[tool].username);
    console.log('  Şifre:', '********');
    console.log('');
  });
  
  if (Object.keys(credentials).length === 0) {
    console.log('Kayıtlı credential yok.');
  }
}

// Komut satırı argümanlarını kontrol et
var args = process.argv.slice(2);

if (args[0] === 'list') {
  listCredentials();
} else if (args[0] === 'add' && args[1] && args[2] && args[3]) {
  // Direkt ekleme: node encrypt.js add chatgpt email@gmail.com password123
  var keyHex = getOrCreateKey();
  var credentials = loadExistingCredentials(keyHex);
  
  credentials[args[1]] = {
    username: args[2],
    password: args[3]
  };
  
  var encryptedData = encrypt(JSON.stringify(credentials), keyHex);
  fs.writeFileSync(CRED_FILE, encryptedData);
  
  console.log('✓ Credential eklendi:', args[1]);
} else {
  promptCredentials();
}