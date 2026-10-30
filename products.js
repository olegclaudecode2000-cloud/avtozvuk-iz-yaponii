// Товары папы. Данные взяты из объявлений на Фарпосте.
// price: число в рублях или null — тогда «Цена по запросу»
// priceFrom: true — показать «от ...»
// image: фото из объявлений на Фарпосте (папка images/fp)
// farpost: ссылка на объявление (там фото и подробности)

const PHONE_LINK = "tel:+79147133074";
const PHONE_TEXT = "8 914 713-30-74";
// Ссылка на профиль папы в MAX. Если оставить пустой — кнопки «Написать в MAX» скроются.
const MAX_LINK = "https://max.ru/u/f9LHodD0cOLUMGpsCuepJZE-tlHACLYGTLT-9EVgtx3WlIWfsYIhPEzz1VA";

const PRODUCTS = [
  {
    id: 1,
    category: "Android-магнитолы",
    name: "Автомагнитола Toyota на Android 4/128",
    image: "images/fp/52115064.jpg",
    images: ["images/fp/52115064.jpg", "images/fp/52115064-2.jpg", "images/fp/52115064-3.jpg", "images/fp/52115064-4.jpg", "images/fp/52115064-5.jpg", "images/fp/52115064-6.jpg", "images/fp/52115064-7.jpg", "images/fp/52115064-8.jpg", "images/fp/52115064-9.jpg", "images/fp/52115064-10.jpg", "images/fp/52115064-11.jpg", "images/fp/52115064-12.jpg"],
    car: "Toyota",
    farpost: "https://www.farpost.ru/nakhodka/auto/audio/radio/avtomagnitola-toyota-android-4-128-novaja-garantija-52115064.html",
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
    image: "images/fp/138070510.jpg",
    images: ["images/fp/138070510.jpg", "images/fp/138070510-2.jpg", "images/fp/138070510-3.jpg", "images/fp/138070510-4.jpg", "images/fp/138070510-5.jpg", "images/fp/138070510-6.jpg", "images/fp/138070510-7.jpg"],
    car: "Honda",
    farpost: "https://www.farpost.ru/nakhodka/auto/audio/radio/avtomagnitola-t100-android-na-4-128-honda-vezel-26-goda-138070510.html",
    price: 13000, priceFrom: false,
    condition: "Новая", warranty: true,
    specs: [
      ["Память", "4 ГБ / 128 ГБ"],
      ["Система", "Android 14"],
      ["Экран", "9\" в рамке, есть вариант 10\""],
      ["Комплект", "все фишки, CAN Bus, рамка"],
      ["Работает", "мультируль, штатная камера"],
    ],
    description: "Полный комплект для Honda Vezel 2026 года. Возможна установка — от 1 000 ₽.",
  },
];

// Направления — плитки над каталогом. filter — какой раздел каталога открыть.
const DIRECTIONS = [
  { title: "Android-магнитолы", text: "Новые, с гарантией, от 8 000 ₽", image: "images/honda.jpg", filter: "Android-магнитолы" },
  { title: "Японские магнитолы", text: "Pioneer, Kenwood, Alpine, Toyota, Clarion и другие", image: "images/tile-japan.jpg", filter: "Японские магнитолы" },
  { title: "Сигнализации Pandora", text: "Автозапуск, управление с телефона, установка 7 000 ₽", image: "images/fp/64527981.jpg", filter: "Сигнализации Pandora" },
  { title: "Рамки, крепления, провода", text: "Под Toyota, Honda, Nissan, Mazda, Subaru", image: "images/tile-frames.jpg", filter: "Рамки и крепления" },
];

// Разделы каталога в нужном порядке
const CATEGORIES = ["Android-магнитолы", "Японские магнитолы", "Сигнализации Pandora", "Рамки и крепления", "Провода и аксессуары"];
