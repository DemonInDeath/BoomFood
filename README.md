# BoomFood

Demonstracinė maisto užsakymo svetainė, sukurta naudojant HTML, CSS ir JavaScript. Tikri užsakymai, mokėjimai ir pristatymai nevykdomi.

## Paleidimas

Atidarykite `index.html` naršyklėje arba paleiskite projektą per VS Code Live Server. Papildomų bibliotekų diegti nereikia. Visi failai turi išlikti savo aplankuose.

## Failų struktūra

- `index.html` – puslapio struktūra, ekranai ir formos.
- `css/style.css` – dizainas, komponentai, animacijos ir mobiliojo ekrano taisyklės.
- `js/script.js` – restoranai, meniu, krepšelis, užsakymai, atsiliepimai, XP ir demonstracinis balansas.
- `images/` – dvi originalios WebP nuotraukos.

CSS blokų eiliškumas ir JavaScript funkcijos išlaikyti. Nuotraukos iškeltos iš Base64 į atskirus failus. Esamos inline stiliaus taisyklės ir įvykio atributas palikti, kad nebūtų keičiamas veikimas.

## Dabartinės galimybės ir ribojimai

- Restoranų katalogas, meniu, krepšelio kiekiai ir demonstracinis užsakymas.
- Užsakymų istorija, atsiliepimai ir XP saugomi naršyklės `localStorage`.
- Krepšelis po perkrovimo neišlieka, o pristatymo simuliacija sustoja perkrovus puslapį.
- Profilis dar neužpildytas; šiame front-end nėra tikros registracijos, API, serverio ar duomenų bazės.
- Antraštės demonstracinis balansas ir XP apdovanojimų balansas yra atskiri.

## Atlikta techninė patikra

- JavaScript sintaksė patikrinta su `node --check`.
- CSS taisyklės ir jų eiliškumas palyginti su originalu; sutampa, išskyrus pakeistą nuotraukos kelią.
- HTML struktūra palyginta su originalu (neįtraukiant iškeltų CSS ir JS bei formatavimo tarpų).
- Abu WebP failai atitinka originalius įterptus vaizdus baitas į baitą.
- Naršyklės testai neatlikti: testavimo aplinka blokavo puslapio atidarymą.

## Patikra prieš sujungiant pakeitimus

- [ ] Patikrinti katalogą ir abiejų nuotraukų atvaizdavimą.
- [ ] Atidaryti meniu, pridėti prekę, keisti kiekį ir pašalinti prekę.
- [ ] Pateikti demonstracinį užsakymą, peržiūrėti būsenas ir istoriją.
- [ ] Pateikti atsiliepimą ir patikrinti, ar jis išlieka perkrovus puslapį.
- [ ] Patikrinti XP, lygių ekraną, profilį ir grįžimą į katalogą.
- [ ] Patikrinti mobilųjį ir kompiuterio ekraną.
