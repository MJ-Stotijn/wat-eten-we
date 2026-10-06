'use strict';

// Getekende pictogrammen in de stijl van het kookboek: inktlijnen op een raster van 32 bij 32, met één
// steunkleur. In de tekening betekent class "t" een vlak in een lichte tint van de steunkleur, "f" een
// vol vlak in de steunkleur, "s" een lijn in de steunkleur en "d" een stip.
const BOWL = '<path d="M4 15c0 7 5 12 12 12s12-5 12-12"/>';
const RIM = '<ellipse class="t" cx="16" cy="15" rx="12" ry="3.4"/>';
const STEAM = '<path class="s" d="M11.5 4c-1.6 2 1.6 3.3 0 5.3M16 3c-1.6 2 1.6 3.3 0 5.3M20.5 4c-1.6 2 1.6 3.3 0 5.3"/>';

const ICON_ART = {
  // ---------- Gerechten ----------
  bord: '<circle cx="16" cy="16" r="8.5"/><circle class="t" cx="16" cy="16" r="5"/><path d="M4 6v20M2 6v5a2 2 0 0 0 4 0V6"/><path d="M28.5 26V6c-2 2-3 5.5-3 9.500h3"/>',
  soep: `${STEAM}${RIM}${BOWL}`,
  pap: `${RIM}${BOWL}<circle class="f" cx="11" cy="14.600" r="1.500"/><circle class="f" cx="15" cy="15.800" r="1.500"/><path d="M20 15.500L28 5.500"/>`,
  smoothie: '<path d="M9 9h14l-2 18H11z"/><path class="t" d="M9.600 14h12.800L21 27H11z"/><path d="M17.500 9l3-6h4.500"/>',
  salade: '<path class="t" d="M5 16c-.5-3 2-5 4.500-4.500C10 8 15 7 16.500 10.500 19 8 23 9 23.500 12c2.500-.5 4 1.500 3.500 4z"/><path d="M4 16h24c0 6.500-5 11-12 11S4 22.500 4 16z"/><circle class="f" cx="13" cy="13" r="1.500"/><circle class="f" cx="20.500" cy="14" r="1.300"/>',
  rijst: '<path d="M6 15c.5-5 4.500-8 10-8s9.500 3 10 8"/><path class="d" d="M12 12h.01M16 10.500h.01M20 12h.01M14 13.500h.01M18 13.500h.01"/><path class="t" d="M4 15h24c0 7-5 12-12 12S4 22 4 15z"/>',
  curry: '<path d="M6 15c.5-4 4-7 9-7"/><path class="d" d="M10 13h.01M13 11.500h.01M12.500 13.800h.01"/><path class="t" d="M15 15V8c6-.5 10.500 2.500 11 7z"/><path d="M4 15h24c0 7-5 12-12 12S4 22 4 15z"/>',
  wok: '<path class="t" d="M3 14h22c0 6-4.500 10.500-11 10.500S3 20 3 14z"/><path d="M25 15.500l5-2.500"/><path d="M8 10l2-2.200M13 8l2.500 1M18.500 6.500l1.300 2.300M21.500 10.500l2-1.200"/>',
  noedels: '<path d="M5 6.500l21-3.500M5 10l21-3.500"/><path d="M10 9.500c-1.500 2 1.500 3.500 0 6.500M14 9c-1.500 2 1.500 3.500 0 7M18 8.500c-1.500 2 1.500 3.500 0 7.500"/><path class="t" d="M4 16h24c0 6.500-5 11-12 11S4 22.500 4 16z"/>',
  spaghetti: '<ellipse cx="16" cy="22.500" rx="13" ry="4.500"/><path class="t" d="M7.500 21.500c0-4.500 3.500-8 8.500-8s8.500 3.500 8.500 8c-2.500 1.500-5.500 2-8.500 2s-6-.5-8.500-2z"/><path d="M10.500 20.500c1-3 3.500-4.500 5.500-4.500s4.500 1.500 5.500 4.500M13 21.500c.6-1.700 1.700-2.500 3-2.500s2.400.8 3 2.500"/><circle class="f" cx="16" cy="13.500" r="2.300"/><path d="M26 3v8M24 3v3a2 2 0 0 0 4 0V3"/>',
  lasagne: '<path class="t" d="M4 13h24v4H4zM4 21h24v4H4z"/><path d="M4 13c2-2.500 4 1 6-1s4 1 6-1 4 1 6-1 4 2.500 6 1v12H4z"/><path d="M4 17h24M4 21h24"/>',
  pizza: '<path class="t" d="M16 28L5 10c7-4 15-4 22 0z"/><path d="M6.500 12.500c6-3 13-3 19 0"/><circle class="f" cx="13" cy="15.500" r="1.700"/><circle class="f" cx="19" cy="17" r="1.700"/><circle class="f" cx="15.500" cy="21.500" r="1.500"/>',
  hamburger: '<path d="M5 13c0-5 5-8 11-8s11 3 11 8z"/><path d="M4 16.500c2 0 2 1.500 4 1.500s2-1.500 4-1.500 2 1.500 4 1.500 2-1.500 4-1.500 2 1.500 4 1.500 2-1.500 4-1.500"/><rect class="t" x="5" y="20" width="22" height="3.500" rx="1.700"/><path d="M5 25.500h22v.5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/>',
  friet: '<path d="M10 14V7.500h2.500V14M13.500 14V4.500H16V14M17 14V6h2.500v8M20.500 14V8.500H23V14"/><path class="t" d="M8.500 14h15l-2 14h-11z"/>',
  worst: '<path class="t" d="M5 21c0-8 7-15 16-15a3.200 3.200 0 0 1 0 6.400c-5 0-9.600 4-9.600 8.600a3.200 3.200 0 0 1-6.400 0z"/><path d="M12 12.500l2 2.500M16.500 10l1.300 2.800"/>',
  kip: '<path class="t" d="M13 19c-2.200-2.500-2.500-6.500.5-10 3-3.500 8-4.500 11-1.500s2 8-1.500 11c-3.500 3-7.800 2.700-10 .5z"/><path d="M13 19l-3.500 3.500"/><circle cx="6.800" cy="22.800" r="2.200"/><circle cx="9.200" cy="25.200" r="2.200"/>',
  vlees: '<path class="t" d="M6 14c0-6 6-9 12-8 6 1 9 5 8 10-1 6-7 10-13 9-5-1-7-6-7-11z"/><circle cx="12" cy="15" r="2.300"/><path d="M17.500 11.500c2 .3 4 1.700 5 3.700"/>',
  gehaktbal: '<circle class="t" cx="10.500" cy="20.500" r="5.500"/><circle class="t" cx="21.500" cy="20.500" r="5.500"/><circle class="t" cx="16" cy="11.500" r="5.500"/><path d="M13.500 10c.7-1 1.700-1.500 2.800-1.500M8 19c.7-1 1.700-1.500 2.800-1.500M19 19c.7-1 1.700-1.500 2.800-1.500"/>',
  spies: '<g transform="rotate(-40 16 16)"><path d="M0 16h32"/><rect class="t" x="6.500" y="12" width="5.500" height="8" rx="1.600"/><rect class="t" x="13.500" y="12" width="5.500" height="8" rx="1.600"/><rect class="t" x="20.500" y="12" width="5.500" height="8" rx="1.600"/></g>',
  stoofpot: '<path class="s" d="M13 2.500c-1.300 1.600 1.300 2.600 0 4.200M19 2.500c-1.300 1.600 1.300 2.600 0 4.200"/><path d="M5 14c0-3 5-5 11-5s11 2 11 5"/><path d="M14 9V8h4v1"/><path class="t" d="M6 14h20v9a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z"/><path d="M6 17.500H3.500M26 17.500h2.500"/>',
  stamppot: '<path class="t" d="M5 16c1-5 5-8 11-8s10 3 11 8z"/><path d="M9.500 12.500c1.500-4.200 11.500-4.200 13 0-1 1.300-2.300 1.200-3-.2-.9-1.800-6.100-1.800-7 0-.7 1.400-2 1.500-3 .2z"/><path d="M4 16h24c0 6.500-5 11-12 11S4 22.500 4 16z"/>',
  aardappel: '<path class="t" d="M7 18c-1-5 3-10 9-11s11 3 10 9-6 10-12 10-6-4-7-8z"/><path class="d" d="M12 14h.01M18 12.500h.01M19.500 19h.01M13.500 21h.01"/>',
  ovenschotel: '<path class="t" d="M5 13c2-3 4 .5 6-1.500s4 1.500 6-.5 4 2 6 0 3 1 4 2z"/><path d="M5 13h22l-2 12H7z"/><path d="M5 15.500H2.500M27 15.500h2.500"/>',
  taart: '<path class="t" d="M5.500 17h21l-2.500 8h-16z"/><path d="M6 17c1-5.500 5-8.500 10-8.500s9 3 10 8.500M3.500 17h25"/><path class="s" d="M12.500 12.500l1 2.300M16 11.500v2.800M19.500 12.500l-1 2.300"/>',
  pannenkoek: '<path d="M6 12v4c0 2 4.500 3.500 10 3.500s10-1.500 10-3.500v-4M6 16v4c0 2 4.500 3.500 10 3.500s10-1.500 10-3.500v-4M6 20v3.500c0 2 4.500 3.500 10 3.500s10-1.500 10-3.500V20"/><ellipse class="t" cx="16" cy="12" rx="10" ry="3.500"/><rect class="f" x="14" y="10" width="4" height="3" rx=".6"/>',
  poffertjes: '<ellipse cx="16" cy="23" rx="13" ry="4.500"/><circle class="t" cx="10" cy="18" r="3.800"/><circle class="t" cx="22" cy="18" r="3.800"/><circle class="t" cx="16" cy="13.500" r="3.800"/><path class="d" d="M9 6h.01M14 4.500h.01M19 5.500h.01M23.500 7.500h.01"/>',
  wafel: '<rect class="t" x="5.500" y="5.500" width="21" height="21" rx="4.500"/><path d="M12.500 5.500v21M19.500 5.500v21M5.500 12.500h21M5.500 19.500h21"/>',
  croissant: '<path class="t" d="M3 19.500c2-8 7-13.500 13-13.500s11 5.500 13 13.500c-2.200.8-4.200.2-5.200-1.500-1.600-2.800-4.500-4.700-7.800-4.700s-6.200 1.900-7.800 4.700c-1 1.700-3 2.300-5.200 1.500z"/><path d="M9.500 9.500l2.700 5M16 6.500v6.800M22.500 9.500l-2.700 5"/>',
  brood: '<path class="t" d="M5 14c0-4 3-7 7-7h8c4 0 7 3 7 7 0 2-1 3.200-2 3.600V25H7v-7.400C6 17.200 5 16 5 14z"/><path d="M12 10.500l-2 3.500M17 10.500l-2 3.500M22 10.500l-2 3.500"/>',
  stokbrood: '<g transform="rotate(-35 16 16)"><rect class="t" x="1.500" y="11.500" width="29" height="9" rx="4.500"/><path d="M8 12.500l-2 7M14 12.500l-2 7M20 12.500l-2 7M26 13l-1.700 6"/></g>',
  sandwich: '<path d="M5 8.500h22a2 2 0 0 1 2 2v2.500H3v-2.500a2 2 0 0 1 2-2z"/><path d="M3 16c2.200 0 2.200 1.500 4.300 1.500S9.700 16 12 16s2.200 1.500 4.300 1.500S18.700 16 21 16s2.200 1.500 4.300 1.500S27 16 29 16"/><path class="t" d="M4 19.500h24v2.500H4z"/><path d="M3 24.500h26v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  tosti: '<path class="t" d="M4 25L16 5l12 20z"/><path d="M11 20l6.500-10.500M16 22l5.500-9M21 23l3-5"/>',
  ei: '<path d="M6 17c-1-5 2-10 8-10 3 0 4 2 7 2 4 0 6 4 5 8s-5 8-11 8-8-4-9-8z"/><circle class="t" cx="15" cy="16.500" r="4.300"/>',
  omelet: '<circle cx="13" cy="18" r="9.500"/><path d="M20 11.500L28.500 4"/><path class="t" d="M6.500 18a6.500 6.500 0 0 1 13 0z"/><path d="M6.500 18h13"/>',
  kaas: '<path class="t" d="M3 20L20 7c5 2 8 7 9 13z"/><path d="M3 20h26v6.500H3z"/><circle cx="18" cy="15" r="1.700"/><circle cx="10.500" cy="23.200" r="1.400"/><circle cx="22" cy="23.500" r="1"/>',
  vis: '<path class="t" d="M3 16c3-5 8-8 13-8 4 0 7 3 9 8-2 5-5 8-9 8-5 0-10-3-13-8z"/><path d="M25 16l5-5.500v11z"/><path d="M10.500 10.500c1.500 2.500 1.500 8.500 0 11"/><path class="d" d="M7.300 14.800h.01"/>',
  zalm: '<path class="t" d="M16 5.500c-6 0-11 4.200-11 10 0 5 3 9 6 10.300 1.500.6 2.700-.4 2.700-2v-4c0-1.500 1-2.500 2.300-2.500s2.300 1 2.300 2.500v4c0 1.600 1.200 2.600 2.700 2 3-1.300 6-5.300 6-10.300 0-5.800-5-10-11-10z"/><path d="M9.500 13c1.800-2 4-3 6.500-3s4.700 1 6.500 3M8.300 17.500c.8 1.500 1.700 2.500 2.700 3.200M23.700 17.500c-.8 1.500-1.700 2.500-2.700 3.200"/>',
  garnaal: '<path class="t" d="M21 6c-7-2-14 2.500-14 9.500 0 5.500 4 9.500 9.500 9.500 1 0 2-.2 3-.5l-1-4.300c-3 .8-6-1.300-6-4.700 0-3 2.200-5 5-5 1.300 0 2.500.5 3.500 1.300z"/><path d="M21 6l-1 5.800M21 6l6-2.500M21 6l7 1.500M19.500 24.500l5 3 1-5.500zM12.500 8l1.800 3.300M8.500 11.500l3.300 2M7.500 16.500l3.800-.3M9.500 21.500l3-2"/><path class="d" d="M18 8.700h.01"/>',
  schelp: '<path class="t" d="M16 27C9 27 4 21 4 14c4-5 8-7 12-7s8 2 12 7c0 7-5 13-12 13z"/><path d="M16 27V7.500M16 27L8.500 9.500M16 27l7.500-17.500M16 27L4.500 15.500M16 27l11.500-11.500"/>',
  inktvis: '<path class="t" d="M8 15a8 8 0 0 1 16 0v4H8z"/><path d="M8 19c0 4-3 4-3 7.500M12 19c0 4-2 5-2 8.500M16 19v8.500M20 19c0 4 2 5 2 8.500M24 19c0 4 3 4 3 7.500"/><path class="d" d="M13 14h.01M19 14h.01"/>',
  krab: '<ellipse class="t" cx="16" cy="19.500" rx="8" ry="5.500"/><path d="M9.500 16c-3-1-5-4-4-7.500 2 0 3.200 1.200 3.500 3.500M22.500 16c3-1 5-4 4-7.500-2 0-3.200 1.200-3.500 3.500M8 21l-4 2M9.500 24L7 27.500M24 21l4 2M22.500 24l2.500 3.500M13 14.500v-2.500M19 14.500v-2.500"/>',
  sushi: '<rect x="3.500" y="13" width="11.500" height="11.500" rx="5.700"/><circle class="f" cx="9.200" cy="18.700" r="2.200"/><path class="t" d="M17 19.500c0-4 2.700-6 6-6s6 2 6 6z"/><path d="M17 19.500h12v3a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z"/><path d="M22 19.500v5"/>',
  dumpling: '<path class="t" d="M3 21c0-8 6-13 13-13s13 5 13 13c-3 2-8 3-13 3S6 23 3 21z"/><path d="M8.500 12.500c1 2 1 3.500 0 5M12.800 10c1 2.500 1 4.500 0 6.500M17.500 9.500c.6 2.500.6 4.500 0 6.500M22 11c.5 2 0 4-1 6"/>',
  loempia: '<g transform="rotate(-25 16 16)"><rect class="t" x="3.500" y="11" width="25" height="10" rx="5"/><path d="M22.500 11c-2 3-2 7 0 10M8.500 14l4 4M13 13.500l4 4"/></g>',
  pasteitje: '<path class="t" d="M4 20.500a12 12 0 0 1 24 0z"/><path d="M4 20.500h24"/><path d="M7.500 14l-1.700-1.700M11 10.500L10 8.300M16 9.200V6.800M21 10.500l1-2.200M24.500 14l1.700-1.700"/>',
  wrap: '<path d="M10 28V10c0-3 2.700-5 6-5s6 2 6 5v18c-4 1-8 1-12 0z"/><path class="t" d="M10 10c0-3 2.700-5 6-5s6 2 6 5-2.700 3.200-6 3.200S10 13 10 10z"/><path d="M10 18l12 4.500M10 23l12 4.500"/>',
  taco: '<path class="t" d="M6 14.500c1-3 3-4 5-3 1-3 5-3 6 0 2-2 5-1 5 2 2 0 4 1 4.500 3.500"/><path d="M3 23.500a13 13 0 0 1 26 0z"/><path d="M8.500 23.500a7.500 7.500 0 0 1 15 0"/>',
  pita: '<path class="t" d="M7 13c0-3 2-5 4-4 1-3 4-3 5-1 2-2 5-1 5 2 2-1 4 0 4 3z"/><path d="M4 13h24a12 12 0 0 1-24 0z"/><circle class="f" cx="13" cy="10.500" r="1.200"/><circle class="f" cx="19.500" cy="10.800" r="1.200"/>',
  kebab: '<path d="M16 3v26M11 29h10"/><path class="t" d="M10 8h12l-2 16h-8z"/><path d="M10.600 12h10.800M11.200 16h9.600M11.800 20h8.400"/>',
  tajine: '<path class="t" d="M7 23c1-7 5-13 9-16 4 3 8 9 9 16z"/><circle cx="16" cy="5.300" r="1.600"/><path d="M4 23h24a3 3 0 0 1-3 3.500H7A3 3 0 0 1 4 23z"/>',
  chili: '<path class="t" d="M9 9c6-1 12 3 14 9 1 4-1 8-4 9 0-6-4-12-10-13-2.200 0-2.200-4 0-5z"/><path d="M9 9c0-2 1-4 3-5"/>',
  bonen: '<ellipse class="t" cx="10" cy="11" rx="4" ry="5.500" transform="rotate(-30 10 11)"/><ellipse class="t" cx="21.500" cy="13" rx="4" ry="5.500" transform="rotate(25 21.500 13)"/><ellipse class="t" cx="14" cy="22" rx="4" ry="5.500" transform="rotate(70 14 22)"/><path d="M8.500 9c-.8 1.200-.8 2.500 0 3.800M22.500 11c.8 1.200.8 2.500 0 3.800M12 21.500c1.200.9 2.600.9 3.800 0"/>',
  wortel: '<path class="t" d="M6 26.500c1-6 5-12.500 10-15.500 3 1 5 3 6 6-3 5-9 9.500-16 9.500z"/><path d="M19 13c0-4 2-7 5-8M21 14.500c3-2 6-2 8 0M12.500 17l2 2M10 21.500l2 2"/>',
  broccoli: '<path class="t" d="M9 15a4 4 0 0 1 2-7.200 5 5 0 0 1 10 0A4 4 0 0 1 23 15z"/><path d="M13 15c0 5 1 9 0 12.500h6c-1-3.500 0-7.500 0-12.500"/>',
  blad: '<path class="t" d="M5 27C5 14 12 6 27 5c-1 15-9 22-22 22z"/><path d="M5 27L20.500 11.500M12 20v-6.500M12 20h6.500"/>',
  tomaat: '<circle class="t" cx="16" cy="18.500" r="10"/><path d="M16 9V5M11.500 9.500c1.500 1 3 1 4.500-1 1.500 2 3 2 4.500 1M12.500 6.500L16 9l3.500-2.500"/>',
  aubergine: '<path class="t" d="M19 9.500c-7 1-13.500 6.500-13 12.500.4 5 6.500 6.500 11.500 2.500 5-4 7.500-9.500 5.500-14z"/><path class="f" d="M17 9.500c1.500-2.500 5-3 7.500-.5l-1.800 3.200-2.200-1.700-1.500 1.800z"/><path d="M22 7.500l2.500-4"/>',
  paddenstoel: '<path class="t" d="M4 16c0-6 5-10 12-10s12 4 12 10z"/><path d="M12 16v7a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-7"/>',
  pompoen: '<ellipse class="t" cx="16" cy="19" rx="12" ry="9"/><path d="M16 10c-3 2-5 6-5 9s2 7 5 9M16 10c3 2 5 6 5 9s-2 7-5 9M16 10V6.500c0-1.200 1-2.200 3-2.200"/>',
  appel: '<path class="t" d="M16 10.500c-3-2-9-1-10 5-1 6.500 4 12.500 7 12.500 1.500 0 2-.8 3-.8s1.500.8 3 .8c3 0 8-6 7-12.500-1-6-7-7-10-5z"/><path d="M16 10.500c0-3 1-5 4-6"/>',
  banaan: '<path class="t" d="M5 9.500c1 10 9 17 21 16 2.200 0 2.200-3.200 0-3.200C17.500 22 11 16.500 9 8.500c-.6-2-4-1-4 1z"/><path d="M6.500 7.800L5.500 5"/>',
  kersen: '<circle class="t" cx="10" cy="22" r="5.200"/><circle class="t" cx="22" cy="23" r="5.200"/><path d="M10 16.800c1-6 5-10 12-12M22 17.800c0-5 0-9 0-13"/>',
  pudding: '<path class="t" d="M9 22c0-7 2-11 7-11s7 4 7 11z"/><path class="f" d="M11 14c1-2 2.800-3 5-3s4 1 5 3c-1.200 1-3 1.500-5 1.500s-3.800-.5-5-1.500z"/><path d="M5 22h22v1a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/>',
  ijs: '<path d="M9 14l7 15 7-15z"/><path class="t" d="M8 14a8 8 0 0 1 16 0z"/><path d="M12.500 20.500l7.500-6.500M15 25.500l6.500-11.500"/>',
  gebak: '<path class="t" d="M4 15.500l22-8.500v8.500z"/><path d="M4 15.500h22v10H4z"/><path d="M4 20.500h22"/><circle class="f" cx="22" cy="5.500" r="2"/>',
  koek: '<circle class="t" cx="16" cy="16" r="11.500"/><path class="d" d="M11 12h.01M19 10.500h.01M21.500 17.500h.01M13 19.500h.01M17 23h.01M16 15h.01"/>',
  donut: '<path class="t" fill-rule="evenodd" d="M16 4.500a11.500 11.500 0 1 0 0 23 11.500 11.500 0 0 0 0-23zm0 8a3.500 3.500 0 1 1 0 7 3.500 3.500 0 0 1 0-7z"/><path class="s" d="M9 11l1.500 1M21 8l-.5 1.800M24 17h-1.800M12 23.500l.8-1.600M20.500 23l-1-1.500"/>',
  grill: '<path class="s" d="M12 3.500c-1.500 2 1.500 3 0 5M20 3.500c-1.500 2 1.500 3 0 5"/><path class="t" d="M5 13h22a11 9 0 0 1-22 0z"/><path d="M11 21.500L8 29M21 21.500l3 7.500M9.500 26h13"/>',
  kroket: '<rect class="t" x="3.500" y="11" width="25" height="10" rx="5"/><path class="d" d="M9 15h.01M13 17.500h.01M17 14.500h.01M21 17h.01M24.500 14.500h.01"/>',
  spek: '<path class="t" d="M4 11c3-3 5 3 8 0s5 3 8 0 5 3 8 0v10c-3 3-5-3-8 0s-5-3-8 0-5-3-8 0z"/><path d="M4 16c3-3 5 3 8 0s5 3 8 0 5 3 8 0"/>',
  platbrood: '<path class="t" d="M16 4c5 0 9.500 6.500 9.500 13.500 0 6-4 10.500-9.500 10.500s-9.500-4.500-9.500-10.500C6.500 10.500 11 4 16 4z"/><path d="M12 12l2 1.500M18.500 10l1.500 2M11.500 19l2.500-1M18 17.500l2 2M14.500 23.500l2.500-.5"/>',
  paella: '<circle class="t" cx="16" cy="16" r="10"/><path d="M6 16H2M26 16h4"/><path class="d" d="M12 12.500h.01M19.500 12h.01M21 18.500h.01M13 20h.01M17 16.500h.01"/><path class="s" d="M10.500 17.500c1-1.500 2.500-1.500 3 0M17.500 21.500c1-1.500 2.500-1.500 3 0"/>',
  dip: '<path class="t" d="M4 16.500h24c0 6-5 10.500-12 10.500S4 22.500 4 16.500z"/><path d="M15 16.500l5.500-12 6.500 9-2.500 3"/><path class="s" d="M8 16.500c1.200-2 4-2 5.200 0"/>',
  mais: '<path d="M10.500 19c-3 1-5.500 4.500-5.500 9 4 0 7-1 9-3.500M21.500 19c3 1 5.500 4.500 5.500 9-4 0-7-1-9-3.500"/><path class="t" d="M16 3c4 2 6 7 6 12s-2 10-6 12c-4-2-6-7-6-12s2-10 6-12z"/><path d="M12 8.500h8M10.500 12.500h11M10.500 16.500h11M11.500 20.500h9M16 4v22"/>',
  avocado: '<path class="t" d="M16 4c-3 0-5 3-6 7-1 3-4 5-4 10 0 5 4 8 10 8s10-3 10-8c0-5-3-7-4-10-1-4-3-7-6-7z"/><circle class="f" cx="16" cy="20" r="3.800"/>',

  // ---------- Knoppen en menu ----------
  kalender: '<rect class="t" x="5" y="7" width="22" height="20" rx="3"/><path d="M5 13h22M11 4v6M21 4v6"/><path class="d" d="M11 18h.01M16 18h.01M21 18h.01M11 22.500h.01M16 22.500h.01"/>',
  ster: '<path class="t" d="M16 4l3.700 7.500 8.300 1.200-6 5.800 1.400 8.300L16 22.900l-7.400 3.900 1.400-8.300-6-5.800 8.300-1.200z"/>',
  mand: '<path d="M11 13l4-8M21 13l-4-8"/><path class="t" d="M4 13h24l-2.500 12.500a2 2 0 0 1-2 1.500h-15a2 2 0 0 1-2-1.500z"/><path d="M12 17.500v5M16 17.500v5M20 17.500v5"/>',
  medaille: '<path d="M11 3l5 9 5-9M8 3h16"/><circle class="t" cx="16" cy="20" r="8"/><path d="M16 16.500l1.200 2.300 2.500.4-1.800 1.800.4 2.500-2.300-1.200-2.300 1.200.4-2.500-1.800-1.800 2.500-.4z"/>',
  tandwiel: '<circle cx="16" cy="16" r="8"/><circle class="t" cx="16" cy="16" r="3.500"/><path stroke-width="3.400" d="M16 4.500v1.500M16 26v1.500M4.500 16H6M26 16h1.500M7.900 7.900l1 1M23.100 23.100l1 1M24.100 7.900l-1 1M8.900 23.100l-1 1"/>',
  wereld: '<circle class="t" cx="16" cy="16" r="12"/><path d="M4 16h24M16 4c-4 3.500-4 20.500 0 24M16 4c4 3.500 4 20.500 0 24"/>',
  dobbelsteen: '<rect class="t" x="5" y="5" width="22" height="22" rx="5"/><path class="d" d="M11 11h.01M21 11h.01M16 16h.01M11 21h.01M21 21h.01"/>',
  samen: '<circle class="t" cx="11" cy="11" r="4.500"/><circle class="t" cx="22" cy="12.500" r="3.700"/><path d="M3 27c0-5 3.500-8 8-8s8 3 8 8M22 19.500c4 0 7 2.500 7 7"/>',
  bliksem: '<path class="t" d="M18 3L6 18h8l-2 11 12-15h-8z"/>',
  klok: '<circle class="t" cx="16" cy="17" r="10.500"/><path d="M16 11v6.500l4 2.500M13 3.500h6M16 3.500v3"/>',
  beker: '<path class="t" d="M9 5h14v7a7 7 0 0 1-14 0z"/><path d="M9 7H5c0 4 1.500 6 4.500 6.500M23 7h4c0 4-1.500 6-4.500 6.500M16 19v5M11 27h10M12.500 24h7"/>',
  kroon: '<path class="t" d="M4 24L6 9l6 6 4-9 4 9 6-6 2 15z"/><path d="M4 27.500h24"/>',
  koksmuts: '<path class="t" d="M9 19c-4 0-6-2.500-6-5.500S5.500 8 9 8.500C10 5.500 12.500 4 16 4s6 1.500 7 4.500c3.500-.5 6 2 6 5s-2 5.500-6 5.500z"/><path d="M9 19v8h14v-8M9 23.500h14"/>',
  mes: '<path class="t" d="M4 26L20 10l3 3c-4 7-10 11-19 13z"/><path d="M21.500 11.500l5-5a2.100 2.100 0 0 0-3-3l-5 5z"/>',
  kompas: '<circle cx="16" cy="16" r="12"/><path class="t" d="M21.500 10.500l-3.200 7.800-7.800 3.200 3.200-7.800z"/><path class="d" d="M16 16h.01"/>',
  vlam: '<path class="t" d="M16 3c1 5 7.500 8 7.500 15.500a7.500 7.500 0 0 1-15 0c0-3 1.500-5.200 3.200-6.800.4 2 1.300 3.200 2.500 3.800C13.800 11 14 7 16 3z"/><path class="s" d="M16 26a3.200 3.200 0 0 1-3.200-3.200c0-1.900 1.400-2.900 3.200-5.300 1.800 2.400 3.200 3.400 3.200 5.300A3.200 3.200 0 0 1 16 26z"/>',
  potlood: '<path class="t" d="M5 27l1.500-6.500L21 6l5 5L11.500 25.500z"/><path d="M18 9l5 5M6.500 20.500l5 5"/>',
  zoek: '<circle class="t" cx="14" cy="14" r="8.500"/><path d="M20.300 20.300l7.200 7.200"/>',
  telefoon: '<rect class="t" x="9" y="3.500" width="14" height="25" rx="3"/><path d="M14 7.500h4"/><path class="d" d="M16 24.500h.01"/>',
  vraag: '<circle class="t" cx="16" cy="16" r="12"/><path d="M12.500 13a3.500 3.500 0 1 1 5.300 3c-1.200.7-1.800 1.500-1.800 2.800"/><path class="d" d="M16 22.500h.01"/>',
  maan: '<path class="t" d="M26.500 18.500A11.500 11.500 0 1 1 13.500 5.500a9 9 0 0 0 13 13z"/>',
  wissel: '<path d="M6 13a10.500 10.500 0 0 1 19.500-3.500M26 19a10.500 10.500 0 0 1-19.500 3.500"/><path d="M26 4v5.500h-5.500M6 28v-5.500h5.500"/>',
  camera: '<path class="t" d="M4 10.500h5l2-3h10l2 3h5v15H4z"/><circle cx="16" cy="17.500" r="4.500"/>',
  waarschuwing: '<path class="t" d="M16 4.500L29 26.500H3z"/><path d="M16 13v6.500"/><path class="d" d="M16 23h.01"/>',
  kruis: '<path d="M9 9l14 14M23 9L9 23"/>',
};

// Maakt de tekening op: <svg> met de lijnen van het gevraagde pictogram.
function iconSvg(key) {
  return `<svg class="ic" viewBox="0 0 32 32" aria-hidden="true">${ICON_ART[key] || ICON_ART.bord}</svg>`;
}

// Welk pictogram bij welk gerecht hoort: [pictogram, naam, woorden]. Het pictogram bij het woord dat een
// gerecht het best typeert wint (zie iconKey). De woorden staan zonder hoofdletters en accenten; een patroon
// wordt gebruikt waar een kort woord anders te vaak raak is ("ijs" zit ook in "rijst").
const ICON_RULES = [
  ['pizza', 'Pizza', ['pizza', 'calzone', 'flammkuchen']],
  ['hamburger', 'Hamburger', ['hamburger', 'burger']],
  ['friet', 'Friet', ['friet', 'patat']],
  ['pannenkoek', 'Pannenkoeken', [/pannenkoek(en|jes|je)?/, 'pancake', 'crepe', 'flensje']],
  ['poffertjes', 'Poffertjes en oliebollen', ['poffertje', 'oliebol', 'beignet', 'deegballetje', 'deegbol', 'deegblokje', /gefrituurde? (plat )?deeg\b/]],
  ['wafel', 'Wafel', ['wafel']],
  ['spaghetti', 'Pasta', ['spaghetti', 'pasta', 'macaroni', 'penne', 'tagliatelle', 'ravioli', 'tortellini', 'gnocchi', 'carbonara', 'bolognese']],
  ['lasagne', 'Lasagne', ['lasagne', 'moussaka']],
  ['noedels', 'Noedels', ['bami', 'noedel', 'noodle', 'ramen', /\bmie\b/]],
  ['curry', 'Curry', ['curry', 'kerrie', 'tikka', 'masala', 'korma', 'rendang']],
  ['rijst', 'Rijst en granen', ['nasi', 'rijst', 'risotto', 'couscous', 'bulgur', 'quinoa', 'gierst', 'sorghum']],
  ['paella', 'Paella', ['paella']],
  ['wok', 'Wok', ['roerbak', 'wok']],
  ['sushi', 'Sushi', ['sushi', 'sashimi']],
  ['spies', 'Spies', ['sate', 'spies']],
  ['kebab', 'Kebab', ['shoarma', 'doner', 'kebab', 'gyros', 'kapsalon', /\bspit\b/]],
  ['pita', 'Pita', ['pita']],
  ['kroket', 'Kroket', ['bitterbal', 'kroket', 'croqueta']],
  ['dumpling', 'Dumpling', ['dumpling', 'gyoza', 'wonton', 'deegkussentje', 'deegbuidel', 'deegbootje', 'maultaschen']],
  ['pasteitje', 'Pasteitje', ['pasteitje', 'empanada', 'samosa', 'sambusa', 'sambuus', 'pakketje', 'deegflap', 'deeghapje']],
  ['loempia', 'Loempia', ['loempia', 'koolrol', 'deegrol']],
  ['wrap', 'Wrap', ['wrap', 'burrito', 'tortilla', 'fajita', 'enchilada', 'quesadilla']],
  ['taco', 'Taco', ['taco']],
  ['salade', 'Salade', ['salade', 'gado gado', 'rauwkost', 'bowl', /\bsla\b/]],
  ['soep', 'Soep', ['soep', 'bouillon']],
  ['pap', 'Pap en yoghurt', ['havermout', 'yoghurt', 'kwark', 'muesli', 'granola', 'cruesli', 'oats', 'skyr', 'griesmeel', /pap\b/]],
  ['stoofpot', 'Stoofpot', ['stoof', 'stoofvlees', 'hachee', 'goulash', 'ragout', 'jachtschotel']],
  ['tajine', 'Tajine', ['tajine']],
  ['chili', 'Chili', ['chili']],
  ['stamppot', 'Stamppot', ['stamppot', 'hutspot', 'puree', 'gestampt']],
  ['aardappel', 'Aardappel en knollen', [/aardappel(koekjes?)?/, 'rosti', 'cassave', 'broodvrucht', /taro\b/, /\byam/, /\bknol/]],
  ['ovenschotel', 'Ovenschotel', ['ovenschotel', 'schotel', 'gratin']],
  ['taart', 'Hartige taart', ['quiche', 'taart', 'pastei', 'bladerdeeg', /[a-z]+opita\b/, /\bpie\b/]],
  ['blad', 'Bladgroente', ['witlof', 'spinazie', 'andijvie', 'snijbiet', 'bladgroente', 'druivenblad', 'zuurkool', /bladeren\b/, /\bkool\b/]],
  ['aubergine', 'Aubergine', ['ratatouille', 'aubergine']],
  ['tomaat', 'Tomaat', [/\btomaat\b/, /\btomaten\b/, 'tomatensalade']],
  ['wortel', 'Wortel', ['wortel']],
  ['pompoen', 'Pompoen', ['pompoen']],
  ['mais', 'Maïs', [/\bmais\b/, 'maiskolf', 'maispuree']],
  ['avocado', 'Avocado', ['avocado', 'guacamole']],
  ['bonen', 'Bonen en linzen', ['bonen', 'boontjes', 'linzen', 'kikkererwt', 'erwten']],
  ['broccoli', 'Groente', ['broccoli', 'bloemkool', 'groente', 'okra']],
  ['paddenstoel', 'Paddenstoelen', ['champignon', 'paddenstoel']],
  ['zalm', 'Zalm', ['zalm', 'forel']],
  ['vis', 'Vis', ['vis', 'kibbeling', 'tonijn', 'kabeljauw', 'bakkeljauw', 'haring', 'makreel', 'lekkerbek', 'sardine', 'sardinha', 'karper', 'tilapia', 'brasem', 'baars', 'snapper']],
  ['garnaal', 'Garnalen', ['garnaal', 'garnalen', 'scampi', 'gamba']],
  ['schelp', 'Schelpdieren', ['mossel', 'schelp', 'oester', 'kokkel', 'zeeslak']],
  ['krab', 'Krab en kreeft', ['krab', 'kreeft', 'langoest']],
  ['inktvis', 'Inktvis', ['octopus', 'inktvis', 'calamares']],
  ['kip', 'Kip en gevogelte', ['kip', 'kalkoen', 'drumstick', 'eend']],
  ['vlees', 'Vlees', ['vlees', 'biefstuk', 'steak', 'entrecote', 'schnitzel', 'karbonade', 'kotelet', 'rollade', 'ribs', 'varken', /\bham\b/, /\blam\b/, /\bgeit\b/]],
  ['gehaktbal', 'Gehakt en balletjes', ['gehaktbal', 'vleesbal', 'slavink', 'falafel', 'balletje', /\bballen\b/, /(?<!fijn)gehakt\b/]],
  ['worst', 'Worst', ['worst', 'wurst', 'gehaktrolletje']],
  ['spek', 'Spek', ['spek', 'bacon']],
  ['grill', 'Van de grill', ['barbecue', 'houtskool', 'gegrild', /\bgrill\b/]],
  ['kaas', 'Kaas', ['kaas', 'fondue', 'raclette', 'halloumi']],
  ['omelet', 'Omelet', ['omelet', 'roerei', 'frittata']],
  ['ei', 'Ei', ['spiegelei', 'uitsmijter', 'eieren', /\bei\b/]],
  ['tosti', 'Tosti', ['tosti']],
  ['sandwich', 'Belegd brood', ['sandwich', 'broodje', 'hotdog']],
  ['stokbrood', 'Stokbrood', ['stokbrood', 'baguette']],
  ['platbrood', 'Platbrood', ['platbrood', 'chapati', 'lavash', /\bplat(te)? ?bro(od|den)/, /\bnaan\b/, /\broti\b/]],
  ['brood', 'Brood', ['boterham', 'brood', 'toast', 'beschuit', 'cracker', /\bbroden\b/]],
  ['croissant', 'Croissant', ['croissant']],
  ['dip', 'Dip', ['hummus', 'hoemoes', 'tzatziki', 'ganoush', /\bdip(saus)?\b/]],
  ['banaan', 'Banaan', ['banaan', 'bananen']],
  ['appel', 'Fruit', ['appel', 'fruit', 'mango', 'ananas']],
  ['kersen', 'Bessen en kersen', ['kersen', 'bessen', 'bosbes', 'aardbei', 'framboos', 'frambozen']],
  ['pudding', 'Toetje', ['pudding', 'pavlova', 'tiramisu', 'custard', 'zoetigheid', /\bvla\b/, /\bflan\b/]],
  ['ijs', 'IJs', ['roomijs', 'schaafijs', /\bijs(je)?\b/]],
  ['gebak', 'Gebak', [/gebak\b/, /cake\b/, 'cupcake', 'muffin', 'brownie', 'strudel']],
  ['koek', 'Koek', [/koekjes?\b/, 'biscuit']],
  ['donut', 'Donut', ['donut']],
  ['smoothie', 'Smoothie', ['smoothie', 'shake']],
];
// Het pictogram als alleen de soort van een gerecht bekend is.
const TYPE_KEY = { vlees: 'vlees', vis: 'vis', vega: 'blad' };

// Zonder hoofdletters en accenten, zodat "creme" ook "crème" vindt.
function searchKey(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Het pictogram bij het woord dat een tekst het best typeert. In een samenstelling is dat het laatste
// woorddeel ("kipsalade" is een salade); een woord dat in een langer woord zit telt niet mee.
function bestKey(text) {
  const matches = [];
  for (const [key, , words] of ICON_RULES) {
    for (const word of words) {
      const start = word instanceof RegExp ? text.search(word) : text.lastIndexOf(word);
      if (start === -1) continue;
      const length = word instanceof RegExp ? text.match(word)[0].length : word.length;
      matches.push({ key, start, end: start + length });
    }
  }
  const outer = matches.filter(a => !matches.some(b =>
    b.end - b.start > a.end - a.start && b.start <= a.start && b.end >= a.end));
  outer.sort((a, b) => b.start - a.start);
  return outer.length ? outer[0].key : '';
}

// Het begin van een naam of omschrijving zegt het meest: "zalm met rijst" is zalm. De tekst wordt daarom in
// stukken geknipt bij woorden als "met" en bij komma's; het eerste stuk waar een pictogram bij past telt.
function guessKey(text) {
  for (const part of searchKey(text).split(/,| (?:met|op|uit|in|van|en|of|bij) /)) {
    const key = bestKey(part);
    if (key) return key;
  }
  return '';
}

// Gerechten waarvan de naam of de omschrijving de app op het verkeerde been zet: hier staat het pictogram erbij.
const ICON_FIX = {
  'or lam': 'stoofpot', 'bamia': 'stoofpot', 'mullah bamia': 'stoofpot', 'matazeez': 'stoofpot', 'oxtail': 'stoofpot',
  'sel roti': 'donut', 'papanași': 'donut', 'ablo': 'rijst', 'la bandera': 'rijst', 'payagua mascada': 'aardappel',
  "shepherd's pie": 'ovenschotel', 'gyuvech': 'ovenschotel', 'turli tava': 'ovenschotel',
  'koláče': 'gebak', 'vastlakukkel': 'gebak', 'korvapuusti': 'gebak', 'parené buchty': 'gebak', 'kanelbulle': 'gebak',
  'panipopo': 'gebak', 'quesadilla salvadoreña': 'gebak', 'rellenitos': 'gebak',
  'mustikkapiirakka': 'taart', 'burek': 'taart', 'black pudding': 'worst', 'pudding and souse': 'vlees',
  'judd mat gaardebounen': 'vlees', 'plato típico': 'vlees', 'passatelli in brodo': 'soep', 'chili crab': 'krab',
  'capitaine': 'vis', 'fish cakes': 'vis', 'broodvrucht met jackfish': 'vis', 'ngai ngai': 'vis',
  'patacones': 'banaan', 'johnny cakes': 'brood', 'johnnycake': 'brood', 'sopa paraguaya': 'brood',
  'tortilla española': 'omelet', 'mapo tofu': 'wok', 'bobotie': 'ovenschotel',
  'guava duff': 'pudding', 'cendol': 'ijs', 'halo-halo': 'ijs', 'dolma': 'blad', 'full english breakfast': 'ei',
};
// "Gegrild" zegt hoe iets is klaargemaakt, niet wat het is: dat telt alleen als er niets beters is.
const WEAK_KEYS = new Set(['grill']);
// Woorden waaraan je in de omschrijving ziet dat een gerecht zonder vlees of vis iets zoets is.
const SWEET_TEXT = /\bzoete?\b(?! aardappel)|honing|siroop|stroop|suiker|\bjam\b|chocolade|karamel|custard|dadel/;

// Het pictogram van een gerecht: passend bij de naam, anders bij de omschrijving, anders bij de soort.
function iconKey(name, text, type) {
  if (Object.hasOwn(ICON_FIX, name.toLowerCase())) return ICON_FIX[name.toLowerCase()];
  const found = [guessKey(name), text ? guessKey(text) : ''].filter(Boolean);
  const sweet = type === 'vega' && text && SWEET_TEXT.test(searchKey(text));
  return found.find(key => !WEAK_KEYS.has(key)) || found[0] || (sweet ? 'gebak' : '') || TYPE_KEY[type] || 'bord';
}

// De pictogrammen die je zelf bij een gerecht kunt kiezen: [pictogram, naam].
const DISH_ICONS = [['bord', 'Bord'], ...ICON_RULES.map(([key, label]) => [key, label])];

// De plaatjes (emoji) die de app gebruikte voor er getekende pictogrammen waren, met het pictogram dat erop
// lijkt. De algemene plaatjes voor vlees, vis, groente en het bordje staan er niet bij: die kiest de app zelf.
const OLD_ICONS = {
  '🍕': 'pizza', '🍔': 'hamburger', '🍟': 'friet', '🥞': 'pannenkoek', '🍝': 'spaghetti', '🍜': 'noedels',
  '🍛': 'curry', '🍚': 'rijst', '🍣': 'sushi', '🍢': 'spies', '🥙': 'kebab', '🧆': 'kroket', '🥟': 'dumpling',
  '🌯': 'wrap', '🌮': 'taco', '🥗': 'salade', '🥣': 'soep', '🍲': 'stoofpot', '🌶️': 'chili', '🥔': 'aardappel',
  '🥘': 'ovenschotel', '🥧': 'taart', '🥬': 'blad', '🍆': 'aubergine', '🍤': 'garnaal', '🐙': 'inktvis',
  '🍗': 'kip', '🥩': 'vlees', '🧀': 'kaas', '🍳': 'ei', '🥪': 'sandwich', '🍞': 'brood', '🥐': 'croissant',
  '🧇': 'wafel', '🍮': 'pudding', '🍰': 'gebak', '🥤': 'smoothie', '🍄': 'paddenstoel',
};

// Het pictogram van een gerecht uit de wereldkeuken op naam, of niets als het daar niet staat. De lijst
// wordt pas opgebouwd als iemand ernaar vraagt.
let worldIcons = null;
function worldIconKey(name) {
  if (!worldIcons) {
    worldIcons = new Map();
    for (const rows of Object.values(WORLD_DISHES)) {
      for (const row of rows) {
        const [dish, text, type] = row.split('|');
        worldIcons.set(dish.toLowerCase(), iconKey(dish, text, { l: 'vlees', v: 'vis', g: 'vega' }[type]));
      }
    }
  }
  return worldIcons.get(name.toLowerCase()) || '';
}

// Het pictogram dat bij een gerecht is opgeslagen; leeg betekent dat de app zelf kiest. Een plaatje van voor
// de getekende pictogrammen wordt omgezet: past er nu een pictogram bij de naam, dan kiest de app weer zelf;
// anders komt het uit de wereldkeuken, of het wordt het pictogram dat op het oude plaatje lijkt.
function cleanIcon(icon, name) {
  if (DISH_ICONS.some(([key]) => key === icon)) return icon;
  if (!icon || iconKey(name, '', '') !== 'bord') return '';
  return worldIconKey(name) || (Object.hasOwn(OLD_ICONS, icon) ? OLD_ICONS[icon] : '');
}
