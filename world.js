'use strict';

// Gegevens voor de wereldkeuken: welke landen er zijn en hoe ze in het kaartbestand heten.
// De kaart zelf staat in countries-50m.json: uit het project world-atlas (© Mike Bostock, ISC-licentie),
// gemaakt van de vrij te gebruiken kaartgegevens van Natural Earth.

// Werelddelen: naam en het stuk kaart dat je ziet als je erop inzoomt ([west, oost, zuid, noord]).
const REGIONS = {
  europa: ['Europa', [-25, 45, 34, 71]],
  azie: ['Azië', [26, 150, -11, 55]],
  afrika: ['Afrika', [-20, 54, -36, 38]],
  'noord-amerika': ['Noord-Amerika', [-168, -52, 6, 72]],
  'zuid-amerika': ['Zuid-Amerika', [-83, -33, -56, 13]],
  oceanie: ['Oceanië', [110, 180, -48, 4]],
};

// Landen op het nummer waaronder ze in het kaartbestand staan: [landcode, Nederlandse naam, werelddeel].
// Gebieden die hier niet staan (onbewoonde eilanden, overzeese gebieden) zijn op de kaart niet aan te tikken.
const COUNTRY_BY_NUMBER = {
  // Europa
  '008': ['AL', 'Albanië', 'europa'], '020': ['AD', 'Andorra', 'europa'], '040': ['AT', 'Oostenrijk', 'europa'],
  '112': ['BY', 'Belarus', 'europa'], '056': ['BE', 'België', 'europa'], '070': ['BA', 'Bosnië en Herzegovina', 'europa'],
  '100': ['BG', 'Bulgarije', 'europa'], '191': ['HR', 'Kroatië', 'europa'], '196': ['CY', 'Cyprus', 'europa'],
  '203': ['CZ', 'Tsjechië', 'europa'], '208': ['DK', 'Denemarken', 'europa'], '233': ['EE', 'Estland', 'europa'],
  '246': ['FI', 'Finland', 'europa'], '250': ['FR', 'Frankrijk', 'europa'], '276': ['DE', 'Duitsland', 'europa'],
  '300': ['GR', 'Griekenland', 'europa'], '348': ['HU', 'Hongarije', 'europa'], '352': ['IS', 'IJsland', 'europa'],
  '372': ['IE', 'Ierland', 'europa'], '380': ['IT', 'Italië', 'europa'], '428': ['LV', 'Letland', 'europa'],
  '438': ['LI', 'Liechtenstein', 'europa'], '440': ['LT', 'Litouwen', 'europa'], '442': ['LU', 'Luxemburg', 'europa'],
  '470': ['MT', 'Malta', 'europa'], '498': ['MD', 'Moldavië', 'europa'], '492': ['MC', 'Monaco', 'europa'],
  '499': ['ME', 'Montenegro', 'europa'], '528': ['NL', 'Nederland', 'europa'], '807': ['MK', 'Noord-Macedonië', 'europa'],
  '578': ['NO', 'Noorwegen', 'europa'], '616': ['PL', 'Polen', 'europa'], '620': ['PT', 'Portugal', 'europa'],
  '642': ['RO', 'Roemenië', 'europa'], '643': ['RU', 'Rusland', 'europa'], '674': ['SM', 'San Marino', 'europa'],
  '688': ['RS', 'Servië', 'europa'], '703': ['SK', 'Slowakije', 'europa'], '705': ['SI', 'Slovenië', 'europa'],
  '724': ['ES', 'Spanje', 'europa'], '752': ['SE', 'Zweden', 'europa'], '756': ['CH', 'Zwitserland', 'europa'],
  '804': ['UA', 'Oekraïne', 'europa'], '826': ['GB', 'Verenigd Koninkrijk', 'europa'], '336': ['VA', 'Vaticaanstad', 'europa'],
  // Azië
  '004': ['AF', 'Afghanistan', 'azie'], '051': ['AM', 'Armenië', 'azie'], '031': ['AZ', 'Azerbeidzjan', 'azie'],
  '048': ['BH', 'Bahrein', 'azie'], '050': ['BD', 'Bangladesh', 'azie'], '064': ['BT', 'Bhutan', 'azie'],
  '096': ['BN', 'Brunei', 'azie'], '116': ['KH', 'Cambodja', 'azie'], '156': ['CN', 'China', 'azie'],
  '268': ['GE', 'Georgië', 'azie'], '356': ['IN', 'India', 'azie'], '360': ['ID', 'Indonesië', 'azie'],
  '364': ['IR', 'Iran', 'azie'], '368': ['IQ', 'Irak', 'azie'], '376': ['IL', 'Israël', 'azie'],
  '392': ['JP', 'Japan', 'azie'], '400': ['JO', 'Jordanië', 'azie'], '398': ['KZ', 'Kazachstan', 'azie'],
  '414': ['KW', 'Koeweit', 'azie'], '417': ['KG', 'Kirgizië', 'azie'], '418': ['LA', 'Laos', 'azie'],
  '422': ['LB', 'Libanon', 'azie'], '458': ['MY', 'Maleisië', 'azie'], '462': ['MV', 'Malediven', 'azie'],
  '496': ['MN', 'Mongolië', 'azie'], '104': ['MM', 'Myanmar', 'azie'], '524': ['NP', 'Nepal', 'azie'],
  '408': ['KP', 'Noord-Korea', 'azie'], '512': ['OM', 'Oman', 'azie'], '586': ['PK', 'Pakistan', 'azie'],
  '275': ['PS', 'Palestina', 'azie'], '608': ['PH', 'Filipijnen', 'azie'], '634': ['QA', 'Qatar', 'azie'],
  '682': ['SA', 'Saoedi-Arabië', 'azie'], '702': ['SG', 'Singapore', 'azie'], '410': ['KR', 'Zuid-Korea', 'azie'],
  '144': ['LK', 'Sri Lanka', 'azie'], '760': ['SY', 'Syrië', 'azie'], '158': ['TW', 'Taiwan', 'azie'],
  '762': ['TJ', 'Tadzjikistan', 'azie'], '764': ['TH', 'Thailand', 'azie'], '626': ['TL', 'Oost-Timor', 'azie'],
  '792': ['TR', 'Turkije', 'azie'], '795': ['TM', 'Turkmenistan', 'azie'], '784': ['AE', 'Verenigde Arabische Emiraten', 'azie'],
  '860': ['UZ', 'Oezbekistan', 'azie'], '704': ['VN', 'Vietnam', 'azie'], '887': ['YE', 'Jemen', 'azie'],
  // Afrika
  '012': ['DZ', 'Algerije', 'afrika'], '024': ['AO', 'Angola', 'afrika'], '204': ['BJ', 'Benin', 'afrika'],
  '072': ['BW', 'Botswana', 'afrika'], '854': ['BF', 'Burkina Faso', 'afrika'], '108': ['BI', 'Burundi', 'afrika'],
  '132': ['CV', 'Kaapverdië', 'afrika'], '120': ['CM', 'Kameroen', 'afrika'], '140': ['CF', 'Centraal-Afrikaanse Republiek', 'afrika'],
  '148': ['TD', 'Tsjaad', 'afrika'], '174': ['KM', 'Comoren', 'afrika'], '178': ['CG', 'Congo-Brazzaville', 'afrika'],
  '180': ['CD', 'Congo-Kinshasa', 'afrika'], '384': ['CI', 'Ivoorkust', 'afrika'], '262': ['DJ', 'Djibouti', 'afrika'],
  '818': ['EG', 'Egypte', 'afrika'], '226': ['GQ', 'Equatoriaal-Guinea', 'afrika'], '232': ['ER', 'Eritrea', 'afrika'],
  '748': ['SZ', 'Eswatini', 'afrika'], '231': ['ET', 'Ethiopië', 'afrika'], '266': ['GA', 'Gabon', 'afrika'],
  '270': ['GM', 'Gambia', 'afrika'], '288': ['GH', 'Ghana', 'afrika'], '324': ['GN', 'Guinee', 'afrika'],
  '624': ['GW', 'Guinee-Bissau', 'afrika'], '404': ['KE', 'Kenia', 'afrika'], '426': ['LS', 'Lesotho', 'afrika'],
  '430': ['LR', 'Liberia', 'afrika'], '434': ['LY', 'Libië', 'afrika'], '450': ['MG', 'Madagaskar', 'afrika'],
  '454': ['MW', 'Malawi', 'afrika'], '466': ['ML', 'Mali', 'afrika'], '478': ['MR', 'Mauritanië', 'afrika'],
  '480': ['MU', 'Mauritius', 'afrika'], '504': ['MA', 'Marokko', 'afrika'], '508': ['MZ', 'Mozambique', 'afrika'],
  '516': ['NA', 'Namibië', 'afrika'], '562': ['NE', 'Niger', 'afrika'], '566': ['NG', 'Nigeria', 'afrika'],
  '646': ['RW', 'Rwanda', 'afrika'], '678': ['ST', 'Sao Tomé en Principe', 'afrika'], '686': ['SN', 'Senegal', 'afrika'],
  '690': ['SC', 'Seychellen', 'afrika'], '694': ['SL', 'Sierra Leone', 'afrika'], '706': ['SO', 'Somalië', 'afrika'],
  '710': ['ZA', 'Zuid-Afrika', 'afrika'], '728': ['SS', 'Zuid-Soedan', 'afrika'], '729': ['SD', 'Soedan', 'afrika'],
  '834': ['TZ', 'Tanzania', 'afrika'], '768': ['TG', 'Togo', 'afrika'], '788': ['TN', 'Tunesië', 'afrika'],
  '800': ['UG', 'Oeganda', 'afrika'], '894': ['ZM', 'Zambia', 'afrika'], '716': ['ZW', 'Zimbabwe', 'afrika'],
  // Noord-Amerika, Midden-Amerika en het Caribisch gebied
  '028': ['AG', 'Antigua en Barbuda', 'noord-amerika'], '044': ['BS', 'Bahama\'s', 'noord-amerika'], '052': ['BB', 'Barbados', 'noord-amerika'],
  '084': ['BZ', 'Belize', 'noord-amerika'], '124': ['CA', 'Canada', 'noord-amerika'], '188': ['CR', 'Costa Rica', 'noord-amerika'],
  '192': ['CU', 'Cuba', 'noord-amerika'], '212': ['DM', 'Dominica', 'noord-amerika'], '214': ['DO', 'Dominicaanse Republiek', 'noord-amerika'],
  '222': ['SV', 'El Salvador', 'noord-amerika'], '308': ['GD', 'Grenada', 'noord-amerika'], '320': ['GT', 'Guatemala', 'noord-amerika'],
  '332': ['HT', 'Haïti', 'noord-amerika'], '340': ['HN', 'Honduras', 'noord-amerika'], '388': ['JM', 'Jamaica', 'noord-amerika'],
  '484': ['MX', 'Mexico', 'noord-amerika'], '558': ['NI', 'Nicaragua', 'noord-amerika'], '591': ['PA', 'Panama', 'noord-amerika'],
  '659': ['KN', 'Saint Kitts en Nevis', 'noord-amerika'], '662': ['LC', 'Saint Lucia', 'noord-amerika'],
  '670': ['VC', 'Saint Vincent en de Grenadines', 'noord-amerika'], '780': ['TT', 'Trinidad en Tobago', 'noord-amerika'],
  '840': ['US', 'Verenigde Staten', 'noord-amerika'], '533': ['AW', 'Aruba', 'noord-amerika'], '531': ['CW', 'Curaçao', 'noord-amerika'],
  // Zuid-Amerika
  '032': ['AR', 'Argentinië', 'zuid-amerika'], '068': ['BO', 'Bolivia', 'zuid-amerika'], '076': ['BR', 'Brazilië', 'zuid-amerika'],
  '152': ['CL', 'Chili', 'zuid-amerika'], '170': ['CO', 'Colombia', 'zuid-amerika'], '218': ['EC', 'Ecuador', 'zuid-amerika'],
  '328': ['GY', 'Guyana', 'zuid-amerika'], '600': ['PY', 'Paraguay', 'zuid-amerika'], '604': ['PE', 'Peru', 'zuid-amerika'],
  '740': ['SR', 'Suriname', 'zuid-amerika'], '858': ['UY', 'Uruguay', 'zuid-amerika'], '862': ['VE', 'Venezuela', 'zuid-amerika'],
  // Oceanië
  '036': ['AU', 'Australië', 'oceanie'], '242': ['FJ', 'Fiji', 'oceanie'], '296': ['KI', 'Kiribati', 'oceanie'],
  '584': ['MH', 'Marshalleilanden', 'oceanie'], '583': ['FM', 'Micronesia', 'oceanie'], '520': ['NR', 'Nauru', 'oceanie'],
  '554': ['NZ', 'Nieuw-Zeeland', 'oceanie'], '585': ['PW', 'Palau', 'oceanie'], '598': ['PG', 'Papoea-Nieuw-Guinea', 'oceanie'],
  '882': ['WS', 'Samoa', 'oceanie'], '090': ['SB', 'Salomonseilanden', 'oceanie'], '776': ['TO', 'Tonga', 'oceanie'],
  '548': ['VU', 'Vanuatu', 'oceanie'],
};

// Gebieden die in het kaartbestand geen nummer hebben, op de naam uit dat bestand. Noord-Cyprus en
// Somaliland horen op de kaart bij Cyprus en Somalië.
const COUNTRY_BY_MAP_NAME = { 'Kosovo': 'XK', 'N. Cyprus': 'CY', 'Somaliland': 'SO' };

// Landen zonder eigen nummer in het kaartbestand, of die er niet op staan: [Nederlandse naam, werelddeel].
const EXTRA_COUNTRIES = { XK: ['Kosovo', 'europa'], TV: ['Tuvalu', 'oceanie'] };

// Alle landen op landcode: [Nederlandse naam, werelddeel].
const COUNTRIES = { ...EXTRA_COUNTRIES };
for (const [code, name, region] of Object.values(COUNTRY_BY_NUMBER)) COUNTRIES[code] = [name, region];

// Gerechten per land, op landcode; world-dishes.js vult dit.
const WORLD_DISHES = {};
