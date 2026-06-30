import { conmysql } from '../db.js';
export const getPedidos = async (req, res) => {
    try {
        // Consulta principal: une pedidos con clientes y usuarios
        const [pedidos] = await conmysql.query(`
            SELECT 
                p.ped_id,
                p.cli_id,
                c.cli_nombre,
                p.ped_fecha,
                p.usr_id,
                p.ped_estado
            FROM pedidos p
            LEFT JOIN clientes c ON p.cli_id = c.cli_id
            ORDER BY p.ped_fecha DESC
        `);

        // Obtener los detalles de todos los pedidos
        const [detalles] = await conmysql.query(`
            SELECT 
                d.det_id,
                d.ped_id,
                d.prod_id,
                pr.prod_nombre,
                  pr.prod_imagen,
                d.det_cantidad,
                d.det_precio
            FROM pedidos_detalle d
            LEFT JOIN productos pr ON d.prod_id = pr.prod_id
        `);

        // Unir los detalles a cada pedido
        const pedidosConDetalles = pedidos.map(pedido => {
            const detallesPedido = detalles.filter(d => d.ped_id === pedido.ped_id);
            return { ...pedido, detalles: detallesPedido };
        });

        res.json(pedidosConDetalles);
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        return res.status(500).json({ message: 'Error al obtener los pedidos.' });
    }
};

export const getPedidoxId = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que venga el ID
        if (!id) {
            return res.status(400).json({ message: 'El ID del pedido es obligatorio.' });
        }

        // Consulta principal: datos del pedido y cliente
        const [pedidos] = await conmysql.query(`
            SELECT 
                p.ped_id,
                p.cli_id,
                c.cli_nombre,
                p.ped_fecha,
                p.usr_id,
                p.ped_estado
            FROM pedidos p
            LEFT JOIN clientes c ON p.cli_id = c.cli_id
            WHERE p.ped_id = ?
        `, [id]);

        if (pedidos.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        const pedido = pedidos[0];

        // Obtener detalles del pedido
        const [detalles] = await conmysql.query(`
            SELECT 
                d.det_id,
                d.ped_id,
                d.prod_id,
                pr.prod_nombre,
                 pr.prod_imagen,
                d.det_cantidad,
                d.det_precio
            FROM pedidos_detalle d
            LEFT JOIN productos pr ON d.prod_id = pr.prod_id
            WHERE d.ped_id = ?
        `, [id]);

        pedido.detalles = detalles;

        res.json(pedido);

    } catch (error) {
        console.error('Error al obtener el pedido por ID:', error);
        return res.status(500).json({ message: 'Error al obtener el pedido.' });
    }
};