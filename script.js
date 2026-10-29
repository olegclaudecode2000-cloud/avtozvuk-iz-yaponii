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

document.getElementById("directions").innerHTML = DIRECTIONS.map(d => `
  <a class="direction" href="#catalog">
    <img src="${escapeHtml(d.image)}" alt="" loading="lazy">
    <span class="direction__body">
      <span class="direction__title">${escapeHtml(d.title)}</span>
      <span class="direction__text">${escapeHtml(d.text)}</span>
    </span>
  </a>`).join("");

const grid = document.getElementById("productGrid");
grid.innerHTML = PRODUCTS.map(p => `
  <article class="card" data-id="${p.id}" tabindex="0">
    <div class="card__img"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy"></div>
    <div class="card__body">
      <span class="card__cat">${escapeHtml(p.category)}</span>
      <h3 class="card__name">${escapeHtml(p.name)}</h3>
      <div class="card__meta">
        <span class="badge">${escapeHtml(p.condition)}</span>
        ${p.warranty ? '<span class="badge badge--ok">Гарантия</span>' : ""}
      </div>
      <div class="card__price">${priceText(p)}</div>
    </div>
  </article>`).join("") + `
  <a class="card card--more" href="${PHONE_LINK}">
    <span class="card--more__title">Нужна другая модель?</span>
    <span class="card--more__text">Назовите марку, модель и год машины — подберём магнитолу.</span>
    <span class="btn btn--accent">Позвонить</span>
  </a>`;

const modal = document.getElementById("productModal");
const modalBody = document.getElementById("modalBody");

function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  modalBody.innerHTML = `
    <div class="modal__img"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}"></div>
    <div class="modal__body">
      <span class="card__cat">${escapeHtml(p.category)}</span>
      <h2>${escapeHtml(p.name)}</h2>
      <p>${escapeHtml(p.description)}</p>
      <table class="specs">${p.specs.map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join("")}
        <tr><td>Состояние</td><td>${escapeHtml(p.condition)}</td></tr>
        ${p.warranty ? "<tr><td>Гарантия</td><td>Да, осмотр на месте</td></tr>" : ""}
      </table>
      <div class="modal__price">${priceText(p)}</div>
      <a class="btn btn--accent btn--big btn--wide" href="${PHONE_LINK}">Позвонить: ${PHONE_TEXT}</a>
      ${MAX_LINK ? `<a class="btn btn--max btn--big btn--wide modal__max" href="${escapeHtml(MAX_LINK)}" target="_blank" rel="noopener">Написать в MAX</a>` : ""}
    </div>`;
  modal.showModal();
}

grid.addEventListener("click", e => {
  const card = e.target.closest(".card[data-id]");
  if (card) openProduct(Number(card.dataset.id));
});
grid.addEventListener("keydown", e => {
  const card = e.target.closest(".card[data-id]");
  if (card && e.key === "Enter") openProduct(Number(card.dataset.id));
});
document.getElementById("modalClose").addEventListener("click", () => modal.close());
modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });
