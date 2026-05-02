// Main interactive enhancements for the dashboard
document.addEventListener('DOMContentLoaded', function() {
  const refreshButton = document.getElementById('refreshButton');
  const refreshStatus = document.getElementById('refreshStatus');
  const overlay = document.getElementById('forecastOverlay');

  function setStatus(message, isError = false) {
    if (!refreshStatus) return;
    refreshStatus.textContent = message;
    refreshStatus.style.color = isError ? '#c0392b' : '#415a77';
  }

  async function refreshModel() {
    if (!refreshButton) return;
    refreshButton.disabled = true;
    setStatus('Refreshing model... this may take a few seconds');

    try {
      const response = await fetch('/refresh');
      const data = await response.json();
      if (data.status === 'success') {
        setStatus('Model refreshed successfully. Reloading view...');
        setTimeout(() => window.location.reload(), 750);
      } else {
        setStatus(data.message || 'Failed to refresh model', true);
      }
    } catch (error) {
      setStatus('Refresh failed. Check server health.', true);
    } finally {
      refreshButton.disabled = false;
    }
  }

  if (refreshButton) {
    refreshButton.addEventListener('click', refreshModel);
  }

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

  setTimeout(() => {
    if (refreshStatus && refreshStatus.textContent.includes('Auto-refreshing')) {
      refreshModel();
    }
  }, 400);
});
