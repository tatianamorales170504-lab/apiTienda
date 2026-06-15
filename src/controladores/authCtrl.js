import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { conmysql } from '../db.js'; 

// 1. REGISTRO (Para usar desde Postman y guardar la clave encriptada de verdad)
export const registrar = async (req, res) => {
    const { usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo } = req.body;

    try {
        // Encriptamos la clave usando bcrypt antes de guardarla
        const saltRounds = 10;
        const claveEncriptada = await bcrypt.hash(usr_clave, saltRounds);

        // Insertamos en la base de datos con la clave encriptada
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

// 2. LOGIN 
export const login = async (req, res) => {
    const { usuario, password } = req.body;

    try {
        // Buscamos al usuario usando tu conmysql
        const [rows] = await conmysql.query('SELECT * FROM usuarios WHERE usr_usuario = ?', [usuario]);

        // Si la base de datos no devuelve ninguna fila, el usuario no existe
        if (rows.length === 0) {
            return res.status(401).json({
                message: 'Credenciales incorrectas (Usuario no existe)'
            });
        }

        const usuarioBD = rows[0];

        // Comparamos la contraseña limpia con el hash encriptado de la BD
        const coinciden = await bcrypt.compare(password, usuarioBD.usr_clave);

        if (!coinciden) {
            return res.status(401).json({
                message: 'Credenciales incorrectas (Contraseña inválida)'
            });
        }

        // Si todo coincide, creamos el token
        const token = jwt.sign(
            {
                id: usuarioBD.usr_id,
                usuario: usuarioBD.usr_usuario,
                nombre: usuarioBD.usr_nombre
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        // Retornamos el token listo para appTienda
        return res.json({
            token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno en el servidor' });
    }
};