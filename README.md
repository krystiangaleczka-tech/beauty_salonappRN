# Beauty Salon App (React Native)

Aplikacja do zarządzania salonem kosmetycznym, zbudowana jako monorepo z aplikacją mobilną (React Native/Expo) i interfejsem webowym.

## Stos Technologiczny

- **Monorepo**: `apps/mobile` (Expo/React Native), `apps/web` (Vite + React Router + Express dev server)
- **Język**: TypeScript i JavaScript
- **Mobilny**: Expo SDK 54, React Native 0.81.4, Expo Router 5, TanStack Query 5, ikony Lucide
- **Web**: Vite 6, React 18, React Router 7, Express dev server, Chakra UI, TanStack Query, Stripe SDK
- **Serwer/API (dev)**: Express proxy + Vite middleware (`apps/web/server.js`), trasy API w `apps/web/src/app/api/*`
- **Warstwa DB**: PostgreSQL z konektorem `pg` (`@/app/api/utils/sql.js`), z awaryjnym przejściem na dane testowe

## Jak Uruchomić

### Aplikacja Mobilna (Expo)
- Z głównego katalogu repozytorium: `cd apps/mobile && npx expo start`
- Symulator iOS: naciśnij `i`; emulator Androida: naciśnij `a`; urządzenie: zeskanuj kod QR w Expo Go

### Aplikacja Web (Vite + Express)
- Z głównego katalogu repozytorium: `cd apps/web && npm i`, następnie `HOST=0.0.0.0 npm run dev` (uruchamia `node server.js`)
- Otwiera serwer deweloperski na http://localhost:3000 (dostępny na wszystkich interfejsach sieciowych)
- Dla połączenia z aplikacją mobilną: Użyj `HOST=0.0.0.0` aby powiązać serwer ze wszystkimi interfejsami
- Proxy API do http://localhost:4000 via `/api` (zobacz `apps/web/server.js`)

## Struktura Repozytorium

- `apps/`
  - `mobile/` — Aplikacja Expo/React Native
  - `web/` — Aplikacja webowa Vite + React i trasy API

## Aplikacja Mobilna (apps/mobile)

Aplikacja mobilna zbudowana na Expo i React Native, oferująca:
- Przeglądanie usług salonu z kategoriami (Manicure, Pedicure, Podologia, Zabiegi na twarz, Brwi, Makijaż permanentny, Inne)
- Rezerwację usług
- Panel użytkownika
- Integrację z systemem uwierzytelniania

### Główne komponenty
- Ekran główny z zakładkami
- Lista usług z filtrowaniem po kategoriach
- Proces rezerwacji usług
- Panel użytkownika

## Aplikacja Web (apps/web)

Aplikacja webowa z serwerem deweloperskim Express, oferująca:
- Interfejs administracyjny
- API endpoints dla usług, rezerwacji i kalendarza
- Integrację z Stripe
- Panel administracyjny

### API Endpoints
- `/api/services` - Zarządzanie usługami
- `/api/bookings` - Zarządzanie rezerwacjami
- `/api/availability` - Dostępność terminów
- `/api/calendar/availability` - Dostępność kalendarza
- `/api/auth/*` - Endpoints uwierzytelniania

## Konwencje i Notatki

- **Ścieżki**: Wiele plików API webowych używa aliasowania ścieżek `@/app/...`
- **Pobieranie danych**: Aplikacja mobilna pobiera dane z `/api` oczekując, że serwer deweloperski web będzie proxy do backendu
- **API Services**: Mobilny `services.jsx` używa `GET /api/services` i oczekuje pól: `id`, `name`, `description`, `category`, `duration_minutes`, `price`. Filtrowanie po kategoriach jest po stronie serwera via `?category=` param
- **Style**: Aplikacja mobilna używa stylów inline z ciepłą paletą. Web używa globalnego CSS i Chakra UI

## Przyszłe Prace / Pamięć

- Jeśli dodajesz nowe kategorie usług, zapewnij spójność ciągów `category` w DB i danych testowych
- ✅ Filtrowanie po stronie serwera zaimplementowane w `apps/web/src/app/api/services/route.js` przez parametr zapytania `?category=Pedicure`
- Dodaj testy dla endpointów API używając `vitest`
- Udokumentuj zmienne środowiskowe w `apps/web/.env`
- scentralizuj współdzielone typy dla Service między mobile a web (np. `/packages/types`)

## Licencja

[Dodaj informacje o licencji]