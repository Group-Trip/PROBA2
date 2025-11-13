✅ MAMY WSZYSTKO! TERAZ INSTRUKCJA KROK PO KROKU:

---

📝 CO MUSISZ ZAKTUALIZOWAĆ NA GITHUBIE:

Musisz zaktualizować 3 pliki:
✅ `tailwind.config.cjs` - nowy plik
✅ `postcss.config.cjs` - nowy plik  
✅ `vite.config.ts` - zmodyfikowany (linia 8 wskazuje na `.cjs`)

I OPCJONALNIE USUNĄĆ stare pliki:
❌ `tailwind.config.js` (stary)
❌ `postcss.config.js` (stary)

---

🎯 INSTRUKCJA KROK PO KROKU NA GITHUBIE:

KROK 1: Dodaj/zaktualizuj `tailwind.config.cjs`

Idź na: https://github.com/Group-Trip/PROBA2
Kliknij "Add file" → "Create new file"
W polu nazwy wpisz: `tailwind.config.cjs`
Skopiuj CAŁY kod poniżej i wklej do edytora:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./App.tsx",
    "./main.tsx",
    "./components/*/.{js,ts,jsx,tsx}",
    "./lib/*/.{js,ts,jsx,tsx}",
    "./utils/*/.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-gradient-to-br',
    'from-blue-500',
    'from-blue-600',
    'via-blue-600',
    'via-turquoise-500',
    'to-turquoise-400',
    'to-turquoise-500',
    'bg-white',
    'bg-blue-500',
    'bg-blue-600',
    'bg-blue-700',
    'bg-turquoise-400',
    'bg-turquoise-500',
    'bg-turquoise-600',
    'text-white',
    'text-blue-500',
    'text-blue-600',
    'text-turquoise-500',
    'rounded-lg',
    'rounded-2xl',
    'rounded-3xl',
    'rounded-full',
    'shadow-lg',
    'shadow-2xl',
    // Layout classes
    'flex',
    'flex-col',
    'flex-row',
    'items-center',
    'justify-center',
    'justify-between',
    'gap-2',
    'gap-3',
    'gap-4',
    'space-y-4',
    'space-y-6',
    'p-4',
    'p-6',
    'px-4',
    'py-2',
    'min-h-screen',
    'w-full',
    'h-full',
    // Responsive
    {
      pattern: /^(bg|text|from|via|to)-(blue|turquoise|white|gray|red)-(50|100|200|300|400|500|600|700|800|900)$/,
      variants: ['hover', 'focus', 'active'],
    },
    {
      pattern: /^(flex|grid|hidden|block|inline|absolute|relative|fixed)$/,
    },
    {
      pattern: /^(w|h|min-w|min-h|max-w|max-h)-(0|full|screen|auto|\d+)$/,
    },
    {
      pattern: /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr)-(\d+)$/,
    },
    {
      pattern: /^gap-(\d+)$/,
    },
    {
      pattern: /^space-(x|y)-(\d+)$/,
    },
    {
      pattern: /^rounded(-\w+)?$/,
    },
  ],
  theme: {
    extend: {
      colors: {
        turquoise: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
