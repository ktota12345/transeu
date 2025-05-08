
Transeu Agent – Development Setup
=================================

Opis:
-----
Projekt frontendowy (React) do zarządzania agentami i zleceniami, z backendem opartym o NestJS oraz tymczasowy serwer Express jako mock API. Docelowo backend będzie korzystał z bazy PostgreSQL i Prisma ORM.

Struktura:
----------
- `apps/app` – frontend React (Create React App)
- `apps/api` – backend NestJS (port domyślny: 3001)
- `server.js` – tymczasowy serwer Express z routingiem REST pod `/api/*`
- `db.json` – plik z danymi mockowymi dla serwera Express

Instalacja:
-----------
1. Zainstaluj zależności:
   ```bash
   yarn install
   ```

2. Utwórz plik `.env` w katalogu `apps/app`:
   ```env
   REACT_APP_NEST_API_URL=http://localhost:3001
   ```

3. Uruchom projekt:
   ```bash
   
   yarn dev:all

   ```

Dodatkowe informacje:
---------------------
- Tymczasowy backend (Express) uruchamiany przez `npm run server`
- Endpointy REST dostępne pod `/api/agents`, `/api/orders`, itd.
- NestJS CORS włączone globalnie (`origin: '*'`)

Autorzy:
--------
Effectit AB Team
