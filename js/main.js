// OfficeDesk – main.js

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay && overlay.classList.toggle('active');
    });
    overlay && overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay && overlay.classList.remove('active');
    });
  }
});

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay')) e.target.classList.remove('active');
});

function showToast(msg, type = 'success') {
  const existing = document.getElementById('od-toast');
  if (existing) existing.remove();
  const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  const t = document.createElement('div');
  t.id = 'od-toast';
  const isMobile = window.innerWidth <= 640;
  t.style.cssText = `
    position:fixed;
    ${isMobile ? 'bottom:90px;left:16px;right:16px;' : 'bottom:90px;right:20px;max-width:280px;'}
    background:#fff;
    color:var(--text,#1a2340);
    padding:13px 18px;
    border-radius:14px;
    font-size:13px;
    font-weight:700;
    z-index:9999;
    animation:toastIn .3s ease;
    box-shadow:0 8px 32px rgba(79,126,248,0.18);
    border:1px solid #e2e8f8;
    border-left:4px solid ${type==='success'?'#00c896':type==='error'?'#ff4757':'#4f7ef8'};
    display:flex;align-items:center;gap:10px;
    font-family:'Nunito',sans-serif;
  `;
  t.innerHTML = `<span>${icons[type]||icons.success}</span><span>${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; }, 2700);
  setTimeout(() => t.remove(), 3000);
}

function toggleFaq(el) {
  const item = el.parentElement;
  item.classList.toggle('open');
  el.setAttribute('aria-expanded', item.classList.contains('open'));
}
