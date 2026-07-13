import { conmysql } from '../db.js';
import { messaging } from '../config/firebase.js';

export const guardarPedido = async (req, res) => {
    const conexion = await conmysql.getConnection();

    try {
        await conexion.beginTransaction();

        const {
            cli_id, cli_identificacion, cli_nombre, cli_telefono, 
            cli_correo, cli_direccion, cli_pais, cli_ciudad, 
            ped_fecha, usr_id, ped_estado, detalle
        } = req.body;

        if (!detalle || detalle.length === 0) {
            throw new Error("El pedido no tiene productos.");
        }

        let idCliente = Number(cli_id);

        if (idCliente === 0) {
            const [cliente] = await conexion.query(
                `INSERT INTO clientes (cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad) 
                 VALUES (?,?,?,?,?,?,?)`,
                [cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad]
            );
            idCliente = cliente.insertId;
        }

        const [pedido] = await conexion.query(
            `INSERT INTO pedidos (cli_id, ped_fecha, usr_id, ped_estado) VALUES (?,?,?,?)`,
            [idCliente, ped_fecha, usr_id, ped_estado]
        );

        const ped_id = pedido.insertId;

        for (const item of detalle) {
            await conexion.query(
                `INSERT INTO pedidos_detalle (prod_id, ped_id, det_cantidad, det_precio) VALUES (?,?,?,?)`,
                [item.prod_id, ped_id, item.det_cantidad, item.det_precio]
            );
        }

        await conexion.commit();

        // NOTIFICACIÓN Y LOGICA DE NOMBRE
        try {
            // Buscamos el nombre del usuario que registró el pedido usando JOIN
            const [usuario] = await conmysql.query(
                "SELECT usr_usuario FROM usuarios WHERE usr_id = ?",
                [usr_id]
            );

            const nombreRegistrador = usuario.length > 0 ? usuario[0].usr_usuario : "Un vendedor";

            const [admins] = await conmysql.query(`
                SELECT usr_usuario, usr_push_token 
                FROM usuarios 
                WHERE usr_rol = 'admin' AND usr_push_token IS NOT NULL AND usr_push_token <> ''
            `);

            for (const adminUser of admins) {
                const message = {
                    notification: {
                        title: "🛒 Nuevo Pedido Registrado",
                        body: `${nombreRegistrador} ha registrado un nuevo pedido.`
                    },
                    data: {
                        tipo: "pedido",
                        ped_id: ped_id.toString()
                    },
                    token: adminUser.usr_push_token
                };
                await messaging.send(message);
            }
        } catch (error) {
            console.error("Error al enviar notificación:", error);
        }

        res.status(201).json({ ok: true, mensaje: "Pedido registrado correctamente.", ped_id, cli_id: idCliente });

    } catch (error) {
        await conexion.rollback();
        res.status(500).json({ ok: false, mensaje: error.message });
    } finally {
        conexion.release();
    }
};

export const getPedidos = async (req, res) => {
    try {
        const [pedidos] = await conmysql.query(`
            SELECT p.ped_id, p.cli_id, c.cli_nombre, p.ped_fecha, p.usr_id, u.usr_usuario, p.ped_estado
            FROM pedidos p
            LEFT JOIN clientes c ON p.cli_id = c.cli_id
            LEFT JOIN usuarios u ON p.usr_id = u.usr_id
            ORDER BY p.ped_fecha DESC
        `);

        const [detalles] = await conmysql.query(`
            SELECT d.det_id, d.ped_id, d.prod_id, pr.prod_nombre, pr.prod_imagen, d.det_cantidad, d.det_precio
            FROM pedidos_detalle d
            LEFT JOIN productos pr ON d.prod_id = pr.prod_id
        `);

        const pedidosConDetalles = pedidos.map(pedido => ({
            ...pedido,
            detalles: detalles.filter(d => d.ped_id === pedido.ped_id)
        }));

        res.json(pedidosConDetalles);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los pedidos.' });
    }
};

export const getPedidoxId = async (req, res) => {
    try {
        const { id } = req.params;
        const [pedidos] = await conmysql.query(`
            SELECT p.ped_id, p.cli_id, c.cli_nombre, p.ped_fecha, p.usr_id, u.usr_usuario, p.ped_estado
            FROM pedidos p
            LEFT JOIN clientes c ON p.cli_id = c.cli_id
            LEFT JOIN usuarios u ON p.usr_id = u.usr_id
            WHERE p.ped_id = ?
        `, [id]);

        if (pedidos.length === 0) return res.status(404).json({ message: 'Pedido no encontrado.' });

        const pedido = pedidos[0];
        const [detalles] = await conmysql.query(`
            SELECT d.det_id, d.ped_id, d.prod_id, pr.prod_nombre, pr.prod_imagen, d.det_cantidad, d.det_precio
            FROM pedidos_detalle d
            LEFT JOIN productos pr ON d.prod_id = pr.prod_id
            WHERE d.ped_id = ?
        `, [id]);

        pedido.detalles = detalles;
        res.json(pedido);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el pedido.' });
    }
};