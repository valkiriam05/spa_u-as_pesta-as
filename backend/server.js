const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/registro', async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            genero,
            tipo_documento,
            numero_documento,
            direccion,
            telefono,
            correo,
            contrasena
        } = req.body;

        const [existingUser] = await pool.query(
            'SELECT id FROM clientes WHERE correo_electronico = ? OR no_documento = ?',
            [correo, numero_documento]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El correo o número de documento ya están registrados.'
            });
        }

        const hashedPassword = await bcrypt.hash(contrasena, 10);

        const query = `
            INSERT INTO clientes
            (nombre, apellido, genero, t_documento, no_documento, direccion, telefono, correo_electronico, contraseña)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [
            nombre,
            apellido,
            genero,
            tipo_documento,
            numero_documento,
            direccion,
            telefono,
            correo,
            hashedPassword
        ]);

        res.status(201).json({
            success: true,
            message: '¡clientes registrado exitosamente!',
            userId: result.insertId
        });

    } catch (error) {
        console.error('ERROR EN EL REGISTRO:', error);

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al procesar el registro.'
        });
    }
});
// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        const [usuarios] = await pool.query(
            'SELECT * FROM clientes WHERE correo_electronico  = ?',
            [correo]
        );

        if (usuarios.length === 0) {
            return res.json({
                success: false,
                message: 'El correo no está registrado.'
            });
        }

        const usuario = usuarios[0];

        const contraseñaValida = await bcrypt.compare(
            contraseña,
            usuario.contraseña
        );

        if (!contraseñaValida) {
            return res.json({
                success: false,
                message: 'La contraseña es incorrecta.'
            });
        }

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso.',
            nombre: usuario.nombre,
            genero: usuario.genero
        });

    } catch (error) {
        console.error('ERROR EN EL LOGIN:', error);

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al iniciar sesión.'
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
