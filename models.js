// Какие марки и модели искать в названиях рамок и проводов.
// Модель — либо строка («Aqua»), либо пара [название на сайте, образец для поиска в названии заглавными буквами].
// Этим файлом пользуются и сайт (script.js), и программа страниц (заметки/seo_avtozvuk.js).
const CAR_INDEX =
{
  "makes": {
    "Toyota": "TOYOTA|\\bTLC\\b", "Lexus": "LEXUS", "Honda": "HONDA", "Nissan": "NISSAN", "Infiniti": "INFINITI", "Mazda": "MAZDA",
    "Mitsubishi": "MITSUBISHI", "Subaru": "SUBARU", "Suzuki": "SUZUKI", "Daihatsu": "DAIHATSU", "Isuzu": "ISUZU",
    "Hyundai": "HYUNDAI", "Kia": "\\bKIA\\b", "Audi": "\\bAUDI\\b", "BMW": "\\bBMW\\b", "Mercedes-Benz": "MERCEDES|\\bBENZ\\b",
    "Volkswagen": "\\bVW\\b|VOLKSWAGEN", "Skoda": "SKODA", "Ford": "\\bFORD\\b", "Chevrolet": "CHEVROLET", "Renault": "RENAULT|\\bRENO\\b",
    "Peugeot": "PEUGEOT", "Citroen": "CITROEN", "Opel": "\\bOPEL\\b", "Volvo": "VOLVO", "Fiat": "\\bFIAT\\b", "Seat": "\\bSEAT\\b",
    "Jeep": "\\bJEEP\\b", "Chrysler": "CHRYSLER", "Dodge": "\\bDODGE\\b", "Hummer": "HUMMER", "Porsche": "PORSCHE",
    "SsangYong": "SSANG ?YONG", "Chery": "\\bCHERY\\b", "Geely": "\\bGEELY\\b", "Lifan": "\\bLIFAN\\b", "Great Wall": "GREAT WALL", "JAC": "\\bJAC\\b", "FAW": "\\bFAW\\b", "Daewoo": "DAEWOO",
    "Lada": "\\bLADA\\b", "ГАЗ": "\\bGAZ(EL)?\\b", "УАЗ": "УАЗ|\\bUAZ\\b"
  },
  "models": {
    "Toyota": [["4Runner", "4 ?RUNNER"], "Allion", "Alphard", "Aqua", "Aristo", "Auris", "Avalon", "Avensis", "Axio", "bB", "Belta", ["C-HR", "C-?HR"], "Caldina", "Camry", "Carina", "Celica", "Chaser", "Corolla", "Cresta", "Crown", "Estima", "Fielder", "FJ Cruiser", "Fortuner", "Funcargo", "Harrier", "Hiace", "Highlander", ["Hilux", "HILUX(?! ?SURF)"], "Hilux Surf", "Ipsum", "Isis", "Ist", ["Land Cruiser", "LAND ?CRUISER(?! ?PRADO)|\\bLC-?\\d{3}\\b"], ["Mark II", "MARK ?(II|2|110)\\b"], "Mark X", "Noah", "Passo", "Picnic", "Porte", "Prado", "Premio", "Previa", "Prius", "Probox", "Ractis", "Raize", "Raum", ["RAV4", "RAV ?-?4"], "Reiz", "Rush", "Sequoia", "Sienna", "Sienta", "Spade", "Succeed", "Tacoma", "Tank", "Townace", "Tundra", "Vanguard", "Vellfire", "Venza", "Verso", "Vista", "Vitz", "Voxy", "Windom", "Wish", "Yaris"],
    "Lexus": [["ES", "\\bES ?\\d*\\b"], ["GS", "\\bGS ?\\d*\\b"], ["GX", "\\bGX ?\\d*\\b"], ["IS", "\\bIS ?\\d{3}\\b"], ["LS", "\\bLS ?\\d*\\b"], ["LX", "\\bLX ?\\d*\\b"], ["NX", "\\bNX ?\\d*\\b"], ["RX", "\\bRX[- ]?\\d*\\b"]],
    "Honda": ["Accord", "Airwave", "City", "Civic", "CR-V", "CR-Z", "Crossroad", "Edix", "Element", "Elysion", "Fit", "Freed", "HR-V", "Insight", "Integra", "Jade", "Jazz", ["Mobilio", "M[O0]BILIO"], "N-Box", "N-One", "N-WGN", "Odyssey", "Pilot", "Ridgeline", "Shuttle", "Spike", "Stepwgn", "Stream", "Vezel", "ZR-V"],
    "Nissan": ["AD", "Almera", "Caravan", "Cube", "Dayz", "Dualis", "Elgrand", "Juke", "Kicks", "Lafesta", "Leaf", "March", "Micra", "Moco", "Murano", "Navara", "Note", "NV200", "NV350", "NV400", "Pathfinder", "Patrol", "Primera", "Pulsar", "Qashqai", "Quest", "Safari", "Sentra", "Serena", "Sunny", "Sylphy", "Teana", "Terrano", "Tiida", "Wingroad", "X-Trail", "Xterra"],
    "Infiniti": [["FX", "\\bFX ?\\d*\\b"], ["G", "\\bG ?\\d*\\b"], ["M", "\\bM ?\\d{2}\\b"], ["QX", "\\bQX ?\\d*\\b"]],
    "Mazda": [["Mazda 2 / Demio", "\\bMAZDA ?2\\b|DEMIO"], ["Mazda 3 / Axela", "\\bMAZDA ?3\\b|AXELA"], ["Mazda 5 / Premacy", "\\bMAZDA ?5\\b|PREMACY"], ["Mazda 6 / Atenza", "\\bMAZDA ?6\\b|AT+ENZA"], "Biante", ["CX-3", "CX-?3"], ["CX-4", "CX-?4"], ["CX-5", "CX-?5"], ["CX-7", "CX-?7"], ["CX-9", "CX-?9"], "Familia", "MPV", "MX-5", "RX-8", "Tribute", "Verisa"],
    "Mitsubishi": ["Airtrek", "ASX", "Colt", "Delica", "Eclipse Cross", "Galant", "Grandis", "L200", "Lancer", "Mirage", "Outlander", ["Pajero", "PAJERO(?! ?(SPORT|MINI))"], "Pajero Mini", "Pajero Sport", "RVR", "Triton", "Xpander"],
    "Subaru": ["Exiga", "Forester", "Impreza", "Legacy", "Levorg", "Outback", "Tribeca", "XV"],
    "Suzuki": ["Alto", "Baleno", "Cultus", "Ertiga", "Escudo", "Every", ["Grand Vitara", "GRAND ?VITARA"], "Hustler", "Ignis", "Jimny", "Liana", "Solio", "Swift", "SX4", ["Vitara", "(^|[^D ]) ?VITARA"], "Wagon R", "XBee"],
    "Daihatsu": ["Hijet", "Mira", "Move", "Rocky", "Taft", "Tanto", "Terios", "YRV"],
    "Isuzu": ["Bighorn", "D-Max", "MU-X"],
    "Hyundai": ["Creta", "Elantra", "Genesis", ["H1 / Starex", "\\bH-?1\\b|STAREX"], ["I20", "\\bI-?20"], ["I30", "\\bI-?30"], ["I40", "\\bI-?40"], "IX25", "IX35", "IX45", "Getz", "Matrix", "Santa Fe", "Solaris", "Sonata", "Staria", "Tucson", "Veracruz", "Verna"],
    "Kia": ["Bongo", "Carens", "Carnival", "Ceed", "Cerato", "Forte", "K3", "K5", "Magentis", "Mohave", "Morning", "Niro", "Optima", "Picanto", "Rio", "Seltos", "Sorento", "Soul", "Sportage"],
    "Audi": ["A3", "A4", "A6", "Q5", "TT"],
    "BMW": [["1 серия", "\\bBMW ?1\\b"], ["3 серия (E46, E90)", "\\bE46\\b|\\bE9[0-3]\\b"], ["5 серия", "\\bBMW ?5\\b|\\bE39\\b"], "X1", "X3", "X5"],
    "Mercedes-Benz": [["A-Class", "\\bA-CLASS"], ["B-Class", "\\bB-CLASS"], ["C-Class", "\\b[CС][- ]CLASS|BENZ C \\d{4}"], ["CLK", "\\bCLK"],["E-Class", "\\bE-CLASS"], "GLK", ["ML", "\\bML ?\\d*\\b"], ["R-Class", "\\bR-CLASS"], ["S-Class", "\\bS-CLASS"], ["SL / SLK", "\\bSL(K|-CLASS)"], "Smart", "Sprinter", "Viano", "Vito"],
    "Volkswagen": ["Amarok", "Beetle", "Caddy", "Crafter", "Golf", "Jetta", "Multivan", "Passat", "Polo", "Sharan", "Teramont", "Tiguan", ["Touareg", "TOUA?REG"], "Touran"],
    "Skoda": ["Fabia", "Kodiaq", "Octavia", "Rapid", "Superb", "Yeti"],
    "Ford": ["C-Max", "Ecosport", "Escape", "F150", "Fiesta", "Focus", "Fusion", "Kuga", "Mondeo", "Ranger", "S-Max", "Transit"],
    "Chevrolet": ["Aveo", "Captiva", "Cobalt", "Cruze", "Epica", "Lacetti", "Malibu", "Niva", "Spark", "Tahoe", "Trailblazer"],
    "Renault": ["Arkana", "Clio", "Dokker", "Duster", "Kangoo", "Kaptur", "Koleos", "Logan", "Master", "Megane", "Sandero", "Trafic"],
    "Lada": ["Granta", "Largus", "Niva", "Priora", "Samara", "Vesta", "X-Ray"],
    "Jeep": ["Cherokee", "Commander", "Compass", ["Grand Cherokee", "GRAND ?CHEROKEE"], "Renegade", "Wrangler"],
    "Chery": [["Tiggo 3", "TIGGO ?3"], ["Tiggo 5", "TIGGO ?5"], ["Tiggo 7", "TIGGO ?7"], "E3", "E5"],
    "Peugeot": ["206", "207", "301", "307", "408"],
    "Volvo": ["S40", "S60", "S80", "V70", "XC60", "XC70", "XC90"],
    "SsangYong": ["Actyon", "Chairman", "Rexton"],
    "Fiat": ["500", "Albea", "Bravo", "Doblo", "Ducato", "Siena", "Stilo"],
    "Chrysler": ["300C", "Grand Voyager", "PT Cruiser"],
    "Dodge": ["Caliber", "Journey", "RAM"],
    "Geely": ["Emgrand", "GX7"],
    "Great Wall": ["Hover", "Wingle"],
    "Hummer": ["H2", "H3"],
    "Lifan": ["620", "X50", "X60"],
    "Opel": ["Astra", "Zafira"],
    "Citroen": ["C4", "Jumpy"]
  }
}
;

// В прайсе встречаются китайские пометки и удвоенное слово «Рамка» — покупателю показываем без них
const cleanName = s => s.replace(/寸/g, "″").replace(/[\u3000-\u9fff\uff00-\uffef]+/g, " ")
  .replace(/^Рамка (Установочный комплект|Крышка)/, "$1").replace(/^Рамка рамка /i, "Рамка ").replace(/подключения(?=[A-Z])/g, "подключения ").replace(/\s+/g, " ").trim();

const MAKE_TESTS = Object.entries(CAR_INDEX.makes).map(([make, re]) => [make, new RegExp(re)]);
const MODEL_TESTS = Object.fromEntries(Object.entries(CAR_INDEX.models).map(([make, list]) => [make, list.map(m => Array.isArray(m)
  ? [m[0], new RegExp(m[1])]
  : [m, new RegExp("(^|[^A-Z0-9])" + m.toUpperCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[-\s]/g, "[-\\s]?") + "(?![A-Z])")])]));
const CAR_FROM_NAME = ["Рамки и крепления", "Провода и аксессуары"];

// Дописать товару марки (cars) и модели (models, вида «Toyota|Aqua»)
function tagCars(p) {
  const N = p.name.toUpperCase();
  let cars = p.car ? [p.car] : [];
  if (CAR_FROM_NAME.includes(p.category)) {
    const found = MAKE_TESTS.filter(([, re]) => re.test(N)).map(([m]) => m);
    if (found.length) cars = found;
    else if (!cars.length) cars = Object.keys(MODEL_TESTS).filter(m => MODEL_TESTS[m].some(([, re]) => re.test(N)));
    p.car = cars[0] || "";
  }
  p.cars = cars;
  p.models = cars.flatMap(c => (MODEL_TESTS[c] || []).filter(([, re]) => re.test(N)).map(([m]) => c + "|" + m));
  return p;
}
