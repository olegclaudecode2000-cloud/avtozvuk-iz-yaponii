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

// Все товары: сначала подробные карточки с фото, потом остальное с Фарпоста
// oem — официальное фото производителя: оно становится главным,
// а фото из объявления (реальное состояние товара) идут следом при листании
const withOem = p => p.oem
  ? { ...p, image: p.oem, images: [p.oem, ...(p.images || (p.image ? [p.image] : []))] }
  : p;
const ITEMS = [
  ...PRODUCTS,
  ...CATALOG.map((p, i) => ({ ...p, id: 1000 + i })),
].map(withOem);
document.querySelectorAll("[data-count]").forEach(el => el.textContent = ITEMS.length);

// Рисунки вместо фото, пока своих фото нет
const svg = inner => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const ICONS = {
  "Android-магнитолы": svg('<rect x="2.5" y="5" width="19" height="13" rx="2"/><path d="M6 8.5h12v6H6z"/><path d="M9 21h6"/>'),
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
const state = { category: "", car: "", query: "", shown: PAGE };
const CARS = [...new Set(ITEMS.map(p => p.car).filter(Boolean))];

const grid = document.getElementById("productGrid");
const catTabs = document.getElementById("catTabs");
const carChips = document.getElementById("carChips");
const countEl = document.getElementById("catalogCount");
const moreBtn = document.getElementById("moreBtn");
const searchInput = document.getElementById("searchInput");

function filtered(withFilters = true) {
  const words = state.query.toLowerCase().split(/\s+/).filter(Boolean);
  return ITEMS.filter(p => {
    if (withFilters && state.category && p.category !== state.category) return false;
    if (withFilters && state.car && p.car !== state.car) return false;
    const text = [p.name, p.category, p.car].join(" ").toLowerCase();
    return words.every(w => text.includes(w));
  });
}

function card(p) {
  return `
  <article class="card${p.image ? "" : " card--plain"}" data-id="${p.id}" tabindex="0">
    <div class="card__img">${picture(p)}${p.images && p.images.length > 1 ? `<span class="card__photos">${p.images.length} фото</span>` : ""}</div>
    <div class="card__body">
      <span class="card__cat">${escapeHtml(p.category)}${p.car ? " · " + escapeHtml(p.car) : ""}</span>
      <h3 class="card__name">${escapeHtml(p.name)}</h3>
      <div class="card__meta">
        ${p.condition ? `<span class="badge">${escapeHtml(p.condition)}</span>` : ""}
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
  carChips.innerHTML = `<span class="chips__label">Для машины:</span>` +
    ["", ...CARS].map(c =>
      `<button class="chip${state.car === c ? " is-active" : ""}" data-car="${escapeHtml(c)}">${c ? escapeHtml(c) : "Любой"}</button>`).join("");

  const list = filtered();
  // Если ничего не нашлось из-за выбранного раздела или марки — подсказать и дать сбросить
  const active = [state.category, state.car].filter(Boolean);
  const without = active.length && !list.length ? filtered(false).length : 0;
  countEl.innerHTML = list.length
    ? `Найдено: ${list.length}`
    : without
      ? `С фильтром «${escapeHtml(active.join(", "))}» ничего нет, но без фильтра нашлось: ${without}. <button class="btn btn--accent reset" data-reset>Показать все ${without}</button>`
      : "Ничего не нашлось — позвоните, скорее всего подберём.";
  grid.innerHTML = list.slice(0, state.shown).map(card).join("") + moreCard;
  const left = list.length - state.shown;
  moreBtn.hidden = left <= 0;
  moreBtn.textContent = `Показать ещё (${left})`;
}

countEl.addEventListener("click", e => {
  if (!e.target.closest("[data-reset]")) return;
  state.category = "";
  state.car = "";
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
  state.shown = PAGE;
  render();
});
searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  state.shown = PAGE;
  render();
});
document.getElementById("searchForm").addEventListener("submit", e => e.preventDefault());
moreBtn.addEventListener("click", () => {
  state.shown += PAGE;
  render();
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
    ["Доставка", "По всей России. До ТК в Находке — " + (p.freeDelivery ? "бесплатно" : "300 ₽")],
  ].filter(Boolean);
  modalBody.innerHTML = `
    ${gallery(p)}
    <div class="modal__body">
      <span class="card__cat">${escapeHtml(p.category)}</span>
      <h2>${escapeHtml(p.name)}</h2>
      ${p.description ? `<p>${escapeHtml(p.description)}</p>` : ""}
      <table class="specs">${rows.map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join("")}</table>
      <div class="modal__price">${priceText(p)}</div>
      <a class="btn btn--accent btn--big btn--wide" href="${PHONE_LINK}">Позвонить: ${PHONE_TEXT}</a>
      ${MAX_LINK ? `<a class="btn btn--max btn--big btn--wide modal__max" href="${escapeHtml(MAX_LINK)}" target="_blank" rel="noopener">Написать в MAX</a>` : ""}
      ${p.farpost ? `<a class="btn btn--ghost btn--wide modal__farpost" href="${escapeHtml(p.farpost)}" target="_blank" rel="noopener">Фото и подробности на Фарпосте</a>` : ""}
    </div>`;
  modal.showModal();
  initGallery(modalBody);
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
document.getElementById("modalClose").addEventListener("click", () => modal.close());
modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });

render();
