'use strict';

// De wereldkaart van de wereldkeuken: tekenen, verschuiven, in- en uitzoomen en een land aantikken.
// De kaartgegevens (countries-50m.json) worden pas geladen als de kaart voor het eerst nodig is.

const SVG_NS = 'http://www.w3.org/2000/svg';
// Het stuk wereld dat de kaart toont: [west, oost, zuid, noord]. Antarctica valt erbuiten.
const MAP_WORLD = [-180, 180, -58, 83.7];
// Zo ver kun je inzoomen ten opzichte van de hele wereld.
const MAP_MAX_ZOOM = 120;
// Een beweging van minder dan dit aantal schermpunten telt als een tik, niet als slepen.
const MAP_TAP = 6;
// Tik je net naast een land (een eilandje, een ministaat), dan telt het land binnen deze afstanden.
const MAP_NEAR = [8, 16];

const worldMap = {
  status: 'idle',      // idle, loading, ready of failed
  svg: null,           // de tekening: één keer gemaakt en daarna hergebruikt
  paths: new Map(),    // landcode → de vormen van dat land op de kaart
  boxes: new Map(),    // landcode → [x, y, breedte, hoogte] van het grootste stuk van dat land
  full: null,          // de hele wereld als [x, y, breedte, hoogte]
  box: null,           // het stuk dat nu in beeld is
  selected: null,      // de landcode die is gekozen
  region: null,        // het werelddeel waarvan de landen onder de kaart staan
  query: '',           // wat er in het zoekveld staat
};

// Mercatorprojectie: een plek op aarde als punt op de kaart. De eenheden zijn graden op de evenaar.
function mapPoint(lon, lat) {
  return [lon + 180, -Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 180 / Math.PI];
}

// Een stuk wereld ([west, oost, zuid, noord]) als uitsnede van de kaart: [x, y, breedte, hoogte].
function mapBox([west, east, south, north]) {
  const [x0, y0] = mapPoint(west, north);
  const [x1, y1] = mapPoint(east, south);
  return [x0, y0, x1 - x0, y1 - y0];
}

// De verhouding tussen breedte en hoogte van de kaart; het vak op het scherm heeft dezelfde verhouding.
const MAP_RATIO = mapBox(MAP_WORLD)[2] / mapBox(MAP_WORLD)[3];

// Maakt een uitsnede passend: dezelfde verhouding als de kaart, niet verder in- of uitgezoomd dan mag,
// en binnen de wereld. Het midden van de gevraagde uitsnede blijft waar mogelijk het midden.
function fitMapBox([x, y, width, height]) {
  const [fullX, fullY, fullWidth, fullHeight] = worldMap.full;
  const w = Math.min(fullWidth, Math.max(fullWidth / MAP_MAX_ZOOM, width, height * MAP_RATIO));
  const h = w / MAP_RATIO;
  return [
    Math.min(fullX + fullWidth - w, Math.max(fullX, x + width / 2 - w / 2)),
    Math.min(fullY + fullHeight - h, Math.max(fullY, y + height / 2 - h / 2)),
    w, h,
  ];
}

function setMapBox(box) {
  worldMap.box = fitMapBox(box);
  worldMap.svg.setAttribute('viewBox', worldMap.box.map(n => n.toFixed(3)).join(' '));
}

// Zoomt in (factor groter dan 1) of uit rond een punt op de kaart; zonder punt rond het midden.
function zoomMap(factor, centerX, centerY) {
  const [x, y, w, h] = worldMap.box;
  const cx = centerX === undefined ? x + w / 2 : centerX;
  const cy = centerY === undefined ? y + h / 2 : centerY;
  setMapBox([cx - (cx - x) / factor, cy - (cy - y) / factor, w / factor, h / factor]);
}

// Zet een land midden in beeld, met wat ruimte eromheen.
function showCountryOnMap(code) {
  const box = worldMap.boxes.get(code);
  if (!box || worldMap.status !== 'ready') return;
  const [x, y, w, h] = box;
  const margin = Math.max(w, h, 2);
  setMapBox([x - margin, y - margin, w + 2 * margin, h + 2 * margin]);
}

// Zet een werelddeel in beeld, of de hele wereld als er geen is gekozen.
function showRegionOnMap(key) {
  if (worldMap.status === 'ready') setMapBox(key ? mapBox(REGIONS[key][1]) : worldMap.full);
}

function loadWorldMap() {
  if (worldMap.status === 'loading' || worldMap.status === 'ready') return;
  worldMap.status = 'loading';
  fetch('countries-50m.json')
    .then(response => {
      if (!response.ok) throw new Error(`kaart niet gevonden (${response.status})`);
      return response.json();
    })
    .then(topology => {
      buildWorldMap(topology);
      worldMap.status = 'ready';
      // Wat er al was gekozen terwijl de kaart nog laadde, komt nu in beeld.
      if (worldMap.selected) showCountryOnMap(worldMap.selected);
      else showRegionOnMap(worldMap.region);
    })
    .catch(() => { worldMap.status = 'failed'; })
    .finally(() => { if (view.name === 'world') render(); });
}

// Zet het kaartbestand om in een tekening. In het bestand zijn grenzen opgeknipt in "bogen" die buurlanden
// delen; een land is een lijst verwijzingen naar die bogen (een negatief nummer betekent: achterstevoren).
function buildWorldMap(topology) {
  worldMap.paths.clear();
  worldMap.boxes.clear();
  const { scale, translate } = topology.transform;
  const arcs = topology.arcs.map(arc => {
    // In het bestand staat van elk punt het verschil met het vorige punt.
    let x = 0;
    let y = 0;
    return arc.map(([dx, dy]) => {
      x += dx;
      y += dy;
      return mapPoint(x * scale[0] + translate[0], Math.max(-85, Math.min(85, y * scale[1] + translate[1])));
    });
  });
  // Een ring als lijst punten. Steekt een gebied de datumgrens over (het oosten van Rusland, Fiji), dan
  // springt de lengtegraad van +180 naar −180. Die sprong gaat eruit, zodat de ring heel blijft; zo'n ring
  // steekt dan wel buiten de kaart uit.
  const ring = indexes => {
    const points = [];
    let shift = 0;
    for (const index of indexes) {
      const arc = index < 0 ? arcs[~index].slice().reverse() : arcs[index];
      for (let i = points.length ? 1 : 0; i < arc.length; i++) {
        const last = points[points.length - 1];
        if (last && Math.abs(arc[i][0] + shift - last[0]) > 180) shift += arc[i][0] + shift < last[0] ? 360 : -360;
        points.push([arc[i][0] + shift, arc[i][1]]);
      }
    }
    return points;
  };
  const outline = (points, shift) => `M${points.map(([x, y]) => `${(x + shift).toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'map');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Wereldkaart. Onder de kaart kun je een land ook zoeken of uit een lijst kiezen.');
  for (const geometry of topology.objects.countries.geometries) {
    if (geometry.id === '010') continue;   // Antarctica
    const entry = COUNTRY_BY_NUMBER[geometry.id];
    const code = entry ? entry[0] : COUNTRY_BY_MAP_NAME[geometry.properties.name] || '';
    const polygons = geometry.type === 'Polygon' ? [geometry.arcs] : geometry.arcs;
    let d = '';
    for (const polygon of polygons) {
      polygon.forEach((indexes, n) => {
        const points = ring(indexes);
        if (points.length < 3) return;
        const [x0, y0, x1, y1] = ringBounds(points);
        d += outline(points, 0);
        // Wat over de rechterrand van de kaart steekt, hoort ook aan de linkerrand, en andersom.
        if (x1 > 360) d += outline(points, -360);
        if (x0 < 0) d += outline(points, 360);
        // De eerste ring van een veelhoek is de buitenrand; de rest zijn gaten. Van elk land wordt het
        // grootste stuk onthouden, om erop in te kunnen zoomen: overzeese gebieden (Frans-Guyana bij
        // Frankrijk, Alaska bij de Verenigde Staten) tellen zo niet mee.
        const old = worldMap.boxes.get(code);
        if (n === 0 && code && (!old || (x1 - x0) * (y1 - y0) > old[2] * old[3])) worldMap.boxes.set(code, [x0, y0, x1 - x0, y1 - y0]);
      });
    }
    if (!d) continue;
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    if (code) {
      path.dataset.code = code;
      if (!worldMap.paths.has(code)) worldMap.paths.set(code, []);
      worldMap.paths.get(code).push(path);
    }
    svg.appendChild(path);
  }
  worldMap.svg = svg;
  worldMap.full = mapBox(MAP_WORLD);
  setMapBox(worldMap.full);
  listenToMap(svg);
}

// De uiterste punten van een ring: [links, boven, rechts, onder].
function ringBounds(points) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of points) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return [x0, y0, x1, y1];
}

// Slepen verschuift de kaart, twee vingers (of het muiswiel) zoomen, en een tik kiest een land.
function listenToMap(svg) {
  const pointers = new Map();   // elke vinger of muisknop die de kaart nu aanraakt, met zijn laatste plek
  let moved = 0;                // hoeveel er sinds het aanraken is bewogen
  let pinch = 0;                // de afstand tussen twee vingers op het vorige moment
  const onMap = (clientX, clientY) => {
    const rect = svg.getBoundingClientRect();
    const [x, y, w, h] = worldMap.box;
    return [x + (clientX - rect.left) / rect.width * w, y + (clientY - rect.top) / rect.height * h];
  };

  // Het land op een plek op het scherm; ligt daar geen land, dan het land er vlak naast.
  const countryAt = (clientX, clientY) => {
    for (const radius of [0, ...MAP_NEAR]) {
      for (let step = 0; step < (radius ? 8 : 1); step++) {
        const angle = step * Math.PI / 4;
        const target = document.elementFromPoint(clientX + radius * Math.cos(angle), clientY + radius * Math.sin(angle));
        if (target && svg.contains(target) && target.dataset.code) return target.dataset.code;
      }
    }
    return '';
  };

  // De afstand tussen twee vingers, en het punt op de kaart er middenin.
  const fingers = () => {
    const [a, b] = [...pointers.values()];
    return { distance: Math.hypot(a[0] - b[0], a[1] - b[1]), middle: onMap((a[0] + b[0]) / 2, (a[1] + b[1]) / 2) };
  };

  svg.addEventListener('pointerdown', event => {
    // Een eerste vinger betekent dat er geen andere meer op de kaart ligt, ook als het loslaten is gemist.
    if (event.isPrimary) pointers.clear();
    if (pointers.size === 0) moved = 0;
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    // Met een tweede vinger erbij is het geen tik meer.
    if (pointers.size === 2) {
      pinch = fingers().distance;
      moved = Infinity;
    }
    // Zo blijft slepen werken als de vinger even buiten de kaart komt. Lukt dat niet, dan werkt de kaart ook.
    try { svg.setPointerCapture(event.pointerId); } catch (e) { /* geen probleem */ }
  });

  svg.addEventListener('pointermove', event => {
    const last = pointers.get(event.pointerId);
    if (!last) return;
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    if (pointers.size === 1) {
      const dx = event.clientX - last[0];
      const dy = event.clientY - last[1];
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved <= MAP_TAP) return;
      const rect = svg.getBoundingClientRect();
      const [x, y, w, h] = worldMap.box;
      setMapBox([x - dx / rect.width * w, y - dy / rect.height * h, w, h]);
    } else if (pointers.size === 2) {
      const { distance, middle } = fingers();
      if (pinch && distance) zoomMap(distance / pinch, ...middle);
      pinch = distance;
    }
  });

  const release = event => {
    const tapped = event.type === 'pointerup' && pointers.size === 1 && moved <= MAP_TAP;
    pointers.delete(event.pointerId);
    pinch = 0;
    if (!tapped) return;
    const code = countryAt(event.clientX, event.clientY);
    if (code) chooseCountry(code);
  };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);

  svg.addEventListener('wheel', event => {
    event.preventDefault();
    zoomMap(event.deltaY < 0 ? 1.25 : 0.8, ...onMap(event.clientX, event.clientY));
  }, { passive: false });
}

// Kiest een land: het licht op op de kaart en staat in het vak eronder.
function chooseCountry(code) {
  if (!COUNTRIES[code]) return;
  worldMap.selected = code;
  render();
}

// Zet de tekening in het scherm van de wereldkeuken en kleurt de landen. Het scherm wordt bij elke wijziging
// opnieuw opgebouwd, maar de tekening zelf blijft dezelfde.
function mountWorldMap() {
  const host = document.getElementById('map-host');
  if (!host) return;
  if (worldMap.status === 'idle') loadWorldMap();
  if (worldMap.status !== 'ready') return;
  for (const [code, paths] of worldMap.paths) {
    const style = `${WORLD_DISHES[code] ? 'has' : 'none'}${code === worldMap.selected ? ' sel' : ''}`;
    for (const path of paths) path.setAttribute('class', style);
  }
  // Het gekozen land ligt bovenop, zodat de rand eromheen niet onder de buurlanden verdwijnt.
  for (const path of worldMap.paths.get(worldMap.selected) || []) worldMap.svg.appendChild(path);
  host.textContent = '';
  host.appendChild(worldMap.svg);
}

// Laat onder de kaart de landen zien die bij het zoekwoord passen, of anders die van het gekozen werelddeel.
function filterCountries() {
  const list = document.getElementById('country-list');
  if (!list) return;
  const query = searchKey(worldMap.query).trim();
  let shown = 0;
  for (const chip of list.querySelectorAll('.chip')) {
    chip.hidden = query ? !chip.dataset.name.includes(query) : chip.dataset.region !== worldMap.region;
    if (!chip.hidden) shown++;
  }
  const empty = document.getElementById('country-empty');
  empty.hidden = shown > 0;
  empty.textContent = query ? 'Geen land gevonden met die naam.' : 'Kies een werelddeel, of typ de naam van een land.';
}
