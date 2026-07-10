require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { iniciarTwitch } = require('./twitch');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- CARPETAS ESTÁTICAS Y MIDDLEWARES ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// --- VARIABLES DE ADMIN ---
const defaultAdminUser = process.env.ADMIN_USER || "admin";
const defaultAdminPass = process.env.ADMIN_PASSWORD || "1234";
const adminUrl = process.env.ADMIN_URL || "/adminconf";

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html'))); // Landing page
app.get('/panel', (req, res) => res.sendFile(path.join(__dirname, 'public', 'panel.html'))); // Panel de control
app.get('/auth/twitch/callback', (req, res) => res.sendFile(path.join(__dirname, 'public', 'panel.html'))); // Endpoint antiguo Twitch
app.get('/overlay.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'overlay.html'))); 

// --- PANEL DE ADMINISTRACIÓN ---
app.get(adminUrl, (req, res) => res.sendFile(path.join(__dirname, 'private', 'admin.html')));

function getAdminToken() {
    return new Promise((resolve) => {
        db.get("SELECT value FROM config WHERE key = 'admin_user'", (err, rowU) => {
            db.get("SELECT value FROM config WHERE key = 'admin_pass'", (err, rowP) => {
                const au = rowU ? rowU.value : defaultAdminUser;
                const ap = rowP ? rowP.value : defaultAdminPass;
                resolve(Buffer.from(`${au}:${ap}`).toString('base64'));
            });
        });
    });
}

app.post('/api/admin/login', async (req, res) => {
    const { user, pass } = req.body;
    const currentToken = Buffer.from(`${user}:${pass}`).toString('base64');
    const expectedToken = await getAdminToken();
    if (currentToken === expectedToken) res.json({ token: currentToken });
    else res.status(401).json({ error: "Credenciales inválidas" });
});

async function requireAdmin(req, res, next) {
    const expectedToken = await getAdminToken();
    if (req.headers.authorization === expectedToken) next();
    else res.status(401).json({ error: "No autorizado" });
}

app.get('/api/admin/stats', requireAdmin, (req, res) => {
    db.get("SELECT value FROM config WHERE key = 'require_approval'", (err, rowConfig) => {
        const requireApproval = rowConfig ? rowConfig.value === 'true' : true;
        db.all("SELECT userId, twitchName, estado, reglas FROM usuarios", [], (err, rows) => {
            if (err) return res.status(500).json({ error: "Error DB" });
            const usuarios = rows.map(r => ({
                userId: r.userId,
                twitchName: r.twitchName || r.userId,
                estado: r.estado || 'pendiente',
                reglas: JSON.parse(r.reglas || "{}"),
                tieneCustoms: fs.existsSync(path.join(uploadsDir, r.userId))
            }));
            res.json({ usuarios, conexionesActivas: io.engine.clientsCount, requireApproval });
        });
    });
});

app.post('/api/admin/config/approval', requireAdmin, (req, res) => {
    const { requireApproval } = req.body;
    db.run("INSERT OR REPLACE INTO config (key, value) VALUES ('require_approval', ?)", [requireApproval ? 'true' : 'false'], () => {
        res.json({ success: true });
    });
});

app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
    const userId = req.params.id;
    db.run("DELETE FROM usuarios WHERE userId = ?", [userId], (err) => {
        const userDir = path.join(uploadsDir, userId);
        if (fs.existsSync(userDir)) fs.rmSync(userDir, { recursive: true, force: true });
        io.in(`panel_${userId}`).disconnectSockets();
        io.in(`obs_${userId}`).disconnectSockets();
        activeTimers.delete(userId);
        res.json({ success: true });
    });
});

app.post('/api/admin/approve/:id', requireAdmin, (req, res) => {
    const userId = req.params.id;
    db.run("UPDATE usuarios SET estado = 'aprobado' WHERE userId = ?", [userId], (err) => {
        if (err) return res.status(500).json({ error: "Error DB" });
        io.to(`panel_${userId}`).emit('estadoUsuario', 'aprobado');
        inicializarTimerUsuario(userId).then(timer => {
            io.to(`panel_${userId}`).emit('reglasActuales', timer.reglas);
        });
        res.json({ success: true });
    });
});

app.post('/api/admin/config', requireAdmin, (req, res) => {
    const { user, pass } = req.body;
    db.run("INSERT OR REPLACE INTO config (key, value) VALUES ('admin_user', ?)", [user]);
    db.run("INSERT OR REPLACE INTO config (key, value) VALUES ('admin_pass', ?)", [pass], () => {
        getAdminToken().then(token => res.json({ success: true, token }));
    });
});

// --- BASE DE DATOS (SQLite) ---
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error("Error al abrir base de datos", err);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        userId TEXT PRIMARY KEY,
        reglas TEXT
    )`);
    db.run(`ALTER TABLE usuarios ADD COLUMN twitchName TEXT`, () => {});
    db.run(`ALTER TABLE usuarios ADD COLUMN estado TEXT DEFAULT 'pendiente'`, () => {});

    db.run(`CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
    )`);
});

const reglasDefecto = {
    tiempoInicial: 600,
    tiempoFollow: 30,
    tiempoSub: 300,
    tiempoBit: 1,
    tiempoRefresco: 300,
    gifsHabilitados: true,
    relojAnimado: true,
    sonidoHabilitado: true
};

// --- GESTIÓN DE ESTADO (Multi-Tenant) ---
const activeTimers = new Map();

function obtenerReglasDB(userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT reglas FROM usuarios WHERE userId = ?`, [userId], (err, row) => {
            if (err) return reject(err);
            if (row && row.reglas) {
                resolve({ ...reglasDefecto, ...JSON.parse(row.reglas) });
            } else {
                resolve({ ...reglasDefecto });
            }
        });
    });
}

function guardarReglasDB(userId, reglas) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE usuarios SET reglas = ? WHERE userId = ?`, [JSON.stringify(reglas), userId], function(err) {
            if (err) return reject(err);
            resolve();
        });
    });
}

async function inicializarTimerUsuario(userId) {
    if (!activeTimers.has(userId)) {
        const reglas = await obtenerReglasDB(userId);
        
        const timerObj = {
            userId: userId,
            reglas: reglas,
            tiempoRestante: reglas.tiempoInicial,
            cooldownActivo: false,
            intervalId: null
        };
        
        activeTimers.set(userId, timerObj);
        iniciarTimerPara(userId);
    }
    return activeTimers.get(userId);
}

function iniciarTimerPara(userId) {
    const timer = activeTimers.get(userId);
    if (timer.intervalId) clearInterval(timer.intervalId);

    timer.intervalId = setInterval(() => {
        if (timer.tiempoRestante > 0) {
            timer.tiempoRestante--;
            io.to(`obs_${userId}`).to(`panel_${userId}`).emit('actualizarTiempo', timer.tiempoRestante);
            
            if (timer.tiempoRestante === 0 && !timer.cooldownActivo && timer.reglas.tiempoRefresco > 0) {
                timer.cooldownActivo = true;
                setTimeout(() => {
                    const currentTimer = activeTimers.get(userId);
                    if (currentTimer && currentTimer.tiempoRestante === 0) {
                        currentTimer.tiempoRestante = currentTimer.reglas.tiempoInicial;
                        io.to(`obs_${userId}`).to(`panel_${userId}`).emit('actualizarTiempo', currentTimer.tiempoRestante);
                        console.log(`⏱️ Reloj auto-reiniciado para ${userId}`);
                    }
                    if (currentTimer) currentTimer.cooldownActivo = false;
                }, timer.reglas.tiempoRefresco * 1000);
            }
        }
    }, 1000);
}

function procesarEventoTwitch(userId, tipo, cantidad, nombreUsuario) {
    const timer = activeTimers.get(userId);
    if (!timer) return;

    let segundosASumar = 0;
    if (tipo === 'follow') segundosASumar = timer.reglas.tiempoFollow;
    if (tipo === 'sub') segundosASumar = timer.reglas.tiempoSub;
    if (tipo === 'bit') segundosASumar = cantidad * timer.reglas.tiempoBit;

    if (segundosASumar > 0) {
        timer.tiempoRestante += segundosASumar;
        io.to(`obs_${userId}`).emit('alertaSuma', { usuario: nombreUsuario, segundos: segundosASumar });
        io.to(`obs_${userId}`).to(`panel_${userId}`).emit('actualizarTiempo', timer.tiempoRestante);
        console.log(`[${userId}] ${nombreUsuario} sumó ${segundosASumar}s`);
    }
}

// --- SOCKET.IO ---
io.on('connection', (socket) => {
    let currentUser = null;

    socket.on('identificarOBS', async (userId) => {
        if (!userId) return;
        currentUser = userId;
        socket.join(`obs_${userId}`);
        
        // Enviar configuración de assets personalizados si existen
        const customAssets = {
            prohibido: fs.existsSync(path.join(uploadsDir, userId, 'prohibido.jpg')) ? `/uploads/${userId}/prohibido.jpg` : `prohibido.jpg`,
            permitido: fs.existsSync(path.join(uploadsDir, userId, 'permitido.jpg')) ? `/uploads/${userId}/permitido.jpg` : `permitido.jpg`,
            alertaSuma: fs.existsSync(path.join(uploadsDir, userId, 'alerta_suma.mp3')) ? `/uploads/${userId}/alerta_suma.mp3` : `alerta_suma.mp3`,
            alertaFin: fs.existsSync(path.join(uploadsDir, userId, 'alerta_fin.mp3')) ? `/uploads/${userId}/alerta_fin.mp3` : `alerta_fin.mp3`
        };
        socket.emit('configuracionAssets', customAssets);

        const timer = await inicializarTimerUsuario(userId);
        socket.emit('actualizarTiempo', timer.tiempoRestante);
        socket.emit('reglasActuales', timer.reglas);
        console.log(`💻 OBS conectado a la sala: ${userId}`);
    });

    socket.on('loginToken', async (token) => {
        try {
            const userInfo = await iniciarTwitch(procesarEventoTwitch, token);
            if (!userInfo) return;
            
            const userId = userInfo.id;
            const userName = userInfo.name;
            currentUser = userId;
            
            socket.join(`panel_${userId}`);
            console.log(`🧑 Panel conectado a la sala: ${userId} (${userName})`);
            
            db.get("SELECT value FROM config WHERE key = 'require_approval'", (err, configRow) => {
                const requireApproval = configRow ? configRow.value === 'true' : true;
                
                db.get(`SELECT estado FROM usuarios WHERE userId = ?`, [userId], async (err, row) => {
                    let estado = row ? row.estado : (requireApproval ? 'pendiente' : 'aprobado');
                    if (!row) {
                        db.run(`INSERT INTO usuarios (userId, twitchName, estado, reglas) VALUES (?, ?, ?, ?)`, [userId, userName, estado, JSON.stringify(reglasDefecto)]);
                    } else {
                        db.run(`UPDATE usuarios SET twitchName = ? WHERE userId = ?`, [userName, userId]);
                    }

                    socket.emit('infoUsuario', { userId, userName });
                    socket.emit('estadoUsuario', estado);

                    if (estado === 'aprobado') {
                        const timer = await inicializarTimerUsuario(userId);
                        socket.emit('reglasActuales', timer.reglas);
                    }
                });
            });
            
        } catch (error) {
            console.error("Error en loginToken:", error);
        }
    });

    socket.on('guardarConfig', async (nuevasReglas) => {
        if (!currentUser) return;
        const timer = activeTimers.get(currentUser);
        if (timer) {
            timer.reglas = nuevasReglas;
            await guardarReglasDB(currentUser, nuevasReglas);
            io.to(`obs_${currentUser}`).emit('reglasActuales', nuevasReglas);
            console.log(`💾 Reglas guardadas para ${currentUser}`);
        }
    });

    socket.on('cambiarTiempo', (segundos) => {
        if (!currentUser) return;
        const timer = activeTimers.get(currentUser);
        if (timer) {
            timer.tiempoRestante += segundos;
            if (timer.tiempoRestante < 0) timer.tiempoRestante = 0;
            io.to(`obs_${currentUser}`).to(`panel_${currentUser}`).emit('actualizarTiempo', timer.tiempoRestante);
        }
    });

    socket.on('reset', () => {
        if (!currentUser) return;
        const timer = activeTimers.get(currentUser);
        if (timer) {
            timer.tiempoRestante = timer.reglas.tiempoInicial;
            io.to(`obs_${currentUser}`).to(`panel_${currentUser}`).emit('actualizarTiempo', timer.tiempoRestante);
        }
    });

    socket.on('simularEvento', (data) => {
        if (!currentUser) return;
        const { tipo, cantidad } = data;
        procesarEventoTwitch(currentUser, tipo, cantidad, "Simulador");
    });

    socket.on('subirArchivo', (data) => {
        if (!currentUser) return;
        const { nombre, buffer } = data;
        const permitidos = ['prohibido.jpg', 'permitido.jpg', 'alerta_suma.mp3', 'alerta_fin.mp3'];
        if (!permitidos.includes(nombre)) return; // Por seguridad
        
        const userDir = path.join(uploadsDir, currentUser);
        if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
        
        fs.writeFileSync(path.join(userDir, nombre), buffer);
        console.log(`[${currentUser}] Archivo subido: ${nombre}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor Multi-Tenant ejecutándose en http://localhost:${PORT}`);
});