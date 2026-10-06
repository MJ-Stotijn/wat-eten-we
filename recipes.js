'use strict';

// Recepten bij de gerechten uit de lijst met bekende gerechten (CATALOG in app.js), voor twee personen.
// Ze zijn zelf geschreven en bewust eenvoudig gehouden: een startpunt dat de gebruiker kan aanpassen.
// Per gerecht: de ingrediënten (gescheiden door |) en de stappen (elk op een eigen regel).
// De ingrediënten passen bij de allergenen en diëten die in app.js bij het gerecht staan: in een gerecht
// zonder gluten of melk in die lijst staat hier dus ook geen bloem, bouillonblokje of boter.
const RECIPES = {
  // Ontbijt
  'Havermout': [
    '80 g havermout|400 ml melk|1 banaan|1 tl kaneel|1 el honing',
    'Doe de havermout met de melk in een pannetje en breng al roerend aan de kook.\nLaat 3 tot 5 minuten zachtjes koken tot de pap dik is.\nSnijd de banaan in plakjes.\nVerdeel de pap over twee kommen en maak af met de banaan, de kaneel en de honing.',
  ],
  'Yoghurt met muesli': [
    '400 g yoghurt|100 g muesli|150 g vers fruit (bijvoorbeeld aardbeien of blauwe bessen)|1 el honing',
    'Was het fruit en snijd grote stukken kleiner.\nVerdeel de yoghurt over twee kommen.\nStrooi de muesli erover en leg het fruit erop.\nSchenk er een beetje honing over.',
  ],
  'Kwark met fruit': [
    '400 g magere kwark|200 g vers fruit (bijvoorbeeld aardbeien, banaan of blauwe bessen)|1 el honing|1 tl kaneel',
    'Was het fruit en snijd het in stukjes.\nVerdeel de kwark over twee kommen.\nLeg het fruit erop.\nMaak af met de honing en een beetje kaneel.',
  ],
  'Overnight oats': [
    '80 g havermout|200 ml melk|100 g yoghurt|1 el chiazaad|1 el honing|100 g blauwe bessen|20 g amandelen',
    'Meng de havermout, de melk, de yoghurt, het chiazaad en de honing in een kom.\nVerdeel het mengsel over twee potjes en zet ze afgedekt een nacht in de koelkast.\nRoer de volgende ochtend even door.\nMaak af met de blauwe bessen en de grof gehakte amandelen.',
  ],
  'Volkorenbrood met ei': [
    '4 sneetjes volkorenbrood|4 eieren|boter om te smeren|1 tomaat|peper en zout',
    'Kook de eieren in 7 minuten halfzacht of in 9 minuten hard.\nLaat ze schrikken onder koud water en pel ze.\nBesmeer het brood dun met boter.\nSnijd de eieren en de tomaat in plakjes en verdeel ze over het brood.\nBestrooi met peper en zout.',
  ],
  'Boterham met kaas': [
    '4 sneetjes brood|boter om te smeren|4 plakken kaas|een kwart komkommer|1 tomaat',
    'Besmeer het brood dun met boter.\nBeleg elke boterham met een plak kaas.\nSnijd de komkommer en de tomaat in plakjes.\nLeg ze op de kaas of eet ze erbij.',
  ],
  'Boterham met pindakaas': [
    '4 sneetjes volkorenbrood|4 el pindakaas|1 banaan of een kwart komkommer',
    'Besmeer het brood met de pindakaas.\nSnijd de banaan of de komkommer in plakjes.\nLeg de plakjes op de pindakaas.',
  ],
  'Omelet': [
    '4 eieren|2 el melk|1 el boter|50 g geraspte kaas|1 tomaat|verse bieslook of peterselie|peper en zout',
    'Klop de eieren los met de melk, peper en zout.\nSnijd de tomaat in blokjes.\nSmelt de boter in een koekenpan en schenk het ei erin.\nLaat op laag vuur stollen en verdeel de tomaat en de kaas erover.\nVouw de omelet dubbel als de bovenkant bijna gestold is en bestrooi met de kruiden.',
  ],
  'Roerei met toast': [
    '4 eieren|2 el melk|1 el boter|4 sneetjes brood|verse bieslook|peper en zout',
    'Rooster het brood.\nKlop de eieren los met de melk, peper en zout.\nSmelt de boter in een koekenpan op laag vuur en schenk het ei erin.\nRoer rustig tot het ei net gestold maar nog smeuïg is.\nSchep het roerei op de toast en bestrooi met bieslook.',
  ],
  'Smoothie met banaan': [
    '2 rijpe bananen|300 ml melk|150 g yoghurt|150 g bevroren fruit (bijvoorbeeld aardbeien of bosvruchten)',
    'Pel de bananen en breek ze in stukken.\nDoe alle ingrediënten in een blender.\nMix tot een gladde smoothie.\nSchenk in twee glazen en drink meteen.',
  ],
  'Griesmeelpap': [
    '500 ml melk|50 g griesmeel|2 el suiker|1 zakje vanillesuiker|1 tl kaneel',
    'Breng de melk met de suiker en de vanillesuiker zachtjes aan de kook.\nStrooi al roerend het griesmeel erbij.\nLaat 3 tot 5 minuten zachtjes koken en blijf roeren tot de pap dik is.\nVerdeel over twee kommen en bestrooi met kaneel.',
  ],
  'Croissant met jam': [
    '4 croissants|4 el jam|boter om te smeren',
    'Verwarm de oven voor op 180 graden.\nWarm de croissants 5 minuten op in de oven.\nSnijd ze open.\nBesmeer ze met boter en jam.',
  ],
  'Bananenbrood': [
    '3 rijpe bananen|2 eieren|75 g gesmolten boter|100 g suiker|200 g bloem|2 tl bakpoeder|1 tl kaneel|50 g walnoten|snuf zout',
    'Verwarm de oven voor op 175 graden en bekleed een cakevorm met bakpapier.\nPrak de bananen met een vork en roer de eieren, de boter en de suiker erdoor.\nMeng de bloem, het bakpoeder, de kaneel en het zout en spatel dit door het beslag.\nRoer de grof gehakte walnoten erdoor en schenk het beslag in de vorm.\nBak het brood in ongeveer 55 minuten gaar: een prikker komt er dan droog uit.\nLaat afkoelen en snijd in plakken. Je hebt genoeg voor meerdere dagen.',
  ],

  // Middageten
  'Tosti': [
    '4 sneetjes brood|4 plakken kaas|1 tomaat|1 el boter|ketchup om te dippen',
    'Beleg twee sneetjes brood met de kaas en plakjes tomaat.\nLeg de andere sneetjes erop en besmeer de buitenkant dun met boter.\nBak de tosti\'s in een tosti-ijzer of in een koekenpan in ongeveer 3 minuten per kant goudbruin.\nSnijd ze schuin door en eet ze met ketchup.',
  ],
  'Uitsmijter': [
    '4 sneetjes brood|4 eieren|4 plakken ham|4 plakken kaas|1 el boter|peper en zout',
    'Leg het brood op twee borden en beleg het met de ham en de kaas.\nSmelt de boter in een koekenpan.\nBreek de eieren erin en bak ze in 3 tot 4 minuten tot spiegeleieren.\nLeg de eieren op het brood en bestrooi met peper en zout.',
  ],
  'Broodje gezond': [
    '2 pistolets of bruine bolletjes|boter om te smeren|2 plakken ham|2 plakken kaas|1 ei|1 tomaat|een kwart komkommer|een paar blaadjes sla',
    'Kook het ei in 9 minuten hard, laat het schrikken en pel het.\nSnijd het ei, de tomaat en de komkommer in plakjes.\nSnijd de broodjes open en besmeer ze met boter.\nBeleg ze met de sla, de ham, de kaas, het ei, de tomaat en de komkommer.',
  ],
  'Tonijnsalade op brood': [
    '1 blikje tonijn op water (160 g)|2 el mayonaise|1 lente-ui|1 el citroensap|4 sneetjes brood|een paar blaadjes sla|peper',
    'Laat de tonijn uitlekken en prak hem fijn met een vork.\nSnijd de lente-ui in dunne ringetjes.\nMeng de tonijn met de mayonaise, de lente-ui, het citroensap en wat peper.\nLeg de sla op het brood en verdeel de tonijnsalade erover.',
  ],
  'Wrap met kip en groenten': [
    '4 tortillawraps|250 g kipfilet|1 rode paprika|een halve komkommer|een paar blaadjes sla|4 el crème fraîche|1 tl paprikapoeder|1 el olijfolie|peper en zout',
    'Snijd de kip in reepjes en bestrooi met het paprikapoeder, peper en zout.\nBak de kip in de olie in ongeveer 6 minuten goudbruin en gaar.\nSnijd de paprika en de komkommer in reepjes.\nVerwarm de wraps kort in een droge koekenpan.\nBesmeer ze met de crème fraîche, beleg met de sla, de groenten en de kip en rol ze op.',
  ],
  'Kipsalade': [
    '250 g kipfilet|150 g gemengde sla|een halve komkommer|2 tomaten|2 eieren|3 el yoghurt|1 el mayonaise|1 tl mosterd|1 el olijfolie|peper en zout',
    'Kook de eieren in 9 minuten hard, laat ze schrikken en pel ze.\nBestrooi de kip met peper en zout en bak hem in de olie in ongeveer 8 minuten gaar. Snijd in plakjes.\nSnijd de komkommer, de tomaten en de eieren in stukken.\nRoer een dressing van de yoghurt, de mayonaise en de mosterd.\nVerdeel de sla over twee borden, leg de groenten, het ei en de kip erop en schenk de dressing erover.',
  ],
  'Salade met kikkererwten en feta': [
    '1 blik kikkererwten (400 g)|150 g feta|een halve komkommer|2 tomaten|1 rode ui|2 el olijfolie|1 el citroensap|1 tl mosterd|verse peterselie|peper en zout',
    'Spoel de kikkererwten af en laat ze uitlekken.\nSnijd de komkommer en de tomaten in blokjes en de ui in dunne ringen.\nRoer een dressing van de olie, het citroensap, de mosterd, peper en zout.\nMeng de kikkererwten met de groenten en de dressing.\nVerkruimel de feta erover en bestrooi met peterselie.',
  ],
  'Couscoussalade': [
    '150 g couscous|een halve komkommer|2 tomaten|1 rode paprika|100 g feta|verse munt of peterselie|2 el olijfolie|2 el citroensap|peper en zout',
    'Doe de couscous met een snuf zout in een kom en schenk er 200 ml kokend water op.\nLaat 5 minuten afgedekt staan en roer los met een vork.\nSnijd de komkommer, de tomaten en de paprika in kleine blokjes.\nMeng de groenten met de couscous, de olie en het citroensap.\nVerkruimel de feta erover en bestrooi met de fijngesneden kruiden.',
  ],
  'Tomatensoep': [
    '1 blik tomatenblokjes (400 g)|4 verse tomaten|1 ui|1 teen knoflook|500 ml groentebouillon|1 el tomatenpuree|1 el olijfolie|4 el kookroom|verse basilicum|peper en zout',
    'Snipper de ui en de knoflook en snijd de tomaten in stukken.\nFruit de ui en de knoflook in de olie en bak de tomatenpuree kort mee.\nVoeg de verse tomaten, de tomatenblokjes en de bouillon toe.\nLaat de soep 15 minuten zachtjes koken.\nPureer de soep met een staafmixer en breng op smaak met peper en zout.\nSchenk in kommen en maak af met de room en basilicum.',
  ],
  'Groentesoep met linzen': [
    '100 g rode linzen|2 wortels|1 prei|1 ui|1 teen knoflook|1 blik tomatenblokjes (400 g)|750 ml groentebouillon|1 tl komijn|1 el olijfolie|peper en zout',
    'Snipper de ui en de knoflook en snijd de wortels en de prei in stukjes.\nFruit de ui en de knoflook in de olie en bak de komijn kort mee.\nVoeg de wortel, de prei, de linzen, de tomatenblokjes en de bouillon toe.\nLaat de soep 20 minuten zachtjes koken tot de linzen en de wortel zacht zijn.\nBreng op smaak met peper en zout.',
  ],
  'Kippensoep': [
    '300 g kipfilet|2 wortels|1 prei|1 ui|1 liter kippenbouillon|50 g vermicelli|verse peterselie|peper en zout',
    'Breng de bouillon aan de kook en leg de kip erin.\nLaat de kip in 15 minuten zachtjes gaar worden.\nSnijd intussen de wortels, de prei en de ui in kleine stukjes.\nHaal de kip uit de pan en trek het vlees met twee vorken uit elkaar.\nKook de groenten 10 minuten in de bouillon en voeg de laatste 3 minuten de vermicelli toe.\nDoe de kip terug in de soep, breng op smaak en bestrooi met peterselie.',
  ],
  'Pompoensoep': [
    '600 g pompoen (flespompoen of oranje pompoen)|1 ui|1 wortel|1 teen knoflook|600 ml groentebouillon|1 el olijfolie|4 el crème fraîche|1 tl komijn|peper en zout',
    'Schil zo nodig de pompoen, verwijder de pitten en snijd het vruchtvlees in blokjes.\nSnipper de ui en de knoflook en snijd de wortel in plakjes.\nFruit de ui en de knoflook in de olie en bak de komijn kort mee.\nVoeg de pompoen, de wortel en de bouillon toe en kook alles in 20 minuten zacht.\nPureer de soep met een staafmixer en breng op smaak met peper en zout.\nSchenk in kommen en maak af met de crème fraîche.',
  ],
  'Erwtensoep': [
    '250 g spliterwten|1 liter water|1 speklap of varkenshamlap (ongeveer 150 g)|1 rookworst|200 g knolselderij|1 prei|1 wortel|1 aardappel|1 ui|peper en zout',
    'Spoel de spliterwten af en breng ze met het water en het vlees aan de kook. Schep het schuim eraf.\nLaat 45 minuten zachtjes koken en roer af en toe.\nSnijd de knolselderij, de prei, de wortel, de aardappel en de ui in kleine blokjes en voeg ze toe.\nKook de soep nog 30 minuten tot ze dik is en roer regelmatig.\nHaal het vlees uit de pan, snijd het klein en doe het terug.\nWarm de rookworst de laatste 10 minuten mee in de soep, snijd hem in plakjes en breng de soep op smaak.',
  ],
  'Pannenkoeken': [
    '200 g bloem|400 ml melk|2 eieren|snuf zout|boter om in te bakken|stroop of poedersuiker',
    'Doe de bloem en het zout in een kom en maak een kuiltje in het midden.\nBreek de eieren erin en schenk de helft van de melk erbij.\nKlop tot een glad beslag en roer de rest van de melk erdoor.\nSmelt een klontje boter in een koekenpan en schenk er een dunne laag beslag in.\nBak de pannenkoek op middelhoog vuur in ongeveer 2 minuten per kant goudbruin.\nBak zo alle pannenkoeken en eet ze met stroop of poedersuiker.',
  ],
  'Poffertjes': [
    '125 g bloem|1 tl bakpoeder|1 ei|200 ml melk|snuf zout|boter om in te bakken en voor erbij|poedersuiker',
    'Meng de bloem, het bakpoeder en het zout in een kom.\nKlop het ei en de melk erdoor tot een glad beslag.\nVerhit de poffertjespan en vet de kuiltjes in met boter.\nVul de kuiltjes voor driekwart met beslag en bak de poffertjes in ongeveer 2 minuten goudbruin.\nKeer ze met een vork en bak de andere kant nog 1 minuut.\nEet ze warm met een klontje boter en poedersuiker.',
  ],
  'Quiche met groenten': [
    '5 plakjes bladerdeeg|1 prei|200 g broccoli|1 rode paprika|3 eieren|200 ml kookroom|100 g geraspte kaas|1 el olijfolie|peper en zout',
    'Verwarm de oven voor op 200 graden en laat het bladerdeeg ontdooien.\nSnijd de prei in ringen, de broccoli in kleine roosjes en de paprika in blokjes.\nBak de groenten 5 minuten in de olie.\nBekleed een ingevette taartvorm met het bladerdeeg en prik er gaatjes in met een vork.\nKlop de eieren los met de room, de helft van de kaas, peper en zout.\nVerdeel de groenten over het deeg, schenk het eimengsel erover en bestrooi met de rest van de kaas.\nBak de quiche in ongeveer 35 minuten goudbruin en gaar. Wat over is, smaakt de volgende dag ook goed.',
  ],
  'Pokébowl met zalm': [
    '150 g sushirijst|200 g verse zalmfilet (geschikt om rauw te eten)|1 avocado|een halve komkommer|100 g edamame (sojabonen)|1 wortel|3 el sojasaus|1 el limoensap|1 tl sesamolie|1 el sesamzaad',
    'Kook de sushirijst volgens de verpakking en laat hem afkoelen.\nSnijd de zalm in blokjes en meng met 1 eetlepel sojasaus en de sesamolie.\nKook de edamame 3 minuten en spoel ze koud.\nSnijd de avocado en de komkommer in stukken en rasp de wortel.\nVerdeel de rijst over twee kommen en leg de zalm en de groenten erop.\nMeng de rest van de sojasaus met het limoensap, schenk dit erover en bestrooi met sesamzaad.',
  ],

  // Avondeten
  'Spaghetti bolognese': [
    '200 g spaghetti|300 g rundergehakt|1 ui|2 tenen knoflook|1 wortel|1 stengel bleekselderij|1 blik tomatenblokjes (400 g)|1 el tomatenpuree|2 tl Italiaanse kruiden|1 el olijfolie|40 g Parmezaanse kaas|peper en zout',
    'Snipper de ui en de knoflook en snijd de wortel en de bleekselderij in kleine blokjes.\nBak het gehakt rul in de olie en bak de ui, de knoflook, de wortel en de selderij 5 minuten mee.\nRoer de tomatenpuree, de tomatenblokjes en de kruiden erdoor.\nLaat de saus minstens 20 minuten zachtjes pruttelen en breng op smaak met peper en zout.\nKook intussen de spaghetti volgens de verpakking.\nSchep de saus over de spaghetti en bestrooi met geraspte Parmezaanse kaas.',
  ],
  'Pasta met champignons': [
    '200 g pasta (bijvoorbeeld tagliatelle)|400 g champignons|1 ui|2 tenen knoflook|200 ml kookroom|40 g Parmezaanse kaas|1 el olijfolie|verse peterselie|peper en zout',
    'Kook de pasta volgens de verpakking.\nSnijd de champignons in plakjes en snipper de ui en de knoflook.\nBak de champignons in de olie op hoog vuur goudbruin.\nBak de ui en de knoflook 2 minuten mee en schenk de room erbij.\nLaat de saus 5 minuten zachtjes inkoken en breng op smaak met peper en zout.\nMeng de pasta door de saus en bestrooi met de kaas en de peterselie.',
  ],
  'Pasta pesto met kip': [
    '200 g penne|250 g kipfilet|4 el groene pesto|200 g cherrytomaten|50 g rucola|30 g Parmezaanse kaas|1 el olijfolie|peper en zout',
    'Kook de penne volgens de verpakking.\nSnijd de kip in blokjes en bestrooi met peper en zout.\nBak de kip in de olie in ongeveer 6 minuten goudbruin en gaar.\nHalveer de cherrytomaten en bak ze de laatste minuut mee.\nMeng de uitgelekte pasta met de pesto en de kip.\nSchep de rucola erdoor en bestrooi met de kaas.',
  ],
  'Pasta met zalm en spinazie': [
    '200 g tagliatelle|250 g zalmfilet|300 g verse spinazie|2 tenen knoflook|150 ml kookroom|1 el citroensap|1 el olijfolie|peper en zout',
    'Kook de tagliatelle volgens de verpakking.\nSnijd de zalm in blokjes en hak de knoflook fijn.\nBak de zalm in de olie in 3 minuten rondom aan en haal hem uit de pan.\nFruit de knoflook kort en laat de spinazie in delen slinken.\nSchenk de room en het citroensap erbij en laat 2 minuten zachtjes koken.\nSchep de zalm en de pasta erdoor en breng op smaak met peper en zout.',
  ],
  'Macaroni met ham en kaas': [
    '200 g macaroni|150 g hamblokjes|1 prei|1 rode paprika|25 g boter|25 g bloem|300 ml melk|100 g geraspte kaas|peper en nootmuskaat',
    'Kook de macaroni volgens de verpakking.\nSnijd de prei in ringen en de paprika in blokjes en bak ze 5 minuten in een klontje van de boter.\nSmelt de rest van de boter in een steelpan, roer de bloem erdoor en laat 1 minuut garen.\nSchenk al roerend beetje bij beetje de melk erbij tot een gladde saus.\nRoer de helft van de kaas erdoor en breng op smaak met peper en nootmuskaat.\nMeng de macaroni met de saus, de groenten en de ham en bestrooi met de rest van de kaas.',
  ],
  'Lasagne': [
    '8 lasagnebladen|300 g rundergehakt|1 ui|2 tenen knoflook|1 wortel|1 blik tomatenblokjes (400 g)|1 el tomatenpuree|2 tl Italiaanse kruiden|30 g boter|30 g bloem|400 ml melk|100 g geraspte kaas|1 el olijfolie|peper en zout',
    'Verwarm de oven voor op 180 graden.\nSnipper de ui en de knoflook en rasp de wortel. Bak het gehakt rul in de olie en bak de groenten mee.\nRoer de tomatenpuree, de tomatenblokjes en de kruiden erdoor en laat 15 minuten pruttelen.\nSmelt de boter, roer de bloem erdoor en schenk al roerend de melk erbij tot een gladde witte saus.\nMaak lagen in een ovenschaal: gehaktsaus, lasagnebladen en witte saus. Herhaal en eindig met witte saus.\nBestrooi met de kaas en bak de lasagne in ongeveer 40 minuten goudbruin.\nLaat 5 minuten rusten voor het aansnijden.',
  ],
  'Groentelasagne': [
    '8 lasagnebladen|1 courgette|1 aubergine|1 rode paprika|200 g verse spinazie|1 ui|2 tenen knoflook|500 ml gezeefde tomaten|2 tl Italiaanse kruiden|250 g ricotta|1 bol mozzarella|50 g geraspte kaas|2 el olijfolie|peper en zout',
    'Verwarm de oven voor op 180 graden.\nSnijd de courgette, de aubergine en de paprika in blokjes en snipper de ui en de knoflook.\nBak de groenten 8 minuten in de olie en laat de spinazie er op het laatst door slinken.\nRoer de gezeefde tomaten en de kruiden erdoor en breng op smaak met peper en zout.\nMaak lagen in een ovenschaal: groentesaus, lasagnebladen en ricotta. Herhaal en eindig met saus.\nVerdeel de mozzarella in plakjes en de geraspte kaas erover.\nBak de lasagne in ongeveer 40 minuten goudbruin.',
  ],
  'Kip met broccoli en aardappelen': [
    '300 g kipfilet|400 g broccoli|500 g aardappelen|1 el boter|1 tl paprikapoeder|peper en zout',
    'Schil de aardappelen, snijd ze in stukken en kook ze in 20 minuten gaar.\nVerdeel de broccoli in roosjes en kook ze in 5 minuten beetgaar.\nBestrooi de kip met het paprikapoeder, peper en zout.\nBak de kip in de boter in ongeveer 4 minuten per kant goudbruin en gaar.\nSchep de aardappelen, de broccoli en de kip op de borden en schenk het bakvet erover.',
  ],
  'Gehaktbal met sperziebonen': [
    '300 g half-om-halfgehakt|1 ei|3 el paneermeel|1 kleine ui|1 tl mosterd|snuf nootmuskaat|30 g boter|400 g sperziebonen|500 g aardappelen|peper en zout',
    'Snipper de ui fijn en kneed hem door het gehakt met het ei, het paneermeel, de mosterd, de nootmuskaat, peper en zout.\nVorm 4 ballen.\nBak de ballen in de boter rondom bruin, voeg een scheut water toe en laat ze met de deksel schuin op de pan 20 minuten zachtjes garen.\nSchil de aardappelen en kook ze in 20 minuten gaar.\nKook de sperziebonen in 8 minuten beetgaar.\nSchep alles op de borden en schenk de jus uit de pan erover.',
  ],
  'Gevulde kipfilet uit de oven': [
    '2 kipfilets|100 g kruidenroomkaas|100 g verse spinazie|6 plakjes ontbijtspek|1 el olijfolie|300 g sperziebonen|peper',
    'Verwarm de oven voor op 190 graden.\nLaat de spinazie kort slinken in een pan en knijp het vocht eruit.\nSnijd de kipfilets in de lengte in, zodat er een zakje ontstaat.\nVul ze met de roomkaas en de spinazie en wikkel het ontbijtspek eromheen.\nLeg de kip in een ovenschaal, besprenkel met de olie en bestrooi met peper.\nBak de kip in ongeveer 25 minuten gaar.\nKook intussen de sperziebonen in 8 minuten beetgaar en eet ze erbij.',
  ],
  'Kipcurry met rijst': [
    '150 g rijst|300 g kipfilet|1 el rode currypasta|400 ml kokosmelk|1 rode paprika|150 g sperziebonen|1 ui|1 el vissaus|1 el zonnebloemolie|verse koriander',
    'Kook de rijst volgens de verpakking.\nSnijd de kip in blokjes, de paprika in reepjes, de ui in ringen en de sperziebonen in stukken.\nBak de currypasta 1 minuut in de olie en bak de kip 3 minuten mee.\nVoeg de ui, de paprika, de sperziebonen en de kokosmelk toe.\nLaat de curry 10 minuten zachtjes koken tot de kip gaar is.\nBreng op smaak met de vissaus en eet de curry met de rijst en wat koriander.',
  ],
  'Kip kerrie met rijst en boontjes': [
    '150 g rijst|300 g kipfilet|1 ui|1 el kerriepoeder|25 g boter|25 g bloem|300 ml kippenbouillon|100 ml melk|300 g sperziebonen|peper en zout',
    'Kook de rijst volgens de verpakking en de sperziebonen in 8 minuten beetgaar.\nSnijd de kip in blokjes en snipper de ui.\nBak de kip en de ui in de boter in 5 minuten goudbruin.\nRoer het kerriepoeder en de bloem erdoor en laat 1 minuut meebakken.\nSchenk al roerend de bouillon en de melk erbij tot een gladde saus.\nLaat de saus 10 minuten zachtjes koken, breng op smaak en eet met de rijst en de boontjes.',
  ],
  'Groentecurry': [
    '150 g rijst|1 kleine bloemkool|1 zoete aardappel|1 blik kikkererwten (400 g)|200 g verse spinazie|400 ml kokosmelk|1 ui|2 tenen knoflook|2 cm verse gember|1 el kerriepoeder|1 el zonnebloemolie|peper en zout',
    'Kook de rijst volgens de verpakking.\nVerdeel de bloemkool in roosjes en snijd de zoete aardappel in blokjes.\nSnipper de ui en hak de knoflook en de gember fijn.\nFruit de ui, de knoflook en de gember in de olie en bak het kerriepoeder 1 minuut mee.\nVoeg de bloemkool, de zoete aardappel, de kokosmelk en 100 ml water toe en kook 15 minuten zachtjes.\nRoer de uitgelekte kikkererwten en de spinazie erdoor, warm nog 3 minuten door en breng op smaak.',
  ],
  'Pompoencurry': [
    '150 g rijst|500 g pompoen|1 blik kikkererwten (400 g)|400 ml kokosmelk|150 g verse spinazie|1 ui|2 tenen knoflook|2 cm verse gember|1 el kerriepoeder|1 el zonnebloemolie|peper en zout',
    'Kook de rijst volgens de verpakking.\nSchil zo nodig de pompoen en snijd hem in blokjes.\nSnipper de ui en hak de knoflook en de gember fijn.\nFruit de ui, de knoflook en de gember in de olie en bak het kerriepoeder 1 minuut mee.\nVoeg de pompoen, de kokosmelk en 100 ml water toe en kook 15 minuten zachtjes tot de pompoen zacht is.\nRoer de uitgelekte kikkererwten en de spinazie erdoor, warm nog 3 minuten door en breng op smaak.',
  ],
  'Stamppot boerenkool': [
    '700 g kruimige aardappelen|300 g gesneden boerenkool|1 rookworst|100 ml melk|25 g boter|1 el mosterd|peper, zout en nootmuskaat',
    'Schil de aardappelen en snijd ze in stukken.\nDoe ze in een grote pan, leg de boerenkool erop en zet net onder water.\nKook alles in ongeveer 20 minuten gaar.\nWarm de rookworst volgens de verpakking.\nGiet de aardappelen en de boerenkool af en stamp ze met de melk en de boter tot een stamppot.\nBreng op smaak met peper, zout en nootmuskaat en eet met de rookworst en de mosterd.',
  ],
  'Hutspot': [
    '600 g kruimige aardappelen|400 g winterwortel|2 uien|1 rookworst|100 ml melk|25 g boter|peper, zout en nootmuskaat',
    'Schil de aardappelen en de wortels en snijd ze in stukken. Snijd de uien grof.\nDoe alles in een grote pan, zet net onder water en kook in ongeveer 25 minuten gaar.\nWarm de rookworst volgens de verpakking.\nGiet af en stamp alles met de melk en de boter tot een grove stamppot.\nBreng op smaak met peper, zout en nootmuskaat en eet met de rookworst.',
  ],
  'Zuurkoolstamppot': [
    '700 g kruimige aardappelen|400 g zuurkool|1 rookworst|100 g spekblokjes|100 ml melk|25 g boter|1 el mosterd|peper en zout',
    'Schil de aardappelen en snijd ze in stukken.\nDoe ze in een grote pan, leg de uitgelekte zuurkool erop en zet net onder water.\nKook alles in ongeveer 20 minuten gaar.\nBak de spekblokjes knapperig en warm de rookworst volgens de verpakking.\nGiet af en stamp alles met de melk en de boter tot een stamppot.\nRoer de spekjes erdoor, breng op smaak en eet met de rookworst en de mosterd.',
  ],
  'Andijviestamppot': [
    '700 g kruimige aardappelen|400 g gesneden andijvie|150 g spekblokjes|100 ml melk|25 g boter|peper, zout en nootmuskaat',
    'Schil de aardappelen, snijd ze in stukken en kook ze in 20 minuten gaar.\nBak de spekblokjes knapperig.\nGiet de aardappelen af en stamp ze met de melk en de boter tot een puree.\nRoer de rauwe andijvie er in delen door, tot hij net geslonken is.\nRoer de spekjes erdoor en breng op smaak met peper, zout en nootmuskaat.',
  ],
  'Hachee': [
    '400 g runderlappen|3 grote uien|30 g boter|1 el bloem|400 ml runderbouillon|2 laurierblaadjes|2 kruidnagels|1 el azijn|1 plak ontbijtkoek|500 g aardappelen|peper en zout',
    'Snijd het vlees in blokjes en bestrooi met peper en zout. Snijd de uien in halve ringen.\nBak het vlees in de boter rondom bruin en bak de uien 5 minuten mee.\nRoer de bloem erdoor en schenk de bouillon en de azijn erbij.\nVoeg de laurier, de kruidnagels en de verkruimelde ontbijtkoek toe.\nLaat de hachee met de deksel op de pan 2 tot 2,5 uur zachtjes stoven tot het vlees uit elkaar valt.\nKook de aardappelen in 20 minuten gaar en eet ze bij de hachee.',
  ],
  'Stoofvlees met rode kool': [
    '400 g runderstoofvlees|2 uien|30 g boter|400 ml runderbouillon|2 laurierblaadjes|1 el mosterd|1 plak ontbijtkoek|1 pot rode kool met appel (ongeveer 350 g)|500 g aardappelen|peper en zout',
    'Snijd het vlees in blokjes en bestrooi met peper en zout. Snijd de uien in ringen.\nBak het vlees in de boter rondom bruin en bak de uien 5 minuten mee.\nSchenk de bouillon erbij en voeg de laurier toe.\nBesmeer de ontbijtkoek met de mosterd en leg hem op het vlees.\nLaat het vlees met de deksel op de pan 2,5 uur zachtjes stoven en roer af en toe.\nKook de aardappelen in 20 minuten gaar, warm de rode kool op en eet alles samen.',
  ],
  'Nasi goreng': [
    '150 g rijst (liefst een dag eerder gekookt)|250 g kipfilet|1 prei|1 wortel|1 ui|2 tenen knoflook|3 el ketjap manis|1 tl sambal|2 eieren|2 el zonnebloemolie|een halve komkommer',
    'Kook de rijst volgens de verpakking en laat hem goed afkoelen.\nSnijd de kip in blokjes, de prei in ringen, de wortel in kleine blokjes en snipper de ui en de knoflook.\nBak de kip in de helft van de olie in een wok goudbruin en bak de groenten 4 minuten mee.\nVoeg de rijst, de ketjap en de sambal toe en bak al roerend 5 minuten op hoog vuur.\nBak in een koekenpan in de rest van de olie twee spiegeleieren.\nEet de nasi met het ei erop en plakjes komkommer erbij.',
  ],
  'Surinaamse nasi met kip': [
    '200 g rijst (een dag eerder gekookt)|4 kippenbouten of 400 g kipdijfilet|4 el sojasaus of ketjap|2 uien|3 tenen knoflook|1 el tomatenpuree|2 takjes selderij|1 bouillonblokje|1 tl sambal|2 el zonnebloemolie|een halve komkommer|peper',
    'Marineer de kip een half uur in de helft van de sojasaus, de helft van de fijngehakte knoflook en peper.\nBak de kip in de helft van de olie rondom bruin, voeg een scheut water toe en laat hem met de deksel op de pan in 40 minuten gaar stoven.\nSnipper de uien en bak ze met de rest van de knoflook in de rest van de olie in een wok.\nRoer de tomatenpuree, de sambal en het verkruimelde bouillonblokje erdoor.\nVoeg de koude rijst en de rest van de sojasaus toe en bak al roerend 8 minuten op hoog vuur.\nRoer de fijngesneden selderij erdoor en eet de nasi met de kip en plakjes komkommer.',
  ],
  'Bami goreng': [
    '200 g mie|250 g kipfilet|1 prei|200 g spitskool|1 wortel|1 ui|2 tenen knoflook|3 el ketjap manis|1 tl sambal|2 eieren|2 el zonnebloemolie',
    'Kook de mie volgens de verpakking en spoel hem koud.\nSnijd de kip in reepjes, de prei in ringen, de kool in reepjes en de wortel in dunne staafjes. Snipper de ui en de knoflook.\nBak de kip in de helft van de olie in een wok goudbruin.\nBak de groenten 5 minuten mee.\nVoeg de mie, de ketjap en de sambal toe en bak al roerend 3 minuten op hoog vuur.\nBak van de eieren in de rest van de olie een omelet, snijd die in reepjes en verdeel ze over de bami.',
  ],
  'Kipsaté met rijst': [
    '150 g rijst|350 g kipdijfilet|4 el ketjap manis|2 tenen knoflook|4 el pindakaas|150 ml water|1 tl chilivlokken|1 el zonnebloemolie|een halve komkommer|4 satéprikkers',
    'Snijd de kip in blokjes en marineer ze minstens 15 minuten in de helft van de ketjap en de fijngehakte knoflook.\nKook de rijst volgens de verpakking.\nRijg de kip aan de prikkers en bak ze in de olie in ongeveer 10 minuten rondom bruin en gaar.\nVerwarm de pindakaas met het water, de rest van de ketjap en de chilivlokken en roer tot een gladde saus.\nEet de saté met de pindasaus, de rijst en plakjes komkommer.',
  ],
  'Gado gado': [
    '200 g sperziebonen|150 g taugé|200 g witte kool|1 wortel|een halve komkommer|300 g aardappelen|2 eieren|200 g tofu|4 el pindakaas|2 el ketjap manis|150 ml water|1 tl chilivlokken|1 el zonnebloemolie',
    'Kook de aardappelen in de schil in 20 minuten gaar en de eieren in 9 minuten hard.\nSnijd de sperziebonen in stukken, de kool in reepjes en de wortel in plakjes.\nKook de sperziebonen, de kool en de wortel in 5 minuten beetgaar en overgiet de taugé met kokend water.\nSnijd de tofu in blokjes en bak ze in de olie goudbruin.\nVerwarm de pindakaas met het water, de ketjap en de chilivlokken tot een gladde saus.\nVerdeel de groenten, de aardappel in plakken, het ei, de komkommer en de tofu over de borden en schenk de pindasaus erover.',
  ],
  'Roerbak met kip en groenten': [
    '150 g rijst|300 g kipfilet|1 rode paprika|200 g broccoli|1 wortel|100 g taugé|2 tenen knoflook|2 cm verse gember|3 el sojasaus|1 el oestersaus|1 tl sesamolie|1 el zonnebloemolie',
    'Kook de rijst volgens de verpakking.\nSnijd de kip in reepjes, de paprika in reepjes, de wortel in dunne plakjes en verdeel de broccoli in kleine roosjes.\nHak de knoflook en de gember fijn.\nVerhit de zonnebloemolie in een wok en bak de kip in 4 minuten goudbruin.\nBak de knoflook, de gember, de broccoli, de wortel en de paprika 4 minuten mee op hoog vuur.\nRoer de taugé, de sojasaus, de oestersaus en de sesamolie erdoor, warm 1 minuut door en eet met de rijst.',
  ],
  'Roerbak met tofu': [
    '150 g rijst|300 g stevige tofu|200 g broccoli|1 rode paprika|150 g peultjes|2 tenen knoflook|2 cm verse gember|3 el sojasaus|1 tl suiker|1 tl sesamolie|2 el zonnebloemolie|1 el sesamzaad',
    'Kook de rijst volgens de verpakking.\nDep de tofu droog en snijd hem in blokjes.\nBak de tofu in de helft van de zonnebloemolie rondom goudbruin en haal hem uit de pan.\nVerdeel de broccoli in kleine roosjes, snijd de paprika in reepjes en hak de knoflook en de gember fijn.\nBak de groenten met de knoflook en de gember 5 minuten op hoog vuur in de rest van de olie.\nRoer de tofu, de sojasaus, de suiker en de sesamolie erdoor, bestrooi met sesamzaad en eet met de rijst.',
  ],
  'Zalm met rijst': [
    '150 g rijst|2 zalmfilets (ongeveer 250 g)|300 g broccoli|1 el olijfolie|1 citroen|verse dille|peper en zout',
    'Kook de rijst volgens de verpakking.\nVerdeel de broccoli in roosjes en kook ze in 5 minuten beetgaar.\nBestrooi de zalm met peper en zout.\nBak de zalm in de olie 4 minuten op de huidkant en nog 2 minuten op de andere kant.\nBesprenkel de zalm met citroensap en bestrooi met dille.\nEet de zalm met de rijst, de broccoli en een partje citroen.',
  ],
  'Vis uit de oven met groenten': [
    '2 kabeljauwfilets (ongeveer 300 g)|1 courgette|1 rode paprika|200 g cherrytomaten|1 rode ui|2 el olijfolie|1 citroen|1 tl gedroogde tijm|peper en zout',
    'Verwarm de oven voor op 200 graden.\nSnijd de courgette in halve plakken, de paprika in stukken en de ui in parten.\nMeng de groenten en de cherrytomaten in een ovenschaal met de helft van de olie, de tijm, peper en zout.\nBak de groenten 15 minuten in de oven.\nLeg de vis op de groenten, besprenkel met de rest van de olie en citroensap en bestrooi met peper en zout.\nBak alles nog 12 tot 15 minuten tot de vis gaar is.',
  ],
  'Kibbeling met friet': [
    '400 g kabeljauwfilet|100 g bloem|150 ml melk|1 ei|2 tl kibbelingkruiden of viskruiden|500 g ovenfriet|zonnebloemolie om te frituren|4 el knoflooksaus of ravigottesaus|1 citroen',
    'Bak de ovenfriet volgens de verpakking.\nSnijd de vis in grove stukken en bestrooi met de helft van de kruiden.\nKlop de bloem, de melk, het ei en de rest van de kruiden tot een dik, glad beslag.\nVerhit een laag olie van ongeveer 3 centimeter in een diepe pan tot 180 graden. Blijf erbij en laat de olie niet walmen.\nHaal de stukken vis door het beslag en bak ze in delen in ongeveer 4 minuten goudbruin.\nLaat ze uitlekken op keukenpapier en eet met de friet, de saus en een partje citroen.',
  ],
  'Chili con carne': [
    '150 g rijst|300 g rundergehakt|1 ui|2 tenen knoflook|1 rode paprika|1 blik kidneybonen (400 g)|1 klein blikje mais|1 blik tomatenblokjes (400 g)|1 el tomatenpuree|2 tl chilipoeder|1 tl komijn|1 el olijfolie|peper en zout',
    'Kook de rijst volgens de verpakking.\nSnipper de ui en de knoflook en snijd de paprika in blokjes.\nBak het gehakt rul in de olie en bak de ui, de knoflook en de paprika 4 minuten mee.\nRoer de tomatenpuree, het chilipoeder en de komijn erdoor.\nVoeg de tomatenblokjes, de uitgelekte bonen en de mais toe.\nLaat de chili 20 minuten zachtjes pruttelen, breng op smaak en eet met de rijst.',
  ],
  'Chili sin carne': [
    '150 g rijst|1 blik kidneybonen (400 g)|1 blik zwarte bonen (400 g)|1 klein blikje mais|1 rode paprika|1 ui|2 tenen knoflook|1 blik tomatenblokjes (400 g)|1 el tomatenpuree|2 tl chilipoeder|1 tl komijn|1 el olijfolie|peper en zout',
    'Kook de rijst volgens de verpakking.\nSnipper de ui en de knoflook en snijd de paprika in blokjes.\nFruit de ui, de knoflook en de paprika 5 minuten in de olie.\nRoer de tomatenpuree, het chilipoeder en de komijn erdoor.\nVoeg de tomatenblokjes, de uitgelekte bonen en de mais toe.\nLaat de chili 20 minuten zachtjes pruttelen, breng op smaak en eet met de rijst.',
  ],
  'Wraps met gehakt': [
    '4 tortillawraps|300 g rundergehakt|1 ui|1 rode paprika|1 klein blikje mais|2 tl paprikapoeder|1 tl komijn|2 tomaten|een paar blaadjes sla|75 g geraspte kaas|4 el crème fraîche|1 el olijfolie|peper en zout',
    'Snipper de ui en snijd de paprika in blokjes.\nBak het gehakt rul in de olie en bak de ui en de paprika 4 minuten mee.\nRoer het paprikapoeder, de komijn en de uitgelekte mais erdoor en breng op smaak met peper en zout.\nSnijd de tomaten in blokjes en de sla in reepjes.\nVerwarm de wraps kort in een droge koekenpan.\nVul ze met het gehakt, de sla, de tomaat, de kaas en de crème fraîche en rol ze op.',
  ],
  'Shoarma met pita': [
    '350 g shoarmavlees|4 pitabroodjes|een kwart krop ijsbergsla|2 tomaten|een halve komkommer|4 el knoflooksaus|1 el zonnebloemolie',
    'Bak het shoarmavlees in de olie in ongeveer 6 minuten bruin en gaar.\nSnijd de sla in reepjes en de tomaten en de komkommer in blokjes.\nRooster de pitabroodjes in de broodrooster of de oven.\nSnijd de broodjes open en vul ze met de sla, het vlees, de tomaat en de komkommer.\nSchenk de knoflooksaus erover.',
  ],
  'Hamburger met friet': [
    '300 g rundergehakt|2 hamburgerbroodjes|2 plakken kaas|1 tomaat|een paar blaadjes sla|1 kleine rode ui|2 el ketchup|2 el mayonaise|500 g ovenfriet|1 el zonnebloemolie|peper en zout',
    'Bak de ovenfriet volgens de verpakking.\nKneed het gehakt met peper en zout en vorm er 2 platte burgers van.\nBak de burgers in de olie in ongeveer 4 minuten per kant gaar en leg de laatste minuut de kaas erop.\nSnijd de tomaat in plakken en de ui in ringen.\nSnijd de broodjes open en rooster ze kort.\nBeleg ze met de sla, de burger, de tomaat, de ui en de sauzen en eet met de friet.',
  ],
  'Pizza': [
    '250 g bloem|1 zakje gedroogde gist (7 g)|150 ml lauw water|2 el olijfolie|1 tl zout|200 ml gezeefde tomaten|1 bol mozzarella|1 rode paprika|100 g champignons|1 tl gedroogde oregano',
    'Kneed de bloem, de gist, het water, de olie en het zout in 8 minuten tot een soepel deeg.\nLaat het deeg afgedekt een uur rijzen op een warme plek.\nVerwarm de oven voor op 230 graden.\nRol het deeg uit tot een grote pizza en leg die op een bakplaat met bakpapier.\nBestrijk met de gezeefde tomaten en beleg met plakjes mozzarella, reepjes paprika en plakjes champignon.\nBestrooi met oregano en bak de pizza in 12 tot 15 minuten goudbruin.',
  ],
  'Risotto met paddenstoelen': [
    '150 g risottorijst|300 g gemengde paddenstoelen|1 ui|2 tenen knoflook|100 ml droge witte wijn|600 ml warme groentebouillon|40 g Parmezaanse kaas|25 g boter|1 el olijfolie|verse peterselie|peper en zout',
    'Snijd de paddenstoelen in stukken en bak ze in de olie goudbruin. Haal ze uit de pan.\nSnipper de ui en de knoflook en fruit ze in de helft van de boter.\nBak de rijst 1 minuut mee tot hij glazig is en blus af met de wijn.\nVoeg scheut voor scheut de warme bouillon toe en roer regelmatig, tot de rijst na ongeveer 20 minuten gaar en romig is.\nRoer de paddenstoelen, de rest van de boter en de geraspte kaas erdoor.\nBreng op smaak met peper en zout en bestrooi met peterselie.',
  ],
  'Ratatouille met rijst': [
    '150 g rijst|1 aubergine|1 courgette|1 rode paprika|1 ui|2 tenen knoflook|1 blik tomatenblokjes (400 g)|2 el olijfolie|2 tl Provençaalse kruiden|peper en zout',
    'Kook de rijst volgens de verpakking.\nSnijd de aubergine, de courgette en de paprika in blokjes en snipper de ui en de knoflook.\nFruit de ui en de knoflook in de olie.\nBak de aubergine en de paprika 5 minuten mee en daarna de courgette nog 3 minuten.\nVoeg de tomatenblokjes en de kruiden toe en laat 20 minuten zachtjes stoven.\nBreng op smaak met peper en zout en eet met de rijst.',
  ],
  'Ovenschotel met gehakt': [
    '700 g kruimige aardappelen|300 g rundergehakt|1 ui|300 g sperziebonen|1 wortel|100 ml melk|25 g boter|75 g geraspte kaas|2 el paneermeel|1 el olijfolie|peper, zout en nootmuskaat',
    'Verwarm de oven voor op 200 graden.\nSchil de aardappelen, kook ze in 20 minuten gaar en stamp ze met de melk en de boter tot puree.\nSnijd de sperziebonen in stukken en de wortel in blokjes en kook ze 6 minuten.\nSnipper de ui en bak hem met het gehakt rul in de olie. Breng op smaak met peper, zout en nootmuskaat.\nSchep het gehakt in een ovenschaal, verdeel de groenten erover en dek af met de puree.\nBestrooi met de kaas en het paneermeel en bak de schotel in 25 minuten goudbruin.',
  ],
  'Witlof met ham en kaas': [
    '4 stronkjes witlof|4 plakken ham|100 g geraspte kaas|25 g boter|25 g bloem|300 ml melk|600 g aardappelen|peper en nootmuskaat',
    'Verwarm de oven voor op 200 graden.\nKook de witlof 10 minuten en laat hem goed uitlekken.\nSchil de aardappelen en kook ze in 20 minuten gaar.\nSmelt de boter, roer de bloem erdoor en schenk al roerend de melk erbij tot een gladde saus.\nRoer de helft van de kaas door de saus en breng op smaak met peper en nootmuskaat.\nWikkel elk stronkje witlof in een plak ham en leg ze in een ovenschaal.\nSchenk de saus erover, bestrooi met de rest van de kaas en bak 20 minuten in de oven. Eet met de aardappelen.',
  ],
  'Couscous met kip en groenten': [
    '150 g couscous|300 g kipfilet|1 courgette|1 rode paprika|1 ui|1 blik kikkererwten (400 g)|2 tl ras el hanout|200 ml kippenbouillon|2 el olijfolie|verse koriander of peterselie|peper en zout',
    'Snijd de kip in blokjes en bestrooi met de ras el hanout, peper en zout.\nSnijd de courgette en de paprika in blokjes en snipper de ui.\nBak de kip in de helft van de olie in 5 minuten goudbruin.\nBak de ui, de paprika en de courgette 5 minuten mee en roer de uitgelekte kikkererwten erdoor.\nBreng de bouillon aan de kook, schenk hem over de couscous en laat 5 minuten afgedekt staan.\nRoer de couscous los met de rest van de olie en eet met de kip en de groenten, bestrooid met de kruiden.',
  ],
};
