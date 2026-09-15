(function () {
  'use strict';

  var key = 'hexo-blog-theme';
  var root = document.documentElement;
  var system = window.matchMedia('(prefers-color-scheme: dark)');
  var preference = null;
  var button;

  function valid(value) {
    return value === 'light' || value === 'dark' ? value : null;
  }

  try {
    preference = valid(window.localStorage.getItem(key));
  } catch (_) {
    // 禁用存储时仍可在当前页面切换主题。
  }

  function apply() {
    var theme = preference || (system.matches ? 'dark' : 'light');
    root.setAttribute('data-theme', theme);
    if (button) {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.title = theme === 'dark' ? '切换为浅色主题' : '切换为深色主题';
    }
  }

  apply();

  function mount() {
    var navigation = document.getElementById('sub-nav');
    if (!navigation || document.getElementById('theme-toggle')) return;

    button = document.createElement('button');
    button.id = 'theme-toggle';
    button.className = 'theme-toggle';
    button.type = 'button';
    button.setAttribute('aria-label', '深色主题');
    button.innerHTML =
      '<svg class="theme-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>' +
      '<svg class="theme-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.8 13a9 9 0 0 1-9.8-9.8A9 9 0 1 0 20.8 13Z"></path></svg>' +
      '<span class="theme-label-light" aria-hidden="true">浅色</span>' +
      '<span class="theme-label-dark" aria-hidden="true">深色</span>';
    button.addEventListener('click', function () {
      preference = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply();
      try {
        window.localStorage.setItem(key, preference);
      } catch (_) {
        // 存储失败不影响按钮和当前配色。
      }
    });
    navigation.appendChild(button);
    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }

  if (system.addEventListener) {
    system.addEventListener('change', apply);
  } else if (system.addListener) {
    system.addListener(apply);
  }

  window.addEventListener('storage', function (event) {
    if (event.key === key || event.key === null) {
      preference = valid(event.newValue);
      apply();
    }
  });
})();
