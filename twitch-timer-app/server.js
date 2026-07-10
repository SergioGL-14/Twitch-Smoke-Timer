const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { exec } = require('child_process');

const { iniciarTwitch } = require('./twitch.js');

const path = require('path');
const fs = require('fs');
app.use(express.static(path.join(process.cwd(), 'public')));

// Atrapamos la ruta de callback de Twitch por si el usuario la tiene configurada así
app.get('/auth/twitch/callback', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'panel.html'));
});

// --- SISTEMA DE CONFIGURACIÓN PERSISTENTE ---
const configPath = path.join(process.cwd(), 'config.json');
let reglas = {
    tiempoInicial: 600, // 10 minutos (en segundos)
    tiempoFollow: 30,
    tiempoSub: 300,
    tiempoBit: 1,
    tiempoRefresco: 300 // 5 minutos por defecto
};

// Intentar cargar la configuración si existe
if (fs.existsSync(configPath)) {
    try {
        const data = fs.readFileSync(configPath, 'utf8');
        reglas = { ...reglas, ...JSON.parse(data) };
    } catch (err) {
        console.error("Error al leer config.json, usando defaults:", err);
    }
} else {
    // Si no existe, creamos el archivo con los valores por defecto
    fs.writeFileSync(configPath, JSON.stringify(reglas, null, 4));
}

let tiempoRestante = reglas.tiempoInicial; 

let cooldownActivo = false;

function iniciarTimer() {
    setInterval(() => {
        if (tiempoRestante > 0) {
            tiempoRestante--;
            io.emit('actualizarTiempo', tiempoRestante);
            
            if (tiempoRestante === 0 && !cooldownActivo && reglas.tiempoRefresco > 0) {
                cooldownActivo = true;
                setTimeout(() => {
                    // Reiniciar si sigue en 0
                    if(tiempoRestante === 0) {
                        tiempoRestante = reglas.tiempoInicial;
                        io.emit('actualizarTiempo', tiempoRestante);
                        console.log("⏱️ Reloj auto-reiniciado tras cooldown.");
                    }
                    cooldownActivo = false;
                }, reglas.tiempoRefresco * 1000);
            }
        }
    }, 1000);
}

iniciarTimer();

// --- EL NUEVO GESTOR DE EVENTOS ---
function procesarEventoTwitch(tipo, cantidad, usuario) {
    let segundosASumar = 0;
    
    // Calculamos el tiempo en base a las reglas actuales
    if (tipo === 'follow') segundosASumar = reglas.tiempoFollow;
    if (tipo === 'sub') segundosASumar = reglas.tiempoSub;
    if (tipo === 'bit') segundosASumar = cantidad * reglas.tiempoBit;

    tiempoRestante += segundosASumar;
    
    io.emit('actualizarTiempo', tiempoRestante);
    io.emit('alertaSuma', { segundos: segundosASumar, usuario: usuario });
}

io.on('connection', (socket) => {
    // Mandamos el tiempo y las reglas al conectar
    socket.emit('actualizarTiempo', tiempoRestante);
    socket.emit('reglasActuales', reglas);
    
    // Controles Manuales
    socket.on('cambiarTiempo', (segundosParaSumar) => {
        tiempoRestante += segundosParaSumar;
        if (tiempoRestante < 0) tiempoRestante = 0;
        io.emit('actualizarTiempo', tiempoRestante);
        
        if(segundosParaSumar > 0) {
            io.emit('alertaSuma', { segundos: segundosParaSumar, usuario: 'Panel Manual' });
        }
    });

    // --- NUEVOS CONTROLES DEL PANEL ---
    socket.on('guardarConfig', (nuevasReglas) => {
        reglas = nuevasReglas;
        fs.writeFileSync(configPath, JSON.stringify(reglas, null, 4));
        console.log("⚙️ Nuevas reglas de tiempo guardadas y aplicadas:", reglas);
    });

    socket.on('resetearReloj', () => {
        tiempoRestante = reglas.tiempoInicial;
        io.emit('actualizarTiempo', tiempoRestante);
        console.log("⏱️ Reloj reiniciado al tiempo inicial.");
    });

    // Recibimos el token desde el panel para conectarnos
    socket.on('loginToken', (token) => {
        iniciarTwitch(procesarEventoTwitch, token);
    });
});

http.listen(3000, () => {
    console.log('¡Servidor funcionando! Abre http://localhost:3000');
    
    // Auto-abrir el navegador en Windows/Mac/Linux
    const startCommand = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    exec(`${startCommand} http://localhost:3000/panel.html`);
});