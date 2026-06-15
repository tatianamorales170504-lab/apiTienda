import { conmysql } from '../db.js';

// LISTAR PRODUCTOS
export const getProductos = async (req, res) => {
    try {
        const [result] = await conmysql.query('SELECT * FROM productos');
        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: "Error al consultar productos" });
    }
};

// INSERTAR PRODUCTO
export const postProducto = async (req, res) => {
    try {
        const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_imagen } = req.body;
        const [result] = await conmysql.query(
            'INSERT INTO productos (prod_codigo, prod_nombre, prod_stock, prod_precio, prod_imagen) VALUES (?, ?, ?, ?, ?)',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_imagen]
        );
        res.send({ prod_id: result.insertId });
    } catch (error) {
        return res.status(500).json({ message: "Error al insertar producto" });
    }
};

// MODIFICAR PRODUCTO
export const putProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_imagen } = req.body;
        const [result] = await conmysql.query(
            'UPDATE productos SET prod_codigo = ?, prod_nombre = ?, prod_stock = ?, prod_precio = ?, prod_imagen = ? WHERE prod_id = ?',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_imagen, id]
        );
        res.send({ message: "Producto actualizado" });
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar producto" });
    }
};

// ELIMINAR PRODUCTO
export const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await conmysql.query('DELETE FROM productos WHERE prod_id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Producto no encontrado" });
        res.json({ message: "Producto eliminado exitosamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al eliminar producto" });
    }
};