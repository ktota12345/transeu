
# Transeu Agent - Projekt

Projekt opartej na NestJS aplikacji do zarządzania agentami, który integruje się z bazą danych PostgreSQL przy użyciu Prisma. Aplikacja umożliwia zarządzanie agentami, w tym dodawanie, edytowanie, usuwanie oraz pobieranie danych o agentach transportowych.

## 🛠️ **Instalacja**

1. **Zainstaluj zależności projektu**

   Aby zainstalować wszystkie niezbędne zależności, uruchom:

   ```bash
   yarn install
   ```

2. **Skonfiguruj plik `.env`**

   Skopiuj przykładowy plik `.env.example` do `.env` i zaktualizuj odpowiednie zmienne środowiskowe:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   ```

## ⚙️ **Prisma - Konfiguracja i Migracje**

### 1. **Instalacja Prisma**

Po zainstalowaniu zależności, uruchom następujące komendy, aby zainstalować Prisma oraz wygenerować klienta Prisma:

```bash
yarn prisma generate
```

### 2. **Tworzenie i migracja bazy danych**

Aby rozpocząć pracę z bazą danych przy użyciu Prisma, wykonaj poniższe kroki:

- **Stworzenie migracji**:

  Każdą zmianę w pliku `schema.prisma` (np. dodanie nowych modeli) trzeba zsynchronizować z bazą danych poprzez stworzenie migracji:

   ```bash
   yarn prisma migrate dev --name <nazwa_migracji>
   ```

- **Zastosowanie migracji do bazy danych**:

  Po utworzeniu migracji, możesz zastosować je w środowisku produkcyjnym lub deweloperskim:

   ```bash
   yarn prisma migrate deploy
   ```

### 3. **Generowanie klienta Prisma**

Po każdej zmianie w pliku `schema.prisma`, musisz wygenerować nowego klienta Prisma:

```bash
yarn prisma generate
```

### 4. **Inne komendy Prisma**

- **Sprawdzanie stanu migracji**:
  ```bash
  yarn prisma migrate status
  ```

- **Seeding bazy danych (dodawanie testowych danych)**:
  Aby dodać testowe dane do bazy danych, stwórz plik `prisma/seed.ts` i uruchom poniższą komendę:
  ```bash
  yarn prisma db seed
  ```

- **Sprawdzanie stanu bazy danych**:
  Jeśli chcesz sprawdzić aktualny stan bazy danych w stosunku do pliku `schema.prisma`, uruchom:
  ```bash
  yarn prisma db pull
  ```

- **Usuwanie bazy danych** (tylko w środowisku deweloperskim):
  ```bash
  yarn prisma migrate reset
  ```

### 5. **Dodatkowe informacje**

- **Model bazy danych (schema.prisma)**:

  Struktura bazy danych jest opisana w pliku `prisma/schema.prisma`. W tym pliku możesz dodawać i modyfikować modele danych (np. model `Agent`), który następnie będzie automatycznie odzwierciedlony w bazie danych po migracji.

- **Wykorzystanie Prisma Client**:

  Aby korzystać z Prisma Client w aplikacji NestJS, importuj i wykorzystuj go w odpowiednich serwisach, jak pokazano w przykładzie poniżej:

  ```typescript
  import { PrismaService } from './prisma/prisma.service';

  @Injectable()
  export class AgentsService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
      return this.prisma.agent.findMany();
    }
  }
  ```

## 🚀 **Uruchomienie aplikacji**

1. **Uruchomienie aplikacji w trybie deweloperskim**

   Aby uruchomić aplikację NestJS w trybie deweloperskim, użyj poniższej komendy:

   ```bash
   yarn start:dev
   ```

2. **Uruchomienie aplikacji w trybie produkcyjnym**

   W celu uruchomienia aplikacji w trybie produkcyjnym (po zbudowaniu), użyj:

   ```bash
   yarn build
   yarn start
   ```

## 🧑‍💻 **Rozwój i Dalsza Praca**

- Aby dodawać nowe modele danych, aktualizuj plik `schema.prisma` i generuj migracje.
- Nowe funkcje w aplikacji mogą wymagać utworzenia nowych serwisów, kontrolerów i modeli, co pozwala na łatwą rozbudowę aplikacji.
