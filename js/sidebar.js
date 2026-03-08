// sidebar.js - with mobile bottom nav support
function renderSidebar(activePage) {
  const session = getSession ? getSession() : null;
  const isAdmin = session && session.role === 'admin';

  const allItems = [
    { icon:'📊', label:'Dashboard', href: isAdmin ? 'dashboard.html' : 'user-dashboard.html', page:'dashboard' },
    { icon:'👥', label:'Employees', href:'employee-list.html', page:'employees', section:'People', adminOnly:true },
    { icon:'🏛️', label:'Departments', href:'department-list.html', page:'departments', adminOnly:true },
    { icon:'📅', label:'Leave Requests', href:'leave-requests.html', page:'leaves', section:'Leave' },
    { icon:'✅', label:'Leave Approval', href:'leave-approval.html', page:'approval', adminOnly:true },
    { icon:'⏰', label:'Attendance', href:'attendance-view.html', page:'attendance', section:'Records', adminOnly:true },
    { icon:'📢', label:'Announcements', href:'announcements.html', page:'announcements' },
    { icon:'📈', label:'Reports', href:'reports.html', page:'reports', section:'Analytics', adminOnly:true },
    { icon:'🔔', label:'Notifications', href:'notifications.html', page:'notifications', section:'System' },
    { icon:'⚙️', label:'Settings', href:'settings.html', page:'settings' },
    { icon:'❓', label:'Help', href:'help.html', page:'help' },
  ];

  const items = isAdmin ? allItems : allItems.filter(i => !i.adminOnly);

  let navHTML = '';
  let lastSection = '';
  items.forEach(item => {
    if (item.section && item.section !== lastSection) {
      navHTML += `<div class="nav-section-label">${item.section}</div>`;
      lastSection = item.section;
    }
    navHTML += `<a href="${item.href}" class="nav-item${activePage===item.page?' active':''}">
      <span class="icon">${item.icon}</span> ${item.label}
    </a>`;
  });

  const initials = session ? session.initials : 'U';
  const displayName = session ? session.name : 'User';
  const roleLabel = session ? (session.role === 'admin' ? '⚡ Admin' : '👤 Employee') : '';

  // Mobile bottom nav items
  const mobileItems = isAdmin
    ? [
        { icon:'📊', label:'Home', href:'dashboard.html', page:'dashboard' },
        { icon:'👥', label:'Team', href:'employee-list.html', page:'employees' },
        { icon:'📅', label:'Leave', href:'leave-approval.html', page:'approval' },
        { icon:'📢', label:'News', href:'announcements.html', page:'announcements' },
        { icon:'⚙️', label:'Settings', href:'settings.html', page:'settings' },
      ]
    : [
        { icon:'📊', label:'Home', href:'user-dashboard.html', page:'dashboard' },
        { icon:'📅', label:'Leave', href:'leave-requests.html', page:'leaves' },
        { icon:'📢', label:'News', href:'announcements.html', page:'announcements' },
        { icon:'🔔', label:'Alerts', href:'notifications.html', page:'notifications' },
        { icon:'⚙️', label:'Settings', href:'settings.html', page:'settings' },
      ];

  const mobileNavHTML = mobileItems.map(i => `
    <a href="${i.href}" class="mobile-nav-item${activePage===i.page?' active':''}">
      <span class="mnav-icon">${i.icon}</span>${i.label}
    </a>`).join('');

  document.getElementById('sidebar-mount').innerHTML = `
    <aside class="sidebar" id="sidebar" role="navigation" aria-label="Main navigation">
      <div class="sidebar-logo">
        <div class="logo-icon"><img src="img/logo.jpeg" alt="OfficeDesk" style="width:36px;height:36px;border-radius:10px;object-fit:cover;"></div>
        <div class="logo-text">Office<span>Desk</span></div>
      </div>
      <nav class="sidebar-nav">${navHTML}</nav>
      <div class="sidebar-footer">
        <div class="user-mini">
          <div class="avatar-sm">${initials}</div>
          <div class="user-mini-info">
            <strong>${displayName}</strong>
            <span>${roleLabel}</span>
          </div>
          <button onclick="logout()" title="Logout" style="margin-left:auto;background:rgba(255,255,255,0.15);border:none;color:white;cursor:pointer;font-size:15px;padding:6px 8px;border-radius:8px;transition:background 0.2s;" onmouseover="this.style.background='rgba(255,71,87,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'">⏏</button>
        </div>
      </div>
    </aside>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <nav class="mobile-bottom-nav" role="navigation" aria-label="Mobile navigation">
      <div class="mobile-nav-items">${mobileNavHTML}</div>
    </nav>
  `;

  const o = document.getElementById('sidebarOverlay');
  const s = document.getElementById('sidebar');
  if (o && s) {
    o.addEventListener('click', () => { s.classList.remove('open'); o.classList.remove('active'); });
  }
  const toggle = document.querySelector('.menu-toggle');
  if (toggle && s) {
    toggle.addEventListener('click', () => { s.classList.toggle('open'); o && o.classList.toggle('active'); });
  }
  // Mobile header menu toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  if (mobileToggle && s) {
    mobileToggle.addEventListener('click', () => { s.classList.toggle('open'); o && o.classList.toggle('active'); });
  }
}
