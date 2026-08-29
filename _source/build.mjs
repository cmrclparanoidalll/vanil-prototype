/* Генератор статичних сторінок «Ваніль».
   Запуск:  node _source/build.mjs      (з кореня vanil-prototype)

   Навіщо: nav, footer і 260 рядків CSS раніше були скопійовані в кожен з 14 файлів.
   Тепер розмітка збирається звідси, а стилі й скрипти лежать в assets/. */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (name, html) => { writeFileSync(join(ROOT, name), html); return name; };

/* ------------------------------------------------------------------ дані */

const TEL1 = "+38 063 140-58-12", TEL1H = "tel:+380631405812";
const TEL2 = "+38 044 232-25-40", TEL2H = "tel:+380442322540";

// Adobe Stock, ліцензовано на акаунт. Два розміри: 900 для карток, 2400 для панелей.
const img = (id, w = 900) => `assets/img/${id}-${w > 900 ? 2400 : 900}.jpg`;

const PROJECTS = [
  { slug: "holosiiv", nm: "ГОЛОСІЇВ", sub: "4,2 м · емаль · дуб",
    a: "392855306", b: "333339402", banner: "569066781",
    d1: "333339402", d2: "340538712",
    c1: "Робоча зона з підсвіткою", c2: "Мийка винесена до вікна",
    intro: "Кутова кухня в двокімнатній квартирі. Стіни завалені на 14 мм по діагоналі — корпус робили з компенсацією, щоб фасади стали в одну лінію. Витяжку сховали в короб, розетки винесли в стільницю.",
    spec: [["Розмір", "4,2 погонних метри", "Кутова конфігурація, стеля 2,7 м"],
           ["Фасади", "МДФ під емаль, мат", "12 шарів, колір за RAL, ручки-профілі"],
           ["Стільниця", "Масив дуба, олія", "Накладна мийка, фрезерований край"],
           ["Фурнітура", "Blum Tandembox", "Кутовий механізм, Aventos, доводчики"],
           ["Строк", "18 днів", "Від підписання креслення до монтажу"]] },

  { slug: "pechersk", nm: "ПЕЧЕРСЬК", sub: "5,1 м · Fenix · кераміка",
    a: "481835359", b: "206022642", banner: "338111186",
    d1: "206022642", d2: "482768426",
    c1: "Високі шафи під стелю 3,1 м", c2: "Ручки-профілі замість накладних",
    intro: "Матовий графіт на весь периметр, стеля 3,1 м. Верхній ярус зробили глухим до стелі — жодного пилозбірника зверху. Fenix не тримає відбитків, що для темної кухні критично.",
    spec: [["Розмір", "5,1 погонних метри", "Пряма конфігурація, стеля 3,1 м"],
           ["Фасади", "Fenix NTM, графіт", "Антивідбитковий, самовідновне покриття"],
           ["Стільниця", "Керамограніт 12 мм", "Тонкий профіль, стійкий до нагріву"],
           ["Фурнітура", "Blum, ручки-профілі", "Відкривання натисканням на верхньому ярусі"],
           ["Строк", "24 дні", "Разом із фарбуванням коробів"]] },

  { slug: "nyvky", nm: "НИВКИ", sub: "2,6 м · Egger · компакт",
    a: "423697330", b: "1014741039", banner: "326808056",
    d1: "1014741039", d2: "477327388",
    c1: "Висувні колони замість полиць", c2: "Барна секція на місці підвіконня",
    intro: "5,4 м² — кожен сантиметр у роботі. Замість глибоких нижніх шаф поставили висувні колони, кутовий механізм витягує все назовні. Підвіконня замінили барною секцією.",
    spec: [["Розмір", "2,6 погонних метри", "Кутова, площа кухні 5,4 м²"],
           ["Фасади", "ЛДСП Egger", "Кромка ABS 2 мм у колір"],
           ["Стільниця", "HPL-компакт 12 мм", "Вологостійка, тонкий профіль"],
           ["Фурнітура", "Hettich", "Кутовий механізм, карго 150 мм"],
           ["Строк", "14 днів", "Найшвидший проєкт сезону"]] },

  { slug: "kozyn", nm: "КОЗИН", sub: "9,4 м · шпон · кварц",
    a: "909707882", b: "410168594", banner: "329588819",
    d1: "410168594", d2: "731238513",
    c1: "Мийка під вікном", c2: "Комора з окремим входом",
    intro: "Заміський будинок: дві робочі зони, острів із варильною поверхнею й окрема комора з власним входом. Шпон тонували за зразком підлоги, щоб кухня читалась як частина будинку, а не як меблі в ньому.",
    spec: [["Розмір", "9,4 погонних метри", "З островом, стеля 3,4 м"],
           ["Фасади", "Емаль і шпон дуба", "Тонування за зразком підлоги"],
           ["Стільниця", "Кварц, фрезерований край", "Острів — суцільна плита без стиків"],
           ["Фурнітура", "Blum Aventos HK top", "Підйомники на всьому верхньому ярусі"],
           ["Строк", "38 днів", "Найдовший через тонування шпону"]] },

  { slug: "obolon", nm: "ОБОЛОНЬ", sub: "6,8 м · шпон дуба · масив",
    a: "477327388", b: "516881156", banner: "204488526",
    d1: "516881156", d2: "431278002",
    c1: "Острів із варильною поверхнею", c2: "Прихована розетка в стільниці",
    intro: "Кухня-вітальня без візуальної межі між зонами. Острів тримає варильну поверхню й витяжку в стільниці. Розетки сховані у висувний блок — на робочій площині нічого не стирчить.",
    spec: [["Розмір", "6,8 погонних метри", "З островом, кухня-вітальня"],
           ["Фасади", "Шпон дуба, натуральний", "Матовий лак, без тонування"],
           ["Стільниця", "Масив дуба, олія", "Острів — та сама плита, що й стільниця"],
           ["Фурнітура", "Blum, витяжка в стільниці", "Висувний блок розеток"],
           ["Строк", "26 днів", ""]] },

  { slug: "poznyaky", nm: "ПОЗНЯКИ", sub: "3,8 м · ЛДСП і скло · HPL",
    a: "511069774", b: "492445295", banner: "532420244",
    d1: "492445295", d2: "701709093",
    c1: "Скляні фасади верхнього ярусу", c2: "Гардеробна на тій самій фурнітурі",
    intro: "Кухня й гардеробна одним проєктом: одна фурнітура, один майстер на монтажі, стики збігаються. Верхній ярус — скло в алюмінієвій рамці, щоб кухня не тиснула у вузькому приміщенні.",
    spec: [["Розмір", "3,8 м кухня + 2,4 м гардеробна", "Пряма конфігурація"],
           ["Фасади", "ЛДСП і скло в рамці", "Верхній ярус прозорий"],
           ["Стільниця", "HPL-компакт", "Стійка до вологи й пари"],
           ["Фурнітура", "Blum, єдина на обидва приміщення", ""],
           ["Строк", "22 дні", "Обидва приміщення разом"]] },

  { slug: "syrets", nm: "СИРЕЦЬ", sub: "3,4 м · емаль · компакт",
    a: "443197502", b: "419334060", banner: "1881669632",
    d1: "419334060", d2: "333339402",
    c1: "Ніша під вбудовану техніку", c2: "Підсвітка робочої зони з датчиком",
    intro: "Компактна пряма кухня у сталінці зі стелею 3,2 м. Верх добудували антресолями до самої стелі — сезонний посуд туди, і жодного простору не пропало.",
    spec: [["Розмір", "3,4 погонних метри", "Пряма, стеля 3,2 м"],
           ["Фасади", "МДФ під емаль", "Колір за RAL 9010"],
           ["Стільниця", "HPL-компакт 12 мм", ""],
           ["Фурнітура", "Hettich, доводчики", "Антресолі з підйомниками"],
           ["Строк", "16 днів", ""]] },

  { slug: "vyshhorod", nm: "ВИШГОРОД", sub: "7,1 м · емаль і шпон · кварц",
    a: "401950101", b: "330641655", banner: "176500616",
    d1: "330641655", d2: "214240027",
    c1: "Паралельна конфігурація", c2: "Обідня група з того ж шпону",
    intro: "Паралельна кухня у будинку: робоча лінія навпроти лінії зберігання, прохід 1,2 м. Обідній стіл зробили з того ж шпону, що й фасади — замовник хотів, щоб усе читалось як один об'єм.",
    spec: [["Розмір", "7,1 погонних метри", "Паралельна, прохід 1,2 м"],
           ["Фасади", "Емаль і шпон дуба", "Низ емаль, верх шпон"],
           ["Стільниця", "Кварцовий агломерат", "Обидві лінії однією партією"],
           ["Фурнітура", "Blum Tandembox", "Внутрішні шухляди в колонах"],
           ["Строк", "30 днів", "Разом з обіднім столом"]] }
];

/* ------------------------------------------------------- каркас сторінки */

const NAV = [
  ["kolektsii.html", "Проєкти"],
  ["vyrobnytstvo.html", "Виробництво"],
  ["yak-tse-pratsyuye.html", "Як це працює"]
];

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E" +
  "%3Crect width='32' height='32' fill='%23000'/%3E%3Ctext x='16' y='23' font-size='20' " +
  "text-anchor='middle' fill='%23fff' font-family='Helvetica,Arial'%3E%D0%92%3C/text%3E%3C/svg%3E";

const cur = (href, here) => (href === here ? ' aria-current="page"' : "");

const nav = (here) => `<header class="nav">
  <a class="nav__mark" href="index.html">ВАНІЛЬ</a>
  <nav class="nav__links" aria-label="Основна навігація">${
    NAV.map(([h, t]) => `<a href="${h}"${cur(h, here)}>${t}</a>`).join("")}</nav>
  <div class="nav__acts">
    <a class="btn" href="rozrakhunok.html"${cur("rozrakhunok.html", here)}>Розрахувати ціну</a>
    <a class="btn btn--primary" href="vymir.html"${cur("vymir.html", here)}>Записатись на вимір</a>
  </div>
  <button class="nav__burger" id="burger" type="button" aria-label="Меню"
          aria-expanded="false" aria-controls="drawer"><i></i><i></i></button>
</header>
<div class="drawer" id="drawer" aria-hidden="true">
  ${NAV.map(([h, t]) => `<a class="l" href="${h}"${cur(h, here)}>${t}</a>`).join("\n  ")}
  <div class="acts">
    <a class="btn" href="rozrakhunok.html">Розрахувати ціну</a>
    <a class="btn" href="vymir.html">Записатись на вимір</a>
  </div>
  <p class="tel">${TEL1}<br>Пн–Сб, 09:00–19:00</p>
</div>`;

const FOOTER = `<footer class="foot">
  <a class="foot__mark" href="index.html" aria-label="Ваніль Студія — на головну">
    <span>ВАНІЛЬ</span>
    <span class="foot__arw" aria-hidden="true">&#8594;</span>
    <span>СТУДІЯ</span>
  </a>

  <div class="foot__main">
    <div class="foot__info">
      <div>
        <p class="foot__line"><span class="bar">Цех</span> <span class="bar mono" id="clock">--:-- (GMT+3)</span></p>
        <p class="foot__line"><span class="bar">Кільцева дорога, 22б</span></p>
        <p class="foot__line"><span class="bar">Київ, 03062</span></p>
        <p class="foot__line"><span class="bar"><a href="mailto:cex@vanil.studio">cex@vanil.studio</a></span></p>
      </div>
      <div>
        <p class="foot__line"><span class="bar">Вимір</span> <span class="bar">безкоштовно</span></p>
        <p class="foot__line"><span class="bar">Київ і область</span></p>
        <p class="foot__line"><span class="bar">Пн–Сб, 09:00–19:00</span></p>
        <p class="foot__line"><span class="bar"><a href="${TEL1H}">${TEL1}</a></span></p>
      </div>
      <div>
        <p class="foot__line"><span class="bar">Гарантія</span> <span class="bar">5 років</span></p>
        <p class="foot__line"><span class="bar">Корпус і фурнітура</span></p>
        <p class="foot__line"><span class="bar">Строк 14–38 днів</span></p>
        <p class="foot__line"><span class="bar"><a href="mailto:hello@vanil.studio">hello@vanil.studio</a></span></p>
      </div>
    </div>

    <div class="foot__mail">
      <h2>Передзвонимо за 10 хвилин</h2>
      <p class="foot__hint">Залиште номер — наберемо в робочий час. Без форм і листування:
         відповімо на питання голосом і, якщо треба, одразу запишемо на вимір.</p>
      <form id="cb">
        <input type="tel" id="cbtel" inputmode="tel" autocomplete="tel"
               placeholder="+38 0__ ___ __ __" aria-label="Ваш телефон">
        <button class="btn btn--primary" type="submit">Передзвоніть мені</button>
        <p class="fnote" id="cbnote" role="status" aria-live="polite"></p>
      </form>
      <div class="foot__soc">
        <p>Або наберіть самі: <a href="${TEL1H}">${TEL1}</a></p>
        <p><a href="vymir.html">Instagram</a>, <a href="vymir.html">Telegram</a>, <a href="vymir.html">Viber</a></p>
      </div>
    </div>
  </div>

  <div class="foot__bot">
    <p>Ваніль робить кухні на Кільцевій. Міряємо самі, збираємо самі.</p>
    <p><a href="kolektsii.html">Дивитись усі проєкти</a></p>
    <p>Прототип · ціни орієнтовні · заявка нікуди не надсилається<br>© Ваніль</p>
  </div>
</footer>`;

const page = ({ file, title, desc, body }) => out(file, `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400&amp;family=Manrope:wght@400&amp;display=swap">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
<a class="skip" href="#main">До основного вмісту</a>
${nav(file)}
<main id="main">
${body}
</main>
${FOOTER}
<script src="assets/app.js" defer></script>
</body>
</html>
`);

/* ------------------------------------------------------------- шматочки */

const card = (p) => `  <a class="card" href="proekt-${p.slug}.html">
    <span class="ph">
      <img class="base" src="${img(p.a)}" alt="${p.nm}, кухня на замовлення" loading="lazy" decoding="async">
      <img class="alt" src="${img(p.b)}" alt="" aria-hidden="true" loading="lazy" decoding="async">
    </span>
    <span class="nm">${p.nm}</span><span class="sub">${p.sub}</span>
  </a>`;

const band = (id, alt, h2, btn, href) => `<section class="band">
  <img src="${img(id, 2400)}" alt="${alt}" loading="lazy" decoding="async">
  <div class="band__in">
    <h2>${h2}</h2>
    <a class="btn btn--fill" href="${href}">${btn}</a>
  </div>
</section>`;

const specRows = (rows, wide = true) => `<div class="steps${wide ? " steps--wide" : ""}">
${rows.map(([a, b, c]) => `  <div class="row"><span class="no">${a}</span><span>${b}</span><p>${c}</p></div>`).join("\n")}
</div>`;

/* ------------------------------------------------------------- сторінки */

const files = [];

/* --- Головна --- */
files.push(page({
  file: "index.html",
  title: "Ваніль — кухні на замовлення, Київ",
  desc: "Кухні та системи зберігання на замовлення. Власне виробництво в Києві, вимір безкоштовно, від виміру до монтажу 21 день.",
  body: `<div class="pair">
  <a class="panel" href="vyrobnytstvo.html">
    <img src="${img("176500616", 1800)}" alt="Столярна робота в цеху">
    <div class="panel__cap"><h1>Зроблено в Києві</h1><span class="btn btn--fill">Подивитись цех</span></div>
  </a>
  <a class="panel" href="kolektsii.html">
    <img src="${img("440718296", 1800)}" alt="Кухня з островом і барними стільцями">
    <div class="panel__cap"><h2>Кухні та системи зберігання</h2><span class="btn btn--fill">Дивитись роботи</span></div>
  </a>
</div>

<section class="vision rv">
  <h2>Вимір безкоштовний. Ціна фіксується після креслення&nbsp;— і далі не змінюється.</h2>
  <p class="vision__lead">Приїжджаємо з лазерним рівнем, знімаємо геометрію разом із завалом стін.
     Якщо після проєкту ціна вас не влаштує — ви нічого не винні.</p>
  <div class="vision__row">
    <a class="btn btn--primary" href="vymir.html">Записатись на вимір</a>
    <a class="lnk" href="rozrakhunok.html">Порахувати вартість</a>
    <a class="lnk" href="vyrobnytstvo.html">Приїхати в цех</a>
    <a class="lnk" href="vymir.html">Замовити зразки</a>
  </div>
</section>

<div class="shead rv"><h2>Проєкти</h2><a href="kolektsii.html">Усі роботи</a></div>
<div class="grid3 rv">
${PROJECTS.slice(0, 4).map(card).join("\n")}
  <a class="card" href="vyrobnytstvo.html">
    <span class="ph">
      <img class="base" src="${img("569066781")}" alt="Розкрій на форматно-розкрійному верстаті" loading="lazy" decoding="async">
      <img class="alt" src="${img("326808056")}" alt="" aria-hidden="true" loading="lazy" decoding="async">
      <span class="tag">Цех</span>
    </span>
    <span class="nm">КІЛЬЦЕВА 22Б</span><span class="sub">Як це збирається</span>
  </a>
</div>

<section class="figures rv">
  <div><b class="num">0,2</b><span>мм — похибка розкрою на форматно-розкрійному</span></div>
  <div><b class="num">21</b><span>день від виміру до монтажу, у середньому</span></div>
  <div><b class="num">12</b><span>шарів емалі з проміжним шліфуванням</span></div>
  <div><b class="num">5</b><span>років гарантії на корпус і фурнітуру</span></div>
</section>

<div class="pair">
  <a class="panel" href="proekt-holosiiv.html">
    <img src="${img("482768426", 1800)}" alt="Шухляди й фурнітура" loading="lazy" decoding="async">
    <div class="panel__cap"><h2>Шухляди й фурнітура</h2><span class="btn btn--fill">Дивитись</span></div>
  </a>
  <a class="panel" href="kolektsii.html">
    <img src="${img("1881669632", 1800)}" alt="Фасади зі шпону дуба" loading="lazy" decoding="async">
    <div class="panel__cap"><h2>Фасади і матеріали</h2><span class="btn btn--fill">Дивитись</span></div>
  </a>
</div>

<div class="pair">
  <a class="panel" href="proekt-obolon.html">
    <img src="${img("431278002", 1800)}" alt="Кварцова стільниця з інтегрованою мийкою" loading="lazy" decoding="async">
    <div class="panel__cap"><h2>Стільниці</h2><span class="btn btn--fill">Дивитись</span></div>
  </a>
  <a class="panel" href="vyrobnytstvo.html">
    <img src="${img("204488526", 1800)}" alt="Виробничий цех на Кільцевій" loading="lazy" decoding="async">
    <div class="panel__cap"><h2>Цех, Кільцева 22б</h2><span class="btn btn--fill">Приїхати</span></div>
  </a>
</div>

<a class="panel panel--full" href="yak-tse-pratsyuye.html">
  <img src="${img("477327388", 2400)}" alt="Готова кухня-вітальня після монтажу" loading="lazy" decoding="async">
  <div class="panel__cap"><h2>Від виміру до монтажу — 21 день</h2><span class="btn btn--fill">Як це працює</span></div>
</a>

<div class="shead rv"><h2>Хто це робить</h2><a href="vyrobnytstvo.html">Про цех</a></div>
<div class="crew rv">
  <figure><span class="ph"><img src="${img("588330283")}" alt="Замірник знімає геометрію лазерним рівнем" loading="lazy" decoding="async"></span>
    <figcaption>Замірник<span>Він же приїде на монтаж — це та сама людина</span></figcaption></figure>
  <figure><span class="ph"><img src="${img("681018192")}" alt="Конструкторка студії" loading="lazy" decoding="async"></span>
    <figcaption>Конструктор<span>Рахує компенсацію під завал стін і креслить</span></figcaption></figure>
  <figure><span class="ph"><img src="${img("569441280")}" alt="Збірка в цеху" loading="lazy" decoding="async"></span>
    <figcaption>Збірка<span>Пробна збірка в цеху до того, як везти до вас</span></figcaption></figure>
</div>`
}));

/* --- Проєкти (сітка) --- */
files.push(page({
  file: "kolektsii.html",
  title: "Проєкти — Ваніль",
  desc: "Вісім кухонь на замовлення з розмірами, матеріалами і строками — щоб приміряти до своєї квартири.",
  body: `<section class="page">
  <h1>Проєкти</h1>
  <p class="intro">Кожна кухня зроблена під конкретну квартиру: свої розміри, своя геометрія стін, свій набір техніки. Нижче — розміри й матеріали кожної, щоб ви могли приміряти до себе.</p>
</section>

<div class="grid3 rv">
${PROJECTS.map(card).join("\n")}
</div>

${band("431278002", "Кухня зі стільницею з кварцу", "Не знайшли схожої на свою?", "Викликати замірника", "vymir.html")}`
}));

/* --- Сторінки проєктів --- */
PROJECTS.forEach((p, i) => {
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  files.push(page({
    file: `proekt-${p.slug}.html`,
    title: `${p.nm} — Ваніль`,
    desc: `${p.nm}: ${p.sub}. ${p.intro.slice(0, 110)}…`,
    body: `<div class="panel panel--full">
  <img src="${img(p.a, 2400)}" alt="${p.nm} — кухня на замовлення">
  <div class="panel__cap"><h1>${p.nm}</h1><a class="btn btn--fill" href="vymir.html">Хочу схожу</a></div>
</div>

<section class="page">
  <p class="intro">${p.intro}</p>
</section>

${specRows(p.spec)}

<div class="grid2">
  <figure class="card" style="margin:0"><span class="ph ph--43"><img src="${img(p.d1, 1200)}" alt="${p.c1}" loading="lazy" decoding="async"></span><figcaption class="sub">${p.c1}</figcaption></figure>
  <figure class="card" style="margin:0"><span class="ph ph--43"><img src="${img(p.d2, 1200)}" alt="${p.c2}" loading="lazy" decoding="async"></span><figcaption class="sub">${p.c2}</figcaption></figure>
</div>

<nav class="pnav" aria-label="Інші проєкти">
  <a href="proekt-${prev.slug}.html"><span>Попередній</span>${prev.nm}</a>
  <a href="kolektsii.html" class="pnav__all">Усі проєкти</a>
  <a href="proekt-${next.slug}.html" class="pnav__next"><span>Наступний</span>${next.nm}</a>
</nav>

${band(p.banner, "Робота в цеху на Кільцевій", "Цю кухню зібрали на Кільцевій,&nbsp;22б", "Подивитись цех", "vyrobnytstvo.html")}`
  }));
});

/* --- Виробництво --- */
files.push(page({
  file: "vyrobnytstvo.html",
  title: "Виробництво — Ваніль",
  desc: "Власний цех у Києві на Кільцевій 22б: розкрій, кромкування, фарбувальна камера, пробна збірка перед монтажем.",
  body: `<div class="panel" style="height:min(100vh,860px)">
  <img src="${img("569066781", 2400)}" alt="Виробничий цех на Кільцевій">
  <div class="panel__cap"><h1>Цех, Кільцева 22б</h1><a class="btn btn--fill" href="vymir.html">Приїхати подивитись</a></div>
</div>

<section class="page">
  <p class="intro">Ми не перепродаємо чужі кухні. Розкрій, кромкування, приєднання, фарбування й збірка — усе відбувається на одному майданчику в Києві. Тому строк залежить від нас, а не від постачальника.</p>
</section>

${specRows([
  ["Розкрій", "Форматно-розкрійний верстат", "Похибка до 0,2 мм — фасади стають у лінію навіть на кривій стіні"],
  ["Кромка", "Автоматичне кромкування", "ABS 2 мм у колір фасаду, без білої смуги на зрізі"],
  ["Фарбування", "Власна фарбувальна камера", "12 шарів емалі з проміжним шліфуванням, колір за RAL або зразком"],
  ["Збірка", "Пробна збірка перед відвантаженням", "Кухня повністю збирається в цеху — ви можете приїхати й побачити її до монтажу"]
])}

<div class="grid2">
  <figure class="card" style="margin:0"><span class="ph ph--43"><img src="${img("176500616", 1200)}" alt="Столярні роботи" loading="lazy" decoding="async"></span><figcaption class="sub">Приєднання корпусу</figcaption></figure>
  <figure class="card" style="margin:0"><span class="ph ph--43"><img src="${img("1881669632", 1200)}" alt="Готові фасади" loading="lazy" decoding="async"></span><figcaption class="sub">Фасади після фарбування</figcaption></figure>
</div>

<section class="vision">
  <h2>Приїжджайте подивитись</h2>
  <p class="vision__lead">Київ, Кільцева дорога 22б. Пн–Сб, 09:00–19:00.
     Попередьте дзвінком, щоб майстер був на місці.</p>
  <div class="vision__row">
    <a class="btn btn--primary" href="vymir.html">Записатись</a>
    <a class="lnk" href="${TEL1H}">${TEL1}</a>
  </div>
</section>`
}));

/* --- Як це працює --- */
files.push(page({
  file: "yak-tse-pratsyuye.html",
  title: "Як це працює — Ваніль",
  desc: "П'ять етапів від виміру до монтажу, строки кожного і три рівні оснащення з цінами за метр.",
  body: `<section class="page">
  <h1>Як це працює</h1>
  <p class="intro">П'ять етапів від дзвінка до готової кухні. Ціна фіксується після креслення — далі вона не змінюється.</p>
</section>

${specRows([
  ["01", "Вимір", "Приїжджаємо з лазерним рівнем, знімаємо геометрію разом з кривизною стін і виводами комунікацій. 1–2 дні, безкоштовно."],
  ["02", "Проєкт і 3D", "Показуємо, як кухня стане в реальні розміри вашої квартири. Правки — до підписання, скільки потрібно. 3–5 днів."],
  ["03", "Кошторис", "Специфікація по кожній деталі: плита, кромка, петля, напрямна. Підсумкова сума далі не змінюється. 1 день."],
  ["04", "Виробництво", "Розкрій, кромкування, приєднання, фарбування — на власному цеху на Кільцевій. 10–25 днів."],
  ["05", "Монтаж", "Той самий майстер, який замірював. Підключення техніки й прибирання після себе. 1–3 дні."]
], false)}

${band("204488526", "Виробничий цех", "Скільки коштує", "Порахувати свою", "rozrakhunok.html")}

<div class="steps steps--wide" style="border-top:0;padding-top:var(--s-lg)">
  <div class="row"><span class="no">Базова</span><span>18–26 тис. ₴ за метр</span><p>ЛДСП Egger, кромка ABS, фурнітура Hettich, стільниця HPL.</p></div>
  <div class="row"><span class="no">Оптимальна</span><span>28–42 тис. ₴ за метр</span><p>МДФ під емаль або шпон, Blum, кварцова стільниця, підсвітка. Найчастіший вибір.</p></div>
  <div class="row"><span class="no">Індивідуальна</span><span>від 45 тис. ₴ за метр</span><p>Шпон з тонуванням за зразком, кераміка, нестандартна геометрія, фрезерування.</p></div>
</div>

<section class="figures">
  <div><b class="num">5</b><span>років гарантії на корпус, петлі, напрямні й підйомники</span></div>
  <div><b class="num">3</b><span>робочі дні — приїжджаємо по гарантії</span></div>
  <div><b class="num">0</b><span>грн доплат після підписаного креслення</span></div>
  <div><b class="num">1</b><span>майстер: хто міряв, той і монтує</span></div>
</section>

<div class="shead"><h2>Чого ми не робимо</h2></div>
<section class="never">
  <ul>
    <li><i>01</i><span>Плівкові глянцеві фасади</span><p>Плівка відходить на кутах біля плити за два-три роки. Пропонуємо емаль або шпон.</p></li>
    <li><i>02</i><span>Фурнітуру без назви</span><p>Тільки Blum або Hettich — щоб за п'ять років було чим замінити напрямну.</p></li>
    <li><i>03</i><span>Замовлення без виміру</span><p>За розмірами, знятими замовником, не працюємо: відповідальність за геометрію наша.</p></li>
    <li><i>04</i><span>Перерахунок ціни після креслення</span><p>Якщо ми помилились у кошторисі — це наша помилка, а не ваша доплата.</p></li>
    <li><i>05</i><span>«Кухню за тиждень»</span><p>Дванадцять шарів емалі з проміжним шліфуванням стільки не сохнуть. Мінімум 14 днів.</p></li>
  </ul>
</section>

<section class="warranty">
  <div class="warranty__col">
    <h2>Гарантія покриває</h2>
    <ul>
      <li>Корпус, петлі, напрямні, підйомники<span>Замінюємо за свій кошт, виїзд протягом 3 робочих днів</span></li>
      <li>Геометрію фасадів<span>Якщо повело або з'явився перекіс — переробляємо</span></li>
      <li>Роботу монтажників<span>Переставляємо й доводимо без питань</span></li>
    </ul>
  </div>
  <div class="warranty__col warranty__col--out">
    <h2>Не покриває</h2>
    <ul>
      <li>Механічні пошкодження<span>Сколи, порізи стільниці, зірвані петлі</span></li>
      <li>Воду в стиках<span>Набрякання ЛДСП від залитої й невитертої води</span></li>
      <li>Вигоряння масиву<span>Дуб під прямим сонцем змінює тон — це властивість матеріалу</span></li>
    </ul>
  </div>
</section>

<section class="vision">
  <h2>Ціна фіксується після креслення</h2>
  <p class="vision__lead">Якщо після проєкту вона вас не влаштує — ви нічого не винні:
     вимір і 3D безкоштовні.</p>
  <div class="vision__row">
    <a class="btn btn--primary" href="vymir.html">Викликати замірника</a>
    <a class="lnk" href="rozrakhunok.html">Спочатку порахувати</a>
  </div>
</section>`
}));

/* --- Калькулятор --- */
const opt = (v, l, svg, pressed = false, note = "") =>
  `      <button class="opt" type="button" data-v="${v}" data-l="${l}" aria-pressed="${pressed}">
        <svg viewBox="0 0 120 56" aria-hidden="true">${svg}</svg>
        ${l}${note ? `<em>${note}</em>` : ""}
      </button>`;

files.push(page({
  file: "rozrakhunok.html",
  title: "Розрахувати ціну — Ваніль",
  desc: "Порахуйте орієнтовну вартість кухні, гардеробної чи меблів у ванну за розмірами вашої стіни. Без дзвінків і реєстрації.",
  body: `<section class="est">
  <div class="est__top">
    <span class="est__step" id="stepLbl">1/4</span>
    <span class="est__bar"><i id="bar" style="width:25%"></i></span>
  </div>

  <h1 id="title">Розкажіть про ваш проєкт</h1>
  <p class="est__hint" id="sub">Почніть з одного приміщення — решту додамо на вимірі.</p>

  <div class="step" data-step="1">
    <p class="est__q" id="q-room">Яке приміщення рахуємо?</p>
    <div class="opts" data-group="room" role="group" aria-labelledby="q-room">
${opt("kitchen", "Кухня", '<rect x="6" y="8" width="108" height="16"/><circle cx="34" cy="16" r="5"/><circle cx="76" cy="16" r="5"/><rect x="6" y="38" width="46" height="12"/>', true)}
${opt("wardrobe", "Гардеробна", '<rect x="14" y="8" width="92" height="40"/><path d="M14 20h92M60 8v40M32 26v14M46 26v14M74 26v14M88 26v14"/>')}
${opt("bath", "Меблі у ванну", '<rect x="18" y="18" width="84" height="26" rx="2"/><path d="M18 26h84"/><circle cx="60" cy="35" r="5"/>')}
${opt("storage", "Комора", '<rect x="18" y="8" width="84" height="40"/><path d="M18 21h84M18 34h84"/>')}
    </div>

    <p class="est__q" id="q-layout">Яка конфігурація?</p>
    <p class="est__hint">Якщо не впевнені — оберіть найближче, замірник уточнить на місці.</p>
    <div class="opts" data-group="layout" role="group" aria-labelledby="q-layout">
${opt("1", "Пряма", '<rect x="10" y="10" width="100" height="14"/>', true)}
${opt("1.06", "Кутова", '<rect x="10" y="10" width="100" height="14"/><rect x="10" y="24" width="14" height="24"/>')}
${opt("1.05", "Паралельна", '<rect x="10" y="8" width="100" height="13"/><rect x="10" y="36" width="100" height="13"/>')}
${opt("1.12", "П-подібна", '<rect x="10" y="8" width="100" height="13"/><rect x="10" y="21" width="14" height="27"/><rect x="96" y="21" width="14" height="27"/>')}
${opt("1.18", "З островом", '<rect x="10" y="8" width="100" height="13"/><rect x="30" y="32" width="60" height="16"/>')}
    </div>
  </div>

  <div class="step" data-step="2" hidden>
    <p class="est__q"><label for="m">Скільки погонних метрів?</label></p>
    <p class="est__hint">Сумарна довжина всіх секцій уздовж стін. Приблизно — цього достатньо.</p>
    <div class="range">
      <input id="m" type="range" min="1.5" max="12" step="0.1" value="4.2">
      <output id="mOut" for="m">4,2</output><span class="u">м</span>
    </div>

    <p class="est__q" id="q-ceil">Висота стелі</p>
    <div class="opts" data-group="ceil" role="group" aria-labelledby="q-ceil">
${opt("1", "До 2,7 м", '<path d="M20 8h80M20 48h80M60 8v40"/><path d="M54 14l6-6 6 6M54 42l6 6 6-6"/>', true)}
${opt("1.08", "2,7–3,2 м", '<path d="M20 4h80M20 52h80M60 4v48"/><path d="M54 10l6-6 6 6M54 46l6 6 6-6"/><rect x="86" y="12" width="18" height="32"/>')}
${opt("1.14", "Понад 3,2 м", '<path d="M20 2h80M20 54h80M60 2v52"/><rect x="82" y="8" width="22" height="40"/><path d="M82 22h22M82 36h22"/>')}
    </div>
  </div>

  <div class="step" data-step="3" hidden>
    <p class="est__q" id="q-tier">Рівень оснащення</p>
    <p class="est__hint">Різниця — у матеріалі фасадів, стільниці й фурнітурі. Корпус і гарантія однакові.</p>
    <div class="opts" data-group="tier" role="group" aria-labelledby="q-tier">
${opt("18000-26000", "Базова", '<rect x="14" y="10" width="92" height="36"/><path d="M60 10v36"/>', false, "Egger, Hettich, HPL")}
${opt("28000-42000", "Оптимальна", '<rect x="14" y="10" width="92" height="36"/><path d="M60 10v36M14 28h92"/><circle cx="37" cy="19" r="2.5"/><circle cx="83" cy="19" r="2.5"/>', true, "емаль або шпон, Blum, кварц")}
${opt("45000-65000", "Індивідуальна", '<rect x="14" y="8" width="92" height="40"/><path d="M38 8v40M60 8v40M82 8v40M14 28h92"/>', false, "шпон під зразок, кераміка, нестандарт")}
    </div>
  </div>

  <div class="step" data-step="4" hidden>
    <div class="res">
      <p class="est__hint" style="margin:0">Орієнтовна вартість</p>
      <div class="res__sum" id="sum" aria-live="polite">—</div>
      <p class="res__note">Це вилка за вашими вхідними. Точна сума фіксується після виміру й креслення — і далі не змінюється. Вбудована техніка рахується окремо.</p>
      <dl id="brk"></dl>
      <p class="when" id="whenRes"></p>
      <div class="est__cta">
        <a class="btn btn--primary" id="toBook" href="vymir.html">Записатись на вимір</a>
        <button class="btn" type="button" id="again">Порахувати ще раз</button>
      </div>
    </div>
  </div>

  <div class="est__nav">
    <button class="est__back" type="button" id="back" hidden>Назад</button>
    <button class="btn btn--primary est__next" type="button" id="next">Далі</button>
  </div>
</section>`
}));

/* --- Заявка на вимір --- */
files.push(page({
  file: "vymir.html",
  title: "Записатись на вимір — Ваніль",
  desc: "Безкоштовний вимір по Києву й області: приїдемо в зручний час, знімемо геометрію й покажемо 3D.",
  body: `<section class="page">
  <h1>Записатись на вимір</h1>
  <p class="intro">Приїдемо в зручний час, знімемо геометрію й покажемо 3D. Безкоштовно і без зобов'язань.</p>
</section>

<div class="book">
  <div>
    <form id="f" novalidate>
      <div class="fld"><label for="nm">Ім'я</label><input id="nm" name="name" type="text" autocomplete="name" placeholder="Як до вас звертатись"></div>
      <div class="fld"><label for="tel">Телефон</label><input id="tel" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+38 0__ ___ __ __"></div>
      <div class="fld"><label for="dis">Район або населений пункт</label><input id="dis" name="district" type="text" placeholder="Наприклад, Оболонь"></div>
      <div class="fld"><label for="tp">Що потрібно</label>
        <select id="tp" name="type">
          <option>Кухня</option>
          <option>Гардеробна</option>
          <option>Меблі у ванну</option>
          <option>Комора</option>
          <option>Кілька позицій</option>
        </select>
      </div>
      <div class="fld"><label for="sm">Зразки матеріалів</label>
        <select id="sm" name="samples">
          <option>Не потрібні</option>
          <option>Привезти зразки фасадів на вимір</option>
          <option>Надіслати зразки поштою</option>
        </select>
      </div>
      <button class="btn btn--primary" type="submit">Надіслати</button>
      <p class="fnote" id="fn" role="status" aria-live="polite"></p>
    </form>
  </div>
  <div class="info">
    <dl>
      <dt>Телефони</dt><dd><a href="${TEL1H}">${TEL1}</a><br><a href="${TEL2H}">${TEL2}</a></dd>
      <dt>Виробництво</dt><dd>Київ, Кільцева дорога, 22б</dd>
      <dt>Графік</dt><dd>Пн–Сб, 09:00–19:00</dd>
      <dt>Вимір</dt><dd>Київ і область, безкоштовно</dd>
      <dt>Гарантія</dt><dd>5 років на корпус і фурнітуру</dd>
    </dl>
  </div>
</div>

${band("510953370", "Лазерний рівень у порожній кімнаті", "Або просто зателефонуйте", TEL1, TEL1H)}`
}));

console.log(`Зібрано ${files.length} сторінок:\n  ` + files.join("\n  "));
