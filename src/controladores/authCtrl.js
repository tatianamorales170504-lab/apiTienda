import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { conmysql } from '../db.js';
// ==============================
// REGISTRO
// ==============================
export const registrar = async (req, res) => {
    const { usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo } = req.body;
    try {
        const saltRounds = 10;
        const claveEncriptada = await bcrypt.hash(usr_clave, saltRounds);
        const query = `INSERT INTO usuarios (usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo, usr_activo) VALUES (?, ?, ?, ?, ?, 1)`;
        await conmysql.query(query, [usr_usuario, claveEncriptada, usr_nombre, usr_telefono, usr_correo]);
        return res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al registrar usuario' });
    }
};
// ==============================
// LOGIN
// ==============================
export const login = async (req, res) => {
    const { usr_usuario, usr_clave } = req.body;
    try {
        const [rows] = await conmysql.query('SELECT * FROM usuarios WHERE usr_usuario = ?', [usr_usuario]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
        const usuarioBD = rows[0];
        const coincide = await bcrypt.compare(usr_clave, usuarioBD.usr_clave);
        if (!coincide) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
        const token = jwt.sign(
            { id: usuarioBD.usr_id, usuario: usuarioBD.usr_usuario, nombre: usuarioBD.usr_nombre },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return res.json({
            token,
            usuario: {
                usr_id: usuarioBD.usr_id,
                usr_usuario: usuarioBD.usr_usuario,
                usr_nombre: usuarioBD.usr_nombre,
                usr_rol: usuarioBD.usr_rol
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno' });
    }
};
// ==============================
// GUARDAR TOKEN FIREBASE
// ==============================
export const guardarTokenPush = async (req, res) => {
    const { usr_push_token } = req.body;
    const usr_id = req.usuario.id;
    try {
        await conmysql.query(`UPDATE usuarios SET usr_push_token = ? WHERE usr_id = ?`, [usr_push_token, usr_id]);
        return res.json({ message: 'Token Firebase actualizado' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al guardar token' });
    }
};