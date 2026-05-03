// Main interactive enhancements for the dashboard
document.addEventListener('DOMContentLoaded', function() {
  const refreshButton = document.getElementById('refreshButton');
  const refreshStatus = document.getElementById('refreshStatus');
  const overlay = document.getElementById('forecastOverlay');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const fontSizeSelect = document.getElementById('fontSizeSelect');
  const sidebarPositionSelect = document.getElementById('sidebarPositionSelect');
  const mainContent = document.getElementById('mainContent');
  const yearSpan = document.getElementById('yearSpan');
  
  // Initialize current year
  yearSpan.textContent = new Date().getFullYear();

  // Load settings from localStorage
  function loadSettings() {
    const fontSize = localStorage.getItem('weatherFontSize') || 'normal';
    const sidebarPos = localStorage.getItem('weatherSidebarPosition') || 'right';
    
    applySettings(fontSize, sidebarPos);
    fontSizeSelect.value = fontSize;
    sidebarPositionSelect.value = sidebarPos;
  }

  // Apply settings to the page
  function applySettings(fontSize, sidebarPos) {
    document.body.classList.remove('font-size-small', 'font-size-normal', 'font-size-large');
    if (fontSize === 'small') document.body.classList.add('font-size-small');
    if (fontSize === 'large') document.body.classList.add('font-size-large');
    
    mainContent.classList.remove('sidebar-right');
    if (sidebarPos === 'left') {
      mainContent.classList.add('sidebar-left');
    } else {
      mainContent.classList.add('sidebar-right');
    }
  }

  // Settings modal handlers
  settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
  });

  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });

  saveSettingsBtn.addEventListener('click', () => {
    const fontSize = fontSizeSelect.value;
    const sidebarPos = sidebarPositionSelect.value;
    
    localStorage.setItem('weatherFontSize', fontSize);
    localStorage.setItem('weatherSidebarPosition', sidebarPos);
    
    applySettings(fontSize, sidebarPos);
    settingsModal.style.display = 'none';
  });

  // Close settings modal when clicking outside
  settingsModal.addEventListener('click', function(e) {
    if (e.target === settingsModal) {
      settingsModal.style.display = 'none';
    }
  });

  // Load saved settings on page load
  loadSettings();

  function setStatus(message, isError = false) {
    if (!refreshStatus) return;
    refreshStatus.textContent = message;
    refreshStatus.style.color = isError ? '#fff' : 'rgba(255,255,255,0.9)';
  }

  async function refreshModel() {
    if (!refreshButton) return;
    refreshButton.disabled = true;
    setStatus('Refreshing...');

    try {
      const response = await fetch('/refresh');
      const data = await response.json();
      if (data.status === 'success') {
        setStatus('Refreshed!');
        setTimeout(() => window.location.reload(), 500);
      } else {
        setStatus(data.message || 'Failed', true);
      }
    } catch (error) {
      setStatus('Connection failed', true);
    } finally {
      refreshButton.disabled = false;
    }
  }

  if (refreshButton) {
    refreshButton.addEventListener('click', refreshModel);
  }

  // Auto-refresh ONCE on page load - use sessionStorage to track if refresh was done
  const hasAutoRefreshed = sessionStorage.getItem('weatherAutoRefreshed');
  if (!hasAutoRefreshed) {
    sessionStorage.setItem('weatherAutoRefreshed', 'true');
    setStatus('Initializing...');
    setTimeout(() => {
      refreshModel();
    }, 500);
  } else {
    setStatus('Ready');
  }

  // Tab functionality
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  const cards = Array.from(document.querySelectorAll('.forecast-card'));
  cards.forEach(card => {
    card.addEventListener('click', showForecastDetail);
    card.addEventListener('keypress', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        showForecastDetail(event);
      }
    });
  });

  function showForecastDetail(event) {
    const card = event.currentTarget || event.target;
    const detail = {
      day: card.dataset.day,
      icon: card.dataset.icon,
      condition: card.dataset.condition,
      high: card.dataset.high,
      low: card.dataset.low,
      confidence: card.dataset.confidence,
      description: card.dataset.description,
      main: card.dataset.main,
    };

    overlay.innerHTML = `
      <div class="forecast-detail-panel">
        <button type="button" class="minimize-button" aria-label="Close detail">×</button>
        <div class="detail-header">
          <div class="detail-icon">${detail.icon}</div>
          <div>
            <div class="detail-day">${detail.day}</div>
            <div class="detail-main">${detail.main}</div>
            <div class="detail-sub">${detail.description}</div>
          </div>
        </div>
        <div class="detail-grid">
          <div class="detail-block"><strong>High</strong><span>${detail.high}°</span></div>
          <div class="detail-block"><strong>Low</strong><span>${detail.low}°</span></div>
          <div class="detail-block"><strong>Confidence</strong><span>${detail.confidence}%</span></div>
        </div>
        <div class="detail-footer">Click the close icon to minimize this view and return to the weekly dashboard.</div>
      </div>
    `;

    overlay.classList.remove('d-none');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.querySelector('.minimize-button').addEventListener('click', closeForecastDetail);
    overlay.addEventListener('click', function onOutsideClick(evt) {
      if (evt.target === overlay) {
        closeForecastDetail();
      }
    });
  }

  function closeForecastDetail() {
    overlay.classList.add('d-none');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '';
  }
  // Sidebar date/time update and collapse toggle
  const dateTimeEl = document.getElementById('currentDateTime');
  const sidebarEl = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');

  function updateDateTime() {
    if (!dateTimeEl) return;
    const now = new Date();
    const opts = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    dateTimeEl.textContent = now.toLocaleString(undefined, opts);
  }
  updateDateTime();
  setInterval(updateDateTime, 1000);

  if (sidebarToggle && sidebarEl) {
    sidebarToggle.addEventListener('click', function() {
      sidebarEl.classList.toggle('collapsed');
      if (sidebarEl.classList.contains('collapsed')) {
        sidebarToggle.textContent = '⮞';
      } else {
        sidebarToggle.textContent = '⮜';
      }
    });
  }
});
