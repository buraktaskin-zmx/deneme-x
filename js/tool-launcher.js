/**
 * Tool launcher modulu
 */
var ToolLauncher = {
  currentWebview: null,

  log: function(msg) {
    var panel = document.getElementById('debug-panel');
    var time = new Date().toLocaleTimeString();
    panel.innerHTML += time + ' | ' + msg + '<br>';
    panel.scrollTop = panel.scrollHeight;
  },

  launch: function(toolKey) {
    var tool = TOOLS_CONFIG[toolKey];
    if (!tool) return;

    this.showToolView(tool);
    this.createWebview(toolKey, tool);
  },

  showToolView: function(tool) {
    document.getElementById('home').classList.add('hidden');
    document.getElementById('tool-view').classList.add('active');
    document.getElementById('toolbar-title').textContent = tool.name;
    document.getElementById('toolbar-domain').textContent = tool.url;
    document.getElementById('debug-panel').innerHTML = '';
  },

  createWebview: function(toolKey, tool) {
    var self = this;
    var container = document.getElementById('browser-container');
    container.innerHTML = '';

    var wv = document.createElement('webview');
    wv.setAttribute('src', tool.url);
    wv.setAttribute('partition', 'persist:tool-' + toolKey);
    container.appendChild(wv);

    this.currentWebview = wv;
    self.log('Webview olusturuldu: ' + tool.url);

    wv.addEventListener('loadstart', function(e) {
      self.log('LOADSTART: ' + e.url);
    });

  wv.addEventListener('loadstop', function(e) {
      self.log('LOADSTOP: ' + wv.src);
      
      // Sayfadaki butonlari logla
      wv.executeScript({ code: `
        (function() {
          var buttons = document.querySelectorAll('button, a');
          var result = [];
          for (var i = 0; i < buttons.length && i < 15; i++) {
            result.push(buttons[i].tagName + ': ' + buttons[i].textContent.trim().substring(0, 40));
          }
          return result.join(' | ');
        })();
      `}, function(res) {
        if (res && res[0]) {
          self.log('BUTTONS: ' + res[0]);
        }
      });
    });

    wv.addEventListener('loadabort', function(e) {
      self.log('LOADABORT: ' + e.url + ' reason: ' + e.reason);
    });

    wv.addEventListener('permissionrequest', function(e) {
      self.log('PERMISSION: ' + e.permission);
      e.request.allow();
    });

    wv.addEventListener('consolemessage', function(e) {
      self.log('CONSOLE: ' + e.message);
    });

    this.attachNavigationGuard(wv, tool);
    LoginInjector.inject(toolKey, wv);
  },

 attachNavigationGuard: function(wv, tool) {
    var self = this;
    wv.addEventListener('loadcommit', function(e) {
      try {
        // about:blank ve data: URL'lerini yoksay
        if (e.url === 'about:blank' || e.url.startsWith('data:') || e.url.startsWith('blob:')) {
          return;
        }

        var url = new URL(e.url);
        var isAllowed = tool.allowedDomains.some(function(domain) {
          return url.hostname.includes(domain);
        });
        if (!isAllowed) {
          self.log('BLOCKED: ' + url.hostname);
          wv.src = tool.url;
        } else {
          document.getElementById('toolbar-domain').textContent = url.hostname;
        }
      } catch (err) {
        self.log('ERROR: ' + err.message);
      }
    });
  },

  goHome: function() {
    document.getElementById('home').classList.remove('hidden');
    document.getElementById('tool-view').classList.remove('active');
    document.getElementById('browser-container').innerHTML = '';
    this.currentWebview = null;
  }
};