const questions = [
  { q: "مصطلح “الهندرة” (BPR) الذي يعتبر من أهم المتطلبات التنظيمية للإدارة الإلكترونية يعني:", options: ["شراء حواسيب وخوادم جديدة لجميع الأقسام.", "مكننة الإجراءات الإدارية كما هي دون تغيير.", "إعادة هندسة العمليات وتبسيط الإجراءات وحذف الخطوات الزائدة قبل رقمنتها.", "تغيير المدير العام والإدارة العليا للمؤسسة."], answer: 2 },
  { q: "ما هو التحدي الأكبر والأصعب الذي يواجه مشاريع الإدارة الإلكترونية من الجانب “البشري”؟", options: ["نقص الميزانية المخصصة لرواتب العمال.", "عدم توفر شبكة إنترنت سريعة في المنازل.", "صعوبة إيجاد مهندسي إعلام آلي.", "مقاومة التغيير والخوف من التكنولوجيا لدى الموظفين المعتادين على الورق."], answer: 3 },
  { q: "لتفادي مشكلة “الجزر المعلوماتية” (أنظمة وبرمجيات لا تتواصل مع بعضها بين الوزارات)، يجب الاعتماد على:", options: ["توحيد ألوان وتصميم المواقع الحكومية.", "فرض نظام عقوبات على الموظفين غير المتفاعلين.", "إرساء التوافق البيني (Interoperability) بين الإدارات.", "الاعتماد الكلي على الشبكات الاجتماعية للتواصل."], answer: 2 },
  { q: "ما هو التشريع الجزائري الذي يعطي للوثيقة الإلكترونية نفس الحجية القانونية للوثيقة الورقية التقليدية؟", options: ["قانون المالية لسنة 2010.", "القانون 15-04 المتعلق بالتوقيع والتصديق الإلكترونيين.", "قانون الوظيفة العمومية لعام 2006.", "قانون حماية المستهلك وقمع الغش."], answer: 1 },
  { q: "في أي سنة أطلق الصندوق الوطني للتأمينات الاجتماعية (CNAS) نظام بطاقة “الشفاء” بشكل رسمي؟", options: ["1999", "2002", "2007", "2012"], answer: 2 },
  { q: "أي من المنصات الرقمية التالية التابعة لـ (CNAS) موجهة خصيصاً لتسهيل عمل أرباب العمل (الشركات)؟", options: ["فضاء الهناء.", "بوابة الشفاء المفتوحة.", "المنصة الوطنية للعطل المرضية.", "بوابة التصريح عن بعد (Télé-déclaration)."], answer: 3 },
  { q: "تعتبر إستونيا رائدة عالمياً بفضل شبكتها اللامركزية التي تربط كل وزاراتها ومؤسساتها، وتسمى هذه الشبكة:", options: ["E-Estonia Network.", "X-Road.", "Baltic Data Center.", "Y-Connect."], answer: 1 },
  { q: "لضمان أقصى درجات الأمن والسرية للسجلات الطبية والمالية للمواطنين ومنع تزويرها، تعتمد إستونيا تقنية:", options: ["الذكاء الاصطناعي التوليدي (GenAI).", "الحوسبة الكمية (Quantum Computing).", "البلوكتشين (Blockchain) وتحديداً (KSI Blockchain).", "الميتافيرس الصحي (Health Metaverse)."], answer: 2 },
  { q: "في مراحل تطور الإدارة الإلكترونية، المرحلة التي تركز أساساً على إعطاء “تقارير دورية” للإدارة الوسطى تسمى:", options: ["نظم دعم القرار (DSS).", "نظم المعلومات الإدارية (MIS).", "المعالجة الآلية للبيانات (EDP).", "الإدارة المتكاملة عبر الإنترنت (Web-based Management)."], answer: 1 },
  { q: "أي من العبارات التالية يصف بدقة الفرق بين “الحكومة الإلكترونية” و“الحوكمة الإلكترونية”؟", options: ["هما مصطلحان مترادفان تماماً ولا يوجد فرق بينهما.", "الحكومة تستخدم الحواسيب، بينما الحوكمة تستخدم الهواتف الذكية.", "الحكومة هي تحويل الخدمة لخدمة رقمية، بينما الحوكمة هي استخدام التكنولوجيا لتعزيز الشفافية والمساءلة وإشراك المواطن.", "الحوكمة تسبق دائماً الحكومة في مراحل التطور التكنولوجي."], answer: 2 }
];

const TIME_PER_QUESTION = 30;
const PLAYED_KEY = "quickQuizPlayed";
const SOUND_KEY = "quickQuizSound";
const $ = id => document.getElementById(id);

let playerName = "";
let order = [];
let answers = [];       // { q: question index, c: chosen option (-1 = none), t: ms spent }
let current = 0;
let score = 0;
let points = 0;
let timerInterval = null;
let timeLeft = TIME_PER_QUESTION;
let answered = false;
let totalTime = 0;
let questionStart = 0;
let lastEntry = null;
let liveUnsub = null;
let reportList = [];
let reportStats = [];
let soundOn = localStorage.getItem(SOUND_KEY) !== "off";

const fmtScore = (s, t) => `\u2066${s} / ${t}\u2069`;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function currentItem() {
  return questions[order[current]];
}

function whenReady(fn) {
  if (window.db && window.getDocs && window.onSnapshot) fn();
  else setTimeout(() => whenReady(fn), 200);
}

// Sound (generated in the browser, no files needed)
let audioCtx = null;
function tone(freq, dur, type = "sine", vol = 0.12, delay = 0) {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  } catch (e) {}
}

const sfx = {
  correct: () => { tone(660, 0.12, "sine", 0.15); tone(880, 0.2, "sine", 0.15, 0.1); },
  wrong: () => tone(200, 0.35, "sawtooth", 0.07),
  tick: () => tone(950, 0.07, "square", 0.04),
  finish: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.28, "triangle", 0.14, i * 0.13)),
  badge: () => [880, 1175].forEach((f, i) => tone(f, 0.18, "triangle", 0.12, i * 0.09))
};

// Soft background music (generated in the browser, no files needed)
const MUSIC_VOLUME = 0.06; // quiet; raise slightly if you want it louder (0 to 1)
const MUSIC_BEAT = 1.6;
const MUSIC_CHORDS = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 392.0],  // Am7
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [196.0, 246.94, 293.66, 349.23]  // G7
];
let musicGain = null;
let musicTimer = null;
let musicChord = 0;
let musicNote = 0;

function musicNoteOn(freq, when, dur, vol) {
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.4);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(g).connect(musicGain);
  osc.start(when);
  osc.stop(when + dur + 0.1);
}

function musicStep() {
  const when = audioCtx.currentTime + 0.05;
  const chord = MUSIC_CHORDS[musicChord];
  if (musicNote === 0) musicNoteOn(chord[0] / 2, when, MUSIC_BEAT * 4, 0.5);
  musicNoteOn(chord[musicNote % chord.length] * 2, when, MUSIC_BEAT * 2.2, 0.35);
  musicNote++;
  if (musicNote >= 4) {
    musicNote = 0;
    musicChord = (musicChord + 1) % MUSIC_CHORDS.length;
  }
}

function startMusic() {
  if (musicTimer) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    musicGain = audioCtx.createGain();
    musicGain.gain.value = soundOn ? MUSIC_VOLUME : 0;
    musicGain.connect(audioCtx.destination);
    musicStep();
    musicTimer = setInterval(musicStep, MUSIC_BEAT * 1000);
  } catch (e) {
    console.error("تعذر تشغيل الموسيقى:", e);
  }
}

function applyMusicVolume() {
  if (musicGain) musicGain.gain.setTargetAtTime(soundOn ? MUSIC_VOLUME : 0, audioCtx.currentTime, 0.2);
}

$("sound-btn").textContent = soundOn ? "🔊" : "🔇";
$("sound-btn").addEventListener("click", () => {
  soundOn = !soundOn;
  localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off");
  $("sound-btn").textContent = soundOn ? "🔊" : "🔇";
  applyMusicVolume();
});

// Points: 100 for a correct answer, plus 10 for every second left
function pointsFor(spentMs) {
  const remaining = Math.max(0, TIME_PER_QUESTION - spentMs / 1000);
  return 100 + Math.round(remaining * 10);
}

// Older entries have no points field, so estimate them from the score
const getPoints = e => (e.points != null ? e.points : (e.score || 0) * 100);

function compareEntries(a, b) {
  const pa = getPoints(a), pb = getPoints(b);
  if (pa !== pb) return pb - pa;
  const ta = a.timeMs ?? Infinity, tb = b.timeMs ?? Infinity;
  if (ta !== tb) return ta < tb ? -1 : 1;
  return a.date - b.date;
}

// Observer
const COACH_FACES = { calm: "😊", focus: "🧐", worried: "😟", anxious: "😰", happy: "😄", sad: "😕" };
const COACH_TIPS = [
  "لا تتوتر، ركّز على السؤال جيداً.",
  "اقرأ جميع الخيارات قبل أن تجيب.",
  "خذ نفساً عميقاً، أنت تعرف الإجابة!",
  "استبعد الخيارات الخاطئة أولاً.",
  "ثق بإجابتك الأولى غالباً.",
  "الوقت يكفيك، لا تستعجل."
];

function setCoach(mood, msg) {
  $("coach").className = `card coach-card mood-${mood}`;
  $("coach-face").textContent = COACH_FACES[mood];
  $("coach-msg").textContent = msg;
}

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function hasPlayed(name) {
  try {
    const list = JSON.parse(localStorage.getItem(PLAYED_KEY)) || [];
    return list.includes(normalizeName(name));
  } catch (e) {
    return false;
  }
}

function markPlayed(name) {
  try {
    const list = JSON.parse(localStorage.getItem(PLAYED_KEY)) || [];
    const key = normalizeName(name);
    if (!list.includes(key)) {
      list.push(key);
      localStorage.setItem(PLAYED_KEY, JSON.stringify(list));
    }
  } catch (e) {}
}

async function alreadyPlayedInCloud(name) {
  if (!window.db) return false;
  try {
    const q = window.query(
      window.collection(window.db, "leaderboard"),
      window.where("nameKey", "==", normalizeName(name))
    );
    const snap = await window.getDocs(q);
    return !snap.empty;
  } catch (e) {
    console.error("خطأ في التحقق من الأسماء:", e);
    return false;
  }
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.toggle("active", s.id === id);
  });
}

// Live standings shown during the quiz
function startLiveLeader() {
  whenReady(() => {
    if (liveUnsub) return;
    liveUnsub = window.onSnapshot(window.collection(window.db, "leaderboard"), snap => {
      const list = [];
      snap.forEach(d => list.push(d.data()));
      const same = list.filter(e => e.total === questions.length).sort(compareEntries);
      const top = same[0];
      $("live-leader").textContent = top
        ? `🏅 المتصدر الحالي: ${top.name} · ${getPoints(top)} نقطة`
        : "🏅 لم يلعب أحد بعد، كن الأول!";
    });
  });
}

function stopLiveLeader() {
  if (liveUnsub) {
    liveUnsub();
    liveUnsub = null;
  }
}

async function startQuiz() {
  const name = $("player-name").value.trim();
  if (name === "") {
    $("name-error").textContent = "الرجاء كتابة اسمك أولاً.";
    $("player-name").focus();
    return;
  }

  $("start-btn").disabled = true;
  $("name-error").textContent = "جارٍ التحقق من الاسم...";
  const played = hasPlayed(name) || await alreadyPlayedInCloud(name);
  $("start-btn").disabled = false;

  if (played) {
    $("name-error").textContent = "هذا الاسم لعب بالفعل. يمكن لكل لاعب اللعب مرة واحدة فقط.";
    $("player-name").focus();
    return;
  }

  playerName = name;
  markPlayed(name);
  order = shuffle(questions.map((_, i) => i));
  answers = [];
  current = 0;
  score = 0;
  points = 0;
  totalTime = 0;
  $("name-error").textContent = "";
  $("player-label").textContent = `👤 ${playerName}`;
  $("points-now").textContent = "⭐ 0";
  startMusic();
  showScreen("game-screen");
  showQuestion();
  startLiveLeader();
}

$("start-btn").addEventListener("click", startQuiz);
$("player-name").addEventListener("keydown", e => {
  if (e.key === "Enter") startQuiz();
});

function startTimer() {
  stopTimer();
  timeLeft = TIME_PER_QUESTION;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      stopTimer();
      timeUp();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  const t = $("timer");
  t.textContent = timeLeft;
  t.classList.toggle("warn", timeLeft <= 3);

  if (timeLeft <= 3 && timeLeft > 0) sfx.tick();
  if (timeLeft === 20) setCoach("focus", "ركّز، لا يزال أمامك وقت كافٍ.");
  if (timeLeft === 10) setCoach("worried", "بقي 10 ثوانٍ، خذ نفساً وقرر بهدوء.");
  if (timeLeft === 5) setCoach("anxious", "أسرع قليلاً! بقي القليل...");
  if (timeLeft === 3) setCoach("anxious", "بسرعة! اختر الآن!");
}

function showQuestion() {
  answered = false;
  questionStart = Date.now();
  const item = currentItem();
  $("progress").textContent = `${current + 1} / ${questions.length}`;
  $("progress-fill").style.width = `${(current / questions.length) * 100}%`;
  $("question").textContent = item.q;
  $("feedback").textContent = "";
  $("options").innerHTML = "";

  item.options.forEach((text, index) => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = text;
    btn.addEventListener("click", () => choose(index, btn));
    $("options").appendChild(btn);
  });

  setCoach("calm", pick(COACH_TIPS));
  startTimer();
}

function timeUp() {
  if (answered) return;
  answered = true;
  const spent = TIME_PER_QUESTION * 1000;
  totalTime += spent;
  answers.push({ q: order[current], c: -1, t: spent });

  const item = currentItem();
  const buttons = $("options").querySelectorAll("button");
  buttons.forEach(b => (b.disabled = true));
  buttons[item.answer].classList.add("correct");
  $("feedback").textContent = `⏰ انقضى الوقت! الإجابة الصحيحة هي: ${item.options[item.answer]}`;
  setCoach("sad", "انتهى الوقت! لا تقلق، ركّز في السؤال القادم.");
  sfx.wrong();
  nextAfterDelay();
}

function choose(index, clickedBtn) {
  if (answered) return;
  answered = true;
  stopTimer();
  const spent = Date.now() - questionStart;
  totalTime += spent;
  answers.push({ q: order[current], c: index, t: spent });

  const item = currentItem();
  const buttons = $("options").querySelectorAll("button");
  buttons.forEach(b => (b.disabled = true));

  if (index === item.answer) {
    const gained = pointsFor(spent);
    points += gained;
    score++;
    clickedBtn.classList.add("correct");
    $("feedback").textContent = `✅ إجابة صحيحة! +${gained} نقطة`;
    $("points-now").textContent = `⭐ ${points}`;
    sfx.correct();
    setCoach("happy", pick(["أحسنت! استمر هكذا 👏", "ممتاز! إجابة صحيحة 🎯", "رائع! أنت تسير بثبات 💪"]));
  } else {
    clickedBtn.classList.add("wrong");
    buttons[item.answer].classList.add("correct");
    $("feedback").textContent = `❌ إجابة خاطئة! الصحيحة هي: ${item.options[item.answer]}`;
    sfx.wrong();
    setCoach("sad", pick(["لا بأس، ركّز في السؤال القادم 💪", "ليس هذه المرة، لكن لا تستسلم!"]));
  }

  nextAfterDelay();
}

function nextAfterDelay() {
  setTimeout(() => {
    current++;
    if (current < questions.length) {
      showQuestion();
    } else {
      finishQuiz();
    }
  }, 1300);
}

async function finishQuiz() {
  stopTimer();
  stopLiveLeader();
  sfx.finish();

  lastEntry = {
    name: playerName,
    nameKey: normalizeName(playerName),
    score: score,
    total: questions.length,
    points: points,
    timeMs: totalTime,
    date: Date.now(),
    answers: answers
  };

  try {
    if (window.db) {
      await window.addDoc(window.collection(window.db, "leaderboard"), lastEntry);
    }
  } catch (e) {
    console.error("خطأ في حفظ النتيجة بالسحابة:", e);
  }

  await loadAndRenderLeaderboard();
  showScreen("end-screen");
}

async function loadAndRenderLeaderboard() {
  let list = [];
  try {
    if (window.db) {
      const snap = await window.getDocs(window.collection(window.db, "leaderboard"));
      snap.forEach(d => list.push(d.data()));
    }
  } catch (e) {
    console.error("خطأ في جلب لوحة المتصدرين:", e);
  }

  const hasMe = list.some(e => e.date === lastEntry.date && e.name === lastEntry.name);
  if (!hasMe) list.push(lastEntry);

  const sameQuiz = list.filter(e => e.total === questions.length).sort(compareEntries);
  const rank = sameQuiz.findIndex(e => e.date === lastEntry.date && e.name === lastEntry.name) + 1;
  const top = sameQuiz.slice(0, 10);

  $("end-emoji").textContent = score === questions.length ? "🏆" : score >= 6 ? "🎉" : "💪";
  $("final-score").textContent = `${playerName} · ${points} نقطة`;
  $("my-rank").textContent = `ترتيبك: ${rank} من أصل ${sameQuiz.length} · ${fmtScore(score, questions.length)} · الوقت ${(totalTime / 1000).toFixed(1)}ثا`;

  renderBadges(sameQuiz);
  renderWinner(top);
  renderPodium(top);
  renderPlayersList(sameQuiz);
}

// All players with their ranks (shown to the right of the podium)
function renderPlayersList(list) {
  const ul = $("players-list");
  ul.innerHTML = "";
  if (list.length === 0) {
    const li = document.createElement("li");
    li.textContent = "لا يوجد لاعبون بعد";
    ul.appendChild(li);
    return;
  }
  const medals = ["🥇", "🥈", "🥉"];
  list.forEach((entry, i) => {
    const li = document.createElement("li");
    if (entry.date === lastEntry.date && entry.name === lastEntry.name) li.classList.add("me");

    const r = document.createElement("span");
    r.className = "pl-rank";
    r.textContent = i < 3 ? medals[i] : `#${i + 1}`;

    const n = document.createElement("span");
    n.className = "pl-name";
    n.textContent = entry.name;

    const s = document.createElement("span");
    s.className = "pl-score";
    s.textContent = `${getPoints(entry)} نقطة`;

    li.append(r, n, s);
    ul.appendChild(li);
  });
}

// Badges: perfect score, streak, and fastest correct answer per question
function renderBadges(list) {
  const box = $("badges");
  box.innerHTML = "";
  const badges = [];

  if (score === questions.length) badges.push("🎯 دقة كاملة");

  let best = 0, run = 0;
  answers.forEach(a => {
    if (a.c === questions[a.q].answer) { run++; best = Math.max(best, run); }
    else run = 0;
  });
  if (best >= 3) badges.push(`🔥 سلسلة ${best} إجابات صحيحة متتالية`);

  const fastest = {};
  list.forEach(e => (e.answers || []).forEach(a => {
    if (a.c !== questions[a.q].answer) return;
    const cur = fastest[a.q];
    if (!cur || a.t < cur.t) fastest[a.q] = { t: a.t, name: e.name };
  }));
  answers.forEach(a => {
    const f = fastest[a.q];
    if (a.c === questions[a.q].answer && f && f.t === a.t && f.name === playerName) {
      badges.push(`⚡ أسرع إجابة في السؤال ${a.q + 1}`);
    }
  });

  if (badges.length === 0) {
    const none = document.createElement("span");
    none.className = "badge muted";
    none.textContent = "شاركت في المسابقة، والمرة القادمة ستكون أفضل!";
    box.appendChild(none);
    return;
  }

  badges.forEach(text => {
    const s = document.createElement("span");
    s.className = "badge";
    s.textContent = text;
    box.appendChild(s);
  });
  sfx.badge();
}

function renderWinner(list) {
  const msg = $("winner-msg");
  const champ = list[0];
  if (!champ) {
    msg.textContent = "";
    return;
  }
  if (champ.name === playerName && champ.date === lastEntry.date) {
    msg.textContent = `🎉 مبروك يا ${champ.name}! أنت بطل الصدارة حالياً!`;
  } else {
    msg.textContent = `🎉 مبروك للاعب ${champ.name} تصدره القائمة!`;
  }
}

function renderPodium(list) {
  const podium = $("podium");
  podium.innerHTML = "";
  const top = list.slice(0, 3);
  const order = [1, 0, 2];
  const heights = [190, 140, 105];
  const medals = ["🥇", "🥈", "🥉"];

  order.forEach(rank => {
    const entry = top[rank];

    const pillar = document.createElement("div");
    pillar.className = `pillar rank-${rank + 1}`;

    const name = document.createElement("div");
    name.className = "p-name";
    name.textContent = entry ? entry.name : "—";

    const pts = document.createElement("div");
    pts.className = "p-score";
    pts.textContent = entry
      ? `${getPoints(entry)} نقطة` + (entry.timeMs != null ? ` · ${(entry.timeMs / 1000).toFixed(1)}ثا` : "")
      : "";

    const bar = document.createElement("div");
    bar.className = "p-bar";
    bar.dataset.h = heights[rank];
    bar.textContent = entry ? medals[rank] : "";
    if (!entry) bar.classList.add("ghost");

    pillar.append(name, pts, bar);
    podium.appendChild(pillar);
  });

  setTimeout(() => {
    podium.querySelectorAll(".p-bar").forEach(b => {
      b.style.height = b.dataset.h + "px";
    });
  }, 300);
}

function renderReview() {
  const list = $("review-list");
  list.innerHTML = "";
  $("review-summary").textContent = `أجبت بشكل صحيح على ${score} من ${questions.length} أسئلة، والنقاط ${points}`;

  answers.forEach((a, i) => {
    const item = questions[a.q];
    const ok = a.c === item.answer;

    const box = document.createElement("div");
    box.className = `review-item ${ok ? "ok" : "bad"}`;

    const q = document.createElement("div");
    q.className = "review-q";
    q.textContent = `${ok ? "✅" : "❌"} ${i + 1}. ${item.q}`;
    box.appendChild(q);

    const mine = document.createElement("div");
    mine.className = "review-line";
    mine.textContent = a.c === -1
      ? "إجابتك: لم تجب (انتهى الوقت)"
      : `إجابتك: ${item.options[a.c]}`;
    box.appendChild(mine);

    if (!ok) {
      const right = document.createElement("div");
      right.className = "review-line right";
      right.textContent = `الإجابة الصحيحة: ${item.options[item.answer]}`;
      box.appendChild(right);
    }

    list.appendChild(box);
  });
}

$("review-btn").addEventListener("click", () => {
  renderReview();
  showScreen("review-screen");
});

$("back-btn").addEventListener("click", () => showScreen("end-screen"));

function resetToStart() {
  stopLiveLeader();
  $("player-name").value = "";
  $("name-error").textContent = "";
  $("player-name").focus();
  showScreen("start-screen");
}

$("restart-btn").addEventListener("click", resetToStart);
$("restart-btn-2").addEventListener("click", resetToStart);

// Teacher report
async function openReport() {
  showScreen("report-screen");
  const body = $("report-body");
  body.textContent = "جارٍ تحميل النتائج...";

  try {
    const snap = await window.getDocs(window.collection(window.db, "leaderboard"));
    reportList = [];
    snap.forEach(d => reportList.push(d.data()));
  } catch (e) {
    body.textContent = "تعذّر تحميل النتائج.";
    return;
  }

  reportList = reportList.filter(e => e.total === questions.length).sort(compareEntries);

  reportStats = questions.map(() => ({ right: 0, total: 0 }));
  reportList.forEach(e => (e.answers || []).forEach(a => {
    if (!reportStats[a.q]) return;
    if (a.c === -1) return;
    reportStats[a.q].total++;
    if (a.c === questions[a.q].answer) reportStats[a.q].right++;
  }));

  const rows = reportList.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(e.name)}</td>
      <td>${e.score} / ${e.total}</td>
      <td>${getPoints(e)}</td>
      <td>${((e.timeMs || 0) / 1000).toFixed(1)}ث</td>
      <td>${new Date(e.date).toLocaleString("ar-DZ")}</td>
    </tr>`).join("");

  const qRows = reportStats.map((s, i) => {
    const pct = s.total ? Math.round((s.right / s.total) * 100) : null;
    return `<div class="q-stat"><span>السؤال ${i + 1}</span><span>${pct === null ? "—" : pct + "%"}</span></div>`;
  }).join("");

  body.innerHTML = `
    <p class="subtitle">عدد المشاركين: ${reportList.length}</p>
    <div class="table-wrap">
      <table class="report-table">
        <thead><tr><th>#</th><th>الاسم</th><th>النتيجة</th><th>النقاط</th><th>الوقت</th><th>التاريخ</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6">لا توجد نتائج بعد</td></tr>'}</tbody>
      </table>
    </div>
    <h3 class="section-title">نسبة الإجابة الصحيحة لكل سؤال</h3>
    <div class="q-stats">${qRows}</div>`;
}

function downloadCsv() {
  const header = ["الترتيب", "الاسم", "النتيجة", "النقاط", "الوقت (ثانية)", "التاريخ", ...questions.map((_, i) => `س${i + 1}`)];

  const rows = reportList.map((e, idx) => [
    idx + 1,
    e.name,
    `${e.score}/${e.total}`,
    getPoints(e),
    ((e.timeMs || 0) / 1000).toFixed(1),
    new Date(e.date).toLocaleString("ar-DZ"),
    ...questions.map((_, i) => {
      const a = (e.answers || []).find(x => x.q === i);
      if (!a || a.c === -1) return "—";
      return a.c === questions[i].answer ? "✓" : "✗";
    })
  ]);

  const footer = ["", "", "", "", "", "نسبة الإجابة الصحيحة",
    ...reportStats.map(s => (s.total ? Math.round((s.right / s.total) * 100) + "%" : "—"))];

  const csv = [header, ...rows, footer]
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "تقرير_الاختبار.csv";
  link.click();
  URL.revokeObjectURL(url);
}

$("csv-btn").addEventListener("click", downloadCsv);
$("report-back").addEventListener("click", () => showScreen("start-screen"));

// Live counter on the start screen
function listenPlayCount() {
  whenReady(() => {
    window.onSnapshot(window.collection(window.db, "leaderboard"), snap => {
      $("play-count").textContent = snap.size;
    });
  });
}

window.addEventListener("load", () => {
  listenPlayCount();
  if (new URLSearchParams(location.search).has("report")) {
    whenReady(openReport);
  }
});