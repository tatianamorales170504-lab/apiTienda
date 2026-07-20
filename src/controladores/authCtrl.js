import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { conmysql } from '../db.js';

// ==============================
// REGISTRO CONDICIONAL (Admin vs Cliente)
// ==============================
export const registrar = async (req, res) => {
    const { email, password, rol, nombre, apellido, identificacion, telefono, direccion } = req.body;
    
    const rolAsignado = rol || 'cliente';
    const connection = await conmysql.getConnection();

    try {
        await connection.beginTransaction();

        const saltRounds = 10;
        const claveEncriptada = await bcrypt.hash(password, saltRounds);

        // 1. Siempre se crea primero el registro en la tabla 'usuarios'
        const queryUsuario = `INSERT INTO usuarios (email, password, rol, activo) VALUES (?, ?, ?, 1)`;
        const [resultadoUsuario] = await connection.query(queryUsuario, [email, claveEncriptada, rolAsignado]);
        const nuevoUsuarioId = resultadoUsuario.insertId;

        // 2. Si el rol es 'cliente', también guardamos su perfil en la tabla 'clientes'
        if (rolAsignado === 'cliente') {
            const queryCliente = `INSERT INTO clientes (usuario_id, nombre, apellido, identificacion, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)`;
            await connection.query(queryCliente, [
                nuevoUsuarioId, 
                nombre || '', 
                apellido || '', 
                identificacion || null, 
                telefono || null, 
                direccion || null
            ]);
        }
        // Si el rol es 'administrador', no hace nada en la tabla 'clientes', solo se queda en 'usuarios'

        await connection.commit();
        connection.release();

        return res.status(201).json({ message: `${rolAsignado.charAt(0).toUpperCase() + rolAsignado.slice(1)} registrado con éxito` });
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error(error);
        return res.status(500).json({ message: 'Error al registrar usuario' });
    }
};

// ==============================
// LOGIN
// ==============================
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await conmysql.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
        const usuarioBD = rows[0];
        const coincide = await bcrypt.compare(password, usuarioBD.password);
        if (!coincide) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
        const token = jwt.sign(
            { id: usuarioBD.id, email: usuarioBD.email, rol: usuarioBD.rol },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return res.json({
            token,
            usuario: {
                id: usuarioBD.id,
                email: usuarioBD.email,
                rol: usuarioBD.rol
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
    const { token_push } = req.body;
    const usr_id = req.usuario.id;
    try {
        await conmysql.query(`UPDATE usuarios SET token_push = ? WHERE id = ?`, [token_push, usr_id]);
        return res.json({ message: 'Token Firebase actualizado' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al guardar token' });
    }
};