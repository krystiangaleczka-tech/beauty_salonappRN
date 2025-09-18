# 💄 Beauty Salon App
### *Nowoczesne zarządzanie salonem kosmetycznym w jednym miejscu*

<div align="center">

*"Technologia służy ludziom—nasz system sprawia, że zarządzanie salonem jest proste i przyjemne."*

</div>

***

## 🌟 Projekt w Skrócie

Aplikacja do zarządzania salonem kosmetycznym, zbudowana jako monorepo z aplikacją mobilną (React Native/Expo) i interfejsem webowym. Nasz system zapewnia kompleksowe zarządzanie operacjami salonu, w tym inteligentne planowanie wizyt, zarządzanie klientami, koordynację personelu i analitykę biznesową.

***

## 🚀 Stos Technologiczny

### Aplikacja Mobilna
- **Framework**: Expo SDK 54, React Native 0.81.4
- **Routing**: Expo Router 5
- **Zarządzanie stanem**: TanStack Query 5
- **Ikony**: Lucide
- **Uwierzytelnianie**: WebView-based auth flow

### Aplikacja Web
- **Framework**: Vite 6, React 18, React Router 7
- **Serwer deweloperski**: Express
- **UI**: Chakra UI
- **Zarządzanie stanem**: TanStack Query
- **Płatności**: Stripe SDK

### Backend / API
- **Serwer**: Express proxy + Vite middleware (`apps/web/server.js`)
- **Trasy API**: `apps/web/src/app/api/*`
- **Baza danych**: PostgreSQL z konektorem `pg` (`@/app/api/utils/sql.js`)
- **Dane testowe**: Awaryjne przejście na dane testowe

***

## 📁 Struktura Repozytorium

```
beauty_salonappRN/
├── apps/                      # Aplikacje
│   ├── mobile/               # Aplikacja mobilna (Expo/React Native)
│   │   ├── src/              # Kod źródłowy
│   │   │   ├── app/          # Ekrany i routing
│   │   │   ├── components/   # Komponenty
│   │   │   ├── utils/        # Narzędzia
│   │   │   └── config.ts     # Konfiguracja
│   │   ├── assets/           # Zasoby (ikony, ekrany powitalne)
│   │   ├── caches/           # Pliki cache Metro
│   │   ├── patches/          # Poprawki zależności
│   │   ├── polyfills/        # Polyfills dla web/native
│   │   ├── App.tsx           # Wejście aplikacji Expo
│   │   ├── app.json          # Konfiguracja Expo
│   │   ├── eas.json          # Konfiguracja EAS
│   │   ├── metro.config.js   # Konfiguracja Metro
│   │   └── package.json      # Zależności i skrypty
│   └── web/                  # Aplikacja webowa (Vite + React)
│       ├── src/              # Kod źródłowy
│       │   ├── app/          # Routing i layout
│       │   │   ├── api/      # Trasy API
│       │   │   ├── layout.jsx # Główny layout
│       │   │   ├── page.jsx  # Domyślna strona
│       │   │   └── root.tsx  # Integracja React Router
│       │   ├── __create/     # Narzędzia deweloperskie
│       │   ├── client-integrations/ # Integracje klienta
│       │   ├── utils/        # Narzędzia
│       │   └── auth.js       # Konfiguracja uwierzytelniania
│       ├── plugins/          # Wtyczki Vite
│       ├── server.js         # Serwer Express
│       ├── test-server.js    # Serwer testowy
│       ├── test/             # Testy
│       ├── vite.config.ts    # Konfiguracja Vite
│       └── package.json      # Zależności i skrypty
├── packages/                 # Współdzielone pakiety
│   └── types/                # Współdzielone typy TypeScript
├── PROJECT_OVERVIEW.md       # Przegląd projektu
├── README.md                 # Dokumentacja
└── user_rules.md             # Zasady użytkownika
```

***

## 🛠️ Jak Uruchomić

### Wymagania Wstępne
- Node.js 18+
- npm lub yarn

### Szybki Start

1. **Sklonuj repozytorium:**
   ```bash
   git clone https://github.com/krystiangaleczka-tech/beauty_salonappRN.git
   cd beauty_salonappRN
   ```

2. **Uruchom aplikację mobilną (Terminal 1):**
   ```bash
   cd apps/mobile
   npm install
   npx expo start
   ```
   - Symulator iOS: naciśnij `i`
   - Emulator Androida: naciśnij `a`
   - Urządzenie: zeskanuj kod QR w Expo Go

3. **Uruchom aplikację webową (Terminal 2):**
   ```bash
   cd apps/web
   npm install
   HOST=0.0.0.0 npm run dev
   ```
   - Aplikacja dostępna na: http://192.168.100.55:3000
   - API dostępne na: http://localhost:4000 (przez proxy `/api`)

***

## 🏗️ Architektura

### Monorepo
Nasz projekt wykorzystuje architekturę monorepo, co pozwala na:
- Współdzielenie kodu między aplikacjami mobilną i webową
- Ujednolicone zarządzanie zależnościami
- Spójne procesy deweloperskie

### Komunikacja między aplikacjami
- Aplikacja mobilna komunikuje się z API przez serwer deweloperski aplikacji webowej
- Współdzielone typy w `packages/types` zapewniają spójność danych

### Wzorce projektowe
- **API-First**: Projektowanie z myślą o API jako podstawie komunikacji
- **Component-Based**: Modularne komponenty w React i React Native
- **State Management**: Zarządzanie stanem z użyciem TanStack Query

***

## 🎨 Kluczowe Funkcjonalności

### Dla Właścicieli Salonów
- Panel administracyjny do zarządzania usługami
- Analityka biznesowa i śledzenie rezerwacji
- Zarządzanie personelem i dostępnością
- Integracja z systemem płatności Stripe

### Dla Personelu
- Personalny harmonogram pracy
- Historia klientów i ich preferencji
- System powiadomień o nowych rezerwacjach
- Mobilny interfejs do zarządzania wizytami

### Dla Klientów
- Intuicyjna aplikacja mobilna do przeglądania usług
- System rezerwacji wizyt online
- Powiadomienia o nadchodzących wizytach
- Historia poprzednich wizyt i preferencji

***

## 🔧 Przepływ Deweloperski

### Struktura pracy
- **Mobile**: Expo Router z routingiem opartym na plikach
- **Web**: React Router z routingiem opartym na plikach
- **API**: Trasy API w `apps/web/src/app/api/*` z obsługą bazy danych PostgreSQL

### Konwencje
- **Ścieżki**: Wiele plików API webowych używa aliasowania ścieżek `@/app/...`
- **Pobieranie danych**: Aplikacja mobilna pobiera dane z `/api` oczekując, że serwer deweloperski web będzie proxy do backendu
- **API Services**: Mobilny `services.jsx` używa `GET /api/services` i oczekuje pól: `id`, `name`, `description`, `category`, `duration_minutes`, `price`
- **Style**: Aplikacja mobilna używa stylów inline z ciepłą paletą. Web używa globalnego CSS i Chakra UI

***

## 🧪 Testowanie

### Aplikacja Webowa
```bash
cd apps/web
npm test
npm run test:coverage
```

### API
```bash
cd apps/web
npm run test:api
```

***

## 📚 Dokumentacja

- **Przegląd projektu**: `PROJECT_OVERVIEW.md`
- **Zasady użytkownika**: `user_rules.md`
- **API Dokumentacja**: Dostępna po uruchomieniu serwera deweloperskiego

***

## 🚀 Wdrożenie

### Rozwój
- **Mobile**: Expo Development Build
- **Web**: Serwer deweloperski Express + Vite

### Produkcja
- **Mobile**: EAS Build dla iOS i Android
- **Web**: Vercel/Netlify z globalnym CDN
- **API**: Railway/Heroku z PostgreSQL

***

## 📄 Licencja

### MIT License

Copyright (c) 2025 Beauty Salon App

Udzielono niniejszym zgody, bezpłatnie, każdej osobie, która uzyska kopię tego oprogramowania i powiązanych plików dokumentacji („Oprogramowanie”), do korzystania z Oprogramowania bez ograniczeń, w tym bez ograniczeń praw do używania, kopiowania, modyfikowania, łączenia, publikowania, dystrybuowania, sublicencjonowania i/lub sprzedawania kopii Oprogramowania, oraz do zezwalania osobom, którym Oprogramowanie jest dostarczone, na wykonywanie powyższych, pod następującymi warunkami:

Powyższe powiadomienie o prawach autorskich oraz to powiadomienie o zezwoleniu muszą być zawarte we wszystkich kopiach lub istotnych częściach Oprogramowania.

OPROGRAMOWANIE JEST DOSTARCZANE W FORMIE „JAK JEST”, BEZ JAKIEJKOLWIEK GWARANCJI, WYRAŹNEJ LUB DOROZUMIANEJ, W TYM MIĘDZY INNYMI GWARANCJI PRZYDATNOŚCI HANDLOWEJ, PRZYDATNOŚCI DO OKREŚLONEGO CELU ORAZ NARUSZANIA PRAW. W ŻADNYM WYPADKU AUTORZY LUB POSIADACZE PRAW AUTORSKICH NIE PONOSZĄ ODPOWIEDZIALNOŚCI ZA JAKIEKOLWIE ROSZCZENIA, SZKODY LUB INNE OBIĄZKI, CZY TO W ZWIĄZKU Z UMOWĄ, CZY Z DELIKTEM, CZY INNIE, WYNIKAJĄCE Z OPROGRAMOWANIA LUB UŻYCIA LUB INNYCH DZIAŁAŃ W OPROGRAMOWANIU.

### Wyjaśnienie licencji w języku polskim

Niniejsze oprogramowanie jest udostępnione na licencji MIT, co oznacza, że:

1. **Możesz swobodnie korzystać z oprogramowania** - bez ograniczeń, w tym w celach komercyjnych.
2. **Możesz modyfikować oprogramowanie** - dostosowując je do swoich potrzeb.
3. **Możesz dystrybuować oprogramowanie** - udostępniając je innym.
4. **Możesz używać oprogramowania w zamkniętych projektach** - nie musisz udostępniać swoich modyfikacji.

Jedynym warunkiem jest zachowanie powiadomienia o prawach autorskich oraz niniejszego zezwolenia we wszystkich kopiach lub istotnych częściach oprogramowania.

Oprogramowanie jest dostarczane w formie „jak jest”, bez jakichkolwiek gwarancji. Autorzy nie ponoszą odpowiedzialności za szkody wynikające z jego użycia.

***

## 🤝 Współpraca

1. Postępuj zgodnie z ustalonym stylem kodowania (ESLint, Prettier)
2. Pisz testy dla nowych funkcji
3. Aktualizuj dokumentację w razie potrzeby
4. Postępuj zgodnie z przepływem pracy opartym na zadaniach

***

<div align="center">

### *"Dziękujemy za wybór naszej aplikacji do zarządzania salonem kosmetycznym"*

**🌟 Zrobione z pasją dla branży beauty 🌟**

***

*Gotowy, aby usprawnić zarządzanie swoim salonem? Rozpocznij już dziś! 💄✨*

</div>