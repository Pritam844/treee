/* =============================================
   TREELY – App Logic
   ============================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  updateProfile,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDdotkNKF01Qlrz1HiDCsE4EKSUgBsKfcE",
  authDomain: "my-app-99e48.firebaseapp.com",
  databaseURL: "https://my-app-99e48-default-rtdb.firebaseio.com",
  projectId: "my-app-99e48",
  storageBucket: "my-app-99e48.firebasestorage.app",
  messagingSenderId: "483042724614",
  appId: "1:483042724614:web:0f8af8d6869936d86a6c87"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ═══════════════════════════════════════════
// AUTH SYSTEM
// ═══════════════════════════════════════════
const AUTH = {
  user: null,
  auth: auth,

  loadUser() {
    // Rely on onAuthStateChanged instead
  },

  saveUser(user) {
    // Not needed, Firebase handles sessions
  },

  async logout() {
    this.user = null;
    await signOut(this.auth);
    localStorage.removeItem('treely_state');
    location.reload();
  },

  isLoggedIn() { return !!this.user; },

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    this.user = {
      uid: result.user.uid,
      name: result.user.displayName || 'Google User',
      email: result.user.email,
      avatar: (result.user.displayName || 'G')[0].toUpperCase(),
      provider: 'google'
    };
    return this.user;
  },

  async signInWithEmail(email, password) {
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    this.user = { 
      uid: result.user.uid, 
      name: result.user.displayName || 'User', 
      email: result.user.email, 
      avatar: (result.user.displayName || 'U')[0].toUpperCase(), 
      provider: 'email' 
    };
    return this.user;
  },

  async signUpWithEmail(name, email, password) {
    const result = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(result.user, { displayName: name });
    this.user = { 
      uid: result.user.uid, 
      name: name, 
      email: result.user.email, 
      avatar: name[0].toUpperCase(), 
      provider: 'email' 
    };
    return this.user;
  }
};

// Password strength checker
function checkPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: 'Weak',   color: '#e74c3c', pct: 20 },
    { label: 'Fair',   color: '#e67e22', pct: 40 },
    { label: 'Good',   color: '#f39c12', pct: 60 },
    { label: 'Strong', color: '#2ECC71', pct: 85 },
    { label: 'Great!', color: '#27AE60', pct: 100 },
  ];
  return levels[Math.min(score, 4)];
}

// Auth screen controller
function initAuthScreen() {
  const authScreen     = document.getElementById('auth-screen');
  const loginView      = document.getElementById('auth-login-view');
  const signupView     = document.getElementById('auth-signup-view');

  // Switch views
  document.getElementById('go-to-signup').addEventListener('click', () => {
    loginView.classList.add('hidden');
    signupView.classList.remove('hidden');
    signupView.style.animation = 'none';
    setTimeout(() => { signupView.style.animation = ''; signupView.classList.add('fade-in-up'); }, 10);
  });
  document.getElementById('go-to-login').addEventListener('click', () => {
    signupView.classList.add('hidden');
    loginView.classList.remove('hidden');
    loginView.classList.add('fade-in-up');
  });

  // Password eye toggles
  ['login','signup'].forEach(prefix => {
    const eye = document.getElementById(prefix + '-eye');
    const inp = document.getElementById(prefix + '-password');
    if (!eye || !inp) return;
    eye.addEventListener('click', () => {
      inp.type = inp.type === 'password' ? 'text' : 'password';
      eye.textContent = inp.type === 'password' ? '👁' : '🙈';
    });
  });

  // Password strength live update
  const pwInput = document.getElementById('signup-password');
  pwInput?.addEventListener('input', () => {
    const result = checkPasswordStrength(pwInput.value);
    const fill   = document.getElementById('pw-fill');
    const label  = document.getElementById('pw-label');
    if (fill && label) {
      fill.style.width      = result.pct + '%';
      fill.style.background = result.color;
      label.textContent     = result.label;
      label.style.color     = result.color;
    }
  });

  // Google buttons
  ['auth-google-login', 'auth-google-signup'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', async () => {
      try {
        await AUTH.signInWithGoogle();
        enterApp();
      } catch (err) {
        showAuthError('login-error', err.message);
        showAuthError('signup-error', err.message);
      }
    });
  });

  // Forgot password
  document.getElementById('forgot-password-btn')?.addEventListener('click', () => {
    const email = document.getElementById('login-email').value.trim();
    if (email) {
      showAuthError('login-error', '📧 Reset link sent! (Check your email)');
    } else {
      showAuthError('login-error', 'Enter your email first.');
    }
  });

  // Login form
  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn   = document.getElementById('login-submit-btn');
    const email = document.getElementById('login-email').value.trim();
    const pw    = document.getElementById('login-password').value;
    clearAuthError('login-error');
    btn.classList.add('loading');
    try {
      await AUTH.signInWithEmail(email, pw);
      enterApp();
    } catch(err) {
      let msg = err.message;
      if (err.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
      else if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
      showAuthError('login-error', msg);
      btn.classList.remove('loading');
    }
  });

  // Signup form
  document.getElementById('signup-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn   = document.getElementById('signup-submit-btn');
    const name  = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pw    = document.getElementById('signup-password').value;
    clearAuthError('signup-error');
    btn.classList.add('loading');
    try {
      await AUTH.signUpWithEmail(name, email, pw);
      enterApp();
    } catch(err) {
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') msg = 'Email already in use. Please sign in.';
      else if (err.code === 'auth/weak-password') msg = 'Password is too weak.';
      showAuthError('signup-error', msg);
      btn.classList.remove('loading');
    }
  });
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = '⚠️ ' + msg; el.classList.remove('hidden'); }
}
function clearAuthError(id) {
  const el = document.getElementById(id);
  if (el) { el.textContent = ''; el.classList.add('hidden'); }
}

let isAppStarted = false;
function enterApp() {
  if (isAppStarted) return;
  isAppStarted = true;
  document.getElementById('auth-screen').classList.add('hidden');
  const u = AUTH.user;
  // Set avatar
  const avatarBtn = document.getElementById('user-avatar-btn');
  if (avatarBtn) avatarBtn.querySelector('#user-avatar-char').textContent = u.avatar || u.name[0].toUpperCase();
  document.getElementById('acc-drop-name').textContent  = u.name;
  document.getElementById('acc-drop-email').textContent = u.email;
  // Boot main app
  bootApp();
}

function initAccountDropdown() {
  const btn      = document.getElementById('user-avatar-btn');
  const dropdown = document.getElementById('account-dropdown');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });
  document.addEventListener('click', () => dropdown.classList.add('hidden'));
  dropdown.addEventListener('click', e => e.stopPropagation());

  document.getElementById('acc-drop-logout')?.addEventListener('click', () => {
    if (confirm('Sign out of Treely?')) AUTH.logout();
  });
}


// ── STATE ──────────────────────────────────────
const STATE = {
  tasks: [],
  categories: [],
  history: [],        // past weeks
  currentWeek: 1,
  totalXP: 0,
  weekXP: 0,
  streak: 0,
  lastCompletedDate: null,
  theme: 'light',
  notifDismissed: false,
};

// ── DEFAULT CATEGORIES ─────────────────────────
const DEFAULT_CATEGORIES = [
  { id: 'cat-yt',   name: 'YouTube',   emoji: '🎥', color: '#e74c3c', colorLight: '#fdecea' },
  { id: 'cat-ig',   name: 'Instagram', emoji: '📸', color: '#9b59b6', colorLight: '#f3eafc' },
  { id: 'cat-fit',  name: 'Fitness',   emoji: '💪', color: '#e67e22', colorLight: '#fdebd0' },
  { id: 'cat-study',name: 'Study',     emoji: '📚', color: '#3498db', colorLight: '#eaf4fd' },
  { id: 'cat-sport',name: 'Sports',    emoji: '⚽', color: '#1abc9c', colorLight: '#e8f8f5' },
];

const EMOJI_LIST = ['📂','🎥','📸','💪','📚','⚽','🎵','🎨','🍎','🌿','✈️','💡','🔥','⭐','🎯','🏋️','🧘','📝','💻','🎮','🍕','☕','🌙','🌈','🦁','🐉','🚀','💎','🏆','🎸'];
const COLORS = ['#2ECC71','#e74c3c','#3498db','#9b59b6','#e67e22','#1abc9c','#f39c12','#e91e63','#00bcd4','#ff5722','#607d8b','#795548'];

// ── TREE DEFINITIONS ───────────────────────────
const TREE_TYPES = [
  { name:'Sprouting Oak',   type:'🌿 Nature',  color:'#2ECC71', variant:'oak' },
  { name:'Cherry Blossom',  type:'🌸 Flower',  color:'#e91e63', variant:'flower' },
  { name:'Apple Tree',      type:'🍎 Fruit',   color:'#e74c3c', variant:'fruit' },
  { name:'Golden Maple',    type:'✨ Rare',    color:'#f39c12', variant:'maple' },
  { name:'Weeping Willow',  type:'🌿 Nature',  color:'#27AE60', variant:'willow' },
  { name:'Mango Grove',     type:'🥭 Fruit',   color:'#ff9800', variant:'mango' },
  { name:'Blue Lotus',      type:'🌸 Flower',  color:'#2196f3', variant:'lotus' },
  { name:'Crystal Pine',    type:'✨ Rare',    color:'#00bcd4', variant:'pine' },
  { name:'Autumn Birch',    type:'🌿 Nature',  color:'#8d6e63', variant:'birch' },
  { name:'Dragon Flame',    type:'✨ Rare',    color:'#ff5722', variant:'dragon' },
];

const GROWTH_STAGES = [
  { label:'Seed',     icon:'🌱', xp:0   },
  { label:'Sprout',   icon:'🌿', xp:30  },
  { label:'Sapling',  icon:'🪴', xp:80  },
  { label:'Young',    icon:'🌲', xp:150 },
  { label:'Mature',   icon:'🌳', xp:250 },
  { label:'Ancient',  icon:'🏔️', xp:400 },
];

// ── STORAGE ────────────────────────────────────
function save() {
  localStorage.setItem('treely_state', JSON.stringify(STATE));
  syncWithFirebase();
}

async function syncWithFirebase() {
  if (AUTH.user && navigator.onLine) {
    try {
      await set(ref(db, 'users/' + AUTH.user.uid + '/state'), STATE);
      console.log('✅ Synced with Firebase');
    } catch(e) { 
      console.warn('❌ Sync failed, will retry when online', e); 
    }
  }
}

// Auto-sync when coming back online
window.addEventListener('online', () => {
  console.log('🌐 Back online! Syncing data...');
  syncWithFirebase();
});

async function load() {
  const raw = localStorage.getItem('treely_state');
  if (raw) {
    try {
      const saved = JSON.parse(raw);
      Object.assign(STATE, saved);
    } catch(e) { console.warn('State load error', e); }
  }
  
  // Fetch from Firebase and overly on top
  if (AUTH.user) {
    try {
      const snapshot = await get(child(ref(db), 'users/' + AUTH.user.uid + '/state'));
      if (snapshot.exists()) {
        const remoteState = snapshot.val();
        remoteState.tasks = remoteState.tasks || [];
        remoteState.categories = remoteState.categories || [];
        remoteState.history = remoteState.history || [];
        Object.assign(STATE, remoteState);
        localStorage.setItem('treely_state', JSON.stringify(STATE));
      }
    } catch(e) { console.warn('Firebase state load error', e); }
  }

  // Ensure defaults
  if (!STATE.categories || !STATE.categories.length) {
    STATE.categories = DEFAULT_CATEGORIES.map(c => ({...c}));
  }
  if (!STATE.tasks) STATE.tasks = [];
  if (!STATE.history) STATE.history = [];
}

// ── TREE CANVAS RENDERER ───────────────────────
function getStageIndex(xp) {
  let idx = 0;
  for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
    if (xp >= GROWTH_STAGES[i].xp) { idx = i; break; }
  }
  return idx;
}

function getGrowthPercent(xp) {
  const si = getStageIndex(xp);
  const cur = GROWTH_STAGES[si].xp;
  const next = GROWTH_STAGES[si + 1] ? GROWTH_STAGES[si + 1].xp : cur + 200;
  return Math.round(((xp - cur) / (next - cur)) * 100);
}

function drawTree(canvas, variant, xp, color) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const stage = getStageIndex(xp);   // 0-5
  const t = stage / 5;               // 0 = seed, 1 = ancient

  // Ground
  ctx.fillStyle = 'rgba(46,204,113,0.08)';
  ctx.beginPath();
  ctx.ellipse(W/2, H - 10, W * 0.38, 10, 0, 0, Math.PI*2);
  ctx.fill();

  const theme = document.documentElement.getAttribute('data-theme');
  const dark = theme === 'dark';

  if (stage === 0) {
    // Seed / tiny sprout
    _drawSeed(ctx, W, H, color);
    return;
  }

  // trunk
  const trunkH = 20 + t * (H * 0.42);
  const trunkW = 4 + t * 14;
  const trunkX = W / 2;
  const trunkTop = H - 18 - trunkH;

  ctx.save();
  const gradient = ctx.createLinearGradient(trunkX - trunkW, 0, trunkX + trunkW, 0);
  gradient.addColorStop(0, '#5d4037');
  gradient.addColorStop(0.5, '#8d6e63');
  gradient.addColorStop(1, '#5d4037');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(trunkX - trunkW/2, H - 16);
  ctx.lineTo(trunkX - trunkW * 0.3, trunkTop);
  ctx.lineTo(trunkX + trunkW * 0.3, trunkTop);
  ctx.lineTo(trunkX + trunkW/2, H - 16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Foliage based on variant
  switch(variant) {
    case 'flower': _drawFlowerTree(ctx, W, H, trunkX, trunkTop, t, color); break;
    case 'fruit':  _drawFruitTree(ctx, W, H, trunkX, trunkTop, t, color); break;
    case 'maple':  _drawMapleTree(ctx, W, H, trunkX, trunkTop, t, color); break;
    case 'willow': _drawWillowTree(ctx, W, H, trunkX, trunkTop, t, color); break;
    case 'pine':   _drawPineTree(ctx, W, H, trunkX, trunkTop, t, color); break;
    case 'dragon': _drawDragonTree(ctx, W, H, trunkX, trunkTop, t, color); break;
    default:       _drawOakTree(ctx, W, H, trunkX, trunkTop, t, color); break;
  }
}

function _drawSeed(ctx, W, H, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(W/2, H - 20, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#27AE60';
  ctx.beginPath();
  ctx.moveTo(W/2, H - 30);
  ctx.bezierCurveTo(W/2 + 10, H - 38, W/2 + 16, H - 26, W/2, H - 26);
  ctx.fill();
}

function _drawOakTree(ctx, W, H, cx, top, t, color) {
  const r = 20 + t * 50;
  const layers = [
    { x: cx, y: top + 10, r: r * 0.85 },
    { x: cx - r * 0.45, y: top + r * 0.35, r: r * 0.7 },
    { x: cx + r * 0.45, y: top + r * 0.35, r: r * 0.7 },
    { x: cx, y: top - r * 0.1, r: r * 0.75 },
  ];
  layers.forEach(l => {
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r, 0, Math.PI*2);
    ctx.fillStyle = shadeColor(color, -15);
    ctx.fill();
  });
  layers.forEach(l => {
    ctx.beginPath();
    ctx.arc(l.x - 4, l.y - 4, l.r * 0.85, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
  });
}

function _drawFlowerTree(ctx, W, H, cx, top, t, color) {
  const r = 18 + t * 45;
  // Base green
  ctx.beginPath();
  ctx.arc(cx, top + 8, r * 0.9, 0, Math.PI*2);
  ctx.fillStyle = '#27AE60';
  ctx.fill();
  // Flowers
  const petals = Math.floor(4 + t * 20);
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2;
    const px = cx + Math.cos(angle) * r * 0.7;
    const py = top + 8 + Math.sin(angle) * r * 0.7;
    ctx.beginPath();
    ctx.arc(px, py, r * 0.22, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, top + 8, r * 0.3, 0, Math.PI*2);
  ctx.fillStyle = '#fff176';
  ctx.fill();
}

function _drawFruitTree(ctx, W, H, cx, top, t, color) {
  const r = 18 + t * 44;
  ctx.beginPath();
  ctx.arc(cx, top + 8, r, 0, Math.PI*2);
  ctx.fillStyle = shadeColor('#2ECC71', -10);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - 5, top + 4, r * 0.85, 0, Math.PI*2);
  ctx.fillStyle = '#2ECC71';
  ctx.fill();
  // Fruits
  const fruits = Math.floor(2 + t * 12);
  for (let i = 0; i < fruits; i++) {
    const angle = (i / fruits) * Math.PI * 2;
    const fx = cx + Math.cos(angle) * r * 0.65;
    const fy = top + 8 + Math.sin(angle) * r * 0.65;
    ctx.beginPath();
    ctx.arc(fx, fy, 4 + t * 4, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(fx - 1, fy - 1, 2, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();
  }
}

function _drawMapleTree(ctx, W, H, cx, top, t, color) {
  const r = 22 + t * 46;
  const pts = 5;
  for (let p = 0; p < pts; p++) {
    const a = (p / pts) * Math.PI * 2 - Math.PI/2;
    const lx = cx + Math.cos(a) * r * 0.5;
    const ly = top + 8 + Math.sin(a) * r * 0.5;
    ctx.beginPath();
    ctx.arc(lx, ly, r * 0.55, 0, Math.PI*2);
    ctx.fillStyle = shadeColor(color, p % 2 === 0 ? -10 : 10);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, top, r * 0.55, 0, Math.PI*2);
  ctx.fillStyle = color;
  ctx.fill();
}

function _drawWillowTree(ctx, W, H, cx, top, t, color) {
  const r = 18 + t * 40;
  ctx.beginPath();
  ctx.arc(cx, top, r, 0, Math.PI*2);
  ctx.fillStyle = color;
  ctx.fill();
  // Drooping branches
  const branches = Math.floor(5 + t * 10);
  for (let i = 0; i < branches; i++) {
    const bx = cx + (i - branches/2) * (r * 0.18);
    ctx.beginPath();
    ctx.moveTo(bx, top + r * 0.4);
    ctx.bezierCurveTo(bx - 10, top + r * 0.7, bx + 5, H - 20, bx, H - 16);
    ctx.strokeStyle = shadeColor(color, -20);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function _drawPineTree(ctx, W, H, cx, top, t, color) {
  const layers = 3 + Math.floor(t * 3);
  for (let i = 0; i < layers; i++) {
    const lw = (8 + t * 50) * (0.4 + (i / layers) * 0.8);
    const ly = top + (i / layers) * (H - 30 - top) * 0.8;
    ctx.beginPath();
    ctx.moveTo(cx, ly - (6 + t * 20) * (1 - i / layers));
    ctx.lineTo(cx + lw, ly + 10);
    ctx.lineTo(cx - lw, ly + 10);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? color : shadeColor(color, -15);
    ctx.fill();
  }
}

function _drawDragonTree(ctx, W, H, cx, top, t, color) {
  const r = 22 + t * 46;
  // Glowing aura
  const grd = ctx.createRadialGradient(cx, top, 0, cx, top, r * 1.2);
  grd.addColorStop(0, color + 'cc');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, top, r * 1.2, 0, Math.PI*2);
  ctx.fill();
  // Main canopy
  ctx.beginPath();
  ctx.arc(cx, top, r, 0, Math.PI*2);
  ctx.fillStyle = color;
  ctx.fill();
  // Spikes
  const spikes = 8;
  for (let i = 0; i < spikes; i++) {
    const a = (i / spikes) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r, top + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a + 0.15) * (r * 1.35), top + Math.sin(a + 0.15) * (r * 1.35));
    ctx.lineTo(cx + Math.cos(a - 0.15) * (r * 1.35), top + Math.sin(a - 0.15) * (r * 1.35));
    ctx.closePath();
    ctx.fillStyle = shadeColor(color, 20);
    ctx.fill();
  }
}

function shadeColor(hex, pct) {
  const num = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + pct));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + pct));
  const b = Math.min(255, Math.max(0, (num & 0xff) + pct));
  return `rgb(${r},${g},${b})`;
}

// Haptic feedback helper
function vibrate(pattern = 10) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
}

// ── HELPERS ────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function todayTasks() {
  const dow = new Date().getDay();
  return STATE.tasks.filter(t => t.days && t.days.includes(dow));
}

function getCat(id) { return STATE.categories.find(c => c.id === id); }

function greetingText() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning! 🌞';
  if (h < 17) return 'Good Afternoon! ☀️';
  if (h < 21) return 'Good Evening! 🌆';
  return 'Good Night! 🌙';
}

function currentTreeDef() {
  return TREE_TYPES[(STATE.currentWeek - 1) % TREE_TYPES.length];
}

// ── NOTIFICATIONS ───────────────────────────────
function requestNotifPermission() {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(p => {
    if (p === 'granted') scheduleReminders();
    document.getElementById('notif-bar').classList.add('hidden');
  });
}

function scheduleReminders() {
  const tasks = todayTasks().filter(t => t.time && !t.completedOn?.includes(todayKey()));
  tasks.forEach(task => {
    const [hh, mm] = task.time.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hh, mm, 0, 0);
    const diff = target - now;
    if (diff > 0 && diff < 24 * 3600 * 1000) {
      setTimeout(() => {
        new Notification('🌳 Treely Reminder', {
          body: `Time for: ${task.name}`,
          icon: 'https://cdn.jsdelivr.net/emojione/assets/svg/1f333.svg'
        });
      }, diff);
    }
  });
}

// ── XP & STREAK ────────────────────────────────
function addXP(amount) {
  STATE.totalXP += amount;
  STATE.weekXP  += amount;
  updateStreak();
  save();
}

function updateStreak() {
  const today = todayKey();
  if (STATE.lastCompletedDate === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yk = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`;
  if (STATE.lastCompletedDate === yk) {
    STATE.streak++;
  } else if (STATE.lastCompletedDate !== today) {
    STATE.streak = 1;
  }
  STATE.lastCompletedDate = today;
}

// Check if week rolled over
function checkWeekRollover() {
  const weekStart = STATE.weekStartDate;
  if (!weekStart) { STATE.weekStartDate = todayKey(); save(); return; }
  const start = new Date(weekStart);
  const now = new Date();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  if (diffDays >= 7) {
    // Archive current week
    const treeDef = currentTreeDef();
    STATE.history.push({
      week: STATE.currentWeek,
      treeName: treeDef.name,
      treeType: treeDef.type,
      treeVariant: treeDef.variant,
      treeColor: treeDef.color,
      xp: STATE.weekXP,
      tasksCompleted: STATE.tasks.filter(t => (t.completedOn || []).some(d => {
        const dd = new Date(d); const ss = new Date(weekStart);
        return dd >= ss && dd < now;
      })).length,
      growth: getGrowthPercent(STATE.weekXP),
    });
    STATE.currentWeek++;
    STATE.weekXP = 0;
    STATE.weekStartDate = todayKey();
    save();
  }
}

// ── CONFETTI ────────────────────────────────────
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#2ECC71','#27AE60','#f39c12','#e74c3c','#3498db','#9b59b6','#fff'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-particle';
    el.style.cssText = `
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-delay:${Math.random()*0.5}s;
      animation-duration:${1 + Math.random()}s;
      width:${6+Math.random()*8}px;
      height:${6+Math.random()*8}px;
      border-radius:${Math.random()>0.5?'50%':'3px'};
    `;
    container.appendChild(el);
  }
}

function showXPCelebration(xp) {
  const el = document.getElementById('xp-celebration');
  document.getElementById('xp-burst-amount').textContent = `+${xp} XP`;
  el.classList.remove('hidden');
  launchConfetti();
  vibrate([40, 30, 60]); // Festive vibration
  setTimeout(() => el.classList.add('hidden'), 2200);
}

// ── RENDER HELPERS ─────────────────────────────
function renderTree(canvasId, variant, xp, color) {
  const canvas = document.getElementById(canvasId);
  if (canvas) drawTree(canvas, variant, xp, color);
}

function updateHomeStats() {
  const tasks = todayTasks();
  const done  = tasks.filter(t => (t.completedOn || []).includes(todayKey()));
  const pct   = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;
  const xpEarned = done.reduce((s, t) => s + (t.xp || 20), 0);

  document.getElementById('dp-bar-fill').style.width = pct + '%';
  document.getElementById('dp-bar-label').textContent = pct + '%';
  document.getElementById('dp-fraction').textContent = `${done.length}/${tasks.length} tasks`;
  document.getElementById('dp-done').textContent    = done.length;
  document.getElementById('dp-pending').textContent = tasks.length - done.length;
  document.getElementById('dp-xp-earned').textContent = xpEarned;

  const tree = currentTreeDef();
  const gPct = Math.min(100, getGrowthPercent(STATE.weekXP));
  document.getElementById('hero-tree-percent').textContent = gPct + '%';
  document.getElementById('hero-tree-fill').style.width    = gPct + '%';
  document.getElementById('hero-tree-name').textContent    = tree.name;
  document.getElementById('hero-tree-type').textContent    = tree.type;
  document.getElementById('hero-tree-week').textContent    = `Week ${STATE.currentWeek}`;
  renderTree('hero-tree-canvas', tree.variant, STATE.weekXP, tree.color);

  document.getElementById('streak-count').textContent = STATE.streak;
  document.getElementById('total-xp').textContent     = STATE.totalXP;
  document.getElementById('greeting-text').textContent = greetingText();
  document.getElementById('date-text').textContent     = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' });
}

function renderTodayTasks() {
  const list = document.getElementById('today-tasks-list');
  const empty = document.getElementById('empty-tasks');
  const tasks = todayTasks();

  if (!tasks.length) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  const today = todayKey();
  list.innerHTML = tasks.map(task => {
    const cat   = getCat(task.category) || { color:'#2ECC71', colorLight:'#d4f5e4', name:'', emoji:'📌' };
    const done  = (task.completedOn || []).includes(today);
    return `
      <div class="task-item ${done ? 'completed' : ''} fade-in-up"
           style="--cat-color:${cat.color};--cat-color-light:${cat.colorLight}"
           data-id="${task.id}" id="task-item-${task.id}">
        <button class="task-check" data-complete="${task.id}" aria-label="Complete">${done ? '✓' : ''}</button>
        <div class="task-content">
          <div class="task-name">${task.name}</div>
          <div class="task-meta">
            <span class="task-cat-chip">${cat.emoji} ${cat.name}</span>
            ${task.time ? `<span class="task-time">⏰ ${task.time}</span>` : ''}
          </div>
          ${task.note ? `<div class="task-note">${task.note}</div>` : ''}
        </div>
        <span class="task-xp">+${task.xp} XP</span>
      </div>`;
  }).join('');
}

function renderCategoriesPage() {
  const grid = document.getElementById('categories-grid');
  if (!grid) return;

  const catSections = STATE.categories.map(cat => {
    const catTasks = STATE.tasks.filter(t => t.category === cat.id);
    const todayDone = catTasks.filter(t => (t.completedOn||[]).includes(todayKey())).length;
    return `
      <div class="cat-section" id="catsec-${cat.id}">
        <div class="cat-section-header" data-toggle="${cat.id}">
          <span class="cat-section-emoji">${cat.emoji}</span>
          <div class="cat-section-info">
            <div class="cat-section-name" style="color:${cat.color}">${cat.name}</div>
            <div class="cat-section-sub">${catTasks.length} tasks · ${todayDone} done today</div>
          </div>
          <span class="cat-section-chevron">▾</span>
        </div>
        <div class="cat-section-body">
          ${catTasks.map(t => {
            const done = (t.completedOn||[]).includes(todayKey());
            return `<div class="task-item ${done?'completed':''}" style="--cat-color:${cat.color};--cat-color-light:${cat.colorLight||'#e8f5e9'}" data-id="${t.id}">
              <button class="task-check" data-complete="${t.id}">${done?'✓':''}</button>
              <div class="task-content">
                <div class="task-name">${t.name}</div>
                <div class="task-meta">
                  ${t.time?`<span class="task-time">⏰ ${t.time}</span>`:''}
                  <span class="task-xp">+${t.xp} XP</span>
                </div>
              </div>
            </div>`;
          }).join('')}
          <button class="cat-add-task-btn" data-addcat="${cat.id}">＋ Add task to ${cat.name}</button>
        </div>
      </div>`;
  }).join('');

  grid.innerHTML = catSections + `
    <div style="grid-column:1/-1">
      <button class="add-cat-card" id="add-cat-inline-btn" style="width:100%">
        <span>＋</span><span>New Category</span>
      </button>
    </div>`;

  // Bind toggle
  grid.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.toggle;
      const sec = document.getElementById('catsec-' + id);
      sec.classList.toggle('collapsed');
    });
  });

  grid.querySelectorAll('[data-addcat]').forEach(btn => {
    btn.addEventListener('click', () => openAddTask(btn.dataset.addcat));
  });

  document.getElementById('add-cat-inline-btn')?.addEventListener('click', openAddCategory);
}

function renderTreePage() {
  const tree = currentTreeDef();
  const gPct = Math.min(100, getGrowthPercent(STATE.weekXP));
  const si   = getStageIndex(STATE.weekXP);

  document.getElementById('tdc-name').textContent    = tree.name;
  document.getElementById('tdc-type').textContent    = tree.type;
  document.getElementById('tdc-percent').textContent = gPct + '%';
  document.getElementById('tdc-fill').style.width    = gPct + '%';
  document.getElementById('tdc-xp').textContent      = STATE.weekXP;
  document.getElementById('tdc-tasks-done').textContent = STATE.tasks.filter(t => (t.completedOn||[]).some(Boolean)).length;
  document.getElementById('tdc-days').textContent    = STATE.currentWeek;
  document.getElementById('tree-page-week').textContent = `Week ${STATE.currentWeek}`;

  renderTree('tree-canvas-showcase', tree.variant, STATE.weekXP, tree.color);

  // Growth stages
  const stagesRow = document.getElementById('stages-row');
  stagesRow.innerHTML = GROWTH_STAGES.map((s, i) => `
    <div class="stage-chip ${i < si ? 'reached' : ''} ${i === si ? 'current' : ''}">
      <span class="stage-icon">${s.icon}</span>
      <span class="stage-label">${s.label}</span>
      <span class="stage-xp">${s.xp} XP</span>
    </div>`).join('');
}

function renderHistoryPage() {
  const history = STATE.history;
  document.getElementById('hs-total-weeks').textContent = history.length;
  document.getElementById('hs-total-tasks').textContent = history.reduce((s,w) => s + (w.tasksCompleted||0), 0);
  document.getElementById('hs-total-xp').textContent    = history.reduce((s,w) => s + (w.xp||0), 0);

  // Tree collection
  const cGrid = document.getElementById('tree-collection-grid');
  if (!history.length) {
    cGrid.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;grid-column:1/-1;text-align:center;padding:1.5rem 0">Complete a week to grow your first tree! 🌱</p>';
  } else {
    cGrid.innerHTML = history.map(w => `
      <div class="collection-tree-card">
        <div class="collection-tree-canvas">
          <span style="font-size:2.5rem">${TREE_TYPES[(w.week-1)%TREE_TYPES.length]?.type?.split(' ')[0]||'🌳'}</span>
        </div>
        <div class="collection-tree-name">${w.treeName}</div>
        <div class="collection-tree-week">Week ${w.week}</div>
        <div class="collection-tree-growth">${w.growth}% grown</div>
      </div>`).join('');
  }

  // Weekly stats
  const wList = document.getElementById('weekly-stats-list');
  const allWeeks = [...history, {
    week: STATE.currentWeek,
    treeName: currentTreeDef().name,
    treeType: currentTreeDef().type,
    xp: STATE.weekXP,
    tasksCompleted: STATE.tasks.filter(t=>(t.completedOn||[]).includes(todayKey())).length,
    growth: getGrowthPercent(STATE.weekXP),
    current: true
  }].reverse();

  wList.innerHTML = allWeeks.map(w => `
    <div class="weekly-stat-card">
      <div class="ws-left">
        <div class="ws-week">WK ${w.week}</div>
        <div class="ws-icon">${w.current ? '🌱' : '🌳'}</div>
      </div>
      <div class="ws-right">
        <div class="ws-name">${w.treeName} ${w.current ? '<span style="font-size:0.65rem;background:var(--green-light);color:var(--green-accent);padding:1px 6px;border-radius:20px">CURRENT</span>' : ''}</div>
        <div class="ws-sub">${w.tasksCompleted} tasks · ${w.xp} XP earned</div>
        <div class="ws-bar"><div class="ws-bar-fill" style="width:${w.growth}%"></div></div>
      </div>
      <div class="ws-right-end">${w.growth}%</div>
    </div>`).join('');
}

function renderStatsPage() {
  const tasks = STATE.tasks;
  const today = todayKey();
  const allDone = tasks.filter(t => (t.completedOn||[]).length > 0);
  const todayT  = todayTasks();
  const todayD  = todayT.filter(t => (t.completedOn||[]).includes(today));
  const rate    = todayT.length ? Math.round((todayD.length/todayT.length)*100) : 0;

  document.getElementById('stat-completion-val').textContent = rate + '%';
  document.getElementById('stat-streak-val').textContent     = STATE.streak;
  document.getElementById('stat-trees-val').textContent      = STATE.history.length;
  document.getElementById('stat-completion-val').textContent = rate + '%';

  // Category bars
  const catChart = document.getElementById('category-chart');
  const maxCount = Math.max(1, ...STATE.categories.map(c => tasks.filter(t => t.category===c.id && (t.completedOn||[]).length>0).length));
  catChart.innerHTML = STATE.categories.map(cat => {
    const count = tasks.filter(t => t.category === cat.id && (t.completedOn||[]).length > 0).length;
    return `<div class="cat-bar-row">
      <span class="cat-bar-label">${cat.emoji} ${cat.name}</span>
      <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(count/maxCount)*100}%;background:${cat.color}"></div></div>
      <span class="cat-bar-count">${count}</span>
    </div>`;
  }).join('');

  // 7-day chart
  drawWeekChart();

  // Heatmap
  renderHeatmap();
}

function drawWeekChart() {
  const canvas = document.getElementById('week-chart-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 340, H = 180;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    const label = d.toLocaleDateString('en', { weekday:'short' });
    const count = STATE.tasks.filter(t => (t.completedOn||[]).includes(key)).length;
    days.push({ label, count });
  }

  const maxCount = Math.max(1, ...days.map(d => d.count));
  const pad = 30, barW = (W - pad * 2) / days.length;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#7fbf9a' : '#6b8c78';
  const barColor  = '#2ECC71';

  days.forEach((d, i) => {
    const bh = ((d.count / maxCount) * (H - pad - 30));
    const x  = pad + i * barW + barW * 0.1;
    const bx = x, by = H - pad - bh, bwi = barW * 0.8;

    // bar shadow
    ctx.fillStyle = 'rgba(46,204,113,0.08)';
    ctx.beginPath();
    ctx.roundRect?.(bx, H - pad - (H - pad - 30), bwi, H - pad - 30, 6) || ctx.rect(bx, H - pad - (H - pad - 30), bwi, H - pad - 30);
    ctx.fill();

    // bar fill
    const grad = ctx.createLinearGradient(0, by, 0, H - pad);
    grad.addColorStop(0, '#27AE60');
    grad.addColorStop(1, barColor + '88');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect?.(bx, by, bwi, bh, [6, 6, 0, 0]) || ctx.rect(bx, by, bwi, bh);
    ctx.fill();

    // label
    ctx.fillStyle = textColor;
    ctx.font = '11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.label, bx + bwi/2, H - 10);

    if (d.count > 0) {
      ctx.fillStyle = '#27AE60';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.fillText(d.count, bx + bwi/2, by - 5);
    }
  });
}

function renderHeatmap() {
  const wrap = document.getElementById('heatmap-wrap');
  const categories = STATE.categories.slice(0, 5);
  const today = new Date();

  wrap.innerHTML = categories.map(cat => {
    const cells = Array.from({length: 7}, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - (6 - i));
      const key = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
      const count = STATE.tasks.filter(t => t.category === cat.id && (t.completedOn||[]).includes(key)).length;
      const cls = count === 0 ? '' : count === 1 ? 'h1' : count === 2 ? 'h2' : count <= 3 ? 'h3' : 'h4';
      return `<div class="heatmap-cell ${cls}" title="${cat.name}: ${count} on ${key}" style="${count>0?`background:${cat.color}${count>=4?'':'66'}`:''}"></div>`;
    }).join('');
    return `<div class="heatmap-row"><span class="heatmap-label">${cat.emoji}</span><div class="heatmap-cells">${cells}</div></div>`;
  }).join('');
}

// ── COMPLETE TASK ───────────────────────────────
let lastLevelUpStage = -1;

function completeTask(taskId) {
  const task = STATE.tasks.find(t => t.id === taskId);
  if (!task) return;
  const today = todayKey();
  if (!task.completedOn) task.completedOn = [];
  const alreadyDone = task.completedOn.includes(today);

  if (alreadyDone) {
    // Undo
    task.completedOn = task.completedOn.filter(d => d !== today);
    STATE.totalXP = Math.max(0, STATE.totalXP - task.xp);
    STATE.weekXP  = Math.max(0, STATE.weekXP  - task.xp);
    vibrate(30); // Single medium vibration for undo
  } else {
    task.completedOn.push(today);
    addXP(task.xp);
    showXPCelebration(task.xp);
    vibrate([40, 20, 40]); // Double tap vibration for success

    // Check level up
    const newStage = getStageIndex(STATE.weekXP);
    if (newStage > lastLevelUpStage && lastLevelUpStage >= 0) {
      setTimeout(() => showLevelUp(newStage), 1200);
      vibrate([100, 50, 100, 50, 200]); // Long festive vibration for level up
    }
    lastLevelUpStage = newStage;
  }

  save();
  renderTodayTasks();
  renderCategoriesPage();
  updateHomeStats();
  if (document.getElementById('page-tree').classList.contains('active')) renderTreePage();
}

function showLevelUp(stage) {
  const s = GROWTH_STAGES[stage];
  document.getElementById('level-up-msg').textContent = `Your tree reached ${s.icon} ${s.label} stage!`;
  document.getElementById('level-up-overlay').classList.remove('hidden');
}

// ── NAVIGATION ──────────────────────────────────
function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  const btn = document.querySelector(`.nav-btn[data-page="${pageId}"]`);
  if (btn) btn.classList.add('active');
  
  vibrate(8); // Subtle click for navigation

  // Render page specific content
  if (pageId === 'home')       { renderTodayTasks(); updateHomeStats(); }
  if (pageId === 'categories') renderCategoriesPage();
  if (pageId === 'tree')       renderTreePage();
  if (pageId === 'history')    renderHistoryPage();
  if (pageId === 'stats')      renderStatsPage();
}

// ── MODAL HELPERS ───────────────────────────────
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

let _currentEditTaskId = null;

function openAddTask(preselectedCat = '') {
  _currentEditTaskId = null;
  document.getElementById('modal-task-title').textContent = 'Add Task';
  document.getElementById('task-form').reset();
  document.getElementById('task-edit-id').value = '';
  document.getElementById('task-save-btn').textContent = 'Save Task 🌱';
  // Populate category dropdown
  const sel = document.getElementById('task-category-select');
  sel.innerHTML = '<option value="">Select category…</option>' +
    STATE.categories.map(c => `<option value="${c.id}" ${c.id===preselectedCat?'selected':''}>${c.emoji} ${c.name}</option>`).join('');
  // Reset day buttons
  document.querySelectorAll('.day-btn').forEach(b => b.classList.add('active'));
  openModal('modal-add-task');
}

function openEditTask(taskId) {
  const task = STATE.tasks.find(t => t.id === taskId);
  if (!task) return;
  _currentEditTaskId = taskId;
  document.getElementById('modal-task-title').textContent = 'Edit Task';
  document.getElementById('task-edit-id').value = taskId;
  document.getElementById('task-name-input').value = task.name;
  document.getElementById('task-time-input').value = task.time || '';
  document.getElementById('task-note-input').value = task.note || '';
  document.getElementById('task-xp-input').value   = task.xp  || 20;

  const sel = document.getElementById('task-category-select');
  sel.innerHTML = '<option value="">Select category…</option>' +
    STATE.categories.map(c => `<option value="${c.id}" ${c.id===task.category?'selected':''}>${c.emoji} ${c.name}</option>`).join('');

  document.querySelectorAll('.day-btn').forEach(b => {
    const d = parseInt(b.dataset.day);
    b.classList.toggle('active', (task.days||[]).includes(d));
  });
  document.getElementById('task-save-btn').textContent = 'Update Task ✏️';
  closeModal('modal-task-detail');
  openModal('modal-add-task');
}

function openAddCategory() {
  document.getElementById('category-form').reset();
  document.getElementById('cat-edit-id').value = '';
  document.getElementById('selected-cat-emoji').textContent = '📂';
  document.querySelectorAll('.emoji-opt').forEach(e => e.classList.remove('selected'));
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  document.querySelector('.color-swatch')?.classList.add('selected');
  openModal('modal-add-category');
}

function openTaskDetail(taskId) {
  const task = STATE.tasks.find(t => t.id === taskId);
  if (!task) return;
  const cat     = getCat(task.category);
  const today   = todayKey();
  const isDone  = (task.completedOn||[]).includes(today);
  const body    = document.getElementById('task-detail-body');
  body.innerHTML = `
    <div class="task-detail-card">
      <div class="td-row"><span class="td-name">${task.name}</span></div>
      <div class="td-badges">
        ${cat ? `<span class="td-badge">${cat.emoji} ${cat.name}</span>` : ''}
        ${task.time ? `<span class="td-badge">⏰ ${task.time}</span>` : ''}
        <span class="td-badge">⚡ +${task.xp} XP</span>
        <span class="td-badge">${isDone ? '✅ Done Today' : '⏳ Pending'}</span>
      </div>
      ${task.note ? `<div class="td-field">📝 ${task.note}</div>` : ''}
      <div class="td-field">🗓 Repeats: ${(task.days||[]).map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}</div>
      <div class="td-field">✅ Completed ${(task.completedOn||[]).length} time(s) total</div>
    </div>`;

  document.getElementById('detail-done-btn').textContent = isDone ? '↩ Mark Undone' : '✅ Mark Done';
  document.getElementById('detail-done-btn').onclick = () => { completeTask(taskId); closeModal('modal-task-detail'); };
  document.getElementById('detail-edit-btn').onclick = () => openEditTask(taskId);
  document.getElementById('detail-delete-btn').onclick = () => {
    if (confirm(`Delete "${task.name}"?`)) {
      STATE.tasks = STATE.tasks.filter(t => t.id !== taskId);
      save(); closeModal('modal-task-detail');
      renderTodayTasks(); renderCategoriesPage();
    }
  };
  openModal('modal-task-detail');
}

// ── FORM SUBMISSIONS ────────────────────────────
function initForms() {
  // Task form
  document.getElementById('task-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('task-name-input').value.trim();
    const cat  = document.getElementById('task-category-select').value;
    const time = document.getElementById('task-time-input').value;
    const xp   = parseInt(document.getElementById('task-xp-input').value) || 20;
    const note = document.getElementById('task-note-input').value.trim();
    const days = [...document.querySelectorAll('.day-btn.active')].map(b => parseInt(b.dataset.day));
    if (!name) return;

    const editId = document.getElementById('task-edit-id').value;
    if (editId) {
      const task = STATE.tasks.find(t => t.id === editId);
      if (task) Object.assign(task, { name, category:cat, time, xp, note, days });
    } else {
      STATE.tasks.push({ id: uid(), name, category:cat, time, xp, note, days, completedOn:[] });
    }
    save();
    closeModal('modal-add-task');
    renderTodayTasks(); renderCategoriesPage(); updateHomeStats();
    if ('Notification' in window && Notification.permission === 'granted') scheduleReminders();
  });

  // Day buttons
  document.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.classList.toggle('active'));
  });

  // Category form
  document.getElementById('category-form').addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('cat-name-input').value.trim();
    const emoji = document.getElementById('selected-cat-emoji').textContent;
    const color = document.querySelector('.color-swatch.selected')?.dataset.color || '#2ECC71';
    const colorLight = color + '22';
    if (!name) return;
    STATE.categories.push({ id: 'cat-' + uid(), name, emoji, color, colorLight });
    save();
    closeModal('modal-add-category');
    renderCategoriesPage();
  });

  // Emoji grid
  const emojiGrid = document.getElementById('emoji-grid');
  EMOJI_LIST.forEach(em => {
    const el = document.createElement('div');
    el.className = 'emoji-opt';
    el.textContent = em;
    el.addEventListener('click', () => {
      document.querySelectorAll('.emoji-opt').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      document.getElementById('selected-cat-emoji').textContent = em;
    });
    emojiGrid.appendChild(el);
  });

  // Color swatches
  const row = document.getElementById('color-picker-row');
  COLORS.forEach((c, i) => {
    const sw = document.createElement('div');
    sw.className = 'color-swatch' + (i === 0 ? ' selected' : '');
    sw.style.background = c;
    sw.dataset.color = c;
    sw.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
    });
    row.appendChild(sw);
  });
}

// ── MAIN EVENT BINDINGS ─────────────────────────
function initEvents() {
  // Nav
  document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.page) navigateTo(btn.dataset.page);
    });
  });

  // FAB → add task
  document.getElementById('quick-add-btn').addEventListener('click', () => openAddTask());
  document.getElementById('empty-add-btn')?.addEventListener('click', () => openAddTask());
  document.getElementById('add-category-btn')?.addEventListener('click', openAddCategory);

  // Modal closes
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modal));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
  });

  // Task complete & detail
  document.addEventListener('click', e => {
    const completeBtn = e.target.closest('[data-complete]');
    if (completeBtn) { e.stopPropagation(); completeTask(completeBtn.dataset.complete); return; }

    const taskItem = e.target.closest('.task-item[data-id]');
    if (taskItem && !e.target.closest('[data-complete]')) openTaskDetail(taskItem.dataset.id);
  });

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    STATE.theme = STATE.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', STATE.theme);
    document.querySelector('.theme-icon').textContent = STATE.theme === 'dark' ? '☀️' : '🌙';
    save();
    if (document.getElementById('page-stats').classList.contains('active')) renderStatsPage();
  });

  // Notification bar
  document.getElementById('notif-enable-btn').addEventListener('click', requestNotifPermission);
  document.getElementById('notif-dismiss-btn').addEventListener('click', () => {
    document.getElementById('notif-bar').classList.add('hidden');
    STATE.notifDismissed = true; save();
  });

  // Level up close
  document.getElementById('level-up-close').addEventListener('click', () => {
    document.getElementById('level-up-overlay').classList.add('hidden');
  });
}

// ── BOOT ───────────────────────────────────
function boot() {
  // Apply theme from storage early
  const savedState = localStorage.getItem('treely_state');
  if (savedState) {
    try { const s = JSON.parse(savedState); if(s.theme) document.documentElement.setAttribute('data-theme', s.theme); } catch {}
  }

  initAccountDropdown();
  initAuthScreen();

  let splashDone = false;
  let authResolved = false;

  setTimeout(() => {
    splashDone = true;
    checkBoot();
  }, 2100);

  onAuthStateChanged(AUTH.auth, (user) => {
    if (user) {
      AUTH.user = {
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        avatar: (user.displayName || 'U')[0].toUpperCase(),
        provider: user.providerData && user.providerData[0] ? user.providerData[0].providerId : 'email'
      };
    } else {
      AUTH.user = null;
    }
    authResolved = true;
    checkBoot();
  });

  function checkBoot() {
    if (splashDone && authResolved && !isAppStarted) {
      document.getElementById('splash-screen').style.display = 'none';
      if (AUTH.isLoggedIn()) {
        enterApp();
      } else {
        document.getElementById('auth-screen').classList.remove('hidden');
      }
    }
  }
}

function bootApp() {
  load().then(() => {
    checkWeekRollover();

    // Apply theme
    document.documentElement.setAttribute('data-theme', STATE.theme || 'light');
    document.querySelector('.theme-icon').textContent = STATE.theme === 'dark' ? '☀️' : '🌙';

    // Init last level-up stage from current XP
    lastLevelUpStage = getStageIndex(STATE.weekXP);

    // Load seed demo tasks if none
    if (!STATE.tasks.length) {
      STATE.tasks = [
        { id:uid(), name:'Morning Run', category:'cat-fit', time:'07:00', xp:35, note:'30 min minimum', days:[1,2,3,4,5], completedOn:[] },
        { id:uid(), name:'Study Session', category:'cat-study', time:'09:00', xp:50, note:'Deep work – no phone', days:[0,1,2,3,4,5,6], completedOn:[] },
        { id:uid(), name:'Post on Instagram', category:'cat-ig', time:'11:00', xp:20, note:'Min 1 story + 1 reel', days:[1,3,5], completedOn:[] },
        { id:uid(), name:'Upload YouTube Short', category:'cat-yt', time:'15:00', xp:35, note:'', days:[2,5], completedOn:[] },
        { id:uid(), name:'Evening Workout', category:'cat-fit', time:'18:30', xp:35, note:'Gym or home workout', days:[1,3,5], completedOn:[] },
        { id:uid(), name:'Football Practice', category:'cat-sport', time:'17:00', xp:20, note:'', days:[2,4,6], completedOn:[] },
      ];
      save();
    }

    initForms();
    initEvents();

    // Show the app shell
    document.getElementById('app').classList.remove('hidden');
    navigateTo('home');

    // Notification bar
    if (!STATE.notifDismissed && 'Notification' in window && Notification.permission === 'default') {
      setTimeout(() => document.getElementById('notif-bar').classList.remove('hidden'), 3000);
    }
  });
}

document.addEventListener('DOMContentLoaded', boot);
