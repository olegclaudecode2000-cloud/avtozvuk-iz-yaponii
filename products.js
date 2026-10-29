// Товары папы. Данные взяты из объявлений на Фарпосте.
// price: число в рублях или null — тогда «Цена по запросу»
// priceFrom: true — показать «от ...»
// image: пока временные фото с Unsplash, заменить на свои

const PHONE_LINK = "tel:+79147133074";
const PHONE_TEXT = "8 914 713-30-74";
// Ссылка на профиль в MAX. Пока пусто — кнопка «Написать в MAX» скрыта.
const MAX_LINK = "";

const PRODUCTS = [
  {
    id: 1,
    category: "Android-магнитолы",
    name: "Автомагнитола Toyota на Android 4/128",
    image: "images/toyota.jpg",
    price: 8000, priceFrom: true,
    condition: "Новая", warranty: true,
    specs: [
      ["Память", "4 ГБ / 128 ГБ"],
      ["Система", "Android 14"],
      ["Размер", "100 × 200"],
      ["Функции", "GPS, Bluetooth, YouTube"],
      ["Воспроизведение", "MP3, DVD, USB, видео и музыка"],
      ["Подключение", "сабвуфер, камера, мультируль, фишки Toyota"],
    ],
    description: "Новая магнитола под Toyota. Цена от 8 000 до 15 000 ₽ в зависимости от модели. Модели меняются — приезжайте, выбор есть. Возможна установка.",
  },
  {
    id: 2,
    category: "Android-магнитолы",
    name: "Автомагнитола Car Heaven T100 4/128 для Honda Vezel 2026",
    image: "images/honda.jpg",
    price: 13000, priceFrom: false,
    condition: "Новая", warranty: true,
    specs: [
      ["Память", "4 ГБ / 128 ГБ"],
      ["Система", "Android 14"],
      ["Экран", "9\" в рамке, есть вариант 10\""],
      ["Комплект", "все фишки, CAN Bus, рамка"],
      ["Работает", "мультируль, штатная камера"],
    ],
    description: "Полный комплект для Honda Vezel 2026 года. Возможна установка — +3 000 ₽.",
  },
];

// Направления — то, что есть в павильоне. Точный ассортимент уточняется.
const DIRECTIONS = [
  { title: "Android-магнитолы", text: "Под конкретную модель авто, с рамкой и проводкой", image: "images/honda.jpg" },
  { title: "Японские магнитолы", text: "Panasonic, Sony, JVC, Addzest и другие", image: "images/japan.jpg" },
  { title: "Колонки, сабвуферы, усилители", text: "Наличие уточняйте по телефону", image: "images/sub.jpg" },
];
