/* Admin features: edit questions + finale names, view winner without playing.
   Loaded after app.js (uses its globals: questions, showScreen, loadAndRenderLeaderboard, ...). */
(function () {
  const $a = id => document.getElementById(id);
  const DEFAULT_FINALE = ["عدلان", "رحمون"];
  let isAdmin = false;
  let finaleNames = DEFAULT_FINALE.slice();

  /* ---------- Finale names ---------- */
  function renderFinale() {
    const box = $a("finale-names");
    box.innerHTML = "";
    finaleNames.forEach((n, i) => {
      const s = document.createElement("span");
      s.className = "fname";
      s.style.setProperty("--d", `${(1.2 + i * 0.6).toFixed(1)}s`);
      s.textContent = n;
      box.appendChild(s);
    });
  }

  /* ---------- Load shared config from Firestore ---------- */
  async function loadConfig() {
    try {
      const snap = await window.getDoc(window.doc(window.db, "config", "quiz"));
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.questions) && data.questions.length) {
          questions.length = 0;               // keep the same array object used by app.js
          questions.push(...data.questions);
        }
        if (Array.isArray(data.finaleNames) && data.finaleNames.length) {
          finaleNames = data.finaleNames;
        }
        window.quizOpen = data.open !== false;   // open unless explicitly closed
      }
    } catch (e) {
      console.error("خطأ في جلب الإعدادات:", e);
    }
    renderFinale();
    applyOpenState();
  }

  // Disable the start button and show a notice when the quiz is closed
  function applyOpenState() {
    const closed = window.quizOpen === false;
    $a("start-btn").disabled = closed;
    $a("name-error").textContent = closed ? "⛔ المسابقة مغلقة حالياً." : "";
  }

  function init() {
    loadConfig();
    window.onAuthStateChanged(window.auth, user => {
      isAdmin = !!user;
      $a("admin-link").textContent = isAdmin ? "⚙️ لوحة المشرف" : "🔐 المشرف";
    });
  }
  if (window.firebaseReady) init();
  else window.addEventListener("firebase-ready", init);

  /* ---------- Login ---------- */
  $a("admin-link").addEventListener("click", () => {
    if (isAdmin) openAdmin();
    else {
      $a("login-error").textContent = "";
      showScreen("login-screen");
    }
  });
  $a("login-back").addEventListener("click", () => showScreen("start-screen"));
  $a("admin-back").addEventListener("click", () => showScreen("start-screen"));

  async function doLogin() {
    $a("login-error").textContent = "";
    try {
      await window.signInWithEmailAndPassword(window.auth, $a("admin-email").value.trim(), $a("admin-pass").value);
      $a("admin-pass").value = "";
      openAdmin();
    } catch (e) {
      console.error("Login error:", e);
      const code = e && e.code ? e.code : "";
      const msgs = {
        "auth/invalid-credential": "البريد أو كلمة السر غير صحيحة.",
        "auth/wrong-password": "كلمة السر غير صحيحة.",
        "auth/user-not-found": "هذا البريد غير موجود في Authentication.",
        "auth/invalid-email": "صيغة البريد غير صحيحة.",
        "auth/operation-not-allowed": "الدخول بالبريد وكلمة السر غير مفعّل في Firebase (Sign-in method).",
        "auth/unauthorized-domain": "هذا النطاق غير مصرّح به. أضفه في Authentication > Settings > Authorized domains.",
        "auth/too-many-requests": "محاولات كثيرة، انتظر قليلاً ثم أعد المحاولة.",
        "auth/network-request-failed": "مشكلة في الاتصال بالإنترنت.",
        "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "مفتاح Firebase غير صالح."
      };
      $a("login-error").textContent = msgs[code] || `تعذّر الدخول (${code || "خطأ غير معروف"}).`;
    }
  }
  $a("login-btn").addEventListener("click", doLogin);
  $a("admin-pass").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });

  $a("logout-btn").addEventListener("click", async () => {
    await window.signOut(window.auth);
    showScreen("start-screen");
  });

  /* ---------- Editor ---------- */
  function openAdmin() {
    $a("finale-edit").value = finaleNames.join("\n");
    $a("admin-msg").textContent = "";
    $a("open-toggle").checked = window.quizOpen !== false;
    renderEditor(questions.map(x => ({ q: x.q, options: x.options.slice(), answer: x.answer })));
    showScreen("admin-screen");
  }

  function renderEditor(list) {
    const box = $a("q-editor");
    box.innerHTML = "";
    list.forEach((item, i) => {
      const wrap = document.createElement("div");
      wrap.className = "q-item";

      const head = document.createElement("div");
      head.className = "q-head";
      const title = document.createElement("span");
      title.textContent = `سؤال ${i + 1}`;
      const del = document.createElement("button");
      del.className = "q-del";
      del.textContent = "🗑️";
      del.title = "حذف السؤال";
      del.addEventListener("click", () => {
        const cur = readEditor();
        cur.splice(i, 1);
        renderEditor(cur);
      });
      head.append(title, del);

      const qt = document.createElement("textarea");
      qt.className = "field q-text";
      qt.rows = 2;
      qt.placeholder = "نص السؤال";
      qt.value = item.q || "";
      wrap.append(head, qt);

      for (let j = 0; j < 4; j++) {
        const row = document.createElement("div");
        row.className = "opt-row";
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = `correct-${i}`;
        radio.value = j;
        radio.checked = item.answer === j;
        const inp = document.createElement("input");
        inp.className = "field opt-text";
        inp.type = "text";
        inp.placeholder = `الخيار ${j + 1}`;
        inp.value = (item.options && item.options[j]) || "";
        row.append(radio, inp);
        wrap.appendChild(row);
      }
      box.appendChild(wrap);
    });
  }

  function readEditor() {
    return [...document.querySelectorAll("#q-editor .q-item")].map(el => {
      const checked = el.querySelector("input[type=radio]:checked");
      return {
        q: el.querySelector(".q-text").value.trim(),
        options: [...el.querySelectorAll(".opt-text")].map(x => x.value.trim()),
        answer: checked ? Number(checked.value) : -1
      };
    });
  }

  $a("add-q").addEventListener("click", () => {
    const cur = readEditor();
    cur.push({ q: "", options: ["", "", "", ""], answer: -1 });
    renderEditor(cur);
  });

  $a("save-btn").addEventListener("click", async () => {
    const msg = $a("admin-msg");
    msg.classList.remove("ok");
    const qs = readEditor();
    const names = $a("finale-edit").value.split("\n").map(s => s.trim()).filter(Boolean);

    if (qs.length === 0) { msg.textContent = "أضف سؤالاً واحداً على الأقل."; return; }
    for (let i = 0; i < qs.length; i++) {
      const x = qs[i];
      if (!x.q || x.options.some(o => !o)) { msg.textContent = `السؤال ${i + 1}: املأ نص السؤال والخيارات الأربعة.`; return; }
      if (x.answer < 0) { msg.textContent = `السؤال ${i + 1}: اختر الإجابة الصحيحة.`; return; }
    }

    try {
      await window.setDoc(window.doc(window.db, "config", "quiz"), { questions: qs, finaleNames: names, open: $a("open-toggle").checked });
      window.quizOpen = $a("open-toggle").checked;
      applyOpenState();
      questions.length = 0;
      questions.push(...qs);
      finaleNames = names;
      renderFinale();
      msg.classList.add("ok");
      msg.textContent = "✅ تم الحفظ.";
    } catch (e) {
      console.error(e);
      msg.textContent = "فشل الحفظ. تأكد من قواعد Firestore وأنك مسجل الدخول.";
    }
  });

  /* ---------- View the winner without playing ---------- */
  async function viewWinner() {
    // Dummy entry (total = -1 so it never appears in the rankings)
    score = 0; points = 0; answers = []; playerName = "";
    lastEntry = { name: "\u0000", nameKey: "", score: 0, total: -1, points: 0, timeMs: 0, date: -1, answers: [] };

    showScreen("end-screen");
    await loadAndRenderLeaderboard();

    const n = window.totalPlayers ?? document.querySelectorAll("#players-list .pl-rank").length;
    $a("end-title").textContent = "لوحة الأوائل";
    $a("end-emoji").textContent = "🏆";
    $a("final-score").textContent = "";
    $a("my-rank").textContent = `عدد اللاعبين: ${n}`;
    $a("badges").innerHTML = "";
    $a("review-btn").style.display = "none";
  }

  $a("view-winner-btn").addEventListener("click", viewWinner);
  $a("view-report-btn").addEventListener("click", () => openReport());

  // Restore the normal end screen when leaving the winner view
  $a("restart-btn").addEventListener("click", () => {
    $a("end-title").textContent = "انتهى الاختبار!";
    $a("review-btn").style.display = "";
  });
})();