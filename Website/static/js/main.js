// Main interactive enhancements for the dashboard
document.addEventListener('DOMContentLoaded', function(){
  // Confirm before running long pipeline
  const runBtn = document.querySelector('a[href="/run"]');
  if(runBtn){
    runBtn.addEventListener('click', function(e){
      if(!confirm('Run the pipeline now? This may take a few minutes. Continue?')){
        e.preventDefault();
      }
    });
  }

  // Position marker dynamically if present
  const marker = document.querySelector('.marker');
  if(marker){
    const left = marker.style.left || null;
    // animate in by toggling a tiny transform
    marker.style.opacity = 0;
    setTimeout(()=>{ marker.style.opacity = 1; }, 60);
  }

  // Make info-card accessible with keyboard
  document.querySelectorAll('.info-card').forEach((el)=>{
    el.setAttribute('tabindex', '0');
    el.addEventListener('keypress', (ev)=>{ if(ev.key==='Enter'){ el.click(); } });
  });

  // Small tooltip for marker percent (if label not present)
  document.querySelectorAll('.marker').forEach(m=>{
    if(!m.querySelector('.label')){
      const pct = m.getAttribute('data-percent');
      if(pct){
        const label = document.createElement('div'); label.className='label'; label.textContent = pct+'%'; m.appendChild(label);
      }
    }
  });
});
