# WW2 Aircraft Physics Simulator — brononderzoek naar drie vergelijkingen

**Onderzoeksstand:** 6 november 2026 · **Scope:** reconstructie, bronaudit en toetsvoorstellen; **geen** wijziging van de solver of de datasets.  
**Bronstatus in de tabellen:** **M** = door proefinstantie gemeten en in originele rapportage verwerkt; **D** = uit historische figuur gedigitaliseerd/afgelezen; **A** = uit gemeten of opgegeven waarden afgeleid; **G** = expliciet aangenomen/modelinvoer; **?** = niet vastgesteld. Een gerapporteerde, naar standaardatmosfeer/massa gecorrigeerde vluchtsnelheid is **M (gecorrigeerd)** en géén rauwe pitotmeting. Een getranscribeerd historisch rapport is inhoudelijk een primaire tekst, maar niet een gecontroleerde scan van het blad.

## 0. Herkomst: wat is daadwerkelijk Greg?

- De repository bevat **twee door de gebruiker bewaarde schermafbeeldingen van grafieken van Greg**, maar zonder de volledige video, tijdcode, ruwe werkbladen, leesbare asmetadata of opgegeven datapunten. Bestanden: `references/import/01_COMPLETE_V2_5_BASELINE/04_USER_IMAGES_AND_GREG_CHARTS/20261026-160549__greg_Spitfire_vs_Fw190_drag_graph.png` en `20261026-160842__greg_P38G_vs_Mosquito_with_bombs_graph.png`.
- Het Excelbestand `references/import/01_COMPLETE_V2_5_BASELINE/01_GREG_ORIGINAL/Expanded/Europe_Air_War_Research_Handoff_v0.2/data/WWII_Aircraft_Complete_Data_Table_v0.2.xlsx` is een **latere, expliciet geconstrueerde 'Greg-style' onderzoeksreconstructie** van 46 velden × 66 gevallen. De bovenliggende map heet misleidend `01_GREG_ORIGINAL`; de handoffdocumentatie spreekt van een *constructed Greg-style table*. **De Excelrij, haar aannames en de formules mogen dus niet aan Greg worden toegeschreven.**
- Gregs **originele** video voor het derde onderwerp is wél geïdentificeerd: [P 38G Lightning vs. Mosquito FB Mk VI (14 augustus 2024)](https://www.youtube.com/watch?v=HWvERh_eK6M). Zijn beschrijving bevat een latere rectificatie: de P‑38G draagt **twee bommen van ieder 1.100 lb**, niet één; de eerdere Mosquito FB Mk VI-snelheid was bovendien te hoog voorgesteld wegens onderschatte weerstand van de geschutspoorten. Een exacte grafiektijdcode en los bronwerkblad ontbreken nog. Het rode grafieklabel slaat op **FB Mk VI**, niet de hieronder onafhankelijk geteste **B Mk IX LR495**.

## 1. P‑51B: herkomst van het verschil van circa 115 hp

### 1.1 Gereconstrueerde Excelrij (geen Greg-origineel)

Bestand: werkblad `Greg Speed Table`, **rij 31**, case P‑51B, 20.800 ft, 250 mph **TAS**, 67 inHg. [Rechtstreekse werkmap-URL op GitHub](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/blob/main/references/import/01_COMPLETE_V2_5_BASELINE/01_GREG_ORIGINAL/Expanded/Europe_Air_War_Research_Handoff_v0.2/data/WWII_Aircraft_Complete_Data_Table_v0.2.xlsx). Verwijzingen naar `Assumptions` zijn **modelinvoer**, geen periodieke P‑51B-fabriekstabel.

| Cel of groep | Waarde en eenheid | Exacte berekeningswijze of herkomst | Status |
|---|---:|---|:---:|
| `B31`, `C31`, `D31` | 20.800 ft; 250 mph TAS; 67 inHg | Geselecteerde testcase | G |
| `Assumptions!C5`, `G31` | **9.240 lb** | Vast ingevuld gewicht; afkomstig van een andere, 22.400-ft-context; niet expliciet gemeten bij 20.800 ft | G |
| `C6`, `L31` | 233 ft² = 21,6464 m² | Vleugeloppervlak | G |
| `C7`, `M31` | 37 ft span; AR **5,87554** | `M31=(37×0,3048)^2/L31` | G/A |
| `C8`, `R31` | **CD0 = 0,016** | `R31=Assumptions!C8+C13` (`C13=0`) | G |
| `C9`, `N31` | **e = 0,80**; **k = 0,0677193** | `N31=1/(PI()*M31*Assumptions!C9)` | G/A |
| `H31`, `I31` | 0,635162 kg/m³; **180,017 mph EAS** | ISA-troposfeer; `I31=C31*SQRT(H31/1,225)` | A |
| `J31`, `K31` | M = **0,35477**; **3.966,679 Pa** | ISA; `K31=0,5*H31*(C31*0,44704)^2` | A |
| `Q31` | CL = **0,47868** | `Q31=G31*4,4482216153/(K31*L31)` | A |
| `S31`, `T31`, `U31` | CDi = **0,01551685**; CDwave = **0**; CDtot = **0,03151685** | `S31=N31*Q31^2`; `U31=SUM(R31:T31)` | A/G |
| `V31`, `W31`, `X31`, `Y31` | parasitair **308,849 lbf**; geïnduceerd **299,523 lbf**; overig **0 lbf**; totaal **608,372 lbf** | `V=K*L*R/4,448...`; `W=K*L*S/4,448...`; `Y=SUM(V:X)` | A |
| `AD31` | **1.390 bhp asvermogen** | Handmatig uit de opgegeven Wright Field-motorcurve overgenomen; **niet** in de Excel-vlucht gemeten | G / periodieke bronwaarde |
| `AC31` | **η = 0,8000** | Vaste propellerrendementaanname; geen Hamilton Standard K.6523A-24-kaart | G |
| `AE31` | **1.112,000 hp nuttig** | `AE31=AD31*AC31` = 1.390 × 0,80 | A |
| `AF31`, `AG31`, `AH31` | **405,581 hp** propulsief benodigd; **506,977 bhp** equivalent op as; **706,419 hp** overschot | `AF=Y*4,448...*(250*0,44704)/745,6998716`; `AG=AF/AC`; `AH=AE-AF` | A |
| `AN31` | **2,13019 g** aangehouden | `MIN(AM31,SQRT((AE31*745,699.../(250*0,44704)-(V31+X31)*4,448...)/(W31*4,448...)))` | A, **geen** bochtproef |

**Dimensies:** `hp` = mechanische horsepower; `bhp` = brake horsepower aan de motoras, vóór propellerverliezen; `P_prop = η × P_shaft`; `P_req = D × V_TAS`. De 405,581 hp is **propulsief benodigd**, geen vereiste motoras-bhp. Voor de aangehouden bocht wordt geïnduceerde weerstand effectief met `n²` opgeschaald en wordt gelijkheid tussen propulsief beschikbaar en benodigd vermogen opgelegd. Niet-inbegrepen: gevalideerde koelerweerstand, werkelijke propellerkaart, individuele motor-/installatiestrooiing en historische testvliegmassa.

### 1.2 Tegenover actuele simulator (v3.9, werkprofiel `P`)

Zelfde **hoogte**, **TAS**, **manifold pressure**, 3.000 rpm, high blower en opgegeven **9.240 lb**; verschillen in aërodynamische- en propellermodellen blijven **modelverschillen**, geen historisch meetverschil.

| Grootheid | Oude Excel | Simulator v3.9 profiel P | Verschil t.o.v. Excel | Status |
|---|---:|---:|---:|:---:|
| Motorasvermogen | 1.390,000 bhp | 1.390,000 bhp | **0** | G op basis van historische curve |
| Propellerrendement | 0,8000 | **0,882518** | **+8,252 procentpunt** | G / model |
| Propulsief beschikbaar | **1.112,000 hp** | **1.226,700 hp** | **+114,700 hp / +10,31%** | A |
| Propulsief benodigd | **405,581 hp** | **410,394 hp** | **+4,812 hp / +1,19%** | A |
| Vermogensoverschot | **706,419 hp** | **816,307 hp** | **+109,889 hp / +15,56%** | A |
| Aangehouden belasting | **2,1302 g** | **2,3877 g** | **+0,2575 g / +12,09%** | A; *niet historisch gemeten* |

Simulatorprofiel P gebruikt 11 ft 2 in diameter, prop-RPM **1.431,82** (motor/prop reductie **2,095:1**), `J=1,37598`, `Cp=0,26290`, helical tip Mach **0,88428**, een momentum-/verliesmodel met gekalibreerde globale verliesparameters. Het is **geen direct gemeten, geïnstalleerde Hamilton Standard-kaart**. Het alternatieve, legacy `C`-profiel geeft circa **1.143,0 hp** nuttig en **2,136 g**; resultaten zijn dus profielgevoelig. Andere modelverschillen: `CD0` bij deze toestand ≈ **0,018398** en e ≈ **0,92** in het P-profiel, versus respectievelijk **0,016** en **0,80** in Excel.

**Conclusie voor de 115 hp:** exact het verschil tussen **0,80 en 0,882518 propellerrendement** bij **hetzelfde 1.390 bhp asvermogen**. Er is nog geen historisch bewijs voor welke van beide rendementen bij deze installatie klopt. Een verschil in **asvermogen** mag hier niet voor worden uitgevonden.

### 1.3 Onafhankelijke historische gegevens en verwijzingen

| Waarde(s) | Configuratie, testcondities en interpretatie | Primair stuk, plaats, directe URL | Status / kwaliteit |
|---|---|---|:---:|
| **1.390 bhp per motor**, **3.000 rpm**, **67 inHg**, high blower, kritische hoogte **24.000 ft** | **P‑51B‑15, AAF 43‑24777**, Packard V‑1650‑7; gepubliceerd als uit **Packard vermogensdiagram 3 dec. 1943** afgeleid; *geen* torquemetermeting in de P‑51B-vlucht | Wright Field **Eng‑47‑1749‑A**, 1944, engine/power-vs-altitude summary: [rapport en figuren](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) | A; installatielast, OAT op punt niet geïsoleerd |
| **20.800 ft**, **75 inHg**, **1.572 bhp**, 3.000 rpm, high blower | **20.800 ft hoort bij de kritische hoogte van de 75-inHg-run**, **niet** bij die van 67 inHg. Niet verwisselen | **Eng‑47‑1749‑A**, power/altitude chart: [rapport](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) | A |
| **408 / 417 / 426 mph TAS** bij **18.000 / 20.800 / 24.000 ft**, 67 inHg | Wright, max level speeds met dezelfde motor, radiator/oliekoeler in automatische instelling; de metingen zijn gecorrigeerd; **niet** hetzelfde als 250-mph-weerstandstest | **Eng‑47‑1749‑A**, speed/altitude plots: [rapport](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) | M (gecorrigeerd); geen individuele prop-η |
| **431 mph TAS** bij 20.800 ft, 75 inHg, mét bomrekken; **444 mph zonder rekken** | Andere **boost** dan hoofdtest, maar directe aanwijzing voor configuratiegevoelige weerstand | **Eng‑47‑1749‑A**, 75-inHg speed data: [rapport](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) | M (gecorrigeerd); geen 67-inHg-proef |
| Wright-required-bhp-curve bij **22.400 ft**, meerdere TAS/RPM | **Fig. 5** is een *andere hoogte en ander toerental* dan het 20.800-ft/250-mph-punt; bruikbaar als multispuntcontrole van drag/η **samen**, niet als directe meting van het ene rendement | **Eng‑47‑1749‑A, Fig. 5**, [originele figuurscan](https://www.wwiiaircraftperformance.com/org/p-51/p-51_files/P-51B_24777_Power_Required.jpg) | D bij aflezen; as-‘power required’ niet verwarren met propulsief vermogen |
| Naaf **Hamilton Standard 24D‑50‑65**, **K.6523A‑24** bladen, **11 ft 2 in**, motor **V‑1650‑7**, 0,479 reductie | **Mustang IV TK589**, *zelfde bladontwerp* maar **andere naaf, serienummer, installatie, uitrusting en koeling**; A&AEE moest koelopening op **8,5 in** zetten i.p.v. 7,25 in | **A&AEE TK589**, [origineel rapporttranscript](https://www.wwiiaircraftperformance.com/org/p-51/tk589.html) | M voor eigen test; **geen** rechtstreeks rendement 43‑24777 |
| Prestaties bij **10.300 ft: 396 mph TAS** (+18 lb/in²) en **4.300 ft: 398 mph TAS** (+25 lb/in²), 3.000 rpm | TK589, geen matching 20.800 ft / 67 inHg / 250 TAS; Britse boost in **psi boven atmosferisch**, niet Amerikaanse absolute inHg | **A&AEE TK589**, performance tables: [rapport](https://www.wwiiaircraftperformance.com/org/p-51/tk589.html) | M (gecorrigeerd) |
| P‑51B met propeller **afgenomen**, koeling dicht/sealed | Die vluchtmetingen mogen **niet** als normale geïnstalleerde P‑51B-dragcurve behandeld worden | **NACA ACR‑4K02 / WR‑A‑62**, [NASA catalogus en scan](https://ntrs.nasa.gov/search.jsp?R=19930092458) | M, afwijkende configuratie |
| Andere P‑51B met **Merlin V‑1650‑3** en **HS J6487‑24** | Historische vluchtpolairmetingen op meer hoogtes, incl. circa 20.000 ft; rapport noemt onzekerheid in motorasvermogen; *niet* overdraagbaar als K.6523A‑24-η | **NACA MR‑L4L18 / NASA TM‑79875**, [NASA catalogus](https://ntrs.nasa.gov/search.jsp?R=19780078569) | M/A op andere installatie |

**Propellerkaart-gap:** Geen directe empirische `η(J,Cp,M_tip)`- of `C_T(J,Cp,M_tip)`-kaart gevonden voor **de geïnstalleerde K.6523A‑24 op 43‑24777** bij 3.000 rpm en 250 mph TAS; ook niet een afzonderlijk bepaald koelweerstands-/installatieverlies. De gevonden NACA/Hamilton Standard-tunnelgrafieken gelden voor **andere bladen/diameters/proeven**: bijvoorbeeld [NACA WR‑L‑530, 1941](https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/19930093331.pdf), [NACA 1944 charts for determining propeller efficiency](https://ntrs.nasa.gov/citations/19930093312) en [NACA WR‑L‑594](https://digital.library.unt.edu/ark:/67531/metadc62616/) (HS 6507A‑2, **P‑47**-toepassing). De [AirCorps Library-catalogus voor Hamilton Standard-specificaties](https://app.aircorpslibrary.com/aircraft/hamilton-standard-specifications-propeller-props-specs) bevat wel 24D-naafdocumenten maar geeft niet reeds de gezochte K.6523A‑24-vluchtrendementskaart. Gebruik hiervan als transfer uitsluitend mét geometrie en onzekerheidsvlag. Voor de exacte Wright-power-curve blijven ramcondities, temperatuur en gemeten individuele as-bhp op 20.800 ft/250 mph niet expliciet vastgesteld. Een directe *sustained turn*-flight test voor deze Mustang is niet aangetroffen.

**Simulator-toets nu:** 67 inHg, 3.000 rpm **hoogte-/topsnelheidsserie** uit Eng‑47‑1749‑A en *afzonderlijk* Fig. 5 op 22.400 ft met gelijk RPM en gehanteerde massa. **Voorlopig:** 2,13 versus 2,39 g en de echte prop-η. **Hoogste bronprioriteit:** historische HS K.6523A‑24-bladpolair / geïnstalleerde stuwkracht- en torquecurve + cooling-drag test met shutterstand.

---

## 2. Gregs Spitfire–Fw 190-weerstandsgrafiek

### 2.1 Wat uit Gregs screenshot blijkt, en wat niet

De bewaarde afbeelding bevat zes gelabelde reeksen: **Spitfire IND**, **Spitfire PST**, **Spitfire Total** en **Fw190 IND**, **Fw190 PST**, **Fw190Total**. Horizontale markeringen van **100 t/m 375** (stappen 25); verticale markeringen **0 t/m 2.500** (stappen 500). Geen van beide assen heeft een leesbare **titel of eenheid**; er is geen video-tijdstempel, databestand, massa, temperatuur, hoogte, toestelvariant, serienummer of koelstand. De beide total-curves hebben hun zichtbare minimum ongeveer bij **x ≈ 175** en **y ≈ 750–800 schaalstreep-eenheden**; deze **ruwe schermafbeeldingsschatting** is niet geschikt voor een procentueel verschil.

Het patroon (`IND` daalt ~1/V²; `PST` stijgt ~V²) maakt **weerstandskracht tegen snelheid** plausibeler dan een vermogensgrafiek, maar **dit is slechts interpretatie**. De labels bewijzen niet dat de getallen ‘lbf’, ‘mph’ of TAS voorstellen. Ook ‘Fw 190 A‑5’ uit Gregs [P‑47-vergelijking uit 2018](https://www.youtube.com/watch?v=mzQuq2FHdeE) zegt niets sluitends over **deze** grafiek. Greg heeft óók een [Fw 190 A‑4-video van 2 aug. 2024](https://www.youtube.com/watch?v=Eb6UxtpVUBk), die A‑4 met MW‑50 behandelt; niet bewezen dat het screenshot daarin voorkomt. **Variantherkomst en tijdcode: onbekend.**

| Benodigd identiteitsveld | Greg Spitfire | Greg Fw 190 | Bewijsstatus |
|---|---|---|:---:|
| Variant, serienummer, motor, propeller, massa | ‘Spitfire’ op lijn; verder **onbekend** | ‘Fw190’ op lijn; verder **onbekend** | ? |
| Vleugelconfiguratie, radiatoren, bewapening, overige uitrusting | **onbekend** | **onbekend** | ? |
| Testhoogte, atmosfeer, temperatuurscorrecties | **onbekend** | **onbekend** | ? |
| X-as | 100–375 zonder eenheid; IAS/CAS/EAS/TAS **onbekend** | idem | D/? |
| Y-as | 0–2500 zonder eenheid; drag/vermogen **onbekend** | idem | D/? |
| `CD0`, `k`, `e`, `S`, separatie koelweerstand, Mach-correctie | **onbekend** | **onbekend** | ? |
| Schatting totaalminimum | nabij x=175, y≈800 | nabij x=175, y≈760 | D, slechte resolutie |

**Wat verschillende interpretaties doen:** Voor het elementaire polairmodel `D(V) = ½ρ S CD0 V² + 2k W²/(ρ S V²)` is `V_minD = √(2W/(ρ S)) (k/CD0)^(1/4)`. Bij hetzelfde polair is de snelheid van **minimum benodigd vermogen** `V_minP = V_minD / 3^(1/4) ≈ 0,760 V_minD`, dus circa **24% lager**. Als `175` het minimum van de **drag** is, valt min. power bij ca. **133** in dezelfde snelheidseenheid; omgekeerd zou een power-minimum van 175 een drag-minimum nabij **230** impliceren. De exacte waarden gelden alleen voor het eenvoudige incompressibele, constante-CD0/e-model. Is x EAS, dan is `TAS = EAS / √σ`; bij 20.800 ft ISA is √σ≈0,720, zodat **175 mph EAS overeenkomt met circa 243 mph TAS**. Is x al TAS, dan is dit niet van toepassing. Een ontbrekend aslabel kan het ogenschijnlijke minimum dus sterk verschuiven.

### 2.2 Onafhankelijke Spitfire IX-data (BS.543)

**Spitfire IX BS.543** was oorspronkelijk Merlin 61/convertie, **in de proef omgebouwd naar Merlin 66 (RM‑10SM)**: LF-prestatievariant. Normale Spitfire Mk Vc-vleugels (**niet geknipt**), twee 20mm + vier .303, overige hulzen afgeblind, geschutspoorten dichtgeplakt, lege patroonafvoeren open, rechthoekige spiegel, ejector-uitlaten, geen inlaat-ijsbeschermers/fuel cooler. Vierbladige **Rotol XH54D‑RM‑S5 / EH240**, RA10061-metalen bladen, **10 ft 9 in**, reductie **0,477:1**. De A&AEE-beproeving corrigeert naar **standaardatmosfeer** en voor topsnelheid naar **7.110 lb = 95% van 7.485 lb takeoff**. IAS-position error is **overgenomen van BF.274**: tweede gemeenschappelijke bron, geen onafhankelijke BS543-kalibratie.

| Oorspronkelijke waarde | Hoogte, snelheid, motor, koeler, gewicht | Bron en vindplaats | Status |
|---|---|---|:---:|
| **4.700 ft/min** klim; **190 mph TAS / 170 mph ASI** | **7.000 ft**, 3.000 rpm, +18 psi, Merlin 66, **radiatorflaps volledig open**, 7.485 lb takeoff; M.S. critical height | **A&AEE Merlin 9SM/66/70 comparison**, **Table II**, [periodiek rapporttranscript](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) | M (gecorrigeerd) |
| **3.560 ft/min**, **224 mph TAS / 163 mph ASI** | **20.000 ft**, 3.000 rpm, **+15,8 psi**, F.S. gear, radiator open | **A&AEE**, **Table II**, [zelfde periodieke tekst](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) | M (gecorrigeerd) |
| **336 mph TAS**, 343 mph ASI, PEC **−7,1 mph** | **0 ft**, 2.995 rpm, **+18 psi**, M.S., **radiator gesloten**, genormaliseerd 7.110 lb | **A&AEE**, **Table V**, [rapport](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) | M (gecorrigeerd) |
| **384 mph TAS**, 335 mph ASI, PEC **−6,8 mph**, CE **−4,2 mph** | **10.800 ft**, 2.995 rpm, +18 psi, M.S. kritische hoogte, radiator dicht, 7.110 lb | **A&AEE**, **Table V**, [rapport](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) | M (gecorrigeerd) |
| **399 mph TAS**, 304 mph ASI, PEC **−5,7 mph**, CE **−6,7 mph** | **20.000 ft**, 2.995 rpm, **+18,5 psi**, F.S., radiator dicht, 7.110 lb | **A&AEE**, **Table V**, [rapport](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) | M (gecorrigeerd) |
| **407 mph TAS**, 300 mph ASI, PEC **−5,6 mph**, CE **−7,4 mph** | **22.000 ft**, 2.995 rpm, **+18,5 psi**, F.S. kritische hoogte, radiator dicht, 7.110 lb | **A&AEE**, **Table V**, [rapport](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) | M (gecorrigeerd) |

**Beperking:** Table II (klim) en V (topsnelheid) verschillen in koelerstand, luchtsnelheid én normalisatiegewicht. Zij leveren **geen** gemeten Spitfire-weerstandspolair of CD0/k. Bovendien is de 170-mph beste klim-ASI voor BS543 **van BS354 overgenomen** (A&AEE §4.1), niet rechtstreeks op BS543 geoptimaliseerd. De volledige papieren **originele scan** van dit A&AEE-rapport en zijn officiële hoofdrapportnummer zijn niet gevonden; de weblink is een transcriptie van historisch materiaal. Catalogus van de specifieke BF274-PEC: **A&AEE/692,m, 3rd Part**. Niet extrapoleren buiten de historische PEC-snelheidsrange.

### 2.3 Onafhankelijke Fw 190-bronnen, strikt per configuratie

| Originele waarde | Configuratie en conditie | Primair document en directe scan | Status |
|---|---|---|:---:|
| **607 km/h = 377 mph** bij **0 m** en **1,70 ata / 2.700 rpm** | **Fw 190 A‑4 W.Nr. 783**, BMW 801 D‑2 **#20208**, **3.870 kg**, nauwe motorkap, 2×MG17 +2×MG151, low blower; boostbegrenzer **speciaal losgeschroefd**, thermisch niet goedgekeurd voor langdurig gebruik | Fabriek **Flugbericht Fw 190/783 Nr. 5**, 9 april 1943, §Ergebnisse en figuur: [originele Duitse scan, 3 p.](https://www.wwiiaircraftperformance.com/org/fw190/a4/a4_files/Fw_190_783_Nr5.pdf) | M/gecorrigeerd; **speciale niet-standaard rating** |
| ca. **390 mph TAS bij 18.000 ft**, 1,42 ata /2.700 rpm | **Veroverde Fw190 A‑3** in RAE/AFDU-evaluatie, BMW801-D, VDM drieblad, ca.8.600 lb; proefinstantie noemt motorproblemen, veranderde/derated prestaties | **AFDU Report No.55**, 1942, §35–37; [historische rapporttekst](https://www.wwiiaircraftperformance.com/com/gb/documents/fw190a3_RAE-Test-Jul42-new.html) | M (benaderd); **andere variant** |
| **3.880 kg clean**, **4.380 kg met 500-kg-bom** | **A‑4 W.Nr. 619**, BMW801 D‑2 **#85259**, brede motorkap, combat power; **absolute snelheid te laag** volgens fabriek: ontbrekende ram-kalibratie | **Flugbericht Fw190/619 Nr.2**, 11 jan. 1943, §Resultaten en figuur; [originele Duitse scan](https://www.wwiiaircraftperformance.com/org/fw190/a4/a4_files/Fw_190_619_Nr2.pdf) | M / waarschuwing |
| Bij zeeniveau **−22 km/h (−14 mph)** alleen drie lege ETC501-rekken; **−58 km/h (−36 mph)** rekken+2 tanks; **−73 km/h (−45 mph)** rekken+tanks+250-kg-bom | Zelfde **W.Nr. 619**, BMW801 D2; vier configuraties **a–d**; de **snelheidsverschillen** zijn betrouwbaarder dan absolute niveaus, niet overdraagbaar naar schone WNr783 of P38-pylons | **Flugbericht Fw190/619 Nr.3**, 20 jan. 1943, §Ergebnisse 1; [originele Duitse scan, 3 p.](https://www.wwiiaircraftperformance.com/org/fw190/a4/a4_files/Fw_190_619_Nr3.pdf) | M (gerapporteerde **verschillen**), geen dragpolair |

Fw190 A‑4 **W.Nr.783** is de betere schone basis; **W.Nr.619** geeft binnen-één-toestel-interventieverschillen bij zeeniveau en hoort in een *stores*-dataset. De A‑3 van AFDU is weer een apart vliegtuig, en de MW‑50-/ongebruikelijke 1,70-ata-run van 783 is geen standaard A‑4-curve. De periodieke Duitse rapporten geven in het hier aangetroffen materiaal **geen directe `CD0`, `k`, `e`, full polar of deceleration-vs-V-tabel**. Ook geen zelfstandig onderbouwde grafiekwaarden van Greg.

**Simulator-toets nu:** Spitfire BS543 **22.000 ft / 407 mph TAS / 2.995 rpm / +18,5 psi / koeler dicht / 7.110 lb** en **20.000 ft / 3.560 ft/min klim / koeler open / 7.485 lb** als **twee verschillende** testen. Voor A‑4 kan de **0 m / 377 mph / 1,70 ata** speciale 783-run apart worden berekend indien motorrating daarvoor expliciet wordt ondersteund; anders tegen een standaard 1,42-ata-curve uit originele 783-figuur digitaliseren. **Voorlopig:** enige vergelijking van de minima uit Gregs screenshot. **Ontbreekt:** exacte video/tijdcode/worksheet met aslabels, hoogte, modelvariants en dragcoëfficiënten; primaire Spitfire A&AEE-papieren scan.

---

## 3. Gregs P‑38G–Mosquito-bommenvergelijking

### 3.1 Greg: grafiek en rechtzetting

Op de bewaarde grafiek staat **Y-as hoogte** (S.L. tot circa 30.000 ft), **X-as “mph”** (ongeveer 300–405). Drie lijnen: `P-38G No External Stores`, `Mosquito 2x500 Pound Bombs`, `P-38G 1100 Pounds of Bombs`. **mph** staat in het beeld, maar **TAS/CAS/IAS staat er niet bij**. Blue clean ca.404 mph bij circa23.000 ft komt overeen met een Wright Field-meetpunt, maar dat bewijst de gebruikte Greg-tabel niet. De beladen curve lijkt een afgeronde, schuin oplopende reeks zonder zichtbare meetmarkeringen; historische herkomst niet bewezen.

**De oorspronkelijke maker corrigeert expliciet de omschrijving:** **P‑38G = 2 × 1.100 lb bommen = 2.200 lb bommassa**, plus nog vast te stellen rekken/pylons; **niet** 1.100 lb inclusief installatie. Mosquito is **FB Mk VI**; Greg waarschuwt dat die snelheid in die video **te hoog is** weergegeven door de weerstand van de geschutspoorten. Dit maakt de *geplotte oorspronkelijke* Mosquito-snelheid zelf een **verouderde Greg-reconstructie**. [Gregs video/beschrijving, 14 aug. 2024](https://www.youtube.com/watch?v=HWvERh_eK6M). Tijdcode van de screenshot, bronwerkmap, bomtypen en P38-serienummer **niet gevonden**.

| Identiteitsveld per Greg-lijn | P‑38G clean / geladen | Mosquito rode lijn | Status |
|---|---|---|:---:|
| Type | P‑38G (subvariant/serienummer onbekend) | **FB Mk VI**, niet LR495 B Mk IX | video/grafiek bevestigd |
| Bomlast | 0 externe stores / **2 × 1.100 lb extern** | “2×500 Pound Bombs”, positie/configuratie in grafiek onbekend | direct gecorrigeerd / ? |
| Bomtype, pylon/rek, fairings, lege-rekcurve | niet gepubliceerd in verifieerbaar origineel | niet gepubliceerd | ? |
| Massa per punt, motorvermogen **per motor**, RPM, turbo-instelling, koeling | onbekend | onbekend | ? |
| X-snelheidsbasis | mph; IAS/CAS/EAS/TAS **onbekend** | idem | D/? |
| Originele video en exact tijdstip | YouTube ID **HWvERh_eK6M**, **tijdstip onbekend** | dezelfde video | originele video / ? |

### 3.2 Onafhankelijke P‑38G-1 schone referentie

**AAF 42‑12687, P‑38G‑1, Wright Field FS‑M‑19‑1538‑A, 10 feb. 1943.** Twee **Allison V‑1710‑51 en ‑55**, driebladige **Curtiss design 88996‑18 / 89303‑18** met bladhoek 22,7–57,7° op 42-in-radius, **13.900 lb** takeoff, tijdens snelheidsmetingen naar circa13.400–13.550 lb gespecificeerd. Alleen één 20mm, twee .50cal, gedeeltelijke munitie; 180 gal brandstof; **wielen op, flaps neutraal, prestone-/oliekoelershutters *faired* bij topsnelheid, helemaal open bij klimmen**. Auto-rich. Het rapport zegt dat **BHP uit vermogenkaarten is verkregen**: geen directe torquemeting. **Geen externe bom- en lege-rekmetingen in dit rapport.** Of lege permanente pylonbeugels gemonteerd waren is niet afzonderlijk gedocumenteerd.

| Originele (naar standaardcondities herleide) TAS | Hoogte / motorinstelling **per motor** / testgewicht | Bron en vindplaats | Status |
|---:|---|---|:---:|
| **346,5 mph TAS** | **5.000 ft**; **1.220 bhp per motor**, **44,7 inHg**, **3.000 rpm**, ca.13.550 lb, koeler faired | **FS‑M‑19‑1538‑A**, p.1, *Level flight speeds*; [originele PDF, 4 p.](https://www.wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G-1_42-12687_FS-M-19-1538-A.pdf) | M gecorrigeerd; bhp A |
| **355,5 mph TAS** | **5.000 ft**; **1.320 bhp per motor**, **48,0 inHg**, 3.000 rpm, ca.13.550 lb | Zelfde, p.1; [scan](https://www.wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G-1_42-12687_FS-M-19-1538-A.pdf) | M / bhp A; hogere rating niet op alle hoogtes veilig |
| **378 mph TAS** | **14.700 ft**; **1.220 bhp per motor**, **44,7 inHg**, 3.000 rpm, ca.13.525 lb | Zelfde, p.1 | M / bhp A |
| **404 mph TAS** | **22.600 ft**; **1.225 bhp per motor**, **44,7 inHg**, 3.000 rpm, ca.13.500 lb; turbo-kritische hoogte | Zelfde, p.1 | M / bhp A |
| **403 mph TAS** | **24.400 ft**; **1.175 bhp per motor**, **43,2 inHg**, 3.000 rpm, ca.13.450 lb | Zelfde, p.1 | M / bhp A |
| **396 mph TAS** | **30.000 ft**; **980 bhp per motor**, **36,0 inHg**, 3.000 rpm, ca.13.400 lb | Zelfde, p.1 | M / bhp A |
| **3.660 ft/min** climb bij **6.000 ft**, ca.171 mph TAS | ca. **1.210 bhp per motor**, koelkleppen **open**, naar klimgewicht corrigeren | Zelfde, p.2–3, *Climb* | M / BHP A |

**Temperatuurbeperking:** 1.320 bhp is volgens Wright Field rond **14.700 ft** *niet* beschikbaar wegens carburetor air temperature **57°C**; boven kritische hoogte neemt vermogen af. De grafiek mag dus niet als ‘2×1.320 bhp op alle hoogtes’ worden berekend. P‑38J/L-resultaten kunnen helpen om de vorm van rek-/bomweerstand te onderzoeken, maar niet zonder correctie voor veranderde turbo-intercooling, motoren, koeling, propellers, configuratie en massa op deze P‑38G worden gezet.

**Relevant zijspoor dat de interpretatie verscherpt:** Wright Field **PHQ‑M‑19‑1328‑A** mat op **P‑38D 40‑774** bij **20.100 ft** onder andere **375 mph TAS / 1.150 bhp per motor /3.000 rpm** en **340 mph TAS /750 bhp per motor /2.280 rpm**. Het rapport waarschuwt expliciet dat uit motorvermogenscurves afgeleide BHP **niet betrouwbaar hoeven te zijn** vergeleken met torquemeters. Wright Field **PHQ‑M‑19‑1313‑A** mat op **P‑38E 41‑1983** bij **5.000 ft density altitude** circa **337,5 mph TAS / 40 inHg /3.000 rpm** en **313,9 mph TAS /32 inHg /3.000 rpm**, inclusief carburateur-, olie-, koelwater- en buitentemperaturen. Allemaal **M (gecorrigeerd)** voor de eigen vliegtuigen en **niet overdraagbaar** als een G-bommenproef. [Wright Field verzamelindex met beide primaire proefteksten](https://www.wwiiaircraftperformance.com/org/p-38/p-38.html), secties 24 dec. 1941 / 31 okt. 1941. Dit is een route naar *multi-speed* brononderzoek maar geen directe `CD0` of `η` voor G-1.

### 3.3 Originele Mosquito B Mk IX LR495 A&AEE-scans

**Beide gescande rapporten zijn gevonden**, inclusief de oorspronkelijke tabelbladen en snelheid-hoogtefiguren. Het zijn **twee proefmomenten op hetzelfde toestel**, geen twee onafhankelijke vliegtuigen. Twee **Merlin 72**, **de Havilland Hydromatic 3-bladig, diameter 12 ft**, 3.000 rpm voor all-out; radiatorkleppen **gesloten** in de getabelleerde topsnelheidsruns, bij klimproeven elders open. De historische tabellen geven ASI, position- en compressibility-correcties én TAS. Beide snelheidsseries zijn genormaliseerd naar **95% van takeoff weight**, maar naar **verschillende massa’s**.

| Historische originele waarde | Configuratie/omstandigheden | Primair document, blad/figuur en directe URL | Status / uitleg |
|---|---|---|:---:|
| **21.910 lb takeoff**, **4×500 lb intern = 2.000 lb**, **geen externe racks of bommen** | LR495, B Mk IX, 2×Merlin72, volledige brandstof/olie en 2 crew, test **mei 1943**, 3.000 rpm; oorspronkelijk rapport gedateerd **11 juni 1943** | **A&AEE/767,h, 4th Part**, p.1–2; [originele scan `lr495.pdf`, 6 p.](https://www.wwiiaircraftperformance.com/org/mosquito/mosquito_files/lr495.pdf) | M voor gewichts-/configuratieopgave |
| **393 mph TAS**, 331 mph ASI, 3.000 rpm, **+18,4 psi** | **13.800 ft**, MS full throttle height, radiator **dicht**, **naar 20.800 lb gecorrigeerd**, met interne bommen | **A&AEE/767,h 4th Part**, **Table II, p.4; Fig.2, p.6**, [scan](https://www.wwiiaircraftperformance.com/org/mosquito/mosquito_files/lr495.pdf) | M (gecorrigeerd) |
| **405 mph TAS**, 280 mph ASI, 3.000 rpm, **+18,2 psi** | **25.700 ft**, FS full throttle height, radiator dicht, **20.800 lb** genormaliseerd | **A&AEE/767,h 4th Part**, **Table II p.4 / Fig.2 p.6**, [scan](https://www.wwiiaircraftperformance.com/org/mosquito/mosquito_files/lr495.pdf) | M (gecorrigeerd) |
| **385 mph TAS** op **20.000 ft**; **399 mph TAS** op **24.000 ft** | FS, 3.000 rpm, +18,2 psi, radiator dicht, 20.800 lb; **geen externe racks** | **A&AEE/767,h 4th Part**, **Table II p.4**, [scan](https://www.wwiiaircraftperformance.com/org/mosquito/mosquito_files/lr495.pdf) | M (gecorrigeerd) |
| **22.850 lb takeoff**, **4×500 lb intern +2×500 lb extern op gestroomlijnde rekken**; totale bommassa **3.000 lb** | Zelfde LR495 na 4–5 maanden, beproefd **augustus 1943**, rapport uitgegeven **20 feb. 1944**; materiaaltoestand verslechterd, registratie/identiteit hetzelfde | **A&AEE/767,h, 8th Part**, **p.1–2**, [originele scan `lr495-b.pdf`, 5 p.](https://www.wwiiaircraftperformance.com/org/mosquito/mosquito_files/lr495-b.pdf) | M (gecorrigeerd); **niet ‘slechts’ 2×500 lb totale bomlast** |
| **373 mph TAS**, 317 mph ASI, **+18,0 psi** | **13.000 ft**, MS full throttle height, 3.000 rpm, radiator **dicht**, **naar 21.700 lb gecorrigeerd**, interne+externe bommen | **A&AEE/767,h 8th Part**, **Table I p.3 / Fig.1 p.5**, [scan](https://www.wwiiaircraftperformance.com/org/mosquito/mosquito_files/lr495-b.pdf) | M (gecorrigeerd) |
| **383 mph TAS**, 268 mph ASI, **+18,0 psi** | **25.100 ft**, FS full throttle height, 3.000 rpm, radiator dicht, 21.700 lb, volle bomlast | **A&AEE/767,h 8th Part**, **Table II p.4 / Fig.1 p.5**, [scan](https://www.wwiiaircraftperformance.com/org/mosquito/mosquito_files/lr495-b.pdf) | M (gecorrigeerd) |
| **364 mph TAS** op **20.000 ft**; **379 mph TAS** op **24.000 ft** | FS, +18,0 psi, 3.000 rpm, 21.700 lb, radiator dicht, beladen | **A&AEE/767,h 8th Part**, **Table II p.4**, [scan](https://www.wwiiaircraftperformance.com/org/mosquito/mosquito_files/lr495-b.pdf) | M (gecorrigeerd) |
| **375 mph** op **10.600 ft**, **388 mph** op **23.000 ft** | Overload met +21 psi, 3.000 rpm, respectievelijk MS en FS; speciaal **150-octane** brandstof | **A&AEE/767,h 8th Part**, **Tables I–II p.3–4**, [scan](https://www.wwiiaircraftperformance.com/org/mosquito/mosquito_files/lr495-b.pdf) | M (gecorrigeerd), **niet** vergelijkbaar met +18-run |
| Verlies door externe bommen plus faired racks **geschat op 15–18 mph** | Rapport ziet ongeveer 20 mph daling tussen proefreeksen, maar meldt **circa 5 mph extra verlies door achteruitgang airframe** (in FS-gear) en **crash tijdens nader onderzoek**; **geen exact gescheiden drag- of massameting** | **A&AEE/767,h 8th Part**, **p.1 summary en p.2–3 discussion**, [originele scan](https://www.wwiiaircraftperformance.com/org/mosquito/mosquito_files/lr495-b.pdf) | **A door A&AEE geschat**, **niet** directe zuivere gemeten ΔV |

**De documentketen is waardevol:** op de voorpagina van deel 8 staan verwijzingen naar **deel 3** (*cooling without external bombs*), **deel 4** (*performance without*), **deel 5** (*cooling with two external 500-lb bombs*), **deel 6** (*climb with external bombs*) en deel 7 (ander toestel MM235, paddelbladen). **Deel 3 en 5 zijn de specifiek te zoeken vervolgbijlagen voor een koelweerstandssplitsing.** Deel 4 en 8 bevatten geen geïsoleerde `bomb-only`, `empty-rack` en `weight-only` vluchtproeven op exact gelijke massa en luchtwaardigheid.

**Waarom geen percentage bomweerstand:** 393 mph @13.800 ft en 373 @13.000 ft liggen niet op dezelfde hoogte; 405 @25.700 ft en 383 @25.100 ft evenmin. Zelfs dezelfde-hoogtepunten 20.000 ft (**385 vs 364 mph**) en 24.000 ft (**399 vs 379 mph**) hebben **verschillend genormaliseerd gewicht (20.800 vs 21.700 lb), niet exact gelijke boost (+18,2 vs +18,0), een andere kalenderperiode en airframe-slijtage**. Hun verschil is een *samengesteld verschil tussen twee trials*, niet ‘bommen kosten 21 mph’. A&AEE maakt zelf de 15–18-mph-schatting en ontkent de mogelijkheid de waarde exact te bepalen. Die **15–18 mph** mag als **historische expert-schatting** getoetst worden met forse onzekerheid; een exact percentage `ΔD` of `CD0` zou schijnnauwkeurigheid zijn.

### 3.4 Wat wel en niet uit de drie grafieklijnen mag worden geconcludeerd

- De **P‑38G clean 404 mph TAS op 22.600 ft** is een **sterk toetsbaar historisch punt** met vermogen **1.225 bhp per motor**, niet 1.225 bhp in totaal. De schone blauwe Greg-curve in de buurt is consistent, maar die overeenkomst bewijst zijn bronidentiteit niet.
- De **beladen P‑38G 2×1.100-lb-lijn is nog niet historisch gekalibreerd**. Er is geen aangetroffen originele Wright Field-/Lockheed-proef met **dezelfde G-1, hoogte, 3.000 rpm, turbo, koeling en massa** schoon ↔ lege racks ↔ twee 1.100-lb-bommen. De 2.200 lb bommassa alleen levert geen valide snelheidsverlies: massa beïnvloedt geïnduceerde weerstand, rekken en bommen parasitaire weerstand.
- De Mosquito **B Mk IX** is een **andere variant** dan Gregs **FB Mk VI** en vliegt met **Merlin 72** in plaats van de FB VI-Merlin-configuratie. LR495-data kan een goede **eigen B‑IX stores-regressie** ijken, maar niet zonder heridentificatie aan zijn **FB VI-lijn** gelijkgesteld worden.

**Simulator-toets nu:** P‑38G‑1 **22.600 ft / 404 mph TAS / 2×1.225 bhp / 44,7 inHg /3.000 rpm / koeling faired /13.500 lb**. Mosquito B IX **25.700 ft /405 mph /+18,2 psi /20.800 lb/geen externe racks** en **25.100 ft /383 mph/+18 psi/21.700 lb/2×500 extern +4×500 intern** als **aparte testcases**, gevolgd door een onzekerheidsgevoelige rek/bom-proef van **15–18 mph** historisch geschat, *niet berekend op één altitude-punt*. **Voorlopig:** Gregs bommen-P38- en FBVI-Mosquito-lijnen. **Ontbreekt:** echte matched P‑38G clean/empty racks/loaded report; LR495 A&AEE/767,h **3rd en 5th Parts** (koeling), eventueel **6th Part** (loaded climb); Gregs worksheet en juiste grafiektijdcode.

---

## 4. Brononzekerheid, onafhankelijkheid en prioriteit

1. **Geen pseudoreplicatie:** 1943 en 1944 **LR495** zijn hetzelfde vliegtuig; HTML-transcripties en originele PDFs van A&AEE horen bij dezelfde proef. De transcripten van Eng‑47‑1749‑A en losse JPG-figuren horen bij hetzelfde Wright Field-rapport. W.Nr.619 Nr.2 en Nr.3 horen bij hetzelfde Fw 190-toestel. Source mirrors bieden geen onafhankelijke bevestiging.
2. **Meeteenheden en conversie:** PAS/IAS/ASI mogen niet direct met TAS worden vergeleken. EAS↔TAS via `√(ρ/ρ0)` is bruikbaar bij ISA/werkelijke density, compressibele CAS↔EAS vereist druk, Mach en pitotcorrecties; **geen universele IAS→TAS-factor**. Test-specifieke PEC alleen in haar opgemeten snelheids-/configuratiegebied toepassen. Een Amerikaanse manifold pressure **67 inHg absolute** is niet gelijk aan een Britse **+18 psi boost (gauge)**. Duitse **ata** heeft weer een eigen referentie. Bij geïnstalleerde prop-η niet alleen `J`, maar ook `Cp`, blade-geometrie, prop-RPM, compressibiliteit en installatieconditie matchen.
3. **Fysische termen:** drag polar `CD0`,`k`,`e` zijn niet direct uit één topsnelheid + opgegeven BHP bepaalbaar, omdat propeller-efficiëntie en cooling drag meespeelen. Vermogensoverschot en sustained turn **afgeleide solver-uitkomsten**, tenzij er gematchte klim-/bocht-/decelproeven zijn.
4. **Eerst invoer-match, dan procent:** de P‑51-Excel/simulator-vergelijking is een **eerlijk reproduceerbaar model-vs-model-percentage**, geen historische modelnauwkeurigheid. Voor Gregs twee plaatjes ontbreken as/variant/conditie, dus **geen numeriek procentueel sim-vs-Greg-verschil**. De Mosquito 15–18 mph blijft een historisch door de proefinstantie geraamd effect met gemengde oorzaken.

### Concrete volgende brondoelen (in volgorde)

| Prioriteit | Exact ontbrekend object | Wat het beslisbaar maakt |
|:---:|---|---|
| 1 | **Hamilton Standard K.6523A‑24 (11 ft 2 in), 24D‑50‑65/K-6523-hub** original `C_T/C_P/η`-testkaart of vluchtstuwkracht incl. benodigde temperatuur/ram/radiatorgegevens | Of **0,80 of 0,883** bij P51 20.800 ft/250 mph/67 inHg verdedigbaar is |
| 2 | **Gregs oorspronkelijke Spitfire–Fw190-video, exacte minuut en werkblad**, plus drag `CD0/k/S/W/ρ` | Of x IAS/EAS/TAS en y force/power is, en welk toestelvariant wordt vergeleken |
| 3 | **P‑38G externe-storesproef** clean ↔ lege pylons ↔ **2×1.100 lb**, zelfde hoogte/MP/RPM/massa, oorspronkelijke flight cards | Bom versus rek versus gewicht opsplitsen en Gregs beladen curve historisch valideren |
| 4 | **A&AEE/767,h Parts 3, 5, 6** voor Mosquito **LR495**, plus identificeerbare proeftoestand en koelingsgrafieken | Scheiding koeling, beladen klim, eventueel installatieverlies |
| 5 | **BS543 origineel A&AEE-rapport met genummerde figuren** en eventuele glide/deceleration trials; stabiele datum voor Fw190 A4 783 std. 1,42ata | Gevalideerde polar/curvefit voor Spitfire en 190 zonder Greg-aannames |

**Eindstatus:** Één **kwantitatieve oorzaak** vastgesteld (**+114,700 model-hp = prop-η-keuze**); **twee originele volledige Mosquito-rapporten** en **meerdere onafhankelijke vliegtuigproeven** gelokaliseerd; Gregs **twee 1.100-lb-bommen** gecorrigeerd; de drie ontbrekende **geïnstalleerde-propkaart / Greg-plotmetadata / loaded P‑38G flight cards** blijven open. Het zou methodisch onjuist zijn hier al ‘binnen historische foutmarge’ aan toe te kennen.
