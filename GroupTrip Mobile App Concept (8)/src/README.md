# GroupTrip - Grupowe zakupy biletów

Aplikacja mobilna do organizowania grupowych zakupów biletów do atrakcji górskich i termalnych w rejonie Tatr.

## 🚀 Funkcje

- ✅ Tworzenie grup zakupowych (min. 15 osób)
- ✅ Zapraszanie uczestników
- ✅ System płatności grupowych
- ✅ Panel Pracownika do weryfikacji dostępności
- ✅ Automatyczne wysyłanie biletów po potwierdzeniu
- ✅ Elastyczna wielkość grup (może rosnąć powyżej minimum)

## 🛠️ Stack technologiczny

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase Edge Functions (Hono)
- **Baza danych:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Hosting:** Vercel

## 📦 Instalacja lokalna

```bash
# Zainstaluj zależności
npm install

# Uruchom lokalnie
npm run dev

# Zbuduj do produkcji
npm run build
```

## 🌐 Wdrożenie

### ⚠️ WAŻNE: Problem z iOS Safari w iframe

Aplikacja **NIE DZIAŁA** poprawnie na iOS Safari gdy jest testowana z preview Figma (iframe)!
iOS Safari blokuje wszystkie touch eventy w iframe z sandbox restrictions.

**Musisz wdrożyć na prawdziwą domenę aby działało na iOS!**

### Backend (Supabase Edge Functions)

Backend jest już wdrożony na Supabase:
```bash
npx supabase login
npx supabase link --project-ref byoeqycvtyyjmqszjeuh
npx supabase functions deploy server
```

### Frontend (Vercel) - OBOWIĄZKOWE dla iOS!

**Opcja 1: Deploy przez Vercel CLI (najszybsza)**
```bash
npm install -g vercel
vercel --prod
```

**Opcja 2: Deploy przez GitHub**
1. Stwórz repozytorium na GitHub
2. Wrzuć kod: 
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin [twoje-repo]
   git push -u origin main
   ```
3. Idź na vercel.com
4. Import repository
5. Deploy!

**Po wdrożeniu:** Testuj na iOS z prawdziwej domeny (np. `twoja-app.vercel.app`), nie z Figma preview!

## 🔑 Zmienne środowiskowe

Backend używa automatycznie zmiennych z Supabase:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

## 👤 Konto Pracownika

Tylko `claudia.wolna@op.pl` otrzymuje automatyczne uprawnienia staff podczas rejestracji.

## 📄 Licencja

Proprietary - GroupTrip © 2025
