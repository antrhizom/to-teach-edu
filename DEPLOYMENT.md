# 🚀 Deployment Guide für Vercel

## Schnellstart (5 Minuten)

### Schritt 1: Firebase Setup
1. Gehe zu https://console.firebase.google.com/
2. Erstelle neues Projekt
3. Aktiviere **Realtime Database** (Testmodus, europe-west1)
4. Aktiviere **Storage** (Testmodus, europe-west1)
5. Kopiere deine Firebase Config

### Schritt 2: Environment Variables
Erstelle `.env.local` im Projektordner:

```bash
cp .env.example .env.local
```

Trage deine Firebase-Daten ein!

### Schritt 3: Installation
```bash
npm install
```

### Schritt 4: Test lokal
```bash
npm run dev
```
→ Öffne http://localhost:3000

### Schritt 5: Vercel Deployment

#### Option A: Vercel CLI (Schnellste Methode)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production Deploy
vercel --prod
```

#### Option B: GitHub + Vercel (Empfohlen für Teams)
```bash
# 1. Initialisiere Git
git init
git add .
git commit -m "Initial commit"

# 2. Erstelle GitHub Repo und pushe
git branch -M main
git remote add origin https://github.com/dein-username/repo-name.git
git push -u origin main

# 3. Gehe zu vercel.com
# 4. Klicke "New Project"
# 5. Importiere dein GitHub Repo
# 6. Füge Environment Variables hinzu (siehe unten)
# 7. Klicke "Deploy"
```

### Schritt 6: Environment Variables in Vercel

In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY = dein_wert
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = dein_wert
NEXT_PUBLIC_FIREBASE_DATABASE_URL = dein_wert
NEXT_PUBLIC_FIREBASE_PROJECT_ID = dein_wert
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = dein_wert
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = dein_wert
NEXT_PUBLIC_FIREBASE_APP_ID = dein_wert
NEXT_PUBLIC_ADMIN_CODE = dein_admin_code
```

**Wichtig**: Alle Variablen für Production, Preview UND Development hinzufügen!

---

## 🔒 Firebase Security Rules

### Realtime Database Rules
```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": true,
        ".write": "!data.exists() || data.child('code').val() == newData.child('code').val()"
      }
    },
    "comments": {
      ".read": true,
      ".write": true
    },
    "pdfs": {
      ".read": true,
      ".write": true
    }
  }
}
```

### Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /pdfs/{taskId}/{fileName} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

---

## ✅ Checkliste

- [ ] Firebase-Projekt erstellt
- [ ] Realtime Database aktiviert
- [ ] Storage aktiviert
- [ ] Firebase Config kopiert
- [ ] `.env.local` erstellt und ausgefüllt
- [ ] `npm install` ausgeführt
- [ ] Lokal getestet (`npm run dev`)
- [ ] Git Repository erstellt
- [ ] Zu GitHub gepusht
- [ ] Vercel Projekt erstellt
- [ ] Environment Variables in Vercel eingetragen
- [ ] Production Deployment erfolgreich
- [ ] Firebase Rules veröffentlicht
- [ ] App getestet (als User & Admin)

---

## 🎉 Fertig!

Deine App ist jetzt live auf:
```
https://dein-projekt.vercel.app
```

### Nächste Schritte:
1. ✅ Teste alle Funktionen
2. ✅ Lade erste PDFs hoch (als Admin)
3. ✅ Erstelle Test-User
4. ✅ Teile den Link mit Teilnehmern

---

## 🐛 Troubleshooting

### Build Error in Vercel
- Check Environment Variables (alle gesetzt?)
- Check Node.js Version (18+ required)
- Check Build Logs in Vercel Dashboard

### Firebase Connection Error
- Check `.env.local` Syntax
- Check Firebase Rules sind veröffentlicht
- Check databaseURL Format: `https://...firebasedatabase.app`

### 404 Error nach Deployment
- Check `next.config.js`
- Check `package.json` build script
- Redeploy mit `vercel --prod --force`

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Firebase Docs: https://firebase.google.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**Happy Deploying! 🚀**
