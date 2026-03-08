// OfficeDesk – auth.js

const ADMIN_PIN = 'Ilai30';
const STORAGE_KEYS = {
  USERS:         'od_users',
  SESSION:       'od_session',
  EMP:           'od_employees',
  LEAVE:         'od_leaves',
  ANNOUNCEMENTS: 'od_announcements',
  ATTENDANCE:    'od_attendance',
  PENDING_USERS: 'od_pending_users'   // NEW: awaiting admin approval
};

/* ── PASSWORD HASHING ── */
async function hashPassword(password) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

/* ── SESSION ── */
function getUsers()    { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'); }
function saveUsers(u)  { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(u)); }
function getSession()  { const s = localStorage.getItem(STORAGE_KEYS.SESSION); return s ? JSON.parse(s) : null; }
function setSession(u) { localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(u)); }
function clearSession(){ localStorage.removeItem(STORAGE_KEYS.SESSION); }

function requireAuth(role) {
  const session = getSession();
  if (!session) { window.location.href = 'login.html'; return null; }
  if (role && role !== 'any' && session.role !== role) {
    window.location.href = session.role === 'admin' ? 'dashboard.html' : 'user-dashboard.html';
    return null;
  }
  return session;
}

/* ── PENDING REGISTRATIONS ── */
function getPendingUsers()   { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_USERS) || '[]'); }
function savePendingUsers(p) { localStorage.setItem(STORAGE_KEYS.PENDING_USERS, JSON.stringify(p)); }

function approvePendingUser(id) {
  const pending  = getPendingUsers();
  const idx      = pending.findIndex(u => u.id === id);
  if (idx === -1) return;
  const user     = pending[idx];
  user.status    = 'approved';
  user.approvedAt = new Date().toISOString();

  // Move to active users
  const users = getUsers();
  users.push(user);
  saveUsers(users);

  // Also add as employee record
  const emps = getEmployees();
  emps.push({
    id:        user.id,
    name:      user.name,
    email:     user.email,
    role:      user.jobRole || 'Employee',
    department: user.department || '',
    phone:     user.phone || '',
    initials:  user.initials,
    status:    'active',
    createdAt: user.createdAt
  });
  saveEmployees(emps);

  // Remove from pending
  pending.splice(idx, 1);
  savePendingUsers(pending);
}

function rejectPendingUser(id) {
  savePendingUsers(getPendingUsers().filter(u => u.id !== id));
}

/* ── REGISTER ── */
async function register({ name, email, password, role, pin }) {
  // Check existing users + pending
  const users   = getUsers();
  const pending = getPendingUsers();
  if (users.find(u => u.email === email) || pending.find(u => u.email === email))
    return { ok: false, msg: 'Email already registered.' };

  if (role === 'admin' && pin !== ADMIN_PIN)
    return { ok: false, msg: 'Invalid admin PIN. Access denied.' };

  const hashed   = await hashPassword(password);
  const userId   = 'U' + Date.now();
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const user     = { id: userId, name, email, password: hashed, role, initials, createdAt: new Date().toISOString(), status: 'pending' };

  if (role === 'admin') {
    // Admins go straight to active
    user.status = 'approved';
    users.push(user);
    saveUsers(users);
  } else {
    // Regular users go to pending approval queue
    pending.push(user);
    savePendingUsers(pending);
  }

  return { ok: true, user };
}

/* ── LOGIN ── */
async function login(email, password) {
  const hashed = await hashPassword(password);

  // Check if still pending
  const pending = getPendingUsers();
  if (pending.find(u => u.email === email)) {
    return { ok: false, msg: 'Your account is awaiting admin approval. Please wait.' };
  }

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.password === hashed);
  if (!user) return { ok: false, msg: 'Invalid email or password.' };

  const session = { id: user.id, name: user.name, email: user.email, role: user.role, initials: user.initials };
  setSession(session);
  return { ok: true, user: session };
}

/* ── LOGOUT ── */
function logout() { clearSession(); window.location.href = 'login.html'; }

/* ── EMPLOYEES ── */
function getEmployees()   { return JSON.parse(localStorage.getItem(STORAGE_KEYS.EMP) || '[]'); }
function saveEmployees(e) { localStorage.setItem(STORAGE_KEYS.EMP, JSON.stringify(e)); }
function addEmployee(emp) {
  const emps   = getEmployees();
  emp.id       = 'OD' + String(emps.length + 1).padStart(3, '0');
  emp.initials = emp.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  emps.push(emp);
  saveEmployees(emps);
  return emp;
}
function deleteEmployee(id) { saveEmployees(getEmployees().filter(e => e.id !== id)); }

/* ── LEAVES ── */
function getLeaves()   { return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVE) || '[]'); }
function saveLeaves(l) { localStorage.setItem(STORAGE_KEYS.LEAVE, JSON.stringify(l)); }
function addLeave(leave) {
  const leaves = getLeaves();
  leave.id     = 'L' + Date.now();
  leave.status = 'pending';
  leaves.unshift(leave);
  saveLeaves(leaves);
  return leave;
}
function updateLeaveStatus(id, status) {
  const leaves = getLeaves();
  const l = leaves.find(l => l.id === id);
  if (l) l.status = status;
  saveLeaves(leaves);
}

/* ── ANNOUNCEMENTS ── */
function getAnnouncements()   { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS) || '[]'); }
function saveAnnouncements(a) { localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(a)); }
function addAnnouncement(ann) {
  const anns = getAnnouncements();
  ann.id   = 'A' + Date.now();
  ann.date = new Date().toISOString().split('T')[0];
  anns.unshift(ann);
  saveAnnouncements(anns);
  return ann;
}
function deleteAnnouncement(id) { saveAnnouncements(getAnnouncements().filter(a => a.id !== id)); }

/* ── ATTENDANCE ── */
function getAttendance()   { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]'); }
function saveAttendance(a) { localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(a)); }
function checkIn(userId, empName) {
  const today   = new Date().toISOString().split('T')[0];
  const records = getAttendance();
  if (records.find(r => r.userId === userId && r.date === today)) return { ok: false, msg: 'Already checked in today.' };
  records.push({ userId, empName, date: today, checkIn: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), checkOut: null, status: 'present' });
  saveAttendance(records);
  return { ok: true };
}
function checkOut(userId) {
  const today   = new Date().toISOString().split('T')[0];
  const records = getAttendance();
  const rec     = records.find(r => r.userId === userId && r.date === today);
  if (rec) rec.checkOut = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  saveAttendance(records);
}
function getAttendanceByDate(date) { return getAttendance().filter(r => r.date === date); }
