/* ===== CRICKETZONE — APP.JS ===== */

// ===== AUTH =====
const ADMIN_CREDS = { user: 'admin', pass: 'cricket2025' };
let isAdmin = false;

function openLogin() { document.getElementById('loginModal').classList.remove('hidden'); }
function closeLogin() { document.getElementById('loginModal').classList.add('hidden'); }

function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  if (u === ADMIN_CREDS.user && p === ADMIN_CREDS.pass) {
    isAdmin = true;
    closeLogin();
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('adminBadge').classList.remove('hidden');
    toggleAdminButtons(true);
    document.getElementById('loginError').classList.add('hidden');
  } else {
    document.getElementById('loginError').classList.remove('hidden');
  }
}

function doLogout() {
  isAdmin = false;
  document.getElementById('loginBtn').classList.remove('hidden');
  document.getElementById('logoutBtn').classList.add('hidden');
  document.getElementById('adminBadge').classList.add('hidden');
  toggleAdminButtons(false);
}

function toggleAdminButtons(show) {
  const ids = ['addMatchBtn','addTeamBtn','addPlayerBtn','addNewsBtn'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) show ? el.classList.remove('hidden') : el.classList.add('hidden');
  });
  document.querySelectorAll('.admin-only').forEach(el => {
    show ? el.classList.remove('hidden') : el.classList.add('hidden');
  });
}

// ===== DATA STORE =====
const DB_KEY = 'czdb_v2';

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { teams: [], players: [], matches: [], news: [], liveScores: {} };
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  document.getElementById('lastUpdated').textContent = 'Last updated: ' + new Date().toLocaleTimeString();
}

let db = loadDB();

// Seed sample data if empty
function seedData() {
  if (db.teams.length > 0) return;
  db.teams = [
    { id: 't1', name: 'Thunder XI', code: 'THX', ground: 'Green Park', captain: 'Ravi Kumar', color: '#1d8fe1' },
    { id: 't2', name: 'Lions CC', code: 'LCC', ground: 'City Ground', captain: 'Pradeep Silva', color: '#e63946' },
    { id: 't3', name: 'Storm Riders', code: 'STR', ground: 'West Field', captain: 'Amal Perera', color: '#f5c518' },
  ];
  db.players = [
    { id: 'p1', name: 'Ravi Kumar', team: 't1', role: 'Batsman', bat: 'Right-Hand', bowl: 'Right-Arm Off-Spin', jersey: 7, age: 28, contact: '' },
    { id: 'p2', name: 'Suresh Nair', team: 't1', role: 'Bowler', bat: 'Left-Hand', bowl: 'Left-Arm Fast', jersey: 12, age: 25, contact: '' },
    { id: 'p3', name: 'Dev Patel', team: 't1', role: 'All-Rounder', bat: 'Right-Hand', bowl: 'Right-Arm Medium', jersey: 5, age: 30, contact: '' },
    { id: 'p4', name: 'Pradeep Silva', team: 't2', role: 'Batsman', bat: 'Right-Hand', bowl: 'Right-Arm Off-Spin', jersey: 1, age: 27, contact: '' },
    { id: 'p5', name: 'Kasun Mendis', team: 't2', role: 'Bowler', bat: 'Right-Hand', bowl: 'Right-Arm Fast', jersey: 9, age: 24, contact: '' },
    { id: 'p6', name: 'Amal Perera', team: 't3', role: 'All-Rounder', bat: 'Left-Hand', bowl: 'Left-Arm Spin', jersey: 3, age: 29, contact: '' },
  ];
  db.matches = [
    { id: 'm1', teamA: 't1', teamB: 't2', date: '2025-04-03', venue: 'Green Park', type: 'T20', status: 'live', result: '' },
    { id: 'm2', teamA: 't2', teamB: 't3', date: '2025-04-05', venue: 'City Ground', type: 'T20', status: 'upcoming', result: '' },
    { id: 'm3', teamA: 't1', teamB: 't3', date: '2025-03-28', venue: 'West Field', type: 'ODI', status: 'completed', result: 'Thunder XI won by 32 runs' },
  ];
  db.liveScores = {
    'm1': {
      battingTeam: 't1',
      score: '124/3',
      overs: '14.3',
      rr: '8.55',
      bat1: { id: 'p1', runs: 67, balls: 48, fours: 7, sixes: 2 },
      bat2: { id: 'p3', runs: 24, balls: 20, fours: 2, sixes: 1 },
      striker: 1,
      bowler: { id: 'p5', overs: '2.3', runs: 22, wickets: 1 },
      overBalls: '1,4,0,W,2',
    }
  };
  db.news = [
    { id: 'n1', title: 'Season 2025 Kicks Off This Weekend', body: 'The local cricket league season 2025 begins with three exciting matches scheduled this weekend. All teams have completed their pre-season practice.', category: 'Tournament', date: '2025-04-01' },
    { id: 'n2', title: 'Thunder XI Announces Squad', body: 'Thunder XI have announced their 15-man squad for the upcoming season with two new exciting signings from neighboring districts.', category: 'Selection', date: '2025-03-30' },
  ];
  saveDB(db);
}

// ===== NAVIGATION =====
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });
  const sec = document.getElementById('sec-' + name);
  if (sec) { sec.classList.remove('hidden'); sec.classList.add('active'); }

  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.sec === name);
  });

  switch(name) {
    case 'live': renderLive(); break;
    case 'matches': renderMatches(); break;
    case 'teams': renderTeams(); break;
    case 'players': renderPlayers(); break;
    case 'news': renderNews(); break;
  }
}

// ===== HELPERS =====
function uid() { return Math.random().toString(36).substr(2, 9); }

function teamById(id) { return db.teams.find(t => t.id === id) || { name: 'TBD', code: '?', color: '#444' }; }
function playerById(id) { return db.players.find(p => p.id === id) || { name: 'Unknown' }; }

function colorText(color) {
  const r = parseInt(color.slice(1,3),16), g = parseInt(color.slice(3,5),16), b = parseInt(color.slice(5,7),16);
  return (r*0.299 + g*0.587 + b*0.114) > 140 ? '#0a0f0d' : '#ffffff';
}

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' });
}

function getBallClass(b) {
  if (b === 'W') return 'ball-W';
  if (b === 'NB') return 'ball-NB';
  if (b === 'WD') return 'ball-WD';
  if (b === '4') return 'ball-4';
  if (b === '6') return 'ball-6';
  if (b === '0') return 'ball-0';
  return 'ball-' + b;
}

function ballsToOvers(balls) {
  return Math.floor(balls / 6) + '.' + (balls % 6);
}

function oversToRemainingBalls(oversStr, matchType) {
  const maxOvers = { 'T20': 20, 'ODI': 50, 'T10': 10, 'Club40': 40 };
  const totalOvers = maxOvers[matchType] || 20;
  const parts = (oversStr || '0').toString().split('.');
  const completedBalls = parseInt(parts[0]) * 6 + parseInt(parts[1] || 0);
  const totalBalls = totalOvers * 6;
  const remaining = totalBalls - completedBalls;
  return remaining;
}

function getMatchType(matchId) {
  const m = db.matches.find(x => x.id === matchId);
  return m ? m.type : 'T20';
}

// ===== LIVE SCORES =====
function renderLive() {
  const liveMatches = db.matches.filter(m => m.status === 'live');
  const container = document.getElementById('liveScoreCards');
  const noLive = document.getElementById('noLive');

  if (liveMatches.length === 0) {
    container.innerHTML = '';
    noLive.classList.remove('hidden');
    return;
  }
  noLive.classList.add('hidden');

  container.innerHTML = liveMatches.map(m => {
    const tA = teamById(m.teamA), tB = teamById(m.teamB);
    const ls = db.liveScores[m.id] || {};
    const bt = ls.battingTeam ? teamById(ls.battingTeam) : null;
    const bat1 = ls.bat1 && ls.bat1.id ? playerById(ls.bat1.id) : null;
    const bat2 = ls.bat2 && ls.bat2.id ? playerById(ls.bat2.id) : null;
    const bowler = ls.bowler && ls.bowler.id ? playerById(ls.bowler.id) : null;

    const balls = ls.overBalls ? ls.overBalls.split(',').map(b => b.trim()).filter(Boolean) : [];

    // Remaining balls in over
    const bowledThisOver = balls.filter(b => b !== 'NB' && b !== 'WD').length;
    const remInOver = 6 - bowledThisOver;
    const matchType = getMatchType(m.id);
    const remTotal = ls.overs ? oversToRemainingBalls(ls.overs, matchType) : '';

    const adminBtns = isAdmin ? `
      <button class="btn-icon live-edit admin-only" onclick="openLiveModal('${m.id}')" title="Edit Live Score">✏️ Edit Score</button>
      <button class="btn-icon admin-only" onclick="editMatch('${m.id}')" title="Edit Match">⚙️</button>
      <button class="btn-icon del admin-only" onclick="deleteMatch('${m.id}')" title="Delete">🗑️</button>
    ` : '';

    return `
    <div class="live-card">
      <div class="live-card-header">
        <div class="match-teams">${tA.code} <span style="color:var(--text-dim);font-size:0.9rem">vs</span> ${tB.code}</div>
        <div class="match-meta">
          <span class="badge badge-live">● LIVE</span>
          <span class="badge badge-t20">${m.type}</span>
        </div>
      </div>
      <div class="live-card-body">
        ${bt ? `<div style="font-size:0.75rem;color:var(--text-muted);font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">🏏 ${bt.name} Batting</div>` : ''}
        <div class="score-display">
          <div class="score-main">${ls.score || '—'}</div>
          <div class="score-overs">${ls.overs ? '(' + ls.overs + ' ov)' : ''}</div>
        </div>
        ${ls.rr ? `<div class="rr-display">Run Rate: ${ls.rr}</div>` : ''}

        ${bat1 || bat2 ? `
        <table class="batsmen-table">
          <thead><tr>
            <th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th>
          </tr></thead>
          <tbody>
            ${bat1 ? `<tr class="${ls.striker===1?'on-strike':''}">
              <td>${bat1.name}${ls.striker===1?'<span class="strike-mark">*</span>':''}</td>
              <td><strong>${ls.bat1.runs||0}</strong></td>
              <td>${ls.bat1.balls||0}</td>
              <td>${ls.bat1.fours||0}</td>
              <td>${ls.bat1.sixes||0}</td>
              <td>${ls.bat1.balls>0?((ls.bat1.runs/ls.bat1.balls)*100).toFixed(1):'—'}</td>
            </tr>` : ''}
            ${bat2 ? `<tr class="${ls.striker===2?'on-strike':''}">
              <td>${bat2.name}${ls.striker===2?'<span class="strike-mark">*</span>':''}</td>
              <td><strong>${ls.bat2.runs||0}</strong></td>
              <td>${ls.bat2.balls||0}</td>
              <td>${ls.bat2.fours||0}</td>
              <td>${ls.bat2.sixes||0}</td>
              <td>${ls.bat2.balls>0?((ls.bat2.runs/ls.bat2.balls)*100).toFixed(1):'—'}</td>
            </tr>` : ''}
          </tbody>
        </table>` : ''}

        ${bowler ? `
        <div class="bowler-row">
          <div>
            <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;font-family:'Barlow Condensed',sans-serif;">Bowling</div>
            <div class="bowler-name">🎯 ${bowler.name}</div>
          </div>
          <div class="bowler-stats">${ls.bowler.overs||'0'}ov · ${ls.bowler.runs||0}R · ${ls.bowler.wickets||0}W</div>
        </div>` : ''}

        ${balls.length > 0 ? `
        <div>
          <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;font-family:'Barlow Condensed',sans-serif;margin-bottom:6px;">This Over</div>
          <div class="over-balls-row">
            ${balls.map(b => `<div class="over-ball ${getBallClass(b)}">${b}</div>`).join('')}
            ${Array(Math.max(0,6-bowledThisOver)).fill(0).map(()=>`<div class="over-ball" style="border-style:dashed;opacity:0.3">·</div>`).join('')}
          </div>
          <div style="font-size:0.72rem;color:var(--text-muted);margin-top:6px;font-family:'Barlow Condensed',sans-serif;">
            ${remInOver} ball${remInOver!==1?'s':''} remaining this over · ${remTotal} balls remaining in innings
          </div>
        </div>` : ''}
      </div>
      <div class="card-actions">${adminBtns}</div>
    </div>`;
  }).join('');
}

// ===== MATCHES =====
let matchFilter = 'all';

function filterMatches(f, el) {
  matchFilter = f;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  renderMatches();
}

function renderMatches() {
  let list = db.matches;
  if (matchFilter !== 'all') list = list.filter(m => m.status === matchFilter);

  const container = document.getElementById('matchCards');
  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🏏</div><p>No matches found</p></div>';
    return;
  }

  container.innerHTML = list.map(m => {
    const tA = teamById(m.teamA), tB = teamById(m.teamB);
    const adminBtns = isAdmin ? `
      ${m.status==='live'?`<button class="btn-icon live-edit admin-only" onclick="openLiveModal('${m.id}')" title="Live Score">📊</button>`:''}
      <button class="btn-icon admin-only" onclick="editMatch('${m.id}')">✏️</button>
      <button class="btn-icon del admin-only" onclick="deleteMatch('${m.id}')">🗑️</button>
    ` : '';
    return `
    <div class="match-card">
      <div class="match-card-header">
        <div>
          <div class="match-teams-name">${tA.code} vs ${tB.code}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);font-family:'Barlow Condensed',sans-serif;margin-top:2px;">${tA.name} vs ${tB.name}</div>
        </div>
        <div style="display:flex;gap:6px;flex-direction:column;align-items:flex-end;">
          <span class="badge badge-${m.status}">${m.status.toUpperCase()}</span>
          <span class="badge badge-t20">${m.type}</span>
        </div>
      </div>
      <div class="match-card-body">
        <div class="match-info-row">
          <span class="match-info-item">📅 ${formatDate(m.date)}</span>
          <span class="match-info-item">📍 ${m.venue||'TBD'}</span>
        </div>
        ${m.result ? `<div class="match-result">🏆 ${m.result}</div>` : ''}
      </div>
      <div class="match-card-footer">${adminBtns}</div>
    </div>`;
  }).join('');
}

// ===== TEAMS =====
function renderTeams() {
  const container = document.getElementById('teamCards');
  if (db.teams.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>No teams yet</p></div>';
    return;
  }

  container.innerHTML = db.teams.map(t => {
    const players = db.players.filter(p => p.team === t.id);
    const adminBtns = isAdmin ? `
      <button class="btn-icon admin-only" onclick="editTeam('${t.id}')">✏️</button>
      <button class="btn-icon del admin-only" onclick="deleteTeam('${t.id}')">🗑️</button>
    ` : '';
    return `
    <div class="team-card">
      <div class="team-card-banner" style="background:${t.color}"></div>
      <div class="team-card-body">
        <div class="team-code" style="color:${t.color}">${t.code}</div>
        <div class="team-name">${t.name}</div>
        <div class="team-stats">
          <div class="team-stat">
            <div class="team-stat-val">${players.length}</div>
            <div class="team-stat-lbl">Players</div>
          </div>
          <div class="team-stat">
            <div class="team-stat-val">${db.matches.filter(m=>m.teamA===t.id||m.teamB===t.id).length}</div>
            <div class="team-stat-lbl">Matches</div>
          </div>
        </div>
        <div class="team-info">🏟️ ${t.ground||'—'}</div>
        <div class="team-info">👑 ${t.captain||'—'}</div>
      </div>
      <div class="team-card-footer">${adminBtns}</div>
    </div>`;
  }).join('');
}

// ===== PLAYERS =====
function renderPlayers() {
  const search = document.getElementById('playerSearch').value.toLowerCase();
  const teamF = document.getElementById('playerTeamFilter').value;

  let list = db.players;
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search) || (p.role||'').toLowerCase().includes(search));
  if (teamF) list = list.filter(p => p.team === teamF);

  const container = document.getElementById('playerCards');
  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🏃</div><p>No players found</p></div>';
    return;
  }

  container.innerHTML = list.map(p => {
    const t = teamById(p.team);
    const initials = p.name.split(' ').map(w=>w[0]).join('').toUpperCase().substr(0,2);
    const batLeft = p.bat && p.bat.includes('Left');
    const bowlLeft = p.bowl && p.bowl.includes('Left');
    const adminBtns = isAdmin ? `
      <button class="btn-icon admin-only" onclick="editPlayer('${p.id}')">✏️</button>
      <button class="btn-icon del admin-only" onclick="deletePlayer('${p.id}')">🗑️</button>
    ` : '';
    return `
    <div class="player-card">
      <div class="player-header">
        <div class="player-avatar" style="background:${t.color};color:${colorText(t.color)}">${initials}</div>
        <div>
          <div class="player-name">${p.name}</div>
          <div class="player-jersey">#${p.jersey||'—'} · ${p.age||'—'} yrs</div>
        </div>
      </div>
      <div>
        <span class="player-team-badge" style="background:${t.color};color:${colorText(t.color)}">${t.name}</span>
      </div>
      <div><span class="player-role">${p.role}</span></div>
      <div class="player-styles">
        <span class="style-tag ${batLeft?'bat-left':'bat-right'}">🏏 ${p.bat||'—'}</span>
        ${p.bowl && p.bowl!=='N/A' ? `<span class="style-tag ${bowlLeft?'bowl-left':'bowl-right'}">🎯 ${p.bowl}</span>` : ''}
      </div>
      <div class="player-card-footer">${adminBtns}</div>
    </div>`;
  }).join('');
}

function populatePlayerTeamFilter() {
  const sel = document.getElementById('playerTeamFilter');
  sel.innerHTML = '<option value="">All Teams</option>' + db.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
}

// ===== NEWS =====
function renderNews() {
  const container = document.getElementById('newsCards');
  if (db.news.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📰</div><p>No news yet</p></div>';
    return;
  }

  container.innerHTML = db.news.slice().reverse().map(n => {
    const adminBtns = isAdmin ? `
      <div style="display:flex;gap:6px;">
        <button class="btn-icon admin-only" onclick="editNews('${n.id}')">✏️</button>
        <button class="btn-icon del admin-only" onclick="deleteNews('${n.id}')">🗑️</button>
      </div>
    ` : '';
    return `
    <div class="news-card">
      <div class="news-card-header">
        <div class="news-title">${n.title}</div>
        <span class="badge badge-t20">${n.category}</span>
      </div>
      <div class="news-card-body">${n.body}</div>
      <div class="news-card-footer">
        <span class="news-date">📅 ${formatDate(n.date)}</span>
        ${adminBtns}
      </div>
    </div>`;
  }).join('');
}

// ===== MATCH MODAL =====
function populateTeamSelects(aId, bId) {
  const opts = db.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  document.getElementById('mTeamA').innerHTML = opts;
  document.getElementById('mTeamB').innerHTML = opts;
  if (aId) document.getElementById('mTeamA').value = aId;
  if (bId) document.getElementById('mTeamB').value = bId;
}

function openMatchModal(matchId = null) {
  document.getElementById('matchModalTitle').textContent = matchId ? 'Edit Match' : 'Add New Match';
  document.getElementById('editMatchId').value = matchId || '';
  populateTeamSelects();

  if (matchId) {
    const m = db.matches.find(x => x.id === matchId);
    if (m) {
      document.getElementById('mTeamA').value = m.teamA;
      document.getElementById('mTeamB').value = m.teamB;
      document.getElementById('mDate').value = m.date;
      document.getElementById('mVenue').value = m.venue;
      document.getElementById('mType').value = m.type;
      document.getElementById('mStatus').value = m.status;
      document.getElementById('mResult').value = m.result;
    }
  } else {
    ['mDate','mVenue','mResult'].forEach(id => document.getElementById(id).value = '');
  }
  document.getElementById('matchModal').classList.remove('hidden');
}

function closeMatchModal() { document.getElementById('matchModal').classList.add('hidden'); }

function saveMatch() {
  const id = document.getElementById('editMatchId').value;
  const m = {
    teamA: document.getElementById('mTeamA').value,
    teamB: document.getElementById('mTeamB').value,
    date: document.getElementById('mDate').value,
    venue: document.getElementById('mVenue').value,
    type: document.getElementById('mType').value,
    status: document.getElementById('mStatus').value,
    result: document.getElementById('mResult').value,
  };
  if (id) {
    const idx = db.matches.findIndex(x => x.id === id);
    db.matches[idx] = { ...db.matches[idx], ...m };
  } else {
    db.matches.push({ id: 'm' + uid(), ...m });
  }
  saveDB(db);
  closeMatchModal();
  renderMatches();
  renderLive();
}

function editMatch(id) { if (isAdmin) openMatchModal(id); }

function deleteMatch(id) {
  if (!isAdmin) return;
  if (!confirm('Delete this match?')) return;
  db.matches = db.matches.filter(m => m.id !== id);
  delete db.liveScores[id];
  saveDB(db);
  renderMatches();
  renderLive();
}

// ===== TEAM MODAL =====
function openTeamModal(teamId = null) {
  document.getElementById('teamModalTitle').textContent = teamId ? 'Edit Team' : 'Add New Team';
  document.getElementById('editTeamId').value = teamId || '';
  if (teamId) {
    const t = db.teams.find(x => x.id === teamId);
    if (t) {
      document.getElementById('tName').value = t.name;
      document.getElementById('tCode').value = t.code;
      document.getElementById('tGround').value = t.ground;
      document.getElementById('tCaptain').value = t.captain;
      document.getElementById('tColor').value = t.color;
    }
  } else {
    ['tName','tCode','tGround','tCaptain'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('tColor').value = '#1a7a3c';
  }
  document.getElementById('teamModal').classList.remove('hidden');
}

function closeTeamModal() { document.getElementById('teamModal').classList.add('hidden'); }

function saveTeam() {
  const id = document.getElementById('editTeamId').value;
  const t = {
    name: document.getElementById('tName').value,
    code: document.getElementById('tCode').value.toUpperCase(),
    ground: document.getElementById('tGround').value,
    captain: document.getElementById('tCaptain').value,
    color: document.getElementById('tColor').value,
  };
  if (id) {
    const idx = db.teams.findIndex(x => x.id === id);
    db.teams[idx] = { ...db.teams[idx], ...t };
  } else {
    db.teams.push({ id: 't' + uid(), ...t });
  }
  saveDB(db);
  closeTeamModal();
  renderTeams();
  populatePlayerTeamFilter();
}

function editTeam(id) { if (isAdmin) openTeamModal(id); }

function deleteTeam(id) {
  if (!isAdmin) return;
  if (!confirm('Delete this team? Players will also be unlinked.')) return;
  db.teams = db.teams.filter(t => t.id !== id);
  db.players = db.players.map(p => p.team === id ? { ...p, team: '' } : p);
  saveDB(db);
  renderTeams();
  populatePlayerTeamFilter();
}

// ===== PLAYER MODAL =====
function populatePlayerTeamSelect() {
  const sel = document.getElementById('pTeam');
  sel.innerHTML = '<option value="">-- Select Team --</option>' + db.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
}

function openPlayerModal(playerId = null) {
  document.getElementById('playerModalTitle').textContent = playerId ? 'Edit Player' : 'Add New Player';
  document.getElementById('editPlayerId').value = playerId || '';
  populatePlayerTeamSelect();

  if (playerId) {
    const p = db.players.find(x => x.id === playerId);
    if (p) {
      document.getElementById('pName').value = p.name;
      document.getElementById('pTeam').value = p.team;
      document.getElementById('pRole').value = p.role;
      document.getElementById('pJersey').value = p.jersey;
      document.getElementById('pBat').value = p.bat;
      document.getElementById('pBowl').value = p.bowl;
      document.getElementById('pAge').value = p.age;
      document.getElementById('pContact').value = p.contact||'';
    }
  } else {
    ['pName','pJersey','pAge','pContact'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('pTeam').value = '';
  }
  document.getElementById('playerModal').classList.remove('hidden');
}

function closePlayerModal() { document.getElementById('playerModal').classList.add('hidden'); }

function savePlayer() {
  const id = document.getElementById('editPlayerId').value;
  const p = {
    name: document.getElementById('pName').value,
    team: document.getElementById('pTeam').value,
    role: document.getElementById('pRole').value,
    jersey: document.getElementById('pJersey').value,
    bat: document.getElementById('pBat').value,
    bowl: document.getElementById('pBowl').value,
    age: document.getElementById('pAge').value,
    contact: document.getElementById('pContact').value,
  };
  if (id) {
    const idx = db.players.findIndex(x => x.id === id);
    db.players[idx] = { ...db.players[idx], ...p };
  } else {
    db.players.push({ id: 'p' + uid(), ...p });
  }
  saveDB(db);
  closePlayerModal();
  renderPlayers();
}

function editPlayer(id) { if (isAdmin) openPlayerModal(id); }

function deletePlayer(id) {
  if (!isAdmin) return;
  if (!confirm('Delete this player?')) return;
  db.players = db.players.filter(p => p.id !== id);
  saveDB(db);
  renderPlayers();
}

// ===== LIVE SCORE MODAL =====
function openLiveModal(matchId) {
  if (!isAdmin) return;
  const m = db.matches.find(x => x.id === matchId);
  if (!m) return;
  const tA = teamById(m.teamA), tB = teamById(m.teamB);

  document.getElementById('liveModalTitle').textContent = `Live Score: ${tA.name} vs ${tB.name}`;
  document.getElementById('liveMatchId').value = matchId;

  // Batting team select
  const btSel = document.getElementById('lBattingTeam');
  btSel.innerHTML = `<option value="${m.teamA}">${tA.name}</option><option value="${m.teamB}">${tB.name}</option>`;

  // Populate bowler team (opposite of batting)
  updateBattingPlayers();

  const ls = db.liveScores[matchId] || {};
  if (ls.battingTeam) btSel.value = ls.battingTeam;

  document.getElementById('lScore').value = ls.score || '';
  document.getElementById('lOvers').value = ls.overs || '';
  document.getElementById('lRR').value = ls.rr || '';

  if (ls.bat1) {
    document.getElementById('lBat1').value = ls.bat1.id || '';
    document.getElementById('lBat1Runs').value = ls.bat1.runs || 0;
    document.getElementById('lBat1Balls').value = ls.bat1.balls || 0;
    document.getElementById('lBat1Fours').value = ls.bat1.fours || 0;
    document.getElementById('lBat1Sixes').value = ls.bat1.sixes || 0;
  }
  if (ls.bat2) {
    document.getElementById('lBat2').value = ls.bat2.id || '';
    document.getElementById('lBat2Runs').value = ls.bat2.runs || 0;
    document.getElementById('lBat2Balls').value = ls.bat2.balls || 0;
    document.getElementById('lBat2Fours').value = ls.bat2.fours || 0;
    document.getElementById('lBat2Sixes').value = ls.bat2.sixes || 0;
  }

  updateBattingPlayers();

  // Set striker
  currentStriker = ls.striker || 1;
  updateStrikeUI();

  document.getElementById('lOverBalls').value = ls.overBalls || '';
  renderBallPreview();

  if (ls.bowler) {
    document.getElementById('lBowler').value = ls.bowler.id || '';
    document.getElementById('lBowlerOvers').value = ls.bowler.overs || '';
    document.getElementById('lBowlerRuns').value = ls.bowler.runs || 0;
    document.getElementById('lBowlerWickets').value = ls.bowler.wickets || 0;
  }

  document.getElementById('liveModal').classList.remove('hidden');
}

function updateBattingPlayers() {
  const matchId = document.getElementById('liveMatchId').value;
  const m = db.matches.find(x => x.id === matchId);
  if (!m) return;

  const battingTeamId = document.getElementById('lBattingTeam').value;
  const bowlingTeamId = battingTeamId === m.teamA ? m.teamB : m.teamA;

  const battingPlayers = db.players.filter(p => p.team === battingTeamId);
  const bowlingPlayers = db.players.filter(p => p.team === bowlingTeamId);

  const batOpts = '<option value="">-- Select Batsman --</option>' + battingPlayers.map(p => `<option value="${p.id}">${p.name} (#${p.jersey||'?'})</option>`).join('');
  document.getElementById('lBat1').innerHTML = batOpts;
  document.getElementById('lBat2').innerHTML = batOpts;

  const bowlOpts = '<option value="">-- Select Bowler --</option>' + bowlingPlayers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  document.getElementById('lBowler').innerHTML = bowlOpts;

  updateRemainingBalls();
}

function closeLiveModal() { document.getElementById('liveModal').classList.add('hidden'); }

let currentStriker = 1;

function swapBatsmen() {
  currentStriker = currentStriker === 1 ? 2 : 1;
  updateStrikeUI();
}

function updateStrikeUI() {
  const c1 = document.getElementById('bat1Card');
  const c2 = document.getElementById('bat2Card');
  const l1 = c1.querySelector('.bat-label');
  const l2 = c2.querySelector('.bat-label');

  if (currentStriker === 1) {
    c1.classList.add('on-strike');
    c2.classList.remove('on-strike');
    l1.innerHTML = 'Opener 1 <span class="bat-badge">★ ON STRIKE</span>';
    l2.innerHTML = 'Opener 2';
  } else {
    c2.classList.add('on-strike');
    c1.classList.remove('on-strike');
    l2.innerHTML = 'Opener 2 <span class="bat-badge">★ ON STRIKE</span>';
    l1.innerHTML = 'Opener 1';
  }
}

function addBall(val) {
  const inp = document.getElementById('lOverBalls');
  const cur = inp.value.trim();
  inp.value = cur ? cur + ',' + val : val;
  renderBallPreview();
  updateRemainingBalls();
}

function undoBall() {
  const inp = document.getElementById('lOverBalls');
  const parts = inp.value.split(',').map(s=>s.trim()).filter(Boolean);
  parts.pop();
  inp.value = parts.join(',');
  renderBallPreview();
  updateRemainingBalls();
}

function renderBallPreview() {
  const val = document.getElementById('lOverBalls').value;
  const balls = val.split(',').map(b=>b.trim()).filter(Boolean);
  const prev = document.getElementById('ballPreview');
  prev.innerHTML = balls.map(b => `<div class="over-ball ${getBallClass(b)}">${b}</div>`).join('');
  updateRemainingBalls();
}

function updateRemainingBalls() {
  const matchId = document.getElementById('liveMatchId').value;
  const overs = document.getElementById('lOvers') ? document.getElementById('lOvers').value : '0';
  const matchType = getMatchType(matchId) || 'T20';
  const rem = overs ? oversToRemainingBalls(overs, matchType) : '—';
  const ballStr = document.getElementById('lOverBalls') ? document.getElementById('lOverBalls').value : '';
  const balls = ballStr.split(',').map(b=>b.trim()).filter(Boolean);
  const bowledThisOver = balls.filter(b => b !== 'NB' && b !== 'WD').length;
  const remInOver = Math.max(0, 6 - bowledThisOver);

  const el = document.getElementById('remainingBalls');
  if (el) {
    el.innerHTML = `⚡ <strong>${remInOver}</strong> ball${remInOver!==1?'s':''} remaining this over &nbsp;|&nbsp; 🏏 <strong>${rem}</strong> total balls remaining in innings (${matchType})`;
  }
}

function updateBowlerOvers() { updateRemainingBalls(); }

function saveLiveScore() {
  const matchId = document.getElementById('liveMatchId').value;
  db.liveScores[matchId] = {
    battingTeam: document.getElementById('lBattingTeam').value,
    score: document.getElementById('lScore').value,
    overs: document.getElementById('lOvers').value,
    rr: document.getElementById('lRR').value,
    bat1: {
      id: document.getElementById('lBat1').value,
      runs: parseInt(document.getElementById('lBat1Runs').value)||0,
      balls: parseInt(document.getElementById('lBat1Balls').value)||0,
      fours: parseInt(document.getElementById('lBat1Fours').value)||0,
      sixes: parseInt(document.getElementById('lBat1Sixes').value)||0,
    },
    bat2: {
      id: document.getElementById('lBat2').value,
      runs: parseInt(document.getElementById('lBat2Runs').value)||0,
      balls: parseInt(document.getElementById('lBat2Balls').value)||0,
      fours: parseInt(document.getElementById('lBat2Fours').value)||0,
      sixes: parseInt(document.getElementById('lBat2Sixes').value)||0,
    },
    striker: currentStriker,
    bowler: {
      id: document.getElementById('lBowler').value,
      overs: document.getElementById('lBowlerOvers').value,
      runs: parseInt(document.getElementById('lBowlerRuns').value)||0,
      wickets: parseInt(document.getElementById('lBowlerWickets').value)||0,
    },
    overBalls: document.getElementById('lOverBalls').value,
  };
  saveDB(db);
  closeLiveModal();
  renderLive();

  // Flash notification
  showToast('✅ Live score updated and broadcast!');
}

// ===== NEWS MODAL =====
function openNewsModal(newsId = null) {
  document.getElementById('newsModalTitle').textContent = newsId ? 'Edit News' : 'Add News';
  document.getElementById('editNewsId').value = newsId || '';
  if (newsId) {
    const n = db.news.find(x => x.id === newsId);
    if (n) {
      document.getElementById('nTitle').value = n.title;
      document.getElementById('nBody').value = n.body;
      document.getElementById('nCat').value = n.category;
    }
  } else {
    document.getElementById('nTitle').value = '';
    document.getElementById('nBody').value = '';
  }
  document.getElementById('newsModal').classList.remove('hidden');
}

function closeNewsModal() { document.getElementById('newsModal').classList.add('hidden'); }

function saveNews() {
  const id = document.getElementById('editNewsId').value;
  const n = {
    title: document.getElementById('nTitle').value,
    body: document.getElementById('nBody').value,
    category: document.getElementById('nCat').value,
    date: new Date().toISOString().split('T')[0],
  };
  if (id) {
    const idx = db.news.findIndex(x => x.id === id);
    db.news[idx] = { ...db.news[idx], ...n };
  } else {
    db.news.push({ id: 'n' + uid(), ...n });
  }
  saveDB(db);
  closeNewsModal();
  renderNews();
}

function editNews(id) { if (isAdmin) openNewsModal(id); }
function deleteNews(id) {
  if (!isAdmin) return;
  if (!confirm('Delete this news?')) return;
  db.news = db.news.filter(n => n.id !== id);
  saveDB(db);
  renderNews();
}

// ===== TOAST =====
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a7a3c;color:#fff;padding:10px 22px;border-radius:8px;font-family:Barlow Condensed,sans-serif;font-size:1rem;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.5);transition:opacity 0.3s ease;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// ===== AUTO REFRESH =====
let refreshTimer = 30;
let refreshInterval;

function startRefresh() {
  const countdown = document.getElementById('refreshCountdown');
  refreshInterval = setInterval(() => {
    refreshTimer--;
    countdown.textContent = refreshTimer;
    if (refreshTimer <= 0) {
      refreshTimer = 30 + Math.floor(Math.random() * 30); // 30-60s
      countdown.textContent = refreshTimer;
      db = loadDB(); // Reload from storage (for multi-tab sync)
      refreshCurrentSection();
    }
  }, 1000);
}

function refreshCurrentSection() {
  const active = document.querySelector('.nav-link.active');
  if (active) {
    const sec = active.dataset.sec;
    switch(sec) {
      case 'live': renderLive(); break;
      case 'matches': renderMatches(); break;
      case 'teams': renderTeams(); break;
      case 'players': renderPlayers(); break;
      case 'news': renderNews(); break;
    }
  }
}

// Storage event for multi-tab/device sync
window.addEventListener('storage', (e) => {
  if (e.key === DB_KEY) {
    db = loadDB();
    refreshCurrentSection();
  }
});

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.add('hidden');
    }
  });
});

// ===== INIT =====
function init() {
  seedData();
  db = loadDB();
  populatePlayerTeamFilter();
  renderLive();
  startRefresh();
  document.getElementById('lastUpdated').textContent = 'Last updated: ' + new Date().toLocaleTimeString();
}

init();
