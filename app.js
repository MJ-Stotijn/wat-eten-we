'use strict';

const STORAGE_KEY = 'wat-eten-we-v1';
const MIN_DISHES = 6;
const PER_PAGE = 4;

const TIMES = { snel: 'Snel (tot 20 min)', normaal: 'Gemiddeld (20–45 min)', uitgebreid: 'Uitgebreid (45+ min)' };
const TIME_SHORT = { snel: 'Snel', normaal: 'Gemiddeld', uitgebreid: 'Uitgebreid' };
const TIME_RANK = { snel: 0, normaal: 1, uitgebreid: 2 };
const TYPES = { vlees: 'Vlees', vis: 'Vis', vega: 'Vegetarisch' };
const MEALS = { ontbijt: 'Ontbijt', middag: 'Middageten', avond: 'Avondeten' };
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
// Bekende gerechten om bij de eerste start met één tik toe te voegen. De calorieën zijn een schatting.
const SUGGESTIONS = [
  ['Havermout', ['ontbijt'], 'snel', 'vega', 300],
  ['Yoghurt met muesli', ['ontbijt'], 'snel', 'vega', 350],
  ['Boterham met kaas', ['ontbijt', 'middag'], 'snel', 'vega', 300],
  ['Omelet', ['ontbijt', 'middag'], 'snel', 'vega', 300],
  ['Tosti', ['middag'], 'snel', 'vega', 400],
  ['Tomatensoep', ['middag'], 'normaal', 'vega', 250],
  ['Kipsalade', ['middag'], 'snel', 'vlees', 400],
  ['Spaghetti bolognese', ['avond'], 'normaal', 'vlees', 650],
  ['Stamppot boerenkool', ['avond'], 'normaal', 'vlees', 700],
  ['Nasi goreng', ['avond'], 'normaal', 'vlees', 650],
  ['Zalm met rijst', ['avond'], 'normaal', 'vis', 550],
  ['Groentecurry', ['avond'], 'normaal', 'vega', 500],
  ['Pizza', ['avond'], 'normaal', 'vega', 800],
  ['Pannenkoeken', ['middag', 'avond'], 'normaal', 'vega', 600],
];
const TYPE_ICON = { vlees: '🍖', vis: '🐟', vega: '🥦' };

const app = document.getElementById('app');
const nav = document.getElementById('nav');

// De teller voorkomt dubbele id's als er meerdere in dezelfde milliseconde worden gemaakt.
// Staat hier omdat load() al id's aanmaakt.
let idCounter = 0;
let state = load();
let view = { name: 'home' };
// De maaltijd waarvoor je kiest; begint bij wat past bij het tijdstip.
let meal = defaultMeal();

// ---------- Opslag ----------

function emptyState() {
  return { dishes: [], history: [], shopping: [], onboarded: false, welcomed: false, name: '', theme: 'standaard' };
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
    dishes.push({
      id: d.id,
      name: d.name.trim().slice(0, 60),
      // Gerechten van voor de maaltijd-functie tellen als avondeten.
      meals: cleanMeals(d.meals),
      time: d.time,
      type: d.type,
      kcal: Number.isFinite(d.kcal) && d.kcal >= 0 && d.kcal <= 5000 ? Math.round(d.kcal) : null,
      ingredients: list(d.ingredients).map(i => String(i).trim()).filter(Boolean),
      recipe: typeof d.recipe === 'string' ? d.recipe : '',
    });
  }
  return {
    onboarded: data.onboarded === true && dishes.length >= MIN_DISHES,
    // Wie al gerechten heeft, is het welkomstscherm al voorbij.
    welcomed: data.welcomed === true || dishes.length > 0,
    name: cleanName(data.name),
    theme: Object.hasOwn(THEMES, data.theme) ? data.theme : 'standaard',
    dishes,
    history: list(data.history)
      .filter(h => h && ids.has(h.dishId) && !isNaN(new Date(h.date).getTime()))
      .map(h => ({ dishId: h.dishId, date: new Date(h.date).toISOString(), meal: Object.hasOwn(MEALS, h.meal) ? h.meal : 'avond' })),
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

function cleanMeals(meals) {
  const known = Array.isArray(meals) ? Object.keys(MEALS).filter(m => meals.includes(m)) : [];
  return known.length ? known : ['avond'];
}

function defaultMeal() {
  const hour = new Date().getHours();
  return hour < 11 ? 'ontbijt' : hour < 16 ? 'middag' : 'avond';
}

function mealDishes() {
  return state.dishes.filter(d => d.meals.includes(meal));
}

function dishMeta(dish) {
  return `${TIME_SHORT[dish.time]} · ${TYPES[dish.type]}`;
}

// Voor de lijsten: ook voor welke maaltijden en hoeveel calorieën.
function dishDetails(dish) {
  return `${dish.meals.map(m => MEALS[m]).join(', ')}<br>${dishMeta(dish)}${dish.kcal == null ? '' : ' · ' + kcalLabel(dish)}`;
}

function kcalLabel(dish) {
  return dish.kcal == null ? '' : `${dish.kcal} kcal`;
}

function daysSinceChosen(dishId) {
  const last = state.history.filter(h => h.dishId === dishId).pop();
  return last ? (Date.now() - new Date(last.date).getTime()) / 86400000 : Infinity;
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
  state.history.push({ dishId: id, date: new Date().toISOString(), meal });
  state.history = state.history.slice(-200);
  save();
  go('chosen', { id, note });
}

// ---------- Navigatie ----------

function go(name, extra = {}) {
  view = { name, ...extra };
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
  else go('home');
});

// Blijft de app lang open staan, dan past de maaltijd zich weer aan het tijdstip aan.
let hiddenSince = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    hiddenSince = Date.now();
  } else if (hiddenSince && Date.now() - hiddenSince > 30 * 60000 && view.name === 'home') {
    meal = defaultMeal();
    render();
  }
});

const NAV_TAB = { favorites: 'favorites', edit: 'favorites', shopping: 'shopping', more: 'more' };

function render() {
  if (!state.onboarded) view.name = state.welcomed ? 'onboarding' : 'welcome';
  app.innerHTML = VIEWS[view.name]();
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
  const d = dish || { name: '', meals: [state.onboarded ? meal : 'avond'], time: 'normaal', type: 'vlees', kcal: null, ingredients: [], recipe: '' };
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
      <label for="f-kcal">Calorieën per portie <span class="muted">(optioneel)</span></label>
      <input id="f-kcal" name="kcal" type="number" inputmode="numeric" min="0" max="5000" value="${d.kcal == null ? '' : d.kcal}" placeholder="Bijvoorbeeld: 550">
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

function barHtml(item) {
  const dish = dishById(item.id);
  return `
    <button class="bar${item.exact ? '' : ' near'}" data-action="pick" data-id="${dish.id}">
      <span class="icon" aria-hidden="true">${TYPE_ICON[dish.type]}</span>
      <span class="bar-text">
        <span class="bar-name">${esc(dish.name)}</span><br>
        <span class="bar-meta">${dishMeta(dish)}${item.exact ? '' : '<span class="tag">past bijna</span>'}</span>
      </span>
      <span class="bar-kcal">${kcalLabel(dish)}</span>
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
        <p></p>
        <button class="btn primary big" type="submit">Aan de slag</button>
      </form>`;
  },

  onboarding() {
    const count = state.dishes.length;
    const left = MIN_DISHES - count;
    const cheer = count === 0 ? 'Begin met je eerste gerecht.' : count < 3 ? 'Goed begin!' : count < 5 ? 'Lekker bezig!'
      : count === 5 ? 'Nog eentje!' : 'Top, je kunt beginnen!';
    const have = new Set(state.dishes.map(d => d.name.toLowerCase()));
    const chips = SUGGESTIONS.map(([name], i) => have.has(name.toLowerCase()) ? ''
      : `<button class="chip" data-action="add-suggestion" data-index="${i}">+ ${name}</button>`).join('');
    return `
      <div class="hero"><div class="emoji">🍽️</div><h1>Wat eet jij graag${state.name ? `, ${esc(state.name)}` : ''}?</h1></div>
      <p>Vertel me je favoriete gerechten, minimaal ${MIN_DISHES}. Daarna help ik je elke dag kiezen.</p>
      <p class="small muted">${Math.min(count, MIN_DISHES)} van ${MIN_DISHES} · ${cheer}</p>
      <div class="progress"><div style="width:${Math.min(100, count / MIN_DISHES * 100)}%"></div></div>
      ${chips ? `<h2>Tik aan wat je lekker vindt</h2>
        <div class="chips">${chips}</div>
        <p class="small muted">De calorieën hierbij zijn een schatting. Je kunt alles later aanpassen.</p>
        <h2>Of voeg zelf een gerecht toe</h2>` : ''}
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
    const recent = state.history.slice(-3).reverse().filter(h => dishById(h.dishId));
    const none = mealDishes().length === 0;
    const off = none ? ' disabled' : '';
    return `
      <div class="hero"><div class="emoji">🍽️</div><h1>${greeting()}</h1>
        <p class="muted">Geen idee wat je wilt eten? Ik help je kiezen.</p></div>
      <div class="segments" role="group" aria-label="Maaltijd">${Object.entries(MEALS).map(([value, label]) => `
        <button data-action="set-meal" data-meal="${value}" aria-pressed="${value === meal}">${label}</button>`).join('')}
      </div>
      ${none ? `<div class="notice">Je hebt nog niets voor ${MEALS[meal].toLowerCase()}. Zullen we er een toevoegen?</div>
        <button class="btn primary" data-action="edit-dish">+ Gerecht toevoegen</button>` : ''}
      <button class="btn primary big" data-action="start-ask"${off}>Help mij kiezen</button>
      <div class="row">
        <button class="btn" data-action="surprise"${off}>🎲 Verras me</button>
        <button class="btn" data-action="nav" data-view="group-setup"${off}>👥 Samen kiezen</button>
      </div>
      ${recent.length ? `<h2>Laatst gekozen</h2>
        <ul class="list">${recent.map(h => `
          <li><span class="grow">${esc(dishById(h.dishId).name)}${MEALS[h.meal] ? `<br><span class="small muted">${MEALS[h.meal]}</span>` : ''}</span>
          <span class="small muted">${new Date(h.date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}</span></li>`).join('')}
        </ul>` : ''}`;
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
      <div class="hero"><div class="emoji pop">${TYPE_ICON[dish.type]}</div>
        <p class="muted">Je ${MEALS[meal].toLowerCase()} wordt…</p>
        <h1>${esc(dish.name)}</h1>
        <p class="muted">${dishMeta(dish)}${dish.kcal == null ? '' : ' · ' + kcalLabel(dish)}</p>
        <p><strong>Eet smakelijk${state.name ? `, ${esc(state.name)}` : ''}! 😋</strong></p></div>
      ${view.note ? `<div class="notice">${esc(view.note)}</div>` : ''}
      ${dish.ingredients.length ? `
        <div class="card"><h2 style="margin-top:0">Ingrediënten</h2>
          <ul>${dish.ingredients.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
          <button class="btn" data-action="add-to-shopping"${view.added ? ' disabled' : ''}>
            ${view.added ? '✓ Op de boodschappenlijst gezet' : '🛒 Zet op de boodschappenlijst'}</button>
        </div>` : ''}
      ${dish.recipe ? `<div class="card"><h2 style="margin-top:0">Bereidingswijze</h2><p class="recipe">${esc(dish.recipe)}</p></div>` : ''}
      ${hasRecipe ? '' : `<button class="btn" data-action="edit-dish" data-id="${dish.id}">Recept en ingrediënten toevoegen</button>`}
      <button class="btn primary" data-action="nav" data-view="home">Lekker, dank je!</button>
      <button class="btn link" data-action="undo-choice">Toch liever iets anders</button>`;
  },

  favorites() {
    return `
      <h1>Favorieten</h1>
      <p class="muted">Je hebt ${state.dishes.length} favorieten. Tik op het potlood om er een aan te passen.</p>
      <button class="btn primary" data-action="edit-dish">+ Gerecht toevoegen</button>
      <ul class="list">${[...state.dishes].sort((a, b) => a.name.localeCompare(b.name, 'nl')).map(d => `
        <li><span class="icon" aria-hidden="true">${TYPE_ICON[d.type]}</span>
        <span class="grow"><strong>${esc(d.name)}</strong><br><span class="small muted">${dishDetails(d)}</span></span>
        <button class="icon-btn" data-action="edit-dish" data-id="${d.id}" aria-label="Pas ${esc(d.name)} aan">✎</button></li>`).join('')}
      </ul>`;
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

  more() {
    return `
      <h1>Meer</h1>
      <h2>Je naam</h2>
      <form data-form="name" class="row" style="align-items:flex-start">
        <input name="name" type="text" maxlength="30" autocomplete="given-name" value="${esc(state.name)}" placeholder="Je voornaam" aria-label="Je naam" style="flex:3">
        <button class="btn primary" type="submit">${view.nameSaved ? '✓' : 'OK'}</button>
      </form>
      <h2>Thema</h2>
      <div class="themes" role="group" aria-label="Thema">${Object.entries(THEMES).map(([id, name]) => `
        <button class="theme" data-theme="${id}" data-action="set-theme" aria-pressed="${id === state.theme}">
          <span class="theme-dot"></span>${name}</button>`).join('')}
      </div>
      <p class="muted small">Standaard volgt de lichte of donkere modus van je telefoon.</p>
      <h2>Back-up</h2>
      <p class="muted small">Je gerechten staan alleen op dit apparaat. Maak af en toe een back-up, zodat je niets kwijtraakt.</p>
      <button class="btn" data-action="export">Back-up opslaan</button>
      <button class="btn" data-action="import-pick">Back-up terugzetten</button>
      <input id="import-file" type="file" accept="application/json,.json" data-change="import" hidden>
      ${view.message ? `<div class="notice">${esc(view.message)}</div>` : ''}
      <h2>Opnieuw beginnen</h2>
      <button class="btn danger" data-action="reset">${view.confirm ? 'Zeker weten? Alles wordt gewist' : 'Alles wissen'}</button>`;
  },
};

// ---------- Acties ----------

const ACTIONS = {
  nav(el) { go(el.dataset.view); },

  'set-meal'(el) {
    meal = el.dataset.meal;
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

  'add-suggestion'(el) {
    const [name, meals, time, type, kcal] = SUGGESTIONS[el.dataset.index];
    if (state.dishes.some(d => d.name.toLowerCase() === name.toLowerCase())) return;
    state.dishes.push({ id: newId(), name, meals: [...meals], time, type, kcal, ingredients: [], recipe: '' });
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
  // Gerechten die je al met "Geen van deze" hebt afgewezen, doen niet meer mee.
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

  'undo-choice'() {
    state.history.pop();
    save();
    go('home');
  },

  'edit-dish'(el) { go('edit', { id: el.dataset.id || null }); },

  'delete-dish'() {
    if (state.dishes.length <= MIN_DISHES) return;
    if (!view.confirm) { view.confirm = true; return render(); }
    state.dishes = state.dishes.filter(d => d.id !== view.id);
    state.history = state.history.filter(h => h.dishId !== view.id);
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
    Object.assign(dish, { name, meals: cleanMeals(meals), time: data.get('time'), type: data.get('type'), kcal });
    if (data.has('ingredients')) {
      dish.ingredients = data.get('ingredients').split('\n').map(line => line.trim()).filter(Boolean);
      dish.recipe = data.get('recipe').trim();
    }
    if (!existing) state.dishes.push(dish);
    save();
    go(state.onboarded ? 'favorites' : 'onboarding');
  },

  welcome(form) {
    state.name = cleanName(new FormData(form).get('name'));
    state.welcomed = true;
    save();
    go('onboarding');
  },

  name(form) {
    state.name = cleanName(new FormData(form).get('name'));
    save();
    view.nameSaved = true;
    render();
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
      save();
      applyTheme();
      go('more', { message: `Back-up teruggezet: ${state.dishes.length} gerechten.` });
    } catch (e) {
      // Tijdens de eerste start bestaat het scherm "Meer" nog niet.
      go(state.onboarded ? 'more' : 'onboarding', { message: 'Dit bestand is geen geldige back-up van deze app.' });
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

document.addEventListener('change', event => {
  const el = event.target.closest('[data-change]');
  if (el) CHANGES[el.dataset.change](el);
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

applyTheme();
render();
