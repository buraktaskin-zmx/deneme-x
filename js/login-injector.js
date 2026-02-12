/**
 * Login Injector - Tool sayfalarına otomatik login bilgisi enjekte eder
 * Google SSO desteği eklenmiştir
 */
(function() {
  'use strict';

  const LoginInjector = {
    /**
     * Mevcut tool için login bilgilerini al ve otomatik doldur
     * @param {string} toolKey - Tool anahtarı
     * @param {object} webview - NW.js webview elementi
     */
    inject: function(toolKey, webview) {
      const credentials = CredentialManager.getCredential(toolKey);
      if (!credentials) {
        console.log('No credentials found for:', toolKey);
        return;
      }

      const toolConfig = TOOLS_CONFIG[toolKey];
      if (!toolConfig || !toolConfig.loginSelectors) {
        console.log('No login selectors configured for:', toolKey);
        return;
      }

      // Webview yüklendiğinde inject et
      webview.addEventListener('loadstop', function() {
        const currentUrl = webview.src || '';
        
        // Google OAuth sayfasında mıyız?
        if (currentUrl.includes('accounts.google.com')) {
          LoginInjector.handleGoogleLogin(webview, credentials);
          return;
        }

        // Normal login sayfası işlemleri
        LoginInjector.handleNormalLogin(webview, toolConfig, credentials);
      });
    },

    /**
     * Google OAuth login işlemini yönet
     * @param {object} webview - Webview elementi
     * @param {object} credentials - Kullanıcı bilgileri
     */
    handleGoogleLogin: function(webview, credentials) {
      const currentUrl = webview.src || '';
      
      // Email giriş sayfası
      if (currentUrl.includes('identifier') || currentUrl.includes('ServiceLogin')) {
        const emailScript = `
          (function() {
            // Email input'u bul ve doldur
            const emailInput = document.querySelector('input[type="email"]') || 
                              document.querySelector('#identifierId') ||
                              document.querySelector('input[name="identifier"]');
            
            if (emailInput) {
              emailInput.value = '${credentials.username}';
              emailInput.dispatchEvent(new Event('input', { bubbles: true }));
              emailInput.dispatchEvent(new Event('change', { bubbles: true }));
              
              // Next butonuna tıkla
              setTimeout(function() {
                const nextBtn = document.querySelector('#identifierNext') ||
                               document.querySelector('[data-primary-action-label]') ||
                               document.querySelector('button[type="submit"]') ||
                               document.querySelector('.VfPpkd-LgbsSe-OWXEXe-k8QpJ');
                
                if (nextBtn) {
                  nextBtn.click();
                }
              }, 500);
            }
          })();
        `;
        
        setTimeout(function() {
          webview.executeScript({ code: emailScript });
        }, 1000);
      }
      
      // Şifre giriş sayfası
      if (currentUrl.includes('challenge') || currentUrl.includes('pwd')) {
        const passwordScript = `
          (function() {
            // Şifre input'u bul ve doldur
            const passwordInput = document.querySelector('input[type="password"]') ||
                                 document.querySelector('input[name="password"]') ||
                                 document.querySelector('#password input[type="password"]');
            
            if (passwordInput) {
              passwordInput.value = '${credentials.password}';
              passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
              passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
              
              // Next/Login butonuna tıkla
              setTimeout(function() {
                const submitBtn = document.querySelector('#passwordNext') ||
                                 document.querySelector('button[type="submit"]') ||
                                 document.querySelector('.VfPpkd-LgbsSe-OWXEXe-k8QpJ');
                
                if (submitBtn) {
                  submitBtn.click();
                }
              }, 500);
            }
          })();
        `;
        
        setTimeout(function() {
          webview.executeScript({ code: passwordScript });
        }, 1000);
      }
    },

    /**
     * Normal login ve Google SSO butonu tıklama
     * @param {object} webview - Webview elementi
     * @param {object} toolConfig - Tool konfigürasyonu
     * @param {object} credentials - Kullanıcı bilgileri
     */
    handleNormalLogin: function(webview, toolConfig, credentials) {
      const selectors = toolConfig.loginSelectors;
      
      // Google SSO butonu varsa önce onu dene
      if (selectors.googleSsoButton) {
        const googleSsoScript = `
          (function() {
            // Google ile giriş butonunu bul
            const googleBtn = document.querySelector('${selectors.googleSsoButton}') ||
                             document.querySelector('button[data-provider="google"]') ||
                             document.querySelector('[data-action="google"]') ||
                             document.querySelector('button:contains("Google")') ||
                             Array.from(document.querySelectorAll('button')).find(btn => 
                               btn.textContent.toLowerCase().includes('google') ||
                               btn.textContent.toLowerCase().includes('continue with google')
                             ) ||
                             Array.from(document.querySelectorAll('a')).find(a => 
                               a.textContent.toLowerCase().includes('google') ||
                               a.textContent.toLowerCase().includes('continue with google')
                             );
            
            if (googleBtn) {
              console.log('Google SSO button found, clicking...');
              googleBtn.click();
              return true;
            }
            
            // ChatGPT için özel selector'lar
            const chatGptGoogleBtn = document.querySelector('[data-testid="login-with-google"]') ||
                                    document.querySelector('.social-btn-google') ||
                                    document.querySelector('[aria-label*="Google"]') ||
                                    document.querySelector('[class*="google"]');
            
            if (chatGptGoogleBtn) {
              console.log('ChatGPT Google button found, clicking...');
              chatGptGoogleBtn.click();
              return true;
            }
            
            return false;
          })();
        `;
        
        setTimeout(function() {
          webview.executeScript({ code: googleSsoScript });
        }, 1500);
        
        return;
      }
      
      // Normal login işlemi
      if (selectors.username && selectors.password && selectors.submit) {
        const loginScript = `
          (function() {
            const usernameEl = document.querySelector('${selectors.username}');
            const passwordEl = document.querySelector('${selectors.password}');
            const submitEl = document.querySelector('${selectors.submit}');
            
            if (usernameEl && passwordEl) {
              usernameEl.value = '${credentials.username}';
              usernameEl.dispatchEvent(new Event('input', { bubbles: true }));
              
              passwordEl.value = '${credentials.password}';
              passwordEl.dispatchEvent(new Event('input', { bubbles: true }));
              
              if (submitEl) {
                setTimeout(function() {
                  submitEl.click();
                }, 300);
              }
            }
          })();
        `;
        
        setTimeout(function() {
          webview.executeScript({ code: loginScript });
        }, 1000);
      }
    },

    /**
     * ChatGPT için özel login akışı
     * @param {object} webview - Webview elementi
     * @param {object} credentials - Kullanıcı bilgileri
     */
    handleChatGPTLogin: function(webview, credentials) {
      const loginPageScript = `
        (function() {
          // Login butonuna tıkla
          const loginBtn = document.querySelector('[data-testid="login-button"]') ||
                          document.querySelector('button:contains("Log in")') ||
                          Array.from(document.querySelectorAll('button')).find(btn => 
                            btn.textContent.toLowerCase().includes('log in')
                          );
          
          if (loginBtn) {
            loginBtn.click();
          }
        })();
      `;
      
      webview.executeScript({ code: loginPageScript });
    }
  };

  // Global scope'a ekle
  window.LoginInjector = LoginInjector;

})();