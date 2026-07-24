# La Roue de la Fortune — mode multijoueur (téléphones)

Les 3 candidats peuvent **lancer la roue depuis leur téléphone**. Seul le
candidat **dont c'est le tour** peut faire tourner la roue.

Le jeu fonctionne **aussi sans serveur** : si vous ouvrez `index.html` par
double-clic, il marche en solo comme avant (sans les téléphones).

---

## 1. Essai en local (sur votre PC, même Wi-Fi)

1. Installer les dépendances (une seule fois) :
   ```
   npm install
   ```
2. Démarrer le serveur :
   ```
   npm start
   ```
3. Sur le PC relié au vidéoprojecteur, ouvrir : **http://localhost:3000/**
4. Cliquer sur **📱 Élèves** (en haut à droite) → un QR code + un code
   à 4 lettres s'affichent.
5. Les candidats, **sur le même Wi-Fi**, scannent le QR (ou tapent
   `http://IP-DU-PC:3000/play.html`), saisissent le code, choisissent leur
   numéro de candidat, et obtiennent un bouton **TOURNER LA ROUE**.

> Trouver l'IP du PC : ouvrir « Invite de commandes » et taper `ipconfig`
> (ligne « Adresse IPv4 », ex. 192.168.1.23).

---

## 2. Mise en ligne (accessible de partout, hors de la salle)

> ⚠️ **Netlify ne convient pas** pour cette partie : il n'héberge que des
> fichiers statiques et ne gère pas les WebSockets. Il faut un hébergeur
> Node.js. Deux options gratuites simples ci-dessous.

Le projet est déjà prêt : `process.env.PORT`, `npm start`, `render.yaml` et
`.gitignore` sont en place.

### Option A — Render.com (via GitHub)
1. Créer un compte sur https://render.com
2. Envoyer ce dossier `roue-de-la-fortune` dans un dépôt **GitHub**
   (voir « Préparer le dépôt Git » plus bas).
3. Sur Render : **New +** → **Blueprint** → choisir le dépôt.
   Render lit `render.yaml` et configure tout seul (Build `npm install`,
   Start `npm start`).
   *(Ou : New + → Web Service → mêmes commandes à la main.)*
4. Render donne une adresse type `https://roue-de-la-fortune.onrender.com`
   - Écran projeté : cette adresse
   - Téléphones : `.../play.html` (ou via le QR affiché à l'écran)

### Option B — Railway.app (SANS GitHub, en ligne de commande)
1. Créer un compte sur https://railway.app
2. Dans le dossier `roue-de-la-fortune`, exécuter :
   ```
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```
3. Générer un domaine public : `railway domain`
   → adresse type `https://roue-de-la-fortune.up.railway.app`

### Préparer le dépôt Git (pour Render)
Dans le dossier `roue-de-la-fortune` :
```
git init
git add .
git commit -m "Roue de la Fortune - jeu + serveur temps reel"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/roue-de-la-fortune.git
git push -u origin main
```
(Créez d'abord un dépôt vide sur github.com pour obtenir l'URL.)

> Sur les offres gratuites, le service « s'endort » après inactivité : la
> 1re connexion du jour peut prendre ~30 s à se réveiller.

---

## Fichiers
- `server.js` — serveur temps réel (Express + Socket.io)
- `index.html` — le jeu (écran projeté)
- `play.html` — la télécommande (téléphone des candidats)
- `avatars/` — vos avatars images (voir `avatars/LISEZMOI.txt`)
