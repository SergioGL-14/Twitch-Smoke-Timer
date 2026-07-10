const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
db.get("SELECT value FROM config WHERE key = 'admin_pass'", (err, row) => {
    if (row) {
        console.log("CONTRASEÑA EN BASE DE DATOS:", row.value);
    } else {
        console.log("NO HAY CONTRASEÑA EN BD. SE ESTÁ USANDO LA POR DEFECTO: 1234");
    }
    db.close();
});
