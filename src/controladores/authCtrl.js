import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { conmysql } from '../db.js'; 

// 1. REGISTRO
export const registrar = async (req, res) => {
    const { usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo } = req.body;

    try {
        const saltRounds = 10;
        const claveEncriptada = await bcrypt.hash(usr_clave, saltRounds);

        const query = `INSERT INTO usuarios (usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo, usr_activo) 
                       VALUES (?, ?, ?, ?, ?, 1)`;
        
        await conmysql.query(query, [usr_usuario, claveEncriptada, usr_nombre, usr_telefono, usr_correo]);

        return res.status(201).json({ 
            message: 'Usuario registrado con clave encriptada con éxito' 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al registrar el usuario' });
    }
};
// 2. LOGIN (CON LOGS DE DIAGNÓSTICO)
export const login = async (req, res) => {
    const { usr_usuario, usr_clave } = req.body;
    console.log("Intento de login para usuario:", usr_usuario); // Veremos qué llega aquí

    try {
        const [rows] = await conmysql.query('SELECT * FROM usuarios WHERE usr_usuario = ?', [usr_usuario]);
        console.log("Resultado de la base de datos:", rows); // Veremos si encontró algo

        if (rows.length === 0) {
            return res.status(401).json({
                message: 'Credenciales incorrectas (Usuario no existe)'
            });
        }

        const usuarioBD = rows[0];
        const coinciden = await bcrypt.compare(usr_clave, usuarioBD.usr_clave);

        if (!coinciden) {
            return res.status(401).json({
                message: 'Credenciales incorrectas (Contraseña inválida)'
            });
        }

        const token = jwt.sign(
            { id: usuarioBD.usr_id, usuario: usuarioBD.usr_usuario, nombre: usuarioBD.usr_nombre },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.json({ token });

    } catch (error) {
        console.error("Error crítico en login:", error); // Veremos si hay error de conexión
        return res.status(500).json({ message: 'Error interno en el servidor' });
    }
};