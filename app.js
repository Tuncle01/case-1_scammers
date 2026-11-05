// fraud chat game
// vanilla js, no frameworks

const state = {
  money: 10000,
  caught: 0,
  chatStatus: {}, // id -> new | caught | failed | safe_done
  history: {},    // id -> [{text, type}]
  progress: {},   // id -> {currentNode, lostInChat, pendingNext}
  activeChat: null,
  currentNode: null,
  pendingNext: null,
  busy: false,
  finished: false,
  totalScammers: 0,
  lostInChat: false,
  readOnly: false
};

const $ = (s) => document.querySelector(s);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('d-none'));
  $(id).classList.remove('d-none');
  window.scrollTo(0, 0);
}

function startGame() {
  state.money = 10000;
  state.caught = 0;
  state.chatStatus = {};
  state.history = {};
  state.progress = {};
  state.totalScammers = scammers.filter(s => !s.isSafe).length;

  scammers.forEach(s => {
    state.chatStatus[s.id] = 'new';
    state.history[s.id] = [];
  });

  state.activeChat = null;
  state.currentNode = null;
  state.pendingNext = null;
  state.busy = false;
  state.finished = false;
  state.lostInChat = false;
  state.readOnly = false;

  $('#chat-messages').innerHTML = '';
  $('#chat-actions').innerHTML = '';
  $('#chat-finished-banner').classList.add('d-none');

  renderList();
  updateHUD();
  showScreen('#screen-list');
}

function renderList() {
  const box = $('#chat-list');
  box.innerHTML = '';

  scammers.forEach((s, idx) => {
    const status = state.chatStatus[s.id];
    const item = document.createElement('div');
    item.className = 'chat-item';

    let icon = '🔒';
    let preview = 'Нажми, чтобы открыть переписку';

    if (status === 'caught') {
      item.classList.add('done', 'caught');
      icon = '✅';
      preview = 'Ты раскусил мошенника';
    }
    if (status === 'failed') {
      item.classList.add('done', 'failed');
      icon = '❌';
      preview = 'Тебя обманули';
    }
    if (status === 'safe_done') {
      item.classList.add('done');
      icon = '💬';
      preview = 'Обычная переписка';
    }

    // paused chat
    if (status === 'new' && state.progress[s.id]) {
      preview = '⏸ Переписка на паузе — нажми, чтобы продолжить';
    }

    item.innerHTML = `
      <div class="avatar">${s.avatar}</div>
      <div class="info">
        <div class="name">${s.name}</div>
        <div class="preview">${preview}</div>
      </div>
      <div class="status">${icon}</div>
    `;

    item.addEventListener('click', () => openChat(idx));
    box.appendChild(item);
  });
}

function openChat(idx) {
  if (state.finished) return;
  const s = scammers[idx];
  const status = state.chatStatus[s.id];

  state.activeChat = idx;

  // already finished -> read only
  if (status !== 'new') {
    state.readOnly = true;
    state.pendingNext = null;
    state.lostInChat = false;

    $('#chat-name').textContent = s.name;
    $('#chat-avatar').textContent = s.avatar;

    const statusText = (status === 'safe_done') ? 'был(а) недавно' : 'был(а) давно';
    $('#chat-status').textContent = statusText;
    $('#chat-status').classList.add('offline');

    $('#chat-messages').innerHTML = '';
    (state.history[s.id] || []).forEach(m => addBubble(m.text, m.type, false));

    $('#chat-actions').innerHTML = '';
    $('#chat-finished-banner').classList.remove('d-none');
    updateHUD();
    showScreen('#screen-chat');
    return;
  }

  state.readOnly = false;
  $('#chat-messages').innerHTML = '';
  $('#chat-actions').innerHTML = '';
  $('#chat-finished-banner').classList.add('d-none');

  $('#chat-name').textContent = s.name;
  $('#chat-avatar').textContent = s.avatar;
  $('#chat-status').textContent = 'онлайн';
  $('#chat-status').classList.remove('offline');

  const prog = state.progress[s.id];

  // resume paused chat
  if (prog) {
    state.currentNode = prog.currentNode;
    state.lostInChat = prog.lostInChat;
    state.pendingNext = prog.pendingNext || null;
    state.busy = false;

    (state.history[s.id] || []).forEach(m => addBubble(m.text, m.type, false));
    updateHUD();
    showScreen('#screen-chat');

    // user answered before leaving, and it ended the chat
    if (state.pendingNext === 'END') {
      state.pendingNext = null;
      addSystemMessage("🚫 Контакт заблокирован");
      setTimeout(() => finishChat(false), 300);
      return;
    }

    showNode();
    return;
  }

  // fresh start
  state.currentNode = s.startNode;
  state.lostInChat = false;
  state.pendingNext = null;
  state.busy = false;

  updateHUD();
  showScreen('#screen-chat');
  addSystemMessage(`--- ${s.name} ---`);
  showNode();
}

function backToList() {
  if (state.finished) return;

  // save progress if not finished
  if (state.activeChat !== null && !state.readOnly) {
    const s = scammers[state.activeChat];
    if (state.chatStatus[s.id] === 'new') {
      state.progress[s.id] = {
        currentNode: state.currentNode,
        lostInChat: state.lostInChat,
        pendingNext: state.pendingNext
      };
    }
  }

  state.activeChat = null;
  state.currentNode = null;
  state.pendingNext = null;
  state.busy = false;
  state.readOnly = false;
  $('#chat-actions').innerHTML = '';
  $('#chat-finished-banner').classList.add('d-none');
  renderList();
  updateHUD();
  showScreen('#screen-list');
}

function pushHistory(text, type) {
  if (state.activeChat === null) return;
  const s = scammers[state.activeChat];
  if (!state.history[s.id]) state.history[s.id] = [];
  state.history[s.id].push({ text, type });
}

function addBubble(text, type = 'in', save = true) {
  const div = document.createElement('div');
  div.className = `bubble ${type}`;
  div.textContent = text;
  $('#chat-messages').appendChild(div);
  $('#chat-messages').scrollTop = $('#chat-messages').scrollHeight;
  if (save) pushHistory(text, type);
}

function addSystemMessage(text) {
  addBubble(text, 'sys');
}

function showNode() {
  if (state.readOnly) return;
  const s = scammers[state.activeChat];
  const node = s.nodes[state.currentNode];

  if (!node) { finishChat(false); return; }

  state.busy = false;

  const hist = state.history[s.id] || [];
  const last = hist.slice(-1)[0];
  const alreadyShown = last && last.text === node.text;

  if (alreadyShown) {
    if (node.terminal || !node.actions || !node.actions.length) {
      setTimeout(() => finishChat(false), 300);
    } else {
      renderActions(node.actions);
    }
    return;
  }

  const type = node.sys ? 'sys' : 'in';
  // save to history before the timer — fixes the "leave while typing" bug
  pushHistory(node.text, type);

  $('#chat-status').textContent = 'печатает…';
  setTimeout(() => {
    $('#chat-status').textContent = 'онлайн';
    addBubble(node.text, type, false);

    if (node.terminal || !node.actions || !node.actions.length) {
      setTimeout(() => finishChat(false), 800);
      return;
    }
    renderActions(node.actions);
  }, 700);
}

function renderActions(actions) {
  const box = $('#chat-actions');
  box.innerHTML = '';
  actions.forEach((a) => {
    const btn = document.createElement('button');
    btn.className = 'action-btn';

    // can't spend more than we have
    const cost = (a.effect && a.effect.money < 0) ? Math.abs(a.effect.money) : 0;
    const notEnough = cost > 0 && state.money < cost;

    btn.textContent = notEnough ? `${a.label} — недостаточно средств` : a.label;

    if (notEnough) {
      btn.disabled = true;
      btn.classList.add('disabled-cost');
    } else {
      btn.addEventListener('click', () => chooseAction(a, btn));
    }

    box.appendChild(btn);
  });
}

function chooseAction(action, btn) {
  if (state.busy || state.finished || state.readOnly) return;

  const cost = (action.effect && action.effect.money < 0) ? Math.abs(action.effect.money) : 0;
  if (cost > 0 && state.money < cost) {
    addSystemMessage("💸 Недостаточно средств для этого перевода");
    return;
  }

  state.busy = true;
  document.querySelectorAll('#chat-actions .action-btn').forEach(b => b.disabled = true);
  if (action.kind === 'good') btn.classList.add('good');
  else if (action.kind === 'bad') btn.classList.add('bad');
  addBubble(action.label, 'out');

  const e = action.effect || {};
  if (e.money) {
    state.money = Math.max(0, state.money + e.money);
    if (e.money < 0) state.lostInChat = true;
  }
  if (e.caught) state.caught = Math.min(state.totalScammers, state.caught + e.caught);
  updateHUD();

  // pendingNext guards the "leave before block" bug
  if (action.next !== null && action.next !== undefined) {
    state.currentNode = action.next;
    state.pendingNext = null;
  } else {
    state.pendingNext = 'END';
  }

  setTimeout(() => {
    $('#chat-actions').innerHTML = '';

    if (state.pendingNext === 'END') {
      if (e.caught >= 1) addSystemMessage("🚫 Контакт заблокирован");
      state.pendingNext = null;
      setTimeout(() => finishChat(false), 700);
      return;
    }

    state.pendingNext = null;
    showNode();
  }, 900);
}

function finishChat(failed) {
  const s = scammers[state.activeChat];
  if (!s) return;

  // double-call guard
  if (state.chatStatus[s.id] !== 'new') {
    state.activeChat = null;
    state.currentNode = null;
    state.pendingNext = null;
    state.busy = false;
    renderList();
    updateHUD();
    showScreen('#screen-list');
    return;
  }

  if (failed || state.lostInChat) {
    state.chatStatus[s.id] = 'failed';
  } else if (s.isSafe) {
    state.chatStatus[s.id] = 'safe_done';
  } else {
    state.chatStatus[s.id] = 'caught';
  }

  delete state.progress[s.id];

  state.activeChat = null;
  state.currentNode = null;
  state.pendingNext = null;
  state.busy = false;
  state.lostInChat = false;
  state.readOnly = false;

  if (state.money <= 0) { endGame(true); return; }

  const allDone = scammers.every(sc => state.chatStatus[sc.id] !== 'new');
  if (allDone) { endGame(false); return; }

  $('#chat-finished-banner').classList.add('d-none');
  renderList();
  updateHUD();
  showScreen('#screen-list');
}

function updateHUD() {
  if ($('#hud-money')) $('#hud-money').textContent = state.money;
  if ($('#hud-caught')) $('#hud-caught').textContent = state.caught;
  if ($('#hud-money2')) $('#hud-money2').textContent = state.money;
}

function endGame(failed) {
  if (state.finished) return;
  state.finished = true;
  showScreen('#screen-result');

  $('#final-caught').textContent = `${state.caught} / ${state.totalScammers}`;

  let profile;
  if (failed || state.caught === 0) profile = profiles[2];
  else if (state.caught >= state.totalScammers) profile = profiles[0];
  else profile = profiles[1];

  state.profile = profile;
  $('#rank').textContent = profile.rank;
  $('#advice').textContent = profile.advice;

  const prev = parseInt(localStorage.getItem('fraud_best') || '0', 10);
  if (state.caught > prev) localStorage.setItem('fraud_best', state.caught);
}

function shareResult() {
  const rank = (state.profile && state.profile.rank) ? state.profile.rank : 'Детектив';
  const caught = state.caught || 0;
  const total = state.totalScammers || 6;
  const text = `🕵️ Я прошёл «Битву с мошенником» и получил звание «${rank}»! Поймано: ${caught}/${total}. А ты сможешь?`;
  const url = window.location.href;
  const full = `${text}\n${url}`;

  // navigator.share crashes android chrome, so clipboard only
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(full)
      .then(() => alert('Результат скопирован! Вставь другу в чат.'))
      .catch(() => fallbackShare(full));
    return;
  }

  fallbackShare(full);
}

function fallbackShare(text) {
  window.prompt('Скопируй результат:', text);
}

function restart() {
  showScreen('#screen-start');
}