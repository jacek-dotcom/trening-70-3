# Trening 70.3

Lokalna aplikacja do planu treningowego (Ironman 70.3). Bez backendu, bez logowania.
Plan trzymasz w plikach JSON w `data/`, wpisy po treningach zapisują się w `localStorage` przeglądarki.

Stack: Vite + React + TypeScript + Tailwind 4. Zero dodatkowych bibliotek.

## Uruchomienie

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # statyczna wersja w dist/ (można otworzyć z dysku lub wrzucić na dowolny hosting)
```

Na tym Macu Node jest w `~/.local/node/bin` – jeśli `npm` nie jest widoczny, uruchom
`export PATH="$HOME/.local/node/bin:$PATH"`.

Na telefonie: otwórz `npm run dev -- --host` (adres z sieci lokalnej) albo zbudowany `dist/`
z dowolnego serwera, potem Safari → Udostępnij → **Do ekranu początkowego**. Aplikacja ma manifest
i service worker, więc po dodaniu działa jak natywna (w buildzie także offline).

## Jak dodać nowy tydzień (jedyna rzecz, którą trzeba robić regularnie)

Dodaj plik **`data/weeks/RRRR-MM-DD.json`** gdzie data to **poniedziałek** tygodnia.
Aplikacja wczytuje wszystkie pliki z tego folderu automatycznie – kodu nie trzeba ruszać.
Jeśli dla bieżącego tygodnia nie ma pliku, app pokazuje najbliższy przyszły plan.

### Schemat tygodnia

```jsonc
{
  "week": "2026-11-16",          // poniedziałek (to samo co nazwa pliku)
  "phase": "Wdrożenie",          // opcjonalnie – nazwa fazy
  "goal": "Cel tygodnia…",       // opcjonalnie
  "days": {                      // klucze: pn, wt, sr, cz, pt, sb, nd; brak klucza = dzień wolny
    "sr": {
      "sport": "bike",           // bike | swim | strength | recovery | run | rest
      "title": "Trenażer Z2",
      "duration": 60,            // minuty (łącznie)
      "goal": "Opis celu sesji", // opcjonalnie
      "blocks": [ /* patrz niżej */ ]
    }
  }
}
```

### Bloki (`blocks[]`)

Każdy blok ma `part`: `warmup` | `main` | `cooldown`. Pozostałe pola zależą od typu sesji:

| Typ | Pola | Przykład |
|---|---|---|
| Rower – stały | `duration` (min), `ftp` (% FTP) | `{ "part": "main", "duration": 40, "ftp": 65 }` |
| Rower – rampa | `duration`, `ftp`, `ftpTo` | `{ "part": "warmup", "duration": 10, "ftp": 45, "ftpTo": 65 }` |
| Rower – interwały | `repeat`, `on`, `off` | `{ "part": "main", "repeat": 4, "on": { "duration": 4, "ftp": 105 }, "off": { "duration": 3, "ftp": 55 } }` |
| Basen | `meters`, `text` | `{ "part": "main", "name": "Technika", "meters": 800, "text": "4×50 catch-up…" }` |
| Siła | `exercises[]` z `name`, `sets`, `reps`, `note` | `{ "part": "main", "exercises": [ { "name": "Przysiad goblet", "sets": 3, "reps": "10" } ] }` |
| Dowolny | `name`, `duration`, `text` | `{ "part": "main", "name": "Spacer", "duration": 20, "text": "tętno < 110" }` |

Pola wspólne, opcjonalne: `name` (etykieta; domyślnie Rozgrzewka / Część główna / Schłodzenie), `text` (opis).

Waty wyliczają się automatycznie z ostatniego FTP w `metrics.json`.
Bloki rowerowe trafiają do pliku `.zwo` (przycisk „Pobierz plik treningu” → MyWhoosh / Zwift).

### Pełny przykład: `data/weeks/2026-11-16.json`

Zobacz plik w repo – zawiera siłę A/B, basen (technika), 2× trenażer Z2, regenerację i basen + mobility.
Najprościej: skopiuj go, zmień `week`, podmień dni.

## Pozostałe pliki danych

### `data/season.json` – oś sezonu

```jsonc
{
  "name": "Sezon 2026/27 – Ironman 70.3",
  "phases": [ { "name": "Baza I", "from": "2027-01-04", "to": "2027-02-14", "color": "blue" } ],
  //  color: gray | green | blue | orange | red | purple
  "races":  [ { "date": "2027-08-08", "name": "Ironman 70.3", "priority": "A" } ],   // A | B | C
  "tests":  [ { "date": "2026-11-14", "name": "Test FTP 20'" } ]
}
```

### `data/metrics.json` – testy i pomiary

```jsonc
{
  "ftp":       [ { "date": "2026-11-07", "value": 185, "note": "Rampa" } ],   // W
  "vo2max":    [ { "date": "2026-11-07", "value": 43 } ],                     // ml/kg/min
  "restingHr": [ { "date": "2026-11-07", "value": 55 } ]                      // bpm
}
```

Po nowym teście dopisz wpis do odpowiedniej listy. Ostatni FTP (po dacie) steruje strefami i watami w planie.
Strefy Coggana: Z1 <55 %, Z2 56–75 %, Z3 76–90 %, Z4 91–105 %, Z5 106–120 %, Z6 121–150 %, Z7 >150 % FTP.

### `data/tasks.json` – zadania

```jsonc
[
  { "id": "ftp-test-11", "title": "Zrobić test FTP 20'", "due": "2026-11-14" },
  { "id": "odprawa-1",   "title": "Odprawa tygodnia", "due": "2026-11-22", "sunday": true }
]
```

`id` musi być unikalne (stan „zrobione” trzyma się w localStorage pod tym kluczem).
`sunday: true` – zadanie pokazuje się w niedzielę jako baner „Do odprawy” w widoku tygodnia.

## Co jest w localStorage (klucze `t703:*`)

| Klucz | Zawartość |
|---|---|
| `t703:log:RRRR-MM-DD` | wpis po treningu: `{ status: done/partial/skipped, rpe, power, hr, note, savedAt }` |
| `t703:tasks` | `{ "<id zadania>": true }` |
| `t703:theme` | `light` / `dark` (brak = systemowy) |

## Odprawa niedzielna

Widok tygodnia → **„Kopiuj podsumowanie tygodnia”** – do schowka trafia zwięzły tekst:
plan vs wykonanie każdego dnia, RPE, moc, tętno, notatki, bilans i otwarte zadania.
Wklej go do Claude i poproś o nowy plik `data/weeks/RRRR-MM-DD.json`.

## MyWhoosh

W szczegółach sesji rowerowej: **„Pobierz plik treningu”** generuje `.zwo` (Zwift Workout, bloki w % FTP).
Import: MyWhoosh → Workouts → My Workouts → Import/Upload. Jeśli import nie zadziała,
rozwiń „Jak zaimportować / przepisać” – jest tam lista bloków do ręcznego wpisania w Workout Builderze.

## Struktura kodu

```
data/                 dane (jedyne co edytujesz)
src/lib/              dates, data (ładowanie JSON), zones (Coggan), storage, zwo, summary
src/components/       SeasonBar, WeekView, DayCard, DayDetail, Blocks, FormPanel, LineChart, TasksView, ui
public/               manifest PWA, ikony, service worker
```
