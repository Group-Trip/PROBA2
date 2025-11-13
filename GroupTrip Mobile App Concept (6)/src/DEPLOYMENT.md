# 🚀 Instrukcja Wdrożenia GroupTrip

## ⚠️ KRYTYCZNE: Dlaczego aplikacja nie działa na iOS w Figma?

**Problem:** iOS Safari całkowicie blokuje touch eventy (kliknięcia, input) gdy aplikacja jest w iframe.

**Przyczyna:** Figma Make serwuje preview aplikacji w iframe z sandbox restrictions, które iOS Safari ignoruje.

**Rozwiązanie:** Aplikację MUSISZ wdrożyć na prawdziwą domenę (Vercel, Netlify, etc.)

---

## ✅ Szybkie Wdrożenie (5 minut)

### Metoda 1: Vercel CLI (NAJSZYBSZA)

```bash
# 1. Zainstaluj Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod

# 3. Gotowe! 
# Otrzymasz link typu: https://grouptrip-xyz.vercel.app
```

### Metoda 2: Vercel przez przeglądarkę

1. Pobierz cały projekt jako ZIP z Figma
2. Idź na https://vercel.com
3. Zaloguj się przez GitHub
4. Kliknij "Add New..." → "Project"
5. Przeciągnij folder projektu (drag & drop)
6. Kliknij "Deploy"
7. Gotowe!

---

## 📱 Testowanie na iOS

Po wdrożeniu:

1. **Otwórz prawdziwą domenę** (np. `grouptrip-xyz.vercel.app`)
2. **NIE** otwieraj przez Figma preview
3. Testuj na iPhone Safari
4. Wszystko powinno działać! ✅

---

## 🔧 Backend (już wdrożony)

Backend jest już wdrożony na Supabase i działa poprawnie.

Jeśli potrzebujesz zredeploy backend:

```bash
npx supabase login
npx supabase link --project-ref byoeqycvtyyjmqszjeuh
npx supabase functions deploy server
```

---

## 🌐 Custom Domena (opcjonalne)

Po wdrożeniu na Vercel możesz dodać własną domenę:

1. Idź do projektu na Vercel
2. Settings → Domains
3. Dodaj swoją domenę
4. Skonfiguruj DNS (Vercel pokaże instrukcje)

---

## ✅ Checklist Wdrożenia

- [ ] Deploy na Vercel
- [ ] Sprawdź czy strona ładuje się na desktopie
- [ ] Sprawdź czy strona ładuje się na iOS Safari (z prawdziwej domeny!)
- [ ] Przetestuj logowanie
- [ ] Przetestuj tworzenie grupy
- [ ] Przetestuj dołączanie do grupy
- [ ] Przetestuj płatności
- [ ] Przetestuj Panel Pracownika (claudia.wolna@op.pl)

---

## 🆘 Problemy?

**Aplikacja nadal nie działa na iOS:**
- Upewnij się że testujesz z prawdziwej domeny Vercel, NIE z Figma preview
- Wyczyść cache Safari (Settings → Safari → Clear History and Website Data)
- Spróbuj w trybie prywatnym

**Build error na Vercel:**
- Sprawdź czy wszystkie pliki są w repozytorium
- Sprawdź czy package.json ma wszystkie dependencies

**Backend nie odpowiada:**
- Sprawdź czy zmienne środowiskowe są ustawione w Supabase
- Sprawdź logi: `npx supabase functions logs server`

---

## 📞 Kontakt

Jeśli masz problemy z wdrożeniem, sprawdź logi:
- Vercel: https://vercel.com/[twój-projekt]/deployments
- Supabase: https://supabase.com/dashboard/project/byoeqycvtyyjmqszjeuh/functions
