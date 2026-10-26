# DTAX – dtax.hu

Statikus oldal (HTML + CSS + JS, külső függőség és hálózati hívás nélkül).

Helyi futtatás: `python3 -m http.server 8080` a mappában, majd http://localhost:8080

## Mielőtt élesbe megy
- Kapcsolati cím: megkereses@dtax.hu (a `script.js` tetején a `CONTACT_EMAIL`, és az `index.html` kapcsolat- és láblécrésze). A levelezésnek működnie kell, mielőtt az oldal élesedik.
- A felmérés a böngészőben számol, semmit nem küld el. Ha később űrlapszolgáltatás vagy naptárfoglalás kerül mellé, az oldalon lévő adatvédelmi mondatot és az adatkezelési tájékoztatót frissíteni kell.
- Open Graph kép (`og:image`) nincs.
- A logók az átadott SVG-k (F: vízszintes, G: jel/avatar, H: jel betűkkel); az `apple-touch-icon.png` a G sötét avatarból készült.

## Látogatottság-mérés
A főoldalon és az adatkezelési oldalon a GoatCounter (dtax.goatcounter.com) szkriptje fut. Sütit nem használ; a felmérés válaszait nem látja. Az adatkezelési tájékoztató ennek megfelelően frissítve.
