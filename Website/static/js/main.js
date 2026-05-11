// Main interactive enhancements for the dashboard
document.addEventListener('DOMContentLoaded', function() {
  const refreshButton = document.getElementById('refreshButton');
  const refreshStatus = document.getElementById('refreshStatus');
  const overlay = document.getElementById('forecastOverlay');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const hamburgerToggle = document.getElementById('hamburgerToggle');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarEl = document.getElementById('sidebar');
  const fontSizeSelect = document.getElementById('fontSizeSelect');
  const sidebarPositionSelect = document.getElementById('sidebarPositionSelect');
  const mainContent = document.getElementById('mainContent');
  const yearSpan = document.getElementById('yearSpan');
  const heroTitle = document.getElementById('heroTitle');
  const heroDescription = document.getElementById('heroDescription');
  const heroConfidence = document.getElementById('heroConfidence');
  const sidebarMain = document.getElementById('sidebarMain');
  const sidebarDesc = document.getElementById('sidebarDesc');
  const sidebarConfidence = document.getElementById('sidebarConfidence');
  const todayTemp = document.getElementById('todayTemp');
  const todayHumidity = document.getElementById('todayHumidity');
  const todayWind = document.getElementById('todayWind');
  const forecastCardsContainer = document.getElementById('forecastCards');

  // Initialize WebSocket connection for real-time model results
  const socket = io();
  
  socket.on('connect', function() {
    console.log('WebSocket connected');
  });

  socket.on('model_results', function(data) {
    console.log('Received model results:', data);
    displayPreprocessedResults(data.preprocessed_sample);
  });

  socket.on('disconnect', function() {
    console.log('WebSocket disconnected');
  });

  function displayPreprocessedResults(preprocessedData) {
    if (!Array.isArray(preprocessedData) || preprocessedData.length === 0) {
      console.log('No preprocessed data available');
      return;
    }

    const container = document.querySelector('.tab-content') || document.querySelector('.content');
    if (!container) return;

    // Create a preprocessed data display section
    let preprocessedSection = document.getElementById('preprocessedDataSection');
    if (!preprocessedSection) {
      preprocessedSection = document.createElement('div');
      preprocessedSection.id = 'preprocessedDataSection';
      preprocessedSection.style.marginTop = '2rem';
      preprocessedSection.style.padding = '1.5rem';
      preprocessedSection.style.background = '#f8f9fa';
      preprocessedSection.style.borderRadius = '12px';
      preprocessedSection.style.fontFamily = "'Lato', sans-serif";
      container.appendChild(preprocessedSection);
    }

    // Format and display the preprocessed data as a table
    let html = '<h6 style="margin-bottom: 1rem; color: #2e5077; font-family: \'Lato\', sans-serif;">Preprocessed Data Sample</h6>';
    html += '<div style="overflow-x: auto;">';
    html += '<table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; font-family: \'Lato\', sans-serif;">';
    
    // Get all unique keys from the data
    const keys = Object.keys(preprocessedData[0]);
    
    // Create table header
    html += '<thead style="background: #e8eef5; border-bottom: 2px solid #2e5077;"><tr>';
    keys.forEach(key => {
      html += `<th style="padding: 0.75rem; text-align: left; color: #2e5077; font-weight: 700;">${key}</th>`;
    });
    html += '</tr></thead>';
    
    // Create table body
    html += '<tbody>';
    preprocessedData.forEach((row, index) => {
      html += '<tr style="border-bottom: 1px solid #d0d8e0;">';
      keys.forEach(key => {
        let value = row[key];
        // Format numeric values
        if (typeof value === 'number') {
          value = value.toFixed(2);
        }
        html += `<td style="padding: 0.75rem; color: #25303c;">${value}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';

    preprocessedSection.innerHTML = html;
  }

  // Initialize current year
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Load settings from localStorage
  function loadSettings() {
    const fontSize = localStorage.getItem('weatherFontSize') || 'normal';
    const sidebarPos = localStorage.getItem('weatherSidebarPosition') || 'right';

    applySettings(fontSize, sidebarPos);
    if (fontSizeSelect) fontSizeSelect.value = fontSize;
    if (sidebarPositionSelect) sidebarPositionSelect.value = sidebarPos;
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

  function showSettingsModal() {
    settingsModal.classList.remove('d-none');
  }

  function hideSettingsModal() {
    settingsModal.classList.add('d-none');
  }

  // Settings modal handlers
  if (settingsBtn) {
    settingsBtn.addEventListener('click', showSettingsModal);
  }

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', hideSettingsModal);
  }

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      const fontSize = fontSizeSelect.value;
      const sidebarPos = sidebarPositionSelect.value;

      localStorage.setItem('weatherFontSize', fontSize);
      localStorage.setItem('weatherSidebarPosition', sidebarPos);

      applySettings(fontSize, sidebarPos);
      hideSettingsModal();
    });
  }

  if (settingsModal) {
    settingsModal.addEventListener('click', function(e) {
      if (e.target === settingsModal) {
        hideSettingsModal();
      }
    });
  }

  function toggleSidebar() {
    if (!sidebarEl) return;
    sidebarEl.classList.toggle('collapsed');
    if (sidebarToggle) sidebarToggle.textContent = sidebarEl.classList.contains('collapsed') ? '⮞' : '⮜';
    if (hamburgerToggle) hamburgerToggle.textContent = sidebarEl.classList.contains('collapsed') ? '☰' : '✕';
  }

  if (hamburgerToggle) {
    hamburgerToggle.addEventListener('click', toggleSidebar);
  }

  if (sidebarToggle && sidebarEl) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }

  // Load saved settings on page load
  loadSettings();

  function setStatus(message, isError = false) {
    if (!refreshStatus) return;
    refreshStatus.textContent = message;
    refreshStatus.style.color = isError ? '#b02a37' : '#25303c';
  }

  function sanitize(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function bindForecastCards() {
    const cards = Array.from(document.querySelectorAll('.forecast-card'));
    cards.forEach(card => {
      card.addEventListener('click', showForecastDetail);
      card.addEventListener('keypress', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          showForecastDetail(event);
        }
      });
    });
  }

  function renderForecastData(forecast) {
    if (!forecast) return;
    const current = forecast.current_weather || {};
    const today = current.supporting_data || {};
    const weekly = forecast.weekly_forecast || [];
    const weekOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const orderedWeekly = weekly.slice().sort((a, b) => {
      const aIndex = weekOrder.indexOf(a.day);
      const bIndex = weekOrder.indexOf(b.day);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    if (heroTitle) heroTitle.textContent = current.predicted_main || 'Weekly Forecast';
    if (heroDescription) heroDescription.textContent = current.predicted_description || 'Your ML-powered outlook for the next 7 days';
    if (heroConfidence) heroConfidence.textContent = current.confidence != null ? `Confidence: ${current.confidence}%` : 'Confidence: —';

    if (sidebarMain) sidebarMain.textContent = current.predicted_main || '—';
    if (sidebarDesc) sidebarDesc.textContent = current.predicted_description || 'Current outlook';
    if (sidebarConfidence) sidebarConfidence.textContent = current.confidence != null ? `${current.confidence}%` : '—';
    if (todayTemp) todayTemp.textContent = today.temp != null ? `${today.temp}°C` : '—';
    if (todayHumidity) todayHumidity.textContent = today.humidity != null ? `${today.humidity}%` : '—';
    if (todayWind) todayWind.textContent = today.wind != null ? `${today.wind}` : '—';

    if (forecastCardsContainer) {
      forecastCardsContainer.innerHTML = orderedWeekly.map(day => {
        const mainLabel = day.predicted_main || day.condition || 'Forecast';
        const description = day.predicted_description || day.condition || '';
        const icon = day.icon || '☁️';
        const confidence = day.confidence != null ? day.confidence : '—';
        const high = day.high != null ? day.high : '—';
        const low = day.low != null ? day.low : '—';

        return `
          <div class="forecast-card" role="button" tabindex="0"
               data-day="${sanitize(day.day)}"
               data-icon="${sanitize(icon)}"
               data-condition="${sanitize(day.condition)}"
               data-predicted-main="${sanitize(mainLabel)}"
               data-high="${sanitize(high)}"
               data-low="${sanitize(low)}"
               data-confidence="${sanitize(confidence)}"
               data-description="${sanitize(description)}">
            <div class="day-label">${sanitize(day.day)}</div>
            <div class="forecast-icon">${sanitize(icon)}</div>
            <div class="forecast-text">${sanitize(mainLabel)}</div>
            <div class="forecast-sub" style="font-size:0.88rem; color: rgba(37,48,60,0.65); margin-top:0.25rem;">${sanitize(description)}</div>
            <div class="forecast-temp" style="margin-top:0.85rem; font-weight:700;">${sanitize(high)}° / ${sanitize(low)}°</div>
          </div>
        `;
      }).join('');

      bindForecastCards();
    }
  }

  async function fetchForecastFromServer() {
    setStatus('Loading forecast...');
    try {
      // Fetch preprocessed model output from the Flask API endpoint.
      const response = await fetch('/api/model-results');
      if (!response.ok) throw new Error('Forecast API request failed');
      const result = await response.json();
      const forecast = result.forecast || {};
      renderForecastData(forecast);
      setStatus('Forecast loaded');
      return forecast;
    } catch (error) {
      setStatus('Forecast load failed', true);
      return null;
    }
  }

  async function refreshModel() {
    if (!refreshButton) return;
    refreshButton.disabled = true;
    setStatus('Refreshing model...');

    try {
      // This endpoint runs the Python model script server-side and updates weather_predictions.json.
      const response = await fetch('/refresh');
      const data = await response.json();
      if (data.status === 'success') {
        await fetchForecastFromServer();
        setStatus('Forecast updated');
      } else {
        setStatus(data.message || 'Refresh failed', true);
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

  // Tab functionality
  const tabButtons = document.querySelectorAll('.tab-link');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      const targetPane = document.getElementById(tabId);
      if (targetPane) targetPane.classList.add('active');
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
      main: card.dataset.predictedMain || card.dataset.condition,
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
    const closeButton = overlay.querySelector('.minimize-button');
    if (closeButton) closeButton.addEventListener('click', closeForecastDetail);
    overlay.onclick = function(evt) {
      if (evt.target === overlay) {
        closeForecastDetail();
      }
    };
  }

  function closeForecastDetail() {
    overlay.classList.add('d-none');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '';
  }

  // Main content date/time update and collapse toggle
  const mainDateTimeEl = document.getElementById('mainDateTime');

  function updateDateTime() {
    if (!mainDateTimeEl) return;
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    mainDateTimeEl.textContent = dateString;
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);

  if (sidebarToggle && sidebarEl) {
    sidebarToggle.addEventListener('click', function() {
      sidebarEl.classList.toggle('collapsed');
      sidebarToggle.textContent = sidebarEl.classList.contains('collapsed') ? '⮞' : '⮜';
    });
  }

  // Load model forecast data into the page
  fetchForecastFromServer();
});
