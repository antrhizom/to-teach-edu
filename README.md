# 🚀 to-teach.ai Weiterbildung - Next.js Version (Firestore)

## 🎯 Moderne, professionelle Weiterbildungsplattform mit Firestore

Diese Version nutzt **Firestore** - Googles moderne NoSQL-Datenbank!

### Warum Firestore?
- ✅ **Modernere Technologie** - Aktiv von Google entwickelt
- ✅ **Bessere Queries** - Filtern, Sortieren, Pagination
- ✅ **Auto-Scaling** - Wächst automatisch mit
- ✅ **Strukturierter** - Collections & Documents statt JSON-Baum
- ✅ **Zukunftssicher** - Googles offizielle Empfehlung

### Features:
- ✨ **Modernes Design** mit Tailwind CSS & Framer Motion
- ⚡ **Blazing Fast** - Next.js 14 mit App Router
- 🎨 **Beautiful UI** - Professionelles Design mit Animationen
- 📱 **Responsive** - Perfekt auf allen Geräten
- 🔥 **Firestore** - Moderne NoSQL-Datenbank
- 📦 **Storage** - Für PDF-Uploads
- 👨‍💼 **Admin Dashboard** - Vollständige Verwaltung
- 📄 **PDF Upload** - Für jede Aufgabe
- 📊 **Live Statistiken** - Echtzeit-Updates
- 🔒 **TypeScript** - Type-safe Development
- 🚀 **Vercel Ready** - One-Click Deployment

---

## 📦 Installation

### 1. Dependencies installieren

```bash
npm install
```

### 2. Environment Variables

Erstelle `.env.local` im Root:

```env
# Firebase Config (Firestore - KEINE databaseURL nötig!)
NEXT_PUBLIC_FIREBASE_API_KEY=dein_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dein-projekt
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dein-projekt.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Admin Code
NEXT_PUBLIC_ADMIN_CODE=ADMIN2025
```

**Wichtig:** Bei Firestore brauchst du KEINE `databaseURL`!

### 3. Development Server starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

---

## 🔥 Firestore Setup

**Siehe: `FIRESTORE-SETUP.md`** für detaillierte Anleitung!

### Quick Steps:

1. Firebase Console → Neues Projekt
2. **Firestore** aktivieren (NICHT Realtime Database!)
3. Standort: **eur3 (europe-west)**
4. Storage aktivieren
5. Web-App registrieren
6. Config kopieren (6 Werte)
7. `.env.local` ausfüllen
8. Security Rules setzen

---

## 🗄️ Firestore Datenstruktur

```
Firestore:
├── users/ (Collection)
│   └── {userId}/ (Document)
│       ├── username: string
│       ├── group: string
│       ├── code: string
│       ├── createdAt: string
│       ├── completedSubtasks: object
│       └── ratings: object
│
├── comments/ (Collection)
│   └── {commentId}/ (Document)
│       ├── userId: string
│       ├── username: string
│       ├── group: string
│       ├── text: string
│       └── timestamp: string
│
└── pdfs/ (Collection)
    └── {taskId}/ (Document)
        ├── fileName: string
        ├── url: string
        ├── uploadedAt: string
        └── taskId: string
```

**Viel übersichtlicher als JSON-Baum!**

---

## 🚀 Vercel Deployment

### Variante 1: Vercel CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

### Variante 2: GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

Dann in Vercel: Import Repository + Environment Variables hinzufügen

---

## 📁 Projektstruktur

```
weiterbildung-nextjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── lib/
│   │   ├── firebase.ts         # Firebase Init (Firestore)
│   │   ├── firestore.ts        # Firestore Helper Functions ⭐ NEU!
│   │   └── constants.ts
│   └── types/
│       └── index.ts
├── firestore.rules              # Firestore Security Rules ⭐ NEU!
├── storage.rules
├── .env.example
├── package.json
└── README.md
```

---

## 🎨 Firestore Helper Functions

Alle Firestore-Operationen sind in `src/lib/firestore.ts`:

```typescript
// User Operations
createUser(userId, userData)
getUser(userId)
getAllUsers()
getUserByCode(code)
updateUserSubtasks(userId, subtasks)
updateUserRatings(userId, ratings)
deleteUser(userId)

// Comment Operations
createComment(commentData)
getAllComments()
deleteComment(commentId)

// PDF Operations
savePDFData(taskId, pdfData)
getPDFData(taskId)
getAllPDFs()
deletePDFData(taskId)

// Statistics
getUsersByGroup(group)
getUsersCount()
exportAllData()
```

**Vorteil:** Clean Code, wiederverwendbar, typsicher!

---

## 🔒 Sicherheit

### Firestore Security Rules

Siehe `firestore.rules` für Details.

**Highlights:**
- ✅ User können nur eigene Daten ändern (Code-Verifizierung)
- ✅ Validierung von Datentypen & -längen
- ✅ Kommentare max. 500 Zeichen
- ✅ Gruppennamen validiert
- ✅ Public read für Statistiken

---

## 🆚 Firestore vs Realtime Database

| Feature | Realtime DB | Firestore (diese Version) |
|---------|-------------|---------------------------|
| Datenmodell | JSON-Baum | Collections & Documents |
| Queries | Einfach | Sehr mächtig ⭐ |
| Skalierung | Manual | Automatisch ⭐ |
| Offline | Ja | Ja (besser) ⭐ |
| Struktur | Flach | Hierarchisch ⭐ |
| Entwicklung | Maintenance | Aktiv ⭐ |
| Config-Variablen | 7 (mit databaseURL) | 6 (ohne) ⭐ |

---

## 📚 Dokumentation

- **FIRESTORE-SETUP.md** - Firestore Setup-Anleitung
- **FIRESTORE-VS-REALTIME.md** - Detaillierter Vergleich
- **DEPLOYMENT.md** - Vercel Deployment
- **QUICK-START.md** - 5-Minuten Schnellstart

---

## 🐛 Troubleshooting

### "Firestore not initialized"
- Check `.env.local` (alle 6 Variablen gesetzt?)
- Restart dev server

### "Permission denied"
- Check Firestore Rules in Console
- Veröffentlichen klicken
- 30 Sekunden warten

### "Document doesn't exist"
- Normal! Firestore erstellt Documents automatisch
- Erste Operation schreibt Daten

---

## 💡 Tipps

### Firestore Best Practices
- ✅ Nutze Helper Functions aus `firestore.ts`
- ✅ Queries sind günstig - nutze sie!
- ✅ Subcollections für hierarchische Daten
- ✅ Batch-Operations für mehrere Writes
- ✅ Pagination bei großen Listen

### Development
```bash
npm run dev          # Development
npm run build        # Production Build
npm run start        # Production Server
npm run lint         # ESLint
```

---

## 🎉 Fertig!

Du hast jetzt eine **production-ready** Weiterbildungsplattform mit:
- ⚡ Modern Stack (Next.js + Firestore)
- 🎨 Beautiful Design
- 🔥 Scalable Backend
- 🚀 Easy Deployment
- 📊 Powerful Queries
- 🔒 Secure Rules

**Happy Coding! 🚀**

---

**Version**: 3.0.0 (Firestore Edition)  
**Letzte Aktualisierung**: Januar 2025  
**Lizenz**: MIT

