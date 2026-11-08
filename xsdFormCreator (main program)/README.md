A program telepítésének és futtatásának feltételei

Az alkalmazás futtatásához az alábbi szoftverek és eszközök szükségesek:
- Node.js: A backend futtatásához és a JavaScript-függőségek kezeléséhez szükséges.
- npm: A Node.js csomagkezelője, amellyel a projekt függőségei telepíthetők.
- Angular CLI: A frontend fejlesztői kiszolgálásához és buildeléséhez szükséges.
- MongoDB: Az alkalmazás adatainak tárolására szolgáló adatbázis-kezelő rendszer.

Telepítés és konfigurálás
1. A projekt letöltése vagy klónozása után meg kell nyitni a frontend és a backend mappáját.
2. Mindkét mappában telepíteni kell a szükséges függőségeket az npm install parancs segítségével.
3. Telepíteni és elindítani kell a MongoDB adatbázis-kezelő rendszert.
4. A backend konfigurációjában (.ENV fájlban) amennyiben nem helyileg futtatja az adatbázist, akkor be kell állítani az adatbázis-kapcsolatot, valamint érdemes a JWT-titkosító kulcsot megváltoztatni.

A fejlesztői környezet futatásához két külön terminálablak megnyitása szükséges.

Backend indítása:
cd backend
npm install
npm start

Frontend inditása:
cd frontend
npm install
ng serve

A kliensoldal ezt követően általában a http://localhost:4200 címen érhető el, míg a szerveroldal a konfigurációban meghatározott porton fogadja a kéréseket.

Élő környezetben az alkalmazás futtatása eltér a fejlesztői környezetben alkalmazott módszertől és további teendőkre van szükség.
1. A backend konfigurációjában (.ENV fájlban) a fordított proxy és hosting platrformok használatához a TRUST_PROXY=TRUE kell állítani, és át kell állítani a frontend címét.
2. A frontend/src/enviroments mappában az environment.production.ts fájlban át kell állítani az apiURL, hogy a backend szerverre mutasson.

A backend éles környezetben is Node.js segítségével fut. A szerver elindítható a npm start paranccsal, azonban célszerű valamilyen folyamatkezelő eszközt (például a PM2-t) használni. Ez lehetővé teszi a backend folyamatos működésének biztosítását, az esetleges hibák utáni újraindítást és a naplófájlok kezelését.

A frontenden az Angular alkalmazásból először optimalizált buildet kell készíteni az alábbi paranccsal:

ng build --configuration production

A parancs létrehozza a frontend futtatásához szükséges statikus fájlokat, amelyek tartalmazzák a HTML-, CSS- és JavaScript-állományokat. Ezeket egy webszerver segítségével lehet elérhetővé tenni a felhasználók számára.

Az adatbázis-kezelést ebben az esetben is a MongoDB végzi. Az adatbázis lehet ugyanazon a szerveren telepítve, mint a backend, de külön szerveren vagy felhőalapú szolgáltatásként is működhet.