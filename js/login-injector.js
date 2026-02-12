/**
 * Login Injector
 */
var LoginInjector = (function() {
  'use strict';

  function log(msg) {
    ToolLauncher.log('INJECTOR: ' + msg);
  }

  function waitAndExecute(wv, checkCode, actionCode, description, interval, maxAttempts) {
    var attempts = 0;
    var timer = setInterval(function() {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(timer);
        log(description + ' - TIMEOUT');
        return;
      }
      wv.executeScript({ code: checkCode }, function(res) {
        if (res && res[0] === true) {
          clearInterval(timer);
          log(description + ' - BULUNDU, calistiriliyor...');
          wv.executeScript({ code: actionCode }, function(result) {
            log(description + ' - SONUC: ' + (result ? result[0] : 'bos'));
          });
        }
      });
    }, interval);
  }

  function injectChatGPT(wv, cred) {
    var loginClicked = false;

    wv.addEventListener('loadstop', function() {
      var currentUrl = wv.src || '';
      log('URL: ' + currentUrl);

      // Adim 1: "Log in" butonuna tikla (sadece bir kez)
      if (currentUrl.includes('chatgpt.com') && !currentUrl.includes('auth') && !loginClicked) {
        loginClicked = true;
        waitAndExecute(wv,
          // Check: Log in butonu var mi?
          `(function() {
            var all = document.querySelectorAll('button');
            for (var i = 0; i < all.length; i++) {
              if (all[i].textContent.trim() === 'Log in') return true;
            }
            return false;
          })();`,
          // Action: Log in butonuna tikla
          `(function() {
            var all = document.querySelectorAll('button');
            for (var i = 0; i < all.length; i++) {
              if (all[i].textContent.trim() === 'Log in') {
                all[i].click();
                return 'CLICKED';
              }
            }
            return 'NOT FOUND';
          })();`,
          'ADIM 1: Log in butonu', 1000, 10
        );

        // Adim 2: Modal acilinca email doldur
        setTimeout(function() {
          waitAndExecute(wv,
            // Check: Email input var mi?
            `(function() {
              var input = document.querySelector('input[type="email"], input[name="email"], input[inputmode="email"]');
              return input !== null;
            })();`,
            // Action: Email doldur
            `(function() {
              var input = document.querySelector('input[type="email"], input[name="email"], input[inputmode="email"]');
              if (!input) return 'INPUT YOK';
              input.focus();
              input.value = '` + cred.email + `';
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              return 'EMAIL YAZILDI';
            })();`,
            'ADIM 2: Email input', 1000, 15
          );
        }, 3000);

        // Adim 3: Continue butonuna tikla
        setTimeout(function() {
          waitAndExecute(wv,
            // Check: Email dolu mu?
            `(function() {
              var input = document.querySelector('input[type="email"], input[name="email"], input[inputmode="email"]');
              return input && input.value.length > 3;
            })();`,
            // Action: Continue/Submit tikla
            `(function() {
              var btn = document.querySelector('button[type="submit"]');
              if (!btn) {
                var all = document.querySelectorAll('button');
                for (var i = 0; i < all.length; i++) {
                  var text = all[i].textContent.trim().toLowerCase();
                  if (text === 'continue' || text === 'devam') {
                    all[i].click();
                    return 'CONTINUE CLICKED';
                  }
                }
                return 'CONTINUE BULUNAMADI';
              }
              btn.click();
              return 'SUBMIT CLICKED';
            })();`,
            'ADIM 3: Continue butonu', 1000, 15
          );
        }, 6000);
      }

      // Adim 4: Auth sayfasinda password doldur
      if (currentUrl.includes('auth.openai.com') || currentUrl.includes('auth0.openai.com')) {
        waitAndExecute(wv,
          // Check: Password input var mi?
          `(function() {
            var input = document.querySelector('input[type="password"]');
            return input !== null;
          })();`,
          // Action: Password doldur ve submit
          `(function() {
            var input = document.querySelector('input[type="password"]');
            if (!input) return 'PASSWORD INPUT YOK';
            input.focus();
            input.value = '` + cred.password + `';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            setTimeout(function() {
              var btn = document.querySelector('button[type="submit"]');
              if (btn) btn.click();
            }, 800);
            return 'PASSWORD YAZILDI';
          })();`,
          'ADIM 4: Password input', 1000, 15
        );
      }
    });
  }

  function inject(toolKey, webview) {
    log('inject cagirildi: ' + toolKey);
    try {
      var cred = CredentialManager.getFor(toolKey);
      if (!cred) {
        log('HATA: Credential NULL');
        return;
      }
      log('Credential yuklendi - email: ' + cred.email.substring(0, 3) + '***');

      switch(toolKey) {
        case 'chatgpt':
          injectChatGPT(webview, cred);
          break;
        default:
          log('Injector tanimlanmamis: ' + toolKey);
      }
    } catch(err) {
      log('CATCH HATA: ' + err.message);
    }
  }

  return { inject: inject };
})();