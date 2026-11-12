function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function priceText(p) {
  if (!p.price) return "Цена по запросу";
  return (p.priceFrom ? "от " : "") + p.price.toLocaleString("ru-RU") + " ₽";
}

// Телефон во всех кнопках берётся из products.js
document.querySelectorAll("[data-phone]").forEach(a => a.setAttribute("href", PHONE_LINK));
document.querySelectorAll("[data-phone-text]").forEach(el => el.textContent = PHONE_TEXT);
// Кнопки MAX появляются, только когда в products.js указана ссылка
if (MAX_LINK) {
  document.querySelectorAll("[data-max]").forEach(a => { a.href = MAX_LINK; a.hidden = false; });
}

// Открыть MAX и положить готовый текст в буфер. Окно открываем сразу, в момент нажатия:
// айфон (Safari) не открывает окно, если сначала ждать копирования (12.11.2026).
// Ответ: true — текст скопирован, false — нет (тогда покажем текст на странице).
function openMaxWith(text) {
  let copying;
  try { copying = navigator.clipboard.writeText(text); } catch (err) { copying = Promise.reject(err); }
  window.open(MAX_LINK, "_blank", "noopener");
  return Promise.resolve(copying).then(() => true, () => false);
}

// «Назад» на телефоне закрывает окно товара, а не уводит с сайта (12.11.2026):
// открыли окно — добавили шаг в историю, закрыли окно — убрали его
function historyOpen(dlg, url) {
  if (dlg.dataset.back) history.replaceState({ dlg: dlg.id }, "", url);
  else { history.pushState({ dlg: dlg.id }, "", url); dlg.dataset.back = "1"; }
}
function historyClose(dlg) {
  if (dlg.dataset.back) { delete dlg.dataset.back; history.back(); }
  // Браузер сообщает о закрытии чуть позже: если уже открыто другое окно — его адрес не трогаем
  else if (!document.querySelector("dialog[open]")) history.replaceState(null, "", location.pathname + location.search);
}
// Закрыть окно и сразу убрать его шаг из истории — не ждём события «close»: браузер присылает его с задержкой,
// а в фоновой вкладке может не прислать вовсе. Событие «close» остаётся для закрытия клавишей Esc.
function closeDialog(dlg) { if (dlg.open) dlg.close(); historyClose(dlg); }
addEventListener("popstate", () => document.querySelectorAll("dialog[open]").forEach(d => { delete d.dataset.back; closeDialog(d); }));

// Все товары: сначала подробные карточки с фото, потом остальное с Фарпоста
// oem — официальное фото производителя: оно становится главным,
// а фото из объявления (реальное состояние товара) идут следом при листании
const withOem = p => p.oem
  ? { ...p, image: p.oem, images: [p.oem, ...(p.images || (p.image ? [p.image] : []))] }
  : p;
const ITEMS = [
  ...PRODUCTS,
  ...CATALOG.map((p, i) => ({ ...p, id: 1000 + i })),
  ...(typeof TEYES === "undefined" ? [] : TEYES).map((p, i) => ({ ...p, id: 3000 + i })), // TEYES под заказ (teyes.js)
  ...(typeof CARHEAVEN === "undefined" ? [] : CARHEAVEN).map((p, i) => ({ ...p, id: 4000 + i })), // Car Heaven под заказ (carheaven.js)
  ...(typeof RAMKI === "undefined" ? [] : RAMKI).map((p, i) => ({ ...p, id: 5000 + i, name: cleanName(p.name) })), // рамки и провода под заказ (ramki.js)
].map(withOem).map(tagCars); // марки и модели из названий — models.js
document.querySelectorAll("[data-count]").forEach(el => el.textContent = ITEMS.length);

// Рисунки вместо фото, пока своих фото нет
const svg = inner => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const ICONS = {
  "Android-магнитолы": svg('<rect x="2.5" y="5" width="19" height="13" rx="2"/><path d="M6 8.5h12v6H6z"/><path d="M9 21h6"/>'),
  "TEYES под заказ": svg('<rect x="2.5" y="5" width="19" height="13" rx="2"/><path d="M6 8.5h12v6H6z"/><path d="M9 21h6"/>'),
  "Car Heaven под заказ": svg('<rect x="2.5" y="5" width="19" height="13" rx="2"/><path d="M6 8.5h12v6H6z"/><path d="M9 21h6"/>'),
  "Японские магнитолы": svg('<rect x="2" y="7" width="20" height="10" rx="2"/><circle cx="7" cy="12" r="2.2"/><path d="M12 10h7M12 14h5"/>'),
  "Рамки и крепления": svg('<rect x="3" y="4" width="18" height="16" rx="2"/><rect x="7" y="8" width="10" height="8" rx="1"/><path d="M3 9h2M3 15h2M19 9h2M19 15h2"/>'),
  "Сигнализации Pandora": svg('<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>'),
  "Провода и аксессуары": svg('<path d="M9 2v5M15 2v5"/><path d="M7 7h10v3a5 5 0 0 1-10 0z"/><path d="M12 15v3a3 3 0 0 0 3 3h4"/>'),
};
const picture = p => p.image
  ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">`
  : `<span class="card__icon">${ICONS[p.category] || ICONS["Японские магнитолы"]}</span>`;

// Галерея в окне товара: листается пальцем на телефоне и стрелками на компьютере
function gallery(p) {
  const list = p.images && p.images.length ? p.images : p.image ? [p.image] : [];
  if (list.length < 2) return `<div class="modal__img${p.image ? "" : " modal__img--plain"}">${picture(p)}</div>`;
  return `
    <div class="gallery">
      <div class="gallery__track">${list.map((src, i) =>
        `<img src="${escapeHtml(src)}" alt="${escapeHtml(p.name)}, фото ${i + 1}" loading="${i ? "lazy" : "eager"}">`).join("")}</div>
      <button class="gallery__btn gallery__btn--prev" aria-label="Предыдущее фото">‹</button>
      <button class="gallery__btn gallery__btn--next" aria-label="Следующее фото">›</button>
      <span class="gallery__count">1 / ${list.length}</span>
    </div>
    <div class="thumbs">${list.map((src, i) =>
      `<button class="thumbs__item${i ? "" : " is-active"}" data-i="${i}" aria-label="Фото ${i + 1}"><img src="${escapeHtml(src)}" alt="" loading="lazy"></button>`).join("")}</div>`;
}

function initGallery(root) {
  const g = root.querySelector(".gallery");
  if (!g) return;
  const track = g.querySelector(".gallery__track");
  const count = g.querySelector(".gallery__count");
  const thumbs = [...root.querySelectorAll(".thumbs__item")];
  const total = track.children.length;
  // Номер фото храним сами: так быстрые нажатия на стрелки не теряются,
  // пока предыдущее фото ещё доезжает
  let index = 0;
  let autoScroll = 0;
  const show = i => {
    index = i;
    count.textContent = `${i + 1} / ${total}`;
    thumbs.forEach((t, n) => t.classList.toggle("is-active", n === i));
    thumbs[i]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };
  const go = i => {
    i = (i + total) % total; // после последнего — снова первое
    show(i);
    clearTimeout(autoScroll);
    autoScroll = setTimeout(() => { autoScroll = 0; }, 700);
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  };
  g.querySelector(".gallery__btn--prev").addEventListener("click", () => go(index - 1));
  g.querySelector(".gallery__btn--next").addEventListener("click", () => go(index + 1));
  thumbs.forEach(t => t.addEventListener("click", () => go(Number(t.dataset.i))));
  // Листание пальцем: номер берём из положения ленты
  track.addEventListener("scroll", () => {
    if (autoScroll) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== index) show(i);
  }, { passive: true });
  g.tabIndex = 0;
  g.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") go(index - 1);
    if (e.key === "ArrowRight") go(index + 1);
  });
}

// Плитки направлений — открывают нужный раздел каталога
const catalogEl = document.getElementById("catalog");
const directions = document.getElementById("directions");
directions.innerHTML = DIRECTIONS.map(d => `
  <a class="direction" href="#catalog" data-filter="${escapeHtml(d.filter)}">
    <img src="${escapeHtml(d.image)}" alt="" loading="lazy">
    <span class="direction__body">
      <span class="direction__title">${escapeHtml(d.title)}</span>
      <span class="direction__text">${escapeHtml(d.text)}</span>
    </span>
  </a>`).join("");
directions.addEventListener("click", e => {
  const d = e.target.closest(".direction");
  if (!d) return;
  e.preventDefault();
  state.category = d.dataset.filter;
  state.shown = PAGE;
  render();
  catalogEl.scrollIntoView({ behavior: "smooth" });
});

// Каталог: раздел, марка машины, поиск
const PAGE = 24;
const state = { category: "", car: "", model: "", cond: "", query: "", shown: PAGE };
// Состояние товара: новый или б/у (из объявления на Фарпосте)
const condOf = p => /б\/у/i.test(p.condition || "") ? "used" : /^нов/i.test(p.condition || "") ? "new" : "";
const CONDS = [["", "Любое"], ["new", "Новые"], ["used", "Б/у"]];
const JP_FIRST = ["Toyota", "Honda", "Nissan", "Mazda", "Mitsubishi", "Subaru", "Suzuki", "Lexus", "Daihatsu", "Infiniti", "Isuzu"];
// Японские марки — кнопками, остальные — в выпадающем списке, чтобы не занимать пол-экрана
const CARS = [...new Set(ITEMS.flatMap(p => p.cars))].sort((a, b) =>
  (JP_FIRST.indexOf(a) + 1 || 99) - (JP_FIRST.indexOf(b) + 1 || 99) || a.localeCompare(b));
const hasCar = (p, c) => p.cars.includes(c);
const hasModel = (p, c, m) => p.models.includes(c + "|" + m);

const grid = document.getElementById("productGrid");
const catTabs = document.getElementById("catTabs");
const carChips = document.getElementById("carChips");
const modelChips = document.getElementById("modelChips");
const condChips = document.getElementById("condChips");
const countEl = document.getElementById("catalogCount");
const moreBtn = document.getElementById("moreBtn");
const searchInput = document.getElementById("searchInput");

function filtered(withFilters = true) {
  const terms = searchTerms(state.query); // русские названия машин и брендов — ru-search.js
  const list = ITEMS.filter(p => {
    if (withFilters && state.category && p.category !== state.category) return false;
    if (withFilters && state.car && !hasCar(p, state.car)) return false;
    if (withFilters && state.model && !hasModel(p, state.car, state.model)) return false;
    if (withFilters && state.cond && condOf(p) !== state.cond) return false;
    const text = [p.name, p.category, p.cars.join(" "), p.condition || "", p.description || "", p.code || "", ...(p.variants || []).map(v => v.name)].join(" ").toLowerCase().replace(/ё/g, "е");
    return terms.every(alts => alts.some(w => text.includes(w)));
  });
  // При поиске сначала то, где слова есть в названии: иначе «провода тойота» начнётся с рамок,
  // у которых провода упомянуты в описании
  const hit = t => terms.every(alts => alts.some(w => t.includes(w)));
  const score = p => { if (!terms.length) return 0; const n = p.name.toLowerCase().replace(/ё/g, "е"); return hit(n) ? 2 : hit(n + " " + p.category.toLowerCase()) ? 1 : 0; };
  // В разделе рамок сначала новые (под заказ), потом папины в наличии (папа, 07.11.2026)
  // и среди новых — сначала японские марки (папа, 07.11.2026)
  const rank = state.category === "Рамки и крепления"
    ? p => p.order ? (JP_FIRST.indexOf(p.car) + 1 || JP_FIRST.length + 1) : JP_FIRST.length + 2
    : () => 0;
  return list.map((p, i) => [p, i, score(p), rank(p)]).sort((a, b) => b[2] - a[2] || a[3] - b[3] || a[1] - b[1]).map(x => x[0]);
}

function card(p) {
  return `
  <article class="card${p.image ? "" : " card--plain"}" data-id="${p.id}" tabindex="0">
    <div class="card__img">${picture(p)}${p.images && p.images.length > 1 ? `<span class="card__photos">${p.images.length} фото</span>` : ""}</div>
    <div class="card__body">
      <span class="card__cat">${escapeHtml(p.category)}${p.car ? " · " + escapeHtml(p.car) : ""}</span>
      <h3 class="card__name">${escapeHtml(p.name)}</h3>
      <div class="card__meta">
        ${p.condition ? `<span class="badge${condOf(p) === "new" ? " badge--ok" : ""}">${escapeHtml(p.condition)}</span>` : ""}
        ${p.order ? `<span class="badge badge--order">${escapeHtml(p.order)}</span>` : ""}
        ${p.variants && p.variants.length > 1 ? `<span class="badge">${p.variants.length} вариант${plural(p.variants.length)}</span>` : ""}
        ${p.warranty ? '<span class="badge badge--ok">Гарантия</span>' : ""}
        ${p.freeDelivery ? '<span class="badge badge--ok">Доставка до ТК бесплатно</span>' : ""}
      </div>
      <div class="card__price">${priceText(p)}</div>
    </div>
  </article>`;
}

const moreCard = `
  <a class="card card--more" data-phone href="${PHONE_LINK}">
    <span class="card--more__title">Не нашли свою модель?</span>
    <span class="card--more__text">Здесь не всё, что есть в павильоне. Назовите марку, модель и год машины — подберём магнитолу, рамку и провода. Отправим в любой город России.</span>
    <span class="card--more__actions">
      <span class="btn btn--accent">Позвонить</span>
      ${MAX_LINK ? '<span class="btn btn--max" data-max-link>Написать в MAX</span>' : ""}
    </span>
  </a>`;

function render() {
  catTabs.innerHTML = ["", ...CATEGORIES].map(c => {
    const n = ITEMS.filter(p => !c || p.category === c).length;
    return `<button class="tab${state.category === c ? " is-active" : ""}" data-cat="${escapeHtml(c)}">${c ? escapeHtml(c) : "Всё"} <small>${n}</small></button>`;
  }).join("");
  // Марки и состояние — только те, что есть в выбранном разделе (у сигнализаций марок нет — строка прячется)
  const inCat = ITEMS.filter(p => !state.category || p.category === state.category);
  const cars = CARS.filter(c => inCat.some(p => hasCar(p, c)));
  if (state.car && !cars.includes(state.car)) { state.car = ""; state.model = ""; }
  carChips.hidden = !cars.length;
  const otherCars = cars.filter(c => !JP_FIRST.includes(c));
  carChips.innerHTML = `<span class="chips__label">Для машины:</span>` +
    ["", ...cars.filter(c => JP_FIRST.includes(c))].map(c =>
      `<button class="chip${state.car === c ? " is-active" : ""}" data-car="${escapeHtml(c)}">${c ? escapeHtml(c) : "Любой"}</button>`).join("") +
    (otherCars.length ? `<select class="chip chip--select${otherCars.includes(state.car) ? " is-active" : ""}" data-car-other aria-label="Другая марка">
      <option value="">Другая марка…</option>${otherCars.map(c => `<option value="${escapeHtml(c)}"${state.car === c ? " selected" : ""}>${escapeHtml(c)}</option>`).join("")}</select>` : "");
  const inCar = inCat.filter(p => (!state.car || hasCar(p, state.car)));
  // Модели выбранной марки: только те, что есть в этом разделе
  const modelCount = {};
  if (state.car) inCar.forEach(p => p.models.forEach(k => { const [c, m] = k.split("|"); if (c === state.car) modelCount[m] = (modelCount[m] || 0) + 1; }));
  const models = Object.keys(modelCount).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  if (state.model && !models.includes(state.model)) state.model = "";
  modelChips.hidden = !models.length;
  modelChips.innerHTML = models.length ? `<span class="chips__label">Модель:</span>
    <select class="chip chip--select${state.model ? " is-active" : ""}" data-model aria-label="Модель машины">
      <option value="">Все модели ${escapeHtml(state.car)}</option>${models.map(m => `<option value="${escapeHtml(m)}"${state.model === m ? " selected" : ""}>${escapeHtml(m)} (${modelCount[m]})</option>`).join("")}</select>` : "";
  const conds = CONDS.filter(([v]) => v && inCar.some(p => condOf(p) === v));
  if (state.cond && !conds.some(([v]) => v === state.cond)) state.cond = "";
  condChips.hidden = conds.length < 2;
  condChips.innerHTML = `<span class="chips__label">Состояние:</span>` +
    [CONDS[0], ...conds].map(([v, t]) => `<button class="chip${state.cond === v ? " is-active" : ""}" data-cond="${v}">${t}</button>`).join("");

  const list = filtered();
  // Если ничего не нашлось из-за выбранного раздела или марки — подсказать и дать сбросить
  const active = [state.category, state.car, state.model, state.cond && CONDS.find(c => c[0] === state.cond)[1]].filter(Boolean);
  const without = active.length && !list.length ? filtered(false).length : 0;
  const q = state.query.trim();
  countEl.innerHTML = list.length
    ? `Найдено: ${list.length}`
    : without
      ? `С фильтром «${escapeHtml(active.join(", "))}» ничего нет, но без фильтра нашлось: ${without}. <button class="btn btn--accent reset" data-reset>Показать все ${without}</button>`
      : q && MAX_LINK
        ? `Ничего не нашлось — скорее всего, подберём. <button class="btn btn--max reset" data-ask-empty>Спросить в MAX: «${escapeHtml(q.length > 30 ? q.slice(0, 30) + "…" : q)}»</button><span class="empty-tip" id="emptyTip" hidden></span>`
        : "Ничего не нашлось — позвоните, скорее всего подберём.";
  grid.innerHTML = list.slice(0, state.shown).map(card).join("") + moreCard;
  const left = list.length - state.shown;
  moreBtn.hidden = left <= 0;
  moreBtn.textContent = `Показать ещё (${left})`;
}

countEl.addEventListener("click", async e => {
  // Ничего не нашлось: кнопка MAX сама готовит сообщение с тем, что человек искал
  if (e.target.closest("[data-ask-empty]")) {
    const text = `Здравствуйте! Ищу на сайте «Автозвук из Японии»: ${state.query.trim()}. Есть такое? Моя машина (марка, модель, год): `;
    const tip = document.getElementById("emptyTip");
    tip.textContent = await openMaxWith(text) ? "Текст скопирован — вставьте его в чат MAX и отправьте." : "Напишите в MAX: " + text;
    tip.hidden = false;
    return;
  }
  if (!e.target.closest("[data-reset]")) return;
  state.category = "";
  state.car = "";
  state.model = "";
  state.cond = "";
  state.shown = PAGE;
  render();
});
catTabs.addEventListener("click", e => {
  const b = e.target.closest("[data-cat]");
  if (!b) return;
  state.category = b.dataset.cat;
  state.shown = PAGE;
  render();
});
carChips.addEventListener("click", e => {
  const b = e.target.closest("[data-car]");
  if (!b) return;
  state.car = b.dataset.car;
  state.model = "";
  state.shown = PAGE;
  render();
});
carChips.addEventListener("change", e => {
  if (!e.target.matches("[data-car-other]")) return;
  state.car = e.target.value;
  state.model = "";
  state.shown = PAGE;
  render();
});
modelChips.addEventListener("change", e => {
  state.model = e.target.value;
  state.shown = PAGE;
  render();
});
condChips.addEventListener("click", e => {
  const b = e.target.closest("[data-cond]");
  if (!b) return;
  state.cond = b.dataset.cond;
  state.shown = PAGE;
  render();
});
searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  state.shown = PAGE;
  render();
});
document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  searchInput.blur(); // спрятать клавиатуру телефона, чтобы она не закрывала результаты
  document.getElementById("catalogCount").scrollIntoView({ behavior: "smooth", block: "start" });
});
moreBtn.addEventListener("click", () => {
  const was = grid.children.length;
  state.shown += PAGE;
  render();
  // Уже показанные карточки не анимируем заново — появляются только новые
  [...grid.children].slice(0, was).forEach(c => { c.style.animation = "none"; });
});

// Окно товара
const modal = document.getElementById("productModal");
const modalBody = document.getElementById("modalBody");

function openProduct(id) {
  const p = ITEMS.find(x => x.id === id);
  if (!p) return;
  const rows = [
    ...(p.specs || []),
    ["Раздел", p.category],
    p.car && ["Для машины", p.car],
    p.condition && ["Состояние", p.condition],
    p.warranty && ["Гарантия", "Да, осмотр на месте"],
    p.order && ["Наличие", p.order],
    ["Доставка", "По всей России. До ТК в Находке — " + (p.freeDelivery ? "бесплатно" : "300 ₽")],
    ["Оплата", "Наличными или по договорённости"],
  ].filter(Boolean);
  modalBody.innerHTML = `
    ${gallery(p)}
    <div class="modal__body">
      <span class="card__cat">${escapeHtml(p.category)}</span>
      <h2>${escapeHtml(p.name)}</h2>
      ${p.description ? `<p>${escapeHtml(p.description)}</p>` : ""}
      <table class="specs">${rows.map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join("")}</table>
      ${variantsBlock(p)}
      <div class="modal__price">${priceText(p)}</div>
      <a class="btn btn--accent btn--big btn--wide" href="${PHONE_LINK}">Позвонить: ${PHONE_TEXT}</a>
      ${MAX_LINK ? `<a class="btn btn--max btn--big btn--wide modal__max" href="${escapeHtml(MAX_LINK)}" target="_blank" rel="noopener">Написать в MAX</a>` : ""}
      ${kitBlock(p)}
      ${p.farpost ? `<a class="btn btn--ghost btn--wide modal__farpost" href="${escapeHtml(p.farpost)}" target="_blank" rel="noopener">Фото и подробности на Фарпосте</a>` : ""}
      <button class="btn btn--ghost btn--wide modal__share" data-share>Поделиться ссылкой на товар</button>
      <p class="share__tip" id="shareTip" hidden></p>
    </div>`;
  historyOpen(modal, "#t=" + linkKey(p));
  if (!modal.open) modal.showModal();
  initGallery(modalBody);
}

// Комплект к магнитоле: человек выбирает машину и сразу видит рамку, провода, установку и примерную сумму
const KIT_CATS = ["Android-магнитолы", "TEYES под заказ", "Car Heaven под заказ"];
const INSTALL_FROM = 1000; // как в разделе «Услуги»
const FRAMES = ITEMS.filter(p => p.category === "Рамки и крепления");
const WIRES = ITEMS.filter(p => p.category === "Провода и аксессуары" && /провод/i.test(p.name));
const KIT_CARS = CARS.filter(c => FRAMES.some(p => hasCar(p, c)));
const kit = { car: "", model: "" };
const money = n => n.toLocaleString("ru-RU") + " ₽";
const byPrice = (a, b) => a.price - b.price;
// В прайсе бывают одинаковые строки и строки с двумя комплектами сразу — в подборе показываем по одному разу
const uniq = list => [...new Map(list.filter(p => !/Комплект.*Комплект/.test(p.name)).map(p => [p.name + p.price, p])).values()];
// Рамка уже входит в комплект магнитолы (например, Vezel) — подбирать нечего
const hasOwnFrame = p => (p.specs || []).some(([k, v]) => /комплект/i.test(k) && /рамк/i.test(v));
const kitModels = () => [...new Set(FRAMES.filter(f => hasCar(f, kit.car)).flatMap(f => f.models)
  .filter(k => k.startsWith(kit.car + "|")).map(k => k.split("|")[1]))].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
const kitModelOptions = () => `<option value="">${kit.car ? "Выберите модель" : "Сначала марка"}</option>` +
  kitModels().map(m => `<option value="${escapeHtml(m)}"${kit.model === m ? " selected" : ""}>${escapeHtml(m)}</option>`).join("");
function kitRow(x) {
  return `<button type="button" class="kit__item" data-open-id="${x.id}"><span>${escapeHtml(x.name)}</span><b>${priceText(x)}</b></button>`;
}
function kitResult(p) {
  if (!kit.car) return `<p class="kit__hint">Выберите марку и модель — покажем подходящую рамку и провода с ценами.</p>`;
  const list = kitModels();
  if (list.length && !kit.model) return `<p class="kit__hint">Теперь выберите модель ${escapeHtml(kit.car)}.</p>`;
  const allFrames = FRAMES.filter(f => hasCar(f, kit.car) && (!kit.model || hasModel(f, kit.car, kit.model)));
  const frames = uniq(allFrames).sort(byPrice);
  const ofCar = WIRES.filter(w => hasCar(w, kit.car));
  const own = kit.model ? ofCar.filter(w => hasModel(w, kit.car, kit.model)) : [];
  const generic = ofCar.filter(w => !w.models.some(k => k.startsWith(kit.car + "|")));
  const wires = uniq([...own.sort(byPrice), ...generic.sort(byPrice)]).slice(0, 3);
  if (!frames.length) return `<p class="kit__hint">Рамку для этой машины подберём по телефону или в MAX.</p>`;
  const title = kit.car + (kit.model ? " " + kit.model : "");
  const parts = [p.price, frames[0].price, wires.length ? Math.min(...wires.map(w => w.price)) : 0, INSTALL_FROM];
  const total = p.price ? parts.reduce((a, b) => a + b, 0) : 0;
  return `
    <h4>Рамка для ${escapeHtml(title)}</h4>
    ${frames.slice(0, 5).map(kitRow).join("")}
    ${frames.length > 5 ? `<button type="button" class="kit__all" data-kit-all>Все рамки для ${escapeHtml(title)} (${allFrames.length})</button>` : ""}
    ${wires.length ? `<h4>Провода</h4>${wires.map(kitRow).join("")}` : ""}
    <div class="kit__item kit__item--static"><span>Установка</span><b>от ${money(INSTALL_FROM)}</b></div>
    ${total ? `<p class="kit__total">Всё вместе — примерно от <b>${money(total)}</b></p>` : ""}
    <p class="kit__hint">Рамка и провода зависят от года и комплектации. Назовите машину — подтвердим точно. Рамки и провода — под заказ.</p>`;
}
function kitBlock(p) {
  if (!KIT_CATS.includes(p.category) || hasOwnFrame(p)) return "";
  if (state.car && KIT_CARS.includes(state.car)) { kit.car = state.car; kit.model = state.model; }
  else if (p.car && KIT_CARS.includes(p.car) && kit.car !== p.car) {
    kit.car = p.car;
    kit.model = (p.models.find(k => k.startsWith(p.car + "|")) || "").split("|")[1] || "";
  }
  if (kit.model && !kitModels().includes(kit.model)) kit.model = ""; // модель есть только у проводов, рамок к ней нет
  return `<section class="kit" data-kit="${p.id}">
    <h3>Рамка и провода под вашу машину</h3>
    <div class="kit__selects">
      <select data-kit-car aria-label="Марка машины"><option value="">Марка</option>${KIT_CARS.map(c => `<option value="${escapeHtml(c)}"${kit.car === c ? " selected" : ""}>${escapeHtml(c)}</option>`).join("")}</select>
      <select data-kit-model aria-label="Модель машины"${kit.car ? "" : " disabled"}>${kitModelOptions()}</select>
    </div>
    <div data-kit-result>${kitResult(p)}</div>
  </section>`;
}
modalBody.addEventListener("change", e => {
  const box = e.target.closest("[data-kit]");
  if (!box) return;
  if (e.target.matches("[data-kit-car]")) {
    kit.car = e.target.value;
    kit.model = "";
    const sel = box.querySelector("[data-kit-model]");
    sel.innerHTML = kitModelOptions();
    sel.disabled = !kit.car;
  } else if (e.target.matches("[data-kit-model]")) kit.model = e.target.value;
  else return;
  box.querySelector("[data-kit-result]").innerHTML = kitResult(ITEMS.find(x => x.id === Number(box.dataset.kit)));
});
modalBody.addEventListener("click", e => {
  const open = e.target.closest("[data-open-id]");
  if (open) { openProduct(Number(open.dataset.openId)); modal.scrollTop = 0; return; }
  if (e.target.closest("[data-kit-all]")) {
    Object.assign(state, { category: "Рамки и крепления", car: kit.car, model: kit.model, cond: "", query: "", shown: PAGE });
    searchInput.value = "";
    // После закрытия окна браузер возвращается на шаг назад и может вернуть прокрутку — едем к каталогу уже после этого
    addEventListener("popstate", () => catalogEl.scrollIntoView({ behavior: "smooth" }), { once: true });
    closeDialog(modal);
    render();
  }
});

// Варианты одной модели (экран, память) — у TEYES под заказ
const plural = n => n % 10 === 1 && n % 100 !== 11 ? "" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "а" : "ов";
function variantsBlock(p) {
  if (!p.variants || !p.variants.length) return "";
  return `<div class="variants">
    <h3>Варианты и цены</h3>
    <table class="variants__table">${p.variants.map(v =>
      `<tr><td>${escapeHtml(v.name)}</td><td>${v.price.toLocaleString("ru-RU")} ₽</td></tr>`).join("")}</table>
    ${p.memo ? `<p class="variants__memo">${escapeHtml(p.memo)}</p>` : ""}
  </div>`;
}

// Своя ссылка у каждого товара: номер объявления на Фарпосте (не меняется), у TEYES — своё имя, иначе номер на сайте
const linkKey = p => p.key || (p.farpost && (p.farpost.match(/-(\d+)\.html/) || [])[1]) || "p" + p.id;
const shareTip = text => { const t = document.getElementById("shareTip"); t.textContent = text; t.hidden = false; };
modalBody.addEventListener("click", async e => {
  if (!e.target.closest("[data-share]")) return;
  const url = location.href, title = modalBody.querySelector("h2").textContent;
  if (navigator.share) {
    try { await navigator.share({ title, url }); return; } catch (err) { if (err.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(url); shareTip("Ссылка скопирована — отправьте её в MAX или СМС."); }
  catch { shareTip(url); }
});
// Окно закрыли — убираем товар из адреса страницы (и шаг из истории)
modal.addEventListener("close", () => historyClose(modal));
// Открыли сайт по ссылке на товар — сразу показываем его
function openFromLink() {
  let key = "";
  try { key = decodeURIComponent((location.hash.match(/^#t=(.+)/) || [])[1] || ""); } catch { key = ""; } // кривая ссылка — просто не открываем товар
  const p = key && ITEMS.find(x => linkKey(x) === key);
  if (p) openProduct(p.id);
}

grid.addEventListener("click", e => {
  // Кнопка MAX внутри карточки «Не нашли?» открывает MAX, а не звонок
  if (e.target.closest("[data-max-link]")) {
    e.preventDefault();
    window.open(MAX_LINK, "_blank", "noopener");
    return;
  }
  const c = e.target.closest(".card[data-id]");
  if (c) openProduct(Number(c.dataset.id));
});
grid.addEventListener("keydown", e => {
  const c = e.target.closest(".card[data-id]");
  if (c && e.key === "Enter") openProduct(Number(c.dataset.id));
});
document.getElementById("modalClose").addEventListener("click", () => closeDialog(modal));
modal.addEventListener("click", e => { if (e.target === modal) closeDialog(modal); });

// Пришли со страницы рамок или раздела (?razdel=ramki&marka=Toyota&model=Aqua) — сразу ставим фильтры
// Порядок должен совпадать с CAT_SLUGS в заметки/seo_avtozvuk.js
const CAT_SLUGS = ["android", "teyes", "car-heaven", "yaponskie", "pandora", "ramki", "provoda"];
const params = new URLSearchParams(location.search);
const fromSlug = CAT_SLUGS.indexOf(params.get("razdel"));
if (fromSlug >= 0) state.category = CATEGORIES[fromSlug];
if (CARS.includes(params.get("marka"))) {
  state.car = params.get("marka");
  state.model = params.get("model") || "";
}
render();
if (fromSlug >= 0 || state.car) catalogEl.scrollIntoView();
openFromLink();
window.addEventListener("hashchange", openFromLink);

// Анимация: блоки ниже первого экрана плавно появляются при прокрутке
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".section-head, .direction, .service, .reviews__score, .review, .reviews__link, .contacts__photo, .contacts__info")
    .forEach((el, n) => { el.classList.add("reveal"); el.style.setProperty("--d", (n % 4) * 70 + "ms"); io.observe(el); });
}
