'use strict';

// Een product scannen. De camera leest de streepjescode op de telefoon zelf: er gaat geen beeld naar internet.
// Bij de cijfers van de code zoekt de app de calorieën en de allergenen op bij Open Food Facts, een open lijst
// van producten die door vrijwilligers wordt bijgehouden.

// ---------- De streepjescode lezen (EAN-13 en EAN-8) ----------

// De breedtes van de vier streepjes van elk cijfer, in eenheden; samen altijd 7. In de linkerhelft begint een
// cijfer met wit, in de rechterhelft met zwart; de breedtes zijn dezelfde.
const EAN_WIDTHS = [[3, 2, 1, 1], [2, 2, 2, 1], [2, 1, 2, 2], [1, 4, 1, 1], [1, 1, 3, 2], [1, 2, 3, 1], [1, 1, 1, 4], [1, 3, 1, 2], [1, 2, 1, 3], [3, 1, 1, 2]];
// In de linkerhelft van een code met dertien cijfers staat elk cijfer gewoon (L) of gespiegeld (G). Welke
// van de zes gespiegeld zijn, zegt wat het eerste cijfer is.
const EAN_FIRST = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];
// Op deze hoogtes (en breedtes, voor een code die op zijn kant ligt) kijkt de app in het beeld: eerst het
// midden, daarna steeds verder naar de rand.
const SCAN_PARTS = [0.5, 0.44, 0.56, 0.38, 0.62, 0.31, 0.69, 0.24, 0.76, 0.16, 0.84];
// Het beeld wordt verkleind tot hooguit zoveel pixels aan de lange kant; dat is genoeg en gaat sneller.
const SCAN_SIZE = 960;
// Hoe vaak per seconde de app in het beeld kijkt, en hoe vaak dezelfde code gelezen moet zijn.
const SCAN_PAUSE = 150;
const SCAN_HITS = 2;

// Klopt het controlecijfer van een code van acht of dertien cijfers?
function eanValid(code) {
  if (!/^(\d{8}|\d{13})$/.test(code)) return false;
  let sum = 0;
  // Van rechts af tellen het eerste, derde, vijfde ... cijfer voor het controlecijfer drie keer.
  for (let i = 0; i < code.length - 1; i++) sum += Number(code[code.length - 2 - i]) * (i % 2 ? 1 : 3);
  return (10 - sum % 10) % 10 === Number(code[code.length - 1]);
}

// Maakt van wat iemand intypt een code: alleen de cijfers, en een Amerikaanse code van twaalf cijfers krijgt
// een nul ervoor. Geeft niets terug als het geen geldige code is.
function eanFromText(text) {
  const digits = String(text).replace(/\D/g, '');
  const code = digits.length === 12 ? `0${digits}` : digits;
  return eanValid(code) ? code : '';
}

// Zet een rij grijswaarden om in de breedtes van de streepjes, afwisselend licht en donker. De grens tussen
// licht en donker wordt per stukje van de rij bepaald, zodat een schaduw over de code niet stoort; waar een
// streepje begint, wordt tussen twee pixels in geschat.
function barRuns(gray) {
  const n = gray.length;
  const block = 24;
  const blocks = Math.ceil(n / block);
  const low = new Float32Array(blocks);
  const high = new Float32Array(blocks);
  for (let b = 0; b < blocks; b++) {
    let lo = 255;
    let hi = 0;
    for (let i = b * block; i < Math.min(n, (b + 1) * block); i++) {
      if (gray[i] < lo) lo = gray[i];
      if (gray[i] > hi) hi = gray[i];
    }
    low[b] = lo;
    high[b] = hi;
  }
  // De grens per pixel; -1 betekent dat er te weinig verschil is om streepjes te kunnen zijn.
  const limit = new Float32Array(n);
  for (let b = 0; b < blocks; b++) {
    let lo = 255;
    let hi = 0;
    for (let k = Math.max(0, b - 2); k <= Math.min(blocks - 1, b + 2); k++) {
      if (low[k] < lo) lo = low[k];
      if (high[k] > hi) hi = high[k];
    }
    const border = hi - lo < 36 ? -1 : (lo + hi) / 2;
    for (let i = b * block; i < Math.min(n, (b + 1) * block); i++) limit[i] = border;
  }
  const runs = [];
  const firstDark = gray[0] < limit[0];
  let dark = firstDark;
  let last = 0;
  for (let i = 1; i < n; i++) {
    if ((gray[i] < limit[i]) === dark) continue;
    const border = Math.max(limit[i], limit[i - 1]);
    const step = gray[i - 1] - gray[i];
    const edge = i - 1 + (step ? Math.min(1, Math.max(0, (gray[i - 1] - border) / step)) : 0.5);
    runs.push(edge - last);
    last = edge;
    dark = !dark;
  }
  runs.push(n - 1 - last);
  return { runs, firstDark };
}

// Hetzelfde, maar dan voor een wazig beeld. Daarin wordt een smal streepje nooit helemaal zwart, dus een vaste
// grens tussen licht en donker mist het. Hier telt elk dal en elke top in de rij: een streepje begint
// halverwege een top en het dal dat erop volgt.
function peakRuns(gray) {
  const n = gray.length;
  let lowest = 255;
  let highest = 0;
  for (let i = 0; i < n; i++) {
    if (gray[i] < lowest) lowest = gray[i];
    if (gray[i] > highest) highest = gray[i];
  }
  // Een omkering telt pas als het verschil groot genoeg is; kleiner is ruis.
  const swing = Math.max(5, (highest - lowest) * 0.07);
  // De plekken van de toppen en dalen, om en om. `rising` zegt of de rij op weg is naar een top (1) of een
  // dal (-1); `top` en `bottom` zijn de hoogste en laagste plek sinds de laatste omkering.
  const turns = [];
  let rising = 0;
  let top = 0;
  let bottom = 0;
  for (let i = 1; i < n; i++) {
    if (gray[i] > gray[top]) top = i;
    if (gray[i] < gray[bottom]) bottom = i;
    if (rising >= 0 && gray[top] - gray[i] > swing) {
      turns.push(top);
      rising = -1;
      bottom = i;
    } else if (rising <= 0 && gray[i] - gray[bottom] > swing) {
      turns.push(bottom);
      rising = 1;
      top = i;
    }
  }
  if (turns.length < 2) return { runs: [n - 1], firstDark: false };
  const runs = [];
  let last = 0;
  for (let t = 0; t + 1 < turns.length; t++) {
    const from = turns[t];
    const to = turns[t + 1];
    const border = (gray[from] + gray[to]) / 2;
    let edge = (from + to) / 2;
    for (let i = from; i < to; i++) {
      if ((gray[i] - border) * (gray[i + 1] - border) <= 0) {
        const step = gray[i] - gray[i + 1];
        edge = i + (step ? (gray[i] - border) / step : 0.5);
        break;
      }
    }
    runs.push(edge - last);
    last = edge;
  }
  runs.push(n - 1 - last);
  // Begint de rij met een dal, dan is het eerste stuk donker.
  return { runs, firstDark: gray[turns[0]] < gray[turns[1]] };
}

// Het cijfer dat bij vier streepbreedtes hoort, of -1 als er geen goed bij past. Met `both` mag het cijfer ook
// gespiegeld staan (linkerhelft van een code met dertien cijfers); dan komt er 10 bij het antwoord.
function eanDigit(runs, at, both) {
  const unit = (runs[at] + runs[at + 1] + runs[at + 2] + runs[at + 3]) / 7;
  let best = -1;
  let bestError = 99;
  let nextError = 99;
  for (let digit = 0; digit < 10; digit++) {
    for (let flip = 0; flip < (both ? 2 : 1); flip++) {
      let error = 0;
      for (let k = 0; k < 4; k++) error += Math.abs(runs[at + k] / unit - EAN_WIDTHS[digit][flip ? 3 - k : k]);
      if (error < bestError) {
        nextError = bestError;
        bestError = error;
        best = digit + flip * 10;
      } else if (error < nextError) {
        nextError = error;
      }
    }
  }
  return bestError <= 1.7 && nextError - bestError >= 0.35 ? best : -1;
}

// Leest een code vanaf een beginteken: `count` cijfers links (6 of 4), het middenteken, evenveel rechts en
// het eindteken. Geeft de cijfers terug, of niets als het geen kloppende code is.
function eanFrom(runs, start, count) {
  let at = start + 3;
  let digits = '';
  let pattern = '';
  for (let k = 0; k < count; k++, at += 4) {
    const digit = eanDigit(runs, at, count === 6);
    if (digit < 0) return '';
    digits += digit % 10;
    pattern += digit < 10 ? 'L' : 'G';
  }
  // Het middenteken: vijf smalle streepjes van gelijke breedte.
  const middle = (runs[at] + runs[at + 1] + runs[at + 2] + runs[at + 3] + runs[at + 4]) / 5;
  for (let k = 0; k < 5; k++) {
    if (Math.abs(runs[at + k] - middle) > middle * 0.75) return '';
  }
  at += 5;
  for (let k = 0; k < count; k++, at += 4) {
    const digit = eanDigit(runs, at, false);
    if (digit < 0) return '';
    digits += digit;
  }
  // Het eindteken, en daarna een stuk wit (als het beeld daar niet al ophoudt).
  const end = (runs[at] + runs[at + 1] + runs[at + 2]) / 3;
  if (Math.abs(runs[at] - end) > end * 0.75 || Math.abs(runs[at + 1] - end) > end * 0.75) return '';
  if (at + 4 < runs.length && runs[at + 3] < end * 2.5) return '';
  if (count === 6) {
    const first = EAN_FIRST.indexOf(pattern);
    if (first < 0) return '';
    digits = first + digits;
  }
  return eanValid(digits) ? digits : '';
}

// Zoekt in een rij streepbreedtes naar een beginteken (drie smalle streepjes na een stuk wit) en leest dan de code.
function decodeRuns(runs, firstDark) {
  for (let i = firstDark ? 0 : 1; i + 43 <= runs.length; i += 2) {
    const unit = (runs[i] + runs[i + 1] + runs[i + 2]) / 3;
    if (unit < 0.8) continue;
    if (Math.abs(runs[i] - unit) > unit * 0.6 || Math.abs(runs[i + 1] - unit) > unit * 0.6 || Math.abs(runs[i + 2] - unit) > unit * 0.6) continue;
    if (i > 0 && runs[i - 1] < unit * 2.5) continue;
    const code = (i + 59 <= runs.length && eanFrom(runs, i, 6)) || eanFrom(runs, i, 4);
    if (code) return code;
  }
  return '';
}

// Leest een code uit één rij grijswaarden, van links naar rechts of (als de code op zijn kop staat) andersom.
function decodeLine(gray) {
  // Eerst met een vaste grens tussen licht en donker (het best bij een scherp beeld), dan met toppen en dalen
  // (voor een wazig beeld).
  for (const { runs, firstDark } of [barRuns(gray), peakRuns(gray)]) {
    if (runs.length < 43) continue;
    const lastDark = firstDark !== ((runs.length - 1) % 2 === 1);
    const code = decodeRuns(runs, firstDark) || decodeRuns(runs.slice().reverse(), lastDark);
    if (code) return code;
  }
  return '';
}

let scanCanvas = null;

// Zoekt een streepjescode in een beeld (een videobeeld, een foto of een tekening) van `width` bij `height`.
// Kijkt langs een aantal rijen en, voor een code die op zijn kant ligt, langs een aantal kolommen.
function readBarcode(source, width, height) {
  if (!width || !height) return '';
  const scale = Math.min(1, SCAN_SIZE / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  if (!scanCanvas) scanCanvas = document.createElement('canvas');
  if (scanCanvas.width !== w) scanCanvas.width = w;
  if (scanCanvas.height !== h) scanCanvas.height = h;
  const context = scanCanvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(source, 0, 0, w, h);
  const pixels = context.getImageData(0, 0, w, h).data;
  // De grijswaarde van een pixel; groen telt het zwaarst, zoals het oog doet.
  const shade = at => (pixels[at] * 2 + pixels[at + 1] * 5 + pixels[at + 2]) / 8;
  const row = new Float32Array(w);
  const column = new Float32Array(h);
  for (const part of SCAN_PARTS) {
    // Drie rijen onder elkaar samen, dan stoort een vlekje of wat ruis minder.
    const y = Math.min(h - 2, Math.max(1, Math.round(h * part)));
    for (let x = 0; x < w; x++) row[x] = (shade(((y - 1) * w + x) * 4) + shade((y * w + x) * 4) + shade(((y + 1) * w + x) * 4)) / 3;
    const code = decodeLine(row);
    if (code) return code;
  }
  for (const part of SCAN_PARTS) {
    const x = Math.min(w - 2, Math.max(1, Math.round(w * part)));
    for (let y = 0; y < h; y++) column[y] = (shade((y * w + x - 1) * 4) + shade((y * w + x) * 4) + shade((y * w + x + 1) * 4)) / 3;
    const code = decodeLine(column);
    if (code) return code;
  }
  return '';
}

// ---------- De camera ----------

const scanner = {
  run: 0,           // telt elke keer dat de camera start of stopt, zodat een oude start zichzelf herkent
  stream: null,     // het beeld van de camera
  video: null,      // het onderdeel dat dat beeld toont; het scherm zet het erin (zie mountScanner)
  detector: null,   // de streepjeslezer van de telefoon zelf, als die er een heeft
  timer: 0,
  busy: false,
  last: '',         // de code die het laatst is gelezen, en hoe vaak achter elkaar
  hits: 0,
  onCode: null,
};

// Zet de camera aan en roept `onCode` aan zodra er een streepjescode is gelezen. Lukt het aanzetten niet
// (geen camera, of geen toestemming), dan volgt een fout.
async function startScanner(onCode) {
  stopScanner();
  const run = scanner.run;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('geen camera');
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
  });
  // Is de gebruiker intussen al weggegaan, dan gaat de camera meteen weer uit.
  if (run !== scanner.run) {
    stream.getTracks().forEach(track => track.stop());
    return;
  }
  const video = document.createElement('video');
  // Zonder deze twee speelt een iPhone het beeld niet in de pagina af.
  video.setAttribute('playsinline', '');
  video.muted = true;
  video.srcObject = stream;
  scanner.stream = stream;
  scanner.video = video;
  scanner.onCode = onCode;
  scanner.last = '';
  scanner.hits = 0;
  scanner.detector = null;
  if ('BarcodeDetector' in window) {
    try { scanner.detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a'] }); } catch (e) { /* dan leest de app zelf */ }
  }
  mountScanner();
  scanner.timer = setInterval(scanFrame, SCAN_PAUSE);
}

function stopScanner() {
  scanner.run++;
  clearInterval(scanner.timer);
  if (scanner.stream) scanner.stream.getTracks().forEach(track => track.stop());
  if (scanner.video) {
    scanner.video.srcObject = null;
    scanner.video.remove();
  }
  scanner.stream = null;
  scanner.video = null;
  scanner.onCode = null;
  scanner.busy = false;
}

// Zet het camerabeeld in het scherm. Het scherm wordt bij elke wijziging opnieuw opgebouwd, het beeld blijft hetzelfde.
function mountScanner() {
  const host = document.getElementById('scan-host');
  if (!host || !scanner.video) return;
  if (scanner.video.parentNode !== host) host.appendChild(scanner.video);
  scanner.video.play().catch(() => {});
}

// Kijkt één keer in het beeld. De lezer van de telefoon zelf gaat voor; vindt die niets, dan leest de app.
async function scanFrame() {
  const video = scanner.video;
  if (!video || scanner.busy || video.readyState < 2) return;
  scanner.busy = true;
  const run = scanner.run;
  let code = '';
  try {
    if (scanner.detector) {
      for (const found of await scanner.detector.detect(video)) code = code || eanFromText(found.rawValue);
    }
  } catch (e) {
    scanner.detector = null;
  }
  if (run !== scanner.run) return;
  try {
    if (!code) code = readBarcode(video, video.videoWidth, video.videoHeight);
  } catch (e) { /* een beeld dat niet te lezen is, slaan we over */ }
  scanner.busy = false;
  if (!code) return;
  scanner.hits = code === scanner.last ? scanner.hits + 1 : 1;
  scanner.last = code;
  if (scanner.hits < SCAN_HITS) return;
  const done = scanner.onCode;
  stopScanner();
  if (done) done(code);
}

// ---------- Het product opzoeken ----------

const PRODUCT_API = 'https://world.openfoodfacts.org/api/v2/product/';
const PRODUCT_FIELDS = 'code,product_name,product_name_nl,brands,quantity,serving_size,nutriments,nutrition_data_per,allergens_tags,traces_tags,ingredients_text_nl,ingredients_text';
// Zo lang (in milliseconden) mag het opzoeken duren.
const PRODUCT_PATIENCE = 12000;
// De namen waaronder Open Food Facts de veertien allergenen bijhoudt, met het allergeen van de app erbij.
const PRODUCT_ALLERGENS = {
  'en:gluten': 'gluten', 'en:crustaceans': 'schaaldieren', 'en:eggs': 'ei', 'en:fish': 'vis', 'en:peanuts': 'pinda',
  'en:soybeans': 'soja', 'en:milk': 'melk', 'en:nuts': 'noten', 'en:celery': 'selderij', 'en:mustard': 'mosterd',
  'en:sesame-seeds': 'sesam', 'en:sulphur-dioxide-and-sulphites': 'sulfiet', 'en:lupin': 'lupine', 'en:molluscs': 'weekdieren',
};

// Zoekt een product op bij zijn streepjescode. Geeft het product terug (zie cleanProduct), of niets als
// Open Food Facts het niet kent. Lukt het opzoeken zelf niet, dan volgt een fout.
async function lookupProduct(code) {
  const control = new AbortController();
  const timer = setTimeout(() => control.abort(), PRODUCT_PATIENCE);
  try {
    const response = await fetch(`${PRODUCT_API}${code}.json?fields=${PRODUCT_FIELDS}`, { signal: control.signal });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`antwoord ${response.status}`);
    const data = await response.json();
    return data && data.status === 1 && data.product && typeof data.product === 'object' ? cleanProduct(code, data.product) : null;
  } finally {
    clearTimeout(timer);
  }
}

// Haalt uit het antwoord van Open Food Facts wat de app nodig heeft, en vertrouwt daarbij niets: alles wordt
// tekst of getal van een redelijke lengte en grootte.
function cleanProduct(code, raw) {
  const text = (value, length) => typeof value === 'string' ? value.replace(/_/g, '').replace(/\s+/g, ' ').trim().slice(0, length) : '';
  const amount = value => {
    const number = typeof value === 'string' ? Number(value) : value;
    return typeof number === 'number' && Number.isFinite(number) && number >= 0 && number < 10000 ? Math.round(number) : null;
  };
  const nutriments = raw.nutriments && typeof raw.nutriments === 'object' ? raw.nutriments : {};
  const kcal = amount(nutriments['energy-kcal_100g']);
  const joules = amount(nutriments.energy_100g);
  // Bekende allergenen als de sleutels van de app; de rest (wat Open Food Facts er verder bij zet) als tekst.
  const allergens = value => {
    const tags = (Array.isArray(value) ? value : []).filter(tag => typeof tag === 'string').slice(0, 30);
    return {
      known: [...new Set(tags.filter(tag => Object.hasOwn(PRODUCT_ALLERGENS, tag)).map(tag => PRODUCT_ALLERGENS[tag]))],
      other: tags.filter(tag => !Object.hasOwn(PRODUCT_ALLERGENS, tag)).map(tag => text(tag.replace(/^[a-z]{2,3}:/, '').replace(/-/g, ' '), 30)).filter(Boolean),
    };
  };
  return {
    code,
    name: text(raw.product_name_nl, 80) || text(raw.product_name, 80) || 'Product zonder naam',
    brand: text(raw.brands, 60),
    quantity: text(raw.quantity, 30),
    serving: text(raw.serving_size, 30),
    // Staat de energie er alleen in kilojoule, dan rekent de app om.
    kcal: kcal != null ? kcal : joules != null ? Math.round(joules / 4.184) : null,
    kcalServing: amount(nutriments['energy-kcal_serving']),
    liquid: /ml$/i.test(text(raw.nutrition_data_per, 10)),
    contains: allergens(raw.allergens_tags),
    traces: allergens(raw.traces_tags),
    ingredients: text(raw.ingredients_text_nl, 1500) || text(raw.ingredients_text, 1500),
  };
}
