/**
 * Ana uygulama dosyasi
 * Tool kartlarini olusturur ve event'leri baglar
 */
(function() {
  'use strict';

  /** Tool kartlarini dinamik olusturur */
  function renderToolCards() {
    const container = document.querySelector('.tools');
    container.innerHTML = '';

    Object.keys(TOOLS_CONFIG).forEach(function(key) {
      const tool = TOOLS_CONFIG[key];
      const card = document.createElement('div');
      card.className = 'tool-card';
      card.innerHTML =
        '<div class="icon">' + tool.icon + '</div>' +
        '<div class="name">' + tool.name + '</div>';
      card.addEventListener('click', function() {
        ToolLauncher.launch(key);
      });
      container.appendChild(card);
    });
  }

  /** Geri butonunu baglar */
  function bindEvents() {
    document.getElementById('back-btn').addEventListener('click', function() {
      ToolLauncher.goHome();
    });
  }

  /** Uygulama baslatma */
  document.addEventListener('DOMContentLoaded', function() {
    renderToolCards();
    bindEvents();
  });

})();