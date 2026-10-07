'use strict';

// Oudere telefoons (iPhones tot en met iOS 15.3) kennen deze functie nog niet; zonder start de app daar niet.
if (!Object.hasOwn) Object.hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const STORAGE_KEY = 'wat-eten-we-v1';
const MIN_DISHES = 6;
const PER_PAGE = 4;

const TIMES = { snel: 'Snel (tot 20 min)', normaal: 'Gemiddeld (20–45 min)', uitgebreid: 'Uitgebreid (45+ min)' };
const TIME_SHORT = { snel: 'Snel', normaal: 'Gemiddeld', uitgebreid: 'Uitgebreid' };
const TIME_RANK = { snel: 0, normaal: 1, uitgebreid: 2 };
const TYPES = { vlees: 'Vlees', vis: 'Vis', vega: 'Vegetarisch' };
const MEALS = { ontbijt: 'Ontbijt', middag: 'Middageten', avond: 'Avondeten' };
// Diëten. Vegetarisch hangt aan de soort van een gerecht; de andere vink je per gerecht aan.
const DIETS = {
  vegetarisch: 'Vegetarisch', vegan: 'Veganistisch', glutenvrij: 'Glutenvrij', lactosevrij: 'Lactosevrij',
  koolhydraatarm: 'Koolhydraatarm', eiwitrijk: 'Eiwitrijk',
};
const DAYS =['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
const MAX_WEEKS_BACK = 52;
const MAX_HISTORY = 2000;
// Zo lang mag een regel op de boodschappenlijst zijn; een langer ingrediënt wordt ingekort.
const SHOPPING_LENGTH = 80;

// Badges. Een genoteerde maaltijd kan op drie manieren meetellen; elke manier heeft een eigen groep badges.
const GROUPS = {
  healthy: ['blad', 'Gezond eten', 'Voor maaltijden die je als gezond hebt aangevinkt.'],
  slow: ['klok', 'Uitgebreid koken', 'Voor gerechten die 45 minuten of langer kosten.'],
  fresh: ['wissel', 'Afwisselen', 'Voor verschillende gerechten in je week.'],
};
// scope 'total' telt alles wat je noteerde, 'week' telt binnen één week (maandag t/m zondag). In een lange
// naam staat een zacht afbreekstreepje (­): daar mag de naam op een smal scherm afbreken.
const BADGES = [
  { id: 'gezond1', group: 'healthy', icon: 'salade', name: 'Groene start', text: 'Eet je eerste gezonde maaltijd', scope: 'total', key: 'healthy', goal: 1 },
  { id: 'gezond2', group: 'healthy', icon: 'appel', name: 'Gezonde week', text: 'Eet 5 gezonde maaltijden in één week', scope: 'week', key: 'healthy', goal: 5 },
  { id: 'gezond3', group: 'healthy', icon: 'beker', name: 'Gezond leven', text: 'Eet 30 gezonde maaltijden', scope: 'total', key: 'healthy', goal: 30 },
  { id: 'gezond4', group: 'healthy', icon: 'kroon', name: 'Gezondheids­kampioen', text: 'Eet 100 gezonde maaltijden', scope: 'total', key: 'healthy', goal: 100 },
  { id: 'tijd1', group: 'slow', icon: 'klok', name: 'Mouwen opgestroopt', text: 'Kook je eerste uitgebreide maaltijd', scope: 'total', key: 'slow', goal: 1 },
  { id: 'tijd2', group: 'slow', icon: 'stoofpot', name: 'Met liefde gekookt', text: 'Kook 5 uitgebreide maaltijden', scope: 'total', key: 'slow', goal: 5 },
  { id: 'tijd3', group: 'slow', icon: 'vlam', name: 'Keuken­marathon', text: 'Kook 20 uitgebreide maaltijden', scope: 'total', key: 'slow', goal: 20 },
  { id: 'tijd4', group: 'slow', icon: 'koksmuts', name: 'Meesterkok', text: 'Kook 50 uitgebreide maaltijden', scope: 'total', key: 'slow', goal: 50 },
  { id: 'variatie1', group: 'fresh', icon: 'pap', name: 'Proeverij', text: 'Eet 5 verschillende gerechten in één week', scope: 'week', key: 'distinct', goal: 5 },
  { id: 'variatie2', group: 'fresh', icon: 'kalender', name: 'Elke dag anders', text: 'Eet 10 verschillende gerechten in één week', scope: 'week', key: 'distinct', goal: 10 },
  { id: 'variatie3', group: 'fresh', icon: 'bord', name: 'Alleseter', text: 'Eet vlees, vis en vegetarisch in één week', scope: 'week', key: 'types', goal: 3 },
  { id: 'variatie4', group: 'fresh', icon: 'kompas', name: 'Ontdekker', text: 'Eet 25 verschillende gerechten', scope: 'total', key: 'distinct', goal: 25 },
];
// De steunkleuren om uit te kiezen; de kleuren zelf staan in style.css onder dezelfde naam.
const THEMES = { tomaat: 'Tomaat', olijf: 'Olijf', bosbes: 'Bosbes', mosterd: 'Mosterd' };
// De avondstand: het donkere papier voor in het donker. Automatisch volgt het apparaat.
const DARK_MODES = { auto: 'Automatisch', uit: 'Uit', aan: 'Aan' };
// De thema's van voor het kookboekontwerp: [de kleur die er het meest op lijkt, de avondstand]. Het thema
// Standaard volgde het apparaat; de andere waren altijd licht of altijd donker.
const OLD_THEMES = {
  standaard: ['tomaat', 'auto'], tomaat: ['tomaat', 'uit'], citroen: ['mosterd', 'uit'], munt: ['olijf', 'uit'],
  lavendel: ['bosbes', 'uit'], 'blauwe-bes': ['bosbes', 'aan'], aubergine: ['bosbes', 'aan'],
  nachtmarkt: ['tomaat', 'aan'], mosterd: ['mosterd', 'aan'], olijf: ['olijf', 'aan'],
};

// Een leeg antwoord ('') betekent "maakt niet uit".
// Elk antwoord is [waarde, pictogram, tekst, toelichting].
const QUESTIONS = [
  { key: 'time', title: 'Hoeveel <em>tijd</em> heb je?', text: 'Dan zoek ik er iets bij dat past.', options: [
    ['snel', 'bliksem', 'Weinig', 'tot 20 minuten'], ['normaal', 'klok', 'Een beetje', 'tot 45 minuten'],
    ['', 'stoofpot', 'Alle tijd van de wereld', 'lekker uitgebreid koken'] ] },
  { key: 'type', title: 'Waar heb je <em>trek</em> in?', text: 'Kies wat je vandaag het lekkerst lijkt.', options: [
    ['vlees', 'vlees', 'Vlees', ''], ['vis', 'vis', 'Vis', ''], ['vega', 'blad', 'Vegetarisch', ''],
    ['', 'vraag', 'Maakt me niet uit', ''] ] },
  { key: 'kcal', title: 'Hoe <em>stevig</em> mag het zijn?', text: 'Van een lichte hap tot een flink bord.', options: [
    ['licht', 'salade', 'Licht', 'tot 400 kcal'], ['gemiddeld', 'spaghetti', 'Gemiddeld', '400 tot 700 kcal'],
    ['stevig', 'hamburger', 'Stevig', '700 kcal of meer'], ['', 'vraag', 'Maakt me niet uit', ''] ] },
];
// Bekende gerechten om met één tik aan je favorieten toe te voegen. De calorieën, de bereidingstijd en het
// laatste veld (gezond of niet) zijn een schatting; de gebruiker kan ze aanpassen.
// De lijst is samengesteld uit overzichten op internet van wat er in Nederland veel wordt gegeten.
const CATALOG = [
  // Ontbijt
  ['Havermout', ['ontbijt'], 'snel', 'vega', 300, true],
  ['Yoghurt met muesli', ['ontbijt'], 'snel', 'vega', 350, true],
  ['Kwark met fruit', ['ontbijt'], 'snel', 'vega', 250, true],
  ['Overnight oats', ['ontbijt'], 'snel', 'vega', 350, true],
  ['Volkorenbrood met ei', ['ontbijt', 'middag'], 'snel', 'vega', 330, true],
  ['Boterham met kaas', ['ontbijt', 'middag'], 'snel', 'vega', 300, false],
  ['Boterham met pindakaas', ['ontbijt', 'middag'], 'snel', 'vega', 350, false],
  ['Omelet', ['ontbijt', 'middag'], 'snel', 'vega', 300, true],
  ['Roerei met toast', ['ontbijt'], 'snel', 'vega', 350, false],
  ['Smoothie met banaan', ['ontbijt'], 'snel', 'vega', 250, true],
  ['Griesmeelpap', ['ontbijt'], 'snel', 'vega', 300, false],
  ['Croissant met jam', ['ontbijt'], 'snel', 'vega', 400, false],
  ['Bananenbrood', ['ontbijt'], 'uitgebreid', 'vega', 300, false],
  // Middageten
  ['Tosti', ['middag'], 'snel', 'vega', 400, false],
  ['Uitsmijter', ['middag'], 'snel', 'vlees', 450, false],
  ['Broodje gezond', ['middag'], 'snel', 'vlees', 400, true],
  ['Tonijnsalade op brood', ['middag'], 'snel', 'vis', 400, true],
  ['Wrap met kip en groenten', ['middag'], 'snel', 'vlees', 450, true],
  ['Kipsalade', ['middag'], 'snel', 'vlees', 400, true],
  ['Salade met kikkererwten en feta', ['middag', 'avond'], 'snel', 'vega', 420, true],
  ['Couscoussalade', ['middag'], 'snel', 'vega', 400, true],
  ['Tomatensoep', ['middag'], 'normaal', 'vega', 250, true],
  ['Groentesoep met linzen', ['middag'], 'normaal', 'vega', 230, true],
  ['Kippensoep', ['middag'], 'normaal', 'vlees', 250, true],
  ['Pompoensoep', ['middag'], 'normaal', 'vega', 250, true],
  ['Erwtensoep', ['middag', 'avond'], 'uitgebreid', 'vlees', 500, false],
  ['Pannenkoeken', ['middag', 'avond'], 'normaal', 'vega', 600, false],
  ['Poffertjes', ['middag'], 'normaal', 'vega', 450, false],
  ['Quiche met groenten', ['middag', 'avond'], 'uitgebreid', 'vega', 500, false],
  ['Pokébowl met zalm', ['middag', 'avond'], 'normaal', 'vis', 600, true],
  // Avondeten
  ['Spaghetti bolognese', ['avond'], 'normaal', 'vlees', 650, false],
  ['Pasta met champignons', ['avond'], 'normaal', 'vega', 550, false],
  ['Pasta pesto met kip', ['avond'], 'snel', 'vlees', 650, false],
  ['Pasta met zalm en spinazie', ['avond'], 'normaal', 'vis', 600, true],
  ['Macaroni met ham en kaas', ['avond'], 'normaal', 'vlees', 650, false],
  ['Lasagne', ['avond'], 'uitgebreid', 'vlees', 750, false],
  ['Groentelasagne', ['avond'], 'uitgebreid', 'vega', 600, true],
  ['Kip met broccoli en aardappelen', ['avond'], 'normaal', 'vlees', 550, true],
  ['Gehaktbal met sperziebonen', ['avond'], 'normaal', 'vlees', 650, false],
  ['Gevulde kipfilet uit de oven', ['avond'], 'normaal', 'vlees', 550, false],
  ['Kipcurry met rijst', ['avond'], 'normaal', 'vlees', 600, true],
  ['Kip kerrie met rijst en boontjes', ['avond'], 'normaal', 'vlees', 600, true],
  ['Groentecurry', ['avond'], 'normaal', 'vega', 500, true],
  ['Pompoencurry', ['avond'], 'normaal', 'vega', 450, true],
  ['Stamppot boerenkool', ['avond'], 'normaal', 'vlees', 700, true],
  ['Hutspot', ['avond'], 'normaal', 'vlees', 600, true],
  ['Zuurkoolstamppot', ['avond'], 'normaal', 'vlees', 650, true],
  ['Andijviestamppot', ['avond'], 'normaal', 'vlees', 600, true],
  ['Hachee', ['avond'], 'uitgebreid', 'vlees', 550, false],
  ['Stoofvlees met rode kool', ['avond'], 'uitgebreid', 'vlees', 650, false],
  ['Nasi goreng', ['avond'], 'normaal', 'vlees', 650, false],
  ['Surinaamse nasi met kip', ['avond'], 'uitgebreid', 'vlees', 700, false],
  ['Bami goreng', ['avond'], 'normaal', 'vlees', 650, false],
  ['Kipsaté met rijst', ['avond'], 'normaal', 'vlees', 700, false],
  ['Gado gado', ['avond'], 'normaal', 'vega', 550, true],
  ['Roerbak met kip en groenten', ['avond'], 'snel', 'vlees', 500, true],
  ['Roerbak met tofu', ['avond'], 'snel', 'vega', 450, true],
  ['Zalm met rijst', ['avond'], 'normaal', 'vis', 550, true],
  ['Vis uit de oven met groenten', ['avond'], 'normaal', 'vis', 450, true],
  ['Kibbeling met friet', ['avond'], 'normaal', 'vis', 800, false],
  ['Chili con carne', ['avond'], 'normaal', 'vlees', 600, true],
  ['Chili sin carne', ['avond'], 'normaal', 'vega', 500, true],
  ['Wraps met gehakt', ['avond'], 'normaal', 'vlees', 650, false],
  ['Shoarma met pita', ['avond'], 'snel', 'vlees', 700, false],
  ['Hamburger met friet', ['avond'], 'normaal', 'vlees', 900, false],
  ['Pizza', ['avond'], 'normaal', 'vega', 800, false],
  ['Risotto met paddenstoelen', ['avond'], 'normaal', 'vega', 600, false],
  ['Ratatouille met rijst', ['avond'], 'normaal', 'vega', 400, true],
  ['Ovenschotel met gehakt', ['avond'], 'uitgebreid', 'vlees', 650, false],
  ['Witlof met ham en kaas', ['avond'], 'uitgebreid', 'vlees', 550, false],
  ['Couscous met kip en groenten', ['avond'], 'normaal', 'vlees', 550, true],
];
// De gerechten uit de lijst in groepjes, in de volgorde waarin ze op het scherm staan. Elk gerecht uit
// CATALOG staat in precies één groepje.
const CATALOG_GROUPS = [
  ['Pap, yoghurt en fruit', ['Havermout', 'Yoghurt met muesli', 'Kwark met fruit', 'Overnight oats', 'Smoothie met banaan', 'Griesmeelpap']],
  ['Brood en wraps', ['Volkorenbrood met ei', 'Boterham met kaas', 'Boterham met pindakaas', 'Croissant met jam', 'Bananenbrood', 'Tosti', 'Broodje gezond', 'Tonijnsalade op brood', 'Wrap met kip en groenten']],
  ['Ei', ['Omelet', 'Roerei met toast', 'Uitsmijter']],
  ['Soep', ['Tomatensoep', 'Groentesoep met linzen', 'Kippensoep', 'Pompoensoep', 'Erwtensoep']],
  ['Salade en bowls', ['Kipsalade', 'Salade met kikkererwten en feta', 'Couscoussalade', 'Pokébowl met zalm']],
  ['Pasta', ['Spaghetti bolognese', 'Pasta met champignons', 'Pasta pesto met kip', 'Pasta met zalm en spinazie', 'Macaroni met ham en kaas', 'Lasagne', 'Groentelasagne']],
  ['Stamppot en stoofvlees', ['Stamppot boerenkool', 'Hutspot', 'Zuurkoolstamppot', 'Andijviestamppot', 'Hachee', 'Stoofvlees met rode kool']],
  ['Aardappelen, vlees en groente', ['Gehaktbal met sperziebonen', 'Kip met broccoli en aardappelen', 'Gevulde kipfilet uit de oven', 'Witlof met ham en kaas', 'Ovenschotel met gehakt']],
  ['Curry', ['Kipcurry met rijst', 'Kip kerrie met rijst en boontjes', 'Groentecurry', 'Pompoencurry']],
  ['Rijst, bonen en couscous', ['Risotto met paddenstoelen', 'Ratatouille met rijst', 'Chili con carne', 'Chili sin carne', 'Couscous met kip en groenten']],
  ['Wok en Indonesisch', ['Nasi goreng', 'Surinaamse nasi met kip', 'Bami goreng', 'Kipsaté met rijst', 'Gado gado', 'Roerbak met kip en groenten', 'Roerbak met tofu']],
  ['Vis', ['Zalm met rijst', 'Vis uit de oven met groenten', 'Kibbeling met friet']],
  ['Pizza, wraps en pannenkoeken', ['Pizza', 'Hamburger met friet', 'Shoarma met pita', 'Wraps met gehakt', 'Pannenkoeken', 'Poffertjes', 'Quiche met groenten']],
];
// Zoveel gerechten van een groepje zie je voordat je om meer vraagt.
const CATALOG_PREVIEW = 4;
// Tijdzones van landen waar veel Nederlands wordt gesproken, om het land van de gebruiker te raden.
const ZONE_COUNTRY = {
  'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'America/Paramaribo': 'SR',
  'America/Curacao': 'CW', 'America/Aruba': 'AW',
};
// Vanaf meer dan zoveel favorieten staat er een zoekveld boven de lijst.
const SEARCH_FROM = 8;
// De afkortingen waarmee de gerechten per land zijn genoteerd (in world-dishes.js).
const DISH_TYPE = { l: 'vlees', v: 'vis', g: 'vega' };
const DISH_TIME = { s: 'snel', n: 'normaal', u: 'uitgebreid' };
const DISH_MEAL = { o: 'ontbijt', m: 'middag', a: 'avond' };
// De tabbladen van de instellingen.
const SETTINGS_TABS = { profiel: 'Profiel', allergie: 'Allergie', dieet: 'Dieet', thema: 'Thema', backup: 'Back-up' };
// De veertien allergenen die volgens de Europese regels op etiketten moeten staan: sleutel, naam, toelichting.
const ALLERGENS = {
  gluten: ['Gluten', 'tarwe, rogge, gerst, haver, spelt'],
  schaaldieren: ['Schaaldieren', 'garnalen, krab, kreeft'],
  ei: ['Ei', ''],
  vis: ['Vis', ''],
  pinda: ['Pinda\'s', 'aardnoten'],
  soja: ['Soja', ''],
  melk: ['Melk', 'ook lactose'],
  noten: ['Noten', 'amandel, hazelnoot, walnoot, cashew, pistache'],
  selderij: ['Selderij', ''],
  mosterd: ['Mosterd', ''],
  sesam: ['Sesam', ''],
  sulfiet: ['Sulfiet', 'in wijn, azijn en gedroogd fruit'],
  lupine: ['Lupine', ''],
  weekdieren: ['Weekdieren', 'mosselen, oesters, inktvis'],
};
// Andere allergieën die vaak voorkomen, als voorzet bij "andere allergie toevoegen".
const ALLERGY_IDEAS = ['kiwi', 'appel', 'banaan', 'aardbei', 'tomaat', 'wortel', 'knoflook', 'mais', 'peulvruchten'];
// Een zelf toegevoegde allergie die voor een groep producten staat: [de woorden waarop de app dan let, de
// toelichting voor de gebruiker]. De sleutel is het enkelvoud, zonder accenten.
const CITRUS = [['citrus', 'sinaasappel', 'citroen', 'limoen', 'mandarijn', 'grapefruit'], 'sinaasappel, citroen, limoen, mandarijn en grapefruit'];
const ALLERGY_GROUPS = {
  peulvrucht: [['boon', 'linze', 'kikkererwt', 'erwt', 'kapucijner', 'peultje', 'sugarsnap', 'hummus', 'hoemoes', 'falafel'],
    'bonen, linzen, erwten en kikkererwten; soja en pinda\'s vink je hierboven aan'],
  citrus: CITRUS, citrusvrucht: CITRUS, citrusfruit: CITRUS,
};
// Woorden waarin een ander woord toevallig zit: een aardappel is geen appel en pindakaas is geen kaas. Bij
// een allergie voor het korte woord tellen deze langere woorden niet mee.
const LOOKALIKES = {
  appel: ['aardappel', 'sinaasappel', 'granaatappel'], kaas: ['pindakaas'], noot: ['nootmuskaat', 'kokosnoot'],
  ei: ['prei', 'aardbei', 'gelei'], sla: ['slagroom', 'slavink'], ham: ['hamburger', 'boterham'],
  melk: ['kokosmelk', 'amandelmelk', 'sojamelk', 'havermelk', 'rijstmelk'], boter: ['cacaoboter', 'pindaboter', 'sheaboter', 'boterham'],
};
// Woorden in een ingrediëntenlijst die op een allergeen uit de lijst van veertien wijzen. Na het scannen van
// een product kijkt de app daarmee ook zelf in de ingrediënten, voor het geval de allergenen er niet bij staan.
const ALLERGEN_WORDS = {
  gluten: ['gluten', 'tarwe', 'rogge', 'gerst', 'haver', 'spelt'], schaaldieren: ['garnaal', 'krab', 'kreeft', 'schaaldier'],
  ei: ['ei', 'eigeel', 'eipoeder'], vis: ['vis', 'zalm', 'tonijn', 'ansjovis', 'kabeljauw'], pinda: ['pinda', 'aardnoot'], soja: ['soja'],
  melk: ['melk', 'lactose', 'room', 'boter', 'kaas', 'wei', 'yoghurt'], noten: ['noot', 'amandel', 'cashew', 'pistache', 'pecan'],
  selderij: ['selderij'], mosterd: ['mosterd'], sesam: ['sesam'], sulfiet: ['sulfiet'], lupine: ['lupine'],
  weekdieren: ['mossel', 'oester', 'inktvis', 'weekdier'],
};
// Meervouden die niet volgens de regels gaan (zie wordForms).
const ODD_PLURALS = [['ei', 'eieren']];
// Andere woorden voor een allergeen uit de lijst van veertien: wie dit typt, bedoelt dat vakje.
const ALLERGEN_ALIASES = { lactose: 'melk', zuivel: 'melk', tarwe: 'gluten', pindakaas: 'pinda', garnaal: 'schaaldieren', mossel: 'weekdieren' };
// Welke allergenen er meestal in de gerechten uit de lijst zitten. Dit is ruim ingeschat: ook een allergeen
// dat via een veelgebruikt ingrediënt meekomt (sojasaus, bouillonblokje, kerriepoeder, mayonaise, boter)
// staat erbij. Elk gerecht uit de lijst moet hier staan, ook als er niets in zit.
const CATALOG_ALLERGENS = {
  'Havermout': ['gluten', 'melk'],
  'Yoghurt met muesli': ['melk', 'gluten', 'noten', 'sulfiet'],
  'Kwark met fruit': ['melk'],
  'Overnight oats': ['gluten', 'melk', 'noten'],
  'Volkorenbrood met ei': ['gluten', 'ei', 'melk'],
  'Boterham met kaas': ['gluten', 'melk'],
  'Boterham met pindakaas': ['gluten', 'pinda'],
  'Omelet': ['ei', 'melk'],
  'Roerei met toast': ['ei', 'gluten', 'melk'],
  'Smoothie met banaan': ['melk'],
  'Griesmeelpap': ['gluten', 'melk'],
  'Croissant met jam': ['gluten', 'melk', 'ei'],
  'Bananenbrood': ['gluten', 'ei', 'melk', 'noten'],
  'Tosti': ['gluten', 'melk'],
  'Uitsmijter': ['gluten', 'ei', 'melk'],
  'Broodje gezond': ['gluten', 'ei', 'melk'],
  'Tonijnsalade op brood': ['vis', 'gluten', 'ei', 'mosterd'],
  'Wrap met kip en groenten': ['gluten', 'melk'],
  'Kipsalade': ['ei', 'mosterd', 'selderij', 'melk'],
  'Salade met kikkererwten en feta': ['melk', 'mosterd'],
  'Couscoussalade': ['gluten', 'melk'],
  'Tomatensoep': ['selderij', 'melk', 'gluten', 'ei'],
  'Groentesoep met linzen': ['selderij', 'gluten'],
  'Kippensoep': ['selderij', 'gluten', 'ei'],
  'Pompoensoep': ['selderij', 'melk', 'gluten'],
  'Erwtensoep': ['selderij', 'mosterd', 'gluten'],
  'Pannenkoeken': ['gluten', 'ei', 'melk'],
  'Poffertjes': ['gluten', 'ei', 'melk'],
  'Quiche met groenten': ['gluten', 'ei', 'melk'],
  'Pokébowl met zalm': ['vis', 'soja', 'gluten', 'sesam'],
  'Spaghetti bolognese': ['gluten', 'selderij', 'melk', 'sulfiet'],
  'Pasta met champignons': ['gluten', 'melk'],
  'Pasta pesto met kip': ['gluten', 'noten', 'melk'],
  'Pasta met zalm en spinazie': ['gluten', 'vis', 'melk'],
  'Macaroni met ham en kaas': ['gluten', 'melk'],
  'Lasagne': ['gluten', 'melk', 'ei', 'selderij'],
  'Groentelasagne': ['gluten', 'melk', 'ei'],
  'Kip met broccoli en aardappelen': ['melk'],
  'Gehaktbal met sperziebonen': ['gluten', 'ei', 'melk', 'mosterd'],
  'Gevulde kipfilet uit de oven': ['melk'],
  'Kipcurry met rijst': ['schaaldieren', 'vis', 'mosterd', 'selderij'],
  'Kip kerrie met rijst en boontjes': ['melk', 'gluten', 'mosterd', 'selderij'],
  'Groentecurry': ['mosterd', 'selderij'],
  'Pompoencurry': ['mosterd', 'selderij'],
  'Stamppot boerenkool': ['melk', 'mosterd', 'gluten'],
  'Hutspot': ['melk', 'gluten'],
  'Zuurkoolstamppot': ['melk', 'mosterd', 'gluten'],
  'Andijviestamppot': ['melk', 'gluten'],
  'Hachee': ['gluten', 'melk', 'selderij', 'sulfiet'],
  'Stoofvlees met rode kool': ['gluten', 'melk', 'selderij', 'mosterd', 'sulfiet'],
  'Nasi goreng': ['soja', 'gluten', 'ei', 'schaaldieren', 'pinda'],
  'Surinaamse nasi met kip': ['soja', 'gluten', 'selderij', 'schaaldieren'],
  'Bami goreng': ['gluten', 'ei', 'soja', 'schaaldieren', 'pinda'],
  'Kipsaté met rijst': ['pinda', 'soja', 'gluten'],
  'Gado gado': ['pinda', 'soja', 'gluten', 'ei', 'schaaldieren'],
  'Roerbak met kip en groenten': ['soja', 'gluten', 'sesam', 'weekdieren'],
  'Roerbak met tofu': ['soja', 'gluten', 'sesam'],
  'Zalm met rijst': ['vis'],
  'Vis uit de oven met groenten': ['vis'],
  'Kibbeling met friet': ['vis', 'gluten', 'ei', 'melk', 'mosterd'],
  'Chili con carne': ['gluten', 'selderij'],
  'Chili sin carne': ['gluten', 'selderij', 'soja'],
  'Wraps met gehakt': ['gluten', 'melk'],
  'Shoarma met pita': ['gluten', 'melk', 'ei', 'mosterd'],
  'Hamburger met friet': ['gluten', 'ei', 'melk', 'mosterd', 'sesam'],
  'Pizza': ['gluten', 'melk'],
  'Risotto met paddenstoelen': ['melk', 'selderij', 'sulfiet', 'gluten'],
  'Ratatouille met rijst': [],
  'Ovenschotel met gehakt': ['melk', 'gluten', 'ei'],
  'Witlof met ham en kaas': ['melk', 'gluten'],
  'Couscous met kip en groenten': ['gluten', 'selderij'],
};
// Bij welke diëten de gerechten uit de lijst passen. Glutenvrij en lactosevrij staan hier niet: die volgen
// uit de allergenen hierboven (zie catalogDiets), zodat de twee elkaar nooit tegenspreken.
const CATALOG_DIETS = {
  'Kwark met fruit': ['eiwitrijk'],
  'Boterham met pindakaas': ['vegan'],
  'Omelet': ['koolhydraatarm', 'eiwitrijk'],
  'Uitsmijter': ['eiwitrijk'],
  'Tonijnsalade op brood': ['eiwitrijk'],
  'Wrap met kip en groenten': ['eiwitrijk'],
  'Kipsalade': ['koolhydraatarm', 'eiwitrijk'],
  'Groentesoep met linzen': ['vegan'],
  'Erwtensoep': ['eiwitrijk'],
  'Pokébowl met zalm': ['eiwitrijk'],
  'Spaghetti bolognese': ['eiwitrijk'],
  'Pasta pesto met kip': ['eiwitrijk'],
  'Pasta met zalm en spinazie': ['eiwitrijk'],
  'Kip met broccoli en aardappelen': ['eiwitrijk'],
  'Gehaktbal met sperziebonen': ['eiwitrijk'],
  'Gevulde kipfilet uit de oven': ['koolhydraatarm', 'eiwitrijk'],
  'Kipcurry met rijst': ['eiwitrijk'],
  'Kip kerrie met rijst en boontjes': ['eiwitrijk'],
  'Groentecurry': ['vegan'],
  'Pompoencurry': ['vegan'],
  'Hachee': ['eiwitrijk'],
  'Stoofvlees met rode kool': ['eiwitrijk'],
  'Surinaamse nasi met kip': ['eiwitrijk'],
  'Kipsaté met rijst': ['eiwitrijk'],
  'Roerbak met kip en groenten': ['eiwitrijk'],
  'Roerbak met tofu': ['vegan', 'eiwitrijk'],
  'Zalm met rijst': ['eiwitrijk'],
  'Vis uit de oven met groenten': ['koolhydraatarm', 'eiwitrijk'],
  'Chili con carne': ['eiwitrijk'],
  'Chili sin carne': ['vegan', 'eiwitrijk'],
  'Wraps met gehakt': ['eiwitrijk'],
  'Shoarma met pita': ['eiwitrijk'],
  'Ratatouille met rijst': ['vegan'],
  'Couscous met kip en groenten': ['eiwitrijk'],
};
// De korte namen van de maaltijden, voor de tabbladen en de regels in je week.
const MEAL_SHORT = { ontbijt: 'Ontbijt', middag: 'Middag', avond: 'Avond' };
// Zoveel favorieten zie je bij "Iets noteren" voordat je om de rest vraagt.
const LOG_PREVIEW = 5;
// De profielfoto wordt vierkant en klein opgeslagen, als tekst in de opslag van de browser.
const PHOTO_SIZE = 256;
const PHOTO_PATTERN = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

const app = document.getElementById('app');
const nav = document.getElementById('nav');

// De teller voorkomt dubbele id's als er meerdere in dezelfde milliseconde worden gemaakt.
// Staat hier omdat load() al id's aanmaakt.
let idCounter = 0;
let state = load();
let view = { name: 'home' };
// De maaltijd waarvoor je kiest volgt de klok. Kies je zelf een andere, dan staat die in manualMeal en
// geldt ze tot het volgende dagdeel begint of tot de app lang op de achtergrond heeft gestaan.
let meal = defaultMeal();
let manualMeal = null;
// De dag waarvan het startscherm laat zien wat je at; na middernacht is dat een andere dag.
let homeDay = '';
// Een back-up die is gekozen om terug te zetten, tot de gebruiker dat bevestigt.
let pendingImport = null;

// ---------- Opslag ----------

function emptyState() {
  return {
    dishes: [], history: [], shopping: [], badges: {},
    onboarded: false, welcomed: false, name: '', photo: '', theme: 'tomaat', dark: 'auto', country: guessCountry(), diet: [],
    allergies: [], otherAllergies: [],
  };
}

// Het land waar de gebruiker waarschijnlijk woont, zolang die het niet zelf heeft gekozen: eerst afgeleid
// van de tijdzone van het apparaat, dan van de taalinstelling, en anders Nederland (de app is Nederlandstalig).
function guessCountry() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (Object.hasOwn(ZONE_COUNTRY, zone)) return ZONE_COUNTRY[zone];
  for (const tag of navigator.languages || []) {
    const region = (tag.split('-')[1] || '').toUpperCase();
    if (Object.hasOwn(COUNTRIES, region)) return region;
  }
  return 'NL';
}

// Alleen een echte, kleine afbeelding telt als profielfoto; al het andere wordt genegeerd.
function cleanPhoto(photo) {
  return typeof photo === 'string' && photo.length < 400000 && PHOTO_PATTERN.test(photo) ? photo : '';
}

// Snijdt een foto vierkant uit het midden en verkleint hem, zodat hij weinig ruimte inneemt.
function squarePhoto(file) {
  return new Promise((resolve, reject) => {
    // Of het een afbeelding is, blijkt bij het openen: niet elke telefoon zegt erbij wat voor bestand het is.
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const side = Math.min(image.naturalWidth, image.naturalHeight);
      if (!side) return reject(new Error('lege afbeelding'));
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = PHOTO_SIZE;
      canvas.getContext('2d').drawImage(image,
        (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('onleesbare afbeelding'));
    };
    image.src = url;
  });
}

function cleanName(name) {
  return typeof name === 'string' ? name.trim().slice(0, 30) : '';
}

// De begroeting die bij het tijdstip past.
function dayPart() {
  const hour = new Date().getHours();
  return hour < 6 ? 'Goedenacht' : hour < 12 ? 'Goedemorgen' : hour < 18 ? 'Goedemiddag' : 'Goedenavond';
}

// Een andere kleur of avondstand: bewaren en opnieuw tekenen. Waar de browser het kan, vloeien de oude
// kleuren over in de nieuwe.
function repaint() {
  save();
  const change = () => {
    applyTheme();
    render();
  };
  if (document.startViewTransition && !motionOff()) document.startViewTransition(change);
  else change();
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.dark = state.dark;
  // De balk van de browser of telefoon krijgt de kleur van het papier.
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  document.querySelector('meta[name="theme-color"]').content = bg;
}

function load() {
  try {
    const clean = sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    if (clean) return clean;
  } catch (e) { /* beschadigde of ontbrekende opslag: begin opnieuw */ }
  return emptyState();
}

// Controleert opgeslagen of geïmporteerde gegevens en bouwt ze opnieuw op.
// Ongeldige gerechten en onbekende velden vervallen; de rest blijft behouden.
function sanitize(data) {
  if (!data || !Array.isArray(data.dishes)) return null;
  const isId = id => typeof id === 'string' && /^[a-z0-9]{1,24}$/i.test(id);
  const list = value => Array.isArray(value) ? value : [];
  // Alleen een woord uit de bekende keuzes telt; een lijst of een getal dat er toevallig op lijkt niet.
  const known = (choices, value) => typeof value === 'string' && Object.hasOwn(choices, value);
  const ids = new Set();
  const dishes = [];
  for (const d of data.dishes) {
    const ok = d && isId(d.id) && !ids.has(d.id) && typeof d.name === 'string' && d.name.trim() &&
      known(TIMES, d.time) && known(TYPES, d.type);
    if (!ok) continue;
    ids.add(d.id);
    // Een gerecht dat is opgeslagen voordat de app allergenen kende, krijgt de allergenen en de diëten van
    // het gelijknamige gerecht uit de lijst (als dat bestaat), zodat die twee bij elkaar passen.
    const fromList = !Array.isArray(d.allergens) && Object.hasOwn(CATALOG_ALLERGENS, d.name.trim());
    dishes.push({
      id: d.id,
      name: d.name.trim().slice(0, 60),
      // Gerechten van voor de maaltijd-functie tellen als avondeten.
      meals: cleanMeals(d.meals),
      time: d.time,
      type: d.type,
      kcal: cleanKcal(d.kcal),
      healthy: d.healthy === true,
      // Leeg betekent: de app kiest het pictogram bij de naam.
      icon: cleanIcon(d.icon, d.name.trim()),
      // De omschrijving van een gerecht uit de wereldkeuken.
      about: typeof d.about === 'string' ? d.about.trim().slice(0, 160) : '',
      diets: fromList || !Array.isArray(d.diets) ? catalogDiets(d.name.trim()) : cleanDiets(d.diets, false),
      allergens: fromList ? catalogAllergens(d.name.trim()) : cleanAllergens(d.allergens),
      // Waar bij een gerecht uit de wereldkeuken: de allergenen zijn nog door niemand ingevuld.
      unchecked: d.unchecked === true,
      ingredients: list(d.ingredients).map(i => String(i).trim()).filter(Boolean),
      recipe: typeof d.recipe === 'string' ? d.recipe : '',
    });
  }
  // Zonder avondstand zijn het gegevens van voor het kookboekontwerp: dan wordt het oude thema omgezet.
  const modern = known(DARK_MODES, data.dark);
  const [oldTheme, oldDark] = OLD_THEMES[known(OLD_THEMES, data.theme) ? data.theme : 'standaard'];
  return {
    onboarded: data.onboarded === true && dishes.length >= MIN_DISHES,
    // Wie al gerechten heeft, is het welkomstscherm al voorbij.
    welcomed: data.welcomed === true || dishes.length > 0,
    name: cleanName(data.name),
    photo: cleanPhoto(data.photo),
    theme: modern ? (known(THEMES, data.theme) ? data.theme : 'tomaat') : oldTheme,
    dark: modern ? data.dark : oldDark,
    country: known(COUNTRIES, data.country) ? data.country : guessCountry(),
    diet: cleanDiets(data.diet, true),
    allergies: cleanAllergens(data.allergies),
    otherAllergies: cleanTerms(data.otherAllergies),
    dishes,
    history: list(data.history).map(h => {
      if (!h || isNaN(new Date(h.date).getTime())) return null;
      const dish = dishes.find(d => d.id === h.dishId);
      // Notities van voor het weekoverzicht hebben geen eigen naam; die komt dan uit het gerecht.
      const old = typeof h.name !== 'string' || !h.name.trim();
      if (old && !dish) return null;
      return {
        id: newId(),
        dishId: dish ? dish.id : null,
        name: old ? dish.name : h.name.trim().slice(0, 60),
        type: old ? dish.type : known(TYPES, h.type) ? h.type : null,
        kcal: old ? dish.kcal : cleanKcal(h.kcal),
        icon: cleanIcon(h.icon, old ? dish.name : h.name.trim()),
        // Notities van voor de badges nemen deze twee over van het gerecht, als dat er nog is.
        healthy: typeof h.healthy === 'boolean' ? h.healthy : dish ? dish.healthy : false,
        time: known(TIMES, h.time) ? h.time : dish && !('time' in h) ? dish.time : null,
        meal: known(MEALS, h.meal) ? h.meal : 'avond',
        date: new Date(h.date).toISOString(),
        picked: h.picked !== false,
      };
    }).filter(Boolean).slice(-MAX_HISTORY),
    badges: Object.fromEntries(BADGES
      .filter(b => data.badges && typeof data.badges[b.id] === 'string' && !isNaN(new Date(data.badges[b.id]).getTime()))
      .map(b => [b.id, new Date(data.badges[b.id]).toISOString()])),
    shopping: list(data.shopping)
      .filter(i => i && typeof i.text === 'string' && i.text.trim())
      .map(i => ({ id: newId(), text: i.text.trim().slice(0, SHOPPING_LENGTH), done: i.done === true, dish: typeof i.dish === 'string' ? i.dish.slice(0, 60) : '' })),
  };
}

// Lukt het bewaren niet (de opslag is vol of geblokkeerd), dan blijft de app werken tot het sluiten en
// staat er een waarschuwing op het startscherm en bij de back-up (zie saveWarningHtml).
let saveFailed = false;
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saveFailed = false;
  } catch (e) {
    saveFailed = true;
  }
}

function saveWarningHtml() {
  return saveFailed ? '<div class="notice" role="alert">Let op: ik kan je gegevens op dit apparaat niet bewaren. Sluit je de app, dan ben je kwijt wat je daarna hebt gedaan. Dat gebeurt als de opslag vol is of als je privé surft. Maak een back-up bij de instellingen.</div>' : '';
}

// Vraagt de browser om de gegevens van de app niet uit zichzelf op te ruimen als het apparaat vol raakt.
function keepStorage() {
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}

// Zet de back-up terug die de gebruiker heeft gekozen (zie de wijziging import): alles in de app wordt vervangen.
function restoreBackup() {
  if (!pendingImport) return;
  state = { ...pendingImport, onboarded: true };
  pendingImport = null;
  checkBadges();
  save();
  applyTheme();
  go('more', { tab: 'backup', message: `Back-up teruggezet: ${dishCount(state.dishes.length)}.` });
}

// ---------- Hulpfuncties ----------

function esc(text) {
  return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function newId() {
  return Date.now().toString(36) + (idCounter++).toString(36) + Math.random().toString(36).slice(2, 6);
}

function dishById(id) {
  return state.dishes.find(d => d.id === id);
}

// De grenzen zijn die van de derde vraag: licht is tot en met 400, stevig is 700 of meer.
function kcalCategory(kcal) {
  if (kcal <= 400) return 'licht';
  if (kcal < 700) return 'gemiddeld';
  return 'stevig';
}

// Een opsomming in gewone taal: "gezond eten, uitgebreid koken en afwisselen".
function listText(items) {
  return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} en ${items[items.length - 1]}`;
}

function cleanKcal(kcal) {
  return Number.isFinite(kcal) && kcal >= 0 && kcal <= 5000 ? Math.round(kcal) : null;
}

function cleanMeals(meals) {
  const known = Array.isArray(meals) ? Object.keys(MEALS).filter(m => meals.includes(m)) : [];
  return known.length ? known : ['avond'];
}

// De maaltijd die bij het tijdstip past: ontbijt van 4 tot 11 uur, middageten tot 16 uur, daarna avondeten.
function defaultMeal() {
  const hour = new Date().getHours();
  return hour >= 4 && hour < 11 ? 'ontbijt' : hour >= 11 && hour < 16 ? 'middag' : 'avond';
}

// Zet de maaltijd gelijk met de klok, tenzij de gebruiker in dit dagdeel zelf een andere koos.
// Geeft terug of er iets veranderde. Alleen aangeroepen op het startscherm, zodat de maaltijd
// niet verspringt terwijl je midden in het kiezen zit.
function syncMeal() {
  const slot = defaultMeal();
  if (manualMeal && manualMeal.slot !== slot) manualMeal = null;
  const next = manualMeal ? manualMeal.meal : slot;
  const changed = next !== meal;
  meal = next;
  return changed;
}

// Alleen bekende diëten, in vaste volgorde. Bij een gerecht hoort vegetarisch er niet bij: dat volgt uit de soort.
function cleanDiets(diets, withVegetarian) {
  const list = Array.isArray(diets) ? diets : [];
  return Object.keys(DIETS).filter(key => list.includes(key) && (withVegetarian || key !== 'vegetarisch'));
}

// De diëten van een gerecht uit de lijst; een onbekende naam heeft er geen.
function catalogDiets(name) {
  if (!Object.hasOwn(CATALOG_ALLERGENS, name)) return [];
  const diets = Object.hasOwn(CATALOG_DIETS, name) ? [...CATALOG_DIETS[name]] : [];
  // Glutenvrij en lactosevrij volgen uit de allergenen van het gerecht.
  if (!CATALOG_ALLERGENS[name].includes('gluten')) diets.push('glutenvrij');
  if (!CATALOG_ALLERGENS[name].includes('melk')) diets.push('lactosevrij');
  return cleanDiets(diets, false);
}

// De allergenen van een gerecht uit de lijst; een onbekende naam heeft er geen.
function catalogAllergens(name) {
  return Object.hasOwn(CATALOG_ALLERGENS, name) ? cleanAllergens(CATALOG_ALLERGENS[name]) : [];
}

// Alleen bekende allergenen, in vaste volgorde.
function cleanAllergens(allergens) {
  const list = Array.isArray(allergens) ? allergens : [];
  return Object.keys(ALLERGENS).filter(key => list.includes(key));
}

// Zelf toegevoegde allergieën: korte woorden, zonder dubbele.
function cleanTerms(terms) {
  const seen = new Set();
  const clean = [];
  for (const term of Array.isArray(terms) ? terms : []) {
    const text = typeof term === 'string' ? term.trim().slice(0, 30) : '';
    if (text.length < 2 || seen.has(searchKey(text))) continue;
    seen.add(searchKey(text));
    clean.push(text);
  }
  return clean.slice(0, 12);
}

// Past een gerecht (met zijn soort en zijn diëten) bij alles wat de gebruiker als dieet heeft ingesteld?
function fitsDiet(type, diets) {
  return state.diet.every(key => key === 'vegetarisch' ? type === 'vega' : diets.includes(key));
}

// De recepten uit recipes.js op naam, zonder op hoofdletters te letten, en voor hoeveel personen ze zijn.
const RECIPE_BY_NAME = new Map(Object.entries(RECIPES).map(([name, recipe]) => [name.toLowerCase(), recipe]));
const RECIPE_SERVES = 2;

// Het recept van een gerecht: wat je er zelf bij hebt gezet, en anders het recept dat de app al heeft.
// `own` zegt welke van de twee het is.
function recipeOf(dish) {
  const ingredients = dish.ingredients || [];
  if (ingredients.length || dish.recipe) return { ingredients, recipe: dish.recipe || '', own: true };
  const [list, recipe] = RECIPE_BY_NAME.get(dish.name.toLowerCase()) || ['', ''];
  return { ingredients: list ? list.split('|') : [], recipe, own: false };
}

// De ingrediënten van een gerecht die al op de boodschappenlijst staan en nog niet zijn afgevinkt.
function openShopping(dish) {
  return new Set(state.shopping.filter(item => !item.done && item.dish === dish.name).map(item => item.text));
}

// Welke allergenen van de gebruiker in een gerecht zitten, als leesbare namen. Aangevinkte allergenen tellen
// als ze bij het gerecht staan; een zelf toegevoegde allergie telt als het woord in de naam of de
// ingrediënten van het gerecht voorkomt.
function userAllergens(dish) {
  const tagged = state.allergies.filter(key => dish.allergens.includes(key)).map(key => ALLERGENS[key][0].toLowerCase());
  const text = plainWords([dish.name, dish.about || '', ...recipeOf(dish).ingredients].join(' '));
  return [...tagged, ...state.otherAllergies.filter(term => allergyWords(term).some(word => mentions(text, word)))];
}

// Een tekst als losse woorden met een spatie ertussen: zonder hoofdletters, accenten en leestekens.
function plainWords(text) {
  return searchKey(text).replace(/'s\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

// De vormen waarin een woord in een recept kan staan: zoals getypt, het enkelvoud en het meervoud
// ("tomaat" en "tomaten", "boon" en "bonen", "kip" en "kippen", "druif" en "druiven"). Er zitten ook vormen
// bij die niet bestaan; die vinden niets en kunnen dus geen kwaad.
function wordForms(word) {
  const forms = new Set([word]);
  const soft = letter => ({ f: 'v', s: 'z' }[letter] || letter);
  const hard = letter => ({ v: 'f', z: 's' }[letter] || letter);
  const end = word.slice(-1);
  if (word.length > 3 && word.endsWith('en')) {
    // Van meervoud naar enkelvoud: uien wordt ui, kippen wordt kip, tomaten wordt tomaat, druiven wordt druif.
    const base = word.slice(0, -2);
    forms.add(base);
    forms.add(base.slice(0, -1) + hard(base.slice(-1)));
    if (/([^aeiou])\1$/.test(base)) forms.add(base.slice(0, -1));
    const open = base.match(/^(.*[^aeiou])([aeou])([^aeiou])$/);
    if (open) forms.add(open[1] + open[2] + open[2] + hard(open[3]));
  } else {
    // Van enkelvoud naar meervoud: ui wordt uien, boon wordt bonen, kip wordt kippen, kaas wordt kazen.
    forms.add(`${word.slice(0, -1)}${soft(end)}en`);
    const long = word.match(/^(.*)([aeou])\2([^aeiou])$/);
    if (long) forms.add(`${long[1]}${long[2]}${soft(long[3])}en`);
    if (/[^aeiou][aeiou][bdfgklmnprst]$/.test(word)) forms.add(`${word}${end}en`);
    if (word.length > 4 && end === 's') forms.add(word.slice(0, -1));
  }
  for (const pair of ODD_PLURALS) {
    if (pair.includes(word)) pair.forEach(form => forms.add(form));
  }
  return [...forms].filter(form => form.length > 1);
}

// Het allergeen uit de lijst van veertien dat iemand bedoelt met een zelf getypt woord ("eieren", "lactose"),
// of niets als het woord daar niet bij hoort.
function listedAllergen(term) {
  const forms = wordForms(plainWords(term));
  const alias = forms.find(form => Object.hasOwn(ALLERGEN_ALIASES, form));
  return alias ? ALLERGEN_ALIASES[alias] : Object.keys(ALLERGENS).find(key => forms.includes(plainWords(ALLERGENS[key][0]))) || '';
}

// Staat een woord, in een van zijn vormen, in een tekst (zie plainWords)? Een lang woord telt ook als deel
// van een langer woord ("tomaat" in "tomatensoep"). Een kort woord telt alleen aan het begin of het eind van
// een woord, omdat het anders overal in zit ("ui" in "fruit" en "kruiden").
function mentions(text, word) {
  const forms = wordForms(word);
  const clean = forms.flatMap(form => LOOKALIKES[form] || []).reduce((rest, other) => rest.split(other).join(' '), text);
  const words = clean.split(' ');
  return forms.some(form => {
    if (form.length > 3) return clean.includes(form);
    if (form.length === 3) return words.some(w => w.startsWith(form) || w.endsWith(form));
    return words.some(w => w === form || w === `${form}tje` || w === `${form}tjes` || (w.length > 4 && w.endsWith(form)));
  });
}

// De woorden waar een zelf toegevoegde allergie voor staat: meestal het woord zelf, bij een groep (zoals
// peulvruchten) de producten die erbij horen.
function allergyWords(term) {
  const word = plainWords(term);
  const group = wordForms(word).find(form => Object.hasOwn(ALLERGY_GROUPS, form));
  return group ? ALLERGY_GROUPS[group][0] : [word];
}

// De toelichting bij een zelf toegevoegde allergie die voor een groep staat, of niets.
function allergyHint(term) {
  const group = wordForms(plainWords(term)).find(form => Object.hasOwn(ALLERGY_GROUPS, form));
  return group ? ALLERGY_GROUPS[group][1] : '';
}

// Heeft de gebruiker een allergie opgegeven, aangevinkt of zelf toegevoegd?
function hasAllergy() {
  return state.allergies.length > 0 || state.otherAllergies.length > 0;
}

// Mag de app dit gerecht voorstellen? Alleen als het bij het dieet past en geen allergeen van de gebruiker
// bevat. Een gerecht uit de wereldkeuken waarvan nog niets is nagekeken, slaat de app over zodra de
// gebruiker een allergie of een dieet heeft: van zo'n gerecht is alleen de naam zeker.
function suitable(dish) {
  if (dish.unchecked && (hasAllergy() || state.diet.length > 0)) return false;
  return fitsDiet(dish.type, dish.diets) && userAllergens(dish).length === 0;
}

// Waarom de app een gerecht niet voorstelt vanwege een allergie, of niets als dat niet speelt.
function allergyBlock(dish) {
  if (dish.unchecked && hasAllergy()) return 'allergenen nog niet ingevuld';
  if (dish.unchecked && state.diet.length > 0) return 'dieet en allergenen nog niet ingevuld';
  const found = userAllergens(dish);
  return found.length ? `bevat ${found.join(', ')}` : '';
}

// Een gerecht uit de lijst met bekende gerechten, klaar om bij de favorieten te zetten.
function catalogEntry([name, meals, time, type, kcal, healthy]) {
  return {
    id: newId(), name, meals: [...meals], time, type, kcal, healthy, icon: '', about: '',
    diets: catalogDiets(name), allergens: catalogAllergens(name), unchecked: false, ingredients: [], recipe: '',
  };
}

// ---------- Wereldkeuken ----------

// Het vlaggetje bij een landcode van twee letters.
function flag(code) {
  return String.fromCodePoint(...[...code].map(letter => 0x1F1E6 + letter.charCodeAt(0) - 65));
}

// Een gerecht uit world-dishes.js uitgeschreven: naam, omschrijving, soort, bereidingstijd en maaltijden.
// Het pictogram past bij de naam; zegt die niets (veel buitenlandse namen), dan bij de omschrijving.
function worldDish(row) {
  const [name, text, type, time, meals] = row.split('|');
  return {
    name, text, type: DISH_TYPE[type], time: DISH_TIME[time],
    meals: cleanMeals(meals ? [...meals].map(code => DISH_MEAL[code]) : ['avond']),
    icon: iconKey(name, text, DISH_TYPE[type]),
  };
}

// De gerechten van een land; van een land zonder gerechten een lege lijst.
function countryDishes(code) {
  return WORLD_DISHES[code] || [];
}

// Een gerecht uit de wereldkeuken als favoriet. Staat het ook in de lijst met bekende gerechten, dan komen
// de gegevens daarvandaan; anders zijn calorieën, diëten en allergenen nog onbekend. De omschrijving gaat
// mee: daar staat vaak in wat erin zit, en daar let de app op bij een zelf toegevoegde allergie.
function worldEntry(dish) {
  const listed = CATALOG.find(item => item[0].toLowerCase() === dish.name.toLowerCase());
  return listed ? catalogEntry(listed) : {
    id: newId(), name: dish.name, meals: dish.meals, time: dish.time, type: dish.type, kcal: null, healthy: false,
    icon: dish.icon, about: dish.text, diets: [], allergens: [], unchecked: true, ingredients: [], recipe: '',
  };
}

// Zet een gerecht bij de favorieten vanuit de lijst waaruit je kiest. Het blijft daar staan met een vinkje,
// zodat je ziet wat je hebt gekozen en het weer weg kunt halen.
function keepFresh(dish) {
  state.dishes.push(dish);
  view.fresh = [...(view.fresh || []), dish.id];
  save();
  render();
}

// "10 gerechten", "1 gerecht".
function dishCount(count) {
  return `${count} ${count === 1 ? 'gerecht' : 'gerechten'}`;
}

// Het vak onder de kaart met het gekozen land en de knop naar de gerechten van dat land.
function countryCardHtml() {
  const code = worldMap.selected;
  if (!code) return '<div class="card country-card muted">Tik op een land op de kaart, of zoek het hieronder.</div>';
  const count = countryDishes(code).length;
  return `
    <div class="card country-card">
      <span class="icon" aria-hidden="true">${flag(code)}</span>
      <span class="grow"><strong>${COUNTRIES[code][0]}</strong><br>
        <span class="small muted">${count ? dishCount(count) : 'Hier heb ik nog geen gerechten van'}</span></span>
      ${count ? `<button class="btn primary" data-action="open-country" data-code="${code}">Bekijk</button>` : ''}
    </div>`;
}

// Een gerecht uit de lijst in dezelfde vorm als een eigen gerecht, om het op dezelfde manier te beoordelen.
function catalogDish(item) {
  return { name: item[0], type: item[3], diets: catalogDiets(item[0]), allergens: catalogAllergens(item[0]), ingredients: [] };
}

// De gerechten voor de gekozen maaltijd die bij je dieet en je allergieën passen: hieruit kiest de app.
function mealDishes() {
  return state.dishes.filter(d => d.meals.includes(meal) && suitable(d));
}

// Het pictogram van een gerecht of notitie: zelf gekozen, en anders wat bij de naam of de soort past.
function dishIcon(dish) {
  return dish.icon || iconKey(dish.name, '', dish.type);
}

function dishMeta(dish) {
  return `${TIME_SHORT[dish.time]} · ${TYPES[dish.type]}`.toLowerCase();
}

// Voor de lijsten: op de eerste regel de maaltijden, de tijd, de soort en de calorieën; daaronder de diëten
// en de allergenen, als die er zijn.
function dishDetails(dish) {
  const first = [dish.meals.map(m => MEAL_SHORT[m].toLowerCase()).join(', '), dishMeta(dish), kcalLabel(dish), dish.healthy ? 'gezond' : ''];
  const second = [dish.diets.map(key => DIETS[key].toLowerCase()).join(', '), allergenLine(dish)];
  return [first, second].map(line => line.filter(Boolean).join(' · ')).filter(Boolean).join('<br>');
}

// "Bevat: gluten, melk", of niets als er geen allergenen bij het gerecht staan.
function allergenLine(dish) {
  if (dish.unchecked) return 'Allergenen onbekend';
  return dish.allergens.length ? `Bevat: ${dish.allergens.map(key => ALLERGENS[key][0].toLowerCase()).join(', ')}` : '';
}

function kcalLabel(dish) {
  return dish.kcal == null ? '' : `${dish.kcal} kcal`;
}

function daysSinceChosen(dishId) {
  const times = state.history.filter(h => h.dishId === dishId).map(h => new Date(h.date).getTime());
  return times.length ? (Date.now() - Math.max(...times)) / 86400000 : Infinity;
}

// ---------- Bijhouden wat je hebt gegeten ----------

// De datum op het apparaat van de gebruiker, als JJJJ-MM-DD.
function dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// De maandag van een week, `offset` weken vanaf nu. Midden op de dag, zodat zomertijd de datum niet verschuift.
function weekStart(offset) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - (d.getDay() + 6) % 7 + offset * 7);
  return d;
}

function shortDate(date) {
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

function entriesOn(day) {
  const order = Object.keys(MEALS);
  return state.history.filter(h => dayKey(h.date) === day).sort((a, b) => order.indexOf(a.meal) - order.indexOf(b.meal));
}

// De maaltijd waarmee het noteren begint. Vandaag is dat de maaltijd van dit tijdstip, als daar nog
// niets bij staat; anders de eerste maaltijd van die dag waar nog niets bij staat.
function openMeal(day) {
  const have = new Set(entriesOn(day).map(h => h.meal));
  const now = defaultMeal();
  if (day === dayKey(new Date()) && !have.has(now)) return now;
  return Object.keys(MEALS).find(m => !have.has(m)) || 'avond';
}

// Het gerecht wordt vastgelegd zoals het nu is (naam, soort, calorieën, gezond, bereidingstijd), zodat het
// overzicht en de badges blijven kloppen als het later verandert of verdwijnt.
// `picked` is waar voor een keuze via het vragenmenu.
function logEntry(source, day, mealKey, picked) {
  const date = day === dayKey(new Date()) ? new Date() : new Date(`${day}T12:00:00`);
  const entry = {
    id: newId(),
    dishId: source.id || null,
    name: source.name,
    type: source.type || null,
    kcal: source.kcal == null ? null : source.kcal,
    icon: dishIcon(source),
    healthy: source.healthy === true,
    time: source.time || null,
    meal: mealKey,
    date: date.toISOString(),
    picked,
  };
  state.history.push(entry);
  state.history = state.history.slice(-MAX_HISTORY);
  return entry;
}

// Een regel uit je week: het gerecht met eronder de maaltijd. Op het startscherm staan de calorieën
// erbij; in het weekoverzicht staat het totaal onder de dag en kun je de regel weghalen. "Afwisselen" geldt
// voor bijna alles wat je eet en staat daarom niet op de regel; gezond en uitgebreid wel.
function entryHtml(entry, removable, marks) {
  const meta = `${MEAL_SHORT[entry.meal].toLowerCase()}${removable || entry.kcal == null ? '' : ` · ${entry.kcal} kcal`}`;
  return `
    <li><span class="icon" aria-hidden="true">${iconSvg(dishIcon(entry))}</span>
    <span class="grow"><strong>${esc(entry.name)}</strong><span class="small">${meta} ${marksHtml(marks && { healthy: marks.healthy, slow: marks.slow })}</span></span>
    ${removable ? `<button class="icon-btn" data-action="remove-entry" data-id="${entry.id}" aria-label="Verwijder ${esc(entry.name)}">${iconSvg('kruis')}</button>` : ''}</li>`;
}

// ---------- Beloningen ----------

// De maandag van de week waarin een datum valt, als JJJJ-MM-DD.
function weekKey(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return dayKey(d);
}

// Waarvoor elke notitie meetelt. Afwisselen geldt voor de eerste keer dat je een gerecht in een week eet.
function entryMarks() {
  const sorted = state.history
    .map((entry, index) => ({ entry, index, time: new Date(entry.date).getTime() }))
    .sort((a, b) => a.time - b.time || a.index - b.index);
  const seen = new Set();
  const marks = new Map();
  for (const { entry } of sorted) {
    const key = `${weekKey(entry.date)}|${entry.name.toLowerCase()}`;
    marks.set(entry.id, { healthy: entry.healthy, slow: entry.time === 'uitgebreid', fresh: !seen.has(key) });
    seen.add(key);
  }
  return marks;
}

// Waarvoor een gerecht zou meetellen als je het nu eet.
function dishMarks(dish) {
  const week = weekKey(new Date());
  const name = dish.name.toLowerCase();
  return {
    healthy: dish.healthy,
    slow: dish.time === 'uitgebreid',
    fresh: !state.history.some(h => h.name.toLowerCase() === name && weekKey(h.date) === week),
  };
}

// De pictogrammen van de groepen waarvoor iets meetelt, met een omschrijving voor schermlezers.
function marksHtml(marks) {
  const keys = Object.keys(GROUPS).filter(key => marks && marks[key]);
  if (!keys.length) return '';
  const label = `Telt mee voor ${listText(keys.map(key => GROUPS[key][1].toLowerCase()))}`;
  return `<span class="marks" role="img" aria-label="${label}">${keys.map(key => iconSvg(GROUPS[key][0])).join('')}</span>`;
}

function countEntries(entries) {
  return {
    healthy: entries.filter(h => h.healthy).length,
    slow: entries.filter(h => h.time === 'uitgebreid').length,
    distinct: new Set(entries.map(h => h.name.toLowerCase())).size,
    types: new Set(entries.map(h => h.type).filter(Boolean)).size,
  };
}

// Tellingen voor de badges: in totaal, in de beste week ooit en in de huidige week.
function rewardStats() {
  const weeks = new Map();
  for (const entry of state.history) {
    const key = weekKey(entry.date);
    if (!weeks.has(key)) weeks.set(key, []);
    weeks.get(key).push(entry);
  }
  const perWeek = [...weeks.values()].map(countEntries);
  const best = {};
  for (const key of ['healthy', 'slow', 'distinct', 'types']) best[key] = Math.max(0, ...perWeek.map(week => week[key]));
  return { total: countEntries(state.history), best, now: countEntries(weeks.get(weekKey(new Date())) || []) };
}

// Kent badges toe die net zijn gehaald en geeft die terug. Een verdiende badge blijft van jou.
function checkBadges() {
  const stats = rewardStats();
  const fresh = BADGES.filter(b => !state.badges[b.id] && (b.scope === 'total' ? stats.total : stats.best)[b.key] >= b.goal);
  for (const badge of fresh) state.badges[badge.id] = new Date().toISOString();
  return fresh;
}

// Wat een nieuwe notitie heeft opgeleverd: waarvoor ze meetelt en welke badges erbij kwamen.
function rewardFor(entry) {
  return { marks: entryMarks().get(entry.id), badges: checkBadges().map(b => b.id) };
}

function rewardHtml(reward) {
  if (!reward) return '';
  const reasons = Object.keys(GROUPS).filter(key => reward.marks[key]).map(key => GROUPS[key][1].toLowerCase());
  return `
    ${reward.badges.map(id => BADGES.find(b => b.id === id)).map(b =>
      `<div class="notice reward">${iconSvg('medaille')} Nieuwe badge: <em>${b.name}</em></div>`).join('')}
    ${reasons.length ? `<div class="notice reward">Telt mee voor ${listText(reasons)}</div>` : ''}`;
}

// ---------- Gerechten kiezen ----------

// Aantal antwoorden waar het gerecht niet aan voldoet (0 = past precies).
function misses(dish, answers) {
  let n = 0;
  if (answers.time && TIME_RANK[dish.time] > TIME_RANK[answers.time]) n++;
  if (answers.type && dish.type !== answers.type) n++;
  if (answers.kcal && (dish.kcal == null || kcalCategory(dish.kcal) !== answers.kcal)) n++;
  return n;
}

// Pas gegeten gerechten krijgen een kleinere kans om vooraan te komen.
function weightedShuffle(dishes) {
  return dishes
    .map(dish => {
      const days = daysSinceChosen(dish.id);
      const weight = days < 3 ? 0.15 : days < 7 ? 0.5 : 1;
      return { dish, key: Math.pow(Math.random(), 1 / weight) };
    })
    .sort((a, b) => b.key - a.key)
    .map(x => x.dish);
}

// Eerst de gerechten die precies passen, daarna wat het dichtst in de buurt komt.
function buildQueue(answers) {
  const groups = [[], [], [], []];
  for (const dish of mealDishes()) groups[misses(dish, answers)].push(dish);
  return groups.flatMap((group, i) => weightedShuffle(group).map(dish => ({ id: dish.id, exact: i === 0 })));
}

function choose(id, note) {
  const today = dayKey(new Date());
  // Een nieuwe keuze voor dezelfde maaltijd vervangt de vorige keuze van vandaag.
  // Wat je zelf in het weekoverzicht hebt genoteerd, blijft staan.
  const replaced = state.history.filter(h => h.picked && h.meal === meal && dayKey(h.date) === today);
  state.history = state.history.filter(h => !replaced.includes(h));
  const entry = logEntry(dishById(id), today, meal, true);
  const reward = rewardFor(entry);
  save();
  go('chosen', { id, note, entryId: entry.id, replaced, reward });
}

// ---------- Beweging ----------

// Zoveel onderdelen van een scherm komen een voor een in beeld; de rest komt tegelijk met het laatste.
const STAGGER = 12;
// Zoveel gerechten staan er bij "Verras me" in de kring, en zo lang (in milliseconden) blijft de kring staan.
const SPIN_PLATES = 8;
const SPIN_TIME = 2100;
// Aantal snippers bij een nieuwe badge, hun kleuren, en na hoeveel milliseconden ze zijn opgeruimd.
const CONFETTI = 36;
const CONFETTI_COLORS = ['var(--accent)', 'var(--gold)', 'var(--olive)', 'var(--text)'];
const CONFETTI_TIME = 3800;

// Geen beweging voor wie daar op het apparaat om heeft gevraagd (zie ook style.css), en ook niet zolang de
// app niet in beeld is: dan lopen klokjes in de browser te traag om iets vloeiend te laten bewegen.
function motionOff() {
  return document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Staat op waar bij een stap terug, zodat het volgende scherm van de andere kant in beeld schuift.
let backward = false;

// Laat een nieuw scherm in beeld komen: de onderdelen kort na elkaar (zie "Beweging" in style.css).
// Opnieuw tekenen binnen een scherm doet dat niet; daarom haalt render() de klasse weer weg.
function enterScreen() {
  app.dataset.dir = backward ? 'back' : '';
  backward = false;
  [...app.children].slice(0, STAGGER).forEach((el, i) => el.style.setProperty('--i', i));
  app.classList.remove('enter');
  void app.offsetWidth;
  app.classList.add('enter');
}

// Feestelijke snippers over het scherm, bij een nieuwe badge. Ze staan los van het scherm eronder en
// ruimen zichzelf op.
function confetti() {
  if (motionOff()) return;
  const layer = document.createElement('div');
  layer.className = 'confetti';
  layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < CONFETTI; i++) {
    const piece = document.createElement('i');
    piece.style.cssText = `left:${Math.random() * 100}%;--color:${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};` +
      `--fall:${1.6 + Math.random() * 1.4}s;--wait:${Math.random() * 0.6}s;` +
      `--drift:${Math.random() * 120 - 60}px;--turn:${Math.random() * 900 - 450}deg`;
    layer.appendChild(piece);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), CONFETTI_TIME);
}

// ---------- Navigatie ----------

function go(name, extra = {}) {
  view = { name, ...extra };
  if (name === 'home') syncMeal();
  render();
  window.scrollTo(0, 0);
  enterScreen();
  if (extra.reward && extra.reward.badges.length) confetti();
  // Schermlezers en toetsenbordgebruikers beginnen bij de titel van het nieuwe scherm.
  const title = app.querySelector('h1');
  if (title) {
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
  }
  // In het weekoverzicht staat de dag waar het om gaat meteen in beeld.
  if (name === 'week') {
    const card = app.querySelector(view.day ? `.day[data-day="${view.day}"]` : '.day.today');
    if (card) card.scrollIntoView({ block: 'nearest' });
  }
  syncHistory();
}

// Verlaat het formulier van een gerecht: terug naar het recept waar je vandaan kwam, en anders naar je
// favorieten. `message` zegt wat er is bewaard.
function leaveEdit(message) {
  const from = view.returnTo;
  // De beloning van daarnet is al gevierd; die komt niet nog een keer in beeld.
  if (from && dishById(from.id)) go('chosen', { ...from, reward: null, note: message || from.note });
  else go('favorites', { message });
}

// Zorgt dat de terugknop van de telefoon naar het startscherm gaat in plaats van de app te sluiten:
// buiten het startscherm staat er precies één extra stap in de browsergeschiedenis.
// history.back() werkt met vertraging; tot die klaar is, wordt er niets aan de geschiedenis veranderd.
let pendingBack = false;
function syncHistory() {
  if (pendingBack) return;
  const inner = !['home', 'onboarding', 'welcome'].includes(view.name);
  const marked = Boolean(history.state && history.state.inner);
  if (inner && !marked) {
    history.pushState({ inner: true }, '');
  } else if (!inner && marked) {
    pendingBack = true;
    history.back();
  }
}

window.addEventListener('popstate', () => {
  if (pendingBack) {
    pendingBack = false;
    return syncHistory();
  }
  if (!state.onboarded || view.name === 'home') return;
  backward = true;
  if (view.name === 'ask' && view.step > 0) ACTIONS['ask-back']();
  else if (view.name === 'log') go('week', { offset: view.offset, day: view.day });
  else if (view.name === 'country') go('world');
  else go('home');
});

// De maaltijd op het startscherm loopt mee met de klok: elke minuut, en zodra de app weer in beeld komt.
// Na een half uur op de achtergrond vervalt ook een maaltijd die je zelf had gekozen. Na middernacht
// begint "vandaag gegeten" opnieuw.
function tickMeal() {
  if (document.hidden || !state.onboarded || view.name !== 'home') return;
  const changed = syncMeal();
  if (changed || homeDay !== dayKey(new Date())) render();
}
setInterval(tickMeal, 60000);

let hiddenSince = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    hiddenSince = Date.now();
    return;
  }
  if (hiddenSince && Date.now() - hiddenSince > 30 * 60000) manualMeal = null;
  tickMeal();
});

// Welk tabblad onderin oplicht bij een scherm. De instellingen open je vanaf het startscherm.
const NAV_TAB = {
  week: 'week', log: 'week', favorites: 'favorites', edit: 'favorites', discover: 'favorites',
  shopping: 'shopping', rewards: 'rewards',
};
// De tekst op de knop linksboven bij een recept, naar het scherm waar je vandaan kwam.
const BACK_LABEL = { home: 'Terug', favorites: 'Favorieten' };

function render() {
  if (!state.onboarded) view.name = state.welcomed ? 'onboarding' : 'welcome';
  // Alleen een nieuw scherm komt met beweging in beeld (zie enterScreen); de opmaak kan per scherm verschillen.
  app.classList.remove('enter');
  app.dataset.view = view.name;
  app.innerHTML = VIEWS[view.name]();
  if (document.getElementById('catalog')) filterCatalog();
  if (document.getElementById('favorites-list')) filterFavorites();
  if (document.getElementById('map-host')) {
    mountWorldMap();
    filterCountries();
  }
  // De camera staat alleen aan zolang het scherm met de scanner open is.
  if (view.name === 'scan' && view.stage === 'camera') mountScanner();
  else stopScanner();
  nav.hidden = !state.onboarded;
  // Een recept dat je vanuit je favorieten opent, hoort bij het tabblad Favorieten.
  const tab = NAV_TAB[view.name] || NAV_TAB[view.back] || 'home';
  for (const button of nav.querySelectorAll('button')) {
    button.classList.toggle('active', button.dataset.view === tab);
    if (button.dataset.view === tab) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
}

// ---------- Schermen ----------

// De kop van een scherm: de naam in kleine hoofdletters tussen twee lijntjes, met links en rechts plaats
// voor een knop.
function topHtml(title, left = '', right = '') {
  return `<div class="top">${left}<span class="brand">${title}</span>${right}</div>`;
}

// De knop linksboven waarmee je een scherm verlaat.
function backHtml(label, attributes) {
  return `<button class="back" ${attributes}>‹ ${label}</button>`;
}

function dishFormHtml(dish, full) {
  // Een nieuw gerecht begint met jouw dieet aangevinkt, want je voegt meestal toe wat je zelf eet.
  const d = dish || {
    name: '', meals: [state.onboarded ? meal : 'avond'], time: 'normaal',
    type: state.diet.includes('vegetarisch') || state.diet.includes('vegan') ? 'vega' : 'vlees',
    kcal: null, healthy: false, icon: '', diets: cleanDiets(state.diet, false), allergens: [], ingredients: [], recipe: '',
  };
  // De allergenen staan ingeklapt, behalve als ze ertoe doen: bij een gerecht dat er al heeft, of als je zelf een allergie hebt.
  const showAllergens = d.allergens.length > 0 || d.unchecked || hasAllergy();
  const choices = (name, map, selected) => Object.entries(map).map(([value, label]) => `
    <label class="check"><input type="radio" name="${name}" value="${value}" data-input="dish-icon"${value === selected ? ' checked' : ''}>${label}</label>`).join('');
  return `
    <form data-form="dish" novalidate>
      <label for="f-name">Naam van het gerecht</label>
      <input id="f-name" name="name" type="text" maxlength="60" autocomplete="off" data-input="dish-icon" value="${esc(d.name)}" placeholder="Bijvoorbeeld: spaghetti bolognese">
      <fieldset>
        <legend>Pictogram</legend>
        <label class="icon-pick"><input type="radio" name="icon" value=""${d.icon ? '' : ' checked'}>
          <span class="icon" id="auto-icon" aria-hidden="true">${iconSvg(iconKey(d.name, '', d.type))}</span>past bij de naam</label>
        <details${d.icon ? ' open' : ''}>
          <summary><span>Zelf een pictogram kiezen</span></summary>
          <div class="icon-grid">${DISH_ICONS.map(([key, label]) => `
            <label class="icon-pick"><input type="radio" name="icon" value="${key}" aria-label="${label}"${key === d.icon ? ' checked' : ''}>
              <span class="icon" aria-hidden="true">${iconSvg(key)}</span></label>`).join('')}
          </div>
        </details>
      </fieldset>
      <fieldset>
        <legend>Geschikt voor</legend>
        <div class="checks">${Object.entries(MEALS).map(([value, label]) => `
          <label class="check"><input type="checkbox" name="meals" value="${value}"${d.meals.includes(value) ? ' checked' : ''}>${label}</label>`).join('')}
        </div>
      </fieldset>
      <fieldset>
        <legend>Bereidingstijd</legend>
        <div class="checks">${choices('time', TIMES, d.time)}</div>
      </fieldset>
      <fieldset>
        <legend>Soort</legend>
        <div class="checks">${choices('type', TYPES, d.type)}</div>
      </fieldset>
      <label for="f-kcal">Calorieën per portie <span class="muted">(mag je overslaan)</span></label>
      <input id="f-kcal" name="kcal" type="number" inputmode="numeric" min="0" max="5000" value="${d.kcal == null ? '' : d.kcal}" placeholder="Bijvoorbeeld: 550">
      <div class="checks" style="margin-top:14px">
        <label class="check"><input type="checkbox" name="healthy"${d.healthy ? ' checked' : ''}>${iconSvg('blad')} Dit is een gezonde maaltijd</label>
      </div>
      <p class="small muted" style="margin-top:6px">Gezonde en uitgebreide maaltijden tellen mee voor je badges.</p>
      <fieldset>
        <legend>Past bij dieet <span class="muted">(mag je overslaan)</span></legend>
        <div class="checks">${Object.entries(DIETS).filter(([key]) => key !== 'vegetarisch').map(([key, label]) => `
          <label class="check"><input type="checkbox" name="diets" value="${key}"${d.diets.includes(key) ? ' checked' : ''}>${label}</label>`).join('')}
        </div>
      </fieldset>
      <p class="small muted" style="margin-top:6px">Vegetarisch hoef je niet aan te vinken: dat volgt uit de soort.</p>
      <details${showAllergens ? ' open' : ''}>
        <summary><span>Allergenen in dit gerecht <span class="muted">(mag je overslaan)</span></span></summary>
        <p class="small muted">${d.unchecked ? 'Van dit gerecht zijn de allergenen nog niet ingevuld. ' : ''}Vink aan wat erin zit. Heb je zelf een allergie, dan stel ik dit gerecht niet voor als het jouw allergeen bevat.</p>
        ${allergenChecksHtml('allergens', d.allergens, 'dish')}
      </details>
      ${full ? `
        <label for="f-ingredients">Ingrediënten <span class="muted">(één per regel, mag je overslaan)</span></label>
        <textarea id="f-ingredients" name="ingredients" placeholder="500 g gehakt&#10;1 ui">${esc(recipeOf(d).ingredients.join('\n'))}</textarea>
        <label for="f-recipe">Bereidingswijze <span class="muted">(mag je overslaan)</span></label>
        <textarea id="f-recipe" name="recipe">${esc(recipeOf(d).recipe)}</textarea>
        ${recipeOf(d).own ? '' : `<p class="small muted" style="margin-top:6px">Dit recept (voor ${RECIPE_SERVES} personen) zat al in de app. Je kunt het hier aanpassen.</p>`}` : ''}
      <p class="error" role="alert" hidden></p>
      <p></p>
      <button class="btn primary" type="submit">${dish ? 'Opslaan' : 'Gerecht toevoegen'}</button>
    </form>`;
}

// Past een gerecht uit de wereldkeuken bij het dieet en de allergieën van de gebruiker? Van een gerecht dat
// ook in de lijst met bekende gerechten staat, is dat bekend. Van de rest is alleen de soort bekend: wie
// vegetarisch of veganistisch eet, krijgt daarvan alleen de vegetarische te zien.
function localSuitable(dish) {
  const listed = CATALOG.find(item => item[0].toLowerCase() === dish.name.toLowerCase());
  if (listed) return suitable(catalogDish(listed));
  if (dish.type !== 'vega' && (state.diet.includes('vegetarisch') || state.diet.includes('vegan'))) return false;
  // Staat een zelf toegevoegde allergie al in de naam of de omschrijving, dan blijft het gerecht weg.
  return userAllergens({ name: dish.name, about: dish.text, allergens: [], ingredients: [] }).length === 0;
}

// De lijst waaruit je gerechten kiest, met een keuze per maaltijd, een zoekveld en een balk om naar een
// groepje te springen. Bovenaan staat wat er in het land van de gebruiker veel wordt gegeten, daaronder de
// bekende gerechten per groepje. Wat je al had, staat er niet tussen; wat je hier net hebt gekozen wel, met
// een vinkje. Welke regels er te zien zijn, regelt filterCatalog() na het tekenen.
function catalogHtml(defaultMeal) {
  const filter = view.catalogMeal || defaultMeal;
  const mine = new Map(state.dishes.map(d => [d.name.toLowerCase(), d]));
  const fresh = dish => !state.onboarded || (view.fresh || []).includes(dish.id);
  const fits = meals => filter === 'alles' || meals.includes(filter);
  const row = (name, icon, text, add) => {
    const dish = mine.get(name.toLowerCase());
    if (dish && !fresh(dish)) return '';
    return `
      <li data-name="${esc(searchKey(name))}"><span class="icon" aria-hidden="true">${iconSvg(icon)}</span>
      <span class="grow"><strong>${esc(name)}</strong><br><span class="small muted">${esc(text)}</span></span>
      ${dish
        ? `<button class="icon-btn on" data-action="remove-dish" data-id="${dish.id}" aria-label="Haal ${esc(name)} weer weg">✓</button>`
        : `<button class="icon-btn" ${add} aria-label="Zet ${esc(name)} bij je favorieten">+</button>`}</li>`;
  };
  const country = COUNTRIES[state.country][0];
  const local = countryDishes(state.country).map((line, index) => ({ dish: worldDish(line), index }))
    .filter(({ dish }) => fits(dish.meals) && localSuitable(dish));
  // Een gerecht dat al bij het land staat, komt niet nog eens in een groepje.
  const localNames = new Set(local.map(({ dish }) => dish.name.toLowerCase()));
  const sections = [{
    id: 'group-local', title: `Veel gegeten in ${country}`, short: `${flag(state.country)} ${country}`,
    rows: local.map(({ dish, index }) => row(dish.name, dish.icon, dish.text, `data-action="add-local" data-index="${index}"`)),
  }, ...CATALOG_GROUPS.map(([title, names], n) => ({
    id: `group-${n}`, title, short: title,
    rows: names.map(name => CATALOG.findIndex(item => item[0] === name))
      .filter(index => fits(CATALOG[index][1]) && !localNames.has(CATALOG[index][0].toLowerCase()) && suitable(catalogDish(CATALOG[index])))
      .map(index => {
        const [name, , time, type] = CATALOG[index];
        return row(name, iconKey(name, '', type), dishMeta({ time, type }), `data-action="add-suggestion" data-index="${index}"`);
      }),
  }))].map(section => ({ ...section, rows: section.rows.filter(Boolean) })).filter(section => section.rows.length);
  return `
    <div class="segments" role="group" aria-label="Maaltijd">${[['alles', 'Alles'], ...Object.entries(MEAL_SHORT)].map(([value, label]) => `
      <button data-action="catalog-meal" data-meal="${value}" aria-pressed="${value === filter}">${label}</button>`).join('')}
    </div>
    <input type="search" data-input="catalog-search" value="${esc(view.catalogQuery || '')}" placeholder="Zoek een gerecht" aria-label="Zoek een gerecht">
    <div class="jump" id="catalog-jump" role="group" aria-label="Ga naar een groep">${sections.map(section => `
      <button class="chip" data-action="catalog-jump" data-target="${section.id}">${section.short}</button>`).join('')}
    </div>
    <div id="catalog">${sections.map(section => `
      <section id="${section.id}">
        <h2>${section.title}</h2>
        ${section.id === 'group-local' && (hasAllergy() || state.diet.length) ? '<p class="small muted">Van sommige van deze gerechten ken ik de allergenen en de diëten niet. Vul die na het toevoegen zelf in; tot die tijd stel ik ze niet voor.</p>' : ''}
        <div class="card pick"><ul class="list">${section.rows.join('')}</ul>
          <button class="btn link" data-action="catalog-more" data-group="${section.id}" hidden></button></div>
        ${section.id === 'group-local' ? '<p class="small muted">Woon je ergens anders? Je kiest je land bij de instellingen, op het tabblad Profiel.</p>' : ''}
      </section>`).join('')}
    </div>
    <p class="small muted" id="catalog-empty" hidden></p>
    ${state.diet.length ? `<p class="small muted">Je ziet alleen gerechten die passen bij je dieet: ${state.diet.map(key => DIETS[key].toLowerCase()).join(', ')}.</p>` : ''}
    ${allergyNames().length ? `<p class="small muted">Gerechten waar meestal ${allergyNames().join(', ')} in zit, laat ik weg. Controleer bij een allergie altijd zelf de ingrediënten.</p>` : ''}
    <p class="small muted">Calorieën, het vinkje "gezond", de diëten en de allergenen zijn bij deze gerechten een schatting. Je kunt alles later aanpassen.</p>`;
}

// De allergieën van de gebruiker als leesbare namen: de aangevinkte en de zelf toegevoegde.
function allergyNames() {
  return [...state.allergies.map(key => ALLERGENS[key][0].toLowerCase()), ...state.otherAllergies.map(term => esc(term.toLowerCase()))];
}

// Aanvinkbare allergenen. Voor de gebruiker zelf staat er uitleg bij; bij een gerecht alleen de naam.
function allergenChecksHtml(name, checked, change) {
  return `
    <div class="checks">${Object.entries(ALLERGENS).map(([key, [label, hint]]) => `
      <label class="check${change === 'dish' ? '' : ' wide'}"><input type="checkbox" name="${name}" value="${key}"${change === 'user' ? ' data-change="set-allergy"' : ''}${checked.includes(key) ? ' checked' : ''}>
        <span>${label}${change !== 'dish' && hint ? ` <span class="small muted">· ${hint}</span>` : ''}</span></label>`).join('')}
    </div>`;
}

// De waarschuwing die overal bij allergieën hoort te staan.
const ALLERGY_WARNING = 'Belangrijk: wat er bij een gerecht staat, is een schatting van wat er meestal in zit. Recepten en producten verschillen, dus de app kan niet garanderen dat een gerecht veilig voor je is. Controleer altijd zelf de ingrediënten en de etiketten.';

// De ronde profielfoto, of je voorletter zolang er geen foto is. Tikken opent de fotokiezer van het apparaat.
function avatarHtml() {
  return `
    <button class="avatar" data-action="photo-pick" aria-label="${state.photo ? 'Profielfoto aanpassen' : 'Profielfoto kiezen'}">
      ${state.photo ? `<img src="${state.photo}" alt="">` : `<span aria-hidden="true">${state.name ? esc([...state.name][0].toUpperCase()) : iconSvg('bord')}</span>`}
      <span class="avatar-badge" aria-hidden="true">${iconSvg('camera')}</span>
    </button>
    <input id="photo-file" type="file" accept="image/*" data-change="photo" hidden>`;
}

// De keuzelijst met alle landen, voor het land waar de gebruiker woont.
function countrySelectHtml(attributes) {
  const names = Object.entries(COUNTRIES).sort((a, b) => a[1][0].localeCompare(b[1][0], 'nl'));
  return `<select id="f-country" name="country"${attributes}>${names.map(([code, [name]]) =>
    `<option value="${code}"${code === state.country ? ' selected' : ''}>${name}</option>`).join('')}</select>`;
}

// Aanvinkbare diëten voor de gebruiker zelf, op het welkomstscherm en bij de instellingen.
function dietChecksHtml(change) {
  return `
    <div class="checks">${Object.entries(DIETS).map(([key, label]) => `
      <label class="check"><input type="checkbox" name="diet" value="${key}"${change ? ' data-change="set-diet"' : ''}${state.diet.includes(key) ? ' checked' : ''}>${label}</label>`).join('')}
    </div>`;
}

// Laat in de lijst met gerechten zien wat bij het zoekwoord past. Zonder zoekwoord zie je van elk groepje
// eerst een paar gerechten, met een knop voor de rest; het groepje van je land staat er helemaal.
function filterCatalog() {
  const query = searchKey(view.catalogQuery || '').trim();
  const open = view.catalogOpen || [];
  let found = 0;
  for (const section of document.querySelectorAll('#catalog section')) {
    const rows = [...section.querySelectorAll('li')];
    const matches = rows.filter(row => row.dataset.name.includes(query));
    const limit = query || section.id === 'group-local' || open.includes(section.id) ? Infinity : CATALOG_PREVIEW;
    const shown = matches.slice(0, limit);
    for (const row of rows) {
      row.hidden = !shown.includes(row);
      // De laatste regel die je ziet, heeft geen streep eronder.
      row.classList.toggle('last', row === shown[shown.length - 1]);
    }
    const more = section.querySelector('[data-action="catalog-more"]');
    more.hidden = matches.length <= limit;
    more.textContent = `Toon nog ${matches.length - limit}`;
    section.hidden = matches.length === 0;
    document.querySelector(`#catalog-jump [data-target="${section.id}"]`).hidden = section.hidden;
    found += matches.length;
  }
  const empty = document.getElementById('catalog-empty');
  empty.hidden = found > 0;
  empty.textContent = query ? 'Niets gevonden. Je kunt het gerecht ook zelf toevoegen.' : 'Je hebt alle gerechten uit deze lijst al.';
}

// Laat van je favorieten alleen de gerechten zien die bij het zoekwoord passen.
function filterFavorites() {
  const query = searchKey(view.query || '').trim();
  let shown = 0;
  for (const row of document.querySelectorAll('#favorites-list > li')) {
    row.hidden = !row.dataset.name.includes(query);
    if (!row.hidden) shown++;
  }
  const empty = document.getElementById('favorites-empty');
  if (empty) empty.hidden = shown > 0;
}

// Een voorstel als kaart.
function barHtml(item) {
  const dish = dishById(item.id);
  return `
    <button class="bar${item.exact ? '' : ' near'}" data-action="pick" data-id="${dish.id}">
      <span class="icon" aria-hidden="true">${iconSvg(dishIcon(dish))}</span>
      <span class="bar-text">
        ${item.exact ? '' : '<span class="tag">past bijna</span><br>'}
        <span class="bar-name">${esc(dish.name)}</span><br>
        <span class="bar-meta">${dishMeta(dish)}</span>
      </span>
      <span class="bar-kcal">${dish.kcal == null ? '' : `<b>${dish.kcal}</b>kcal`}${marksHtml(dishMarks(dish))}</span>
    </button>`;
}

// ---------- Een product scannen (zie scan.js) ----------

// Wat een gescand product voor deze gebruiker betekent: welke van zijn allergenen erin zitten (volgens de
// gegevens, of omdat het woord in de naam of de ingrediënten staat), waarvan er sporen in kunnen zitten, en
// welke zelf toegevoegde allergieën in de naam of de ingrediënten staan.
function productRisks(product) {
  const text = plainWords(`${product.name} ${product.ingredients}`);
  const inText = key => ALLERGEN_WORDS[key].some(word => mentions(text, word));
  const contains = state.allergies.filter(key => product.contains.known.includes(key) || inText(key));
  return {
    contains,
    traces: state.allergies.filter(key => product.traces.known.includes(key) && !contains.includes(key)),
    words: state.otherAllergies.filter(term => allergyWords(term).some(word => mentions(text, word))),
  };
}

// Opent de scanner en zet de camera aan. Lukt dat niet (geen camera, of geen toestemming), dan zegt het scherm
// dat en kan de gebruiker de cijfers onder de streepjescode intypen.
function openScan() {
  go('scan', { stage: 'camera' });
  startScanner(scanLookup).catch(error => {
    if (view.name !== 'scan' || view.stage !== 'camera') return;
    view.cameraError = error && error.name === 'NotAllowedError'
      ? 'De camera mag niet aan. Geef de app toestemming in de instellingen van je telefoon, of typ de cijfers hieronder.'
      : 'Ik kan de camera niet aanzetten. Typ hieronder de cijfers die onder de streepjescode staan.';
    render();
  });
}

// Zoekt het product bij een streepjescode op en laat zien wat erover bekend is.
async function scanLookup(code) {
  go('scan', { stage: 'loading', code });
  let stage = 'error';
  let product = null;
  try {
    product = await lookupProduct(code);
    stage = product ? 'result' : 'missing';
  } catch (e) { /* geen internet, of geen antwoord */ }
  // Is de gebruiker intussen iets anders gaan doen, dan blijft dat staan.
  if (view.name !== 'scan' || view.stage !== 'loading' || view.code !== code) return;
  go('scan', { stage, code, product });
}

// Het veld om de cijfers van een streepjescode in te typen, voor als de camera niet lukt.
function scanTypedHtml() {
  return `
    <h2>Of typ de cijfers</h2>
    <form data-form="scan-code" class="row">
      <input name="code" type="text" inputmode="numeric" autocomplete="off" maxlength="20" value="${esc(view.typed || '')}" placeholder="De cijfers onder de streepjes" aria-label="De cijfers onder de streepjescode">
      <button class="btn primary" type="submit">Zoek</button>
    </form>
    ${view.codeError ? `<p class="error" role="alert">${esc(view.codeError)}</p>` : ''}`;
}

// Wat er over een gescand product bekend is: de calorieën, de allergenen en een waarschuwing als een allergie
// van de gebruiker erbij staat.
function scanResultHtml(top) {
  const product = view.product;
  const risks = productRisks(product);
  const label = key => ALLERGENS[key][0].toLowerCase();
  const pills = group => [...group.known.map(key => [label(key), state.allergies.includes(key)]), ...group.other.map(text => [text, false])]
    .map(([text, mine]) => `<span class="pill${mine ? ' mine' : ''}">${esc(text)}</span>`).join('');
  const has = group => group.known.length + group.other.length > 0;
  const alarms = [
    risks.contains.length ? `dit product bevat ${listText(risks.contains.map(label))}` : '',
    risks.traces.length ? `het kan sporen van ${listText(risks.traces.map(label))} bevatten` : '',
    risks.words.length ? `in de naam of de ingrediënten staat ${listText(risks.words.map(word => esc(word.toLowerCase())))}` : '',
  ].filter(Boolean);
  const facts = has(product.contains) || has(product.traces) || product.ingredients;
  return `${top}
    <div class="hero"><h1>${esc(product.name)}</h1>
      <p class="sub">${esc([product.brand, product.quantity].filter(Boolean).join(' · ')) || `code ${esc(product.code)}`}</p></div>
    ${alarms.length ? `<div class="notice alarm" role="alert">${iconSvg('waarschuwing')} Let op: ${listText(alarms)}. Dat staat bij jouw allergieën.</div>`
      : hasAllergy() ? `<div class="notice">${facts ? 'Ik zie geen van jouw allergieën bij dit product. Kijk voor de zekerheid ook op het etiket.'
        : 'Van dit product zijn de ingrediënten niet ingevuld. Ik kan dus niet zeggen of jouw allergie erin zit: kijk op het etiket.'}</div>` : ''}
    <div class="facts">
      <span><b>${product.kcal == null ? '?' : product.kcal}</b>kcal per ${product.liquid ? '100 ml' : '100 g'}</span>
      ${product.kcalServing == null ? '' : `<span><b>${product.kcalServing}</b>kcal per portie${product.serving ? ` (${esc(product.serving)})` : ''}</span>`}
    </div>
    ${product.kcal == null ? '<p class="small muted">De calorieën van dit product zijn niet ingevuld.</p>' : ''}
    <h2>Allergenen</h2>
    ${has(product.contains) ? `<p class="small muted">Bevat</p><div class="pills">${pills(product.contains)}</div>` : ''}
    ${has(product.traces) ? `<p class="small muted">Kan sporen bevatten van</p><div class="pills">${pills(product.traces)}</div>` : ''}
    ${has(product.contains) || has(product.traces) ? '' : `<p>${product.ingredients ? 'Bij dit product staan geen allergenen genoteerd.' : 'De allergenen van dit product zijn niet ingevuld.'}</p>`}
    ${product.ingredients ? `<details><summary><span>Ingrediënten</span></summary><p class="small" style="margin-top:10px">${esc(product.ingredients)}</p></details>` : ''}
    <p class="small muted" style="margin-top:14px">Deze gegevens komen van Open Food Facts en zijn ingevuld door vrijwilligers. Ze kunnen onvolledig of verouderd zijn: wat op de verpakking staat, is altijd leidend.</p>
    <button class="btn primary" data-action="scan-log">Noteer dit als gegeten</button>
    <button class="btn" data-action="scan-shop"${view.shopped ? ' disabled' : ''}>${view.shopped ? '✓ Op de boodschappenlijst gezet' : `${iconSvg('mand')} Zet op de boodschappenlijst`}</button>
    <button class="btn" data-action="open-scan">${iconSvg('streepjescode')} Nog een product scannen</button>`;
}

const VIEWS = {
  // De eerste keer openen: de omslag van het kookboek.
  welcome() {
    return `
      <div class="cover">
        <p class="over">Het kookboek van jou</p>
        <h1 class="title">Wat eten<br><em>we?</em></h1>
        <div class="orn"><i></i></div>
        <div class="hero"><div class="emoji">${iconSvg('bord')}</div>
          <p class="sub">Weet je vaak niet wat je moet eten? Ik help je kiezen uit je eigen favorieten.</p></div>
        <form data-form="welcome">
          <label for="f-yourname">Hoe mag ik je noemen? <span class="muted">(mag je overslaan)</span></label>
          <input id="f-yourname" name="name" type="text" maxlength="30" autocomplete="given-name" placeholder="Je voornaam">
          <label for="f-country">In welk land woon je?</label>
          ${countrySelectHtml('')}
          <p class="small muted" style="margin-top:6px">Dan laat ik eerst zien wat daar veel wordt gegeten.</p>
          <details>
            <summary><span>Dieet of allergie <span class="muted">(mag je overslaan)</span></span></summary>
            <fieldset>
              <legend>Volg je een dieet?</legend>
              ${dietChecksHtml(false)}
            </fieldset>
            <p class="small muted" style="margin-top:6px">Dan stel ik alleen gerechten voor die erbij passen. Je kunt dit later aanpassen bij de instellingen.</p>
            <fieldset>
              <legend>Heb je een voedselallergie?</legend>
              <p class="small muted">Vink aan waar je allergisch voor bent. Andere allergieën voeg je later toe bij de instellingen.</p>
              ${allergenChecksHtml('allergies', state.allergies, 'welcome')}
            </fieldset>
            <p class="small muted" style="margin-top:8px">${ALLERGY_WARNING}</p>
          </details>
          <p></p>
          <button class="btn primary big sticky" type="submit">Aan de slag</button>
        </form>
      </div>`;
  },

  onboarding() {
    const count = state.dishes.length;
    const left = MIN_DISHES - count;
    const cheer = count === 0 ? 'Begin met je eerste gerecht.' : count < 3 ? 'Goed begin!' : count < 5 ? 'Lekker bezig!'
      : count === 5 ? 'Nog eentje!' : 'Top, je kunt beginnen!';
    return `
      ${topHtml('Je favorieten')}
      <div class="hero"><div class="emoji">${iconSvg('bord')}</div><h1>Wat eet jij <em>graag</em>${state.name ? `, ${esc(state.name)}` : ''}?</h1>
        <p class="sub">Vertel me je favoriete gerechten, minimaal ${MIN_DISHES}. Daarna help ik je elke dag kiezen.</p></div>
      <p class="small muted center">${Math.min(count, MIN_DISHES)} van ${MIN_DISHES} · ${cheer}</p>
      <div class="progress"><div style="width:${Math.min(100, count / MIN_DISHES * 100)}%"></div></div>
      ${count ? `
        <p class="small muted" style="margin-bottom:6px">Jouw gerechten tot nu toe. Tik er een aan om hem weer weg te halen.</p>
        <div class="chips">${state.dishes.map(d => `
          <button class="chip picked" data-action="remove-dish" data-id="${d.id}" aria-label="Haal ${esc(d.name)} weg">
            ${iconSvg(dishIcon(d))} ${esc(d.name)} <span aria-hidden="true">✕</span></button>`).join('')}
        </div>` : ''}
      <h2>Tik op de plus bij wat je lekker vindt</h2>
      ${catalogHtml('avond')}
      <details data-remember="ownOpen"${view.ownOpen ? ' open' : ''}>
        <summary><span>Staat het er niet bij? Voeg zelf een gerecht toe</span></summary>
        ${dishFormHtml(null, false)}
      </details>
      <p></p>
      <button class="btn primary sticky" data-action="finish-onboarding"${left > 0 ? ' disabled' : ''}>
        ${left > 0 ? `Nog ${left} ${left === 1 ? 'gerecht' : 'gerechten'} te gaan` : 'Laten we beginnen!'}
      </button>
      <button class="btn link" data-action="import-pick">Ik heb al een back-up</button>
      <input id="import-file" type="file" accept="application/json,.json" data-change="import" hidden>
      ${view.message ? `<div class="notice">${esc(view.message)}</div>` : ''}`;
  },

  home() {
    homeDay = dayKey(new Date());
    const eaten = entriesOn(homeDay);
    const marks = entryMarks();
    // Staat er voor deze maaltijd vandaag al een gerecht uit je favorieten, dan kun je meteen naar het recept.
    const current = eaten.filter(h => h.meal === meal && dishById(h.dishId)).pop();
    const none = mealDishes().length === 0;
    // Zijn er wel gerechten voor deze maaltijd, maar passen ze niet bij het dieet of de allergieën?
    const dietBlocks = none && state.dishes.some(d => d.meals.includes(meal));
    const limits = [state.diet.length && 'je dieet', allergyNames().length && 'je allergieën'].filter(Boolean).join(' en ');
    // Is er niets voor deze maaltijd, dan kun je meteen overstappen naar een maaltijd waar wel iets voor is.
    const others = none ? Object.keys(MEALS).filter(key => state.dishes.some(d => d.meals.includes(key) && suitable(d))) : [];
    // Op de grote knop liggen drie van je eigen gerechten voor deze maaltijd.
    const plates = [...new Set([...mealDishes().map(dishIcon), 'lasagne', 'curry', 'salade'])].slice(0, 3);
    return `
      <div class="top">
        <button class="avatar mini" data-action="nav" data-view="more" aria-label="Je profiel en de instellingen">
          ${state.photo ? `<img src="${state.photo}" alt="">` : `<span aria-hidden="true">${state.name ? esc([...state.name][0].toUpperCase()) : iconSvg('bord')}</span>`}</button>
        <span class="hi"><small>${state.name ? dayPart() : 'Wat eten we?'}</small><b>${state.name ? esc(state.name) : dayPart()}</b></span>
        <button class="icon-btn" data-action="nav" data-view="world" aria-label="Wereldkeuken: gerechten per land">${iconSvg('wereld')}</button>
        <button class="icon-btn" data-action="nav" data-view="more" aria-label="Instellingen">${iconSvg('tandwiel')}</button>
      </div>
      ${saveWarningHtml()}
      <h1>Zin in iets <em>lekkers?</em></h1>
      <p class="sub">${current && !none ? `Je ${MEALS[meal].toLowerCase()} is gekozen. Liever iets anders? Kies gerust opnieuw.`
        : `${manualMeal ? `Je kiest nu voor ${MEALS[meal].toLowerCase()}.` : `Tijd voor ${MEALS[meal].toLowerCase()}.`} Ik help je kiezen uit je favorieten.`}</p>
      <div class="segments" role="group" aria-label="Maaltijd">${Object.entries(MEAL_SHORT).map(([value, label]) => `
        <button data-action="set-meal" data-meal="${value}" aria-pressed="${value === meal}">${label}</button>`).join('')}
      </div>
      ${current ? `
        <button class="bar" data-action="open-recipe" data-id="${current.dishId}">
          <span class="icon" aria-hidden="true">${iconSvg(dishIcon(dishById(current.dishId)))}</span>
          <span class="bar-text"><span class="no">Je ${MEALS[meal].toLowerCase()} van vandaag</span><br>
            <span class="bar-name">${esc(dishById(current.dishId).name)}</span><br>
            <span class="bar-meta">bekijk het recept</span></span>
          <span class="chev" aria-hidden="true">›</span>
        </button>` : ''}
      ${none ? `<div class="notice">Je hebt nog niets voor ${MEALS[meal].toLowerCase()}${dietBlocks ? ` dat bij ${limits} past` : ''}. Zullen we er een toevoegen?</div>
        <button class="btn primary" data-action="discover" data-meal="${meal}">${iconSvg('zoek')} Gerechten ontdekken</button>
        <button class="btn" data-action="edit-dish">+ Zelf een gerecht toevoegen</button>
        ${others.map(key => `<button class="btn" data-action="set-meal" data-meal="${key}">Of kies nu voor ${MEALS[key].toLowerCase()}</button>`).join('')}` : `
        <button class="hero-card" data-action="start-ask">
          <b>Help mij kiezen</b><small>drie vragen, vier voorstellen</small><span class="go">Begin →</span>
          ${plates.map((key, i) => `<span class="bub b${i + 1}" aria-hidden="true">${iconSvg(key)}</span>`).join('')}
        </button>
        <div class="duo">
          <button class="tile yellow" data-action="surprise"><span class="icon" aria-hidden="true">${iconSvg('dobbelsteen')}</span><b>Verras me</b><small>ik kies iets voor je</small></button>
          <button class="tile pink" data-action="nav" data-view="group-setup"><span class="icon" aria-hidden="true">${iconSvg('samen')}</span><b>Samen kiezen</b><small>ieder om de beurt</small></button>
        </div>`}
      <button class="bar" data-action="open-scan">
        <span class="icon" aria-hidden="true">${iconSvg('streepjescode')}</span>
        <span class="bar-text"><span class="bar-name">Scan een product</span><br><span class="bar-meta">calorieën en allergenen van iets uit de winkel</span></span>
        <span class="chev" aria-hidden="true">›</span>
      </button>
      ${eaten.length ? `
        <div class="label-row"><h2>Vandaag gegeten</h2><button class="btn link" data-action="nav" data-view="week">Hele week</button></div>
        <ul class="list lines">${eaten.map(h => entryHtml(h, false, marks.get(h.id))).join('')}</ul>` : ''}`;
  },

  week() {
    const offset = view.offset || 0;
    const start = weekStart(offset);
    const today = dayKey(new Date());
    const days = DAYS.map((label, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return { label, date, key: dayKey(date) };
    });
    const end = days[6].date;
    const month = date => date.toLocaleDateString('nl-NL', { month: 'long' });
    // "5 – 11 oktober", of "29 september – 5 oktober" als de week over twee maanden loopt.
    const range = start.getMonth() === end.getMonth()
      ? `${start.getDate()} – ${end.getDate()} <em>${month(end)}</em>`
      : `${start.getDate()} ${month(start)} – ${end.getDate()} <em>${month(end)}</em>`;
    const title = offset === 0 ? 'Deze week' : offset === -1 ? 'Vorige week' : `${-offset} weken geleden`;
    const marks = entryMarks();
    const keys = days.map(day => day.key);
    const counts = countEntries(state.history.filter(h => keys.includes(dayKey(h.date))));
    return `
      ${topHtml('Mijn week')}
      <div class="weeknav">
        <button class="icon-btn soft" data-action="week-move" data-step="-1" aria-label="Vorige week"${offset <= -MAX_WEEKS_BACK ? ' disabled' : ''}>‹</button>
        <h1>${range}</h1>
        <button class="icon-btn soft" data-action="week-move" data-step="1" aria-label="Volgende week"${offset >= 0 ? ' disabled' : ''}>›</button>
      </div>
      <p class="sub">${title}.${offset === 0 ? ' Wat je kiest, noteer ik vanzelf bij vandaag.' : ''}</p>
      <button class="stats" data-action="nav" data-view="rewards" aria-label="${counts.healthy} keer gezond, ${counts.slow} keer uitgebreid, ${counts.distinct} verschillende gerechten. Bekijk je badges">
        <span><b>${counts.healthy}</b>gezond</span><span><b>${counts.slow}</b>uitgebreid</span><span><b>${counts.distinct}</b>verschillend</span></button>
      ${days.map(day => {
        const entries = entriesOn(day.key);
        const future = day.key > today;
        const known = entries.filter(h => h.kcal != null);
        // Een plus achter het totaal betekent dat niet van alles de calorieën bekend zijn.
        const total = known.length ? `${known.reduce((sum, h) => sum + h.kcal, 0)}${known.length < entries.length ? '+' : ''} kcal` : '';
        return `
          ${day.key === view.day ? rewardHtml(view.reward) : ''}
          ${view.removed && day.key === dayKey(view.removed.date) ? `
            <div class="notice undo">Weggehaald: ${esc(view.removed.name)}.
              <button class="btn link" data-action="restore-entry" aria-label="Zet ${esc(view.removed.name)} terug">Zet terug</button></div>` : ''}
          <section class="day${day.key === today ? ' today' : ''}${future ? ' future' : ''}" data-day="${day.key}">
            <h2 class="date" aria-label="${day.label} ${shortDate(day.date)}${day.key === today ? ', vandaag' : ''}">${day.label.slice(0, 2)}<b>${day.date.getDate()}</b></h2>
            <div class="body">
              ${entries.length ? `<ul class="list lines">${entries.map(h => entryHtml(h, true, marks.get(h.id))).join('')}</ul>`
                : `<p class="none">${future ? 'Deze dag moet nog komen.' : 'Nog niets genoteerd.'}</p>`}
              ${future ? '' : `<div class="foot">
                <button class="btn link" data-action="log-day" data-day="${day.key}" aria-label="Iets noteren bij ${day.label.toLowerCase()}">+ iets noteren</button>
                <span>${total}</span></div>`}
            </div>
          </section>`;
      }).join('')}`;
  },

  log() {
    const date = new Date(`${view.day}T12:00:00`);
    const when = view.day === dayKey(new Date()) ? '<em>vandaag</em>'
      : `op <em>${date.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}</em>`;
    // Eerst de gerechten die bij de gekozen maaltijd horen.
    const dishes = [...state.dishes].sort((a, b) =>
      b.meals.includes(view.meal) - a.meals.includes(view.meal) || a.name.localeCompare(b.name, 'nl'));
    const shown = view.logAll ? dishes : dishes.slice(0, LOG_PREVIEW);
    // Na het scannen van een product staat dat al ingevuld; dan staat het formulier bovenaan.
    const prefill = view.prefill;
    const list = `
      <h2>${prefill ? 'Of tik een favoriet aan' : 'Tik een favoriet aan'}</h2>
      <ul class="list">${shown.map(d => `
        <li><span class="icon" aria-hidden="true">${iconSvg(dishIcon(d))}</span>
        <span class="grow"><strong>${esc(d.name)}</strong><br><span class="small muted">${dishMeta(d)}</span></span>
        <button class="icon-btn" data-action="log-dish" data-id="${d.id}" aria-label="Noteer ${esc(d.name)}">+</button></li>`).join('')}
      </ul>
      ${shown.length < dishes.length ? `<button class="btn link" data-action="log-all">Toon alle ${dishes.length} favorieten</button>` : ''}`;
    const form = `
      <h2>${prefill ? 'Het gescande product' : 'Of iets anders gegeten?'}</h2>
      ${prefill ? '<p class="small muted">Pas de calorieën aan als je meer of minder at dan één portie.</p>' : `
        <button class="btn" data-action="open-scan">${iconSvg('streepjescode')} Scan een product</button>`}
      <form data-form="log" novalidate>
        <label for="f-logname">Wat was het?</label>
        <input id="f-logname" name="name" type="text" maxlength="60" autocomplete="off" placeholder="Bijvoorbeeld: friet" value="${prefill ? esc(prefill.name.slice(0, 60)) : ''}">
        <label for="f-logkcal">Calorieën <span class="muted">(mag je overslaan)</span></label>
        <input id="f-logkcal" name="kcal" type="number" inputmode="numeric" min="0" max="5000" placeholder="Bijvoorbeeld: 550" value="${prefill && prefill.kcal != null ? prefill.kcal : ''}">
        <div class="checks" style="margin-top:14px">
          <label class="check"><input type="checkbox" name="healthy">${iconSvg('blad')} Het was gezond</label>
          <label class="check"><input type="checkbox" name="slow">${iconSvg('klok')} Uitgebreid gekookt (45+ min)</label>
        </div>
        <p class="error" role="alert" hidden></p>
        <p></p>
        <button class="btn primary" type="submit">Noteren</button>
      </form>`;
    return `
      ${topHtml('Iets noteren', backHtml('Week', 'data-action="log-cancel"'))}
      <h1>Wat at je ${when}?</h1>
      <div class="segments" role="group" aria-label="Maaltijd">${Object.entries(MEAL_SHORT).map(([value, label]) => `
        <button data-action="log-meal" data-meal="${value}" aria-pressed="${value === view.meal}">${label}</button>`).join('')}
      </div>
      ${prefill ? form + list : list + form}`;
  },

  rewards() {
    const stats = rewardStats();
    const earned = BADGES.filter(b => state.badges[b.id]).length;
    // Bij een badge voor één week telt wat je deze week al hebt.
    const progress = b => Math.min(b.goal, (b.scope === 'total' ? stats.total : stats.now)[b.key]);
    // Uitgelicht staat de badge die je aantikt; tot dan de badge waar je het dichtst bij bent.
    const nearest = BADGES.filter(b => !state.badges[b.id]).sort((a, b) => progress(b) / b.goal - progress(a) / a.goal)[0];
    const shown = BADGES.find(b => b.id === view.badge) || nearest || BADGES[0];
    const date = state.badges[shown.id];
    return `
      ${topHtml('Jouw badges')}
      <h1><em>${earned}</em> van ${BADGES.length}</h1>
      <div class="progress"><div style="width:${earned / BADGES.length * 100}%"></div></div>
      <p class="sub">Badges verdien je met wat er in je week staat. Tik op een badge om te zien wat je ervoor doet.</p>
      <div class="notice reward badge-info">${iconSvg(shown.icon)}
        <span><strong>${shown.name}</strong><br>${shown.text}<br>
        <span class="small muted">${date ? `Verdiend op ${shortDate(new Date(date))}` : `${progress(shown)} van ${shown.goal}`}</span></span></div>
      ${Object.entries(GROUPS).map(([group, [, name, text]]) => `
        <h2>${name}</h2>
        <p class="small muted">${text}</p>
        <div class="seals">${BADGES.filter(b => b.group === group).map(b => `
          <button class="seal${state.badges[b.id] ? '' : ' locked'}" data-action="show-badge" data-id="${b.id}" aria-pressed="${b.id === shown.id}">
            <span class="icon" aria-hidden="true">${iconSvg(b.icon)}</span>${b.name}
            <small>${state.badges[b.id] ? 'verdiend' : `${progress(b)} van ${b.goal}`}</small></button>`).join('')}
        </div>`).join('')}`;
  },

  'group-setup'() {
    return `
      ${topHtml('Samen kiezen')}
      <div class="hero"><div class="emoji">${iconSvg('samen')}</div><h1>Samen <em>kiezen</em></h1>
        <p class="sub">Gezellig! Iedereen kiest om de beurt op deze telefoon. Het gerecht met de meeste stemmen wint.</p></div>
      <h2>Met hoeveel personen zijn jullie?</h2>
      <div class="people">${[2, 3, 4, 5, 6].map(n => `
        <button class="person" data-action="start-group" data-count="${n}" aria-label="${n} personen"><i>${n}</i></button>`).join('')}
      </div>
      <button class="btn link" data-action="nav" data-view="home">Annuleren</button>`;
  },

  ask() {
    const q = QUESTIONS[view.step];
    return `
      ${topHtml(`Vraag ${view.step + 1} van ${QUESTIONS.length}`)}
      <div class="dots" aria-hidden="true">${QUESTIONS.map((question, i) => `<i${i <= view.step ? ' class="on"' : ''}></i>`).join('')}</div>
      <h1>${q.title}</h1>
      <p class="sub">${q.text}</p>
      ${q.options.map(([value, icon, label, hint]) => `
        <button class="bar" data-action="answer" data-value="${value}">
          <span class="icon" aria-hidden="true">${iconSvg(icon)}</span>
          <span class="bar-text"><span class="bar-name">${label}</span>${hint ? `<br><span class="bar-meta">${hint}</span>` : ''}</span>
          <span class="chev" aria-hidden="true">›</span>
        </button>`).join('')}
      <button class="btn link" data-action="${view.step ? 'ask-back' : 'nav'}" data-view="home">${view.step ? 'Vorige vraag' : 'Annuleren'}</button>`;
  },

  results() {
    const items = view.queue.slice(view.page * PER_PAGE, (view.page + 1) * PER_PAGE);
    const group = view.group;
    const notices = [];
    if (view.wrapped) notices.push('Dat waren ze allemaal! We beginnen weer vooraan.');
    if (!view.queue.length) notices.push('Voor deze maaltijd heb ik nu geen gerechten om voor te stellen.');
    else if (!view.queue[0].exact) notices.push('Niets past precies bij je antwoorden, maar dit komt aardig in de buurt.');
    else if (items.some(item => !item.exact)) notices.push('Staat er “past bijna” bij? Dan klopt het net niet helemaal met je antwoorden.');
    // Uitleg bij de pictogrammen die rechts op de kaarten staan.
    const marks = items.map(item => dishMarks(dishById(item.id)));
    const legend = Object.keys(GROUPS).filter(key => marks.some(m => m[key])).map(key => `${iconSvg(GROUPS[key][0])} ${GROUPS[key][1].toLowerCase()}`);
    return `
      ${topHtml(group ? `Persoon ${group.votes.length + 1} van ${group.count}` : 'Voorstellen', backHtml('Stoppen', 'data-action="nav" data-view="home"'))}
      <h1>${group ? `Persoon ${group.votes.length + 1}, wat` : 'Wat'} lijkt je <em>lekker</em>?</h1>
      <p class="sub">Tik op waar je zin in hebt.</p>
      ${notices.map(n => `<div class="notice">${n}</div>`).join('')}
      ${items.map(barHtml).join('')}
      ${legend.length ? `<p class="legend small muted">${legend.join(' · ')}: dat telt mee voor je badges.</p>` : ''}
      ${group ? '' : `
        <div class="row">
          ${view.queue.length > PER_PAGE ? '<button class="btn" data-action="more-results">Iets anders</button>' : ''}
          <button class="btn" data-action="surprise">${iconSvg('dobbelsteen')} Verras me</button>
        </div>`}`;
  },

  pass() {
    const next = view.group.votes.length + 1;
    return `
      ${topHtml('Samen kiezen')}
      <div class="hero"><div class="emoji">${iconSvg('telefoon')}</div><h1>Geef de telefoon <em>door</em></h1>
        <p class="sub">Persoon ${next} van ${view.group.count} is aan de beurt. Niet spieken!</p></div>
      <div class="people" aria-hidden="true">${Array.from({ length: view.group.count }, (person, i) => `
        <span class="person${i + 1 < next ? ' done' : i + 1 === next ? ' on' : ''}"><i>${i + 1 < next ? '✓' : i + 1}</i></span>`).join('')}
      </div>
      <button class="btn primary big" data-action="pass-continue">Ik ben persoon ${next}</button>`;
  },

  // "Verras me": je gerechten in een kring, met in het midden het gerecht dat het wordt. Na een ogenblik
  // gaat de app vanzelf door naar het recept (zie de actie surprise).
  spin() {
    const dish = dishById(view.id);
    const others = [...new Set(state.dishes.map(dishIcon))].filter(key => key !== dishIcon(dish)).slice(0, SPIN_PLATES);
    return `
      ${topHtml('Verras me')}
      <p class="sub">Ik kies iets uit je favorieten…</p>
      <div class="wheel" aria-hidden="true">
        <div class="ring">${others.map((key, i) => `<span class="icon" style="--a:${Math.round(360 / others.length * i)}">${iconSvg(key)}</span>`).join('')}</div>
        <div class="emoji">${iconSvg(dishIcon(dish))}</div>
      </div>
      <p class="over">Het wordt</p>
      <h1>${esc(dish.name)}<em>!</em></h1>
      <p class="sub">${dishMeta(dish)}${dish.kcal == null ? '' : ' · ' + kcalLabel(dish)}</p>`;
  },

  // Het recept van een gerecht. Net gekozen: met een felicitatie en de mogelijkheid om terug te komen op je
  // keuze. Later opnieuw geopend (view.back zegt vanaf welk scherm): alleen het recept.
  chosen() {
    const dish = dishById(view.id);
    const { ingredients, recipe, own } = recipeOf(dish);
    const hasRecipe = ingredients.length || recipe;
    const back = view.back;
    const open = openShopping(dish);
    const onList = ingredients.every(text => open.has(text.slice(0, SHOPPING_LENGTH)));
    return `
      ${back ? topHtml('Recept', backHtml(BACK_LABEL[back], `data-action="nav" data-view="${back}"`)) : topHtml(`Je ${MEALS[meal].toLowerCase()} wordt`)}
      <div class="hero"><div class="emoji pop">${iconSvg(dishIcon(dish))}</div>
        <h1>${esc(dish.name)}</h1>
        <p class="sub">${dishMeta(dish)}${dish.kcal == null ? '' : ' · ' + kcalLabel(dish)}</p>
        ${dish.about ? `<p class="small muted">${esc(dish.about)}</p>` : ''}
        ${back ? '' : `<p class="wish">Eet smakelijk${state.name ? `, ${esc(state.name)}` : ''}!</p>
        <p class="small muted">Ik heb het bij vandaag genoteerd in je week.</p>`}
        ${allergenLine(dish) ? `<p class="small muted">${allergenLine(dish).replace('Bevat:', 'Bevat meestal:')}</p>` : ''}</div>
      ${rewardHtml(view.reward)}
      ${view.note ? `<div class="notice">${esc(view.note)}</div>` : ''}
      ${ingredients.length ? `
        <h2>Ingrediënten${own ? '' : ` <span>voor ${RECIPE_SERVES} personen</span>`}</h2>
        <ul class="ing">${ingredients.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
        <button class="btn" data-action="add-to-shopping"${view.added || onList ? ' disabled' : ''}>
          ${view.added ? '✓ Op de boodschappenlijst gezet' : onList ? '✓ Staat al op je boodschappenlijst' : `${iconSvg('mand')} Zet op de boodschappenlijst`}</button>` : ''}
      ${recipe ? `<h2>Bereiding</h2>
        ${own ? `<p class="recipe">${esc(recipe)}</p>` : `<ol class="steps">${recipe.split('\n').map(step => `<li>${esc(step)}</li>`).join('')}</ol>`}` : ''}
      ${hasRecipe ? '' : '<div class="notice">Van dit gerecht heb ik nog geen recept. Zoek er een op internet, of zet je eigen recept erbij.</div>'}
      <div class="orn"><i></i></div>
      <a class="btn" href="https://www.google.com/search?q=${encodeURIComponent(`recept ${dish.name}`)}" target="_blank" rel="noopener noreferrer">${iconSvg('zoek')} ${hasRecipe ? 'Zoek een ander recept op internet' : 'Zoek een recept op internet'}</a>
      <button class="btn" data-action="edit-dish" data-id="${dish.id}">${iconSvg('potlood')} ${hasRecipe ? 'Recept aanpassen' : 'Eigen recept toevoegen'}</button>
      ${back ? `<button class="btn primary" data-action="nav" data-view="${back}">Klaar</button>` : `
        <button class="btn primary" data-action="nav" data-view="home">Lekker, dank je!</button>
        <button class="btn link" data-action="undo-choice">Toch liever iets anders</button>`}`;
  },

  favorites() {
    const count = state.dishes.length;
    return `
      ${topHtml('Favorieten')}
      <h1><em>${count}</em> ${count === 1 ? 'favoriet' : 'favorieten'}</h1>
      <p class="sub">Hieruit help ik je kiezen. Tik op een gerecht voor het recept, of op het potlood om het aan te passen.</p>
      ${view.message ? `<div class="notice">${esc(view.message)}</div>` : ''}
      <button class="btn primary" data-action="discover" data-meal="alles">${iconSvg('zoek')} Gerechten ontdekken</button>
      <div class="row">
        <button class="btn" data-action="nav" data-view="world">${iconSvg('wereld')} Wereldkeuken</button>
        <button class="btn" data-action="edit-dish">+ Zelf toevoegen</button>
      </div>
      ${count > SEARCH_FROM ? `
        <input type="search" data-input="favorite-search" value="${esc(view.query || '')}" placeholder="Zoek in je favorieten" aria-label="Zoek in je favorieten">
        <p class="small muted" id="favorites-empty" hidden>Geen favoriet gevonden met die naam.</p>` : ''}
      <ul class="list" id="favorites-list">${[...state.dishes].sort((a, b) => a.name.localeCompare(b.name, 'nl')).map(d => `
        <li data-name="${esc(searchKey(d.name))}">
        <button class="row-link" data-action="open-recipe" data-id="${d.id}"><span class="icon" aria-hidden="true">${iconSvg(dishIcon(d))}</span>
        <span class="grow"><strong>${esc(d.name)}</strong><br><span class="small muted">${dishDetails(d)}</span>
          ${allergyBlock(d) ? `<br><span class="small warn">${iconSvg('waarschuwing')} Stel ik niet voor: ${esc(allergyBlock(d))}</span>` : ''}</span></button>
        <button class="icon-btn soft" data-action="edit-dish" data-id="${d.id}" aria-label="Pas ${esc(d.name)} aan">${iconSvg('potlood')}</button></li>`).join('')}
      </ul>`;
  },

  // De wereldkaart, met eronder het gekozen land en een lijst om een land te zoeken. De kaart zelf zet
  // mountWorldMap() erin; welke landen in de lijst staan, regelt filterCountries().
  world() {
    const names = Object.entries(COUNTRIES).sort((a, b) => a[1][0].localeCompare(b[1][0], 'nl'));
    return `
      ${topHtml('Wereldkeuken', backHtml('Terug', 'data-action="nav" data-view="home"'))}
      <h1>De wereld op je <em>bord</em></h1>
      <p class="sub">Tik op een land voor de bekendste gerechten. Je kunt de kaart verschuiven en inzoomen.</p>
      <div class="atlas">
        <div id="map-host" style="aspect-ratio:${MAP_RATIO.toFixed(3)}">${mapStatusHtml()}</div>
        <div class="map-tools">
          <span class="compass" aria-hidden="true">${iconSvg('kompas')}</span>
          <button class="icon-btn soft" data-action="map-zoom" data-factor="1.8" aria-label="Inzoomen">+</button>
          <button class="icon-btn soft" data-action="map-zoom" data-factor="0.55" aria-label="Uitzoomen">−</button>
          <button class="icon-btn soft" data-action="map-region" data-region="" aria-label="Hele wereld tonen">${iconSvg('wereld')}</button>
        </div>
      </div>
      ${countryCardHtml()}
      <h2>Zoek een land</h2>
      <input type="search" data-input="country-search" value="${esc(worldMap.query)}" placeholder="Typ de naam van een land" aria-label="Zoek een land">
      <div class="chips">${Object.entries(REGIONS).map(([key, [name]]) => `
        <button class="chip" data-action="map-region" data-region="${key}" aria-pressed="${key === worldMap.region}">${name}</button>`).join('')}
      </div>
      <div class="chips" id="country-list">${names.map(([code, [name, region]]) => `
        <button class="chip" data-action="open-country" data-code="${code}" data-region="${region}" data-name="${esc(searchKey(name))}"><span aria-hidden="true">${flag(code)}</span> ${name}</button>`).join('')}
      </div>
      <p class="small muted" id="country-empty" hidden></p>
      <p class="small muted">Kaartgegevens: Natural Earth.</p>
      <button class="btn link" data-action="nav" data-view="home">Terug naar het begin</button>`;
  },

  // De bekende gerechten van één land als menukaart, elk met een plus om het bij de favorieten te zetten.
  country() {
    const code = view.code;
    const rows = countryDishes(code);
    const have = new Set(state.dishes.map(d => d.name.toLowerCase()));
    const head = `
      ${topHtml('Wereldkeuken', backHtml('Kaart', 'data-action="nav" data-view="world"'))}
      <div class="hero"><div class="emoji flag">${flag(code)}</div><h1>${COUNTRIES[code][0]}</h1>`;
    if (!rows.length) return `${head}
        <p class="sub">Van dit land heb ik nog geen gerechten.</p></div>`;
    return `${head}
        <p class="sub">${rows.length === 10 ? 'Tien bekende gerechten' : `Bekende gerechten (${rows.length})`}. Tik op de plus om er een bij je favorieten te zetten.</p></div>
      ${hasAllergy() || state.diet.length ? '<div class="notice">Van de meeste van deze gerechten ken ik de allergenen en de diëten niet. Zet je er een bij je favorieten, vul die dan zelf in bij het gerecht. Tot die tijd stel ik het niet voor.</div>' : ''}
      <h2>Menu</h2>
      <ol class="list">${rows.map((row, i) => {
        const dish = worldDish(row);
        const added = have.has(dish.name.toLowerCase());
        return `
          <li><span class="icon" aria-hidden="true">${iconSvg(dish.icon)}</span>
          <span class="grow"><strong>${esc(dish.name)}</strong><br><span class="small muted">${esc(dish.text)}</span></span>
          <button class="icon-btn${added ? ' done' : ''}${i === view.justAdded ? ' pop' : ''}" data-action="world-add" data-index="${i}"${added ? ' disabled' : ''}
            aria-label="${added ? `${esc(dish.name)} staat bij je favorieten` : `Zet ${esc(dish.name)} bij je favorieten`}">${added ? '✓' : '+'}</button></li>`;
      }).join('')}
      </ol>
      <p class="small muted">Dit is mijn eigen keuze van bekende gerechten, geen officiële ranglijst.</p>
      <button class="btn link" data-action="nav" data-view="world">Terug naar de kaart</button>`;
  },

  discover() {
    return `
      ${topHtml('Gerechten ontdekken')}
      <h1>Wat vind je <em>lekker</em>?</h1>
      <p class="sub">Tik op de plus bij wat je lekker vindt, dan zet ik het bij je favorieten.</p>
      ${catalogHtml('alles')}
      <button class="btn link" data-action="nav" data-view="world">${iconSvg('wereld')} Of kijk in de wereldkeuken</button>
      <button class="btn primary sticky above-nav" data-action="nav" data-view="favorites">Klaar · ${state.dishes.length} favorieten</button>`;
  },

  edit() {
    const dish = view.id ? dishById(view.id) : null;
    const canDelete = state.dishes.length > MIN_DISHES;
    return `
      ${topHtml(dish ? 'Gerecht aanpassen' : 'Nieuw gerecht', backHtml('Annuleren', 'data-action="edit-cancel"'))}
      <h1>${dish ? esc(dish.name) : 'Een <em>nieuw</em> gerecht'}</h1>
      ${dishFormHtml(dish, true)}
      ${dish ? `
        <button class="btn danger" data-action="delete-dish"${canDelete ? '' : ' disabled'}>
          ${view.confirm ? 'Zeker weten? Tik nog een keer' : 'Gerecht verwijderen'}</button>
        ${canDelete ? '' : `<p class="small muted center">Je hebt minimaal ${MIN_DISHES} gerechten nodig. Voeg eerst een nieuw gerecht toe.</p>`}` : ''}`;
  },

  shopping() {
    const anyDone = state.shopping.some(i => i.done);
    const open = state.shopping.filter(i => !i.done).length;
    // Per gerecht een groepje; wat je zelf op de lijst hebt gezet, staat bij elkaar.
    const groups = new Map();
    for (const item of state.shopping) {
      if (!groups.has(item.dish)) groups.set(item.dish, []);
      groups.get(item.dish).push(item);
    }
    return `
      ${topHtml('Boodschappen')}
      <h1>${!state.shopping.length ? 'Je <em>lijstje</em>' : open ? `Nog <em>${open}</em> te halen` : 'Alles <em>gehaald</em>'}</h1>
      <form data-form="shopping" class="row">
        <input name="text" type="text" maxlength="80" autocomplete="off" placeholder="Iets toevoegen" aria-label="Iets toevoegen">
        <button class="icon-btn" type="submit" aria-label="Toevoegen aan de lijst">+</button>
      </form>
      ${state.shopping.length ? `
        ${[...groups].map(([dish, items]) => `
          <h2>${dish ? esc(dish) : 'Zelf toegevoegd'}</h2>
          <ul class="list">${items.map(i => `
            <li class="tick"><label><input type="checkbox" id="s-${i.id}" data-change="toggle-item" data-id="${i.id}"${i.done ? ' checked' : ''}>
              <span class="grow${i.done ? ' done' : ''}">${esc(i.text)}</span></label></li>`).join('')}
          </ul>`).join('')}
        <p></p>
        <button class="btn"${anyDone ? '' : ' disabled'} data-action="clear-done">Afgevinkte verwijderen</button>`
      : `<div class="hero"><div class="emoji">${iconSvg('mand')}</div><p class="sub">Je lijstje is nog leeg. Kies een gerecht met ingrediënten, of zet er zelf iets op.</p></div>`}`;
  },

  // Een product scannen: eerst de camera (of de cijfers intypen), dan het zoeken, dan wat er bekend is.
  scan() {
    const top = topHtml('Product scannen', backHtml('Terug', 'data-action="nav" data-view="home"'));
    if (view.stage === 'result') return scanResultHtml(top);
    if (view.stage === 'loading') return `${top}
      <div class="hero"><div class="emoji">${iconSvg('streepjescode')}</div><h1>Even <em>zoeken</em>…</h1>
        <p class="sub">Ik zoek het product op bij code ${esc(view.code)}.</p></div>`;
    if (view.stage === 'missing' || view.stage === 'error') return `${top}
      <div class="hero"><div class="emoji">${iconSvg('vraag')}</div>
        <h1>${view.stage === 'missing' ? 'Dit product ken ik <em>niet</em>' : 'Opzoeken lukt <em>niet</em>'}</h1>
        <p class="sub">${view.stage === 'missing'
          ? `De code ${esc(view.code)} staat niet in de lijst van Open Food Facts. Kijk op de verpakking voor de calorieën en de allergenen.`
          : 'Ik krijg nu geen antwoord. Heb je internet? Probeer het dan nog eens.'}</p></div>
      ${view.stage === 'error' ? '<button class="btn primary" data-action="scan-retry">Probeer het opnieuw</button>' : ''}
      <button class="btn${view.stage === 'error' ? '' : ' primary'}" data-action="open-scan">${iconSvg('streepjescode')} Een ander product scannen</button>
      ${scanTypedHtml()}`;
    return `${top}
      <h1>Scan een <em>product</em></h1>
      <p class="sub">Richt de camera op de streepjescode. Houd het product stil, ongeveer een handbreedte van de camera.</p>
      <div class="scan-box"><div id="scan-host"></div><span class="scan-line" aria-hidden="true"></span></div>
      <p class="small muted center" role="status">${view.cameraError ? esc(view.cameraError) : 'Ik zoek de streepjescode…'}</p>
      ${view.cameraError ? '<button class="btn" data-action="open-scan">Probeer de camera opnieuw</button>' : ''}
      ${scanTypedHtml()}
      <p class="small muted">De camera werkt op je telefoon zelf: er gaat geen beeld naar internet. Alleen de cijfers van de streepjescode zoek ik op bij Open Food Facts, een open lijst van producten die door vrijwilligers wordt bijgehouden.</p>`;
  },

  // De instellingen zijn verdeeld over tabbladen; view.tab onthoudt welk tabblad open staat.
  more() {
    const tab = Object.hasOwn(SETTINGS_TABS, view.tab) ? view.tab : 'profiel';
    const titles = {
      profiel: 'Jouw <em>profiel</em>', allergie: 'Mijn <em>allergieën</em>', dieet: 'Mijn <em>dieet</em>',
      thema: 'Kies je <em>kleur</em>', backup: 'Je <em>back-up</em>',
    };
    const panels = {
      profiel: () => `
        <h2>Profielfoto</h2>
        <div class="hero" style="padding:0">${avatarHtml()}</div>
        ${view.photoError ? `<div class="notice">${esc(view.photoError)}</div>` : ''}
        <button class="btn" data-action="photo-pick">${state.photo ? 'Andere foto kiezen' : 'Foto kiezen'}</button>
        ${state.photo ? '<button class="btn danger" data-action="photo-remove">Foto verwijderen</button>' : ''}
        <p class="muted small">Je foto blijft op dit apparaat staan en gaat mee in je back-up.</p>
        <h2>Je naam</h2>
        <form data-form="name" class="row">
          <input name="name" type="text" maxlength="30" autocomplete="given-name" value="${esc(state.name)}" placeholder="Je voornaam" aria-label="Je naam">
          <button class="btn primary" type="submit">${view.nameSaved ? '✓' : 'OK'}</button>
        </form>
        <h2><label for="f-country" style="margin:0">Je land</label></h2>
        ${countrySelectHtml(' data-change="set-country"')}
        <p class="muted small" style="margin-top:6px">Bij "Gerechten ontdekken" zie je eerst wat er in dit land veel wordt gegeten.</p>`,

      allergie: () => `
        <p class="muted small">Vink aan waar je allergisch voor bent. Gerechten waar dat in zit, stel ik niet meer voor.</p>
        <fieldset aria-label="Mijn allergieën">${allergenChecksHtml('allergies', state.allergies, 'user')}</fieldset>
        <h2>Andere allergie</h2>
        <p class="muted small">Staat jouw allergie er niet bij? Voeg haar toe. Ik sla dan gerechten over waar dat woord in de naam, de omschrijving of de ingrediënten staat, ook als het er in het meervoud staat.</p>
        ${state.otherAllergies.length ? `<ul class="list">${state.otherAllergies.map((term, i) => `
          <li><span class="grow">${esc(term)}${allergyHint(term) ? `<br><span class="small muted">${allergyHint(term)}</span>` : ''}</span>
          <button class="icon-btn soft" data-action="remove-allergy" data-index="${i}" aria-label="Verwijder ${esc(term)}">${iconSvg('kruis')}</button></li>`).join('')}</ul>` : ''}
        <form data-form="allergy" class="row">
          <input name="term" type="text" maxlength="30" autocomplete="off" placeholder="Bijvoorbeeld: kiwi" aria-label="Andere allergie">
          <button class="icon-btn" type="submit" aria-label="Allergie toevoegen">+</button>
        </form>
        ${view.message ? `<div class="notice" role="status">${esc(view.message)}</div>` : ''}
        <div class="chips">${ALLERGY_IDEAS.filter(idea => !state.otherAllergies.some(term => searchKey(term) === idea)).map(idea => `
          <button class="chip" data-action="add-allergy" data-term="${idea}">+ ${idea}</button>`).join('')}
        </div>
        <div class="notice">${ALLERGY_WARNING}</div>`,

      dieet: () => `
        <fieldset aria-label="Mijn dieet">${dietChecksHtml(true)}</fieldset>
        <p class="muted small" style="margin-top:10px">Ik stel alleen gerechten voor die passen bij alles wat je hier aanvinkt. Per gerecht geef je bij Favorieten aan bij welk dieet het past.</p>
        <p class="muted small">Let op: de diëten bij gerechten zijn een schatting en geen garantie. Heb je een allergie? Vink die dan aan op het tabblad Allergie.</p>`,

      thema: () => `
        <div class="themes" role="group" aria-label="Kleur">${Object.entries(THEMES).map(([id, name]) => `
          <button class="theme" data-theme="${id}" data-action="set-theme" aria-pressed="${id === state.theme}">
            <span class="theme-dot"></span>${name}</button>`).join('')}
        </div>
        <h2>${iconSvg('maan')} Avondstand <span>voor in het donker</span></h2>
        <div class="segments boxed" role="group" aria-label="Avondstand">${Object.entries(DARK_MODES).map(([id, name]) => `
          <button data-action="set-dark" data-dark="${id}" aria-pressed="${id === state.dark}">${name}</button>`).join('')}
        </div>
        <p class="muted small">Automatisch volgt de instelling van je telefoon.</p>`,

      backup: () => `
        ${saveWarningHtml()}
        <p class="muted small">Je gerechten staan alleen op dit apparaat. Maak af en toe een back-up, zodat je niets kwijtraakt.</p>
        ${navigator.standalone === false ? '<p class="muted small">Tip voor iPhone en iPad: zet de app op je beginscherm (tik op de deelknop en kies "Zet op beginscherm"). Gebruik je de app alleen in Safari, dan kan het apparaat je gegevens wissen als je de app een tijd niet opent.</p>' : ''}
        <button class="btn" data-action="export">Back-up opslaan</button>
        <button class="btn" data-action="import-pick">Back-up terugzetten</button>
        <input id="import-file" type="file" accept="application/json,.json" data-change="import" hidden>
        ${view.pending && pendingImport ? `
          <div class="notice">In deze back-up staan ${dishCount(pendingImport.dishes.length)} en ${pendingImport.history.length} ${pendingImport.history.length === 1 ? 'notitie' : 'notities'} in je week.
            Terugzetten vervangt alles wat nu in de app staat: ${dishCount(state.dishes.length)} en ${state.history.length} ${state.history.length === 1 ? 'notitie' : 'notities'}.</div>
          <button class="btn primary" data-action="import-confirm">Ja, zet de back-up terug</button>
          <button class="btn" data-action="settings-tab" data-tab="backup">Nee, laat alles zoals het is</button>` : ''}
        ${view.message ? `<div class="notice">${esc(view.message)}</div>` : ''}
        <h2>Opnieuw beginnen</h2>
        <button class="btn danger" data-action="reset">${view.confirm ? 'Zeker weten? Alles wordt gewist' : 'Alles wissen'}</button>`,
    };
    return `
      ${topHtml('Instellingen', backHtml('Terug', 'data-action="nav" data-view="home"'))}
      <div class="segments" role="tablist" aria-label="Onderdelen van de instellingen">${Object.entries(SETTINGS_TABS).map(([key, label]) => `
        <button role="tab" id="tab-${key}" data-action="settings-tab" data-tab="${key}" aria-selected="${key === tab}" aria-controls="settings-panel">${label}</button>`).join('')}
      </div>
      <h1>${titles[tab]}</h1>
      <div id="settings-panel" role="tabpanel" aria-labelledby="tab-${tab}">${panels[tab]()}</div>
      <button class="btn link" data-action="nav" data-view="home">Terug naar het begin</button>`;
  },
};

// ---------- Acties ----------

const ACTIONS = {
  nav(el) { go(el.dataset.view); },

  // Zelf een maaltijd kiezen gaat voor de klok, tot het volgende dagdeel. Terug naar de maaltijd
  // van dit tijdstip betekent: weer automatisch.
  'set-meal'(el) {
    const slot = defaultMeal();
    meal = el.dataset.meal;
    manualMeal = meal === slot ? null : { meal, slot };
    render();
  },

  'set-theme'(el) {
    state.theme = el.dataset.theme;
    repaint();
  },

  'set-dark'(el) {
    state.dark = el.dataset.dark;
    repaint();
  },

  // Laat zien wat je voor een badge moet doen.
  'show-badge'(el) {
    view.badge = el.dataset.id;
    render();
    app.querySelector(`.seal[data-id="${el.dataset.id}"]`).focus();
  },

  'log-all'() {
    view.logAll = true;
    render();
  },

  'finish-onboarding'() {
    if (state.dishes.length < MIN_DISHES) return;
    state.onboarded = true;
    save();
    keepStorage();
    go('home');
  },

  discover(el) { go('discover', { catalogMeal: el.dataset.meal }); },

  'catalog-meal'(el) {
    view.catalogMeal = el.dataset.meal;
    view.catalogOpen = [];
    render();
  },

  // Klapt één groepje helemaal uit.
  'catalog-more'(el) {
    view.catalogOpen = [...(view.catalogOpen || []), el.dataset.group];
    filterCatalog();
  },

  'catalog-jump'(el) {
    document.getElementById(el.dataset.target).scrollIntoView({ behavior: motionOff() ? 'auto' : 'smooth', block: 'start' });
  },

  'add-suggestion'(el) {
    const item = CATALOG[el.dataset.index];
    if (state.dishes.some(d => d.name.toLowerCase() === item[0].toLowerCase())) return;
    keepFresh(catalogEntry(item));
  },

  // Een gerecht uit het groepje van je eigen land, bovenaan de lijst.
  'add-local'(el) {
    const dish = worldDish(countryDishes(state.country)[el.dataset.index]);
    if (!state.dishes.some(d => d.name.toLowerCase() === dish.name.toLowerCase())) keepFresh(worldEntry(dish));
  },

  'map-zoom'(el) {
    if (worldMap.status === 'ready') zoomMapStep(Number(el.dataset.factor));
  },

  // Zoomt in op een werelddeel en zet de landen daarvan in de lijst; zonder werelddeel zie je de hele wereld.
  'map-region'(el) {
    worldMap.region = el.dataset.region || null;
    worldMap.query = '';
    showRegionOnMap(worldMap.region);
    render();
  },

  'map-retry'() {
    worldMap.status = 'idle';
    render();
  },

  // Opent de gerechten van een land. De kaart onthoudt het land, voor als je teruggaat.
  'open-country'(el) {
    worldMap.selected = el.dataset.code;
    showCountryOnMap(el.dataset.code);
    go('country', { code: el.dataset.code });
  },

  // Zet een gerecht uit de wereldkeuken bij de favorieten.
  'world-add'(el) {
    const dish = worldDish(countryDishes(view.code)[el.dataset.index]);
    if (state.dishes.some(d => d.name.toLowerCase() === dish.name.toLowerCase())) return;
    state.dishes.push(worldEntry(dish));
    save();
    // Het vinkje van het gerecht dat er net bij kwam, springt even op.
    view.justAdded = Number(el.dataset.index);
    render();
  },

  'remove-dish'(el) {
    state.dishes = state.dishes.filter(d => d.id !== el.dataset.id);
    save();
    render();
  },

  'start-ask'() { go('ask', { step: 0, answers: {} }); },

  'start-group'(el) {
    go('ask', { step: 0, answers: {}, group: { count: Number(el.dataset.count), votes: [] } });
  },

  answer(el) {
    const answers = { ...view.answers, [QUESTIONS[view.step].key]: el.dataset.value };
    if (view.step + 1 < QUESTIONS.length) {
      go('ask', { step: view.step + 1, answers, group: view.group });
    } else {
      const queue = buildQueue(answers);
      // Zonder gerechten voor deze maaltijd valt er niets voor te stellen; het startscherm legt dat uit.
      if (!queue.length) return go('home');
      go('results', { answers, queue, page: 0, group: view.group });
    }
  },

  'ask-back'() {
    backward = true;
    go('ask', { step: view.step - 1, answers: view.answers, group: view.group });
  },

  'more-results'() {
    if ((view.page + 1) * PER_PAGE < view.queue.length) {
      go('results', { ...view, page: view.page + 1, wrapped: false });
    } else {
      go('results', { ...view, queue: buildQueue(view.answers), page: 0, wrapped: true });
    }
  },

  // Vanuit de resultaten: alleen uit de passende gerechten. Vanaf het startscherm: uit alles.
  // Gerechten die je al met "Iets anders" hebt afgewezen, doen niet meer mee.
  surprise() {
    const inResults = view.name === 'results';
    const queue = inResults ? view.queue.slice(view.page * PER_PAGE) : buildQueue({});
    const exact = queue.filter(item => item.exact);
    const pool = (exact.length ? exact : queue).map(item => dishById(item.id));
    const id = weightedShuffle(pool)[0].id;
    const note = 'Deze heb ik voor je uitgekozen.';
    // Wie geen beweging wil, ziet meteen het gerecht. Anders draait eerst de kring met je gerechten; loop je
    // intussen weg van dat scherm, dan is er niets gekozen.
    if (motionOff()) return choose(id, note);
    go('spin', { id });
    setTimeout(() => {
      if (view.name === 'spin' && view.id === id) choose(id, note);
    }, SPIN_TIME);
  },

  pick(el) {
    const group = view.group;
    if (!group) return choose(el.dataset.id);
    group.votes.push(el.dataset.id);
    if (group.votes.length < group.count) return go('pass', { results: view, group });

    const tally = {};
    for (const id of group.votes) tally[id] = (tally[id] || 0) + 1;
    const top = Math.max(...Object.values(tally));
    const winners = Object.keys(tally).filter(id => tally[id] === top);
    const winner = winners[Math.floor(Math.random() * winners.length)];
    const note = winners.length > 1
      ? `Gelijkspel tussen ${listText(winners.map(id => dishById(id).name))}. Ik heb geloot!`
      : `Gewonnen met ${top} van de ${group.count} stemmen.`;
    choose(winner, note);
  },

  'pass-continue'() { go('results', view.results); },

  // Wat al op de lijst staat en nog niet is afgevinkt, komt er niet nog een keer bij.
  'add-to-shopping'() {
    const dish = dishById(view.id);
    const open = openShopping(dish);
    for (const ingredient of recipeOf(dish).ingredients) {
      const text = ingredient.slice(0, SHOPPING_LENGTH);
      if (!open.has(text)) state.shopping.push({ id: newId(), text, done: false, dish: dish.name });
    }
    save();
    view.added = true;
    render();
  },

  // Haalt de notitie van deze keuze weg en zet terug wat ze verving.
  'undo-choice'() {
    state.history = state.history.filter(h => h.id !== view.entryId).concat(view.replaced || []);
    // Badges die deze keuze opleverde vervallen, tenzij je ze ook zonder deze keuze had verdiend.
    for (const id of view.reward ? view.reward.badges : []) delete state.badges[id];
    checkBadges();
    save();
    go('home');
  },

  'week-move'(el) {
    const offset = Math.min(0, Math.max(-MAX_WEEKS_BACK, (view.offset || 0) + Number(el.dataset.step)));
    go('week', { offset });
  },

  'log-day'(el) {
    go('log', { day: el.dataset.day, offset: view.offset || 0, meal: openMeal(el.dataset.day) });
  },

  'log-meal'(el) {
    view.meal = el.dataset.meal;
    render();
  },

  'log-dish'(el) {
    const reward = rewardFor(logEntry(dishById(el.dataset.id), view.day, view.meal, false));
    save();
    go('week', { offset: view.offset, day: view.day, reward });
  },

  'log-cancel'() { go('week', { offset: view.offset, day: view.day }); },

  // Haalt een notitie uit je week. Ze blijft nog even bij de hand, voor wie zich vergist (zie restore-entry).
  'remove-entry'(el) {
    const entry = state.history.find(h => h.id === el.dataset.id);
    if (!entry) return;
    state.history = state.history.filter(h => h !== entry);
    save();
    delete view.reward;
    view.removed = entry;
    render();
    const undo = app.querySelector('[data-action="restore-entry"]');
    if (undo) undo.focus({ preventScroll: true });
  },

  'restore-entry'() {
    if (!view.removed) return;
    state.history.push(view.removed);
    delete view.removed;
    save();
    render();
  },

  // Het recept van een gerecht opnieuw bekijken, vanaf het startscherm of vanuit je favorieten.
  'open-recipe'(el) {
    if (dishById(el.dataset.id)) go('chosen', { id: el.dataset.id, back: view.name === 'favorites' ? 'favorites' : 'home' });
  },

  // Wie een gerecht aanpast vanaf het recept, komt daarna weer bij dat recept uit.
  'edit-dish'(el) {
    go('edit', { id: el.dataset.id || null, returnTo: view.name === 'chosen' ? view : null });
  },

  'edit-cancel'() { leaveEdit(); },

  'delete-dish'() {
    if (state.dishes.length <= MIN_DISHES) return;
    if (!view.confirm) { view.confirm = true; return render(); }
    const { name } = dishById(view.id);
    state.dishes = state.dishes.filter(d => d.id !== view.id);
    // Wat je ervan hebt gegeten, blijft in je week staan; alleen de koppeling met het gerecht vervalt.
    for (const h of state.history) {
      if (h.dishId === view.id) h.dishId = null;
    }
    save();
    go('favorites', { message: `Verwijderd: ${name}.` });
  },

  'clear-done'() {
    state.shopping = state.shopping.filter(i => !i.done);
    save();
    render();
  },

  export() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wat-eten-we-backup.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 10000);
  },

  'import-pick'() { document.getElementById('import-file').click(); },

  'import-confirm'() { restoreBackup(); },

  'open-scan'() { openScan(); },

  'scan-retry'() { scanLookup(view.code); },

  // Het gescande product noteren bij vandaag: het formulier staat dan al ingevuld.
  'scan-log'() {
    const day = dayKey(new Date());
    go('log', { day, offset: 0, meal: openMeal(day), prefill: { name: view.product.name, kcal: view.product.kcalServing } });
  },

  'scan-shop'() {
    state.shopping.push({ id: newId(), text: view.product.name.slice(0, SHOPPING_LENGTH), done: false, dish: '' });
    save();
    view.shopped = true;
    render();
  },

  // Een ander tabblad van de instellingen openen; de focus blijft op het gekozen tabblad.
  'settings-tab'(el) {
    view = { name: 'more', tab: el.dataset.tab };
    render();
    document.getElementById(`tab-${el.dataset.tab}`).focus();
  },

  'add-allergy'(el) {
    delete view.message;
    state.otherAllergies = cleanTerms([...state.otherAllergies, el.dataset.term]);
    save();
    render();
  },

  'remove-allergy'(el) {
    delete view.message;
    state.otherAllergies = state.otherAllergies.filter((term, i) => i !== Number(el.dataset.index));
    save();
    render();
  },

  'photo-pick'() { document.getElementById('photo-file').click(); },

  'photo-remove'() {
    state.photo = '';
    save();
    render();
  },

  reset() {
    if (!view.confirm) { view.confirm = true; return render(); }
    state = emptyState();
    save();
    applyTheme();
    go('onboarding');
  },
};

// Laat bij een formulier zien wat er nog niet klopt, en zet de aanwijzer in het veld waar het om gaat.
function formError(form, message, field) {
  const error = form.querySelector('.error');
  error.textContent = message;
  error.hidden = false;
  const input = form.querySelector(`[name="${field}"]`);
  if (!input) return;
  // De melding komt direct onder het veld te staan, zodat je haar ziet terwijl je het verbetert.
  (input.closest('fieldset') || input).after(error);
  input.focus();
}

const FORMS = {
  dish(form) {
    const data = new FormData(form);
    const name = data.get('name').trim();
    const kcalText = data.get('kcal').trim();
    const kcal = kcalText === '' ? null : Math.round(Number(kcalText));
    // Zonder opnieuw te tekenen, zodat wat al is ingevuld blijft staan.
    const fail = (message, field) => formError(form, message, field);

    const meals = data.getAll('meals');

    if (!name) return fail('Hoe heet het gerecht? Vul nog even een naam in.', 'name');
    if (!meals.length) return fail('Wanneer eet je dit? Kies minstens één maaltijd.', 'meals');
    if (state.dishes.some(d => d.id !== view.id && d.name.toLowerCase() === name.toLowerCase())) {
      return fail('Deze staat al in je lijst.', 'name');
    }
    if (kcal != null && !(kcal >= 0 && kcal <= 5000)) return fail('Dat aantal calorieën klopt niet. Kies een getal tussen 0 en 5000.', 'kcal');

    const existing = view.id ? dishById(view.id) : null;
    const dish = existing || { id: newId(), ingredients: [], recipe: '', about: '' };
    // Een omschrijving uit de wereldkeuken hoort bij de naam; met een andere naam klopt ze niet meer.
    if (existing && existing.name !== name) dish.about = '';
    Object.assign(dish, {
      name, meals: cleanMeals(meals), time: data.get('time'), type: data.get('type'), kcal,
      healthy: data.has('healthy'), diets: cleanDiets(data.getAll('diets'), false),
      icon: cleanIcon(data.get('icon'), name),
      allergens: cleanAllergens(data.getAll('allergens')),
      // Wie het formulier opslaat, heeft de allergenen gezien en zo nodig ingevuld.
      unchecked: false,
    });
    if (data.has('ingredients')) {
      dish.ingredients = data.get('ingredients').split('\n').map(line => line.trim()).filter(Boolean);
      dish.recipe = data.get('recipe').replace(/\r\n/g, '\n').trim();
      // Is het recept van de app ongewijzigd gebleven, dan blijft het gerecht dat recept volgen.
      const [list, recipe] = RECIPE_BY_NAME.get(name.toLowerCase()) || [];
      if (dish.ingredients.join('|') === list && dish.recipe === recipe) {
        dish.ingredients = [];
        dish.recipe = '';
      }
    }
    if (!existing) state.dishes.push(dish);
    save();
    // Bij de eerste start blijft het formulier open: wie zelf een gerecht toevoegt, voegt er vaak meer toe.
    if (state.onboarded) leaveEdit(`${existing ? 'Aangepast' : 'Toegevoegd'}: ${name}.`);
    // De lijst eronder blijft zoals ze stond: dezelfde maaltijd, hetzelfde zoekwoord.
    else go('onboarding', { ownOpen: true, catalogMeal: view.catalogMeal, catalogQuery: view.catalogQuery, catalogOpen: view.catalogOpen });
  },

  welcome(form) {
    const data = new FormData(form);
    state.name = cleanName(data.get('name'));
    if (Object.hasOwn(COUNTRIES, data.get('country'))) state.country = data.get('country');
    state.diet = cleanDiets(data.getAll('diet'), true);
    state.allergies = cleanAllergens(data.getAll('allergies'));
    state.welcomed = true;
    save();
    go('onboarding');
  },

  // Een eigen allergie toevoegen, naast de veertien uit de lijst.
  // Staat het getypte woord voor een allergeen uit de lijst (zoals "eieren" of "lactose"), dan wordt dat
  // vakje aangevinkt: daarbij weet de app van elk gerecht of het erin zit, ook als het woord er niet staat.
  allergy(form) {
    const term = new FormData(form).get('term').trim();
    if (term.length < 2) return;
    const listed = listedAllergen(term);
    if (listed) {
      state.allergies = cleanAllergens([...state.allergies, listed]);
      view.message = `${ALLERGENS[listed][0]} staat in de lijst hierboven. Ik heb het daar voor je aangevinkt.`;
    } else {
      state.otherAllergies = cleanTerms([...state.otherAllergies, term]);
      delete view.message;
    }
    save();
    render();
  },

  name(form) {
    state.name = cleanName(new FormData(form).get('name'));
    save();
    view.nameSaved = true;
    render();
  },

  // Iets noteren dat niet bij je favorieten staat.
  log(form) {
    const data = new FormData(form);
    const name = data.get('name').trim().slice(0, 60);
    const kcalText = data.get('kcal').trim();
    const kcal = kcalText === '' ? null : Math.round(Number(kcalText));
    const fail = (message, field) => formError(form, message, field);

    if (!name) return fail('Wat heb je gegeten? Vul nog even in wat het was.', 'name');
    if (kcal != null && !(kcal >= 0 && kcal <= 5000)) return fail('Dat aantal calorieën klopt niet. Kies een getal tussen 0 en 5000.', 'kcal');

    const source = { name, kcal, healthy: data.has('healthy'), time: data.has('slow') ? 'uitgebreid' : null };
    const reward = rewardFor(logEntry(source, view.day, view.meal, false));
    save();
    go('week', { offset: view.offset, day: view.day, reward });
  },

  // De cijfers van een streepjescode die de gebruiker zelf heeft ingetypt.
  'scan-code'(form) {
    const typed = new FormData(form).get('code');
    const code = eanFromText(typed);
    if (code) return scanLookup(code);
    view.typed = typed.trim().slice(0, 20);
    view.codeError = 'Die cijfers kloppen niet. Kijk nog eens goed: het zijn er meestal dertien, soms acht.';
    render();
    app.querySelector('[data-form="scan-code"] input').focus();
  },

  shopping(form) {
    const text = new FormData(form).get('text').trim();
    if (!text) return;
    state.shopping.push({ id: newId(), text, done: false, dish: '' });
    save();
    render();
    app.querySelector('[data-form="shopping"] input').focus();
  },
};

const CHANGES = {
  // Een gekozen foto wordt verkleind en bewaard. Lukt dat niet, dan staat de melding bij de instellingen.
  async photo(el) {
    const file = el.files[0];
    if (!file) return;
    try {
      state.photo = await squarePhoto(file);
      save();
      if (view.name === 'more') delete view.photoError;
      render();
    } catch (e) {
      go('more', { tab: 'profiel', photoError: 'Dit bestand kan ik niet als foto gebruiken. Probeer een andere foto.' });
    }
  },

  // Een vinkje bij "Mijn allergieën" in de instellingen werkt meteen.
  'set-allergy'(el) {
    delete view.message;
    const checked = [...app.querySelectorAll('input[name="allergies"]:checked')].map(input => input.value);
    state.allergies = cleanAllergens(checked);
    save();
    render();
    app.querySelector(`input[name="allergies"][value="${el.value}"]`).focus();
  },

  // Een vinkje bij "Mijn dieet" in de instellingen werkt meteen.
  'set-country'(el) {
    if (!Object.hasOwn(COUNTRIES, el.value)) return;
    state.country = el.value;
    save();
    render();
    document.getElementById('f-country').focus();
  },

  'set-diet'(el) {
    const checked = [...app.querySelectorAll('input[name="diet"]:checked')].map(input => input.value);
    state.diet = cleanDiets(checked, true);
    save();
    render();
    app.querySelector(`input[name="diet"][value="${el.value}"]`).focus();
  },

  'toggle-item'(el) {
    const item = state.shopping.find(i => i.id === el.dataset.id);
    item.done = el.checked;
    save();
    render();
    document.getElementById(el.id).focus();
  },

  async import(el) {
    const file = el.files[0];
    if (!file) return;
    try {
      const clean = sanitize(JSON.parse(await file.text()));
      if (!clean || clean.dishes.length < MIN_DISHES) throw new Error('ongeldig');
      // Wie de app al gebruikt, krijgt eerst te zien wat er wordt vervangen; bij de eerste start valt er niets te verliezen.
      pendingImport = clean;
      if (state.onboarded) go('more', { tab: 'backup', pending: true });
      else restoreBackup();
    } catch (e) {
      // Tijdens de eerste start bestaat het scherm met instellingen nog niet.
      go(state.onboarded ? 'more' : 'onboarding', { tab: 'backup', message: 'Dit bestand is geen geldige back-up van deze app.' });
    }
  },
};

document.addEventListener('click', event => {
  const el = event.target.closest('[data-action]');
  if (el && !el.disabled) ACTIONS[el.dataset.action](el);
});

document.addEventListener('submit', event => {
  const form = event.target.closest('[data-form]');
  if (!form) return;
  event.preventDefault();
  FORMS[form.dataset.form](form);
});

// Tussen tabbladen wissel je ook met de pijltjestoetsen, zoals bij tabbladen gebruikelijk is.
document.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  const tab = event.target.closest('[role="tab"]');
  if (!tab) return;
  const tabs = [...tab.parentElement.querySelectorAll('[role="tab"]')];
  const next = tabs[(tabs.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
  event.preventDefault();
  next.click();
});

// Een zoekveld filtert tijdens het typen, zonder het scherm opnieuw te tekenen (dat zou het typen onderbreken).
document.addEventListener('input', event => {
  if (event.target.dataset.input === 'catalog-search') {
    view.catalogQuery = event.target.value;
    filterCatalog();
  } else if (event.target.dataset.input === 'country-search') {
    worldMap.query = event.target.value;
    filterCountries();
  } else if (event.target.dataset.input === 'favorite-search') {
    view.query = event.target.value;
    filterFavorites();
  } else if (event.target.dataset.input === 'dish-icon') {
    // Het pictogram dat bij de naam en de soort past, verandert mee terwijl je invult.
    const data = new FormData(event.target.form);
    document.getElementById('auto-icon').innerHTML = iconSvg(iconKey(data.get('name'), '', data.get('type')));
  }
});

document.addEventListener('change', event => {
  const el = event.target.closest('[data-change]');
  if (el) CHANGES[el.dataset.change](el);
});

// Een uitklapblok dat open moet blijven als het scherm opnieuw wordt getekend, onthoudt zijn stand.
// Het openen en sluiten borrelt niet omhoog, vandaar het afvangen op de weg naar beneden.
document.addEventListener('toggle', event => {
  const key = event.target.dataset.remember;
  if (key) view[key] = event.target.open;
}, true);

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// De verfkleuren van de pictogrammen, en de pictogrammen van de menubalk onderin.
document.body.insertAdjacentHTML('afterbegin', iconPaintSvg());
for (const el of nav.querySelectorAll('[data-ic]')) el.innerHTML = iconSvg(el.dataset.ic);

// Wie al notities had van voor de badges, krijgt de badges die daarbij horen.
if (checkBadges().length) save();
if (state.onboarded) keepStorage();
applyTheme();
render();
enterScreen();
