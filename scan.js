'use strict';

// Herkennen wat je eet, op twee manieren met dezelfde camera.
// 1. Een streepjescode leest de camera op de telefoon zelf: daarvoor gaat er geen beeld naar internet. Bij de
//    cijfers van de code zoekt de app de calorieën en de allergenen op bij Open Food Facts, een open lijst van
//    producten die door vrijwilligers wordt bijgehouden.
// 2. Een foto van eten gaat naar een AI op internet (zie "Eten herkennen op een foto" onderaan), die zegt wat
//    het is en de calorieën en de allergenen schat. Dat gebeurt alleen als de gebruiker zelf op de knop drukt.

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

// ---------- Eten herkennen op een foto ----------

// De foto gaat naar Claude, een AI van het bedrijf Anthropic. Dat kost geld per foto; de gebruiker betaalt dat
// zelf, met een eigen sleutel. Die sleutel staat los van de gegevens van de app, alleen op dit apparaat: hij
// gaat dus niet mee in een back-up.
const FOOD_API = 'https://api.anthropic.com/v1/messages';
const FOOD_MODEL = 'claude-sonnet-5-5';
const FOOD_KEY_STORE = 'wat-eten-we-sleutel';
// Zo lang (in milliseconden) mag het herkennen duren.
const FOOD_PATIENCE = 60000;
// De foto gaat verkleind de deur uit: hooguit zoveel pixels aan de lange kant. Groter kost meer en helpt weinig.
const FOOD_PHOTO_SIZE = 1024;
const FOOD_KINDS = ['gerecht', 'product', 'ingredient', 'drank', 'geen'];
const FOOD_SURE = ['hoog', 'redelijk', 'laag'];
const FOOD_ALLERGENS = Object.values(PRODUCT_ALLERGENS);

// Wat de herkenner te horen krijgt.
const FOOD_RULES = `Je bent de herkenner in een Nederlandse app die mensen helpt kiezen wat ze eten. Je krijgt één foto. Zeg wat voor eten of drinken erop staat en schat de calorieën en de allergenen. Schrijf alles in gewoon Nederlands.

De velden:
- soort: "gerecht" (bereid eten, op een bord of in een pan), "product" (iets in een verpakking), "ingredient" (los en onbewerkt, zoals een appel of een ei), "drank", of "geen" als er geen eten of drinken op de foto staat. Bij "geen" laat je de andere velden leeg.
- naam: de gewone Nederlandse naam, kort, met alleen een hoofdletter aan het begin. Bij een product: het merk en de naam zoals op de verpakking.
- zeker: "hoog" als je het duidelijk ziet, "redelijk" als het erop lijkt, "laag" als je gokt.
- anders: hooguit drie andere dingen die het ook zouden kunnen zijn. Leeg als je zeker bent.
- portie: wat er te zien is, in gewone woorden en met een schatting in gram of milliliter. Bijvoorbeeld: "één bord, ongeveer 400 gram".
- kcal: je beste schatting voor alles wat er te zien is (de hele portie, of de hele verpakking als de inhoud leesbaar is). kcal_min en kcal_max geven de marge. Kun je het echt niet schatten, geef dan null.
- kcal_per_100: alleen als de voedingswaarde op een verpakking leesbaar is; anders null.
- onderdelen: de losse onderdelen die je op het bord ziet, elk met een schatting in gram en kcal. Leeg bij een product of bij één los ding.
- bevat: allergenen die er zeker of bijna zeker in zitten. Je ziet ze (kaas, ei, garnalen, pinda's, brood), ze horen bij de kern van het gerecht (pasta is gluten, tenzij er iets anders staat), of ze staan op het etiket.
- kan_bevatten: allergenen die vaak in dit gerecht verwerkt zijn maar die je niet kunt zien (boter of room, sojasaus, selderij in bouillon, mosterd in dressing, noten in pesto), en wat op een etiket bij "kan sporen bevatten van" staat.
- etiket_gelezen: true als je de ingrediënten of de allergenen van een verpakking echt hebt kunnen lezen.
- ingredienten: wat er waarschijnlijk in zit, elk in een of twee woorden, hooguit twintig. Bij een leesbaar etiket: wat daar staat.
- opmerking: één korte zin als de gebruiker iets moet weten, bijvoorbeeld dat de saus niet te zien is en veel kan uitmaken. Anders leeg.

Bij allergenen is missen erger dan te veel noemen: twijfel je, zet het allergeen dan bij kan_bevatten. Gebruik alleen deze veertien namen: ${FOOD_ALLERGENS.join(', ')}. Daarbij is "noten" boomnoten (hazelnoot, walnoot, amandel, cashew) en "pinda" alleen pinda; "weekdieren" zijn mosselen, inktvis en slakken; "schaaldieren" zijn garnalen, krab en kreeft.

Zeg nooit wie er op een foto staat.`;

// De vorm van het antwoord. De herkenner houdt zich hier precies aan.
const FOOD_NUMBER = { anyOf: [{ type: 'integer' }, { type: 'null' }] };
const FOOD_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['soort', 'naam', 'zeker', 'anders', 'portie', 'kcal', 'kcal_min', 'kcal_max', 'kcal_per_100', 'onderdelen', 'bevat', 'kan_bevatten', 'etiket_gelezen', 'ingredienten', 'opmerking'],
  properties: {
    soort: { type: 'string', enum: FOOD_KINDS },
    naam: { type: 'string' },
    zeker: { type: 'string', enum: FOOD_SURE },
    anders: { type: 'array', items: { type: 'string' } },
    portie: { type: 'string' },
    kcal: FOOD_NUMBER,
    kcal_min: FOOD_NUMBER,
    kcal_max: FOOD_NUMBER,
    kcal_per_100: FOOD_NUMBER,
    onderdelen: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['naam', 'gram', 'kcal'],
        properties: { naam: { type: 'string' }, gram: FOOD_NUMBER, kcal: FOOD_NUMBER },
      },
    },
    bevat: { type: 'array', items: { type: 'string', enum: FOOD_ALLERGENS } },
    kan_bevatten: { type: 'array', items: { type: 'string', enum: FOOD_ALLERGENS } },
    etiket_gelezen: { type: 'boolean' },
    ingredienten: { type: 'array', items: { type: 'string' } },
    opmerking: { type: 'string' },
  },
};

// Dezelfde vorm in woorden, voor als Anthropic de vaste vorm hierboven niet aanneemt (zie recogniseFood).
const FOOD_SHAPE = `Antwoord met alleen JSON, zonder tekst ervoor of erna, dat past bij dit schema: ${JSON.stringify(FOOD_SCHEMA)}`;
// Zo lang (in milliseconden) wacht de app voor ze het na een storing bij Anthropic nog één keer probeert.
const FOOD_RETRY_PAUSE = 1500;

// De sleutel van de gebruiker. Wil de telefoon niets bewaren, dan blijft hij in het geheugen tot de app sluit.
let looseKey = '';

function foodKey() {
  try { return localStorage.getItem(FOOD_KEY_STORE) || looseKey; } catch (e) { return looseKey; }
}

// Bewaart de sleutel; een lege sleutel haalt hem weg.
function setFoodKey(key) {
  looseKey = key;
  try {
    if (key) localStorage.setItem(FOOD_KEY_STORE, key);
    else localStorage.removeItem(FOOD_KEY_STORE);
  } catch (e) { /* dan alleen in het geheugen */ }
}

// Maakt van wat iemand plakt een sleutel: zonder spaties en regeleinden. Geeft niets terug als het er geen is.
function foodKeyFromText(text) {
  const key = String(text).replace(/\s+/g, '');
  return /^sk-ant-[\w-]{20,300}$/.test(key) ? key : '';
}

// Maakt van een beeld (de camera, of een gekozen foto) een verkleinde foto: `url` om haar te laten zien en
// `data`, dezelfde foto als tekst, om haar te versturen.
function shrinkPhoto(source, width, height) {
  if (!width || !height) throw new Error('geen beeld');
  const scale = Math.min(1, FOOD_PHOTO_SIZE / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL('image/jpeg', 0.85);
  return { url, data: url.slice(url.indexOf(',') + 1) };
}

// De foto van wat de camera nu ziet, of niets als de camera nog geen beeld geeft.
function cameraPhoto() {
  const video = scanner.video;
  if (!video || video.readyState < 2) return null;
  return shrinkPhoto(video, video.videoWidth, video.videoHeight);
}

// Opent een foto die de gebruiker heeft gekozen. Staat er een streepjescode op, dan komt die mee als `code`.
function filePhoto(file) {
  return new Promise((resolve, reject) => {
    const address = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const photo = shrinkPhoto(image, image.naturalWidth, image.naturalHeight);
        let code = '';
        try { code = readBarcode(image, image.naturalWidth, image.naturalHeight); } catch (e) { /* dan zonder code */ }
        resolve({ ...photo, code });
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(address);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(address);
      reject(new Error('geen foto'));
    };
    image.src = address;
  });
}

// Stuurt één aanvraag naar Anthropic en geeft terug wat er terugkomt: de status, de gegevens (of niets als die
// niet te lezen zijn) en, bij een fout, wat Anthropic erover zegt. Komt er geen antwoord, dan volgt een fout.
async function foodRequest(key, body) {
  const control = new AbortController();
  const timer = setTimeout(() => control.abort(), FOOD_PATIENCE);
  try {
    const response = await fetch(FOOD_API, {
      method: 'POST',
      signal: control.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        // Zonder deze regel weigert Anthropic een aanvraag die rechtstreeks uit een browser komt.
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    return {
      status: response.status,
      ok: response.ok,
      data,
      detail: response.ok ? '' : data && data.error && typeof data.error.message === 'string' ? data.error.message.slice(0, 300) : `antwoord ${response.status}`,
    };
  } finally {
    clearTimeout(timer);
  }
}

// Laat een foto herkennen. `hint` is wat de gebruiker zelf zegt dat het is, als de eerste gok niet klopte.
// Geeft terug wat er op de foto staat (zie cleanFood). Lukt het niet, dan volgt een fout met een `reason`
// (offline, sleutel, tegoed, toegang, druk, storing, geweigerd of fout) en in `detail` wat Anthropic erover zegt.
async function recogniseFood(photo, key, hint) {
  const fail = (reason, detail) => Object.assign(new Error(reason), { reason, detail: detail || '' });
  const said = String(hint || '').replace(/["\s]+/g, ' ').trim().slice(0, 60);
  const noMoney = answer => answer.status === 402 || (answer.status === 400 && /credit|billing|balance|spend/i.test(answer.detail));
  // `strict` vraagt het antwoord in een vaste vorm; zonder staat de vorm in woorden bij de regels.
  const body = strict => ({
    model: FOOD_MODEL,
    // Ruim genoeg voor het antwoord en voor wat de herkenner er eerst bij bedenkt.
    max_tokens: 4000,
    system: strict ? FOOD_RULES : `${FOOD_RULES}\n\n${FOOD_SHAPE}`,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: photo.data } },
        { type: 'text', text: said
          ? `De gebruiker zegt dat dit "${said}" is. Ga daarvan uit: vul de gegevens in voor "${said}" en schat de portie op wat je op de foto ziet.`
          : 'Wat staat er op deze foto?' },
      ],
    }],
    ...(strict ? { output_config: { effort: 'low', format: { type: 'json_schema', schema: FOOD_SCHEMA } } } : {}),
  });
  let answer;
  try {
    answer = await foodRequest(key, body(true));
    // Een storing bij Anthropic is vaak zo voorbij: na een korte pauze nog één keer.
    if (answer.status >= 500) {
      await new Promise(done => setTimeout(done, FOOD_RETRY_PAUSE));
      answer = await foodRequest(key, body(true));
    }
    // Neemt Anthropic de aanvraag zelf niet aan (bijvoorbeeld de vaste vorm van het antwoord), dan nog een
    // keer op de eenvoudigste manier. Een aanvraag die geweigerd wordt, kost niets.
    if (answer.status === 400 && !noMoney(answer)) {
      const plain = await foodRequest(key, body(false));
      // Lukt dat ook niet, dan blijft de eerste melding staan: die zegt wat er mis is.
      if (plain.ok || plain.status !== 400) answer = plain;
    }
  } catch (e) {
    throw fail('offline');
  }
  if (!answer.ok) {
    throw fail(answer.status === 401 ? 'sleutel'
      : noMoney(answer) ? 'tegoed'
      : answer.status === 403 ? 'toegang'
      : answer.status === 429 ? 'druk'
      : answer.status >= 500 ? 'storing'
      : 'fout', answer.detail);
  }
  const data = answer.data;
  if (!data) throw fail('fout', 'het antwoord is niet te lezen');
  if (data.stop_reason === 'refusal') throw fail('geweigerd');
  // Voor het antwoord kan een blok met gedachten staan; het antwoord zelf is het blok met tekst.
  const block = (Array.isArray(data.content) ? data.content : []).find(part => part && part.type === 'text' && typeof part.text === 'string');
  if (!block || data.stop_reason === 'max_tokens') throw fail('fout', `geen volledig antwoord (${String(data.stop_reason).slice(0, 30)})`);
  try {
    // Staat er toch tekst omheen, dan telt wat er tussen de eerste en de laatste accolade staat.
    const from = block.text.indexOf('{');
    const to = block.text.lastIndexOf('}');
    return cleanFood(JSON.parse(from >= 0 && to > from ? block.text.slice(from, to + 1) : block.text));
  } catch (e) {
    throw fail('fout', 'het antwoord is niet te lezen');
  }
}

// Haalt uit het antwoord van de herkenner wat de app nodig heeft, in dezelfde vorm als een gescand product
// (zie cleanProduct), en vertrouwt daarbij niets: alles wordt tekst of getal van een redelijke lengte en grootte.
function cleanFood(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const text = (value, length) => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, length) : '';
  const amount = (value, most) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= most ? Math.round(value) : null;
  const list = (value, most) => (Array.isArray(value) ? value : []).slice(0, most);
  // De herkenner kan een woord uit een vaste lijst met een hoofdletter schrijven.
  const word = value => text(value, 20).toLowerCase();
  // Bekende allergenen als de sleutels van de app; wat de herkenner er anders opschrijft, blijft als tekst
  // staan, zodat het niet wegvalt (zie productRisks).
  const allergens = value => {
    const words = [...new Set(list(value, 20).map(item => text(item, 30).toLowerCase()).filter(Boolean))];
    return { known: words.filter(key => FOOD_ALLERGENS.includes(key)), other: words.filter(key => !FOOD_ALLERGENS.includes(key)).slice(0, 8) };
  };
  const name = text(source.naam, 80);
  const kind = FOOD_KINDS.includes(word(source.soort)) ? word(source.soort) : 'gerecht';
  const low = amount(source.kcal_min, 9999);
  const high = amount(source.kcal_max, 9999);
  const middle = amount(source.kcal, 9999);
  // Een marge telt alleen als ze klopt: van laag naar hoog, met de schatting ertussen.
  const ranged = low != null && high != null && low < high && (middle == null || (middle >= low && middle <= high));
  const contains = allergens(source.bevat);
  const maybe = allergens(source.kan_bevatten);
  return {
    photo: true,
    code: '',
    // Zonder naam is er niets herkend.
    kind: name ? kind : 'geen',
    name,
    brand: '',
    quantity: '',
    serving: text(source.portie, 90),
    sure: FOOD_SURE.includes(word(source.zeker)) ? word(source.zeker) : 'laag',
    others: [...new Set(list(source.anders, 3).map(other => text(other, 50)).filter(other => other && other.toLowerCase() !== name.toLowerCase()))],
    kcal: amount(source.kcal_per_100, 950),
    // Geeft de herkenner alleen een marge, dan is het midden daarvan de schatting.
    kcalServing: middle != null ? middle : ranged ? Math.round((low + high) / 2) : null,
    kcalLow: ranged ? low : null,
    kcalHigh: ranged ? high : null,
    liquid: kind === 'drank',
    parts: list(source.onderdelen, 8).map(part => part && typeof part === 'object'
      ? { name: text(part.naam, 50), grams: amount(part.gram, 5000), kcal: amount(part.kcal, 9999) } : { name: '' }).filter(part => part.name),
    contains,
    // Wat er al zeker in zit, hoeft niet nog eens bij "kan bevatten" te staan.
    traces: { known: maybe.known.filter(key => !contains.known.includes(key)), other: maybe.other.filter(key => !contains.other.includes(key)) },
    label: source.etiket_gelezen === true,
    ingredients: list(source.ingredienten, 25).map(item => text(item, 40)).filter(Boolean).join(', '),
    note: text(source.opmerking, 200),
  };
}
