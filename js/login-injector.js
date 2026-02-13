/**
 * Login Injector - Sadece Google OAuth sayfasında email/şifre doldurur
 * Kullanıcı kendisi Log in ve Google SSO tıklar, biz sadece Google sayfasında araya gireriz
 */
(function() {
  'use strict';

  var LoginInjector = {
    _credentials: null,
    _phase: 'idle', // idle | watching | email-done | password-done

    inject: function(toolKey, webview) {
      var creds = CredentialManager.getCredential(toolKey);
      if (!creds) {
        console.log('[LoginInjector] No credentials for:', toolKey);
        return;
      }

      this._credentials = creds;
      this._phase = 'watching';

      var self = this;

      webview.addEventListener('loadstop', function() {
        var url = webview.src || '';

        // Sadece Google hesap sayfasindayken mudahale et
        if (!url.includes('accounts.google.com')) {
          return;
        }

        console.log('[LoginInjector] Google page detected:', url);

        // Email sayfasi
        if (self._phase === 'watching' && (url.includes('identifier') || url.includes('ServiceLogin'))) {
          self._fillEmail(webview);
          return;
        }

        // Sifre sayfasi
        if (self._phase === 'email-done' && (url.includes('challenge') || url.includes('pwd'))) {
          self._fillPassword(webview);
          return;
        }
      });
    },

    _fillEmail: function(webview) {
      var self = this;
      var email = this._credentials.username;

      var script = '(function() {' +
        'var input = document.querySelector("input[type=email]") || document.querySelector("#identifierId");' +
        'if (!input) return "no-input";' +
        'input.focus();' +
        'input.value = ' + JSON.stringify(email) + ';' +
        'input.dispatchEvent(new Event("input", { bubbles: true }));' +
        'input.dispatchEvent(new Event("change", { bubbles: true }));' +
        'setTimeout(function() {' +
        '  var btn = document.querySelector("#identifierNext") || document.querySelector("button[type=submit]");' +
        '  if (btn) btn.click();' +
        '}, 600);' +
        'return "ok";' +
        '})();';

      setTimeout(function() {
        webview.executeScript({ code: script }, function(res) {
          console.log('[LoginInjector] Email fill result:', res);
          if (res && res[0] === 'ok') {
            self._phase = 'email-done';
          }
        });
      }, 1500);
    },

    _fillPassword: function(webview) {
      var self = this;
      var password = this._credentials.password;

      var script = '(function() {' +
        'var input = document.querySelector("input[type=password]") || document.querySelector("input[name=Passwd]");' +
        'if (!input) return "no-input";' +
        'input.focus();' +
        'input.value = ' + JSON.stringify(password) + ';' +
        'input.dispatchEvent(new Event("input", { bubbles: true }));' +
        'input.dispatchEvent(new Event("change", { bubbles: true }));' +
        'setTimeout(function() {' +
        '  var btn = document.querySelector("#passwordNext") || document.querySelector("button[type=submit]");' +
        '  if (btn) btn.click();' +
        '}, 600);' +
        'return "ok";' +
        '})();';

      setTimeout(function() {
        webview.executeScript({ code: script }, function(res) {
          console.log('[LoginInjector] Password fill result:', res);
          if (res && res[0] === 'ok') {
            self._phase = 'password-done';
          }
        });
      }, 1500);
    }
  };

  window.LoginInjector = LoginInjector;

})();