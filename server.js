/* =========================================================================
   LA ROUE DE LA FORTUNE — serveur temps réel (Node + Express + Socket.io)
   -------------------------------------------------------------------------
   - Sert le jeu (écran projeté)  ->  /            (index.html)
   - Sert la télécommande         ->  /play.html   (téléphone des candidats)
   - Relaie l'ordre « tourner la roue » UNIQUEMENT si c'est le tour du candidat
   ========================================================================= */

const express = require('express');
const http    = require('http');
const path    = require('path');
const { Server } = require('socket.io');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server);

// Fichiers statiques (index.html, play.html, avatars/, liste.js…)
app.use(express.static(__dirname));

/* ---- Salons en mémoire : code -> { host, players:{slot:socketId}, etat } ---- */
const rooms = {};

// Code de salon lisible (sans caractères ambigus 0/O/1/I)
function genCode(){
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) c += A[Math.floor(Math.random() * A.length)];
  return c;
}

io.on('connection', (socket) => {

  /* --- L'écran projeté crée un salon --- */
  socket.on('host:create', (cb) => {
    let code;
    do { code = genCode(); } while (rooms[code]);
    rooms[code] = { host: socket.id, players: {}, etat: null };
    socket.join(code);
    socket.data = { code, role: 'host' };
    if (typeof cb === 'function') cb({ code });
  });

  /* --- L'écran diffuse l'état du jeu (tour courant, roue jouable) --- */
  socket.on('host:etat', (etat) => {
    const room = rooms[socket.data && socket.data.code];
    if (!room) return;
    room.etat = etat;
    io.to(socket.data.code).emit('etat', etat);
  });

  /* --- Un candidat rejoint depuis son téléphone --- */
  socket.on('joueur:join', ({ code, slot, nom }, cb) => {
    code = (code || '').toUpperCase().trim();
    const room = rooms[code];
    if (!room) { if (cb) cb({ ok: false, err: "Code de salon introuvable." }); return; }

    // slot demandé, sinon 1er libre parmi 0,1,2,3
    if (slot === null || slot === undefined) {
      for (let s = 0; s < 4; s++) if (!room.players[s]) { slot = s; break; }
    }
    if (slot === null || slot === undefined) { if (cb) cb({ ok: false, err: "Les 4 candidats sont déjà pris." }); return; }
    if (room.players[slot] && room.players[slot] !== socket.id) {
      if (cb) cb({ ok: false, err: "Ce candidat est déjà pris." }); return;
    }

    room.players[slot] = socket.id;
    socket.join(code);
    socket.data = { code, role: 'joueur', slot };
    io.to(room.host).emit('joueur:connecte', { slot, nom });
    if (cb) cb({ ok: true, slot, etat: room.etat });
  });

  /* --- Le candidat appuie sur « Tourner » : on transmet à l'écran --- */
  socket.on('joueur:tourner', () => {
    const d = socket.data || {};
    const room = rooms[d.code];
    if (!room || d.role !== 'joueur') return;
    io.to(room.host).emit('tournerDistant', { slot: d.slot });
  });

  /* --- Le candidat change son pseudo : on transmet à l'écran --- */
  socket.on('joueur:nom', ({ nom }) => {
    const d = socket.data || {};
    const room = rooms[d.code];
    if (!room || d.role !== 'joueur') return;
    io.to(room.host).emit('joueur:nom', { slot: d.slot, nom: (nom || '').toString().slice(0, 16) });
  });

  /* --- Déconnexions --- */
  socket.on('disconnect', () => {
    const d = socket.data || {};
    const room = rooms[d.code];
    if (!room) return;
    if (d.role === 'host') {
      io.to(d.code).emit('hostParti');
      delete rooms[d.code];
    } else if (d.role === 'joueur') {
      if (room.players[d.slot] === socket.id) delete room.players[d.slot];
      io.to(room.host).emit('joueur:deconnecte', { slot: d.slot });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('La Roue de la Torture — serveur démarré sur le port ' + PORT);
  console.log('Écran projeté :  http://localhost:' + PORT + '/');
  console.log('Téléphones    :  http://<IP-du-PC>:' + PORT + '/play.html');
});
