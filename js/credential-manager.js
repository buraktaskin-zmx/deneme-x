/**
 * Credential Manager
 */
var CredentialManager = (function() {
  'use strict';

  var crypto = require('crypto');
  var fs = require('fs');
  var path = require('path');

  // __dirname yerine nw.App.getStartPath() kullan
  var APP_DIR = path.dirname(window.location.pathname.replace(/^\/([A-Z]:)/, '$1'));
  
  // Windows path fix
  if (process.platform === 'win32' && APP_DIR.startsWith('/')) {
    APP_DIR = APP_DIR.substring(1);
  }

  var KEY_FILE = path.join(APP_DIR, '.secret-key');
  var CRED_FILE = path.join(APP_DIR, 'credentials.enc');

  function decrypt(encryptedText, keyHex) {
    var key = Buffer.from(keyHex, 'hex');
    var parts = encryptedText.split(':');
    var iv = Buffer.from(parts[0], 'hex');
    var tag = Buffer.from(parts[1], 'hex');
    var encrypted = parts[2];

    var decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  function getFor(toolKey) {
    try {
      if (!fs.existsSync(KEY_FILE) || !fs.existsSync(CRED_FILE)) {
        return null;
      }

      var keyHex = fs.readFileSync(KEY_FILE, 'utf8').trim();
      var encData = fs.readFileSync(CRED_FILE, 'utf8').trim();
      var all = JSON.parse(decrypt(encData, keyHex));
      return all[toolKey] || null;
    } catch (err) {
      return null;
    }
  }

  // Test: path dondur
  function getAppDir() {
    return APP_DIR;
  }

  return { getFor: getFor, getAppDir: getAppDir };
})();