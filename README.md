# TransEU Agent

Aplikacja do zarządzania zleceniami transportowymi.

## Instalacja

```bash
npm install
```

## Uruchamianie aplikacji

### Tryb deweloperski (oddzielne serwery)

```bash
# Uruchomienie React App
npm start

# Uruchomienie JSON Server (w osobnym terminalu)
npm run server
```

### Tryb deweloperski (jednoczesne uruchomienie)

```bash
npm run dev
```

### Tryb produkcyjny (zintegrowany serwer)

```bash
npm run prod
```

## Wdrożenie

Aplikacja jest gotowa do wdrożenia na platformach takich jak Heroku, Render, Railway itp.

### Heroku

```bash
heroku create
git add .
git commit -m "Przygotowanie do wdrożenia"
git push heroku master
```

### Render/Railway

Skonfiguruj nowy projekt, wskazując na to repozytorium i ustaw komendę startową:

```
npm run start-server
```

## Struktura projektu

- `/src` - Kod źródłowy aplikacji React
- `/build` - Skompilowana wersja aplikacji (generowana po `npm run build`)
- `db.json` - Baza danych JSON
- `server.js` - Zintegrowany serwer (Express + JSON Server)
