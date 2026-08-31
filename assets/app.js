/* Ваніль — уся поведінка сайту в одному файлі.
   Кожен блок вмикається лише якщо на сторінці є відповідна розмітка. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Поява при скролі ----------
     Клас js-rv вішаємо тільки після перевірки підтримки:
     без JS контент лишається видимим завжди.
     Раніше тут був IntersectionObserver — у фоновій вкладці або при
     тротлінгу рендера він міг не спрацювати взагалі, і секція назавжди
     лишалась з opacity:0. Тепер це звичайна перевірка позиції: дешево
     (елементів одиниці) і передбачувано. */
  (function reveal() {
    var els = $$(".rv");
    if (!els.length) return;
    if (reduced) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    // Те, що вже в кадрі на момент завантаження, показуємо ДО вмикання js-rv:
    // інакше перший екран блимає прозорістю, а статичний знімок ловить порожнечу.
    var h0 = window.innerHeight || document.documentElement.clientHeight;
    els.forEach(function (e) {
      if (e.getBoundingClientRect().top < h0 * 0.88) e.classList.add("in");
    });
    document.documentElement.classList.add("js-rv");

    var pending = els.filter(function (e) { return !e.classList.contains("in"); }),
        queued = false;

    function check() {
      queued = false;
      var h = window.innerHeight || document.documentElement.clientHeight;
      pending = pending.filter(function (e) {
        // Умова тільки на верхню межу: якщо сторінка стрибнула (якір,
        // відновлена позиція, швидкий скрол) — секція, яку «перескочили»,
        // все одно стає видимою, а не лишається з opacity:0.
        var passed = e.getBoundingClientRect().top < h * 0.88;
        if (passed) e.classList.add("in");
        return !passed;
      });
      if (!pending.length) {
        window.removeEventListener("scroll", queue);
        window.removeEventListener("resize", queue);
      }
    }
    function queue() {
      if (queued) return;
      queued = true;
      // setTimeout, а не requestAnimationFrame: rAF не спрацьовує у прихованій
      // вкладці, і секція лишилась би невидимою назавжди.
      setTimeout(check, 16);
    }

    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    document.addEventListener("visibilitychange", queue);
    window.addEventListener("load", queue);
    check();
  })();

  /* ---------- 1b. Рейка етапів: горизонтальний хід від вертикального скролу ----
     Секція стає вища за екран рівно на довжину ходу доріжки, сцена всередині
     прилипає, доріжка їде вбік. Вмикаємо тільки якщо є що возити: коли всі
     картки й так влазять у ширину, лишається звичайна секція. */
  (function rail() {
    var sec = $("#rail"), track = $("#railTrack");
    if (!sec || !track || reduced) return;
    if (!("CSS" in window) || !CSS.supports || !CSS.supports("position", "sticky")) return;

    // Пін вимагає місця: на вузькому екрані картки не стають у ряд, на
    // низькому — сходинка не влазить у 100vh і її обрізало б. Там лишаємо
    // звичайний горизонтальний скрол пальцем.
    var tooTight = window.matchMedia("(max-width:900px),(max-height:760px)");

    var cards = $$(".rcard", track);
    var travel = 0, top = 0, mid = 0, geom = [], queued = false;

    // Наскільки картка на краю менша за центральну.
    var SHRINK = 0.18;
    // Скільки чорного лишається після того, як доріжка доїхала: блок тримає
    // останні картки на місці й доводить тло до наступної секції.
    // Частка екрана плюс фіксована добавка — щоб хвіст не залежав тільки від
    // висоти вікна й на будь-якому екрані лишався помітним.
    var TAIL = 0.45, TAIL_PX = 260;
    // Дзеркалить padding-bottom у .js-rail .rail: висота секції росте на ту саму
    // величину, тож смуга чорного з'являється, а хід доріжки не коротшає.
    var PAD_BOTTOM = 150;

    function measure() {
      // Міряємо без класу js-rail: доріжка тоді на своєму місці, без
      // успадкованого transform і scale, і offsetLeft чесний.
      document.documentElement.classList.remove("js-rail");
      sec.style.removeProperty("--rail-len");
      track.style.removeProperty("--rail-pad");

      if (tooTight.matches || cards.length < 2) {
        cards.forEach(function (c) { c.style.removeProperty("--sc"); });
        track.scrollLeft = 0;
        travel = 0;
        return;
      }

      // Крок рахуємо різницею offsetLeft — вона не залежить від того, які
      // саме поля зараз у доріжки, тож переміряти після зміни полів не треба.
      var w = cards[0].offsetWidth;
      var stepX = cards[1].offsetLeft - cards[0].offsetLeft;
      travel = (cards.length - 1) * stepX;
      if (travel <= 0) { travel = 0; return; }

      // Поля доріжки такі, щоб перша картка стояла по центру екрана вже на
      // початку ходу, а остання — по центру в кінці. Як на референсі: картка
      // з'являється одразу цілою, а не виїжджає збоку обрізаною.
      var pad = Math.max(0, (window.innerWidth - w) / 2);
      track.style.setProperty("--rail-pad", pad + "px");

      document.documentElement.classList.add("js-rail");

      // Центри читаємо вже з новими полями й запам'ятовуємо: рахувати їх
      // щокадру означало б читати layout одразу після запису transform.
      geom = cards.map(function (c) { return c.offsetLeft + c.offsetWidth / 2; });
      mid = window.innerWidth / 2;
      sec.style.setProperty("--rail-len",
        Math.round(window.innerHeight + travel + window.innerHeight * TAIL + TAIL_PX + PAD_BOTTOM) + "px");
      top = sec.getBoundingClientRect().top + window.pageYOffset;
      paint();
    }

    function paint() {
      if (!travel) return;
      var p = (window.pageYOffset - top) / travel;
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      var x = -p * travel;
      track.style.setProperty("--rail-x", x.toFixed(1) + "px");

      // Що далі картка від середини екрана, то вона менша.
      for (var i = 0; i < cards.length; i++) {
        var d = Math.abs(geom[i] + x - mid) / mid;
        if (d > 1) d = 1;
        cards[i].style.setProperty("--sc", (1 - SHRINK * d).toFixed(3));
      }
    }

    function queue() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; paint(); });
    }

    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    measure();
  })();

  /* ---------- 2. Відео: не автоплеїмо при prefers-reduced-motion ---------- */
  if (reduced) {
    $$("video").forEach(function (v) { v.removeAttribute("autoplay"); v.pause(); });
  }

  /* ---------- 3. Мобільне меню ----------
     До цього нижче 1180px навігація просто зникала і на телефоні
     не було жодного способу перейти між розділами. */
  (function menu() {
    var burger = $("#burger"), drawer = $("#drawer");
    if (!burger || !drawer) return;

    function set(open) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Закрити меню" : "Меню");
      drawer.classList.toggle("open", open);
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("lock", open);
    }
    set(false);

    burger.addEventListener("click", function () {
      set(burger.getAttribute("aria-expanded") !== "true");
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) set(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        set(false); burger.focus();
      }
    });
    // Повертаємось на десктоп — меню має закритись, інакше body лишається залоченим.
    window.matchMedia("(min-width:1181px)").addEventListener("change", function (e) {
      if (e.matches) set(false);
    });
  })();

  /* ---------- 4. Телефон: нормалізація і перевірка ---------- */
  function digits(s) { return (s || "").replace(/\D/g, ""); }

  function normalizePhone(raw) {
    var d = digits(raw);
    if (d.length === 12 && d.slice(0, 3) === "380") return d.slice(2);   // 380XXXXXXXXX
    if (d.length === 10 && d[0] === "0") return d;                        // 0XXXXXXXXX
    if (d.length === 9) return "0" + d;                                   // XXXXXXXXX
    return null;
  }

  function prettyPhone(ten) {
    return "+38 " + ten.slice(0, 3) + " " + ten.slice(3, 6) + " " + ten.slice(6, 8) + " " + ten.slice(8);
  }

  /* ---------- 5. Форма заявки ---------- */
  (function bookingForm() {
    var form = $("#f");
    if (!form) return;

    var note = $("#fn"), sent = false;

    // Дані з калькулятора: підставляємо тип і показуємо суму.
    var p = new URLSearchParams(location.search);
    var tp = p.get("tp"), sum = p.get("sum"), meta = p.get("meta");
    if (tp) {
      var sel = $("#tp");
      $$("option", sel).forEach(function (o) {
        if (o.value === tp || o.textContent === tp) sel.value = o.value;
      });
    }
    if (sum) {
      var box = document.createElement("div");
      box.className = "prefill";
      box.innerHTML = "<b>Ваш розрахунок</b>" + escapeHtml(sum) + (meta ? " · " + escapeHtml(meta) : "");
      form.parentNode.insertBefore(box, form);
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function fieldError(input, msg) {
      var fld = input.closest(".fld");
      var old = $(".err", fld);
      if (old) old.remove();
      fld.classList.toggle("fld--err", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg) {
        var e = document.createElement("span");
        e.className = "err";
        e.textContent = msg;
        fld.appendChild(e);
      }
    }

    var nm = $("#nm"), tel = $("#tel");

    tel.addEventListener("blur", function () {
      var t = normalizePhone(tel.value);
      if (t) { tel.value = prettyPhone(t); fieldError(tel, ""); }
    });
    [nm, tel].forEach(function (i) {
      i.addEventListener("input", function () { fieldError(i, ""); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sent) return;

      var ok = true;
      if (!nm.value.trim()) { fieldError(nm, "Вкажіть, як до вас звертатись"); ok = false; }

      var ten = normalizePhone(tel.value);
      if (!ten) { fieldError(tel, "Телефон у форматі +38 0XX XXX XX XX"); ok = false; }
      else { tel.value = prettyPhone(ten); fieldError(tel, ""); }

      if (!ok) { $(".fld--err input", form).focus(); return; }

      sent = true;
      $("button[type=submit]", form).disabled = true;
      note.textContent = "Дякуємо, " + nm.value.trim() + ". Передзвонимо на " +
                         tel.value + " протягом години й узгодимо час виміру.";
      note.style.color = "#000";
      // Прототип: заявка нікуди не йде. Тут буде fetch() на бекенд.
      console.info("Заявка (прототип):", {
        name: nm.value.trim(), phone: "+38" + ten,
        district: ($("#dis") || {}).value, type: ($("#tp") || {}).value,
        samples: ($("#sm") || {}).value, calc: sum || null
      });
    });
  })();


  /* ---------- 7. Годинник цеху й дата монтажу ----------
     Строк як обіцянка з конкретною датою читається інакше, ніж «21 день». */
  var KYIV = "Europe/Kyiv";

  function kyivOffset(d) {
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: KYIV, timeZoneName: "shortOffset" })
                    .formatToParts(d);
      var tz = parts.find(function (x) { return x.type === "timeZoneName"; });
      return tz ? tz.value.replace("GMT", "GMT+0").replace("GMT+0+", "GMT+").replace("GMT+0-", "GMT-") : "GMT+3";
    } catch (e) { return "GMT+3"; }
  }

  (function clock() {
    var el = $("#clock");
    if (!el) return;
    function tick() {
      var now = new Date();
      var t;
      try {
        t = new Intl.DateTimeFormat("uk-UA", {
          timeZone: KYIV, hour: "2-digit", minute: "2-digit", hour12: false
        }).format(now);
      } catch (e) { t = now.toTimeString().slice(0, 5); }
      el.textContent = t + " (" + kyivOffset(now) + ")";
    }
    tick();
    setInterval(tick, 30000);
  })();

  // Найближчий монтаж: сьогодні + 21 день, без неділі.
  function installDate() {
    var d = new Date();
    d.setDate(d.getDate() + 21);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    try {
      return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long" }).format(d);
    } catch (e) { return null; }
  }

  (function promiseDate() {
    var el = $("#when");
    if (!el) return;
    var d = installDate();
    if (d) el.innerHTML = "Замовите сьогодні — монтаж <b>" + d + "</b>.";
  })();

  /* ---------- 8. Зворотний дзвінок у підвалі ----------
     Розсилка тут не працює: людина обирає кухню раз у житті й не підписується
     на новини меблевого цеху. Швидкий дзвінок — те, чим справді користуються. */
  (function callback() {
    var f = $("#cb");
    if (!f) return;
    var tel = $("#cbtel"), note = $("#cbnote"), sent = false;

    tel.addEventListener("blur", function () {
      var t = normalizePhone(tel.value);
      if (t) tel.value = prettyPhone(t);
    });

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sent) return;
      var ten = normalizePhone(tel.value);
      if (!ten) { note.textContent = "Телефон у форматі +38 0XX XXX XX XX"; tel.focus(); return; }
      tel.value = prettyPhone(ten);
      sent = true;
      $("button", f).disabled = true;
      tel.disabled = true;
      note.textContent = "Прийняли. Наберемо на " + tel.value + " у робочий час.";
      console.info("Зворотний дзвінок (прототип):", "+38" + ten);
    });
  })();

  /* ---------- 6. Калькулятор ---------- */
  (function estimator() {
    var root = $(".est");
    if (!root || !$(".step", root)) return;

    var ROOMS = {
      "kitchen":  { label: "Кухня",         k: 1    },
      "wardrobe": { label: "Гардеробна",    k: 0.72 },
      "bath":     { label: "Меблі у ванну", k: 0.85 },
      "storage":  { label: "Комора",        k: 0.6  }
    };
    var DEFAULTS = {
      room: "kitchen", layout: 1, layoutL: "Пряма", m: 4.2,
      ceil: 1, ceilL: "До 2,7 м", tier: "28000-42000", tierL: "Оптимальна"
    };
    var state = Object.assign({}, DEFAULTS);
    var step = 1, LAST = 4;

    var titles = {
      1: ["Розкажіть про ваш проєкт", "Почніть з одного приміщення — решту додамо на вимірі."],
      2: ["Розміри", "Приблизні цифри цілком підходять — на вимірі ми їх уточнимо."],
      3: ["Наповнення", "Оберіть рівень, від якого відштовхуємось."],
      4: ["Ваш розрахунок", "Без дзвінків і реєстрації."]
    };

    function pick(group, value) {
      var name = group.getAttribute("data-group");
      $$(".opt", group).forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-v") === value ? "true" : "false");
      });
      var b = $('.opt[data-v="' + value + '"]', group);
      if (!b) return;
      var l = b.getAttribute("data-l");
      if (name === "room")   { state.room = value; }
      if (name === "layout") { state.layout = parseFloat(value); state.layoutL = l; }
      if (name === "ceil")   { state.ceil = parseFloat(value); state.ceilL = l; }
      if (name === "tier")   { state.tier = value; state.tierL = l; }
    }

    $$(".opts", root).forEach(function (group) {
      $$(".opt", group).forEach(function (b) {
        b.addEventListener("click", function () { pick(group, b.getAttribute("data-v")); });
      });
    });


    var m = $("#m"), mOut = $("#mOut");
    function syncRange() {
      state.m = parseFloat(m.value);
      mOut.textContent = m.value.replace(".", ",");
    }
    m.addEventListener("input", syncRange);

    var nf = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 });

    function calc() {
      var t = state.tier.split("-");
      var k = ROOMS[state.room].k * state.m * state.layout * state.ceil;
      var lo = Math.round(parseInt(t[0], 10) * k / 1000) * 1000;
      var hi = Math.round(parseInt(t[1], 10) * k / 1000) * 1000;
      var sum = nf.format(lo) + " — " + nf.format(hi) + " ₴";

      $("#sum").textContent = sum;
      $("#brk").innerHTML =
        "<dt>Приміщення</dt><dd>" + ROOMS[state.room].label + "</dd>" +
        "<dt>Конфігурація</dt><dd>" + state.layoutL + "</dd>" +
        "<dt>Довжина</dt><dd>" + String(state.m).replace(".", ",") + " м</dd>" +
        "<dt>Стеля</dt><dd>" + state.ceilL + "</dd>" +
        "<dt>Рівень</dt><dd>" + state.tierL + "</dd>" +
        "<dt>Строк</dt><dd>" + (state.m >= 6 ? "26–38 днів" : "14–26 днів") + "</dd>";

      // Тягнемо розрахунок у форму заявки, щоб людина не переказувала його вручну.
      var meta = ROOMS[state.room].label + ", " + String(state.m).replace(".", ",") +
                 " м, " + state.tierL.toLowerCase();
      var wr = $("#whenRes"), dt = installDate();
      if (wr && dt) wr.innerHTML = "Якщо підпишемо креслення цього тижня — монтаж <b>" + dt + "</b>.";

      $("#toBook").href = "vymir.html?tp=" + encodeURIComponent(ROOMS[state.room].label) +
                          "&sum=" + encodeURIComponent(sum) +
                          "&meta=" + encodeURIComponent(meta);
    }

    function show(n) {
      step = n;
      $$(".step", root).forEach(function (s) {
        s.hidden = (parseInt(s.getAttribute("data-step"), 10) !== n);
      });
      $("#stepLbl").textContent = n + "/" + LAST;
      $("#bar").style.width = (n / LAST * 100) + "%";
      $("#title").textContent = titles[n][0];
      $("#sub").textContent = titles[n][1];
      $("#back").hidden = (n === 1);
      $("#next").hidden = (n === LAST);          // «Назад» лишається доступним і на результаті
      if (n === LAST) calc();
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }

    $("#next").addEventListener("click", function () { if (step < LAST) show(step + 1); });
    $("#back").addEventListener("click", function () { if (step > 1) show(step - 1); });
    $("#again").addEventListener("click", function () {
      Object.assign(state, DEFAULTS);            // раніше стан не скидався
      $$(".opts", root).forEach(function (g) {
        var name = g.getAttribute("data-group");
        pick(g, name === "room" ? DEFAULTS.room :
                name === "layout" ? String(DEFAULTS.layout) :
                name === "ceil" ? String(DEFAULTS.ceil) : DEFAULTS.tier);
      });
      m.value = DEFAULTS.m; syncRange();
      show(1);
    });

    // Приміщення можна відкрити одразу потрібне: rozrakhunok.html?room=wardrobe
    var want = new URLSearchParams(location.search).get("room");
    if (want && ROOMS[want]) pick($('.opts[data-group="room"]', root), want);
    syncRange();
    show(1);
  })();
})();
