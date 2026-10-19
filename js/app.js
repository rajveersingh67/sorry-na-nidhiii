(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = $('#toast');
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function releaseHearts(amount = 18) {
    const layer = $('#heart-layer');
    const icons = ['💗', '💖', '💕', '🌸', '✨'];
    for (let i = 0; i < amount; i++) {
      const heart = document.createElement('span');
      heart.className = 'burst-heart';
      heart.textContent = icons[Math.floor(Math.random() * icons.length)];
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.setProperty('--drift', `${Math.round(Math.random() * 180 - 90)}px`);
      heart.style.setProperty('--duration', `${2.2 + Math.random() * 2}s`);
      heart.style.setProperty('--size', `${15 + Math.random() * 17}px`);
      layer.appendChild(heart);
      setTimeout(() => heart.remove(), 4500);
    }
  }

  // Navigation and page progress.
  const menu = $('#main-nav');
  $('#menu-toggle').addEventListener('click', (event) => {
    const open = menu.classList.toggle('open');
    event.currentTarget.setAttribute('aria-expanded', String(open));
    event.currentTarget.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('#main-nav a').forEach((link) => link.addEventListener('click', () => {
    menu.classList.remove('open');
    $('#menu-toggle').setAttribute('aria-expanded', 'false');
  }));
  const updatePageProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0;
    $('#reading-progress-fill').style.width = `${pct}%`;
    $('#reading-progress').setAttribute('aria-valuenow', String(Math.round(pct)));
    $('.home-float').classList.toggle('visible', window.scrollY > 420);
  };
  window.addEventListener('scroll', updatePageProgress, { passive: true });
  window.addEventListener('resize', updatePageProgress);
  updatePageProgress();

  // Letter envelope and its additional note.
  const envelope = $('#envelope');
  const letter = $('#letter-paper');
  const apologyLine = 'I’m sorry for the way I hurt you.';
  let typingTimer;
  function typeApology() {
    clearInterval(typingTimer);
    const line = $('#typewriter-line');
    line.textContent = '';
    let position = 0;
    typingTimer = setInterval(() => {
      line.textContent += apologyLine[position++] || '';
      if (position > apologyLine.length) clearInterval(typingTimer);
    }, 32);
  }
  function setLetter(open) {
    envelope.classList.toggle('open', open);
    envelope.setAttribute('aria-expanded', String(open));
    letter.classList.toggle('open', open);
    letter.setAttribute('aria-hidden', String(!open));
    if (open) typeApology();
    else clearInterval(typingTimer);
  }
  envelope.addEventListener('click', () => setLetter(!letter.classList.contains('open')));
  $('#letter-close').addEventListener('click', () => setLetter(false));
  $('#hidden-letter-button').addEventListener('click', (event) => {
    const note = $('#hidden-letter-note');
    note.hidden = !note.hidden;
    event.currentTarget.textContent = note.hidden ? 'There’s one more little note… ♡' : 'Tuck away the little note ↑';
  });

  // Uthak-baithak counter: bounded to 0–100.
  let repetitions = 0;
  let celebrated = false;
  const repMessages = [
    'Nidhi please maaf kar do na 😭',
    'Kaan pakad liye, ab toh maan jao 🥹',
    'Ek aur uthak-baithak sirf tumhare liye 😂❤️',
    'Meri taangein bhi sorry bol rahi hain 😭',
    'Main sununga, promise. Abhi bas squat kar raha hoon 🙏',
    'Uff, apology cardio is no joke 😮‍💨'
  ];
  function renderReps() {
    const remaining = 100 - repetitions;
    $('#rep-count').textContent = repetitions;
    $('#rep-remaining').textContent = `${remaining} left`;
    $('#rep-percent').textContent = `${repetitions}%`;
    $('#rep-fill').style.width = `${repetitions}%`;
    $('.challenge-section .progress-track').setAttribute('aria-valuenow', String(repetitions));
    if (repetitions === 100) {
      $('#rep-message').textContent = '100 COMPLETE! PLEASE FORGIVE ME 💗🎉 (only if and when you feel ready)';
      if (!celebrated) {
        celebrated = true;
        releaseHearts(55);
        showToast('Challenge complete! A tiny celebration for you 💗');
      }
    } else if (repetitions === 0) {
      $('#rep-message').textContent = 'Ready when you are… meri taangein thodi nervous hain 😭';
    } else {
      $('#rep-message').textContent = repetitions === 50
        ? '50 ho gayi! Meri taangein bhi sorry bol rahi hain 😂'
        : repMessages[(repetitions - 1) % repMessages.length];
    }
    const art = $('.challenge-art');
    art.classList.add('squat');
    setTimeout(() => art.classList.remove('squat'), 260);
  }
  $('#add-rep').addEventListener('click', () => {
    if (repetitions < 100) repetitions++;
    renderReps();
  });
  $('#minus-rep').addEventListener('click', () => {
    if (repetitions > 0) repetitions--;
    if (repetitions < 100) celebrated = false;
    renderReps();
  });
  $('#reset-reps').addEventListener('click', () => {
    repetitions = 0;
    celebrated = false;
    renderReps();
    showToast('Challenge reset. No pressure, okay? 💗');
  });

  // Three separate, restartable mini-games.
  $$('.game-tab').forEach((tab) => tab.addEventListener('click', () => {
    $$('.game-tab').forEach((item) => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    $$('.game-panel').forEach((panel) => {
      const active = panel.id === tab.dataset.game;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
  }));

  let catchTimerId;
  let heartSpawnId;
  let catchScore = 0;
  let catchSeconds = 30;
  let catchRunning = false;
  function finishCatch(message) {
    if (!catchRunning) return;
    catchRunning = false;
    clearInterval(catchTimerId);
    clearInterval(heartSpawnId);
    $$('.falling-heart', $('#catch-board')).forEach((heart) => heart.remove());
    $('#catch-prompt').textContent = message.includes('Lovely') ? 'You caught the lot! 💗' : 'Time’s up! The hearts are still yours. 💕';
    $('#catch-result').textContent = `${message} I’m sorry, and I’m here to listen whenever you’re ready.`;
    if (message.includes('Lovely')) {
      releaseHearts(24);
      showToast('Ten hearts caught! A tiny celebration for you 💗');
    }
    $('#catch-start').disabled = false;
    $('#catch-start').textContent = 'Play again ↻';
  }
  function spawnHeart() {
    if (!catchRunning) return;
    const board = $('#catch-board');
    const heart = document.createElement('button');
    heart.className = 'falling-heart';
    heart.type = 'button';
    heart.setAttribute('aria-label', 'Catch a heart');
    heart.textContent = ['💗', '💖', '💕', '💘'][Math.floor(Math.random() * 4)];
    heart.style.left = `${5 + Math.random() * 85}%`;
    heart.style.setProperty('--fall-time', `${2.1 + Math.random() * 1.4}s`);
    heart.addEventListener('click', () => {
      if (!catchRunning) return;
      catchScore++;
      $('#catch-score').textContent = catchScore;
      heart.remove();
      if (catchScore >= 10) finishCatch('Lovely catching! You collected 10 hearts! 💗');
    });
    board.appendChild(heart);
    setTimeout(() => heart.remove(), 3700);
  }
  $('#catch-start').addEventListener('click', () => {
    clearInterval(catchTimerId);
    clearInterval(heartSpawnId);
    $$('.falling-heart', $('#catch-board')).forEach((heart) => heart.remove());
    catchScore = 0;
    catchSeconds = 30;
    catchRunning = true;
    $('#catch-score').textContent = '0';
    $('#catch-timer').textContent = '30';
    $('#catch-result').textContent = '';
    $('#catch-prompt').textContent = 'Tap the hearts!';
    $('#catch-start').disabled = true;
    $('#catch-start').textContent = 'Catching…';
    spawnHeart();
    heartSpawnId = setInterval(spawnHeart, 700);
    catchTimerId = setInterval(() => {
      catchSeconds--;
      $('#catch-timer').textContent = String(catchSeconds);
      if (catchSeconds <= 0) finishCatch(catchScore >= 10 ? 'Lovely! You reached the target!' : `You caught ${catchScore} hearts!`);
    }, 1000);
  });

  const decoys = ['🌷', '🧸', '🎀', '✨', '🌼', '🍓', '⭐', '🍬'];
  let foundCount = 0;
  let findMoves = 0;
  function shuffle(items) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  function resetFindGame() {
    foundCount = 0;
    findMoves = 0;
    $('#find-score').textContent = '0';
    $('#find-moves').textContent = '0';
    $('#find-result').textContent = '';
    const items = shuffle(['💗', '💗', '💗', '💗', ...decoys]);
    const grid = $('#find-grid');
    grid.replaceChildren();
    items.forEach((item) => {
      const card = document.createElement('button');
      card.className = 'find-card';
      card.type = 'button';
      card.textContent = '？';
      card.setAttribute('aria-label', 'Hidden object');
      card.dataset.item = item;
      card.addEventListener('click', () => {
        if (card.disabled || foundCount === 4) return;
        findMoves++;
        $('#find-moves').textContent = findMoves;
        card.textContent = item;
        card.disabled = true;
        card.setAttribute('aria-label', item === '💗' ? 'Found a heart' : `Found ${item}`);
        if (item === '💗') {
          foundCount++;
          card.classList.add('found');
          $('#find-score').textContent = foundCount;
          if (foundCount === 4) {
            $('#find-result').textContent = 'You found all the hearts! Here’s one more from me 💗';
            releaseHearts(16);
          }
        } else {
          card.classList.add('decoy');
        }
      });
      grid.appendChild(card);
    });
  }
  $('#find-reset').addEventListener('click', resetFindGame);
  resetFindGame();

  const answer = ['heart', 'star', 'flower'];
  let chosenSymbols = [];
  function renderSequence() {
    $('#sequence-readout').innerHTML = `Your sequence: <span>${chosenSymbols.map((value) => ({ heart: '💗', star: '⭐', flower: '🌸' })[value]).join(' ') || '…'}</span>`;
  }
  function resetUnlock() {
    chosenSymbols = [];
    renderSequence();
    $('#unlock-result').textContent = '';
    $('#secret-reveal').hidden = true;
  }
  $$('.symbol-pad button').forEach((button) => button.addEventListener('click', () => {
    if ($('#secret-reveal').hidden === false) return;
    chosenSymbols.push(button.dataset.symbol);
    renderSequence();
    const correctSoFar = chosenSymbols.every((symbol, index) => symbol === answer[index]);
    if (!correctSoFar) {
      $('#unlock-result').textContent = 'Almost! The order is heart → star → flower. Try again 💗';
      chosenSymbols = [];
      setTimeout(renderSequence, 700);
      return;
    }
    if (chosenSymbols.length === answer.length) {
      $('#unlock-result').textContent = 'Unlocked with care ✨';
      $('#secret-reveal').hidden = false;
      releaseHearts(22);
    }
  }));
  $('#unlock-reset').addEventListener('click', resetUnlock);

  // Local audio file player: never autoplay, never upload.
  const audio = $('#audio-player');
  let currentObjectUrl = null;
  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }
  $('#audio-file').addEventListener('change', (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = URL.createObjectURL(file);
    audio.src = currentObjectUrl;
    audio.load();
    $('#track-title').textContent = file.name.replace(/\.[^.]+$/, '');
    $('#track-state').textContent = 'ready when you are';
    $('#music-note').textContent = 'Song loaded locally. Press play whenever you want.';
    $('#play-audio').disabled = false;
    $('#audio-progress').disabled = false;
  });
  $('#play-audio').addEventListener('click', async () => {
    if (!audio.src) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        $('#track-state').textContent = 'Could not play this audio format';
        showToast('This audio file could not be played in this browser.');
      }
    } else {
      audio.pause();
    }
  });
  audio.addEventListener('play', () => {
    $('#play-audio').textContent = 'Ⅱ';
    $('#play-audio').setAttribute('aria-label', 'Pause selected song');
    $('#vinyl').classList.add('playing');
    $('#track-state').textContent = 'now playing';
  });
  audio.addEventListener('pause', () => {
    $('#play-audio').textContent = '▶';
    $('#play-audio').setAttribute('aria-label', 'Play selected song');
    $('#vinyl').classList.remove('playing');
    if (audio.src && audio.currentTime < audio.duration) $('#track-state').textContent = 'paused';
  });
  audio.addEventListener('loadedmetadata', () => {
    $('#audio-duration').textContent = formatTime(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    $('#audio-current').textContent = formatTime(audio.currentTime);
    $('#audio-duration').textContent = formatTime(audio.duration);
    $('#audio-progress').value = audio.duration ? String(audio.currentTime / audio.duration * 100) : '0';
  });
  audio.addEventListener('ended', () => { $('#track-state').textContent = 'that was lovely'; });
  $('#audio-progress').addEventListener('input', (event) => {
    if (audio.duration) audio.currentTime = Number(event.currentTarget.value) / 100 * audio.duration;
  });
  $('#mute-audio').addEventListener('click', (event) => {
    audio.muted = !audio.muted;
    event.currentTarget.textContent = audio.muted ? '♫̸' : '♫';
    event.currentTarget.setAttribute('aria-label', audio.muted ? 'Unmute song' : 'Mute song');
  });

  // Sticker shelf and surprises.
  $$('.sticker-card').forEach((card) => card.addEventListener('click', () => {
    $('#sticker-response').textContent = card.dataset.message;
    showToast(`${card.dataset.sticker} ${card.dataset.message}`);
  }));
  $('#gift-box').addEventListener('click', (event) => {
    const opened = event.currentTarget.classList.toggle('open');
    event.currentTarget.setAttribute('aria-expanded', String(opened));
    $('#gift-title').textContent = opened ? 'Your surprise: one soft reminder' : 'A tiny surprise';
    $('#gift-copy').textContent = opened ? 'You deserve patience, respect, and a sincere apology. Take all the time you need. 💗' : 'Tap the gift to peek inside.';
    if (opened) releaseHearts(18);
  });
  $('#photo-reveal').addEventListener('click', (event) => {
    const revealed = event.currentTarget.classList.toggle('revealed');
    event.currentTarget.setAttribute('aria-expanded', String(revealed));
  });
  $('#virtual-hug').addEventListener('click', () => {
    releaseHearts(20);
    showToast('Sending a gentle, no-pressure hug 🤗💗');
  });
  $('#heart-rain').addEventListener('click', () => {
    releaseHearts(42);
    showToast('A little shower of hearts, with care 💕');
  });
  $('#header-heart').addEventListener('click', () => {
    releaseHearts(13);
    showToast('A little heart, just for you 💗');
  });
  $('#final-hearts').addEventListener('click', () => {
    releaseHearts(50);
    showToast('One last shower, sent with care 💖');
  });

  // Responsive, keyboard-friendly photo viewer.
  const lightbox = $('#lightbox');
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }
  $$('.scrap-card').forEach((card) => card.addEventListener('click', () => {
    const image = $('#lightbox-img');
    image.src = card.dataset.img;
    image.alt = $('img', card).alt;
    $('#lightbox-caption').textContent = card.dataset.caption;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    $('#lightbox-close').focus();
  }));
  $('#lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });
})();
