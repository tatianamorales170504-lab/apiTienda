const db = require('../db'); // Tu archivo de conexión a la base de datos

exports.crearPedido = async (req, res) => {
    const { cli_id, usr_id, ped_estado, detalle } = req.body;
    
    // Obtenemos una conexión del pool
    const connection = await db.getConnection();

    try {
        // Iniciamos la transacción (por seguridad)
        await connection.beginTransaction();

        // 1. Insertar el pedido en la tabla 'pedidos'
        const [result] = await connection.query(
            'INSERT INTO pedidos (cli_id, ped_fecha, usr_id, ped_estado) VALUES (?, NOW(), ?, ?)',
            [cli_id, usr_id, ped_estado ? 1 : 0]
        );
        const ped_id = result.insertId; // ID que se acaba de generar

        // 2. Insertar cada detalle en 'pedidos_detalle'
        for (const item of detalle) {
            await connection.query(
                'INSERT INTO pedidos_detalle (ped_id, prod_id, det_cantidad, det_precio) VALUES (?, ?, ?, ?)',
                [ped_id, item.prod_id, item.det_cantidad, item.det_precio]
            );
        }

        // Si todo sale bien, guardamos los cambios
        await connection.commit();
        connection.release();
        
        res.status(201).json({ message: 'Pedido registrado con éxito', ped_id });
        
    } catch (error) {
        // Si algo falla, revertimos todo
        await connection.rollback();
        connection.release();
        res.status(500).json({ error: 'Error al registrar pedido: ' + error.message });
    }
};