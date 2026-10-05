'use strict';

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

// Badges. Een genoteerde maaltijd kan op drie manieren meetellen; elke manier heeft een eigen groep badges.
const GROUPS = {
  healthy: ['🥗', 'Gezond eten', 'Voor maaltijden die je als gezond hebt aangevinkt.'],
  slow: ['⏲️', 'Uitgebreid koken', 'Voor gerechten die 45 minuten of langer kosten.'],
  fresh: ['🌈', 'Afwisselen', 'Voor verschillende gerechten in je week.'],
};
// scope 'total' telt alles wat je noteerde, 'week' telt binnen één week (maandag t/m zondag).
const BADGES = [
  { id: 'gezond1', group: 'healthy', icon: '🥗', name: 'Groene start', text: 'Eet je eerste gezonde maaltijd', scope: 'total', key: 'healthy', goal: 1 },
  { id: 'gezond2', group: 'healthy', icon: '💪', name: 'Gezonde week', text: 'Eet 5 gezonde maaltijden in één week', scope: 'week', key: 'healthy', goal: 5 },
  { id: 'gezond3', group: 'healthy', icon: '🏆', name: 'Gezond leven', text: 'Eet 30 gezonde maaltijden', scope: 'total', key: 'healthy', goal: 30 },
  { id: 'gezond4', group: 'healthy', icon: '👑', name: 'Gezondheidskampioen', text: 'Eet 100 gezonde maaltijden', scope: 'total', key: 'healthy', goal: 100 },
  { id: 'tijd1', group: 'slow', icon: '⏲️', name: 'Mouwen opgestroopt', text: 'Kook je eerste uitgebreide maaltijd', scope: 'total', key: 'slow', goal: 1 },
  { id: 'tijd2', group: 'slow', icon: '🍲', name: 'Met liefde gekookt', text: 'Kook 5 uitgebreide maaltijden', scope: 'total', key: 'slow', goal: 5 },
  { id: 'tijd3', group: 'slow', icon: '🔥', name: 'Keukenmarathon', text: 'Kook 20 uitgebreide maaltijden', scope: 'total', key: 'slow', goal: 20 },
  { id: 'tijd4', group: 'slow', icon: '🧑‍🍳', name: 'Meesterkok', text: 'Kook 50 uitgebreide maaltijden', scope: 'total', key: 'slow', goal: 50 },
  { id: 'variatie1', group: 'fresh', icon: '🎨', name: 'Proeverij', text: 'Eet 5 verschillende gerechten in één week', scope: 'week', key: 'distinct', goal: 5 },
  { id: 'variatie2', group: 'fresh', icon: '🌈', name: 'Elke dag anders', text: 'Eet 10 verschillende gerechten in één week', scope: 'week', key: 'distinct', goal: 10 },
  { id: 'variatie3', group: 'fresh', icon: '🌍', name: 'Alleseter', text: 'Eet vlees, vis en vegetarisch in één week', scope: 'week', key: 'types', goal: 3 },
  { id: 'variatie4', group: 'fresh', icon: '🧭', name: 'Ontdekker', text: 'Eet 25 verschillende gerechten', scope: 'total', key: 'distinct', goal: 25 },
];
// De kleuren van elk thema staan in style.css onder dezelfde naam.
const THEMES = {
  standaard: 'Standaard', tomaat: 'Tomaat', citroen: 'Citroen', munt: 'Munt', lavendel: 'Lavendel',
  'blauwe-bes': 'Blauwe bes', aubergine: 'Aubergine', nachtmarkt: 'Nachtmarkt', mosterd: 'Mosterd', olijf: 'Olijf',
};

// Een leeg antwoord ('') betekent "maakt niet uit".
const QUESTIONS = [
  { key: 'time', title: 'Hoeveel tijd heb je?', options: [
    ['snel', '⚡ Weinig (tot 20 min)'], ['normaal', '⏱️ Een beetje (tot 45 min)'], ['', '🍲 Alle tijd van de wereld'] ] },
  { key: 'type', title: 'Waar heb je trek in?', options: [
    ['vlees', '🍖 Vlees'], ['vis', '🐟 Vis'], ['vega', '🥦 Vegetarisch'], ['', '🤷 Maakt me niet uit'] ] },
  { key: 'kcal', title: 'Hoe stevig mag het zijn?', options: [
    ['licht', '🥗 Licht (tot 400 kcal)'], ['gemiddeld', '🍝 Gemiddeld (400–700 kcal)'],
    ['stevig', '🍔 Stevig (700+ kcal)'], ['', '🤷 Maakt me niet uit'] ] },
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
// Zoveel gerechten uit de lijst zie je voordat je om meer vraagt.
const CATALOG_PREVIEW = 12;
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
const TYPE_ICON = { vlees: '🍖', vis: '🐟', vega: '🥦' };
// Plaatjes bij gerechten: [plaatje, naam, woorden]. De app kiest het plaatje bij het woord dat een gerecht
// het best typeert (zie guessIcon); in het formulier kun je er ook zelf een kiezen. De woorden staan
// zonder hoofdletters en accenten; een patroon wordt gebruikt waar een kort woord anders te vaak raak is.
const ICONS = [
  ['🍕', 'Pizza', ['pizza', 'calzone', 'flammkuchen']],
  ['🍔', 'Hamburger', ['hamburger', 'burger']],
  ['🍟', 'Friet', ['friet', 'patat']],
  ['🥞', 'Pannenkoeken', ['pannenkoek', 'poffertje', 'pancake', 'crepe', 'flensje']],
  ['🍝', 'Pasta', ['spaghetti', 'pasta', 'macaroni', 'lasagne', 'penne', 'tagliatelle', 'ravioli', 'tortellini', 'gnocchi', 'carbonara', 'bolognese']],
  ['🍜', 'Noedels', ['bami', 'noedel', 'noodle', 'ramen', /\bmie\b/]],
  ['🍛', 'Curry', ['curry', 'kerrie', 'tikka', 'masala', 'korma', 'rendang']],
  ['🍚', 'Rijst', ['nasi', 'rijst', 'risotto', 'paella', 'couscous', 'bulgur', 'quinoa']],
  ['🍣', 'Sushi', ['sushi', 'sashimi']],
  ['🍢', 'Saté', ['sate', 'spies']],
  ['🥙', 'Pita', ['shoarma', 'doner', 'kebab', 'pita', 'gyros', 'kapsalon']],
  ['🧆', 'Gefrituurde hapjes', ['bitterbal', 'kroket', 'falafel', 'croqueta']],
  ['🥟', 'Deegpakketjes', ['dumpling', 'gyoza', 'wonton', 'deegkussentje', 'deegpakketje', 'deegflap', 'empanada', 'samosa', 'sambusa', 'loempia', 'maultaschen', 'pasteitje']],
  ['🌯', 'Wrap', ['wrap', 'burrito', 'tortilla', 'fajita', 'enchilada', 'quesadilla']],
  ['🌮', 'Taco', ['taco']],
  ['🥗', 'Salade', ['salade', 'gado gado', 'rauwkost', 'bowl', /\bsla\b/]],
  ['🥣', 'Soep of pap', ['soep', 'bouillon', 'havermout', 'yoghurt', 'kwark', 'muesli', 'granola', 'cruesli', 'oats', 'skyr', /pap\b/]],
  ['🍲', 'Stoofpot', ['stoof', 'stoofvlees', 'hachee', 'goulash', 'ragout', 'jachtschotel']],
  ['🌶️', 'Chili', ['chili']],
  ['🥔', 'Aardappel', ['stamppot', 'hutspot', 'aardappel', 'rosti', 'gratin']],
  ['🥘', 'Ovenschotel', ['ovenschotel', 'schotel', 'roerbak', 'wok', 'tajine']],
  ['🥧', 'Hartige taart', ['quiche', 'taart', 'pastei', 'bladerdeeg']],
  ['🥬', 'Bladgroente', ['witlof']],
  ['🍆', 'Groenteschotel', ['ratatouille', 'aubergine', 'moussaka']],
  ['🐟', 'Vis', ['zalm', 'vis', 'kibbeling', 'tonijn', 'kabeljauw', 'haring', 'makreel', 'forel', 'lekkerbek', 'sardine', 'sardinha']],
  ['🍤', 'Garnalen', ['garnaal', 'garnalen', 'scampi', 'gamba', 'mossel']],
  ['🐙', 'Inktvis', ['octopus', 'inktvis', 'calamares']],
  ['🍗', 'Kip', ['kip', 'kalkoen', 'drumstick']],
  ['🥩', 'Stuk vlees', ['biefstuk', 'steak', 'entrecote', 'schnitzel', 'karbonade', 'kotelet', 'speklap', 'rollade']],
  ['🍖', 'Vlees', ['vlees', 'gehakt', 'worst', 'ribs', 'slavink']],
  ['🧀', 'Kaas', ['kaas', 'fondue', 'raclette']],
  ['🍳', 'Ei', ['omelet', 'roerei', 'spiegelei', 'uitsmijter', 'eieren', 'frittata', /\bei\b/]],
  ['🥪', 'Belegd brood', ['tosti', 'sandwich', 'broodje']],
  ['🍞', 'Brood', ['boterham', 'brood', 'toast', 'beschuit', 'cracker']],
  ['🥐', 'Croissant', ['croissant']],
  ['🧇', 'Wafel', ['wafel']],
  ['🍮', 'Toetje', ['pudding', 'pavlova', 'tiramisu']],
  ['🍰', 'Gebak', [/gebak\b/, /cake\b/, 'cupcake', 'muffin', 'brownie']],
  ['🥤', 'Smoothie', ['smoothie', 'shake']],
  ['🥦', 'Groente', ['broccoli', 'bloemkool', 'groente', 'bonen', 'boontjes']],
  ['🍄', 'Paddenstoelen', ['champignon', 'paddenstoel']],
];
// De profielfoto wordt vierkant en klein opgeslagen, als tekst in de opslag van de browser.
const PHOTO_SIZE = 256;
const PHOTO_PATTERN = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
// Alle plaatjes die een gerecht mag hebben.
const ICON_SET = new Set([...ICONS.map(([icon]) => icon), ...Object.values(TYPE_ICON), '🍽️']);

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

// ---------- Opslag ----------

function emptyState() {
  return {
    dishes: [], history: [], shopping: [], badges: {},
    onboarded: false, welcomed: false, name: '', photo: '', theme: 'standaard', diet: [],
    allergies: [], otherAllergies: [],
  };
}

// Alleen een echte, kleine afbeelding telt als profielfoto; al het andere wordt genegeerd.
function cleanPhoto(photo) {
  return typeof photo === 'string' && photo.length < 400000 && PHOTO_PATTERN.test(photo) ? photo : '';
}

// Snijdt een foto vierkant uit het midden en verkleint hem, zodat hij weinig ruimte inneemt.
function squarePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('geen afbeelding'));
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

function greeting() {
  const hour = new Date().getHours();
  const part = hour < 6 ? 'Goedenacht' : hour < 12 ? 'Goedemorgen' : hour < 18 ? 'Goedemiddag' : 'Goedenavond';
  return state.name ? `${part}, ${esc(state.name)}!` : `${part}!`;
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  // De balk van de browser of telefoon krijgt de achtergrondkleur van het thema.
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
  const ids = new Set();
  const dishes = [];
  for (const d of data.dishes) {
    const ok = d && isId(d.id) && !ids.has(d.id) && typeof d.name === 'string' && d.name.trim() &&
      Object.hasOwn(TIMES, d.time) && Object.hasOwn(TYPES, d.type);
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
      // Leeg betekent: de app kiest het plaatje bij de naam.
      icon: ICON_SET.has(d.icon) ? d.icon : '',
      diets: fromList || !Array.isArray(d.diets) ? catalogDiets(d.name.trim()) : cleanDiets(d.diets, false),
      allergens: fromList ? catalogAllergens(d.name.trim()) : cleanAllergens(d.allergens),
      // Waar bij een gerecht uit de wereldkeuken: de allergenen zijn nog door niemand ingevuld.
      unchecked: d.unchecked === true,
      ingredients: list(d.ingredients).map(i => String(i).trim()).filter(Boolean),
      recipe: typeof d.recipe === 'string' ? d.recipe : '',
    });
  }
  return {
    onboarded: data.onboarded === true && dishes.length >= MIN_DISHES,
    // Wie al gerechten heeft, is het welkomstscherm al voorbij.
    welcomed: data.welcomed === true || dishes.length > 0,
    name: cleanName(data.name),
    photo: cleanPhoto(data.photo),
    theme: Object.hasOwn(THEMES, data.theme) ? data.theme : 'standaard',
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
        type: old ? dish.type : Object.hasOwn(TYPES, h.type) ? h.type : null,
        kcal: old ? dish.kcal : cleanKcal(h.kcal),
        icon: ICON_SET.has(h.icon) ? h.icon : '',
        // Notities van voor de badges nemen deze twee over van het gerecht, als dat er nog is.
        healthy: typeof h.healthy === 'boolean' ? h.healthy : dish ? dish.healthy : false,
        time: Object.hasOwn(TIMES, h.time) ? h.time : dish && !('time' in h) ? dish.time : null,
        meal: Object.hasOwn(MEALS, h.meal) ? h.meal : 'avond',
        date: new Date(h.date).toISOString(),
        picked: h.picked !== false,
      };
    }).filter(Boolean).slice(-MAX_HISTORY),
    badges: Object.fromEntries(BADGES
      .filter(b => data.badges && typeof data.badges[b.id] === 'string' && !isNaN(new Date(data.badges[b.id]).getTime()))
      .map(b => [b.id, new Date(data.badges[b.id]).toISOString()])),
    shopping: list(data.shopping)
      .filter(i => i && typeof i.text === 'string' && i.text.trim())
      .map(i => ({ id: newId(), text: i.text.trim().slice(0, 80), done: i.done === true, dish: typeof i.dish === 'string' ? i.dish : '' })),
  };
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* opslag vol of geblokkeerd: de app blijft werken tot het sluiten */ }
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

function kcalCategory(kcal) {
  if (kcal <= 400) return 'licht';
  if (kcal <= 700) return 'gemiddeld';
  return 'stevig';
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

// Welke allergenen van de gebruiker in een gerecht zitten, als leesbare namen. Aangevinkte allergenen tellen
// als ze bij het gerecht staan; een zelf toegevoegde allergie telt als het woord in de naam of de
// ingrediënten van het gerecht voorkomt.
function userAllergens(dish) {
  const tagged = state.allergies.filter(key => dish.allergens.includes(key)).map(key => ALLERGENS[key][0].toLowerCase());
  const text = searchKey([dish.name, ...(dish.ingredients || [])].join(' '));
  return [...tagged, ...state.otherAllergies.filter(term => text.includes(searchKey(term)))];
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
    id: newId(), name, meals: [...meals], time, type, kcal, healthy, icon: '',
    diets: catalogDiets(name), allergens: catalogAllergens(name), unchecked: false, ingredients: [], recipe: '',
  };
}

// ---------- Wereldkeuken ----------

// Het vlaggetje bij een landcode van twee letters.
function flag(code) {
  return String.fromCodePoint(...[...code].map(letter => 0x1F1E6 + letter.charCodeAt(0) - 65));
}

// Woorden waaraan je in de omschrijving van een gerecht uit de wereldkeuken ziet dat het iets zoets is.
const SWEET_WORDS = /\bzoete?\b(?! aardappel)|honing|siroop|stroop|suiker|\bjam\b|chocolade|karamel|custard|dadel/;

// Een gerecht uit world-dishes.js uitgeschreven: naam, omschrijving, soort, bereidingstijd en maaltijden.
// Het plaatje staat erbij als de naam de app op het verkeerde been zet. Zegt de naam niets over het plaatje
// (veel buitenlandse namen), dan komt het uit de omschrijving; zegt ook die niets, dan krijgt zoetigheid gebak.
function worldDish(row) {
  const [name, text, type, time, meals, icon] = row.split('|');
  const sweet = type === 'g' && SWEET_WORDS.test(searchKey(text));
  return {
    name, text, type: DISH_TYPE[type], time: DISH_TIME[time],
    meals: cleanMeals(meals ? [...meals].map(code => DISH_MEAL[code]) : ['avond']),
    icon: icon || (guessIcon(name) ? '' : guessIcon(text) || (sweet ? '🍰' : '')),
  };
}

// De gerechten van een land; van een land zonder gerechten een lege lijst.
function countryDishes(code) {
  return WORLD_DISHES[code] || [];
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

// Het plaatje bij het woord dat een tekst het best typeert. In een samenstelling is dat het laatste
// woorddeel ("kipsalade" is een salade); een woord dat in een langer woord zit telt niet mee
// ("koek" in "pannenkoek").
function bestIcon(text) {
  const matches = [];
  for (const [icon, , words] of ICONS) {
    for (const word of words) {
      const start = word instanceof RegExp ? text.search(word) : text.lastIndexOf(word);
      if (start === -1) continue;
      const length = word instanceof RegExp ? text.match(word)[0].length : word.length;
      matches.push({ icon, start, end: start + length });
    }
  }
  const outer = matches.filter(a => !matches.some(b =>
    b.end - b.start > a.end - a.start && b.start <= a.start && b.end >= a.end));
  outer.sort((a, b) => b.start - a.start);
  return outer.length ? outer[0].icon : '';
}

// Het plaatje dat bij een naam past, of niets. In "zalm met rijst" zegt het deel voor "met" het meest.
function guessIcon(name) {
  const text = searchKey(name);
  return bestIcon(text.split(/ (?:met|op|uit|in|van|en) /)[0]) || bestIcon(text);
}

// Het plaatje van een gerecht of notitie: zelf gekozen, anders passend bij de naam, anders bij de soort.
function dishIcon(dish) {
  return dish.icon || guessIcon(dish.name) || TYPE_ICON[dish.type] || '🍽️';
}

function dishMeta(dish) {
  return `${TIME_SHORT[dish.time]} · ${TYPES[dish.type]}`;
}

// Voor de lijsten: ook voor welke maaltijden en hoeveel calorieën.
function dishDetails(dish) {
  return `${dish.meals.map(m => MEALS[m]).join(', ')}<br>${dishMeta(dish)}${dish.kcal == null ? '' : ' · ' + kcalLabel(dish)}${dish.healthy ? ' · 🥗 Gezond' : ''}${dish.diets.length ? `<br>${dish.diets.map(key => DIETS[key]).join(', ')}` : ''}${allergenLine(dish) ? `<br>${allergenLine(dish)}` : ''}`;
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

function entryHtml(entry, removable, marks) {
  const icons = marksHtml(marks);
  return `
    <li><span class="icon" aria-hidden="true">${dishIcon(entry)}</span>
    <span class="grow"><strong>${esc(entry.name)}</strong><br>
      <span class="small muted">${MEALS[entry.meal]}${entry.kcal == null ? '' : ` · ${entry.kcal} kcal`}${icons ? ` · ${icons}` : ''}</span></span>
    ${removable ? `<button class="icon-btn" data-action="remove-entry" data-id="${entry.id}" aria-label="Verwijder ${esc(entry.name)}">✕</button>` : ''}</li>`;
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

// De plaatjes van de groepen waarvoor iets meetelt, met een omschrijving voor schermlezers.
function marksHtml(marks) {
  const keys = Object.keys(GROUPS).filter(key => marks && marks[key]);
  if (!keys.length) return '';
  const label = `Telt mee voor ${new Intl.ListFormat('nl').format(keys.map(key => GROUPS[key][1].toLowerCase()))}`;
  return `<span role="img" aria-label="${label}">${keys.map(key => GROUPS[key][0]).join(' ')}</span>`;
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
  const reasons = Object.keys(GROUPS).filter(key => reward.marks[key]).map(key => `${GROUPS[key][0]} ${GROUPS[key][1].toLowerCase()}`);
  return `
    ${reward.badges.map(id => BADGES.find(b => b.id === id)).map(b =>
      `<div class="notice reward">🏅 Nieuwe badge: <strong>${b.icon} ${b.name}</strong></div>`).join('')}
    ${reasons.length ? `<div class="notice reward">Telt mee voor ${new Intl.ListFormat('nl').format(reasons)}</div>` : ''}`;
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

// ---------- Navigatie ----------

function go(name, extra = {}) {
  view = { name, ...extra };
  if (name === 'home') syncMeal();
  render();
  window.scrollTo(0, 0);
  // Een nieuw scherm komt zacht in beeld; opnieuw tekenen binnen een scherm niet.
  app.classList.remove('enter');
  void app.offsetWidth;
  app.classList.add('enter');
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
  if (view.name === 'ask' && view.step > 0) ACTIONS['ask-back']();
  else if (view.name === 'log') go('week', { offset: view.offset, day: view.day });
  else if (view.name === 'country') go('world');
  else go('home');
});

// De maaltijd op het startscherm loopt mee met de klok: elke minuut, en zodra de app weer in beeld komt.
// Na een half uur op de achtergrond vervalt ook een maaltijd die je zelf had gekozen.
function tickMeal() {
  if (!document.hidden && state.onboarded && view.name === 'home' && syncMeal()) render();
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

function render() {
  if (!state.onboarded) view.name = state.welcomed ? 'onboarding' : 'welcome';
  app.innerHTML = VIEWS[view.name]();
  if (document.getElementById('catalog')) filterCatalog();
  if (document.getElementById('map-host')) {
    mountWorldMap();
    filterCountries();
  }
  nav.hidden = !state.onboarded;
  const tab = NAV_TAB[view.name] || 'home';
  for (const button of nav.querySelectorAll('button')) {
    button.classList.toggle('active', button.dataset.view === tab);
    if (button.dataset.view === tab) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
}

// ---------- Schermen ----------

function dishFormHtml(dish, full) {
  // Een nieuw gerecht begint met jouw dieet aangevinkt, want je voegt meestal toe wat je zelf eet.
  const d = dish || {
    name: '', meals: [state.onboarded ? meal : 'avond'], time: 'normaal',
    type: state.diet.includes('vegetarisch') || state.diet.includes('vegan') ? 'vega' : 'vlees',
    kcal: null, healthy: false, icon: '', diets: cleanDiets(state.diet, false), allergens: [], ingredients: [], recipe: '',
  };
  // De allergenen staan ingeklapt, behalve als ze ertoe doen: bij een gerecht dat er al heeft, of als je zelf een allergie hebt.
  const showAllergens = d.allergens.length > 0 || d.unchecked || hasAllergy();
  const options = (map, selected) => Object.entries(map)
    .map(([value, label]) => `<option value="${value}"${value === selected ? ' selected' : ''}>${label}</option>`).join('');
  return `
    <form data-form="dish" novalidate>
      <label for="f-name">Naam van het gerecht</label>
      <input id="f-name" name="name" type="text" maxlength="60" autocomplete="off" value="${esc(d.name)}" placeholder="Bijvoorbeeld: spaghetti bolognese">
      <fieldset>
        <legend>Geschikt voor</legend>
        <div class="checks">${Object.entries(MEALS).map(([value, label]) => `
          <label class="check"><input type="checkbox" name="meals" value="${value}"${d.meals.includes(value) ? ' checked' : ''}>${label}</label>`).join('')}
        </div>
      </fieldset>
      <div class="row">
        <div>
          <label for="f-time">Bereidingstijd</label>
          <select id="f-time" name="time">${options(TIMES, d.time)}</select>
        </div>
        <div>
          <label for="f-type">Soort</label>
          <select id="f-type" name="type">${options(TYPES, d.type)}</select>
        </div>
      </div>
      <label for="f-icon">Plaatje</label>
      <select id="f-icon" name="icon">
        <option value="">Automatisch (past bij de naam)</option>
        ${ICONS.map(([icon, label]) => `<option value="${icon}"${icon === d.icon ? ' selected' : ''}>${icon} ${label}</option>`).join('')}
      </select>
      <label for="f-kcal">Calorieën per portie <span class="muted">(optioneel)</span></label>
      <input id="f-kcal" name="kcal" type="number" inputmode="numeric" min="0" max="5000" value="${d.kcal == null ? '' : d.kcal}" placeholder="Bijvoorbeeld: 550">
      <div class="checks" style="margin-top:14px">
        <label class="check"><input type="checkbox" name="healthy"${d.healthy ? ' checked' : ''}>🥗 Dit is een gezonde maaltijd</label>
      </div>
      <p class="small muted" style="margin-top:6px">Gezonde en uitgebreide maaltijden tellen mee voor je badges.</p>
      <fieldset>
        <legend>Past bij dieet <span class="muted" style="font-weight:400">(optioneel)</span></legend>
        <div class="checks">${Object.entries(DIETS).filter(([key]) => key !== 'vegetarisch').map(([key, label]) => `
          <label class="check"><input type="checkbox" name="diets" value="${key}"${d.diets.includes(key) ? ' checked' : ''}>${label}</label>`).join('')}
        </div>
      </fieldset>
      <p class="small muted" style="margin-top:6px">Vegetarisch hoef je niet aan te vinken: dat volgt uit de soort.</p>
      <details${showAllergens ? ' open' : ''}>
        <summary>Allergenen in dit gerecht <span class="muted" style="font-weight:400">(optioneel)</span></summary>
        <p class="small muted">${d.unchecked ? 'Van dit gerecht zijn de allergenen nog niet ingevuld. ' : ''}Vink aan wat erin zit. Heb je zelf een allergie, dan stel ik dit gerecht niet voor als het jouw allergeen bevat.</p>
        ${allergenChecksHtml('allergens', d.allergens, 'dish')}
      </details>
      ${full ? `
        <label for="f-ingredients">Ingrediënten <span class="muted">(één per regel, optioneel)</span></label>
        <textarea id="f-ingredients" name="ingredients" placeholder="500 g gehakt&#10;1 ui">${esc(d.ingredients.join('\n'))}</textarea>
        <label for="f-recipe">Bereidingswijze <span class="muted">(optioneel)</span></label>
        <textarea id="f-recipe" name="recipe">${esc(d.recipe)}</textarea>` : ''}
      <p class="error" role="alert" hidden></p>
      <p></p>
      <button class="btn primary" type="submit">${dish ? 'Opslaan' : 'Gerecht toevoegen'}</button>
    </form>`;
}

// Zonder hoofdletters en accenten, zodat "creme" ook "crème" vindt.
function searchKey(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Bekende gerechten die je nog niet hebt, met een zoekveld en een keuze per maaltijd.
// Welke er te zien zijn, regelt filterCatalog() na het tekenen.
function catalogHtml(defaultMeal) {
  const have = new Set(state.dishes.map(d => d.name.toLowerCase()));
  const filter = view.catalogMeal || defaultMeal;
  // Bij een maaltijd staan de gerechten voorop die daar in de eerste plaats voor bedoeld zijn.
  const items = CATALOG.map((item, index) => ({ item, index }))
    .filter(({ item }) => !have.has(item[0].toLowerCase()) && (filter === 'alles' || item[1].includes(filter)) &&
      suitable(catalogDish(item)))
    .sort((a, b) => (b.item[1][0] === filter) - (a.item[1][0] === filter));
  return `
    <div class="segments" role="group" aria-label="Maaltijd">${[['alles', 'Alles'], ...Object.entries(MEALS)].map(([value, label]) => `
      <button data-action="catalog-meal" data-meal="${value}" aria-pressed="${value === filter}">${label}</button>`).join('')}
    </div>
    <input type="search" data-input="catalog-search" value="${esc(view.catalogQuery || '')}" placeholder="Zoek een gerecht" aria-label="Zoek een gerecht">
    <div class="chips" id="catalog">${items.map(({ item, index }) => `
      <button class="chip" data-action="add-suggestion" data-index="${index}" data-name="${esc(searchKey(item[0]))}"><span aria-hidden="true">${guessIcon(item[0]) || TYPE_ICON[item[3]]}</span> ${item[0]}</button>`).join('')}
    </div>
    <button class="btn link" id="catalog-more" data-action="catalog-more" hidden></button>
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

// De ronde profielfoto, of het bordje zolang er geen foto is. Tikken opent de fotokiezer van het apparaat.
function avatarHtml() {
  return `
    <button class="avatar" data-action="photo-pick" aria-label="${state.photo ? 'Profielfoto aanpassen' : 'Profielfoto kiezen'}">
      ${state.photo ? `<img src="${state.photo}" alt="">` : '<span aria-hidden="true">🍽️</span>'}
      <span class="avatar-badge" aria-hidden="true">📷</span>
    </button>
    <input id="photo-file" type="file" accept="image/*" data-change="photo" hidden>`;
}

// Aanvinkbare diëten voor de gebruiker zelf, op het welkomstscherm en bij de instellingen.
function dietChecksHtml(change) {
  return `
    <div class="checks">${Object.entries(DIETS).map(([key, label]) => `
      <label class="check"><input type="checkbox" name="diet" value="${key}"${change ? ' data-change="set-diet"' : ''}${state.diet.includes(key) ? ' checked' : ''}>${label}</label>`).join('')}
    </div>`;
}

function filterCatalog() {
  const query = searchKey(view.catalogQuery || '').trim();
  const chips = [...app.querySelectorAll('#catalog .chip')];
  const matches = chips.filter(chip => chip.dataset.name.includes(query));
  const limit = query || view.catalogAll ? Infinity : CATALOG_PREVIEW;
  for (const chip of chips) chip.hidden = true;
  for (const chip of matches.slice(0, limit)) chip.hidden = false;
  const more = document.getElementById('catalog-more');
  more.hidden = matches.length <= limit;
  const rest = matches.length - CATALOG_PREVIEW;
  more.textContent = `Toon nog ${rest} ${rest === 1 ? 'gerecht' : 'gerechten'}`;
  const empty = document.getElementById('catalog-empty');
  empty.hidden = matches.length > 0;
  empty.textContent = query ? 'Niets gevonden. Je kunt het gerecht ook zelf toevoegen.' : 'Je hebt alle gerechten uit deze lijst al.';
}

function barHtml(item) {
  const dish = dishById(item.id);
  const icons = marksHtml(dishMarks(dish));
  return `
    <button class="bar${item.exact ? '' : ' near'}" data-action="pick" data-id="${dish.id}">
      <span class="icon" aria-hidden="true">${dishIcon(dish)}</span>
      <span class="bar-text">
        <span class="bar-name">${esc(dish.name)}</span><br>
        <span class="bar-meta">${dishMeta(dish)}${item.exact ? '' : '<span class="tag">past bijna</span>'}</span>
      </span>
      <span class="bar-kcal">${kcalLabel(dish)}${icons ? `<span class="bar-marks">${icons}</span>` : ''}</span>
    </button>`;
}

const VIEWS = {
  welcome() {
    return `
      <div class="hero"><div class="emoji">👋</div><h1>Hoi, leuk dat je er bent!</h1>
        <p class="muted">Weet je vaak niet wat je moet eten? Ik help je kiezen uit je eigen favorieten.</p></div>
      <form data-form="welcome">
        <label for="f-yourname">Hoe mag ik je noemen? <span class="muted">(mag je overslaan)</span></label>
        <input id="f-yourname" name="name" type="text" maxlength="30" autocomplete="given-name" placeholder="Je voornaam">
        <fieldset>
          <legend>Volg je een dieet? <span class="muted" style="font-weight:400">(mag je overslaan)</span></legend>
          ${dietChecksHtml(false)}
        </fieldset>
        <p class="small muted" style="margin-top:6px">Dan stel ik alleen gerechten voor die erbij passen. Je kunt dit later aanpassen bij de instellingen.</p>
        <details>
          <summary>Heb je een voedselallergie? <span class="muted" style="font-weight:400">(mag je overslaan)</span></summary>
          <p class="small muted">Vink aan waar je allergisch voor bent. Andere allergieën voeg je later toe bij de instellingen.</p>
          ${allergenChecksHtml('allergies', state.allergies, 'welcome')}
          <p class="small muted" style="margin-top:8px">${ALLERGY_WARNING}</p>
        </details>
        <button class="btn primary big" type="submit">Aan de slag</button>
      </form>`;
  },

  onboarding() {
    const count = state.dishes.length;
    const left = MIN_DISHES - count;
    const cheer = count === 0 ? 'Begin met je eerste gerecht.' : count < 3 ? 'Goed begin!' : count < 5 ? 'Lekker bezig!'
      : count === 5 ? 'Nog eentje!' : 'Top, je kunt beginnen!';
    return `
      <div class="hero"><div class="emoji">🍽️</div><h1>Wat eet jij graag${state.name ? `, ${esc(state.name)}` : ''}?</h1></div>
      <p>Vertel me je favoriete gerechten, minimaal ${MIN_DISHES}. Daarna help ik je elke dag kiezen.</p>
      <p class="small muted">${Math.min(count, MIN_DISHES)} van ${MIN_DISHES} · ${cheer}</p>
      <div class="progress"><div style="width:${Math.min(100, count / MIN_DISHES * 100)}%"></div></div>
      <h2>Tik aan wat je lekker vindt</h2>
      ${catalogHtml('avond')}
      <h2>Of voeg zelf een gerecht toe</h2>
      ${dishFormHtml(null, false)}
      ${count ? `<h2>Jouw gerechten</h2>
        <ul class="list">${state.dishes.map(d => `
          <li><span class="grow"><strong>${esc(d.name)}</strong><br><span class="small muted">${dishDetails(d)}</span></span>
          <button class="icon-btn" data-action="remove-dish" data-id="${d.id}" aria-label="Verwijder ${esc(d.name)}">✕</button></li>`).join('')}
        </ul>` : ''}
      <button class="btn primary sticky" data-action="finish-onboarding"${left > 0 ? ' disabled' : ''}>
        ${left > 0 ? `Nog ${left} ${left === 1 ? 'gerecht' : 'gerechten'} te gaan` : 'Laten we beginnen!'}
      </button>
      <button class="btn link" data-action="import-pick">Ik heb al een back-up</button>
      <input id="import-file" type="file" accept="application/json,.json" data-change="import" hidden>
      ${view.message ? `<div class="notice">${esc(view.message)}</div>` : ''}`;
  },

  home() {
    const eaten = entriesOn(dayKey(new Date()));
    const marks = entryMarks();
    const none = mealDishes().length === 0;
    const off = none ? ' disabled' : '';
    // Zijn er wel gerechten voor deze maaltijd, maar passen ze niet bij het dieet of de allergieën?
    const dietBlocks = none && state.dishes.some(d => d.meals.includes(meal));
    const limits = [state.diet.length && 'je dieet', allergyNames().length && 'je allergieën'].filter(Boolean).join(' en ');
    return `
      <button class="icon-btn globe" data-action="nav" data-view="world" aria-label="Wereldkeuken: gerechten per land">🌍</button>
      <button class="icon-btn settings" data-action="nav" data-view="more" aria-label="Instellingen">⚙️</button>
      <div class="hero">${avatarHtml()}<h1>${greeting()}</h1>
        <p class="muted">${manualMeal ? `Je kiest nu voor ${MEALS[meal].toLowerCase()}.` : `Tijd voor ${MEALS[meal].toLowerCase()}!`} Geen idee wat je wilt eten? Ik help je kiezen.</p></div>
      <div class="segments" role="group" aria-label="Maaltijd">${Object.entries(MEALS).map(([value, label]) => `
        <button data-action="set-meal" data-meal="${value}" aria-pressed="${value === meal}">${label}</button>`).join('')}
      </div>
      ${none ? `<div class="notice">Je hebt nog niets voor ${MEALS[meal].toLowerCase()}${dietBlocks ? ` dat bij ${limits} past` : ''}. Zullen we er een toevoegen?</div>
        <button class="btn primary" data-action="discover" data-meal="${meal}">🔎 Gerechten ontdekken</button>
        <button class="btn" data-action="edit-dish">+ Zelf een gerecht toevoegen</button>` : ''}
      <button class="btn primary big" data-action="start-ask"${off}>Help mij kiezen</button>
      <div class="row">
        <button class="btn" data-action="surprise"${off}>🎲 Verras me</button>
        <button class="btn" data-action="nav" data-view="group-setup"${off}>👥 Samen kiezen</button>
      </div>
      ${eaten.length ? `<h2>Vandaag gegeten</h2>
        <ul class="list">${eaten.map(h => entryHtml(h, false, marks.get(h.id))).join('')}</ul>
        <button class="btn link" data-action="nav" data-view="week">Bekijk je hele week</button>` : ''}`;
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
    const title = offset === 0 ? 'Deze week' : offset === -1 ? 'Vorige week' : `Week van ${shortDate(start)}`;
    const marks = entryMarks();
    const keys = days.map(day => day.key);
    const counts = countEntries(state.history.filter(h => keys.includes(dayKey(h.date))));
    return `
      <h1>Mijn week</h1>
      <p class="muted">Hier zie je wat je hebt gegeten. Wat je kiest, noteer ik vanzelf bij vandaag. Met de plus zet je er zelf iets bij.</p>
      <div class="weeknav">
        <button class="icon-btn" data-action="week-move" data-step="-1" aria-label="Vorige week"${offset <= -MAX_WEEKS_BACK ? ' disabled' : ''}>‹</button>
        <div class="center"><strong>${title}</strong><br><span class="small muted">${shortDate(start)} t/m ${shortDate(days[6].date)}</span></div>
        <button class="icon-btn" data-action="week-move" data-step="1" aria-label="Volgende week"${offset >= 0 ? ' disabled' : ''}>›</button>
      </div>
      <button class="btn link" data-action="nav" data-view="rewards">
        🥗 ${counts.healthy}× gezond · ⏲️ ${counts.slow}× uitgebreid · 🌈 ${counts.distinct} verschillend</button>
      ${days.map(day => {
        const entries = entriesOn(day.key);
        const future = day.key > today;
        const known = entries.filter(h => h.kcal != null);
        // Een plus achter het totaal betekent dat niet van alles de calorieën bekend zijn.
        const total = known.length ? `${known.reduce((sum, h) => sum + h.kcal, 0)}${known.length < entries.length ? '+' : ''} kcal` : '';
        return `
          ${day.key === view.day ? rewardHtml(view.reward) : ''}
          <section class="card day${day.key === today ? ' today' : ''}${future ? ' future' : ''}" data-day="${day.key}">
            <div class="day-head">
              <h2>${day.label} <span class="small muted">${shortDate(day.date)}</span>${day.key === today ? ' <span class="pill">vandaag</span>' : ''}</h2>
              <span class="bar-kcal">${total}</span>
              ${future ? '' : `<button class="icon-btn" data-action="log-day" data-day="${day.key}" aria-label="Iets noteren bij ${day.label.toLowerCase()}">+</button>`}
            </div>
            ${entries.length ? `<ul class="list">${entries.map(h => entryHtml(h, true, marks.get(h.id))).join('')}</ul>`
              : `<p class="small muted">${future ? 'Deze dag moet nog komen.' : 'Nog niets genoteerd.'}</p>`}
          </section>`;
      }).join('')}`;
  },

  log() {
    const date = new Date(`${view.day}T12:00:00`);
    const when = view.day === dayKey(new Date()) ? 'vandaag'
      : `op ${date.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}`;
    // Eerst de gerechten die bij de gekozen maaltijd horen.
    const dishes = [...state.dishes].sort((a, b) =>
      b.meals.includes(view.meal) - a.meals.includes(view.meal) || a.name.localeCompare(b.name, 'nl'));
    return `
      <h1>Wat at je ${when}?</h1>
      <div class="segments" role="group" aria-label="Maaltijd">${Object.entries(MEALS).map(([value, label]) => `
        <button data-action="log-meal" data-meal="${value}" aria-pressed="${value === view.meal}">${label}</button>`).join('')}
      </div>
      <h2>Tik een favoriet aan</h2>
      <div class="chips">${dishes.map(d => `
        <button class="chip" data-action="log-dish" data-id="${d.id}"><span aria-hidden="true">${dishIcon(d)}</span> ${esc(d.name)}</button>`).join('')}
      </div>
      <h2>Of iets anders gegeten?</h2>
      <form data-form="log" novalidate>
        <label for="f-logname">Wat was het?</label>
        <input id="f-logname" name="name" type="text" maxlength="60" autocomplete="off" placeholder="Bijvoorbeeld: friet">
        <label for="f-logkcal">Calorieën <span class="muted">(optioneel)</span></label>
        <input id="f-logkcal" name="kcal" type="number" inputmode="numeric" min="0" max="5000" placeholder="Bijvoorbeeld: 550">
        <div class="checks" style="margin-top:14px">
          <label class="check"><input type="checkbox" name="healthy">🥗 Het was gezond</label>
          <label class="check"><input type="checkbox" name="slow">⏲️ Uitgebreid gekookt (45+ min)</label>
        </div>
        <p class="error" role="alert" hidden></p>
        <p></p>
        <button class="btn primary" type="submit">Noteren</button>
      </form>
      <button class="btn link" data-action="log-cancel">Annuleren</button>`;
  },

  rewards() {
    const stats = rewardStats();
    const earned = BADGES.filter(b => state.badges[b.id]).length;
    return `
      <div class="hero"><div class="emoji">🏅</div>
        <h1>Jouw badges</h1>
        <p><strong>${earned} van ${BADGES.length} verdiend</strong></p></div>
      <div class="progress"><div style="width:${earned / BADGES.length * 100}%"></div></div>
      <p class="muted">Badges verdien je met wat er in je week staat. Eén maaltijd kan voor meerdere badges meetellen.</p>
      ${Object.entries(GROUPS).map(([group, [icon, name, text]]) => `
        <h2><span aria-hidden="true">${icon}</span> ${name}</h2>
        <p class="small muted">${text}</p>
        <ul class="list">${BADGES.filter(b => b.group === group).map(b => {
          const date = state.badges[b.id];
          // Bij een badge voor één week telt wat je deze week al hebt.
          const progress = Math.min(b.goal, (b.scope === 'total' ? stats.total : stats.now)[b.key]);
          return `
            <li class="${date ? '' : 'locked'}"><span class="icon" aria-hidden="true">${b.icon}</span>
            <span class="grow"><strong>${b.name}</strong><br><span class="small muted">${b.text}</span></span>
            <span class="small muted">${date ? `✓ ${shortDate(new Date(date))}` : `${progress} van ${b.goal}`}</span></li>`;
        }).join('')}
        </ul>`).join('')}`;
  },

  'group-setup'() {
    return `
      <h1>Samen kiezen</h1>
      <p>Gezellig! Iedereen kiest om de beurt op deze telefoon. Het gerecht met de meeste stemmen wint.</p>
      <h2>Met hoeveel personen zijn jullie?</h2>
      ${[2, 3, 4, 5, 6].map(n => `<button class="btn" data-action="start-group" data-count="${n}">${n} personen</button>`).join('')}
      <button class="btn link" data-action="nav" data-view="home">Annuleren</button>`;
  },

  ask() {
    const q = QUESTIONS[view.step];
    return `
      <p class="small muted">Vraag ${view.step + 1} van ${QUESTIONS.length}</p>
      <div class="progress"><div style="width:${(view.step + 1) / QUESTIONS.length * 100}%"></div></div>
      <h1>${q.title}</h1>
      <p></p>
      ${q.options.map(([value, label]) => {
        // Het plaatje vooraan is versiering en wordt niet voorgelezen.
        const [icon, ...words] = label.split(' ');
        return `<button class="btn" data-action="answer" data-value="${value}"><span aria-hidden="true">${icon}</span> ${words.join(' ')}</button>`;
      }).join('')}
      <button class="btn link" data-action="${view.step ? 'ask-back' : 'nav'}" data-view="home">${view.step ? 'Vorige vraag' : 'Annuleren'}</button>`;
  },

  results() {
    const items = view.queue.slice(view.page * PER_PAGE, (view.page + 1) * PER_PAGE);
    const group = view.group;
    const notices = [];
    if (view.wrapped) notices.push('Dat waren ze allemaal! We beginnen weer vooraan.');
    if (!view.queue[0].exact) notices.push('Niets past precies bij je antwoorden, maar dit komt aardig in de buurt.');
    else if (items.some(item => !item.exact)) notices.push('Staat er “past bijna” bij? Dan klopt het net niet helemaal met je antwoorden.');
    return `
      <h1>${group ? `Persoon ${group.votes.length + 1} van ${group.count}, kies maar!` : 'Wat lijkt je lekker?'}</h1>
      <p class="muted">Tik op waar je zin in hebt.</p>
      ${notices.map(n => `<div class="notice">${n}</div>`).join('')}
      ${items.map(barHtml).join('')}
      ${group ? '' : `
        <div class="row">
          ${view.queue.length > PER_PAGE ? '<button class="btn" data-action="more-results">Iets anders</button>' : ''}
          <button class="btn" data-action="surprise">🎲 Verras me</button>
        </div>`}
      <button class="btn link" data-action="nav" data-view="home">Annuleren</button>`;
  },

  pass() {
    const next = view.group.votes.length + 1;
    return `
      <div class="hero"><div class="emoji">📱</div><h1>Geef de telefoon door</h1>
        <p class="muted">Persoon ${next} van ${view.group.count} is aan de beurt. Niet spieken! 😉</p></div>
      <button class="btn primary big" data-action="pass-continue">Ik ben persoon ${next}</button>`;
  },

  chosen() {
    const dish = dishById(view.id);
    const hasRecipe = dish.ingredients.length || dish.recipe;
    return `
      <div class="hero"><div class="emoji pop">${dishIcon(dish)}</div>
        <p class="muted">Je ${MEALS[meal].toLowerCase()} wordt…</p>
        <h1>${esc(dish.name)}</h1>
        <p class="muted">${dishMeta(dish)}${dish.kcal == null ? '' : ' · ' + kcalLabel(dish)}</p>
        <p><strong>Eet smakelijk${state.name ? `, ${esc(state.name)}` : ''}! 😋</strong></p>
        <p class="small muted">Ik heb het bij vandaag genoteerd in je week.</p>
        ${allergenLine(dish) ? `<p class="small muted">${allergenLine(dish).replace('Bevat:', 'Bevat meestal:')}</p>` : ''}</div>
      ${rewardHtml(view.reward)}
      ${view.note ? `<div class="notice">${esc(view.note)}</div>` : ''}
      ${dish.ingredients.length ? `
        <div class="card"><h2 style="margin-top:0">Ingrediënten</h2>
          <ul>${dish.ingredients.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
          <button class="btn" data-action="add-to-shopping"${view.added ? ' disabled' : ''}>
            ${view.added ? '✓ Op de boodschappenlijst gezet' : '🛒 Zet op de boodschappenlijst'}</button>
        </div>` : ''}
      ${dish.recipe ? `<div class="card"><h2 style="margin-top:0">Bereidingswijze</h2><p class="recipe">${esc(dish.recipe)}</p></div>` : ''}
      ${hasRecipe ? '' : `
        <a class="btn" href="https://www.google.com/search?q=${encodeURIComponent(`recept ${dish.name}`)}" target="_blank" rel="noopener noreferrer">🔎 Zoek een recept op internet</a>
        <button class="btn" data-action="edit-dish" data-id="${dish.id}">Recept en ingrediënten toevoegen</button>`}
      <button class="btn primary" data-action="nav" data-view="home">Lekker, dank je!</button>
      <button class="btn link" data-action="undo-choice">Toch liever iets anders</button>`;
  },

  favorites() {
    return `
      <h1>Favorieten</h1>
      <p class="muted">Je hebt ${state.dishes.length} favorieten. Tik op het potlood om er een aan te passen.</p>
      <button class="btn primary" data-action="discover" data-meal="alles">🔎 Gerechten ontdekken</button>
      <button class="btn" data-action="edit-dish">+ Zelf een gerecht toevoegen</button>
      <ul class="list">${[...state.dishes].sort((a, b) => a.name.localeCompare(b.name, 'nl')).map(d => `
        <li><span class="icon" aria-hidden="true">${dishIcon(d)}</span>
        <span class="grow"><strong>${esc(d.name)}</strong><br><span class="small muted">${dishDetails(d)}</span>
          ${allergyBlock(d) ? `<br><span class="small warn">⚠️ Stel ik niet voor: ${esc(allergyBlock(d))}</span>` : ''}</span>
        <button class="icon-btn" data-action="edit-dish" data-id="${d.id}" aria-label="Pas ${esc(d.name)} aan">✎</button></li>`).join('')}
      </ul>`;
  },

  // De wereldkaart, met eronder het gekozen land en een lijst om een land te zoeken. De kaart zelf zet
  // mountWorldMap() erin; welke landen in de lijst staan, regelt filterCountries().
  world() {
    const status = {
      loading: '<p class="map-status muted">De kaart wordt geladen…</p>',
      failed: `<div class="map-status"><p>De kaart laden is niet gelukt. Heb je internet?</p>
        <button class="chip" data-action="map-retry">Probeer het opnieuw</button></div>`,
    };
    const names = Object.entries(COUNTRIES).sort((a, b) => a[1][0].localeCompare(b[1][0], 'nl'));
    return `
      <h1>Wereldkeuken</h1>
      <p class="muted">Tik op een land om de bekendste gerechten van dat land te zien. Je kunt de kaart verschuiven en inzoomen.</p>
      <div class="map-wrap">
        <div id="map-host" style="aspect-ratio:${MAP_RATIO.toFixed(3)}">${status[worldMap.status] || status.loading}</div>
        <div class="map-tools">
          <button class="icon-btn" data-action="map-zoom" data-factor="1.8" aria-label="Inzoomen">+</button>
          <button class="icon-btn" data-action="map-zoom" data-factor="0.55" aria-label="Uitzoomen">−</button>
          <button class="icon-btn" data-action="map-region" data-region="" aria-label="Hele wereld tonen">🌍</button>
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

  // De bekende gerechten van één land, elk met een plus om het bij de favorieten te zetten.
  country() {
    const code = view.code;
    const rows = countryDishes(code);
    const have = new Set(state.dishes.map(d => d.name.toLowerCase()));
    if (!rows.length) return `
      <div class="hero"><div class="emoji">${flag(code)}</div><h1>${COUNTRIES[code][0]}</h1>
        <p class="muted">Van dit land heb ik nog geen gerechten.</p></div>
      <button class="btn link" data-action="nav" data-view="world">← Terug naar de kaart</button>`;
    return `
      <div class="hero"><div class="emoji">${flag(code)}</div><h1>${COUNTRIES[code][0]}</h1>
        <p class="muted">${rows.length === 10 ? 'Tien bekende gerechten' : `Bekende gerechten (${rows.length})`}. Tik op de plus om er een bij je favorieten te zetten.</p></div>
      ${hasAllergy() || state.diet.length ? '<div class="notice">Van de meeste van deze gerechten ken ik de allergenen en de diëten niet. Zet je er een bij je favorieten, vul die dan zelf in bij het gerecht. Tot die tijd stel ik het niet voor.</div>' : ''}
      <ol class="list">${rows.map((row, i) => {
        const dish = worldDish(row);
        const added = have.has(dish.name.toLowerCase());
        return `
          <li><span class="rank" aria-hidden="true">${i + 1}</span><span class="icon" aria-hidden="true">${dishIcon(dish)}</span>
          <span class="grow"><strong>${esc(dish.name)}</strong><br><span class="small muted">${esc(dish.text)}</span></span>
          <button class="icon-btn${added ? ' done' : ''}" data-action="world-add" data-index="${i}"${added ? ' disabled' : ''}
            aria-label="${added ? `${esc(dish.name)} staat bij je favorieten` : `Zet ${esc(dish.name)} bij je favorieten`}">${added ? '✓' : '+'}</button></li>`;
      }).join('')}
      </ol>
      <p class="small muted">Dit is mijn eigen keuze van bekende gerechten, geen officiële ranglijst.</p>
      <button class="btn link" data-action="nav" data-view="world">← Terug naar de kaart</button>`;
  },

  discover() {
    return `
      <h1>Gerechten ontdekken</h1>
      <p class="muted">Tik aan wat je lekker vindt, dan zet ik het bij je favorieten. Je hebt er nu ${state.dishes.length}.</p>
      ${catalogHtml('alles')}
      <button class="btn primary sticky above-nav" data-action="nav" data-view="favorites">Klaar</button>`;
  },

  edit() {
    const dish = view.id ? dishById(view.id) : null;
    const canDelete = state.dishes.length > MIN_DISHES;
    return `
      <h1>${dish ? 'Gerecht aanpassen' : 'Nieuw gerecht'}</h1>
      ${dishFormHtml(dish, true)}
      ${dish ? `
        <button class="btn danger" data-action="delete-dish"${canDelete ? '' : ' disabled'}>
          ${view.confirm ? 'Zeker weten? Tik nog een keer' : 'Gerecht verwijderen'}</button>
        ${canDelete ? '' : `<p class="small muted center">Je hebt minimaal ${MIN_DISHES} gerechten nodig. Voeg eerst een nieuw gerecht toe.</p>`}` : ''}
      <button class="btn link" data-action="nav" data-view="favorites">Annuleren</button>`;
  },

  shopping() {
    const anyDone = state.shopping.some(i => i.done);
    return `
      <h1>Boodschappen</h1>
      <form data-form="shopping" class="row" style="align-items:flex-start">
        <input name="text" type="text" maxlength="80" autocomplete="off" placeholder="Iets toevoegen" aria-label="Iets toevoegen" style="flex:3">
        <button class="btn primary" type="submit" aria-label="Toevoegen aan de lijst">+</button>
      </form>
      ${state.shopping.length ? `
        <ul class="list">${state.shopping.map(i => `
          <li><input type="checkbox" id="s-${i.id}" data-change="toggle-item" data-id="${i.id}"${i.done ? ' checked' : ''}>
          <label for="s-${i.id}" class="grow${i.done ? ' done' : ''}" style="margin:0;font-weight:400">${esc(i.text)}
            ${i.dish ? `<br><span class="small muted">${esc(i.dish)}</span>` : ''}</label></li>`).join('')}
        </ul>
        <button class="btn"${anyDone ? '' : ' disabled'} data-action="clear-done">Afgevinkte verwijderen</button>`
      : '<div class="hero"><div class="emoji">🛒</div><p class="muted">Je lijstje is nog leeg. Kies een gerecht met ingrediënten, of zet er zelf iets op.</p></div>'}`;
  },

  // De instellingen zijn verdeeld over tabbladen; view.tab onthoudt welk tabblad open staat.
  more() {
    const tab = Object.hasOwn(SETTINGS_TABS, view.tab) ? view.tab : 'profiel';
    const panels = {
      profiel: () => `
        <h2>Profielfoto</h2>
        <div class="hero" style="padding:0">${avatarHtml()}</div>
        ${view.photoError ? `<div class="notice">${esc(view.photoError)}</div>` : ''}
        <button class="btn" data-action="photo-pick">${state.photo ? 'Andere foto kiezen' : 'Foto kiezen'}</button>
        ${state.photo ? '<button class="btn danger" data-action="photo-remove">Foto verwijderen</button>' : ''}
        <p class="muted small">Je foto blijft op dit apparaat staan en gaat mee in je back-up.</p>
        <h2>Je naam</h2>
        <form data-form="name" class="row" style="align-items:flex-start">
          <input name="name" type="text" maxlength="30" autocomplete="given-name" value="${esc(state.name)}" placeholder="Je voornaam" aria-label="Je naam" style="flex:3">
          <button class="btn primary" type="submit">${view.nameSaved ? '✓' : 'OK'}</button>
        </form>`,

      allergie: () => `
        <h2>Mijn allergieën</h2>
        <p class="muted small">Vink aan waar je allergisch voor bent. Gerechten waar dat in zit, stel ik niet meer voor.</p>
        <fieldset aria-label="Mijn allergieën">${allergenChecksHtml('allergies', state.allergies, 'user')}</fieldset>
        <h3>Andere allergie</h3>
        <p class="muted small">Staat jouw allergie er niet bij? Voeg haar toe. Ik sla dan gerechten over waar dat woord in de naam of bij de ingrediënten staat.</p>
        ${state.otherAllergies.length ? `<ul class="list">${state.otherAllergies.map((term, i) => `
          <li><span class="grow">${esc(term)}</span>
          <button class="icon-btn" data-action="remove-allergy" data-index="${i}" aria-label="Verwijder ${esc(term)}">✕</button></li>`).join('')}</ul>` : ''}
        <form data-form="allergy" class="row" style="align-items:flex-start">
          <input name="term" type="text" maxlength="30" autocomplete="off" placeholder="Bijvoorbeeld: kiwi" aria-label="Andere allergie" style="flex:3">
          <button class="btn primary" type="submit" aria-label="Allergie toevoegen">+</button>
        </form>
        <div class="chips">${ALLERGY_IDEAS.filter(idea => !state.otherAllergies.some(term => searchKey(term) === idea)).map(idea => `
          <button class="chip" data-action="add-allergy" data-term="${idea}">+ ${idea}</button>`).join('')}
        </div>
        <div class="notice">${ALLERGY_WARNING}</div>`,

      dieet: () => `
        <h2>Mijn dieet</h2>
        <fieldset aria-label="Mijn dieet">${dietChecksHtml(true)}</fieldset>
        <p class="muted small" style="margin-top:6px">Ik stel alleen gerechten voor die passen bij alles wat je hier aanvinkt. Per gerecht geef je bij Favorieten aan bij welk dieet het past.</p>
        <p class="muted small">Let op: de diëten bij gerechten zijn een schatting en geen garantie. Heb je een allergie? Vink die dan aan op het tabblad Allergie.</p>`,

      thema: () => `
        <h2>Thema</h2>
        <div class="themes" role="group" aria-label="Thema">${Object.entries(THEMES).map(([id, name]) => `
          <button class="theme" data-theme="${id}" data-action="set-theme" aria-pressed="${id === state.theme}">
            <span class="theme-dot"></span>${name}</button>`).join('')}
        </div>
        <p class="muted small">Standaard volgt de lichte of donkere modus van je telefoon.</p>`,

      backup: () => `
        <h2>Back-up</h2>
        <p class="muted small">Je gerechten staan alleen op dit apparaat. Maak af en toe een back-up, zodat je niets kwijtraakt.</p>
        <button class="btn" data-action="export">Back-up opslaan</button>
        <button class="btn" data-action="import-pick">Back-up terugzetten</button>
        <input id="import-file" type="file" accept="application/json,.json" data-change="import" hidden>
        ${view.message ? `<div class="notice">${esc(view.message)}</div>` : ''}
        <h2>Opnieuw beginnen</h2>
        <button class="btn danger" data-action="reset">${view.confirm ? 'Zeker weten? Alles wordt gewist' : 'Alles wissen'}</button>`,
    };
    return `
      <h1>Instellingen</h1>
      <div class="segments" role="tablist" aria-label="Onderdelen van de instellingen">${Object.entries(SETTINGS_TABS).map(([key, label]) => `
        <button role="tab" id="tab-${key}" data-action="settings-tab" data-tab="${key}" aria-selected="${key === tab}" aria-controls="settings-panel">${label}</button>`).join('')}
      </div>
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
    save();
    applyTheme();
    render();
  },

  'finish-onboarding'() {
    if (state.dishes.length < MIN_DISHES) return;
    state.onboarded = true;
    save();
    go('home');
  },

  discover(el) { go('discover', { catalogMeal: el.dataset.meal }); },

  'catalog-meal'(el) {
    view.catalogMeal = el.dataset.meal;
    view.catalogAll = false;
    render();
  },

  'catalog-more'() {
    view.catalogAll = true;
    filterCatalog();
  },

  'add-suggestion'(el) {
    const item = CATALOG[el.dataset.index];
    if (state.dishes.some(d => d.name.toLowerCase() === item[0].toLowerCase())) return;
    state.dishes.push(catalogEntry(item));
    save();
    render();
  },

  'map-zoom'(el) {
    if (worldMap.status === 'ready') zoomMap(Number(el.dataset.factor));
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

  // Zet een gerecht uit de wereldkeuken bij de favorieten. Staat het ook in de lijst met bekende gerechten,
  // dan komen de gegevens daarvandaan; anders zijn calorieën, diëten en allergenen nog onbekend.
  'world-add'(el) {
    const dish = worldDish(countryDishes(view.code)[el.dataset.index]);
    if (state.dishes.some(d => d.name.toLowerCase() === dish.name.toLowerCase())) return;
    const listed = CATALOG.find(item => item[0].toLowerCase() === dish.name.toLowerCase());
    state.dishes.push(listed ? catalogEntry(listed) : {
      id: newId(), name: dish.name, meals: dish.meals, time: dish.time, type: dish.type, kcal: null, healthy: false,
      icon: dish.icon, diets: [], allergens: [], unchecked: true, ingredients: [], recipe: '',
    });
    save();
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
      go('results', { answers, queue: buildQueue(answers), page: 0, group: view.group });
    }
  },

  'ask-back'() { go('ask', { step: view.step - 1, answers: view.answers, group: view.group }); },

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
    choose(weightedShuffle(pool)[0].id, 'Deze heb ik voor je uitgekozen. 🎲');
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
      ? `Gelijkspel tussen ${new Intl.ListFormat('nl').format(winners.map(id => dishById(id).name))}. Ik heb geloot!`
      : `Gewonnen met ${top} van de ${group.count} stemmen. 🎉`;
    choose(winner, note);
  },

  'pass-continue'() { go('results', view.results); },

  'add-to-shopping'() {
    const dish = dishById(view.id);
    for (const text of dish.ingredients) {
      state.shopping.push({ id: newId(), text, done: false, dish: dish.name });
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

  'remove-entry'(el) {
    state.history = state.history.filter(h => h.id !== el.dataset.id);
    save();
    delete view.reward;
    render();
  },

  'edit-dish'(el) { go('edit', { id: el.dataset.id || null }); },

  'delete-dish'() {
    if (state.dishes.length <= MIN_DISHES) return;
    if (!view.confirm) { view.confirm = true; return render(); }
    state.dishes = state.dishes.filter(d => d.id !== view.id);
    // Wat je ervan hebt gegeten, blijft in je week staan; alleen de koppeling met het gerecht vervalt.
    for (const h of state.history) {
      if (h.dishId === view.id) h.dishId = null;
    }
    save();
    go('favorites');
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

  // Een ander tabblad van de instellingen openen; de focus blijft op het gekozen tabblad.
  'settings-tab'(el) {
    view = { name: 'more', tab: el.dataset.tab };
    render();
    document.getElementById(`tab-${el.dataset.tab}`).focus();
  },

  'add-allergy'(el) {
    state.otherAllergies = cleanTerms([...state.otherAllergies, el.dataset.term]);
    save();
    render();
  },

  'remove-allergy'(el) {
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

const FORMS = {
  dish(form) {
    const data = new FormData(form);
    const name = data.get('name').trim();
    const kcalText = data.get('kcal').trim();
    const kcal = kcalText === '' ? null : Math.round(Number(kcalText));
    // Zonder opnieuw te tekenen, zodat wat al is ingevuld blijft staan.
    const fail = message => {
      const error = form.querySelector('.error');
      error.textContent = message;
      error.hidden = false;
    };

    const meals = data.getAll('meals');

    if (!name) return fail('Hoe heet het gerecht? Vul nog even een naam in.');
    if (!meals.length) return fail('Wanneer eet je dit? Kies minstens één maaltijd.');
    if (state.dishes.some(d => d.id !== view.id && d.name.toLowerCase() === name.toLowerCase())) {
      return fail('Deze staat al in je lijst.');
    }
    if (kcal != null && !(kcal >= 0 && kcal <= 5000)) return fail('Dat aantal calorieën klopt niet. Kies een getal tussen 0 en 5000.');

    const existing = view.id ? dishById(view.id) : null;
    const dish = existing || { id: newId(), ingredients: [], recipe: '' };
    Object.assign(dish, {
      name, meals: cleanMeals(meals), time: data.get('time'), type: data.get('type'), kcal,
      healthy: data.has('healthy'), diets: cleanDiets(data.getAll('diets'), false),
      icon: ICON_SET.has(data.get('icon')) ? data.get('icon') : '',
      allergens: cleanAllergens(data.getAll('allergens')),
      // Wie het formulier opslaat, heeft de allergenen gezien en zo nodig ingevuld.
      unchecked: false,
    });
    if (data.has('ingredients')) {
      dish.ingredients = data.get('ingredients').split('\n').map(line => line.trim()).filter(Boolean);
      dish.recipe = data.get('recipe').trim();
    }
    if (!existing) state.dishes.push(dish);
    save();
    go(state.onboarded ? 'favorites' : 'onboarding');
  },

  welcome(form) {
    const data = new FormData(form);
    state.name = cleanName(data.get('name'));
    state.diet = cleanDiets(data.getAll('diet'), true);
    state.allergies = cleanAllergens(data.getAll('allergies'));
    state.welcomed = true;
    save();
    go('onboarding');
  },

  // Een eigen allergie toevoegen, naast de veertien uit de lijst.
  allergy(form) {
    const term = new FormData(form).get('term').trim();
    if (term.length < 2) return;
    state.otherAllergies = cleanTerms([...state.otherAllergies, term]);
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
    const fail = message => {
      const error = form.querySelector('.error');
      error.textContent = message;
      error.hidden = false;
    };

    if (!name) return fail('Wat heb je gegeten? Vul nog even in wat het was.');
    if (kcal != null && !(kcal >= 0 && kcal <= 5000)) return fail('Dat aantal calorieën klopt niet. Kies een getal tussen 0 en 5000.');

    const source = { name, kcal, healthy: data.has('healthy'), time: data.has('slow') ? 'uitgebreid' : null };
    const reward = rewardFor(logEntry(source, view.day, view.meal, false));
    save();
    go('week', { offset: view.offset, day: view.day, reward });
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
    const checked = [...app.querySelectorAll('input[name="allergies"]:checked')].map(input => input.value);
    state.allergies = cleanAllergens(checked);
    save();
    render();
    app.querySelector(`input[name="allergies"][value="${el.value}"]`).focus();
  },

  // Een vinkje bij "Mijn dieet" in de instellingen werkt meteen.
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
      state = { ...clean, onboarded: true };
      checkBadges();
      save();
      applyTheme();
      go('more', { tab: 'backup', message: `Back-up teruggezet: ${state.dishes.length} gerechten.` });
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
  }
});

document.addEventListener('change', event => {
  const el = event.target.closest('[data-change]');
  if (el) CHANGES[el.dataset.change](el);
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Wie al notities had van voor de badges, krijgt de badges die daarbij horen.
if (checkBadges().length) save();
applyTheme();
render();
