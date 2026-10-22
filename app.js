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
const $ = id => document.getElementById(id);

let playerName = "";
let current = 0;
let score = 0;
let lastEntry = null;
let timerInterval = null;
let timeLeft = TIME_PER_QUESTION;
let answered = false;
let totalTime = 0;
let questionStart = 0;

const fmtScore = (s, t) => `\u2066${s} / ${t}\u2069`;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

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

// Local check (this browser)
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

// Cloud check (any device)
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

// Higher percentage first, then faster time, then earlier date
function compareEntries(a, b) {
  const pa = a.score / a.total;
  const pb = b.score / b.total;
  if (pa !== pb) return pb - pa;
  const ta = a.timeMs ?? Infinity;
  const tb = b.timeMs ?? Infinity;
  if (ta !== tb) return ta < tb ? -1 : 1;
  return a.date - b.date;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.toggle("active", s.id === id);
  });
}

// Start
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
  current = 0;
  score = 0;
  totalTime = 0;
  $("name-error").textContent = "";
  $("player-label").textContent = `👤 ${playerName}`;
  showScreen("game-screen");
  showQuestion();
}

$("start-btn").addEventListener("click", startQuiz);
$("player-name").addEventListener("keydown", e => {
  if (e.key === "Enter") startQuiz();
});

// Timer
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

  // Observer reacts as time runs out
  if (timeLeft === 20) setCoach("focus", "ركّز، لا يزال أمامك وقت كافٍ.");
  if (timeLeft === 10) setCoach("worried", "بقي 10 ثوانٍ، خذ نفساً وقرر بهدوء.");
  if (timeLeft === 5) setCoach("anxious", "أسرع قليلاً! بقي القليل...");
  if (timeLeft === 3) setCoach("anxious", "بسرعة! اختر الآن!");
}

// Questions
function showQuestion() {
  answered = false;
  questionStart = Date.now();
  const item = questions[current];
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
  totalTime += TIME_PER_QUESTION * 1000;
  const item = questions[current];
  const buttons = $("options").querySelectorAll("button");
  buttons.forEach(b => (b.disabled = true));
  buttons[item.answer].classList.add("correct");
  $("feedback").textContent = `⏰ انقضى الوقت! الإجابة الصحيحة هي: ${item.options[item.answer]}`;
  setCoach("sad", "انتهى الوقت! لا تقلق، ركّز في السؤال القادم.");
  nextAfterDelay();
}

function choose(index, clickedBtn) {
  if (answered) return;
  answered = true;
  stopTimer();
  totalTime += Date.now() - questionStart;

  const item = questions[current];
  const buttons = $("options").querySelectorAll("button");
  buttons.forEach(b => (b.disabled = true));

  if (index === item.answer) {
    score++;
    clickedBtn.classList.add("correct");
    $("feedback").textContent = "✅ إجابة صحيحة!";
    setCoach("happy", pick(["أحسنت! استمر هكذا 👏", "ممتاز! إجابة صحيحة 🎯", "رائع! أنت تسير بثبات 💪"]));
  } else {
    clickedBtn.classList.add("wrong");
    buttons[item.answer].classList.add("correct");
    $("feedback").textContent = `❌ إجابة خاطئة! الصحيحة هي: ${item.options[item.answer]}`;
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

// End of quiz: save to the cloud, then show results
async function finishQuiz() {
  stopTimer();
  lastEntry = {
    name: playerName,
    nameKey: normalizeName(playerName),
    score: score,
    total: questions.length,
    timeMs: totalTime,
    date: Date.now()
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
      const q = window.query(
        window.collection(window.db, "leaderboard"),
        window.orderBy("score", "desc"),
        window.limit(100)
      );
      const snap = await window.getDocs(q);
      snap.forEach(d => list.push(d.data()));
    }
  } catch (e) {
    console.error("خطأ في جلب لوحة المتصدرين:", e);
  }

  // Make sure the player's own result is included even if the fetch missed it
  const hasMe = list.some(e => e.date === lastEntry.date && e.name === lastEntry.name);
  if (!hasMe) list.push(lastEntry);

  const sameQuiz = list.filter(e => e.total === questions.length);
  sameQuiz.sort(compareEntries);
  const rank = sameQuiz.findIndex(e => e.date === lastEntry.date && e.name === lastEntry.name) + 1;
  const top = sameQuiz.slice(0, 10);

  $("end-emoji").textContent = score === questions.length ? "🏆" : score >= 6 ? "🎉" : "💪";
  $("final-score").textContent = `${playerName}, ${fmtScore(score, questions.length)}`;
  $("my-rank").textContent = `ترتيبك: ${rank} من أصل ${sameQuiz.length} لاعب · الوقت: ${(totalTime / 1000).toFixed(1)}ثا`;

  renderWinner(top);
  renderPodium(top);
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
      ? fmtScore(entry.score, entry.total) + (entry.timeMs != null ? ` · ${(entry.timeMs / 1000).toFixed(1)}ثا` : "")
      : "";

    const bar = document.createElement("div");
    bar.className = "p-bar";
    bar.dataset.h = heights[rank];
    if (entry) {
      bar.textContent = medals[rank];
    } else {
      bar.classList.add("ghost");
    }

    pillar.append(name, pts, bar);
    podium.appendChild(pillar);
  });

  setTimeout(() => {
    podium.querySelectorAll(".p-bar").forEach(b => {
      b.style.height = b.dataset.h + "px";
    });
  }, 300);
}

// Live counter: updates automatically whenever anyone finishes a game
function listenPlayCount() {
  if (!window.db || !window.onSnapshot) {
    setTimeout(listenPlayCount, 300);
    return;
  }
  window.onSnapshot(window.collection(window.db, "leaderboard"), snap => {
    $("play-count").textContent = snap.size;
  });
}

// Play again
$("restart-btn").addEventListener("click", () => {
  $("player-name").value = "";
  $("name-error").textContent = "";
  $("player-name").focus();
  showScreen("start-screen");
});

window.addEventListener("load", listenPlayCount);