// db.js
const mysql = require('mysql2/promise');
// Configuración de la conexión a XAMPP
const pool = mysql.createPool({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '', // Por defecto en XAMPP está vacío
    database: 'spa_uñas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
module.exports = pool;
