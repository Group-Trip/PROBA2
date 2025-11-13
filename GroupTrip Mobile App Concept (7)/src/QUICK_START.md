# ⚡ Szybki Start - GroupTrip na iOS

## Problem który właśnie rozwiązaliśmy 🔍

Aplikacja **nie działa na iOS Safari** gdy testujesz przez link Figma, bo:
- Figma serwuje preview w iframe
- iOS Safari **blokuje wszystkie kliknięcia i input** w iframe (to bug Safari!)
- Nie da się tego naprawić w kodzie

## Rozwiązanie ✅

**Wdróż aplikację na Vercel** - zajmie 2 minuty!

---

## 🚀 Instrukcja (2 minuty)

### Opcja A: Vercel przez przeglądarkę (prostsze)

1. Idź na **https://vercel.com**
2. Kliknij **"Sign Up"** i zaloguj się przez GitHub/Google
3. Kliknij **"Add New..."** → **"Project"**
4. Przeciągnij cały folder projektu (lub kliknij Upload)
5. Kliknij **"Deploy"**
6. Poczekaj 1-2 minuty
7. **Gotowe!** Dostaniesz link typu `grouptrip-abc123.vercel.app`

### Opcja B: Vercel CLI (dla zaawansowanych)

```bash
npm install -g vercel
vercel --prod
```

---

## 📱 Testowanie na iPhone

Po wdrożeniu:

1. **Otwórz link Vercel na iPhone** (np. `grouptrip-abc123.vercel.app`)
2. **NIE otwieraj przez Figma!**
3. Przetestuj:
   - ✅ Klikanie przycisków
   - ✅ Wpisywanie w pola
   - ✅ Logowanie
   - ✅ Tworzenie grupy

**Teraz wszystko powinno działać!** 🎉

---

## 🔑 Konto Testowe

**Pracownik (Panel Admin):**
- Email: `claudia.wolna@op.pl`
- Hasło: (wybierz podczas rejestracji)

**Zwykły użytkownik:**
- Dowolny email
- Dowolne hasło

---

## ❓ FAQ

**Q: Czy muszę płacić za Vercel?**
A: Nie! Plan darmowy w zupełności wystarczy.

**Q: Jak długo trwa deploy?**
A: 1-2 minuty.

**Q: Co jeśli nadal nie działa?**
A: 
- Upewnij się że testujesz z linku Vercel, nie z Figma
- Wyczyść cache Safari
- Spróbuj w trybie prywatnym

**Q: Czy backend też muszę wdrażać?**
A: Nie! Backend już działa na Supabase.

---

## 🎯 Następne kroki

Po wdrożeniu możesz:
- Dodać custom domenę (np. `grouptrip.pl`)
- Skonfigurować analytics
- Dodać PWA (install on home screen)
- Skonfigurować push notifications

Wszystko to w panelu Vercel! 🚀
